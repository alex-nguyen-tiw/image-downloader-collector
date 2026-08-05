# Image Downloader & Collector — Browser Extension

Official multi-browser extension by **[Tshirts I Want](https://tshirtsiwant.com/)**.

Save and batch-download the **original full-resolution image** behind any thumbnail —
on Amazon, Etsy, and the rest of the web — organised into custom folders, with every
source URL kept.

- **Official website:** [https://tshirtsiwant.com/](https://tshirtsiwant.com/)
- **Supported browsers:** Chrome · Microsoft Edge · Mozilla Firefox · Opera · Brave
- **Manifest:** V3 · **Price:** Free · **Data collected:** None

### What makes it different

Most image downloaders grab whatever URL the page is displaying, which is usually a
compressed thumbnail. This extension resolves the real original from the page's own DOM,
with dedicated rules for Amazon (`data-old-hires`, `data-a-dynamic-image`, size-modifier
stripping) and Etsy (`il_fullxfull` upgrade).

### Features

| Feature | Where |
|---|---|
| Download the **original** image, not the thumbnail | Hover icons · right-click menu · dashboard |
| Save into custom folders | Hover icons · right-click menu |
| Toggle the hover icons on/off | Dashboard header — applies instantly, no reload |
| Right-click menu `Image Collector ▸` | Any page, `image` + `link` contexts |
| Batch export as `.zip` with `sources.csv` | Dashboard |
| Source tracking: domain badge, search by domain | Dashboard |

📘 **[`PRODUCT.md`](PRODUCT.md) — the single source of truth for all product content.**
Full feature list, user guide, FAQ, paste-ready copy sized for each store's character
limits, keywords, blog angles. Write blog posts and store descriptions from that file;
when a feature changes, **update it there first**.

📝 Version history: [`CHANGELOG.md`](CHANGELOG.md)
🛡️ Permission justification for store reviewers: [`store-assets/README.md`](store-assets/README.md)

---

## Repository layout

> ⚠️ **Rule #1: only ever edit code in `src/`.**
> This project used to keep two copies of the source (`chromium/` and `firefox/`) that had
> to be edited in parallel. That is gone. There is now one source, and `build.ps1` generates
> the per-store manifest.

| Path | Role |
|---|---|
| `src/` | **The single source.** All packaged code and icons. Edit here. |
| `manifest.base.json` | **Shared** manifest fields: version, permissions, name, action… |
| `targets/chromium.json` | Chromium override: `background.service_worker` |
| `targets/firefox.json` | Gecko override: `background.scripts` + `browser_specific_settings` |
| `build.ps1` | Merges base + target into `manifest.json`, packages into `dist/` |
| `dist/` | Build output. **Gitignored, regenerated, never edit by hand.** |
| `releases/` | Zips of shipped versions, kept for trace-back (see `releases/README.md`) |
| `store-assets/` | Listing images, screenshots, promos. **Not** shipped in the zip |
| `design/` | Icon master artwork the PNGs are rendered from |

The manifest merge is **shallow**, at the top level only. The two manifests differ solely in
`background` and `browser_specific_settings` — both top-level keys — so this is sufficient
and keeps the result easy to audit.

## The golden rule

> **Chromium (Chrome/Edge/Opera/Brave) requires `background.service_worker`.**
> Submitting the `background.scripts` build (the Firefox one) to a Chromium store means the
> service worker never runs, and the review fails. This is exactly what happened to Opera v1.0.0.

The `targets/` structure exists so **this cannot happen again**: there is no longer a manual
"which folder do I upload" step — the build stamps the correct `background` block per target.

## Build

```powershell
.\build.ps1                                  # build both targets
.\build.ps1 -Target chromium                 # a single target
.\build.ps1 -Target firefox -Version 1.0.0   # reproduce a historical release
```

One `chromium` package covers **Chrome + Edge + Opera + Brave**; the `firefox` package is
for **AMO**.

`-Version` only changes the version stamped into the package; it does **not** edit
`manifest.base.json`.

## Release process

1. Edit code in `src/`
2. Bump `version` in **`manifest.base.json`** (one place, all stores)
3. `.\build.ps1`
4. Load `dist/` into the browser and test for real
5. Submit to the stores
6. Copy the submitted zips into `releases/v<version>/`, commit, then `git tag v<version>`

> Stores reject a version that matches one already submitted — always bump before resubmitting.

## Store status (updated 2026-08-05)

| Store | Engine | Live version | Status |
|---|---|---|---|
| Firefox AMO | Gecko | 1.0.0 | ✅ Approved — should be updated to 1.1.0 |
| Edge | Chromium | 1.0.1 | ✅ Approved |
| Opera | Chromium | — | ⏳ 1.0.1 awaiting moderation |
| Chrome Web Store | Chromium | — | ⏳ 1.1.0 submitted, awaiting review |

## Known maintenance notes

- **`upgradeToOriginal()` exists in two places** — `src/content.js` and `src/popup.js`. The
  popup copy is what makes previously-saved thumbnails still download at full size. Change one,
  change the other.
- **`description` in `manifest.base.json` is 130 characters**, against a 132-character limit.
  There is almost no headroom; count before editing it.
- v1.1.0 added the `contextMenus` permission. It generates **no user-facing warning**, so
  auto-updates will not be disabled — but Firefox and Edge will still **re-review** the update.
