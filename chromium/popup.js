// Popup Dashboard Script for Image Collector & Batch Downloader

document.addEventListener('DOMContentLoaded', () => {
  let folders = [];
  let savedImages = [];
  let currentFolderId = 'all';
  let searchQuery = '';
  let selectedImageIds = new Set();

  // DOM Elements
  const folderListEl = document.getElementById('folder-list');
  const imageGridEl = document.getElementById('image-grid');
  const emptyStateEl = document.getElementById('empty-state');
  const inputSearch = document.getElementById('input-search');
  const chkSelectAll = document.getElementById('chk-select-all');
  const btnDownloadSelected = document.getElementById('btn-download-selected');
  const countSelectedEl = document.getElementById('count-selected');
  const btnDeleteSelected = document.getElementById('btn-delete-selected');
  const btnBatchDownload = document.getElementById('btn-batch-download');
  const btnNewFolder = document.getElementById('btn-new-folder');

  // Modal Elements
  const modalFolder = document.getElementById('modal-folder');
  const inputFolderName = document.getElementById('input-folder-name');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelFolder = document.getElementById('btn-cancel-folder');
  const btnSaveFolder = document.getElementById('btn-save-folder');

  // Initialize Data
  function loadData() {
    chrome.storage.local.get(['folders', 'savedImages'], (res) => {
      folders = res.folders || [{ id: 'default', name: 'Default', isDefault: true }];
      savedImages = res.savedImages || [];
      renderFolders();
      renderImages();
    });
  }

  // Listen for storage updates
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.folders || changes.savedImages) {
      loadData();
    }
  });

  // Render Folder List Sidebar
  function renderFolders() {
    folderListEl.innerHTML = '';

    // "All Images" special item
    const totalCount = savedImages.length;
    const allItemHtml = `
      <div class="folder-item ${currentFolderId === 'all' ? 'active' : ''}" data-folder-id="all">
        <div class="folder-name-wrap">
          <svg class="folder-icon" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
          <span>All Images</span>
        </div>
        <span class="folder-count">${totalCount}</span>
      </div>
    `;
    folderListEl.insertAdjacentHTML('beforeend', allItemHtml);

    // Custom & Default Folders
    folders.forEach(folder => {
      const count = savedImages.filter(img => img.folderId === folder.id).length;
      const isSelected = currentFolderId === folder.id;
      const itemHtml = `
        <div class="folder-item ${isSelected ? 'active' : ''}" data-folder-id="${folder.id}">
          <div class="folder-name-wrap">
            <svg class="folder-icon" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
            <span>${escapeHtml(folder.name)}</span>
          </div>
          <span class="folder-count">${count}</span>
        </div>
      `;
      folderListEl.insertAdjacentHTML('beforeend', itemHtml);
    });

    // Attach Click Events to Folder Items
    folderListEl.querySelectorAll('.folder-item').forEach(item => {
      item.addEventListener('click', () => {
        currentFolderId = item.getAttribute('data-folder-id');
        selectedImageIds.clear();
        chkSelectAll.checked = false;
        renderFolders();
        renderImages();
      });
    });
  }

  // Filter images based on selected folder & search term
  function getFilteredImages() {
    return savedImages.filter(img => {
      const matchesFolder = currentFolderId === 'all' || img.folderId === currentFolderId;
      const matchesSearch = !searchQuery || 
        (img.title && img.title.toLowerCase().includes(searchQuery)) ||
        (img.sourceDomain && img.sourceDomain.toLowerCase().includes(searchQuery)) ||
        (img.folderName && img.folderName.toLowerCase().includes(searchQuery));
      return matchesFolder && matchesSearch;
    });
  }

  // Render Image Grid
  function renderImages() {
    const filtered = getFilteredImages();
    imageGridEl.innerHTML = '';

    if (filtered.length === 0) {
      emptyStateEl.classList.remove('hidden');
      imageGridEl.classList.add('hidden');
    } else {
      emptyStateEl.classList.add('hidden');
      imageGridEl.classList.remove('hidden');
    }

    filtered.forEach(img => {
      const isSelected = selectedImageIds.has(img.id);
      const dimensionText = (img.width && img.height) ? `${img.width}x${img.height}` : '';

      const card = document.createElement('div');
      card.className = `img-card ${isSelected ? 'selected' : ''}`;
      card.setAttribute('data-id', img.id);

      card.innerHTML = `
        <div class="img-preview-wrap">
          <input type="checkbox" class="img-card-select" ${isSelected ? 'checked' : ''}>
          <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.title || 'Saved Image')}" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' fill=\\'%23666\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%23333\\'/><text x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' fill=\\'%23aaa\\' font-size=\\'12\\'>Image Error</text></svg>'">
          ${dimensionText ? `<span class="img-dimension-tag">${dimensionText}</span>` : ''}
          <div class="img-card-actions">
            <button class="card-action-btn btn-single-dl" title="Download Image">
              <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            </button>
            <button class="card-action-btn btn-single-delete" title="Delete from collection">
              <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </div>
      `;

      // Select Checkbox Event
      const chk = card.querySelector('.img-card-select');
      chk.addEventListener('change', (e) => {
        e.stopPropagation();
        if (chk.checked) {
          selectedImageIds.add(img.id);
        } else {
          selectedImageIds.delete(img.id);
        }
        updateSelectionUI();
        renderImages();
      });

      // Single Download Event
      const btnDl = card.querySelector('.btn-single-dl');
      btnDl.addEventListener('click', (e) => {
        e.stopPropagation();
        chrome.runtime.sendMessage({
          action: 'DOWNLOAD_SINGLE',
          url: upgradeToOriginal(img.url),
          filename: img.title,
          folderName: img.folderName
        });
      });

      // Single Delete Event
      const btnDel = card.querySelector('.btn-single-delete');
      btnDel.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteImageById(img.id);
      });

      imageGridEl.appendChild(card);
    });

    updateSelectionUI();
  }

  function updateSelectionUI() {
    const filtered = getFilteredImages();
    const count = selectedImageIds.size;
    countSelectedEl.textContent = count;

    btnDownloadSelected.disabled = count === 0;
    btnDeleteSelected.disabled = count === 0;

    if (filtered.length > 0 && count === filtered.length) {
      chkSelectAll.checked = true;
    } else {
      chkSelectAll.checked = false;
    }
  }

  function deleteImageById(id) {
    savedImages = savedImages.filter(img => img.id !== id);
    selectedImageIds.delete(id);
    chrome.storage.local.set({ savedImages }, () => {
      renderFolders();
      renderImages();
    });
  }

  // Select All Checkbox Handler
  chkSelectAll.addEventListener('change', () => {
    const filtered = getFilteredImages();
    if (chkSelectAll.checked) {
      filtered.forEach(img => selectedImageIds.add(img.id));
    } else {
      selectedImageIds.clear();
    }
    renderImages();
  });

  // Search Input Handler
  inputSearch.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderImages();
  });

  // Batch Download Selected Handler → single .zip
  btnDownloadSelected.addEventListener('click', () => {
    const selectedItems = savedImages.filter(img => selectedImageIds.has(img.id));
    downloadAsZip(selectedItems);
  });

  // Batch Download All (Active Folder View) Handler → single .zip
  btnBatchDownload.addEventListener('click', () => {
    const filtered = getFilteredImages();
    downloadAsZip(filtered);
  });

  // Delete Selected Handler
  btnDeleteSelected.addEventListener('click', () => {
    if (selectedImageIds.size === 0) return;
    savedImages = savedImages.filter(img => !selectedImageIds.has(img.id));
    selectedImageIds.clear();
    chrome.storage.local.set({ savedImages }, () => {
      renderFolders();
      renderImages();
    });
  });

  // New Folder Modal Handlers
  btnNewFolder.addEventListener('click', () => {
    inputFolderName.value = '';
    modalFolder.classList.remove('hidden');
    inputFolderName.focus();
  });

  function closeModal() {
    modalFolder.classList.add('hidden');
  }

  btnCloseModal.addEventListener('click', closeModal);
  btnCancelFolder.addEventListener('click', closeModal);

  btnSaveFolder.addEventListener('click', () => {
    const name = inputFolderName.value.trim();
    if (!name) return;

    const newFolder = {
      id: 'folder_' + Date.now(),
      name: name,
      isDefault: false,
      createdAt: Date.now()
    };

    folders.push(newFolder);
    chrome.storage.local.set({ folders }, () => {
      closeModal();
      currentFolderId = newFolder.id;
      renderFolders();
      renderImages();
    });
  });

  function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ==========================================================================
  // Batch download → package everything into a single .zip
  // ==========================================================================

  let batchRunning = false;

  function setBatchStatus(text, kind = 'info') {
    let el = document.getElementById('batch-status');
    if (!el) {
      el = document.createElement('div');
      el.id = 'batch-status';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.className = `batch-status batch-status-${kind} show`;
  }

  function hideBatchStatus(delay = 3500) {
    setTimeout(() => {
      const el = document.getElementById('batch-status');
      if (el) el.classList.remove('show');
    }, delay);
  }

  async function downloadAsZip(items) {
    if (batchRunning) return;
    if (!items || items.length === 0) return;

    batchRunning = true;
    btnBatchDownload.disabled = true;
    btnDownloadSelected.disabled = true;

    const files = [];
    const usedNames = new Set();
    let ok = 0;
    let fail = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      setBatchStatus(`Fetching image ${i + 1} / ${items.length}...`);
      try {
        const bytes = await fetchImageBytes(item.url);
        let name = buildZipEntryName(item, i, bytes);
        // Ensure uniqueness inside the archive
        let unique = name;
        let n = 1;
        while (usedNames.has(unique.toLowerCase())) {
          const dot = name.lastIndexOf('.');
          unique = dot > 0 ? `${name.slice(0, dot)}_${n}${name.slice(dot)}` : `${name}_${n}`;
          n++;
        }
        usedNames.add(unique.toLowerCase());
        files.push({ name: unique, data: bytes });
        ok++;
      } catch (e) {
        console.warn('Failed to fetch', item.url, e);
        fail++;
      }
    }

    if (files.length === 0) {
      setBatchStatus('Download failed — no images could be fetched.', 'error');
      hideBatchStatus();
      resetBatchButtons();
      return;
    }

    setBatchStatus('Building zip archive...');
    try {
      const blob = buildZip(files);
      const blobUrl = URL.createObjectURL(blob);
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      chrome.downloads.download({
        url: blobUrl,
        filename: `ImageCollector/image-collection-${stamp}.zip`,
        saveAs: false
      }, () => {
        // Give the download time to read the blob before revoking
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      });
      setBatchStatus(`Done — ${ok} image(s) zipped${fail ? `, ${fail} failed` : ''}.`, fail ? 'error' : 'success');
    } catch (e) {
      console.error('Zip build failed', e);
      setBatchStatus('Failed to build zip archive.', 'error');
    }

    hideBatchStatus();
    resetBatchButtons();
  }

  function resetBatchButtons() {
    batchRunning = false;
    btnBatchDownload.disabled = false;
    updateSelectionUI();
  }

  async function fetchImageBytes(url) {
    const resp = await fetch(upgradeToOriginal(url), { credentials: 'omit' });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const buf = await resp.arrayBuffer();
    return new Uint8Array(buf);
  }

  // Rewrite a thumbnail URL to its original/full-resolution form per site.
  // (Kept in sync with the same helper in content.js so already-saved
  // thumbnails still download at full size.)
  function upgradeToOriginal(url) {
    if (!url) return url;
    try {
      const u = new URL(url);
      const host = u.hostname;
      if (/(media-amazon|images-amazon|ssl-images-amazon)\.com$/i.test(host) || /images-(na|eu|fe|cn)\./i.test(host)) {
        u.pathname = u.pathname.replace(
          /(\/images\/I\/[^/]+?)\.[^/.]+(\.(?:jpg|jpeg|png|gif|webp))$/i,
          '$1$2'
        );
        return u.origin + u.pathname;
      }
      if (/etsystatic\.com$/i.test(host)) {
        u.pathname = u.pathname.replace(/_\d+x(?:N|\d+)\./i, '_fullxfull.');
        return u.origin + u.pathname;
      }
    } catch (e) {}
    return url;
  }

  // Derive a safe filename + correct extension (sniff bytes if URL has none)
  function buildZipEntryName(item, index, bytes) {
    let ext = 'jpg';
    try {
      const clean = item.url.split('?')[0].split('#')[0];
      const m = clean.match(/\.(jpg|jpeg|png|webp|gif|svg|avif|bmp)$/i);
      if (m) ext = m[1].toLowerCase();
      else ext = sniffExtension(bytes) || ext;
    } catch (e) {}

    let base = (item.title || 'image').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40) || 'image';
    base = `${base}_${index + 1}`;

    const filename = `${base}.${ext}`;
    // Group inside the zip by folder, mirroring the collection structure
    if (item.folderName && item.folderName !== 'Default') {
      const safeFolder = item.folderName.replace(/[^a-zA-Z0-9 _-]/g, '_');
      return `${safeFolder}/${filename}`;
    }
    return filename;
  }

  // Detect image type from magic bytes when the URL has no extension
  function sniffExtension(b) {
    if (!b || b.length < 4) return null;
    if (b[0] === 0xFF && b[1] === 0xD8) return 'jpg';
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return 'png';
    if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return 'gif';
    if (b[0] === 0x42 && b[1] === 0x4D) return 'bmp';
    if (b.length > 11 && b[0] === 0x52 && b[1] === 0x49 && b[8] === 0x57 && b[9] === 0x45) return 'webp';
    return null;
  }

  // --- Minimal ZIP writer (STORE method, no external library) ---
  const crcTable = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xFF];
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function buildZip(entries) {
    const enc = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;

    for (const entry of entries) {
      const nameBytes = enc.encode(entry.name);
      const data = entry.data;
      const crc = crc32(data);
      const size = data.length;

      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true); // local file header signature
      local.setUint16(4, 20, true);         // version needed
      local.setUint16(6, 0x0800, true);     // flag: UTF-8 filenames
      local.setUint16(8, 0, true);          // method: 0 = store
      local.setUint16(10, 0, true);         // mod time
      local.setUint16(12, 0x21, true);      // mod date (1980-01-01)
      local.setUint32(14, crc, true);
      local.setUint32(18, size, true);      // compressed size
      local.setUint32(22, size, true);      // uncompressed size
      local.setUint16(26, nameBytes.length, true);
      local.setUint16(28, 0, true);         // extra length
      localParts.push(new Uint8Array(local.buffer), nameBytes, data);

      const central = new DataView(new ArrayBuffer(46));
      central.setUint32(0, 0x02014b50, true); // central dir signature
      central.setUint16(4, 20, true);         // version made by
      central.setUint16(6, 20, true);         // version needed
      central.setUint16(8, 0x0800, true);     // flag: UTF-8
      central.setUint16(10, 0, true);         // method store
      central.setUint16(12, 0, true);         // mod time
      central.setUint16(14, 0x21, true);      // mod date
      central.setUint32(16, crc, true);
      central.setUint32(20, size, true);
      central.setUint32(24, size, true);
      central.setUint16(28, nameBytes.length, true);
      central.setUint16(30, 0, true);         // extra length
      central.setUint16(32, 0, true);         // comment length
      central.setUint16(34, 0, true);         // disk number
      central.setUint16(36, 0, true);         // internal attrs
      central.setUint32(38, 0, true);         // external attrs
      central.setUint32(42, offset, true);    // local header offset
      centralParts.push(new Uint8Array(central.buffer), nameBytes);

      offset += 30 + nameBytes.length + size;
    }

    const centralStart = offset;
    let centralSize = 0;
    for (const part of centralParts) centralSize += part.length;

    const eocd = new DataView(new ArrayBuffer(22));
    eocd.setUint32(0, 0x06054b50, true);      // end of central dir signature
    eocd.setUint16(4, 0, true);               // disk number
    eocd.setUint16(6, 0, true);               // disk with central dir
    eocd.setUint16(8, entries.length, true);  // entries on this disk
    eocd.setUint16(10, entries.length, true); // total entries
    eocd.setUint32(12, centralSize, true);
    eocd.setUint32(16, centralStart, true);
    eocd.setUint16(20, 0, true);              // comment length

    return new Blob([...localParts, ...centralParts, new Uint8Array(eocd.buffer)], {
      type: 'application/zip'
    });
  }

  // Initial Load
  loadData();
});
