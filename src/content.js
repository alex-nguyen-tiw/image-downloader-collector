// Content Script for Image Collector & Batch Downloader

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__imageCollectorInjected) return;
  window.__imageCollectorInjected = true;

  let currentHoveredEl = null;
  let overlayEl = null;
  let folderDropdownEl = null;
  let activeFolders = [];
  let toastContainer = null;
  let hideTimer = null;
  let hostEl = null;
  let shadowRoot = null;
  // Whether the hover icons are shown. Toggled from the popup; the context
  // menu keeps working regardless, so users can turn the icons off and still
  // download/save via right-click.
  let hoverEnabled = true;
  // The element the user last right-clicked, so the context menu can resolve
  // the original image URL from the DOM instead of the thumbnail Chrome
  // reports in info.srcUrl.
  let lastContextEl = null;

  // Render all UI inside a Shadow DOM so the host page's CSS can never
  // reach it (keeps the icons at a fixed shape/size on every site).
  function ensureShadowHost() {
    if (shadowRoot) return shadowRoot;
    hostEl = document.createElement('div');
    hostEl.id = 'ic-shadow-host';
    // Neutralise inherited/page styles; keep it out of layout flow.
    hostEl.style.cssText = 'all: initial;';
    (document.body || document.documentElement).appendChild(hostEl);

    shadowRoot = hostEl.attachShadow({ mode: 'open' });
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('content.css');
    shadowRoot.appendChild(link);
    return shadowRoot;
  }

  // Initialize Toast Container
  function initToastContainer() {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'ic-toast-container';
      ensureShadowHost().appendChild(toastContainer);
    }
  }

  function showToast(message, subtext = '', type = 'success') {
    initToastContainer();
    const toast = document.createElement('div');
    toast.className = `ic-toast ic-toast-${type}`;
    toast.innerHTML = `
      <div class="ic-toast-icon">${type === 'success' ? '✓' : 'ℹ'}</div>
      <div class="ic-toast-body">
        <div class="ic-toast-title">${escapeHtml(message)}</div>
        ${subtext ? `<div class="ic-toast-subtext">${escapeHtml(subtext)}</div>` : ''}
      </div>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('ic-toast-show'), 10);

    setTimeout(() => {
      toast.classList.remove('ic-toast-show');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Load folders from storage
  function refreshFolders() {
    chrome.storage.local.get(['folders'], (res) => {
      if (res.folders && Array.isArray(res.folders)) {
        activeFolders = res.folders;
      } else {
        activeFolders = [{ id: 'default', name: 'Default', isDefault: true }];
      }
    });
  }
  refreshFolders();

  // Absent key means enabled — the feature is on by default.
  chrome.storage.local.get(['hoverEnabled'], (res) => {
    hoverEnabled = res.hoverEnabled !== false;
  });

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.folders) {
      activeFolders = changes.folders.newValue || [];
    }
    // Applies immediately to every open tab — no page reload needed.
    if (changes.hoverEnabled) {
      hoverEnabled = changes.hoverEnabled.newValue !== false;
      if (!hoverEnabled) hideOverlay();
    }
  });

  // Extract the best original image URL, then upgrade it to full resolution
  // using site-specific rules (Etsy / Amazon serve thumbnails by default).
  function getOriginalImageUrl(imgEl) {
    if (!imgEl) return '';

    // Amazon exposes the true hi-res URL directly in DOM attributes — use it
    // before falling back to the (thumbnail) src.
    const amazonHiRes = getAmazonDomHiRes(imgEl);
    if (amazonHiRes) return upgradeToOriginal(amazonHiRes);

    return upgradeToOriginal(extractRawUrl(imgEl));
  }

  // Amazon product pages carry the large image in data attributes:
  //   data-old-hires        → a single hi-res URL
  //   data-a-dynamic-image  → JSON map of { url: [width, height] }
  function getAmazonDomHiRes(imgEl) {
    if (!/(^|\.)amazon\./i.test(window.location.hostname)) return '';
    if (typeof imgEl.getAttribute !== 'function') return '';

    const hires = imgEl.getAttribute('data-old-hires');
    if (hires && hires.trim() && !hires.startsWith('data:image')) {
      return makeAbsoluteUrl(hires.trim());
    }

    const dyn = imgEl.getAttribute('data-a-dynamic-image');
    if (dyn) {
      try {
        const map = JSON.parse(dyn);
        let best = '';
        let bestArea = -1;
        for (const url in map) {
          const dims = map[url] || [];
          const area = (dims[0] || 0) * (dims[1] || 0);
          if (area >= bestArea) { bestArea = area; best = url; }
        }
        if (best) return makeAbsoluteUrl(best);
      } catch (e) {}
    }
    return '';
  }

  function extractRawUrl(imgEl) {
    // 1. Check data attributes for high-res source
    const dataAttrs = ['data-old-hires', 'data-original', 'data-src-large', 'data-high-res', 'data-zoom-image', 'data-full-url', 'data-src', 'data-actualsrc'];
    for (const attr of dataAttrs) {
      const val = imgEl.getAttribute && imgEl.getAttribute(attr);
      if (val && val.trim() && !val.startsWith('data:image')) {
        return makeAbsoluteUrl(val.trim());
      }
    }

    // 2. Check srcset for highest width or pixel density
    const srcset = imgEl.getAttribute && imgEl.getAttribute('srcset');
    if (srcset) {
      const candidates = srcset.split(',').map(item => {
        const parts = item.trim().split(/\s+/);
        const url = parts[0];
        const descriptor = parts[1] || '1x';
        let val = 1;
        if (descriptor.endsWith('w')) {
          val = parseInt(descriptor.slice(0, -1), 10) || 1;
        } else if (descriptor.endsWith('x')) {
          val = (parseFloat(descriptor.slice(0, -1)) || 1) * 1000;
        }
        return { url, val };
      });
      candidates.sort((a, b) => b.val - a.val);
      if (candidates.length > 0 && candidates[0].url) {
        return makeAbsoluteUrl(candidates[0].url);
      }
    }

    // 3. Check if wrapped inside <a> link pointing to image
    const parentLink = imgEl.closest && imgEl.closest('a');
    if (parentLink && parentLink.href) {
      const href = parentLink.href.split('?')[0].split('#')[0];
      if (/\.(jpg|jpeg|png|webp|gif|svg|avif|bmp)$/i.test(href)) {
        return parentLink.href;
      }
    }

    // 4. Fallback to src / currentSrc
    let src = imgEl.currentSrc || imgEl.src;
    if (src && !src.startsWith('data:image')) {
      // Clean common CDN query parameters for thumbnail scaling
      return cleanCdnUrl(src);
    }

    // 5. CSS background-image (for elements that aren't <img>)
    try {
      const bg = window.getComputedStyle(imgEl).backgroundImage;
      if (bg && bg !== 'none') {
        const match = bg.match(/url\((['"]?)(.*?)\1\)/);
        if (match && match[2] && !match[2].startsWith('data:image')) {
          return cleanCdnUrl(makeAbsoluteUrl(match[2]));
        }
      }
    } catch (e) {}

    return src || '';
  }

  // Rewrite a thumbnail URL to its original/full-resolution form per site.
  function upgradeToOriginal(url) {
    if (!url) return url;
    try {
      const u = new URL(url, window.location.href);
      const host = u.hostname;

      // AMAZON — image hosts embed size flags in the filename:
      //   /images/I/<id>._AC_SL1500_.jpg  →  /images/I/<id>.jpg
      if (/(media-amazon|images-amazon|ssl-images-amazon)\.com$/i.test(host) || /images-(na|eu|fe|cn)\./i.test(host)) {
        u.pathname = u.pathname.replace(
          /(\/images\/I\/[^/]+?)\.[^/.]+(\.(?:jpg|jpeg|png|gif|webp))$/i,
          '$1$2'
        );
        return u.origin + u.pathname; // drop query (size params)
      }

      // ETSY — the size token in the filename controls resolution:
      //   il_570xN.123_abc.jpg  →  il_fullxfull.123_abc.jpg
      if (/etsystatic\.com$/i.test(host)) {
        u.pathname = u.pathname.replace(/_\d+x(?:N|\d+)\./i, '_fullxfull.');
        return u.origin + u.pathname;
      }
    } catch (e) {}
    return url;
  }

  function makeAbsoluteUrl(url) {
    try {
      return new URL(url, window.location.href).href;
    } catch (e) {
      return url;
    }
  }

  function cleanCdnUrl(url) {
    try {
      const u = new URL(url);

      // If the URL is signed/tokenized, don't touch it — stripping params breaks it.
      const signedKeys = ['sig', 'signature', 'token', 'expires', 'expiry', 's', 'hmac', 'policy', 'key-pair-id'];
      const hasSignature = signedKeys.some(k => u.searchParams.has(k));
      if (hasSignature) return u.href;

      // Remove common width/height/resize query params so we get the original size,
      // just like opening the raw image URL in a new tab.
      const sizeParams = [
        'w', 'width', 'h', 'height', 'resize', 'size', 'fit',
        'sw', 'sh', 'wid', 'hei', 'rw', 'rh', 'maxwidth', 'maxheight',
        'dpr', 'crop', 'thumbnail', 'thumb', 'preview'
      ];
      sizeParams.forEach(p => u.searchParams.delete(p));
      return u.href;
    } catch (e) {
      return url;
    }
  }

  // Create Overlay UI
  function createOverlay() {
    if (overlayEl) return;

    overlayEl = document.createElement('div');
    overlayEl.id = 'ic-hover-overlay';
    overlayEl.className = 'ic-overlay-hidden';

    overlayEl.innerHTML = `
      <div class="ic-overlay-bar">
        <button class="ic-btn ic-btn-download" title="Download original image" aria-label="Download">
          <svg class="ic-icon" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
        </button>
        <button class="ic-btn ic-btn-save" title="Save to collection" aria-label="Save">
          <svg class="ic-icon" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
        </button>
      </div>
      <div class="ic-folder-dropdown ic-dropdown-hidden"></div>
    `;

    ensureShadowHost().appendChild(overlayEl);

    // Event handlers for overlay buttons
    const downloadBtn = overlayEl.querySelector('.ic-btn-download');
    const saveBtn = overlayEl.querySelector('.ic-btn-save');
    folderDropdownEl = overlayEl.querySelector('.ic-folder-dropdown');

    downloadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      downloadElement(currentHoveredEl);
    });

    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      toggleFolderDropdown();
    });

    // Mouse over overlay keeps overlay visible
    overlayEl.addEventListener('mouseenter', () => {
      if (hideTimer) clearTimeout(hideTimer);
    });

    overlayEl.addEventListener('mouseleave', () => {
      scheduleHideOverlay();
    });
  }

  function toggleFolderDropdown() {
    if (!folderDropdownEl) return;
    const isHidden = folderDropdownEl.classList.contains('ic-dropdown-hidden');
    if (isHidden) {
      renderFolderDropdown();
      folderDropdownEl.classList.remove('ic-dropdown-hidden');
    } else {
      folderDropdownEl.classList.add('ic-dropdown-hidden');
    }
  }

  function renderFolderDropdown() {
    if (!folderDropdownEl) return;
    refreshFolders();

    let html = `<div class="ic-dropdown-header">Select Folder</div>`;
    if (activeFolders.length === 0) {
      activeFolders = [{ id: 'default', name: 'Default', isDefault: true }];
    }

    activeFolders.forEach(folder => {
      html += `
        <div class="ic-dropdown-item" data-folder-id="${folder.id}" data-folder-name="${escapeHtml(folder.name)}">
          <svg class="ic-item-icon" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
          <span>${escapeHtml(folder.name)}</span>
        </div>
      `;
    });

    folderDropdownEl.innerHTML = html;

    folderDropdownEl.querySelectorAll('.ic-dropdown-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const folderId = item.getAttribute('data-folder-id');
        const folderName = item.getAttribute('data-folder-name');
        saveImageToFolder(folderId, folderName);
        folderDropdownEl.classList.add('ic-dropdown-hidden');
      });
    });
  }

  // Download the original (not the displayed thumbnail) behind an element.
  // Shared by the hover button and the context menu.
  function downloadElement(el) {
    if (!el) return false;
    const imgUrl = getOriginalImageUrl(el);
    if (!imgUrl) return false;

    const title = el.alt || document.title || 'Image';
    chrome.runtime.sendMessage({
      action: 'DOWNLOAD_SINGLE',
      url: imgUrl,
      filename: title
    }, () => {
      showToast('Download started', title, 'success');
    });
    return true;
  }

  function saveImageToFolder(folderId, folderName) {
    saveElementToFolder(currentHoveredEl, folderId, folderName);
  }

  function saveElementToFolder(el, folderId, folderName) {
    if (!el) return false;
    const imgUrl = getOriginalImageUrl(el);
    if (!imgUrl) return false;

    const title = el.alt || el.title || document.title || 'Saved Image';
    const width = el.naturalWidth || el.clientWidth || 0;
    const height = el.naturalHeight || el.clientHeight || 0;

    const newItem = {
      id: 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      url: imgUrl,
      title: title,
      sourceUrl: window.location.href,
      sourceDomain: window.location.hostname,
      folderId: folderId || 'default',
      folderName: folderName || 'Default',
      width: width,
      height: height,
      createdAt: Date.now()
    };

    chrome.storage.local.get(['savedImages'], (res) => {
      const savedImages = res.savedImages || [];
      // Check duplicate URL in same folder
      const exists = savedImages.some(img => img.url === newItem.url && img.folderId === newItem.folderId);
      if (exists) {
        showToast('Already in collection', `Folder: ${folderName}`, 'info');
        return;
      }

      savedImages.unshift(newItem);
      chrome.storage.local.set({ savedImages }, () => {
        showToast('Saved to Collection!', `Folder: ${folderName}`, 'success');
      });
    });
    return true;
  }

  function positionOverlay(el) {
    if (!overlayEl || !el) return;
    const rect = el.getBoundingClientRect();
    
    // Ignore small thumbnails, logos, or hidden images
    if (rect.width < 60 || rect.height < 60) {
      hideOverlay();
      return;
    }

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    const top = rect.top + scrollTop + 8;
    const right = (window.innerWidth - (rect.right + scrollLeft)) + 8;

    overlayEl.style.top = `${top}px`;
    overlayEl.style.right = `${right}px`;
    overlayEl.classList.remove('ic-overlay-hidden');
  }

  function hideOverlay() {
    if (overlayEl) {
      overlayEl.classList.add('ic-overlay-hidden');
      if (folderDropdownEl) folderDropdownEl.classList.add('ic-dropdown-hidden');
    }
  }

  function scheduleHideOverlay() {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      hideOverlay();
    }, 400);
  }

  // Skip video players: a <video>, anything inside one, or a container that
  // wraps a <video> (e.g. YouTube uses a poster image as the element's
  // background-image, which would otherwise trigger the overlay).
  function isVideoContext(el) {
    if (!el || typeof el.closest !== 'function') return false;
    if (el.tagName === 'VIDEO') return true;
    if (el.closest('video')) return true;
    // Container holding a video (player shell with a poster background)
    if (typeof el.querySelector === 'function' && el.querySelector('video')) return true;
    return false;
  }

  function hasBgImage(el) {
    try {
      const bg = window.getComputedStyle(el).backgroundImage;
      return bg && bg !== 'none' && bg.startsWith('url(');
    } catch (e) {
      return false;
    }
  }

  // Find an image directly under the cursor even when a transparent link or
  // overlay element sits on top of it (common on product-grid home pages).
  function findImageUnderCursor(x, y) {
    let stack;
    try {
      stack = document.elementsFromPoint(x, y);
    } catch (e) {
      return null;
    }
    const scan = stack.slice(0, 12);
    // Prefer a real <img>
    for (const el of scan) {
      if (!el || el === hostEl) continue;
      if (el.tagName === 'IMG' && !isVideoContext(el)) return el;
    }
    // Otherwise a background-image element
    for (const el of scan) {
      if (!el || el === hostEl) continue;
      if (isVideoContext(el)) continue;
      if (hasBgImage(el)) return el;
    }
    return null;
  }

  // Resolve which element (if any) the overlay should attach to
  function resolveImageEl(target, x, y) {
    if (!target || target === hostEl || isVideoContext(target)) return null;
    if (target.tagName === 'IMG') return target;
    if (hasBgImage(target)) return target;
    return findImageUnderCursor(x, y);
  }

  // Mouse Listener on Page
  document.addEventListener('mouseover', (e) => {
    if (!hoverEnabled) return;

    // Pointer is over our own UI (all shadow events retarget to the host):
    // keep the overlay visible and do nothing else.
    if (e.target === hostEl) {
      if (hideTimer) clearTimeout(hideTimer);
      return;
    }

    const el = resolveImageEl(e.target, e.clientX, e.clientY);
    if (!el) return;

    currentHoveredEl = el;
    if (hideTimer) clearTimeout(hideTimer);
    createOverlay();
    positionOverlay(el);
  }, true);

  // Any mouse-out schedules a hide; a subsequent mouseover on another image
  // (or entering the overlay itself) cancels it. This works even when the
  // hovered image is covered by a transparent link/overlay element.
  document.addEventListener('mouseout', () => {
    scheduleHideOverlay();
  }, true);

  window.addEventListener('scroll', () => {
    if (currentHoveredEl) {
      positionOverlay(currentHoveredEl);
    }
  }, { passive: true });

  // --- Context menu support -------------------------------------------------
  // Remember what was right-clicked. Chrome's info.srcUrl only ever holds the
  // URL the page is displaying (a thumbnail on Amazon/Etsy), so we resolve the
  // real original from the element itself instead. Runs on capture so we still
  // see the target when a page stops the event.
  document.addEventListener('contextmenu', (e) => {
    lastContextEl = resolveImageEl(e.target, e.clientX, e.clientY);
  }, true);

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'CTX_DOWNLOAD' || request.action === 'CTX_SAVE') {
      if (!lastContextEl) {
        showToast('No image found here', 'Try right-clicking the image itself', 'info');
        sendResponse({ handled: false });
        return true;
      }

      const ok = request.action === 'CTX_DOWNLOAD'
        ? downloadElement(lastContextEl)
        : saveElementToFolder(lastContextEl, request.folderId, request.folderName);

      if (!ok) showToast('Could not read that image', '', 'info');
      sendResponse({ handled: ok });
      return true;
    }
  });

  // Create the shadow host eagerly so the stylesheet is loaded before the
  // first hover (avoids a brief unstyled flash).
  ensureShadowHost();

})();
