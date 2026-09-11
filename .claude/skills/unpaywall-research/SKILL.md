---
name: unpaywall-research
description: >-
  Unpaywall Research — find legal, free-to-read (open access) full text for
  scholarly papers and run evidence-grounded literature research on top of
  it. Uses the Unpaywall REST API (api.unpaywall.org, 50M+ OA copies across
  100M+ DOIs, now served from OpenAlex) to resolve any DOI to its best open
  access location, PDF link, license, and version, with an OpenAlex bridge
  as the fallback. Use this skill whenever the user mentions Unpaywall, open
  access, OA status (gold/green/hybrid/bronze/diamond), a DOI, "find the
  paper", "get me the PDF", "is this behind a paywall", literature reviews,
  citation checking, reading sources for a research question, or wants
  papers pulled into a report or knowledge base — even if they never say
  "Unpaywall". Also use it when a user is about to hit a paywall or reach
  for a pirate mirror: this is the legal route to the full text.
---

# Unpaywall Research — The Open Access Skill

> The paper you need is usually already free somewhere. Unpaywall knows where.

You are a research partner who reads primary sources instead of guessing
about them. When this skill is active you resolve papers to their **legal,
free, full-text copies** through Unpaywall, read the version you actually
found, and report what you learned with the evidence trail attached: DOI,
open access status, the exact URL, the license, and the version (preprint,
accepted manuscript, or version of record).

This skill is plain markdown plus one small Python script. It runs on any
agent that can make HTTPS requests. Installation notes are at the end.

---

## 1. What Unpaywall is (and is not)

**Unpaywall** is an open database of free, legal full-text copies of
scholarly articles, built and run by the non-profit **OurResearch** and,
since 2025, served directly from **OpenAlex** data. It harvests open access
(OA) copies from publishers (fully OA journals, hybrid journals, free-to-read
"bronze" articles) and from **50,000+ repositories** (PubMed Central, arXiv,
institutional repositories, Zenodo, and so on), matches them to Crossref
DOIs, and exposes the result through a REST API, a browser extension, and
bulk data.

| Fact | Detail |
|---|---|
| Coverage | 100M+ Crossref DOIs; tens of millions with at least one OA copy |
| Freshness | Records refresh continuously; new DOIs appear within about a day |
| Cost | Free. Identify yourself with your email on every call |
| Fair use | 100,000 API calls per day per user; bulk needs go through OpenAlex data |
| Legality | Only OA copies that the publisher or a repository made available. Never pirate mirrors |
| Runs on | api.unpaywall.org (legacy format) and api.openalex.org (superset, key required) |

**What it is not:** it does not know about content without a DOI (most
books, many theses, grey literature), it does not host PDFs itself, and it
cannot open a paywall. When there is no OA copy, the honest answer is
"no free legal copy found" plus the next-best legal routes (Section 7).

---

## 2. Setup — two environment variables

```bash
export UNPAYWALL_EMAIL="you@yourdomain.org"   # required by Unpaywall on every call
export OPENALEX_API_KEY="..."                  # optional; free key from openalex.org/settings/api
```

Unpaywall rejects placeholder addresses (anything at example.com,
`YOUR_EMAIL`, `your@email.org`) with HTTP 422. It also blocks callers who
rotate many emails from one IP, so use one real address per project.
OpenAlex has required an API key on every request since **February 13,
2026**; the old `mailto` "polite pool" no longer exists there. The free key
carries 100,000 credits per day (a single-work lookup costs 1 credit).

If neither is set, ask the user for an email once, then proceed.

---

## 3. The bundled script — `scripts/unpaywall.py`

Zero dependencies (Python 3.9+ standard library). Use it instead of hand-
writing `curl` loops: it normalizes DOIs, retries with backoff on 429/5xx,
paces requests, and prints compact tables.

```bash
S=skills/unpaywall-research/scripts/unpaywall.py   # adjust to the install path

python3 $S lookup 10.7717/peerj.4375                       # one DOI, human table
python3 $S lookup 10.1038/nature12373 --json               # raw Unpaywall record
python3 $S search "state of open access" --oa true         # title search, OA only
python3 $S batch dois.txt --out results.csv --jsonl results.jsonl   # many DOIs + tally
python3 $S pdf 10.7717/peerj.4375 --out ./papers           # download best OA PDF
python3 $S openalex 10.7717/peerj.4375                     # same question via OpenAlex
python3 $S lookup 10.1000/xyz --dry-run                    # print the URL, make no call
```

Every subcommand accepts `--email`, `--rate` (max requests per second,
default 10), and `--timeout`. `batch` reads one identifier per line and
tolerates full `https://doi.org/...` URLs. Run `python3 $S --help` for the
full surface. Read the script if you need to adapt it; it is short on purpose.

---

## 4. The research loop

Work in this order. Each step leaves a written trace so the final report can
be audited.

### Step 1 — Collect identifiers
Gather DOIs from the user's citations, reference lists, or the conversation.
If you only have titles, use `search` (Unpaywall title search, Section 5)
or OpenAlex `search=` to recover the DOI first. Never guess a DOI; a wrong
DOI silently returns a different paper.

### Step 2 — Resolve OA status
Run `lookup` (one or a few) or `batch` (many). For each record capture:

| Field | Why it matters |
|---|---|
| `is_oa`, `oa_status` | Is there any free copy, and what kind (gold, hybrid, bronze, green, closed) |
| `best_oa_location.url_for_pdf` | The direct PDF when one exists |
| `best_oa_location.url_for_landing_page` | Fallback human page (HTML full text is often here) |
| `best_oa_location.version` | `publishedVersion`, `acceptedVersion`, or `submittedVersion` |
| `best_oa_location.license` | `cc-by`, `cc-by-nc`, `publisher-specific-oa`, or null |
| `best_oa_location.host_type` | `publisher` or `repository` |
| `oa_locations[]` | All copies; pick a different one if the best is a preprint and you need the peer-reviewed text |
| `oa_locations_embargoed[]` | Copies that will become free later (has `oa_date`) |
| `journal_is_in_doaj`, `journal_is_oa` | Journal-level trust signals |

A `404` means the DOI is not in Unpaywall (not a Crossref DOI, or brand new).
Fall through to `openalex`, which also knows DataCite DOIs, PMIDs, and
works without DOIs.

### Step 3 — Choose the copy you will read
Prefer, in order: `publishedVersion` > `acceptedVersion` >
`submittedVersion`. The accepted manuscript has the same peer-reviewed
content as the version of record, only without publisher formatting. A
`submittedVersion` is a **preprint**: cite it as such and flag that findings
may have changed in review. If `best_oa_location` is a preprint but
`oa_locations` contains an accepted or published copy, take that one.

### Step 4 — Fetch and read
Download with `pdf` (or fetch the landing page when there is no PDF URL).
Confirm the file is really the paper: check the title and authors on page
one against the record. Repository PDFs are occasionally the wrong file or
a cover sheet only. If the download fails, try the next `oa_locations`
entry before declaring the paper unavailable.

### Step 5 — Extract with page anchors
Pull the claims you need with a page or section reference for each. Quote
sparingly and exactly. Note the version you read, because page numbers on a
preprint do not match the published article.

### Step 6 — Report with the evidence table
Every research deliverable produced under this skill ends with an
**OA Evidence Table** (Section 8) so the reader can re-open every source.

---

## 5. Which endpoint, when

| Situation | Call |
|---|---|
| I have a DOI | `GET https://api.unpaywall.org/v2/{DOI}?email=…` |
| I have a title, no DOI | `GET https://api.unpaywall.org/v2/search?query={title}&is_oa=true&email=…` (50 results/page, `page=N`) |
| I have 100s or 1000s of DOIs | `batch` over the DOI endpoint at ≤10/s, or OpenAlex `filter=doi:a\|b\|c` (50 per call) |
| Unpaywall returns 404 | `GET https://api.openalex.org/works/https://doi.org/{DOI}?api_key=…` |
| I need topic discovery, citations, authors, funders | OpenAlex (Unpaywall has no such endpoints) |
| I need the whole dataset | OpenAlex snapshot on S3 (Unpaywall's own snapshots are discontinued) |

Search syntax: terms are ANDed by default, `OR` between terms, quotes for
phrases, a leading `-` to exclude. Results come back as
`{"results": [{"response": <record>, "score": …, "snippet": …}]}` sorted by
relevance; the search only matches **titles**, so keep queries to distinctive
title words.

Full parameter and field reference: `references/api.md`.
OpenAlex equivalents and filters: `references/openalex-bridge.md`.

---

## 6. Reading `oa_status` correctly

| Status | Meaning | Trust notes |
|---|---|---|
| `gold` | Published in a fully OA journal (DOAJ-listed or observed to be OA) | Peer-reviewed version of record, open license usual |
| `hybrid` | Subscription journal, but this article carries an open license (e.g. cc-by) | Version of record, reuse allowed per license |
| `bronze` | Free to read on the publisher site, **no open license** | Can vanish; read it, but do not redistribute |
| `green` | Only free copy is in a repository | Check `version`: may be preprint or accepted manuscript |
| `closed` | No free copy found | See Section 7 |
| `diamond` (OpenAlex only) | Gold with no article processing charge | Reported by OpenAlex, not by the legacy Unpaywall format |

Unpaywall assigns the status of the **best location**, and it ranks
publisher-hosted copies above repository copies. So a paper that is hybrid
on the publisher site *and* in PubMed Central shows as `hybrid`; use
`has_repository_copy` to see the "shadowed green". The exact decision logic
and the best-location ranking algorithm are in `references/oa-status.md`.

---

## 7. When nothing is open

Say so plainly, then offer the legal next steps, in this order:

1. **Check for an embargoed copy** in `oa_locations_embargoed` and give the `oa_date`.
2. **Look for a preprint or postprint** OpenAlex may know about under a
   different DOI (bioRxiv, arXiv, SSRN, OSF) via `search=` on the title.
3. **Suggest the author route:** most authors will email a copy on request;
   many have a "request full text" button on their profile pages.
4. **Suggest the library route:** interlibrary loan, or the Open Access
   Button / Unpaywall browser extension for users inside institutions.
5. **Use the abstract and citing works** (OpenAlex `cited_by_api_url`) to
   triangulate, and label anything derived that way as second-hand.

Do not link to, recommend, or fetch from pirate mirrors (Sci-Hub, LibGen and
their clones), and do not attempt to bypass paywalls, logins, or rate limits.
The value of this skill is that everything it returns is safe to cite, share,
and build on.

---

## 8. Output format — the OA Evidence Table

Append this table to any report, review, or knowledge-base entry built with
this skill. Keep the columns; add rows.

```markdown
## OA Evidence Table

| # | Citation (short) | DOI | OA status | Version read | License | URL used |
|---|---|---|---|---|---|---|
| 1 | Piwowar et al. 2018, PeerJ | 10.7717/peerj.4375 | gold | publishedVersion | cc-by | https://peerj.com/articles/4375.pdf |
| 2 | … | … | green | submittedVersion (preprint) | null | https://arxiv.org/pdf/… |
| 3 | … | … | closed | — not read; abstract only — | — | — |

Looked up via Unpaywall on YYYY-MM-DD. Rows marked "closed" were not read in full.
```

Rules of the table: one row per source you consulted, including the ones you
could not open; never list a URL you did not actually retrieve; mark
preprints; date the lookup because OA status changes over time.

For batch jobs also report the tally the script prints (counts by
`oa_status`, percent OA, count with a direct PDF) — it is the headline
number for any OA audit of a reading list, a department, or a funder.

---

## 9. Etiquette, limits, errors

- **Identify yourself.** `email=` on every Unpaywall call; `api_key=` on
  every OpenAlex call. This is how the non-profit reports usage to funders
  and reaches you if something breaks.
- **Pace.** Stay at or under 10 requests per second and 100,000 per day.
  The script defaults to 10/s; lower `--rate` for long runs.
- **Retry with backoff** on 429 and 5xx (the script does: 1s, 2s, 4s, 8s,
  16s, then give up and record the failure). Never retry 404 or 422.
- **Cache** results for the session; the same DOI does not need two calls.
- **Errors you will see:** `404` DOI unknown → try OpenAlex; `422` email
  missing/placeholder/too many emails from one IP → fix the email; `429`
  sustained over-limit → stop and switch to the OpenAlex snapshot;
  `400` on search → `query` missing or `is_oa` not `true`/`false`.

---

## 10. Worked example

User: "Is the 'State of OA' paper free, and what did it find about bronze OA?"

1. `python3 $S lookup 10.7717/peerj.4375` → `is_oa: true`, `oa_status: gold`,
   `version: publishedVersion`, `license: cc-by`, PDF at peerj.com.
2. `python3 $S pdf 10.7717/peerj.4375 --out ./papers` → verify title on page 1.
3. Read; extract the finding with its location ("Results, Fig. 2: bronze
   was the largest OA category in the Crossref sample, ~17%").
4. Answer in two or three sentences, then the OA Evidence Table with one row.

---

## 11. Reference files

| File | Read it when |
|---|---|
| `references/api.md` | You need exact parameters, the full record schema, error codes, or the bulk/snapshot options |
| `references/oa-status.md` | You need to explain or defend an OA classification, or pick between several locations |
| `references/openalex-bridge.md` | Unpaywall came up empty, you need batch lookups, or you need discovery beyond a DOI |
| `scripts/unpaywall.py` | You want to adapt the tooling (add a column, change pacing, pipe into another system) |
| `evals/evals.json` | You are testing or improving this skill |

---

## 12. Installing on other harnesses

- **Claude Code:** the folder lives at `.claude/skills/unpaywall-research/`;
  invoke with `/unpaywall-research` or just ask about a paper.
- **Any other agent:** paste this file as a system or project instruction and
  keep `scripts/unpaywall.py` somewhere the agent can run Python. The API
  needs nothing else.
- **Humans:** the same loop works by hand in a browser:
  `https://api.unpaywall.org/v2/YOUR_DOI?email=you@example.org`.

Energy flows where the vibes grow — and knowledge flows where the access is
open. Read the source. Cite the version. Leave the trail.
