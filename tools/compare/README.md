# Competitor comparison

Find which of your listings are already on other portals, so you only publish the unique ones.

```
pip install -r requirements.txt

# 1. Collect what competitors have up now (last 15 days)
python3 scrape.py --cities Lahore --out lahore.csv

# 2. Match your file against it
python3 compare.py --mine my-listings.csv --theirs lahore.csv --min-sites 3

# 3. Import everything except the rows found on 3+ sites
npx tsx scripts/import-listings.ts my-listings.csv --skip my-listings.skip-ids.csv
```

`competitors.csv` uses MedaGhar's Property field names (`listingType`, `propertyType`, `city`, `area`,
`price`, `bedrooms`, `marla`, `latitude`, `contactPhone`, `images`, …) plus `source`, `sourceUrl` and
`imageHashes`, so it can also be loaded into your own comparison app.

## Sites

| Site | How it is read | Phone | Photos | Notes |
|---|---|---|---|---|
| zameen | search pages, newest first | yes | cover | Refreshing an ad moves it to the top, so "last 15 days" means *active* in the last 15 days |
| lamudi | search pages, newest first | yes | cover | Same platform as Zameen and mostly the same ads; `compare.py` counts the two as one site |
| graana | walks listing ids down from the newest | yes | all | Its search paging is disallowed by robots.txt, so ids are used instead |
| nobroker | property sitemap (last-modified) | yes | all | Small inventory; no publish date on the page, so last-modified is used |
| propertyonline | property sitemap | when shown | all | No map pins |
| olx | search URLs you pass with `--olx-url` | no | cover | Behind Cloudflare. Blocked from this server; may work from your own connection. Untested, because it could not be reached from here |

## Rules the scraper follows

- Only what an anonymous visitor sees. No login, no captcha solving, no proxy rotation.
- Obeys robots.txt (with `*` wildcards). One request at a time per site, `--delay` seconds apart (default 3).
- Identifies itself as `MedaGharCompare/1.0`. If a site answers with a challenge page, that site stops and the others carry on.

## How long it takes

Roughly one search page (25 listings) every 3 s, plus 0.5 s per photo fingerprint.
Lahore houses on Zameen alone are about 1,100 pages (~1 h) plus ~28k photos (~4 h).
Run one city at a time. Use `--resume` to continue after an interruption, and `--photos 0` for a fast first pass
(phone and map-pin matching still work).

## What counts as "found on a site"

Same purpose and city, plus one of: the same photo; the same phone with matching size (or beds and price);
map pins within 75 m with matching size and beds. Size, beds and price agreeing with nothing else is
listed in `possible_sites` and not counted.
