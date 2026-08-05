# Release archive

Packages that were shipped (or submitted) to each store, kept for trace-back and for
answering store queries about a specific version. **Never build over these** — `build.ps1`
writes to `dist/`; copy into this folder only when a version is actually submitted.

Every version also has a matching git tag, so the source can always be rebuilt even if a
zip goes missing:

```bash
git checkout v1.1.0 && ./build.ps1
```

## Provenance of each file

| File | Provenance |
|---|---|
| `v1.1.0/ImageCollector-chromium-v1.1.0.zip` | ✅ **Original** build — submitted to the Chrome Web Store |
| `v1.1.0/ImageCollector-firefox-v1.1.0.zip` | ✅ **Original** build — not yet submitted |
| `v1.0.1/ImageCollector-chromium-v1.0.1.zip` | ✅ **Original** build — submitted to Edge and Opera |
| `v1.0.1/ImageCollector-firefox-v1.0.1.zip` | ✅ **Original** build — never submitted to AMO |
| `v1.0.0/ImageCollector-firefox-v1.0.0.zip` | ♻️ **Reconstructed** — see the note below |

### Note on `firefox-v1.0.0.zip`

This is the version currently live on Firefox AMO. The original zip was deleted by mistake
while cleaning `dist/` on 2026-08-05, so the copy kept here was **reconstructed** with:

```powershell
.\build.ps1 -Target firefox -Version 1.0.0
```

Verified before reconstructing: all 10 source files in `src/` are **byte-identical** to tag
`v1.0.0`, and the manifest at that tag is indeed the Gecko flavour at version 1.0.0. The
contents are therefore equivalent to what was submitted; only the **bytes of the zip container
itself** (entry order, timestamps, compression) may differ. Good enough to compare contents
against — **not** valid as checksum evidence.

## History

| Version | Chrome | Edge | Firefox | Opera |
|---|---|---|---|---|
| 1.0.0 | — | — | ✅ live | ❌ rejected (Gecko build submitted to a Chromium store) |
| 1.0.1 | not submitted | ✅ approved | not submitted | ⏳ awaiting moderation |
| 1.1.0 | ⏳ awaiting review | not submitted | not submitted | not submitted |

Per-version detail: [`../CHANGELOG.md`](../CHANGELOG.md)
