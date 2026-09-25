#!/usr/bin/env python3
"""
Match your listings against scraped competitor listings.

  python3 compare.py --mine my-listings.csv --theirs competitors.csv
  python3 compare.py --mine my.csv --theirs lahore.csv --theirs islamabad.csv --min-sites 3

Writes:
  <mine>.matched.csv   your file, unchanged, plus sites_found / matched_sites /
                       matched_urls / match_evidence / possible_sites
  <mine>.skip-ids.csv  ids of rows found on --min-sites or more sites; pass it
                       to the importer with --skip

A match is "strong" when any of these hold (same purpose, same city):
  * a photo is the same picture (fingerprint distance <= 7 of 64 bits)
  * the same phone number, and the size or the beds+price agree
  * pins within 75 m, and size and beds agree
Size, beds, price and area agreeing with nothing else is only "possible":
reported, but not counted in sites_found.

Zameen and Lamudi run on one platform and Lamudi shows Zameen's ads, so by
default they count as one site. --count-mirrors counts them separately.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import os
import re
import sys
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse, parse_qs, unquote

import requests

from common import MARLA_SQFT, dhash_bytes, hamming, normalise_phone, property_type

MIRRORS = {"lamudi": "zameen+lamudi", "zameen": "zameen+lamudi"}

# Your file's headings -> field. Same idea as the site importer's aliases.
ALIASES = {
    "id": ["id", "sourceid", "rowid", "ref", "refno", "reference", "externalid"],
    "listingType": ["listingtype", "purpose", "forsaleorrent", "saleorrent"],
    "propertyType": ["propertytype", "category", "propertycategory", "subtype"],
    "city": ["city"],
    "area": ["area", "society", "locality", "scheme", "town"],
    "subArea": ["subarea", "block", "phase", "sector", "phaseblock"],
    "address": ["address", "fulladdress", "location"],
    "latitude": ["latitude", "lat"],
    "longitude": ["longitude", "lng", "lon", "long"],
    "maps": ["googlemapsurl", "googlemapslink", "googlemaps", "gmaps", "mapsurl", "mapslink", "maplink",
             "locationurl", "locationlink", "coordinates", "coords", "latlng"],
    "price": ["price", "demand", "rent", "amount", "pricepkr"],
    "bedrooms": ["bedrooms", "beds", "bed"],
    "bathrooms": ["bathrooms", "baths", "bath"],
    "marla": ["marla"],
    "kanal": ["kanal"],
    "squareFeet": ["squarefeet", "sqft", "coveredarea"],
    "size": ["size", "plotsize"],
    "phone": ["contactphone", "phone", "mobile", "whatsapp", "contact", "phonenumber", "contactnumber",
              "ownerphone", "agentphone", "dealerphone"],
    "images": ["images", "photos", "imageurls", "photourls", "pictures"],
}
_LOOKUP = {k: f for f, ks in ALIASES.items() for k in ks}


def key(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", s.lower())


def num(v) -> float | None:
    if v is None or v == "":
        return None
    t = str(v).lower().replace(",", "")
    m = re.search(r"-?[\d.]+", t)
    if not m:
        return None
    try:
        n = float(m.group())
    except ValueError:
        return None
    if "crore" in t or re.search(r"\bcr\b", t):
        n *= 1e7
    elif "lakh" in t or "lac" in t:
        n *= 1e5
    return n


def coords_from_link(text: str) -> tuple[float, float] | None:
    if not text:
        return None
    m = re.search(r"!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)", text)
    if m:
        return float(m[1]), float(m[2])
    try:
        q = parse_qs(urlparse(text).query)
        for k in ("q", "query", "ll", "center", "destination"):
            for v in q.get(k, []):
                m = re.match(r"\s*(-?\d+\.\d+)\s*,\s*\+?(-?\d+\.\d+)", unquote(v))
                if m:
                    return float(m[1]), float(m[2])
    except ValueError:
        pass
    m = re.search(r"/@(-?\d+\.\d+),(-?\d+\.\d+)", text) or re.match(r"\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$", text)
    return (float(m[1]), float(m[2])) if m else None


def purpose(v: str) -> str:
    return "FOR_RENT" if re.search(r"rent|let|lease", v or "", re.I) else "FOR_SALE"


def size_sqft(r: dict) -> list[float]:
    """Every plausible reading of the size: marla is 225 or 272.25 sq ft depending on who says it."""
    out = []
    marla = num(r.get("marla"))
    kanal = num(r.get("kanal"))
    if not marla and kanal:
        marla = kanal * 20
    if marla:
        out += [marla * MARLA_SQFT, marla * 272.25]
    sq = num(r.get("squareFeet"))
    if sq:
        out.append(sq)
    if not out and r.get("size"):
        t = r["size"].lower()
        n = num(t)
        if n:
            if "kanal" in t:
                out += [n * 20 * MARLA_SQFT, n * 20 * 272.25]
            elif "marla" in t:
                out += [n * MARLA_SQFT, n * 272.25]
            elif "yd" in t or "yard" in t or "gaz" in t:
                out.append(n * 9)
            else:
                out.append(n)
    return out


def close(a: float | None, b: float | None, tol: float) -> bool:
    return a is not None and b is not None and a > 0 and b > 0 and abs(a - b) / max(a, b) <= tol


def sizes_agree(a: list[float], b: list[float]) -> bool:
    return any(close(x, y, 0.08) for x in a for y in b)


def metres(a, b) -> float:
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 12742000 * math.asin(math.sqrt(h))


def useful_hash(h: str) -> bool:
    # Near-blank images (logos, "no photo" placeholders) hash to almost all 0s or 1s.
    ones = bin(int(h, 16)).count("1")
    return 8 <= ones <= 56


def tokens(*texts: str) -> set[str]:
    stop = {"lahore", "karachi", "islamabad", "rawalpindi", "pakistan", "block", "phase", "sector", "road",
            "society", "housing", "scheme", "town", "the", "of", "in", "near", "street", "st", "no"}
    return {t for t in re.findall(r"[a-z0-9]+", " ".join(texts).lower()) if t not in stop and len(t) > 1}


# ---------------------------------------------------------------------------

class Rec:
    __slots__ = ("site", "url", "sid", "purpose", "city", "ptype", "beds", "price", "sizes",
                 "geo", "phones", "hashes", "words")

    def __init__(self, **kw):
        for k in self.__slots__:
            setattr(self, k, kw.get(k))


def load_theirs(paths: list[str], count_mirrors: bool) -> dict:
    groups: dict[tuple, list[Rec]] = defaultdict(list)
    n = 0
    for p in paths:
        with open(p, newline="", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                site = r["source"] if count_mirrors else MIRRORS.get(r["source"], r["source"])
                lat, lng = num(r.get("latitude")), num(r.get("longitude"))
                rec = Rec(
                    site=site, url=r["sourceUrl"], sid=r["sourceId"], purpose=r["listingType"] or "FOR_SALE",
                    city=(r.get("city") or "").strip().lower(), ptype=r.get("propertyType") or "",
                    beds=num(r.get("bedrooms")), price=num(r.get("price")), sizes=size_sqft(r),
                    geo=(lat, lng) if lat and lng and r.get("exactLocation") == "yes" else None,
                    phones={p for p in (r.get("contactPhone") or "").split("|") if p},
                    hashes=[h for h in (r.get("imageHashes") or "").split("|") if h and useful_hash(h)],
                    words=tokens(r.get("area", ""), r.get("subArea", ""), r.get("address", "")),
                )
                groups[(rec.purpose, rec.city)].append(rec)
                n += 1
    print(f"competitor listings: {n}")
    return groups


class Index:
    """Per (purpose, city): lookups by phone, photo-hash byte, map cell and type+beds."""

    def __init__(self, recs: list[Rec]):
        self.by_phone = defaultdict(list)
        self.by_hash = defaultdict(list)
        self.by_cell = defaultdict(list)
        self.by_kind = defaultdict(list)
        for r in recs:
            for p in r.phones:
                self.by_phone[p].append(r)
            for h in r.hashes:
                # 8 one-byte chunks: two hashes within 7 bits share at least one chunk.
                for i in range(8):
                    self.by_hash[(i, h[i * 2:i * 2 + 2])].append((h, r))
            if r.geo:
                self.by_cell[(round(r.geo[0], 3), round(r.geo[1], 3))].append(r)
            self.by_kind[(r.ptype, int(r.beds or 0))].append(r)


def match_row(me: Rec, idx: Index) -> tuple[dict, dict]:
    strong: dict[str, tuple[str, str]] = {}  # site -> (url, evidence)
    weak: dict[str, str] = {}

    def attrs(c: Rec) -> tuple[bool, bool, bool]:
        return (
            sizes_agree(me.sizes, c.sizes),
            int(me.beds or 0) == int(c.beds or 0),
            close(me.price, c.price, 0.15),
        )

    def add(c: Rec, why: str):
        if c.site not in strong:
            strong[c.site] = (c.url, why)

    for h in me.hashes:
        for i in range(8):
            for ch, c in idx.by_hash.get((i, h[i * 2:i * 2 + 2]), []):
                if hamming(h, ch) <= 7:
                    add(c, "same photo")
    for p in me.phones:
        for c in idx.by_phone.get(p, []):
            size_ok, beds_ok, price_ok = attrs(c)
            if size_ok or (beds_ok and price_ok):
                add(c, "same phone + size" if size_ok else "same phone + beds/price")
    if me.geo:
        la, lo = round(me.geo[0], 3), round(me.geo[1], 3)
        for dla in (-0.001, 0, 0.001):
            for dlo in (-0.001, 0, 0.001):
                for c in idx.by_cell.get((round(la + dla, 3), round(lo + dlo, 3)), []):
                    if metres(me.geo, c.geo) <= 75:
                        size_ok, beds_ok, _ = attrs(c)
                        if size_ok and beds_ok:
                            add(c, "same spot + size/beds")
    for c in idx.by_kind.get((me.ptype, int(me.beds or 0)), []):
        if c.site in strong or c.site in weak:
            continue
        size_ok, _, _ = attrs(c)
        if size_ok and close(me.price, c.price, 0.05) and (me.words & c.words):
            weak[c.site] = c.url
    return strong, weak


# ---------------------------------------------------------------------------

def my_images(row: dict) -> list[str]:
    urls = []
    if row.get("images"):
        t = row["images"].strip()
        if t.startswith("["):
            try:
                urls = [x if isinstance(x, str) else x.get("url", "") for x in json.loads(t)]
            except ValueError:
                pass
        if not urls:
            urls = re.split(r"[|\n;]+" if re.search(r"[|\n;]", t) else r",\s*", t)
    numbered = sorted((int(m[1]), v) for k, v in row.items()
                      if v and (m := re.match(r"(?:image|photo|picture)(\d+)$", key(k))))
    urls += [v for _, v in numbered]
    return [u.strip() for u in urls if u and u.strip()]


def hash_source(src: str, images_dir: str | None, session: requests.Session) -> str:
    try:
        if re.match(r"https?://", src, re.I):
            r = session.get(src, timeout=20)
            return dhash_bytes(r.content) if r.ok else ""
        if images_dir:
            root = os.path.realpath(images_dir)
            path = os.path.realpath(os.path.join(root, src))
            if path.startswith(root + os.sep):
                with open(path, "rb") as f:
                    return dhash_bytes(f.read())
    except (requests.RequestException, OSError):
        pass
    return ""


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--mine", required=True)
    ap.add_argument("--theirs", action="append", required=True, help="scrape.py output (repeatable)")
    ap.add_argument("--min-sites", type=int, default=3, help="skip rows found on at least this many sites")
    ap.add_argument("--photos", type=int, default=2, help="your photos per row to fingerprint (0 = none)")
    ap.add_argument("--images-dir", help="folder for photo paths in your file that are not URLs")
    ap.add_argument("--workers", type=int, default=16, help="parallel downloads of your photos")
    ap.add_argument("--count-mirrors", action="store_true", help="count Lamudi separately from Zameen")
    args = ap.parse_args()

    groups = load_theirs(args.theirs, args.count_mirrors)
    indexes = {k: Index(v) for k, v in groups.items()}

    with open(args.mine, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames or []
        rows = list(reader)
    field_of = {}
    for h in headers:
        fld = _LOOKUP.get(key(h))
        if fld and fld not in field_of.values():
            field_of[h] = fld
    print(f"your rows: {len(rows)}; columns used: {', '.join(f'{h}->{f}' for h, f in field_of.items())}")

    def get(row, fld):
        for h, f2 in field_of.items():
            if f2 == fld and row.get(h):
                return row[h]
        return ""

    # Photo fingerprints for your rows, cached next to your file.
    cache_path = args.mine + ".photo-hashes.json"
    try:
        with open(cache_path) as f:
            cache = json.load(f)
    except (OSError, ValueError):
        cache = {}
    todo = sorted({u for r in rows for u in my_images(r)[: args.photos]} - cache.keys()) if args.photos else []
    if todo:
        print(f"fingerprinting {len(todo)} of your photos…")
        session = requests.Session()
        with ThreadPoolExecutor(args.workers) as pool:
            for i, (u, h) in enumerate(zip(todo, pool.map(lambda u: hash_source(u, args.images_dir, session), todo)), 1):
                cache[u] = h
                if i % 2000 == 0:
                    print(f"  {i}/{len(todo)}")
                    with open(cache_path, "w") as f:
                        json.dump(cache, f)
        with open(cache_path, "w") as f:
            json.dump(cache, f)

    out_path = re.sub(r"\.csv$", "", args.mine) + ".matched.csv"
    skip_path = re.sub(r"\.csv$", "", args.mine) + ".skip-ids.csv"
    extra = ["sites_found", "matched_sites", "matched_urls", "match_evidence", "possible_sites"]
    dist = defaultdict(int)
    skip_ids = []
    with open(out_path, "w", newline="", encoding="utf-8") as fo:
        w = csv.DictWriter(fo, fieldnames=headers + [e for e in extra if e not in headers])
        w.writeheader()
        for n, row in enumerate(rows, 1):
            lat, lng = num(get(row, "latitude")), num(get(row, "longitude"))
            geo = (lat, lng) if lat and lng else coords_from_link(get(row, "maps"))
            me = Rec(
                purpose=purpose(get(row, "listingType")),
                city=get(row, "city").strip().lower(),
                ptype=property_type(get(row, "propertyType")),
                beds=num(get(row, "bedrooms")),
                price=num(get(row, "price")),
                sizes=size_sqft({"marla": get(row, "marla"), "kanal": get(row, "kanal"),
                                 "squareFeet": get(row, "squareFeet"), "size": get(row, "size")}),
                geo=geo,
                phones={p for p in (normalise_phone(x) for x in re.split(r"[|/,;]", get(row, "phone"))) if p},
                hashes=[h for u in my_images(row)[: args.photos] if (h := cache.get(u)) and useful_hash(h)],
                words=tokens(get(row, "area"), get(row, "subArea"), get(row, "address")),
            )
            idx = indexes.get((me.purpose, me.city))
            strong, weak = match_row(me, idx) if idx else ({}, {})
            row["sites_found"] = len(strong)
            row["matched_sites"] = "|".join(sorted(strong))
            row["matched_urls"] = "|".join(v[0] for _, v in sorted(strong.items()))
            row["match_evidence"] = "|".join(f"{s}: {v[1]}" for s, v in sorted(strong.items()))
            row["possible_sites"] = "|".join(f"{s} {u}" for s, u in sorted(weak.items()))
            w.writerow(row)
            dist[len(strong)] += 1
            if len(strong) >= args.min_sites:
                skip_ids.append(get(row, "id") or f"row{n + 1}")
            if n % 10000 == 0:
                print(f"  compared {n}/{len(rows)}")

    with open(skip_path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["id"])
        w.writerows([[i] for i in skip_ids])

    print("\nRows by number of sites they were found on:")
    for k in sorted(dist):
        print(f"  {k} site(s): {dist[k]}")
    print(f"\n{len(skip_ids)} rows found on {args.min_sites}+ sites -> {skip_path}")
    print(f"Full result -> {out_path}")
    if not any(f == "id" for f in field_of.values()):
        print("Note: your file has no id column, so the skip list uses row numbers; the importer needs ids.",
              file=sys.stderr)


if __name__ == "__main__":
    main()
