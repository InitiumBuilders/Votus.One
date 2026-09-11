# Unpaywall REST API — reference

Base URL: `https://api.unpaywall.org/v2/`
Format: JSON. Every request needs `?email=you@yourdomain.org`.
Fair-use limit: 100,000 calls per day per user, ≤10 requests per second.

Since 2025 the API is served from OpenAlex data ("Walden" rewrite). The
record shape below is the legacy Unpaywall format kept stable for the
ecosystem built on it. Responses average ~50 ms.

## Contents
1. Endpoints
2. The DOI object
3. The OA Location object
4. Search response
5. Errors
6. Bulk data: simple query tool, data feed, snapshot
7. Example record

---

## 1. Endpoints

### `GET /v2/{DOI}`
Look up one DOI. The DOI may be bare (`10.7717/peerj.4375`) or URL-encoded;
the server normalizes case and strips `https://doi.org/` prefixes.

```
https://api.unpaywall.org/v2/10.7717/peerj.4375?email=you@yourdomain.org
```

Returns a DOI object (Section 2) or `404` if the DOI is not in the database.

### `GET /v2/search?query=…`
Full-text search over **article titles** only (not abstracts, not authors).

| Param | Required | Values |
|---|---|---|
| `query` | yes | Title words. `AND` implicit; `OR` supported; `"quoted phrase"`; `-term` excludes; a leading `-` is stripped |
| `is_oa` | no | `true` (only OA), `false` (only closed), `null`/omitted (all) — anything else → 400 |
| `page` | no | Positive integer, 50 results per page, default 1 |
| `email` | yes | Your address |

```
https://api.unpaywall.org/v2/search?query=%22state%20of%20OA%22&is_oa=true&email=you@yourdomain.org
```

Returns `{"results": [...], "elapsed_seconds": 0.12}` sorted by `score`
descending (Section 4). Versioned preprint DOIs get `(V2)`-style suffixes
appended to their title for disambiguation.

### `GET /v2/` and `GET /`
Health/version: `{"version": "2.0.1", "documentation_url": …, "msg": "Don't panic"}`.

### `POST /v2/dois` (Simple Query Tool backend)
Body `{"dois": [...], "email": "...", "formats": ["csv","jsonl","xlsx"]}`.
Runs the lookup server-side and **emails** the result files to the address;
the HTTP response is only an acknowledgement. Use it when a human wants a
spreadsheet in their inbox, not for programmatic pipelines — for those, loop
the DOI endpoint or use OpenAlex batch filters.

Anything else under `api.unpaywall.org` (repository tooling, `/feed/…`,
`/snapshot`) is either internal or requires a paid data-feed key.

---

## 2. The DOI object

Field order and names as emitted by the server (`dict_v2_fields`).

| Field | Type | Meaning |
|---|---|---|
| `doi` | string | DOI, lowercase, no prefix. The primary key |
| `doi_url` | string | `https://doi.org/{doi}` |
| `title` | string | Best available title |
| `genre` | string | Crossref type: `journal-article`, `book-chapter`, `proceedings-article`, `posted-content` (preprints), `dissertation`, … |
| `is_paratext` | bool | `true` for front matter, tables of contents, issue covers, editorial boards. Filter these out of any article count |
| `published_date` | string | ISO date `YYYY-MM-DD` (may be year-only precision padded) |
| `year` | int | Publication year |
| `journal_name` | string | Journal title, not normalized |
| `journal_issns` | string | Comma-separated ISSNs |
| `journal_issn_l` | string | Linking ISSN — use this to group a journal's print and electronic ISSNs |
| `journal_is_oa` | bool | Journal is fully OA (DOAJ-listed or observed OA rate) |
| `journal_is_in_doaj` | bool | Journal is listed in the Directory of Open Access Journals |
| `publisher` | string | Publisher name, not normalized |
| `is_oa` | bool | At least one free-to-read full-text location exists |
| `oa_status` | string | `gold` \| `hybrid` \| `bronze` \| `green` \| `closed` — status of the best location. See `oa-status.md` |
| `has_repository_copy` | bool | Any location has `host_type: repository` ("shadowed green" when `oa_status` is publisher-hosted) |
| `best_oa_location` | object\|null | The top-ranked OA Location (Section 3), or `null` when closed |
| `first_oa_location` | object\|null | The earliest-dated OA location (useful for "when did it first become open") |
| `oa_locations` | array | All OA locations, best first; empty when closed |
| `oa_locations_embargoed` | array | Locations expected to become open later (license/delayed-OA metadata); each has an `oa_date` |
| `updated` | string | ISO timestamp the record was last recomputed |
| `data_standard` | int | `1` = older hybrid detection (Crossref-only); `2` = full detection incl. publisher page scraping. Treat `2` as more reliable |
| `z_authors` | array\|null | Crossref author objects: `{family, given, sequence, ORCID?, affiliation[]}` (the `z_` keeps it sorted last) |

Notes
- All string fields may be `null`.
- `is_oa` is `true` if and only if `best_oa_location` is non-null.
- Preprints (`genre: posted-content`) are forced to `oa_status: green` even
  when hosted on a publisher's preprint server.

---

## 3. The OA Location object

Each element of `oa_locations`, `oa_locations_embargoed`, and the value of
`best_oa_location` / `first_oa_location`.

| Field | Type | Meaning |
|---|---|---|
| `url` | string | Best URL for this copy: `url_for_pdf` if present, else `url_for_landing_page` |
| `url_for_pdf` | string\|null | Direct PDF link |
| `url_for_landing_page` | string\|null | Human-readable page describing the copy (often contains HTML full text) |
| `host_type` | string | `publisher` or `repository` |
| `version` | string\|null | DRIVER versions: `publishedVersion` (version of record), `acceptedVersion` (peer-reviewed author manuscript), `submittedVersion` (preprint). `null` = unknown |
| `license` | string\|null | `cc-by`, `cc-by-sa`, `cc-by-nc`, `cc-by-nc-sa`, `cc-by-nd`, `cc-by-nc-nd`, `cc0`, `pd` (public domain), `publisher-specific-oa`, `implied-oa`, `acs-specific: authorchoice/editors choice usage agreement`, `elsevier-specific: oa user license`, or `null` (no open license found — typical of bronze) |
| `evidence` | string | How the copy was found. Examples: `oa journal (via doaj)`, `oa journal (via observed oa rate)`, `oa journal (via publisher name)`, `open (via crossref license)`, `open (via page says license)`, `open (via free pdf)`, `open (via free article)`, `oa repository (via OAI-PMH doi match)`, `oa repository (via OAI-PMH title and first author match)`, `oa repository (via pmcid lookup)`, `oa repository (semantic scholar lookup)` |
| `is_best` | bool | `true` on exactly one location per record |
| `pmh_id` | string\|null | OAI-PMH record identifier (repository copies) |
| `endpoint_id` | string\|null | Unpaywall's repository endpoint ID |
| `repository_institution` | string\|null | Institution hosting the repository |
| `oa_date` | string\|null | ISO date this copy became (or will become) open |
| `updated` | string | ISO timestamp the location was last checked |
| `reported_noncompliant` | bool (only when true) | Publisher reported this copy as non-compliant with their policy; treat with caution |

Evidence strings containing `title` (rather than `doi`) mean the repository
record was matched by title + first author, which is a weaker match. When
you rely on such a copy, verify the PDF's title and authors.

---

## 4. Search response

```json
{
  "elapsed_seconds": 0.084,
  "results": [
    {
      "response": { "...": "full DOI object as in Section 2, minus z_authors, plus:",
                    "author_lastnames": ["Piwowar", "Priem", "..."],
                    "abstracts": [] },
      "score": 0.0157,
      "snippet": "The <b>state</b> <b>of</b> <b>OA</b>: a large-scale analysis…"
    }
  ]
}
```

`score` is a relevance score (higher = better). `snippet` is the title with
matched terms in `<b>` tags. Treat the top result as a candidate, not a
certainty: confirm year, journal, or first author before using its DOI.

---

## 5. Errors

Errors are JSON: `{"HTTP_status_code": 422, "error": true, "message": "..."}`.

| Code | Cause | What to do |
|---|---|---|
| 400 | Search without `query`, bad `is_oa`, bad `page` | Fix parameters |
| 404 | DOI not in Unpaywall (non-Crossref DOI, malformed, or very new) | Try OpenAlex `works/https://doi.org/{doi}`; check the DOI resolves at doi.org |
| 422 | Missing email; placeholder email (`example.com`, `YOUR_EMAIL`, `your@email.org`); >20 distinct emails from one IP; too many requests/second for one email | Use one real address; slow down |
| 429 | Sustained history over the daily limit | Stop; contact support@unpaywall.org or switch to the OpenAlex snapshot |
| 5xx | Server trouble | Exponential backoff, max 5 tries |

There is a hidden `api_key=` admin parameter in the code that bypasses rate
limits; it is for OurResearch staff and data-feed customers, not for
general users.

---

## 6. Bulk data

- **Simple Query Tool** (web UI or `POST /v2/dois`): up to a few thousand
  DOIs, results emailed as CSV/JSONL/XLSX. Good for librarians and one-off
  audits.
- **Data feed** (`/feed/changefiles`, `/daily-feed/changefile/…`,
  `/weekly-feed/…`): daily/weekly JSONL change files for subscribers with a
  data-feed API key. Paid; not needed for research use.
- **Snapshot:** Unpaywall no longer publishes its own semi-annual snapshot.
  The full data is in the **OpenAlex snapshot** on S3
  (`aws s3 sync s3://openalex/data/works …`, hundreds of GB, JSON Lines,
  refreshed about monthly). Each work's `open_access`, `best_oa_location`,
  and `locations` fields hold the same information.
- **CSV summary columns** the Simple Query Tool emits (handy as a flat schema
  for your own exports): `doi, doi_url, is_oa, oa_status, genre, is_paratext,
  journal_name, journal_issns, journal_issn_l, journal_is_oa,
  journal_is_in_doaj, publisher, published_date, data_standard, best_oa_url,
  best_oa_url_is_pdf, best_oa_evidence, best_oa_host, best_oa_version,
  best_oa_license`.

---

## 7. Example record (illustrative)

`GET /v2/10.7717/peerj.4375?email=…`

```json
{
  "doi": "10.7717/peerj.4375",
  "doi_url": "https://doi.org/10.7717/peerj.4375",
  "title": "The state of OA: a large-scale analysis of the prevalence and impact of Open Access articles",
  "genre": "journal-article",
  "is_paratext": false,
  "published_date": "2018-02-13",
  "year": 2018,
  "journal_name": "PeerJ",
  "journal_issns": "2167-8359",
  "journal_issn_l": "2167-8359",
  "journal_is_oa": true,
  "journal_is_in_doaj": true,
  "publisher": "PeerJ",
  "is_oa": true,
  "oa_status": "gold",
  "has_repository_copy": true,
  "best_oa_location": {
    "updated": "2025-06-01T09:12:44.120000",
    "url": "https://peerj.com/articles/4375.pdf",
    "url_for_pdf": "https://peerj.com/articles/4375.pdf",
    "url_for_landing_page": "https://doi.org/10.7717/peerj.4375",
    "evidence": "oa journal (via doaj)",
    "license": "cc-by",
    "version": "publishedVersion",
    "host_type": "publisher",
    "is_best": true,
    "pmh_id": null,
    "endpoint_id": null,
    "repository_institution": null,
    "oa_date": "2018-02-13"
  },
  "first_oa_location": { "...": "the preprint on PeerJ Preprints, version submittedVersion" },
  "oa_locations": [
    { "...": "best location (above)" },
    {
      "url": "https://europepmc.org/articles/pmc5815332?pdf=render",
      "url_for_pdf": "https://europepmc.org/articles/pmc5815332?pdf=render",
      "url_for_landing_page": "https://europepmc.org/articles/pmc5815332",
      "evidence": "oa repository (via OAI-PMH doi match)",
      "license": "cc-by",
      "version": "publishedVersion",
      "host_type": "repository",
      "is_best": false,
      "pmh_id": "oai:europepmc.org:5815332",
      "endpoint_id": "b5e840539009389b1a6",
      "repository_institution": "Europe PMC",
      "oa_date": null,
      "updated": "2025-05-30T02:40:11.000000"
    }
  ],
  "oa_locations_embargoed": [],
  "updated": "2025-06-01T09:12:44.120000",
  "data_standard": 2,
  "z_authors": [
    { "given": "Heather", "family": "Piwowar", "sequence": "first", "ORCID": "http://orcid.org/0000-0003-1613-5981" },
    { "given": "Jason", "family": "Priem", "sequence": "additional" }
  ]
}
```

Values are representative; live records differ in timestamps and IDs.
