# Deploying Nat-Future-Insight to August.Here.Now ✦

This folder is a **self-contained, verified static bundle** of the oracle —
no build step, no server, no environment variables. It was mirrored from the
production build and tested end-to-end in a browser while served from a plain
static file server at the `/Nat-Future-Insight/` subpath (zero console errors,
full chat experience working).

## For Hermes / Davaris (or any static host)

Copy the `Nat-Future-Insight/` folder into the August.Here.Now site root:

```
august.here.now site root/
└── Nat-Future-Insight/
    ├── index.html
    ├── _next/            ← all JS/CSS chunks
    ├── favicon.svg
    ├── icon.svg
    └── manifest.json
```

Publish. That's it — `https://August.Here.Now/Nat-Future-Insight` is live.

Notes:
- All asset URLs inside `index.html` are pinned to `/Nat-Future-Insight/_next/…`,
  so the folder must keep that exact name (case-sensitive) at the site root.
- The oracle is fully client-side (the Davara Baseline engine ships in the JS),
  so it works on Cloudflare Pages, Netlify, GitHub Pages, nginx — anything
  that serves files.
- This bundle is a snapshot of Votus.One `main` (V5.0 — The Futurecast).
  To refresh it after future changes, re-run the mirror or just re-copy this
  folder from a newer commit of this repo.

## Alternative: serve it from the Vercel project instead

Add `august.here.now` as a domain on the Votus.One Vercel project
(Settings → Domains), point Cloudflare DNS `august` → `CNAME cname.vercel-dns.com`
(DNS-only), and the live Next.js app answers at
`August.Here.Now/Nat-Future-Insight` directly — always current, no bundle
copies needed. Then this folder can be deleted.
