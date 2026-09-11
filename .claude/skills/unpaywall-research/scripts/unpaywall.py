#!/usr/bin/env python3
"""
unpaywall.py — a zero-dependency client for the Unpaywall REST API
(https://api.unpaywall.org/v2/) with an OpenAlex fallback.

Subcommands
  lookup   DOI [DOI ...]        OA status for one or more DOIs
  search   "title words"        Unpaywall title search
  batch    dois.txt             many DOIs -> CSV / JSONL + tally
  pdf      DOI [DOI ...]        download the best OA PDF(s)
  openalex DOI [DOI ...]        same question answered by OpenAlex (needs OPENALEX_API_KEY)

Environment
  UNPAYWALL_EMAIL    required for Unpaywall calls (or pass --email)
  OPENALEX_API_KEY   required for OpenAlex calls (or pass --api-key)

Only the Python standard library is used, so this runs anywhere Python 3.9+
runs. Requests are paced (default 10/s) and retried with exponential backoff
on 429/5xx. 404 and 422 are never retried.
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from typing import Any, Callable, Dict, Iterable, List, Optional

UNPAYWALL_BASE = "https://api.unpaywall.org/v2/"
OPENALEX_BASE = "https://api.openalex.org/"
USER_AGENT = "unpaywall-research-skill/1.0 (+https://Votus.One)"
PLACEHOLDER_EMAIL = re.compile(
    r"(example\.com$|^your_?email$|^your@email\.org$|^email@.*email\.com$|^your\.email@)", re.I
)
DOI_RE = re.compile(r"10\.\d{4,9}/\S+", re.I)

# --------------------------------------------------------------------------- #
# transport                                                                    #
# --------------------------------------------------------------------------- #

Fetcher = Callable[[str, float], "Response"]


class Response:
    def __init__(self, status: int, body: bytes, headers: Optional[Dict[str, str]] = None):
        self.status = status
        self.body = body
        self.headers = headers or {}

    def json(self) -> Any:
        return json.loads(self.body.decode("utf-8"))


def _urllib_fetch(url: str, timeout: float) -> Response:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json, */*"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return Response(r.status, r.read(), dict(r.headers))
    except urllib.error.HTTPError as e:
        return Response(e.code, e.read() or b"", dict(e.headers or {}))


class Client:
    """Paced, retrying HTTP GET with an in-memory cache."""

    def __init__(self, rate: float = 10.0, timeout: float = 30.0, retries: int = 5,
                 fetch: Fetcher = _urllib_fetch, sleep: Callable[[float], None] = time.sleep,
                 verbose: bool = False):
        self.min_interval = 1.0 / rate if rate and rate > 0 else 0.0
        self.timeout = timeout
        self.retries = retries
        self.fetch = fetch
        self.sleep = sleep
        self.verbose = verbose
        self._last = 0.0
        self.cache: Dict[str, Response] = {}
        self.calls = 0

    def _pace(self) -> None:
        if not self.min_interval:
            return
        wait = self._last + self.min_interval - time.monotonic()
        if wait > 0:
            self.sleep(wait)
        self._last = time.monotonic()

    def get(self, url: str) -> Response:
        if url in self.cache:
            return self.cache[url]
        delay = 1.0
        for attempt in range(1, self.retries + 1):
            self._pace()
            self.calls += 1
            if self.verbose:
                print(f"GET {redact(url)}", file=sys.stderr)
            resp = self.fetch(url, self.timeout)
            if resp.status == 429 or resp.status >= 500:
                if attempt == self.retries:
                    break
                if self.verbose:
                    print(f"  {resp.status}; retrying in {delay:.0f}s", file=sys.stderr)
                self.sleep(delay)
                delay *= 2
                continue
            break
        self.cache[url] = resp
        return resp


def redact(url: str) -> str:
    return re.sub(r"(api_key=)[^&]+", r"\1***", url)


# --------------------------------------------------------------------------- #
# helpers                                                                      #
# --------------------------------------------------------------------------- #

def normalize_doi(raw: str) -> Optional[str]:
    """'https://doi.org/10.1000/ABC' -> '10.1000/abc'; None if no DOI present."""
    if not raw:
        return None
    s = urllib.parse.unquote(raw.strip())
    s = re.sub(r"^(doi:|https?://(dx\.)?doi\.org/)", "", s, flags=re.I)
    m = DOI_RE.search(s)
    if not m:
        return None
    doi = m.group(0).rstrip(".,;)")
    return doi.lower()


def resolve_email(explicit: Optional[str]) -> str:
    email = explicit or os.environ.get("UNPAYWALL_EMAIL", "")
    if not email or "@" not in email or PLACEHOLDER_EMAIL.search(email):
        raise SystemExit(
            "Unpaywall needs a real contact email. Set UNPAYWALL_EMAIL or pass --email you@yourdomain.org"
        )
    return email


def resolve_api_key(explicit: Optional[str]) -> str:
    key = explicit or os.environ.get("OPENALEX_API_KEY", "")
    if not key:
        raise SystemExit(
            "OpenAlex requires an API key on every call (since 2026-02-13). "
            "Get a free one at https://openalex.org/settings/api and set OPENALEX_API_KEY."
        )
    return key


def unpaywall_url(doi: str, email: str) -> str:
    return f"{UNPAYWALL_BASE}{urllib.parse.quote(doi, safe='/')}?{urllib.parse.urlencode({'email': email})}"


def search_url(query: str, email: str, is_oa: Optional[str], page: int) -> str:
    params = {"query": query, "email": email, "page": page}
    if is_oa in ("true", "false"):
        params["is_oa"] = is_oa
    return f"{UNPAYWALL_BASE}search?{urllib.parse.urlencode(params)}"


def openalex_work_url(doi: str, api_key: str, select: Optional[str]) -> str:
    params = {"api_key": api_key}
    if select:
        params["select"] = select
    return f"{OPENALEX_BASE}works/https://doi.org/{urllib.parse.quote(doi, safe='/')}?{urllib.parse.urlencode(params)}"


def openalex_batch_url(dois: List[str], api_key: str, select: Optional[str]) -> str:
    joined = "|".join(f"https://doi.org/{d}" for d in dois)
    params = {"filter": f"doi:{joined}", "per-page": len(dois), "api_key": api_key}
    if select:
        params["select"] = select
    return f"{OPENALEX_BASE}works?{urllib.parse.urlencode(params, safe='|:/')}"


OPENALEX_SELECT = "id,doi,title,publication_year,type,is_paratext,open_access,best_oa_location,locations,primary_location"


def summarize(record: Optional[Dict[str, Any]], doi: Optional[str] = None,
              error: Optional[str] = None) -> Dict[str, Any]:
    """Flatten an Unpaywall record to the columns the Simple Query Tool emits (+ a few)."""
    if not record:
        return {"doi": doi, "error": error or "not found", "is_oa": None, "oa_status": None,
                "best_oa_url": None, "best_oa_url_is_pdf": None, "best_oa_version": None,
                "best_oa_license": None, "best_oa_host": None, "best_oa_evidence": None,
                "title": None, "year": None, "genre": None, "is_paratext": None,
                "journal_name": None, "journal_is_in_doaj": None, "publisher": None,
                "has_repository_copy": None, "n_oa_locations": 0, "n_embargoed": 0,
                "data_standard": None}
    best = record.get("best_oa_location") or {}
    return {
        "doi": record.get("doi") or doi,
        "error": None,
        "is_oa": record.get("is_oa"),
        "oa_status": record.get("oa_status"),
        "best_oa_url": best.get("url"),
        "best_oa_url_is_pdf": bool(best.get("url_for_pdf")) if best else None,
        "best_oa_version": best.get("version"),
        "best_oa_license": best.get("license"),
        "best_oa_host": best.get("host_type"),
        "best_oa_evidence": best.get("evidence"),
        "title": record.get("title"),
        "year": record.get("year"),
        "genre": record.get("genre"),
        "is_paratext": record.get("is_paratext"),
        "journal_name": record.get("journal_name"),
        "journal_is_in_doaj": record.get("journal_is_in_doaj"),
        "publisher": record.get("publisher"),
        "has_repository_copy": record.get("has_repository_copy"),
        "n_oa_locations": len(record.get("oa_locations") or []),
        "n_embargoed": len(record.get("oa_locations_embargoed") or []),
        "data_standard": record.get("data_standard"),
    }


def openalex_to_unpaywall(work: Dict[str, Any]) -> Dict[str, Any]:
    """Reshape an OpenAlex work into the legacy Unpaywall record shape (subset)."""
    def loc(l: Optional[Dict[str, Any]], is_best: bool = False) -> Optional[Dict[str, Any]]:
        if not l:
            return None
        src = l.get("source") or {}
        return {
            "url": l.get("pdf_url") or l.get("landing_page_url"),
            "url_for_pdf": l.get("pdf_url"),
            "url_for_landing_page": l.get("landing_page_url"),
            "host_type": "repository" if src.get("type") == "repository" else "publisher",
            "version": l.get("version"),
            "license": l.get("license"),
            "evidence": "openalex",
            "is_best": is_best,
            "repository_institution": src.get("host_organization_name"),
            "source_name": src.get("display_name"),
        }

    oa = work.get("open_access") or {}
    best = work.get("best_oa_location")
    prim = (work.get("primary_location") or {}).get("source") or {}
    locations = [loc(l) for l in (work.get("locations") or []) if l and l.get("is_oa")]
    if best:
        best_url = best.get("pdf_url") or best.get("landing_page_url")
        for l in locations:
            if l and l.get("url") == best_url:
                l["is_best"] = True
    return {
        "doi": normalize_doi(work.get("doi") or ""),
        "doi_url": work.get("doi"),
        "title": work.get("title") or work.get("display_name"),
        "genre": work.get("type"),
        "is_paratext": work.get("is_paratext"),
        "year": work.get("publication_year"),
        "journal_name": prim.get("display_name"),
        "journal_is_in_doaj": prim.get("is_in_doaj"),
        "journal_is_oa": prim.get("is_oa"),
        "publisher": prim.get("host_organization_name"),
        "is_oa": oa.get("is_oa"),
        "oa_status": oa.get("oa_status"),
        "has_repository_copy": oa.get("any_repository_has_fulltext"),
        "best_oa_location": loc(best, True),
        "oa_locations": locations,
        "oa_locations_embargoed": [],
        "data_standard": None,
        "source": "openalex",
        "openalex_id": work.get("id"),
    }


def read_identifiers(path: str) -> List[str]:
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    ids: List[str] = []
    seen = set()
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        d = normalize_doi(line)
        if d and d not in seen:
            seen.add(d)
            ids.append(d)
    return ids


def chunked(items: List[str], n: int) -> Iterable[List[str]]:
    for i in range(0, len(items), n):
        yield items[i:i + n]


# --------------------------------------------------------------------------- #
# core operations                                                              #
# --------------------------------------------------------------------------- #

def lookup_one(client: Client, doi: str, email: str) -> Dict[str, Any]:
    resp = client.get(unpaywall_url(doi, email))
    if resp.status == 200:
        return {"doi": doi, "status": 200, "record": resp.json()}
    msg = None
    try:
        msg = resp.json().get("message")
    except Exception:
        msg = resp.body[:200].decode("utf-8", "replace") if resp.body else None
    return {"doi": doi, "status": resp.status, "record": None, "error": msg or f"HTTP {resp.status}"}


def openalex_lookup(client: Client, dois: List[str], api_key: str) -> Dict[str, Dict[str, Any]]:
    out: Dict[str, Dict[str, Any]] = {}
    if len(dois) == 1:
        resp = client.get(openalex_work_url(dois[0], api_key, OPENALEX_SELECT))
        if resp.status == 200:
            out[dois[0]] = openalex_to_unpaywall(resp.json())
        return out
    for chunk in chunked(dois, 50):
        resp = client.get(openalex_batch_url(chunk, api_key, OPENALEX_SELECT))
        if resp.status != 200:
            continue
        for w in resp.json().get("results", []):
            rec = openalex_to_unpaywall(w)
            if rec.get("doi"):
                out[rec["doi"]] = rec
    return out


def tally(summaries: List[Dict[str, Any]]) -> Dict[str, Any]:
    articles = [s for s in summaries if not s.get("error") and not s.get("is_paratext")]
    counts = Counter((s.get("oa_status") or "unknown") for s in articles)
    n = len(articles)
    n_oa = sum(1 for s in articles if s.get("is_oa"))
    n_pdf = sum(1 for s in articles if s.get("best_oa_url_is_pdf"))
    n_err = sum(1 for s in summaries if s.get("error"))
    return {
        "requested": len(summaries),
        "found": n + sum(1 for s in summaries if not s.get("error") and s.get("is_paratext")),
        "not_found_or_error": n_err,
        "paratext_excluded": sum(1 for s in summaries if not s.get("error") and s.get("is_paratext")),
        "articles": n,
        "oa": n_oa,
        "pct_oa": round(100.0 * n_oa / n, 1) if n else None,
        "with_direct_pdf": n_pdf,
        "by_status": dict(sorted(counts.items(), key=lambda kv: -kv[1])),
    }


# --------------------------------------------------------------------------- #
# output                                                                       #
# --------------------------------------------------------------------------- #

def _short(s: Any, n: int) -> str:
    s = "" if s is None else str(s)
    return s if len(s) <= n else s[: n - 1] + "…"


def print_table(summaries: List[Dict[str, Any]], out=sys.stdout) -> None:
    cols = [("doi", 34), ("oa_status", 7), ("best_oa_version", 16), ("best_oa_license", 12),
            ("best_oa_host", 10), ("best_oa_url", 60)]
    head = "  ".join(f"{name:<{w}}" for name, w in cols)
    print(head, file=out)
    print("-" * len(head), file=out)
    for s in summaries:
        if s.get("error"):
            print(f"{_short(s.get('doi'), 34):<34}  {'—':<7}  {_short(s['error'], 60)}", file=out)
            continue
        row = []
        for name, w in cols:
            v = s.get(name)
            if name == "best_oa_version" and v == "submittedVersion":
                v = "submitted(PREPRINT)"
            row.append(f"{_short(v, w):<{w}}")
        print("  ".join(row), file=out)


def print_tally(t: Dict[str, Any], out=sys.stdout) -> None:
    print("", file=out)
    print(f"requested {t['requested']}  found {t['found']}  not found/error {t['not_found_or_error']}"
          f"  paratext excluded {t['paratext_excluded']}", file=out)
    if t["articles"]:
        print(f"articles {t['articles']}  OA {t['oa']} ({t['pct_oa']}%)  with direct PDF {t['with_direct_pdf']}", file=out)
        print("by status: " + ", ".join(f"{k} {v}" for k, v in t["by_status"].items()), file=out)


def write_csv(path: str, summaries: List[Dict[str, Any]]) -> None:
    if not summaries:
        return
    fields = list(summaries[0].keys())
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for s in summaries:
            w.writerow(s)


def write_jsonl(path: str, records: List[Dict[str, Any]]) -> None:
    with open(path, "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, sort_keys=True) + "\n")


# --------------------------------------------------------------------------- #
# commands                                                                     #
# --------------------------------------------------------------------------- #

def _client(args: argparse.Namespace) -> Client:
    return Client(rate=args.rate, timeout=args.timeout, verbose=args.verbose)


def cmd_lookup(args: argparse.Namespace) -> int:
    email = resolve_email(args.email)
    dois = [d for d in (normalize_doi(x) for x in args.doi) if d]
    bad = [x for x in args.doi if not normalize_doi(x)]
    for b in bad:
        print(f"skipping '{b}': not a DOI", file=sys.stderr)
    if args.dry_run:
        for d in dois:
            print(unpaywall_url(d, email))
        return 0
    client = _client(args)
    results = [lookup_one(client, d, email) for d in dois]
    if args.fallback:
        missing = [r["doi"] for r in results if r["status"] == 404]
        if missing:
            key = resolve_api_key(args.api_key)
            found = openalex_lookup(client, missing, key)
            for r in results:
                if r["doi"] in found:
                    r.update(status=200, record=found[r["doi"]], error=None, via="openalex")
    if args.json:
        payload = [r["record"] if r["record"] else {"doi": r["doi"], "error": r.get("error")} for r in results]
        print(json.dumps(payload if len(payload) > 1 else payload[0], indent=2))
    else:
        print_table([summarize(r["record"], r["doi"], r.get("error")) for r in results])
    return 0 if all(r["status"] == 200 for r in results) else 1


def cmd_search(args: argparse.Namespace) -> int:
    email = resolve_email(args.email)
    url = search_url(args.query, email, args.oa, args.page)
    if args.dry_run:
        print(url)
        return 0
    client = _client(args)
    resp = client.get(url)
    if resp.status != 200:
        print(f"HTTP {resp.status}: {resp.body[:300].decode('utf-8', 'replace')}", file=sys.stderr)
        return 1
    data = resp.json()
    results = data.get("results", [])[: args.limit]
    if args.json:
        print(json.dumps(results, indent=2))
        return 0
    for i, hit in enumerate(results, 1):
        r = hit.get("response") or {}
        best = r.get("best_oa_location") or {}
        authors = ", ".join((r.get("author_lastnames") or [])[:3])
        print(f"{i:>2}. [{hit.get('score', 0):.3f}] {r.get('title')}")
        print(f"    {authors}{' et al.' if len(r.get('author_lastnames') or []) > 3 else ''} · "
              f"{r.get('journal_name')} · {r.get('year')} · doi:{r.get('doi')}")
        print(f"    oa_status={r.get('oa_status')}  version={best.get('version')}  url={best.get('url')}")
    if not results:
        print("no results")
    return 0


def cmd_batch(args: argparse.Namespace) -> int:
    email = resolve_email(args.email)
    dois = read_identifiers(args.file)
    if not dois:
        print("no DOIs found in file", file=sys.stderr)
        return 1
    if args.dry_run:
        print(f"{len(dois)} DOIs; first URL: {unpaywall_url(dois[0], email)}")
        return 0
    client = _client(args)
    records: List[Dict[str, Any]] = []
    summaries: List[Dict[str, Any]] = []
    for i, d in enumerate(dois, 1):
        r = lookup_one(client, d, email)
        if args.verbose or (i % 50 == 0):
            print(f"[{i}/{len(dois)}] {d} -> {r['status']}", file=sys.stderr)
        records.append(r["record"] or {"doi": d, "error": r.get("error"), "status": r["status"]})
        summaries.append(summarize(r["record"], d, r.get("error")))
    if args.fallback:
        missing = [s["doi"] for s in summaries if s.get("error")]
        if missing:
            key = resolve_api_key(args.api_key)
            found = openalex_lookup(client, missing, key)
            for idx, s in enumerate(summaries):
                if s["doi"] in found:
                    records[idx] = found[s["doi"]]
                    summaries[idx] = summarize(found[s["doi"]], s["doi"])
                    summaries[idx]["via"] = "openalex"
    if args.out:
        write_csv(args.out, summaries)
        print(f"wrote {args.out}", file=sys.stderr)
    if args.jsonl:
        write_jsonl(args.jsonl, records)
        print(f"wrote {args.jsonl}", file=sys.stderr)
    if not args.out and not args.jsonl:
        print_table(summaries)
    print_tally(tally(summaries))
    return 0


def cmd_pdf(args: argparse.Namespace) -> int:
    email = resolve_email(args.email)
    client = _client(args)
    os.makedirs(args.out, exist_ok=True)
    rc = 0
    for raw in args.doi:
        doi = normalize_doi(raw)
        if not doi:
            print(f"skipping '{raw}': not a DOI", file=sys.stderr)
            rc = 1
            continue
        r = lookup_one(client, doi, email)
        rec = r["record"]
        if not rec or not rec.get("is_oa"):
            print(f"{doi}: no OA copy ({r.get('error') or 'closed'})", file=sys.stderr)
            rc = 1
            continue
        candidates = [l for l in rec.get("oa_locations") or [] if l.get("url_for_pdf")]
        if args.prefer_published:
            order = {"publishedVersion": 0, "acceptedVersion": 1, "submittedVersion": 2, None: 3}
            candidates.sort(key=lambda l: order.get(l.get("version"), 3))
        if not candidates:
            best = rec.get("best_oa_location") or {}
            print(f"{doi}: OA but no direct PDF; open the landing page: {best.get('url_for_landing_page')}", file=sys.stderr)
            rc = 1
            continue
        fname = os.path.join(args.out, re.sub(r"[^A-Za-z0-9._-]+", "_", doi) + ".pdf")
        if args.dry_run:
            print(f"{doi} -> {candidates[0]['url_for_pdf']} ({candidates[0].get('version')})")
            continue
        got = False
        for loc in candidates:
            url = loc["url_for_pdf"]
            try:
                resp = client.fetch(url, args.timeout)
            except Exception as e:  # network-level failure
                print(f"  {url}: {e}", file=sys.stderr)
                continue
            body = resp.body or b""
            if resp.status == 200 and body[:5] == b"%PDF-":
                with open(fname, "wb") as f:
                    f.write(body)
                print(f"{doi}: saved {fname} ({len(body)//1024} KB, {loc.get('version')}, {loc.get('license')}, from {url})")
                got = True
                break
            print(f"  {url}: HTTP {resp.status}, not a PDF; trying next location", file=sys.stderr)
        if not got:
            best = rec.get("best_oa_location") or {}
            print(f"{doi}: could not download a PDF; landing page: {best.get('url_for_landing_page')}", file=sys.stderr)
            rc = 1
    return rc


def cmd_openalex(args: argparse.Namespace) -> int:
    key = resolve_api_key(args.api_key)
    dois = [d for d in (normalize_doi(x) for x in args.doi) if d]
    if args.dry_run:
        print(redact(openalex_work_url(dois[0], key, OPENALEX_SELECT)) if len(dois) == 1
              else redact(openalex_batch_url(dois[:50], key, OPENALEX_SELECT)))
        return 0
    client = _client(args)
    found = openalex_lookup(client, dois, key)
    if args.json:
        print(json.dumps([found.get(d) or {"doi": d, "error": "not found"} for d in dois], indent=2))
    else:
        print_table([summarize(found.get(d), d, None if d in found else "not found in OpenAlex") for d in dois])
    return 0 if len(found) == len(dois) else 1


# --------------------------------------------------------------------------- #
# CLI                                                                          #
# --------------------------------------------------------------------------- #

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="unpaywall.py", description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--email", help="contact email for Unpaywall (or UNPAYWALL_EMAIL)")
    common.add_argument("--api-key", help="OpenAlex API key (or OPENALEX_API_KEY)")
    common.add_argument("--rate", type=float, default=10.0, help="max requests per second (default 10)")
    common.add_argument("--timeout", type=float, default=30.0, help="seconds per request (default 30)")
    common.add_argument("--dry-run", action="store_true", help="print the request URL(s) and exit without calling")
    common.add_argument("-v", "--verbose", action="store_true")

    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("lookup", parents=[common], help="OA status for one or more DOIs")
    s.add_argument("doi", nargs="+")
    s.add_argument("--json", action="store_true", help="print raw record(s)")
    s.add_argument("--fallback", action="store_true", help="on 404, try OpenAlex (needs API key)")
    s.set_defaults(func=cmd_lookup)

    s = sub.add_parser("search", parents=[common], help="Unpaywall title search")
    s.add_argument("query")
    s.add_argument("--oa", choices=["true", "false"], help="restrict to OA (true) or closed (false)")
    s.add_argument("--page", type=int, default=1)
    s.add_argument("--limit", type=int, default=10, help="results to print (max 50 per page)")
    s.add_argument("--json", action="store_true")
    s.set_defaults(func=cmd_search)

    s = sub.add_parser("batch", parents=[common], help="many DOIs from a file")
    s.add_argument("file", help="text file, one DOI or doi.org URL per line; # comments allowed")
    s.add_argument("--out", help="CSV path for the flat summary")
    s.add_argument("--jsonl", help="JSONL path for full records")
    s.add_argument("--fallback", action="store_true", help="try OpenAlex for DOIs Unpaywall lacks")
    s.set_defaults(func=cmd_batch)

    s = sub.add_parser("pdf", parents=[common], help="download best OA PDF(s)")
    s.add_argument("doi", nargs="+")
    s.add_argument("--out", default="./papers", help="output directory (default ./papers)")
    s.add_argument("--prefer-published", action="store_true", default=True,
                   help="prefer publishedVersion > acceptedVersion > submittedVersion (default on)")
    s.set_defaults(func=cmd_pdf)

    s = sub.add_parser("openalex", parents=[common], help="look up DOIs via OpenAlex")
    s.add_argument("doi", nargs="+")
    s.add_argument("--json", action="store_true")
    s.set_defaults(func=cmd_openalex)
    return p


def main(argv: Optional[List[str]] = None) -> int:
    args = build_parser().parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
