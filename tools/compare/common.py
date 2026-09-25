"""Shared helpers: polite HTTP, robots.txt, the output schema, image hashes."""

from __future__ import annotations

import csv
import io
import json
import random
import re
import threading
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from urllib.parse import urlsplit

import requests

try:
    from PIL import Image
except ImportError:  # image hashing is optional
    Image = None

USER_AGENT = "MedaGharCompare/1.0 (+https://medaghar.com)"

# Output columns. Names follow the MedaGhar Property model so the file lines up
# with your own export; the first block says where the row came from.
COLUMNS = [
    "source", "sourceId", "sourceUrl", "listedDate",
    "listingType", "propertyType", "title",
    "city", "area", "subArea", "address",
    "latitude", "longitude", "exactLocation",
    "price", "bedrooms", "bathrooms", "marla", "kanal", "squareFeet",
    "contactName", "contactPhone", "agencyName",
    "nearbyPlaces", "features",
    "images", "imageHashes",
]


@dataclass
class Listing:
    source: str
    sourceId: str
    sourceUrl: str
    listedDate: str = ""  # ISO 8601, UTC
    listingType: str = ""  # FOR_SALE | FOR_RENT
    propertyType: str = ""  # MedaGhar enum, e.g. HOUSE
    title: str = ""
    city: str = ""
    area: str = ""
    subArea: str = ""
    address: str = ""
    latitude: float | None = None
    longitude: float | None = None
    exactLocation: bool = False
    price: float | None = None
    bedrooms: int | None = None
    bathrooms: float | None = None
    marla: float | None = None
    kanal: float | None = None
    squareFeet: float | None = None
    contactName: str = ""
    contactPhone: str = ""  # +923001234567, several joined with |
    agencyName: str = ""
    nearbyPlaces: str = ""
    features: str = ""
    images: list[str] = field(default_factory=list)
    imageHashes: list[str] = field(default_factory=list)

    def row(self) -> dict:
        d = asdict(self)
        d["images"] = "|".join(self.images)
        d["imageHashes"] = "|".join(self.imageHashes)
        d["exactLocation"] = "yes" if self.exactLocation else "no"
        return {k: ("" if d[k] is None else d[k]) for k in COLUMNS}


# ---------------------------------------------------------------------------
# HTTP
# ---------------------------------------------------------------------------

class Blocked(Exception):
    """The site answered with a challenge or refused us; stop crawling it."""


class Fetcher:
    """One per site: sequential requests with a delay and robots.txt checks."""

    def __init__(self, base: str, delay: float, log, user_agent: str = USER_AGENT):
        self.base = base.rstrip("/")
        self.delay = delay
        self.log = log
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        })
        self._last = 0.0
        self._lock = threading.Lock()
        self.rules = self._load_robots()
        self.requests = 0

    def _load_robots(self) -> list[tuple[bool, str]]:
        try:
            r = self.session.get(self.base + "/robots.txt", timeout=20)
            text = r.text if r.ok else ""
        except requests.RequestException:
            text = ""
        return parse_robots(text)

    def allowed(self, url: str) -> bool:
        parts = urlsplit(url)
        path = parts.path + ("?" + parts.query if parts.query else "")
        return robots_allows(self.rules, path)

    def _wait(self):
        with self._lock:
            gap = self.delay * random.uniform(0.8, 1.3) - (time.time() - self._last)
            if gap > 0:
                time.sleep(gap)
            self._last = time.time()

    def get(self, url: str, allow_redirects=True) -> requests.Response | None:
        if not self.allowed(url):
            self.log(f"robots.txt disallows {url}; skipped")
            return None
        for attempt in range(3):
            self._wait()
            self.requests += 1
            try:
                r = self.session.get(url, timeout=30, allow_redirects=allow_redirects)
            except requests.RequestException as e:
                self.log(f"network error {url}: {e}")
                time.sleep(5 * (attempt + 1))
                continue
            if r.status_code in (403, 503) and is_challenge(r.text):
                raise Blocked(f"{self.base} answered with a bot challenge (HTTP {r.status_code})")
            if r.status_code == 429:
                wait = int(r.headers.get("Retry-After", "60") or 60)
                self.log(f"rate limited by {self.base}; waiting {wait}s")
                time.sleep(min(wait, 600))
                continue
            if r.status_code >= 500:
                time.sleep(5 * (attempt + 1))
                continue
            return r
        return None


def is_challenge(body: str) -> bool:
    b = body[:20000].lower()
    return any(s in b for s in ("attention required", "cf-chl", "captcha", "just a moment", "access denied"))


def parse_robots(text: str, agent: str = "*") -> list[tuple[bool, str]]:
    """Rules for `User-agent: *` as (allow, pattern). Wildcards `*` and `$` honoured."""
    rules: list[tuple[bool, str]] = []
    in_group = False
    group_has_rules = False
    for raw in text.splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line or ":" not in line:
            continue
        k, v = (s.strip() for s in line.split(":", 1))
        k = k.lower()
        if k == "user-agent":
            if group_has_rules:
                in_group = False
                group_has_rules = False
            if v == agent:
                in_group = True
        elif k in ("allow", "disallow"):
            group_has_rules = True
            if in_group and v:
                rules.append((k == "allow", v))
    return rules


def robots_allows(rules: list[tuple[bool, str]], path: str) -> bool:
    """Longest matching rule wins; Allow wins ties (Google's semantics)."""
    best: tuple[int, bool] | None = None
    for allow, pattern in rules:
        rx = "^" + re.escape(pattern).replace(r"\*", ".*")
        if rx.endswith(r"\$"):
            rx = rx[:-2] + "$"
        if re.match(rx, path):
            score = (len(pattern), allow)
            if best is None or score > best:
                best = score
    return True if best is None else best[1]


# ---------------------------------------------------------------------------
# Values
# ---------------------------------------------------------------------------

MARLA_SQFT = 225.0  # the portals' marla; some societies use 272.25


def normalise_phone(raw: str) -> str:
    d = re.sub(r"\D", "", raw or "")
    if d.startswith("0092"):
        d = d[4:]
    elif d.startswith("92"):
        d = d[2:]
    elif d.startswith("0"):
        d = d[1:]
    return "+92" + d if 9 <= len(d) <= 10 else ""


def iso(ts: float | int | str | None) -> str:
    if ts is None or ts == "":
        return ""
    if isinstance(ts, (int, float)):
        return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat(timespec="seconds")
    try:
        return datetime.fromisoformat(str(ts).replace("Z", "+00:00")).astimezone(timezone.utc).isoformat(timespec="seconds")
    except ValueError:
        return ""


def sizes_from_sqft(sqft: float | None) -> dict:
    if not sqft:
        return {}
    marla = round(sqft / MARLA_SQFT, 2)
    return {"squareFeet": round(sqft), "marla": marla, "kanal": round(marla / 20, 3) if marla >= 20 else None}


# MedaGhar PropertyType from the words portals use.
TYPE_WORDS = [
    ("upper portion", "UPPER_PORTION"), ("lower portion", "LOWER_PORTION"),
    ("farm house", "FARM_HOUSE"), ("farmhouse", "FARM_HOUSE"), ("penthouse", "PENTHOUSE"),
    ("commercial plot", "COMMERCIAL_PLOT"), ("residential plot", "RESIDENTIAL_PLOT"),
    ("agricultural", "AGRICULTURAL_LAND"), ("industrial", "INDUSTRIAL_LAND"),
    ("plot file", "PLOT_FILE"), ("plot form", "PLOT_FORM"), ("file", "PLOT_FILE"),
    ("flat", "FLAT"), ("apartment", "FLAT"), ("basement", "BASEMENT"),
    ("hostel", "HOSTEL"), ("guest house", "GUEST_HOUSE"), ("hotel", "HOTEL_SUITES"),
    ("office", "OFFICE"), ("shop", "SHOP"), ("warehouse", "WAREHOUSE"), ("factory", "FACTORY"),
    ("building", "BUILDING"), ("plot", "RESIDENTIAL_PLOT"), ("land", "RESIDENTIAL_PLOT"),
    ("house", "HOUSE"), ("home", "HOUSE"), ("villa", "HOUSE"), ("bungalow", "HOUSE"),
    ("room", "ROOM"),  # last: "house with 5 rooms" is a house
]


def property_type(*texts: str) -> str:
    t = " ".join(x for x in texts if x).lower().replace("_", " ").replace("-", " ")
    for word, enum in TYPE_WORDS:
        if re.search(r"\b" + word + r"s?\b", t):
            return enum
    return "OTHER"


# ---------------------------------------------------------------------------
# Image fingerprints
# ---------------------------------------------------------------------------

def dhash_bytes(data: bytes, size: int = 8) -> str:
    """64-bit difference hash: survives resizing, recompression and watermarks."""
    if Image is None:
        return ""
    try:
        img = Image.open(io.BytesIO(data)).convert("L").resize((size + 1, size), Image.LANCZOS)
    except Exception:
        return ""
    px = list(img.getdata())
    bits = 0
    for row in range(size):
        for col in range(size):
            left = px[row * (size + 1) + col]
            right = px[row * (size + 1) + col + 1]
            bits = (bits << 1) | (1 if left > right else 0)
    return f"{bits:016x}"


def hamming(a: str, b: str) -> int:
    return bin(int(a, 16) ^ int(b, 16)).count("1")


def hash_image_url(session: requests.Session, url: str) -> str:
    try:
        r = session.get(url, timeout=20)
        if r.ok and len(r.content) < 15_000_000:
            return dhash_bytes(r.content)
    except requests.RequestException:
        pass
    return ""


# ---------------------------------------------------------------------------
# CSV
# ---------------------------------------------------------------------------

class CsvSink:
    """Append rows as they arrive; skip URLs already written (for --resume)."""

    def __init__(self, path: str, resume: bool):
        self.path = path
        self.lock = threading.Lock()
        self.seen: set[str] = set()
        self.initial_counts: dict[str, int] = {}
        mode = "w"
        if resume:
            try:
                with open(path, newline="", encoding="utf-8") as f:
                    for r in csv.DictReader(f):
                        self.seen.add(r["sourceUrl"])
                        self.initial_counts[r["source"]] = self.initial_counts.get(r["source"], 0) + 1
                mode = "a"
            except FileNotFoundError:
                pass
        self.f = open(path, mode, newline="", encoding="utf-8")
        self.w = csv.DictWriter(self.f, fieldnames=COLUMNS)
        if mode == "w":
            self.w.writeheader()

    def has(self, url: str) -> bool:
        return url in self.seen

    def write(self, listing: Listing):
        with self.lock:
            if listing.sourceUrl in self.seen:
                return
            self.seen.add(listing.sourceUrl)
            self.w.writerow(listing.row())
            self.f.flush()

    def close(self):
        self.f.close()


def json_after(text: str, marker: str):
    """Decode the JSON value that starts right after `marker`."""
    i = text.find(marker)
    if i < 0:
        return None
    try:
        return json.JSONDecoder().raw_decode(text[i + len(marker):].lstrip())[0]
    except ValueError:
        return None


def next_data(text: str):
    m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', text, re.S)
    if not m:
        return None
    try:
        return json.loads(m.group(1))
    except ValueError:
        return None
