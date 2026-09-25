#!/usr/bin/env python3
"""
Run scrape.py or compare.py as a background job for the admin page.

  run_job.py <job-dir> <script.py> [args...]

Writes <job-dir>/status.json when the job ends (finished / failed / stopped)
and passes SIGTERM on as SIGINT, so the scraper saves what it has and exits.
"""

import json
import os
import signal
import subprocess
import sys
import time

job_dir, script, *args = sys.argv[1:]
here = os.path.dirname(os.path.abspath(__file__))
stopped = False

with open(os.path.join(job_dir, "log.txt"), "a", buffering=1) as log:
    child = subprocess.Popen(
        [sys.executable, "-u", os.path.join(here, script), *args],
        cwd=here, stdout=log, stderr=subprocess.STDOUT,
    )

    def stop(*_):
        global stopped
        stopped = True
        child.send_signal(signal.SIGINT)

    signal.signal(signal.SIGTERM, stop)
    code = child.wait()
    # A second wait in case the signal arrived while waiting.
    while child.poll() is None:
        time.sleep(0.5)

status = "stopped" if stopped else ("finished" if code == 0 else "failed")
with open(os.path.join(job_dir, "status.json"), "w") as f:
    json.dump({"status": status, "exitCode": code, "endedAt": time.time()}, f)
