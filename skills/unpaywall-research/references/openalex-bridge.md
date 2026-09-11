# OpenAlex bridge

Unpaywall is now a legacy-format view of **OpenAlex** (also by OurResearch).
Everything Unpaywall knows, OpenAlex knows too, plus authors, institutions,
topics, citations, funders, and works without DOIs. Use OpenAlex when
Unpaywall returns 404, when you need batch lookups in few calls, or when the
research question goes beyond "where is the free copy".

## Contents
1. Authentication and limits (2026)
2. Field mapping Unpaywall → OpenAlex
3. Look up one work
4. Batch lookups
5. Discovery: search and filters
6. Snapshot

---

## 1. Authentication and limits

- Base URL: `https://api.openalex.org`
- **API key required on every request since 13 Feb 2026.** Get a free key
  at `https://openalex.org/settings/api`. Pass it as `?api_key=KEY`
  (a query parameter) — or the `Authorization: Bearer KEY` header where
  supported. Without a key you get a handful of test credits, then 409/403.
- The old `mailto=` polite pool is **gone**; do not add it, do not rely on it.
- Limits are **credit-based**: free keys get **100,000 credits per day**,
  hard-capped at 100 requests per second.
  - single entity (`/works/W…`, `/works/https://doi.org/…`): 1 credit
  - list/filter/search (`/works?filter=…`): 10 credits
  - content (PDF) endpoints: 100 credits; vector/`/text` endpoints: 1,000
- Check remaining budget at `/rate-limit?api_key=KEY` or in the
  `X-RateLimit-Remaining` / `X-RateLimit-Reset` response headers.
- Exceeding limits returns 429; back off exponentially.

Older copies of the OpenAlex docs (and the `api-guide-for-llms.md` in their
GitHub repo) still describe "no auth, 100k requests/day, polite pool". Those
pages predate February 2026. Trust the key requirement.

---

## 2. Field mapping

| Unpaywall (legacy) | OpenAlex work object |
|---|---|
| `doi` (bare) | `doi` (full `https://doi.org/…` URL); `ids.doi` |
| `title` | `title` / `display_name` |
| `genre` | `type` (`article`, `book-chapter`, `preprint`, `dissertation`, …) and `type_crossref` |
| `is_paratext` | `is_paratext` |
| `published_date`, `year` | `publication_date`, `publication_year` |
| `journal_name`, `journal_issns`, `journal_issn_l` | `primary_location.source.display_name`, `.issn`, `.issn_l` |
| `journal_is_oa`, `journal_is_in_doaj` | `primary_location.source.is_oa`, `.is_in_doaj` |
| `publisher` | `primary_location.source.host_organization_name` |
| `is_oa` | `open_access.is_oa` |
| `oa_status` | `open_access.oa_status` (adds `diamond`) |
| `has_repository_copy` | `open_access.any_repository_has_fulltext` |
| `best_oa_location.url` | `open_access.oa_url` (PDF if available, else landing page) |
| `best_oa_location` | `best_oa_location` (a Location object) |
| `oa_locations` | `locations` filtered to `is_oa: true` (`locations_count` gives the total) |
| `best_oa_location.url_for_pdf` | `best_oa_location.pdf_url` |
| `best_oa_location.url_for_landing_page` | `best_oa_location.landing_page_url` |
| `best_oa_location.version` | `best_oa_location.version` (same DRIVER values) plus booleans `is_accepted`, `is_published` |
| `best_oa_location.license` | `best_oa_location.license`, `license_id` |
| `best_oa_location.host_type` | derive: `source.type == "repository"` → repository, else publisher |
| `best_oa_location.repository_institution` | `best_oa_location.source.host_organization_name` |
| `oa_locations_embargoed` | no direct equivalent (check `locations[].license` and source policies) |
| `z_authors` | `authorships[]` (`author.display_name`, `author.orcid`, `institutions[]`, `author_position`) |
| `updated` | `updated_date` |
| — | `cited_by_count`, `cited_by_api_url`, `referenced_works`, `related_works`, `topics`, `keywords`, `funders`/`awards`, `abstract_inverted_index`, `has_fulltext`, `apc_list`, `apc_paid` |

Reconstruct an abstract from `abstract_inverted_index` by placing each word
at its listed positions and joining in order.

---

## 3. Look up one work

```
GET https://api.openalex.org/works/https://doi.org/10.7717/peerj.4375?api_key=KEY
GET https://api.openalex.org/works/doi:10.7717/peerj.4375?api_key=KEY
GET https://api.openalex.org/works/pmid:29456894?api_key=KEY
GET https://api.openalex.org/works/pmcid:PMC5815332?api_key=KEY
```

Trim the payload with `select` (comma-separated top-level fields):

```
…?select=id,doi,title,publication_year,type,open_access,best_oa_location,locations,authorships&api_key=KEY
```

A DOI OpenAlex does not know returns 404 as well; an illegal ID (containing
`,` or `&`) returns 403.

---

## 4. Batch lookups

Up to **50 DOIs per call** with the pipe (`|`) OR syntax, one list call = 10
credits (vs. 50 credits for 50 singleton calls):

```
GET https://api.openalex.org/works?filter=doi:https://doi.org/10.1/a|https://doi.org/10.2/b|…&per-page=50&select=doi,open_access,best_oa_location&api_key=KEY
```

Results are not guaranteed to be in input order; re-key them by
`doi` (lower-cased) on the client side. Missing DOIs are simply absent.
`per-page` maxes at 200 for other list queries; page with `page=` or, for
more than 10,000 results, with `cursor=*` and the returned `meta.next_cursor`.

---

## 5. Discovery

Title/abstract/full-text search:
```
GET /works?search=state of open access prevalence&per-page=25&api_key=KEY
GET /works?filter=title.search:"state of OA"&api_key=KEY
```

OA filters that matter for this skill:

| Filter | Meaning |
|---|---|
| `is_oa:true` (alias of `open_access.is_oa`) | any free copy |
| `oa_status:gold` / `hybrid` / `bronze` / `green` / `diamond` / `closed` | by status |
| `open_access.any_repository_has_fulltext:true` | shadowed green |
| `best_open_version:any` / `acceptedOrPublished` / `published` | minimum version quality of the best OA copy |
| `has_oa_accepted_or_published_version:true` | a peer-reviewed OA copy exists somewhere |
| `has_oa_submitted_version:true` | a preprint exists |
| `best_oa_location.license:cc-by` | by license |
| `best_oa_location.source.is_in_doaj:true` | DOAJ journals |
| `locations.source.type:repository` | has a repository location |
| `has_fulltext:true` | OpenAlex holds indexed full text (enables `fulltext.search:`) |

Combine filters with commas (AND) and values with `|` (OR):
`filter=publication_year:2020-2024,is_oa:true,oa_status:green|hybrid`.

Aggregate instead of listing with `group_by=oa_status` (one dimension per
call). Random samples use `sample=N&seed=S`, never random page numbers.

Two-step rule for people and places: resolve names to IDs first
(`/authors?search=…`, `/institutions?search=…`), then filter works by the
ID (`authorships.author.id:A…`, `authorships.institutions.id:I…`).

---

## 6. Snapshot

Full data (works, authors, sources, …) is on S3 as gzipped JSON Lines,
refreshed about monthly; works alone are several hundred GB:

```
aws s3 sync "s3://openalex/data/works" "openalex-snapshot/data/works" --no-sign-request
```

Each `works` line has the same `open_access`, `best_oa_location`, and
`locations` objects as the API. This replaces the discontinued Unpaywall
snapshot; the `legacy-data/` prefix carries older Unpaywall-format dumps.
