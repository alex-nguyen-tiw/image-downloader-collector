# Changelog

Every version has a git tag (`git show v1.1.0`) and a packaged zip under `releases/`.

---

## 1.1.0 — 2026-08-05

### Added

**Hover-icon on/off switch**
A **Hover icons** switch in the dashboard header. Turning it off removes the Download/Save
icons from every page **immediately, with no tab reload**. The extension stays fully active —
the right-click menu and the dashboard are unaffected — so turning the icons off does not
cost you any functionality.

**Right-click menu**
```
Image Collector ▸ Download original image
                ▸ Save to collection ▸ [Default / your folders / …]
```
The folder submenu stays in sync with the folders created in the dashboard.

The menu deliberately does **not** download the URL the browser reports for the image — on
Amazon and Etsy that is the on-screen thumbnail. Instead the content script resolves the
original from the page's own DOM, reusing the same rules as the hover button.

The menu registers for both the `image` and `link` contexts, because product-grid pages
commonly lay a transparent `<a>` over the image, which the browser then reports as a link
rather than an image.

**Source tracking**
- A clickable domain badge in the bottom-left of each card that reopens the source page
- The search box filters by domain (e.g. type `etsy.com`)
- Every ZIP export ships a `sources.csv`: filename, title, folder, source_domain,
  source_url, saved_at — CRLF plus a UTF-8 BOM so Excel opens non-ASCII titles correctly

> `sourceUrl`/`sourceDomain` have been recorded since v1.0.0 but were never displayed.
> **Existing collections therefore show their sources immediately after updating**, with no
> migration and nothing lost.

### Changed
- New logo across every icon size (16/32/48/128, plus 64/300 for store listings)
- The popup version label now reads from the manifest instead of a hardcoded string

### Permissions
- Added `contextMenus`, solely to create the right-click menu entries. It reads no additional
  page content and requires no new host permission.

---

## 1.0.1

The first valid Chromium build. No feature changes from 1.0.0.

- Fixes the defect that failed Opera v1.0.0: the Gecko manifest (`background.scripts`) had been
  submitted to a Chromium store, so the service worker never ran. The Chromium build now uses
  `background.service_worker`.
- **Stores:** Edge approved · Opera awaiting moderation

---

## 1.0.0

Initial release.

- Hover any image to Download or Save it into a custom folder
- High-resolution original extraction from `srcset` / `data-src` / CDN parameters, with
  dedicated rules for Amazon (`data-old-hires`, `data-a-dynamic-image`) and Etsy
  (`il_fullxfull`)
- Dashboard with folder management, search, and multi-select
- Batch download as a single `.zip` (hand-written ZIP writer, no external libraries)
- The overlay UI lives in a Shadow DOM, so page CSS cannot distort the icons
- Video players (YouTube and similar) are skipped so icons never appear over them
- **Stores:** Firefox approved
