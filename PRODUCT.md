# Image Downloader & Collector — Product Source of Truth

> **This is the single source** for every piece of product content: blog posts, store
> descriptions, landing pages, social posts. All marketing copy must come from this file.
> When a feature changes, **update this file first**, then copy outward.
>
> Current as of **v1.1.0** — 2026-08-05
> Related: [`CHANGELOG.md`](CHANGELOG.md) · [`store-assets/README.md`](store-assets/README.md) (reviewer permission notes)

---

## 1. Positioning

**Full name:** Image Downloader & Collector - Batch Save
**Short name (used in the UI and right-click menu):** Image Collector
**Publisher:** Tshirts I Want — https://tshirtsiwant.com/
**Platforms:** Chrome · Microsoft Edge · Opera · Brave · Firefox
**Technical:** Manifest V3

### One-liner
> Save and batch-download the **original** image behind any thumbnail — organised into folders, with every source URL kept.

### Elevator pitch (two sentences)
> Image Collector lets you hover or right-click any image on the web to download the true original file — not the compressed thumbnail the page is showing you. Save images into custom folders as you browse, then export an entire collection as a single ZIP with a CSV of where every image came from.

### Core differentiator
Most image downloaders grab whatever URL the page is displaying — which is a thumbnail.
Image Collector **resolves the original from the page's DOM**, with dedicated rules for the
major sites. This is the point to lead with in any piece of writing:
**"original, not thumbnail."**

---

## 2. Audience

| Segment | Need | Matching message |
|---|---|---|
| **Print-on-demand seller / T-shirt designer** | Collect mockups, research what sells on Etsy and Amazon | "Research competitor listings without losing track of where each design came from" |
| **Graphic designer / illustrator** | Build mood boards and reference libraries | "Build a reference library that still remembers its sources" |
| **Marketer / content creator** | Gather assets for posts and social | "Collect now, download the whole set as one ZIP later" |
| **Shopper / product researcher** | Save high-quality product photos | "Get the full-resolution product photo, not the listing thumbnail" |

---

## 3. Full feature list

### 3.1 Original-image extraction — the core feature
When downloading, the extension does **not** use the displayed URL. It works back to the
original in this order:

1. **Amazon-specific rules** — reads `data-old-hires` and `data-a-dynamic-image` (picking the
   largest-area candidate), and strips size modifiers from the path
   (`._AC_SL1500_.jpg` → `.jpg`)
2. **Etsy-specific rule** — upgrades `il_570xN.` → `il_fullxfull.`
3. **`data-*` attributes** — `data-src`, `data-original`, `data-high-res`, `data-full-url`,
   `data-zoom-image`, `data-src-large`, `data-actualsrc`, `data-old-hires`
4. **`srcset`** — picks the highest-resolution candidate
5. **Parent `<a>`** when it points at an image file
6. **`currentSrc` / `src`**, after stripping CDN size parameters
   (`w`, `width`, `h`, `height`, `resize`, `size`, `fit`, `dpr`, `crop`, `thumbnail`…)
7. **CSS `background-image`**, for images not inside an `<img>` tag

> **A detail worth mentioning in technical writing:** for signed URLs (`sig`, `token`,
> `expires`, `hmac`, `policy`…), the extension leaves the parameters alone, because rewriting
> them would break the link. It signals that the product was built carefully.

### 3.2 Three ways to act

| Method | Action | Notes |
|---|---|---|
| **Hover** | Move the pointer over an image → two round icons appear top-right | Only on images **60×60 px and larger**, so small icons and logos are left alone |
| **Right-click** | `Image Collector ▸ Download original image` or `▸ Save to collection ▸ [folder]` | Works on grid pages where a link overlay covers the image |
| **Dashboard** | Download button on each card | Re-download any saved image at any time |

### 3.3 Hover-icon on/off switch
A **Hover icons** switch in the dashboard header. Turning it off removes the icons from
**every open tab immediately, with no reload**. The extension stays fully active — the
right-click menu and dashboard are unaffected.

> A good story angle: people uninstall tools like this because the icons get in the way during
> other work. Here, turning the icons off **costs you nothing**.

### 3.4 Folders and collections
- Create any folders you like (*T-Shirt Ideas, Wallpapers, Client Work…*)
- File images into folders straight from the page, without opening the dashboard
- **Automatic duplicate detection**: saving the same image to the same folder reports
  "Already in collection"
- The sidebar shows a count per folder

### 3.5 Source tracking
Every saved image records the page it came from:
- A clickable **domain badge** in the bottom-left of each card → reopens the source page
- **Search by domain** in the search box (type `etsy.com` to filter)
- **`sources.csv`** inside every ZIP: `filename, title, folder, source_domain, source_url,
  saved_at` — CRLF plus a UTF-8 BOM so Excel renders accented characters correctly

> Source data has been recorded since **v1.0.0**, so existing users see sources immediately
> after updating to 1.1.0, with nothing lost.

### 3.6 Batch ZIP export
- **Download All (.zip)** or **Download Selected .zip**
- Inside the archive, images are **grouped into the same folders** as the collection
- File extensions are sniffed from magic bytes when the URL has none
- Duplicate filenames are numbered automatically
- `sources.csv` included
- Output filename: `image-collection-<timestamp>.zip`

### 3.7 Search and management
The search box matches **image title, source domain, and folder name** at once.
Select All, bulk delete, and per-image delete are available.

### 3.8 Polish worth calling out
These are the details other extensions get wrong — good material for a comparison piece:

- **The icons never get distorted.** All injected UI lives in its own Shadow DOM, out of reach
  of the website's CSS. The buttons stay perfectly round and correctly sized on every site.
- **No icons on videos.** Video players (YouTube and similar) are skipped, even when the poster
  frame is a CSS background image.
- **Finds images under overlays.** Product-grid pages often lay a transparent `<a>` over the
  image; the extension looks through it to find the image under the cursor.
- **Tidy downloads.** Files land in `ImageCollector/`, or `ImageCollector/<Folder name>/` when
  the image belongs to a folder.

---

## 4. User guide (reusable as a "how to" post)

### Install
1. Install from your browser's store
2. Pin the extension icon to the toolbar for quick access to the dashboard

### Save images while browsing
1. Hover any image → two icons appear in the top-right corner
2. Click 🔖 **Save** → choose a folder from the dropdown
3. A toast confirms the save

*Or:* right-click the image → **Image Collector ▸ Save to collection ▸** pick a folder.

### Download a single image
Hover the image → click ⬇ **Download**.
*Or:* right-click → **Image Collector ▸ Download original image**.

What lands on your drive is the **original**, not the thumbnail you were looking at.

### Turn the hover icons off
Open the dashboard → flip the **Hover icons** switch in the header. The icons disappear from
every tab at once. Right-click still works exactly as before.

### Manage collections and batch download
1. Click the extension icon to open the dashboard
2. Use the sidebar to move between **All Images** and your folders
3. **New Folder** creates a new category
4. Select individual images, or **Select All**
5. **Download All (.zip)** or **Download Selected .zip**
6. Unzip: images are grouped by folder, with `sources.csv` alongside

### Trace an image back to its source
- Click the domain badge in the bottom-left of a card → reopens the source page
- Type a domain into the search box to filter
- Open `sources.csv` from any ZIP in Excel or Google Sheets

---

## 5. FAQ (for blog and store use)

**Do I really get the original image?**
Yes. The extension reads the page's DOM attributes to find the original, rather than using the
URL being displayed. Amazon and Etsy have dedicated rules.

**Is any of my data sent anywhere?**
No. Your collections and folders live in `chrome.storage.local` on your own machine. No
account, no sign-in, no servers, no tracking.

**Do I lose features if I turn the hover icons off?**
No. The right-click menu and dashboard keep working in full.

**Will images I saved before the update show their source?**
Yes. Source information has been recorded since the first release.

**Does saving images use disk space?**
No. Saving to a collection only records the image's URL and metadata. Files are downloaded
only when you ask for them.

**Which browsers are supported?**
Chrome, Microsoft Edge, Opera, Brave and Firefox.

**Why does it need access to all websites?**
To detect images on hover and read high-resolution image attributes on any site. The extension
does not read, store, or transmit page content.

---

## 6. Paste-ready copy

> ⚠️ Character limits differ per platform and change over time — **re-count in the editor
> before submitting**. The counts below are measured, not estimated.

### Taglines (pick one)
```
Download the original, not the thumbnail.
```
```
Collect images. Keep the source. Export everything.
```
```
Hover, save, batch-download — in original quality.
```

### Short description — manifest `description` and store summary
**Chrome/Edge manifest limit: 132 characters.**

Currently in use (130 characters):
```
Powered by Tshirts I Want: Quick download & bookmark images into custom folders, then batch download graphic designs with 1-click.
```

Alternative leading with the differentiator (124 characters):
```
Hover or right-click any image to download the true original, save into folders, and batch-export a whole collection as ZIP.
```

Shortest option (98 characters):
```
Download original images, not thumbnails. Save into folders and batch-export them as a single ZIP.
```

### Medium description — AMO summary (250-character limit) · 244 characters
```
Image Collector saves and downloads the original image behind any thumbnail. Hover or right-click to grab it, organise images into custom folders as you browse, then export a whole collection as one ZIP — with a CSV of every image's source URL.
```

### Long description — store listing body
```
Image Downloader & Collector turns image hunting into a clean workflow.

WHY IT'S DIFFERENT
Most image downloaders grab whatever URL the page is displaying — which is usually a compressed thumbnail. Image Collector resolves the real original from the page itself, with dedicated rules for Amazon and Etsy, so what lands on your drive is the full-quality file.

HOVER OR RIGHT-CLICK
Hover any image to reveal a small Download and Save button in the corner. Prefer a cleaner page? Turn the hover icons off with one switch and use the right-click menu instead — Image Collector > Download original image, or Save to collection and pick a folder. Nothing is lost either way.

ORGANISE AS YOU BROWSE
Create folders like "T-Shirt Ideas", "Client Work" or "Wallpapers" and file images into them straight from the page. Saving a bookmark costs no disk space — files are only downloaded when you ask for them. Duplicates are detected automatically.

NEVER LOSE THE SOURCE
Every saved image remembers the page it came from. Each card shows a clickable domain badge that reopens the original page, you can search your collection by domain, and every ZIP export includes a sources.csv listing the filename, title, folder, domain, source URL and save date. Your reference library stays traceable months later.

BATCH EXPORT
Select some images or take the whole collection and download it as a single ZIP. Images are grouped into folders inside the archive exactly as you organised them.

BUILT WITH CARE
The on-page buttons live in an isolated shadow root, so no website's CSS can distort them. Video players are skipped. Images sitting underneath transparent link overlays — common on product grids — are still detected.

PRIVACY FIRST
No account, no sign-in, no servers, no tracking. Everything stays in your browser's local storage.

Powered by Tshirts I Want — https://tshirtsiwant.com/
```

### Feature bullets — landing page and social
```
• Downloads the true original image, not the on-screen thumbnail
• Dedicated support for Amazon and Etsy product images
• Hover buttons or right-click menu — your choice
• One switch to hide the hover icons without losing any feature
• Organise into custom folders while you browse
• Every image remembers its source page
• Batch-export a collection as a single ZIP, folders preserved
• sources.csv included in every export
• Search by image name, folder, or source domain
• 100% local — no account, no tracking
```

### Keywords / tags
```
image downloader, bulk image download, batch download images, save images,
original image, full resolution, high resolution images, image collector,
etsy image downloader, amazon image downloader, design inspiration,
mood board, print on demand, graphic assets, zip download, image organizer
```

---

## 7. Blog angles

1. **"Why your image downloader only saves thumbnails"** — the technical explainer: `srcset`,
   CDN size parameters, Amazon/Etsy DOM attributes. Highest SEO value, because it names a pain
   readers have felt but never articulated.
2. **"Researching Etsy competitors without losing your sources"** — a workflow piece for POD
   sellers, built around `sources.csv`.
3. **"Build a 200-image mood board in 10 minutes"** — a use-case piece on batch ZIP and folders.
4. **"A browser extension should know how to get out of the way"** — an opinion piece using the
   hover toggle as its example.

---

## 8. Boundaries — what must **never** be claimed

To avoid delisting or losing credibility, never claim:

- ❌ **"Downloads images from every website"** — sites using signed URLs or hotlink protection can fail.
- ❌ **"Bypasses image download protection / DRM"** — the extension does not do this, and stores forbid it.
- ❌ **"Downloads private Instagram / Facebook / Pinterest images"** — unverified and likely a policy violation.
- ❌ **"Upscales or enhances images"** — the extension fetches an existing original; it does **not** upscale.
- ❌ **"Download every image on a page in one click"** — images must be saved individually first;
  there is no whole-page scraping feature.
- ❌ Any feature that does not exist: manual tags, cloud sync, shared collections, video downloads.

Safe alternative phrasing: *"works across the web, with dedicated support for Amazon and Etsy"*.

---

## 9. Copyright note to include in long-form pieces

> Users are responsible for respecting the copyright and terms of use of the websites they
> visit. This tool is intended for lawful reference gathering and research.

---

## 10. Fixed facts

| Field | Value |
|---|---|
| Extension name | Image Downloader & Collector - Batch Save |
| Short name | Image Collector |
| Current version | 1.1.0 |
| Publisher | Tshirts I Want |
| Website | https://tshirtsiwant.com/ |
| Permissions | `storage`, `downloads`, `contextMenus`, `<all_urls>` |
| Data collection | None |
| Price | Free |
