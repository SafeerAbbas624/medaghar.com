#!/usr/bin/env python3
"""
Collect recent listings from Pakistani property portals into one CSV, for
comparison with your own data. Only what an anonymous visitor can see; no
login, no captcha solving. A site that challenges the scraper is skipped.

  python3 scrape.py --cities Lahore,Islamabad --out competitors.csv
  python3 scrape.py --cities Lahore --sites zameen,graana --days 15 --delay 3
  python3 scrape.py --cities Lahore --sites olx --olx-url "<OLX search URL from your browser, sorted by newest>"

Each site runs in its own thread, one request at a time, `--delay` seconds apart.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import threading
import time
from datetime import datetime, timedelta, timezone

from common import Blocked, CsvSink, Fetcher, USER_AGENT, hash_image_url
from sites import EMPG_CITY_IDS, SITES


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--cities", required=True, help="comma-separated, e.g. Lahore,Islamabad,Karachi")
    ap.add_argument("--sites", default="zameen,graana,lamudi,nobroker,propertyonline,olx")
    ap.add_argument("--days", type=int, default=15, help="only listings posted in the last N days (default 15)")
    ap.add_argument("--out", default="competitors.csv")
    ap.add_argument("--delay", type=float, default=3.0, help="seconds between requests to one site (default 3)")
    ap.add_argument("--max-pages", type=int, default=2000, help="per city and category, for paged sites")
    ap.add_argument("--photos", type=int, default=1, help="photos per listing to fingerprint (0 = none)")
    ap.add_argument("--photo-delay", type=float, default=0.5,
                    help="seconds between photo downloads; photos come from image servers, not the site (default 0.5)")
    ap.add_argument("--city-id", action="append", default=[], help="Zameen/Lamudi city id, e.g. Sialkot=480")
    ap.add_argument("--olx-url", action="append", default=[], help="OLX search URL sorted by newest (repeatable)")
    ap.add_argument("--limit", type=int, default=0, help="stop each site after N listings (for a test run)")
    ap.add_argument("--resume", action="store_true", help="append to --out, skipping listings already in it")
    ap.add_argument("--user-agent", default=USER_AGENT)
    ap.add_argument("--progress-file", help="JSON file updated with per-site counts (used by the admin page)")
    args = ap.parse_args()

    cities = [c.strip() for c in args.cities.split(",") if c.strip()]
    cutoff = datetime.now(timezone.utc) - timedelta(days=args.days)
    city_ids = dict(EMPG_CITY_IDS)
    for pair in args.city_id:
        name, _, cid = pair.partition("=")
        city_ids[name.strip().lower()] = int(cid)

    sink = CsvSink(args.out, args.resume)
    counts: dict[str, int] = dict(sink.initial_counts)  # totals in the file, across resumes
    state: dict[str, str] = {}  # site -> running | done | blocked | error
    print_lock = threading.Lock()
    last_write = [0.0]

    def progress(force=False):
        if not args.progress_file or (not force and time.time() - last_write[0] < 2):
            return
        last_write[0] = time.time()
        tmp = args.progress_file + ".tmp"
        with print_lock:
            with open(tmp, "w") as fp:
                json.dump({"counts": counts, "sites": state, "updatedAt": time.time()}, fp)
            os.replace(tmp, args.progress_file)

    def run(site: str):
        base, adapter = SITES[site]

        def log(msg: str):
            with print_lock:
                print(f"[{time.strftime('%H:%M:%S')}] {site}: {msg}", flush=True)

        state[site] = "running"
        progress(True)
        f = Fetcher(base, args.delay, log, args.user_agent)
        kwargs = dict(cutoff=cutoff, log=log, max_pages=args.max_pages)
        if site in ("zameen", "lamudi"):
            gen = adapter(f, cities, city_ids=city_ids, **kwargs)
        elif site == "olx":
            gen = adapter(f, args.olx_url, **kwargs)
        else:
            gen = adapter(f, cities, **kwargs)
        try:
            for listing in gen:
                if sink.has(listing.sourceUrl):
                    continue
                if args.photos:
                    for url in listing.images[: args.photos]:
                        time.sleep(args.photo_delay)
                        h = hash_image_url(f.session, url)
                        if h:
                            listing.imageHashes.append(h)
                sink.write(listing)
                counts[site] = counts.get(site, 0) + 1
                progress()
                if counts[site] % 100 == 0:
                    log(f"{counts[site]} listings saved")
                if args.limit and counts[site] - sink.initial_counts.get(site, 0) >= args.limit:
                    log(f"--limit {args.limit} reached")
                    break
            state[site] = "done"
        except Blocked as e:
            state[site] = "blocked"
            log(f"STOPPED: {e}. Run this site from another connection, or leave it out.")
        except Exception as e:  # one broken site must not stop the others
            state[site] = "error"
            log(f"STOPPED on error: {e!r}")
        progress(True)
        log(f"done: {counts.get(site, 0)} listings, {f.requests} requests")

    sites = [s.strip() for s in args.sites.split(",") if s.strip()]
    unknown = [s for s in sites if s not in SITES]
    if unknown:
        sys.exit(f"unknown site(s): {', '.join(unknown)}; choose from {', '.join(SITES)}")

    threads = [threading.Thread(target=run, args=(s,), daemon=True) for s in sites]
    for t in threads:
        t.start()
    try:
        for t in threads:
            t.join()
    except KeyboardInterrupt:
        print("\nInterrupted; rows so far are saved. Re-run with --resume to continue.")
    finally:
        sink.close()
        progress(True)
    print(f"\nSaved to {args.out}: {counts}")


if __name__ == "__main__":
    main()
