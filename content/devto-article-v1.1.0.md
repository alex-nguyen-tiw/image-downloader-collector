---
title: Thumbnail vs Original — why most image downloaders fail on Etsy and Amazon
published: true
tags: javascript, webdev, chrome, webextension
---

I build graphic apparel designs at [Tshirts I Want](https://tshirtsiwant.com/), which means I spend a lot of time studying product photos on Etsy and Amazon.

For a while I used an off-the-shelf image downloader. Then I opened one of the saved files and it was **570 pixels wide**. The listing had shown me a crisp, zoomable photo — but what landed on my drive was a thumbnail.

That turned out not to be a bug in that extension. It is what almost every image downloader does, and the reason is more interesting than it first looks.

## The problem: the URL you can see is not the URL you want

The naive approach to downloading an image is to read `img.src` and fetch it. On a modern e-commerce site that gives you the wrong file, for three separate reasons.

**1. `srcset` means there are many URLs, not one.** The browser picks a candidate based on viewport and DPR. `img.src` is just the fallback.

**2. CDNs encode size in the URL.** `?w=400&dpr=2` or a path segment. The original exists at the same address without those parameters.

**3. Big retailers hide the real file behind DOM attributes.** The `<img>` you see is deliberately small; the high-resolution URL sits in a data attribute that the zoom widget reads on demand.

Point 3 is the one that bites hardest, and each site does it differently.

## Amazon: the size is baked into the filename

Amazon image URLs look like this:

```
https://m.media-amazon.com/images/I/71abcd1234._AC_SL1500_.jpg
```

That `._AC_SL1500_` chunk is a stack of transformation flags. Strip it and you get the original upload:

```
https://m.media-amazon.com/images/I/71abcd1234.jpg
```

```js
if (/(media-amazon|images-amazon|ssl-images-amazon)\.com$/i.test(host)) {
  u.pathname = u.pathname.replace(
    /(\/images\/I\/[^/]+?)\.[^/.]+(\.(?:jpg|jpeg|png|gif|webp))$/i,
    '$1$2'
  );
  return u.origin + u.pathname; // also drop the query string
}
```

The regex has to be careful: image IDs can contain `+`, and there may be several flag groups. It matches the *last* flag block before the extension rather than assuming a fixed shape.

Amazon also exposes the real thing directly in the DOM, which is more reliable than rewriting a URL when it is available:

- `data-old-hires` — a single hi-res URL
- `data-a-dynamic-image` — a JSON map of `{ url: [width, height] }`

So the lookup order is: read `data-old-hires`, else parse `data-a-dynamic-image` and take the largest area, else fall back to rewriting the URL.

## Etsy: one token in the path

Etsy is simpler. The size lives in a filename token:

```
il_570xN.1234567890_abcd.jpg   →   il_fullxfull.1234567890_abcd.jpg
```

```js
if (/etsystatic\.com$/i.test(host)) {
  u.pathname = u.pathname.replace(/_\d+x(?:N|\d+)\./i, '_fullxfull.');
  return u.origin + u.pathname;
}
```

The `(?:N|\d+)` matters — Etsy uses both `il_570xN` and `il_1588x1588`.

## The trap: don't "clean" a signed URL

The obvious generalisation is to strip every size-looking query parameter. That breaks a whole class of sites.

Plenty of CDNs sign their URLs. The signature is computed **over the full query string**, so deleting `w=400` invalidates the token and you get a 403 instead of a bigger image.

```js
const signedKeys = ['sig', 'signature', 'token', 'expires',
                    'expiry', 's', 'hmac', 'policy', 'key-pair-id'];
if (signedKeys.some(k => u.searchParams.has(k))) return u.href; // hands off
```

Detect a signature, return the URL untouched. A slightly smaller image beats a broken download.

## Two rendering problems worth knowing about

Extracting the URL was only half the work. Injecting UI into arbitrary websites has its own hazards.

**Page CSS will wreck your buttons.** My round 28px buttons rendered as ovals on some sites. Site stylesheets are full of rules like `button { width: 100% }`, and `!important` only gets you so far — there is always another property you did not think to lock down.

The fix is to stop fighting and take the UI out of reach, in a shadow root:

```js
hostEl = document.createElement('div');
hostEl.style.cssText = 'all: initial;';
document.body.appendChild(hostEl);
shadowRoot = hostEl.attachShadow({ mode: 'open' });

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = chrome.runtime.getURL('content.css');
shadowRoot.appendChild(link);
```

The stylesheet has to be listed in `web_accessible_resources` for the content script to load it this way. Page CSS now cannot reach the buttons at all.

**Product grids hide the image under a link.** On many listing pages the hover target is a transparent `<a>` stretched over the card, so `event.target` is never the `<img>` and no icons appear.

`document.elementsFromPoint()` solves it — it returns the whole stack under the cursor, so you can look past the overlay:

```js
const stack = document.elementsFromPoint(x, y);
for (const el of stack.slice(0, 12)) {
  if (el.tagName === 'IMG' && !isVideoContext(el)) return el;
}
```

The `isVideoContext` check exists because YouTube renders its poster frame as a CSS background image, and without it the extension offered to download the "image" of a video player.

## Zipping in the browser without a library

Batch download produces a single archive. Pulling in JSZip for this felt heavy, and the ZIP format's stored (uncompressed) mode is genuinely small to implement: a local header per entry, a central directory, an end-of-central-directory record, and CRC-32 over each file.

Images are already compressed, so `STORE` costs almost nothing in size and keeps the writer to a couple of hundred lines with no dependency.

One MV3 detail: `URL.createObjectURL` is not available in a service worker, so the archive is built in the popup and handed to `chrome.downloads.download()` from there.

## What the extension does today

It ended up as **Image Downloader & Collector**, free, on Chrome, Edge, Firefox, Opera and Brave:

- Hover any image, or right-click it, to download the **original** or save it to a folder
- A switch to hide the hover icons entirely — the right-click menu keeps working, so nothing is lost
- Folders you can file images into while browsing, without downloading anything yet
- Batch export a collection as one ZIP, folders preserved, with a `sources.csv` recording where every image came from
- Everything local: `chrome.storage.local`, no account, no server, no tracking

```json
{
  "manifest_version": 3,
  "name": "Image Downloader & Collector - Batch Save",
  "permissions": ["storage", "downloads", "contextMenus"],
  "host_permissions": ["<all_urls>"]
}
```

The source-tracking part came from a user who asked for it after the first release — they wanted to trace a saved reference back to the listing it came from months later. Their images already had the data attached; the extension had been recording it since v1.0.0 and simply never showed it.

## Try it

- **Chrome Web Store / Edge / Firefox add-ons** — search "Image Downloader & Collector"
- **Source and build setup:** [github.com/alex-nguyen-tiw/image-downloader-collector](https://github.com/alex-nguyen-tiw/image-downloader-collector)
- Built by [Tshirts I Want](https://tshirtsiwant.com/)

If you know another site that hides its originals behind an unusual attribute, tell me in the comments — site-specific rules are cheap to add and that is exactly the kind of thing that is hard to discover alone.
