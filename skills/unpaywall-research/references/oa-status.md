# OA status and best-location logic

How Unpaywall decides `oa_status`, how it ranks locations to pick
`best_oa_location`, and how to use both honestly in research. Derived from
the open-source Unpaywall codebase (`ourresearch/oadoi`, `open_location.py`
and `pub.py`) and the OpenAlex work object documentation.

## Contents
1. The five statuses (plus diamond)
2. Per-location classification rules
3. Record-level status: the best location wins
4. Best-location ranking
5. Research implications
6. Definitions of version and license

---

## 1. The five statuses

| `oa_status` | One-line definition | Host | Open license? |
|---|---|---|---|
| `gold` | In a journal that is entirely open access | publisher | usually |
| `hybrid` | In a subscription journal, but this article has an open license | publisher | yes |
| `bronze` | Free to read on the publisher site with no identifiable open license | publisher | no |
| `green` | Free copy only in a repository (institutional, subject, PMC, preprint server) | repository | varies |
| `closed` | No free full-text copy found anywhere | — | — |

OpenAlex adds **`diamond`**: gold with no article processing charge
(`apc_list.value` = 0 or the source is known to be free for authors). The
legacy Unpaywall format folds diamond into gold.

Statuses are mutually exclusive on a record, ordered by "quality" for
tie-breaks: `gold > hybrid > bronze > green > closed`.

---

## 2. Per-location classification rules

Each OA location gets its own colour before the record does. In order:

1. **gold** — the location has a URL and its `evidence` starts with
   `oa journal` (found because the journal is in DOAJ, has an observed OA
   rate near 100%, is from a known OA publisher, or was set manually).
2. **green** — the location has a URL and `evidence` starts with
   `oa repository` (OAI-PMH harvest matched by DOI or by title+author,
   PMC/Europe PMC lookup, Semantic Scholar lookup).
3. **hybrid** — not gold, not green, and the location carries an
   **open license** (a Creative Commons license, CC0, public domain, or a
   recognised publisher OA license found in Crossref metadata or on the
   article page).
4. **bronze** — not gold, not green, and **no** open license (a "free PDF"
   or "free article" observed on the publisher page), or the location is the
   DOI landing page itself and nothing else applies.
5. Otherwise, if there is a URL at all, it defaults to **green**.

`host_type` follows from this: gold/hybrid/bronze → `publisher`;
everything else → `repository`.

---

## 3. Record-level status

- If the record has no OA locations → `closed`, and `license`, `version`,
  `evidence` are all nulled ("don't return an open license on a closed
  thing").
- If the work is a **preprint** (`genre: posted-content` / Crossref
  `posted-content`) → `green`, regardless of host.
- Otherwise → the **highest-ranked colour among all locations**
  (`gold > hybrid > bronze > green`). Because publisher-hosted colours rank
  above green, a paper with a hybrid copy at the publisher and a copy in PMC
  is `hybrid`, not `green`.

The `has_repository_copy` flag exists precisely to recover the repository
signal the status hides ("shadowed green" in the *State of OA* paper).
OpenAlex exposes the same thing as `open_access.any_repository_has_fulltext`.

---

## 4. Best-location ranking

All OA locations are sorted by a score (lower is better). Contributions:

| Signal | Score change | Effect |
|---|---|---|
| Hosted by the publisher | −1000 | Publisher copies beat repository copies |
| …and evidence is "oa journal" (manual or observed) | +100 | Slight demotion vs. license-backed publisher copies |
| …and has an open license | −50 | Gold/hybrid beat bronze at the same publisher |
| Repository copy whose landing page contains the DOI (e.g. a preprint server issuing the DOI) | −50 | Preferred over other repositories |
| `version: publishedVersion` | −600 | Version of record wins |
| …and landing page is exactly `https://doi.org/{doi}` | −200 | Canonical VoR wins over mirrored VoR |
| `version: acceptedVersion` | −400 | |
| `version: submittedVersion` | −200 | Preprints lose to manuscripts |
| `version: null` | 0 | Unknown version sorts last |
| Has a direct PDF URL | −100 | "This is very important" (source comment) |
| Evidence contains `doi` (matched by DOI, not title) | −10 | More trustworthy match |
| Repository URL ends in `.vN` (versioned preprint DOI) | +5 | Unversioned preprint DOI wins |
| URL heuristics | −101 … +60 | e.g. PMC/Europe PMC boosted; known-flaky hosts penalised; `citeseerx` and similar demoted |

In plain words, the algorithm prioritises: **publisher-hosted → closest to
the version of record → has a PDF → matched by DOI → more authoritative
repository** (PubMed Central over CiteSeerX). The winner gets
`is_best: true` and becomes `best_oa_location`; `oa_locations` is emitted
in this sorted order.

---

## 5. Research implications

- **Green does not mean peer-reviewed.** Always read `version`. A
  `submittedVersion` is a preprint; cite it as a preprint and check whether
  a published version exists (`oa_locations`, or OpenAlex `locations` with
  `is_published`).
- **Bronze is fragile.** Publishers can close bronze articles at any time
  (free-to-read promotions, delayed OA windows). Save what you read and date
  the lookup.
- **Hybrid and gold with a CC license are safe to quote at length and
  redistribute** under the license terms. Bronze and most green copies are
  read-only unless a license says otherwise.
- **Title-matched repository copies need a sanity check** (`evidence`
  contains `title`). Compare authors and year on the PDF's first page.
- **Paratext inflates counts.** Exclude `is_paratext: true` from any
  "% of articles that are OA" statistic.
- **Statuses drift.** OpenAlex's 2025 rebuild changed `oa_status` for ~10%
  of works. Re-run lookups before publishing a number; do not mix results
  from different dates in one table without saying so.

---

## 6. Versions and licenses

**Versions** (DRIVER Guidelines, also used by OpenAlex):
- `publishedVersion` — version of record; publisher formatting; the citable
  page numbers.
- `acceptedVersion` — post-peer-review author manuscript ("postprint",
  "AAM"); content interchangeable with the VoR, formatting not.
- `submittedVersion` — pre-peer-review manuscript ("preprint"); content may
  differ materially.

**Licenses** you will meet in `license`:
`cc-by` (reuse with attribution), `cc-by-sa`, `cc-by-nc`, `cc-by-nc-sa`,
`cc-by-nd`, `cc-by-nc-nd` (most restrictive CC), `cc0` / `pd` (no rights
reserved), `publisher-specific-oa` (open but under the publisher's own
terms), `implied-oa` (page says open but no formal license), `null` (none
found — treat as all-rights-reserved, read-only).
