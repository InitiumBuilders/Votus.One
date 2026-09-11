#!/usr/bin/env python3
"""Offline tests for unpaywall.py using a fake transport. Run: python3 test_unpaywall.py"""
import json
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import unpaywall as u  # noqa: E402

GOLD = {
    "doi": "10.7717/peerj.4375", "title": "The state of OA", "genre": "journal-article",
    "is_paratext": False, "year": 2018, "journal_name": "PeerJ", "journal_is_in_doaj": True,
    "publisher": "PeerJ", "is_oa": True, "oa_status": "gold", "has_repository_copy": True,
    "best_oa_location": {"url": "https://peerj.com/articles/4375.pdf", "url_for_pdf": "https://peerj.com/articles/4375.pdf",
                         "url_for_landing_page": "https://doi.org/10.7717/peerj.4375", "version": "publishedVersion",
                         "license": "cc-by", "host_type": "publisher", "evidence": "oa journal (via doaj)", "is_best": True},
    "oa_locations": [], "oa_locations_embargoed": [], "data_standard": 2,
}
GOLD["oa_locations"] = [GOLD["best_oa_location"], {"url": "https://arxiv.org/abs/x", "url_for_pdf": "https://arxiv.org/pdf/x",
                                                    "version": "submittedVersion", "host_type": "repository", "license": None}]
CLOSED = {"doi": "10.1000/closed", "is_oa": False, "oa_status": "closed", "best_oa_location": None,
          "oa_locations": [], "oa_locations_embargoed": [], "genre": "journal-article", "is_paratext": False, "year": 2020}
PARATEXT = dict(CLOSED, doi="10.1000/toc", is_paratext=True)
OA_WORK = {
    "id": "https://openalex.org/W1", "doi": "https://doi.org/10.1000/onlyalex", "title": "Only in OpenAlex",
    "publication_year": 2021, "type": "article", "is_paratext": False,
    "open_access": {"is_oa": True, "oa_status": "green", "oa_url": "https://repo.org/x.pdf", "any_repository_has_fulltext": True},
    "best_oa_location": {"is_oa": True, "pdf_url": "https://repo.org/x.pdf", "landing_page_url": "https://repo.org/x",
                         "version": "acceptedVersion", "license": "cc-by-nc", "source": {"type": "repository", "display_name": "Repo", "host_organization_name": "Uni"}},
    "locations": [{"is_oa": False, "landing_page_url": "https://doi.org/10.1000/onlyalex", "source": {"type": "journal", "display_name": "J"}},
                  {"is_oa": True, "pdf_url": "https://repo.org/x.pdf", "landing_page_url": "https://repo.org/x", "version": "acceptedVersion",
                   "license": "cc-by-nc", "source": {"type": "repository", "display_name": "Repo", "host_organization_name": "Uni"}}],
    "primary_location": {"source": {"display_name": "J", "is_in_doaj": False, "is_oa": False, "host_organization_name": "Pub"}},
}


class FakeNet:
    def __init__(self):
        self.calls = []
        self.flaky_left = 0

    def __call__(self, url, timeout):
        self.calls.append(url)
        if self.flaky_left:
            self.flaky_left -= 1
            return u.Response(503, b"busy")
        if "api.openalex.org/works/https://doi.org/10.1000/onlyalex" in url:
            return u.Response(200, json.dumps(OA_WORK).encode())
        if "api.openalex.org/works?" in url:
            return u.Response(200, json.dumps({"results": [OA_WORK]}).encode())
        if "email=bad%40example.com" in url:
            return u.Response(422, json.dumps({"message": "Please use your own email"}).encode())
        if "/v2/search?" in url:
            return u.Response(200, json.dumps({"results": [{"response": dict(GOLD, author_lastnames=["Piwowar", "Priem"]), "score": 0.9, "snippet": "x"}]}).encode())
        if "/v2/10.7717/peerj.4375?" in url:
            return u.Response(200, json.dumps(GOLD).encode())
        if "/v2/10.1000/closed?" in url:
            return u.Response(200, json.dumps(CLOSED).encode())
        if "/v2/10.1000/toc?" in url:
            return u.Response(200, json.dumps(PARATEXT).encode())
        if "peerj.com/articles/4375.pdf" in url:
            return u.Response(200, b"%PDF-1.4 fake")
        return u.Response(404, json.dumps({"message": "not found"}).encode())


class Tests(unittest.TestCase):
    def setUp(self):
        self.net = FakeNet()
        self.client = u.Client(rate=0, fetch=self.net, sleep=lambda s: None)
        os.environ["UNPAYWALL_EMAIL"] = "tester@votus.one"
        os.environ["OPENALEX_API_KEY"] = "k123"

    def test_normalize_doi(self):
        self.assertEqual(u.normalize_doi("https://doi.org/10.7717/PeerJ.4375"), "10.7717/peerj.4375")
        self.assertEqual(u.normalize_doi("doi:10.1000/ABC."), "10.1000/abc")
        self.assertEqual(u.normalize_doi("see 10.1038/nature12373, 2013"), "10.1038/nature12373")
        self.assertIsNone(u.normalize_doi("not a doi"))

    def test_email_guard(self):
        with self.assertRaises(SystemExit):
            u.resolve_email("someone@example.com")
        with self.assertRaises(SystemExit):
            u.resolve_email("YOUR_EMAIL")
        self.assertEqual(u.resolve_email("a@b.org"), "a@b.org")

    def test_lookup_and_summarize(self):
        r = u.lookup_one(self.client, "10.7717/peerj.4375", "tester@votus.one")
        s = u.summarize(r["record"])
        self.assertEqual(s["oa_status"], "gold")
        self.assertTrue(s["best_oa_url_is_pdf"])
        self.assertEqual(s["n_oa_locations"], 2)
        r404 = u.lookup_one(self.client, "10.1000/missing", "tester@votus.one")
        self.assertEqual(r404["status"], 404)
        self.assertEqual(u.summarize(None, "10.1000/missing", r404["error"])["error"], "not found")

    def test_cache_and_retry(self):
        u.lookup_one(self.client, "10.7717/peerj.4375", "tester@votus.one")
        u.lookup_one(self.client, "10.7717/peerj.4375", "tester@votus.one")
        self.assertEqual(self.client.calls, 1)
        self.net.flaky_left = 2
        r = u.lookup_one(self.client, "10.1000/closed", "tester@votus.one")
        self.assertEqual(r["status"], 200)
        self.assertEqual(self.client.calls, 4)  # 2 failures + 1 success

    def test_no_retry_on_422(self):
        r = u.lookup_one(self.client, "10.1000/closed", "bad@example.com")
        self.assertEqual(r["status"], 422)
        self.assertEqual(self.client.calls, 1)

    def test_tally_excludes_paratext(self):
        sums = [u.summarize(GOLD), u.summarize(CLOSED), u.summarize(PARATEXT), u.summarize(None, "10.1/x", "not found")]
        t = u.tally(sums)
        self.assertEqual(t["articles"], 2)
        self.assertEqual(t["oa"], 1)
        self.assertEqual(t["pct_oa"], 50.0)
        self.assertEqual(t["paratext_excluded"], 1)
        self.assertEqual(t["not_found_or_error"], 1)
        self.assertEqual(t["by_status"], {"gold": 1, "closed": 1})

    def test_openalex_mapping(self):
        rec = u.openalex_to_unpaywall(OA_WORK)
        self.assertEqual(rec["doi"], "10.1000/onlyalex")
        self.assertEqual(rec["oa_status"], "green")
        self.assertEqual(rec["best_oa_location"]["host_type"], "repository")
        self.assertEqual(rec["best_oa_location"]["url_for_pdf"], "https://repo.org/x.pdf")
        self.assertEqual(len(rec["oa_locations"]), 1)
        self.assertTrue(rec["oa_locations"][0]["is_best"])

    def test_openalex_batch_url_and_lookup(self):
        url = u.openalex_batch_url(["10.1/a", "10.2/b"], "k", None)
        self.assertIn("filter=doi:https://doi.org/10.1/a|https://doi.org/10.2/b", url)
        self.assertIn("per-page=2", url)
        found = u.openalex_lookup(self.client, ["10.1000/onlyalex", "10.1000/zzz"], "k123")
        self.assertIn("10.1000/onlyalex", found)
        self.assertNotIn("10.1000/zzz", found)

    def test_cli_lookup_fallback_and_batch(self):
        u._client = lambda args: self.client  # inject fake transport
        rc = u.main(["lookup", "10.7717/peerj.4375", "10.1000/onlyalex", "--fallback", "--json"])
        self.assertEqual(rc, 0)
        with tempfile.TemporaryDirectory() as d:
            f = os.path.join(d, "dois.txt")
            with open(f, "w") as fh:
                fh.write("# list\nhttps://doi.org/10.7717/peerj.4375\n10.1000/closed\n10.1000/toc\n10.1000/missing\n\n")
            csv_path, jsonl_path = os.path.join(d, "o.csv"), os.path.join(d, "o.jsonl")
            rc = u.main(["batch", f, "--out", csv_path, "--jsonl", jsonl_path])
            self.assertEqual(rc, 0)
            self.assertEqual(sum(1 for _ in open(csv_path)) - 1, 4)
            self.assertEqual(sum(1 for _ in open(jsonl_path)), 4)
            rc = u.main(["pdf", "10.7717/peerj.4375", "10.1000/closed", "--out", os.path.join(d, "p")])
            self.assertEqual(rc, 1)  # closed one fails, gold saved
            self.assertTrue(os.path.exists(os.path.join(d, "p", "10.7717_peerj.4375.pdf")))
        rc = u.main(["search", "state of OA", "--oa", "true"])
        self.assertEqual(rc, 0)

    def test_dry_run_needs_no_network(self):
        rc = u.main(["lookup", "10.1000/x", "--dry-run"])
        self.assertEqual(rc, 0)
        rc = u.main(["openalex", "10.1000/x", "--dry-run"])
        self.assertEqual(rc, 0)


if __name__ == "__main__":
    unittest.main(verbosity=1)
