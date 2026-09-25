"""One adapter per portal. Each yields Listing objects posted after `cutoff`."""

from __future__ import annotations

import html
import re
from datetime import datetime, timezone
from typing import Iterator
from xml.etree import ElementTree

from common import (
    Blocked, Fetcher, Listing, iso, json_after, next_data, normalise_phone,
    property_type, sizes_from_sqft, MARLA_SQFT,
)

SQM_TO_SQFT = 10.7639

# Zameen / Lamudi location ids. Verified: the rest can be passed with
# --city-id Name=ID (open the city's page on zameen.com: /Homes/Sialkot-480-1.html).
EMPG_CITY_IDS = {
    "lahore": 1, "karachi": 2, "islamabad": 3, "multan": 15, "faisalabad": 16,
    "peshawar": 17, "jhelum": 19, "gujrat": 20, "hyderabad": 30, "rawalpindi": 41,
    "gujranwala": 327,
}


def _ts(dt: datetime) -> float:
    return dt.replace(tzinfo=timezone.utc).timestamp() if dt.tzinfo is None else dt.timestamp()


# ---------------------------------------------------------------------------
# Zameen and Lamudi (same platform, same listing format)
# ---------------------------------------------------------------------------

def empg_hit(hit: dict, source: str, base: str) -> Listing:
    loc = sorted(hit.get("location") or [], key=lambda l: l.get("level", 0))
    names = [l.get("name", "") for l in loc]
    cats = [c.get("name", "") for c in (hit.get("category") or [])]
    phones = (hit.get("phoneNumber") or {})
    nums = list(dict.fromkeys(
        normalise_phone(p) for p in (phones.get("mobileNumbers") or []) + (phones.get("phoneNumbers") or [])
        + [phones.get("mobile") or "", phones.get("phone") or ""]
    ))
    geo = hit.get("geography") or hit.get("_geoloc") or {}
    sqft = (hit.get("area") or 0) * SQM_TO_SQFT
    cover = hit.get("coverPhoto") or {}
    slug = hit.get("slug") or ""
    if source == "zameen":
        url = f"{base}/Property/{slug}.html"
    else:
        # lamudi.pk/property/<words>-<externalID>.html
        words = re.sub(r"-\d+-\d+-\d+$", "", slug).replace("_", "-")
        url = f"{base}/property/{words}-{hit.get('externalID')}.html"
    l = Listing(
        source=source,
        sourceId=str(hit.get("externalID") or hit.get("id")),
        sourceUrl=url,
        listedDate=iso(hit.get("createdAt")),
        listingType="FOR_RENT" if "rent" in (hit.get("purpose") or "") else "FOR_SALE",
        propertyType=property_type(cats[-1] if cats else ""),
        title=hit.get("title") or "",
        city=names[2] if len(names) > 2 else "",
        area=names[3] if len(names) > 3 else "",
        subArea=", ".join(names[4:]),
        address=", ".join(reversed(names[2:])),
        latitude=geo.get("lat"),
        longitude=geo.get("lng"),
        exactLocation=bool(hit.get("hasExactGeography")),
        price=hit.get("price"),
        bedrooms=hit.get("rooms"),
        bathrooms=hit.get("baths"),
        contactName=hit.get("contactName") or "",
        contactPhone="|".join(n for n in nums if n),
        agencyName=((hit.get("agency") or {}).get("name") or ""),
        images=[f"https://media.zameen.com/thumbnails/{cover['id']}-800x600.jpeg"] if cover.get("id") else [],
    )
    for k, v in sizes_from_sqft(sqft).items():
        setattr(l, k, v)
    return l


ZAMEEN_CATS = [
    ("Homes", "sale"), ("Plots", "sale"), ("Commercial", "sale"),
    ("Rentals", "rent"), ("Rentals_Plots", "rent"), ("Rentals_Commercial", "rent"),
]


def zameen(f: Fetcher, cities: list[str], cutoff: datetime, city_ids: dict, log, max_pages: int) -> Iterator[Listing]:
    for city in cities:
        cid = city_ids.get(city.lower())
        if not cid:
            log(f"zameen: no id for {city}; pass --city-id {city}=<id>")
            continue
        slug = city.strip().title().replace(" ", "_")
        for cat, _ in ZAMEEN_CATS:
            for page in range(1, max_pages + 1):
                url = f"{f.base}/{cat}/{slug}-{cid}-{page}.html?sort=date_desc"
                r = f.get(url)
                if r is None or r.status_code != 200:
                    break
                state = json_after(r.text, "window.state =")
                content = ((state or {}).get("algolia") or {}).get("content") or {}
                hits = content.get("hits") or []
                if not hits:
                    break
                fresh = 0
                for h in hits:
                    if (h.get("createdAt") or 0) >= _ts(cutoff):
                        fresh += 1
                        yield empg_hit(h, "zameen", f.base)
                log(f"zameen {city} {cat} p{page}: {fresh}/{len(hits)} fresh")
                # Sorted newest first, but promoted ads float to the top of
                # page 1, so only stop on a page with nothing fresh at all.
                if fresh == 0 or page >= (content.get("nbPages") or 0):
                    break


LAMUDI_CATS = [
    "houses-for-sale", "flats-apartments-for-sale", "residential-plots-for-sale", "commercial-plots-for-sale",
    "houses-to-rent", "flats-apartments-to-rent",
]


def lamudi(f: Fetcher, cities: list[str], cutoff: datetime, city_ids: dict, log, max_pages: int) -> Iterator[Listing]:
    for city in cities:
        cid = city_ids.get(city.lower())
        if not cid:
            log(f"lamudi: no id for {city}; pass --city-id {city}=<id>")
            continue
        cslug = city.strip().lower().replace(" ", "-")
        for cat in LAMUDI_CATS:
            for page in range(1, max_pages + 1):
                url = f"{f.base}/{cslug}/{cat}-{cid}/?sort=date_desc" + (f"&page={page}" if page > 1 else "")
                r = f.get(url)
                if r is None or r.status_code != 200:
                    break
                pp = ((next_data(r.text) or {}).get("props") or {}).get("pageProps") or {}
                hits = pp.get("hits") or []
                if not hits:
                    break
                fresh = 0
                for h in hits:
                    if (h.get("createdAt") or 0) >= _ts(cutoff):
                        fresh += 1
                        yield empg_hit(h, "lamudi", f.base)
                log(f"lamudi {city} {cat} p{page}: {fresh}/{len(hits)} fresh")
                if fresh == 0 or page >= (pp.get("nbPages") or 0):
                    break


# ---------------------------------------------------------------------------
# OLX: same platform again, but behind Cloudflare. Takes search URLs copied
# from the browser (sorted by newest) because its category ids are not public.
# ---------------------------------------------------------------------------

def olx(f: Fetcher, urls: list[str], cutoff: datetime, log, max_pages: int) -> Iterator[Listing]:
    if not urls:
        log("olx: no --olx-url given; skipped")
        return
    for base_url in urls:
        for page in range(1, max_pages + 1):
            sep = "&" if "?" in base_url else "?"
            url = base_url + (f"{sep}page={page}" if page > 1 else "")
            r = f.get(url)
            if r is None or r.status_code != 200:
                break
            state = json_after(r.text, "window.state =") or {}
            content = (state.get("algolia") or {}).get("content") or {}
            hits = content.get("hits") or []
            if not hits:
                log("olx: page had no listing data (layout may have changed)")
                break
            fresh = 0
            for h in hits:
                if (h.get("createdAt") or 0) >= _ts(cutoff):
                    fresh += 1
                    l = empg_hit(h, "olx", f.base)
                    l.sourceUrl = f"{f.base}/item/{h.get('slug')}-iid-{h.get('externalID')}"
                    yield l
            log(f"olx p{page}: {fresh}/{len(hits)} fresh")
            if fresh == 0:
                break


# ---------------------------------------------------------------------------
# Graana: walk listing ids downward from the newest. Its search pagination
# uses ?page=, which its robots.txt disallows; /property/<slug>-<id>/ is allowed
# and redirects to the canonical slug.
# ---------------------------------------------------------------------------

GRAANA_UNITS = {"marla": MARLA_SQFT, "kanal": MARLA_SQFT * 20, "sqft": 1, "sqyd": 9, "sqm": SQM_TO_SQFT}


def graana(f: Fetcher, cities: list[str], cutoff: datetime, log, **_) -> Iterator[Listing]:
    r = f.get(f.base + "/")
    ids = [int(x) for x in re.findall(r'/property/[^"]*?-(\d{5,})/', r.text if r else "")]
    if not ids:
        log("graana: could not find the newest listing id")
        return
    want = {c.lower() for c in cities}
    newest = max(ids)
    misses = old_run = 0
    lid = newest + 50  # ids a little above the homepage's newest usually exist too
    while lid > 0 and misses < 400 and old_run < 60:
        r = f.get(f"{f.base}/property/x-{lid}/")
        lid -= 1
        d = (((next_data(r.text) if r is not None and r.status_code == 200 else None) or {})
             .get("props", {}).get("pageProps", {}).get("data"))
        if not d:
            misses += 1
            continue
        misses = 0
        created = iso(d.get("createdAt"))
        if created and created < cutoff.isoformat():
            old_run += 1
            continue
        old_run = 0
        city = d.get("city.name") or ""
        if want and city.lower() not in want:
            continue
        unit = (d.get("sizeUnit") or "").lower().replace(" ", "")
        sqft = (float(d.get("size") or 0) * GRAANA_UNITS.get(unit, 0)) or None
        nearby = [k for k, v in (d.get("nearByFeatures") or {}).items() if v]
        l = Listing(
            source="graana",
            sourceId=str(d.get("id")),
            sourceUrl=r.url,
            listedDate=created,
            listingType="FOR_RENT" if d.get("purpose") == "rent" else "FOR_SALE",
            propertyType=_type_or_title(property_type(d.get("subtype") or "", d.get("type") or ""), d.get("customTitle")),
            title=d.get("customTitle") or "",
            city=city,
            area=d.get("area.name") or "",
            address=d.get("address") or "",
            latitude=d.get("lat"),
            longitude=d.get("lng"),
            exactLocation=bool(d.get("lat")),
            price=float(d["price"]) if d.get("price") else None,
            bedrooms=d.get("bed"),
            bathrooms=d.get("bath"),
            contactName=(d.get("name") or "").strip(),
            contactPhone=normalise_phone(f"{d.get('countryCode') or ''}{d.get('phone') or ''}"),
            nearbyPlaces="|".join(nearby),
            images=[
                (i["url"] if i["url"].startswith("http") else "https://images.graana.com" + i["url"])
                for i in (d.get("propertyImages") or []) if i.get("url") and i.get("type", "image") == "image"
            ][:7],
        )
        for k, v in sizes_from_sqft(sqft).items():
            setattr(l, k, v)
        yield l
    log(f"graana: stopped at id {lid} ({f.requests} requests)")


# ---------------------------------------------------------------------------
# WordPress portals: the property sitemap gives every URL with a last-modified
# date, so only recently changed listings are fetched.
# ---------------------------------------------------------------------------

def _sitemap_urls(f: Fetcher, index_url: str, name_hint: str, cutoff: datetime, log) -> list[tuple[str, str]]:
    r = f.get(index_url)
    if r is None or r.status_code != 200:
        return []
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    maps = [e.text for e in ElementTree.fromstring(r.content).findall(".//s:loc", ns) if name_hint in (e.text or "")]
    out = []
    for m in maps:
        rr = f.get(m)
        if rr is None or rr.status_code != 200:
            continue
        for u in ElementTree.fromstring(rr.content).findall(".//s:url", ns):
            loc = u.findtext("s:loc", default="", namespaces=ns)
            mod = u.findtext("s:lastmod", default="", namespaces=ns)
            if loc and mod and iso(mod) >= cutoff.isoformat():
                out.append((loc, iso(mod)))
    log(f"{f.base}: {len(out)} listings changed since {cutoff.date()}")
    return out


def _type_or_title(found: str, title: str | None) -> str:
    return property_type(title or "") if found == "OTHER" else found


def _purpose(text: str) -> str:
    return "FOR_RENT" if re.search(r"\b(for|to)[\s-]+rent\b|\brental\b", text, re.I) else "FOR_SALE"


def _num(text: str | None) -> float | None:
    if not text:
        return None
    t = text.lower().replace(",", "")
    m = re.search(r"[\d.]+", t)
    if not m:
        return None
    n = float(m.group())
    if "crore" in t:
        n *= 1e7
    elif "lakh" in t or "lac" in t:
        n *= 1e5
    return n


def nobroker(f: Fetcher, cities: list[str], cutoff: datetime, log, **_) -> Iterator[Listing]:
    import json
    want = {c.lower() for c in cities}
    for url, mod in _sitemap_urls(f, f.base + "/sitemap_index.xml", "property-sitemap", cutoff, log):
        if not re.search(r"/property/[^/]+/?$", url):
            continue
        r = f.get(url)
        if r is None or r.status_code != 200:
            continue
        ld = None
        for m in re.finditer(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', r.text, re.S):
            try:
                d = json.loads(m.group(1))
            except ValueError:
                continue
            if isinstance(d, dict) and ("offers" in d or "geo" in d):
                ld = d
                break
        if not ld:
            continue
        addr = ld.get("address") or {}
        city = addr.get("addressLocality") or ""
        if want and city.lower() not in want:
            continue
        geo = ld.get("geo") or {}
        offer = ld.get("offers") or {}
        seller = offer.get("seller") or {}
        fs = ld.get("floorSize") or {}
        unit = (fs.get("unitText") or "").upper()
        sqft = (fs.get("value") or 0) * {"SQYD": 9, "SQFT": 1, "FTK": 1, "MTK": SQM_TO_SQFT}.get(unit, 0) or None
        title = html.unescape(ld.get("name") or "")
        status = re.search(r'label-status[^>]*>\s*([^<]+)<', r.text)
        l = Listing(
            source="nobroker",
            sourceId=url.rstrip("/").rsplit("/", 1)[-1],
            sourceUrl=url,
            listedDate=mod,  # the page carries no publish date; sitemap lastmod is the closest
            listingType=_purpose(" ".join([title, url, status.group(1) if status else ""])),
            propertyType=_type_or_title(
                property_type(ld.get("@type", "") if ld.get("@type") not in ("Product", "Place") else ""), title
            ),
            title=title,
            city=city,
            address=addr.get("streetAddress") or "",
            latitude=geo.get("latitude"),
            longitude=geo.get("longitude"),
            exactLocation=bool(geo.get("latitude")),
            price=offer.get("price"),
            bedrooms=ld.get("numberOfBedrooms"),
            bathrooms=ld.get("numberOfBathroomsTotal"),
            contactName=seller.get("name") or "",
            contactPhone=normalise_phone(seller.get("telephone") or ""),
            images=[u for u in (ld.get("image") or []) if "i0.wp.com" not in u][:7],
        )
        for k, v in sizes_from_sqft(sqft).items():
            setattr(l, k, v)
        yield l


def propertyonline(f: Fetcher, cities: list[str], cutoff: datetime, log, **_) -> Iterator[Listing]:
    want = {c.lower() for c in cities}
    for url, mod in _sitemap_urls(f, f.base + "/sitemap_index.xml", "estate_property-sitemap", cutoff, log):
        if not re.search(r"/properties/[^/]+/?$", url):
            continue
        r = f.get(url)
        if r is None or r.status_code != 200:
            continue
        details = {}
        for m in re.finditer(r'<div class="listing_detail[^"]*"[^>]*>(.*?)</div>', r.text, re.S):
            text = html.unescape(re.sub(r"<[^>]+>", " ", m.group(1)))
            if ":" in text:
                k, v = text.split(":", 1)
                details.setdefault(k.strip().lower(), re.sub(r"\s+", " ", v).strip())
        city = details.get("city", "")
        if want and city.lower() not in want:
            continue
        published = re.search(r'"datePublished":"([^"]+)"', r.text)
        title = html.unescape((re.search(r"<title>([^<|]+)", r.text) or [None, ""])[1]).strip()
        action = re.search(r'class="action_tag_wrapper[^"]*">\s*([^<]+)<', r.text)
        phone = re.search(r'href="tel:([+\d\s-]{9,})"', r.text)
        marla = _num(details.get("area in marla"))
        sqft = _num(details.get("property size"))
        imgs = list(dict.fromkeys(re.findall(r'https://propertyonline\.pk/wp-content/uploads/[^"\s]+?\.(?:jpe?g|png|webp)', r.text)))
        imgs = [i for i in imgs if not re.search(r"-\d+x\d+\.", i)]  # drop WordPress thumbnails
        l = Listing(
            source="propertyonline",
            sourceId=details.get("property id") or url.rstrip("/").rsplit("/", 1)[-1],
            sourceUrl=url,
            listedDate=iso(published.group(1)) if published else mod,
            listingType=_purpose(" ".join([title, action.group(1) if action else ""])),
            propertyType=property_type(title),
            title=title,
            city=city,
            address=details.get("address", ""),
            price=_num(details.get("price")),
            bedrooms=int(_num(details.get("bedrooms")) or 0) or None,
            bathrooms=_num(details.get("bathrooms")),
            contactPhone=normalise_phone(phone.group(1)) if phone else "",
            images=imgs[:7],
        )
        if marla:
            l.marla, l.kanal = marla, (round(marla / 20, 3) if marla >= 20 else None)
            l.squareFeet = round(sqft) if sqft else round(marla * MARLA_SQFT)
        elif sqft and sqft >= 50:  # "1 ft2" and similar placeholders
            for k, v in sizes_from_sqft(sqft).items():
                setattr(l, k, v)
        if l.listedDate and l.listedDate < cutoff.isoformat():
            continue  # edited recently, but first posted before the window
        yield l


SITES = {
    "zameen": ("https://www.zameen.com", zameen),
    "lamudi": ("https://www.lamudi.pk", lamudi),
    "graana": ("https://www.graana.com", graana),
    "nobroker": ("https://nobroker.com.pk", nobroker),
    "propertyonline": ("https://propertyonline.pk", propertyonline),
    "olx": ("https://www.olx.com.pk", olx),
}

__all__ = ["SITES", "EMPG_CITY_IDS", "Blocked"]
