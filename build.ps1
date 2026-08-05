# Build store-ready packages from the single source of truth in src\.
#
#   Edit code ONLY in src\ . Edit shared manifest fields ONLY in manifest.base.json.
#   Per-store manifest differences live in targets\<name>.json and are merged on top.
#
#   Output: dist\ImageCollector-<target>-v<version>.zip
#     chromium.zip -> Chrome Web Store, Microsoft Edge, Opera
#     firefox.zip  -> addons.mozilla.org
#
# Usage:
#   .\build.ps1                                  build both targets at the manifest version
#   .\build.ps1 -Target firefox                  build one target
#   .\build.ps1 -Target firefox -Version 1.0.0   reproduce a historical release
#
# -Version only overrides the version stamped into the package; it does NOT edit
# manifest.base.json. To actually release a new version, edit the base manifest.

param(
  [ValidateSet('chromium', 'firefox', 'all')]
  [string]$Target = 'all',
  [string]$Version = ''
)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$ErrorActionPreference = 'Stop'
$root    = $PSScriptRoot
$srcDir  = Join-Path $root 'src'
$distDir = Join-Path $root 'dist'

# Files copied into every package, with POSIX paths so Chromium/AMO accept them.
$files = @(
  "background.js", "content.js", "content.css",
  "popup.html", "popup.css", "popup.js",
  "icons/icon16.png", "icons/icon32.png", "icons/icon48.png", "icons/icon128.png"
)

# PowerShell 5.1's ConvertTo-Json escapes < > ' as \uXXXX. That is legal JSON, but
# it turns "<all_urls>" into noise for anyone reviewing the manifest. Put them back.
function Restore-JsonChars($json) {
  return $json.Replace('\u003c', '<').Replace('\u003e', '>').Replace('\u0027', "'").Replace('\u0026', '&')
}

# Shallow merge: every top-level key in the target override replaces the base key.
# The manifests only diverge at "background" and "browser_specific_settings", both
# top-level, so a shallow merge is sufficient and keeps the result easy to audit.
function Merge-Manifest($basePath, $targetPath) {
  $base   = Get-Content $basePath   -Raw | ConvertFrom-Json
  $target = Get-Content $targetPath -Raw | ConvertFrom-Json
  foreach ($prop in $target.PSObject.Properties) {
    $base | Add-Member -MemberType NoteProperty -Name $prop.Name -Value $prop.Value -Force
  }
  return $base
}

function Build-Target($targetName) {
  $targetPath = Join-Path $root "targets\$targetName.json"
  if (-not (Test-Path $targetPath)) { throw "Missing target file: $targetPath" }

  $manifest = Merge-Manifest (Join-Path $root 'manifest.base.json') $targetPath
  if ($Version -ne '') { $manifest.version = $Version }
  $version  = $manifest.version
  $json     = Restore-JsonChars ($manifest | ConvertTo-Json -Depth 20)

  # Write manifest.json to a temp file with UTF-8 (no BOM); a BOM can trip up
  # strict manifest parsers.
  $tmpManifest = Join-Path ([System.IO.Path]::GetTempPath()) ("ic-manifest-$targetName-$PID.json")
  [System.IO.File]::WriteAllText($tmpManifest, $json, (New-Object System.Text.UTF8Encoding($false)))

  $zipPath = Join-Path $distDir "ImageCollector-$targetName-v$version.zip"
  if (Test-Path $zipPath) { Remove-Item -LiteralPath $zipPath -Force }

  $lvl = [System.IO.Compression.CompressionLevel]::Optimal
  $zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
  try {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $tmpManifest, 'manifest.json', $lvl) | Out-Null
    foreach ($rel in $files) {
      $full = Join-Path $srcDir $rel
      if (-not (Test-Path $full)) { throw "Missing source file: src/$rel" }
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $full, $rel, $lvl) | Out-Null
    }
  } finally {
    $zip.Dispose()
    Remove-Item -LiteralPath $tmpManifest -Force -ErrorAction SilentlyContinue
  }

  $kb = [math]::Round((Get-Item $zipPath).Length / 1KB, 1)
  Write-Output ("  OK  {0,-9} v{1}  ({2} KB)  -> {3}" -f $targetName, $version, $kb, (Split-Path $zipPath -Leaf))
}

if (-not (Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir | Out-Null }

Write-Output "Building from src\ ..."
if ($Target -eq 'all') {
  Build-Target 'chromium'
  Build-Target 'firefox'
} else {
  Build-Target $Target
}
Write-Output ""
Write-Output "DONE. Packages in dist\"
Write-Output "  chromium -> Chrome Web Store / Edge / Opera"
Write-Output "  firefox  -> addons.mozilla.org"
Write-Output "When a version actually ships, copy its zips into releases\v<version>\ and tag the commit."
