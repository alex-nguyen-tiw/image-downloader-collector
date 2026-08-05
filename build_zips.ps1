# Build zip sạch cho từng store. Path POSIX (dấu "/") để Chromium & AMO chấp nhận.
# Chỉ đóng gói file extension thật — KHÔNG kèm ảnh listing / README / script.
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = $PSScriptRoot
$files = @(
  "manifest.json","background.js","content.js","content.css",
  "popup.html","popup.css","popup.js",
  "icons/icon16.png","icons/icon32.png","icons/icon48.png","icons/icon128.png"
)

function Build-Zip($srcDir, $zipPath) {
  if (Test-Path $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
  $mode = [System.IO.Compression.ZipArchiveMode]::Create
  $lvl  = [System.IO.Compression.CompressionLevel]::Optimal
  $zip  = [System.IO.Compression.ZipFile]::Open($zipPath, $mode)
  try {
    foreach ($rel in $files) {
      $full = Join-Path $srcDir $rel
      if (Test-Path $full) {
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $full, $rel, $lvl) | Out-Null
      } else { Write-Output ("  THIEU: " + $rel) }
    }
  } finally { $zip.Dispose() }
  Write-Output ("OK -> " + $zipPath)
}

# Đọc version từ mỗi manifest để đặt tên zip
function Get-Ver($dir) { (Get-Content (Join-Path $dir "manifest.json") -Raw | ConvertFrom-Json).version }

$cver = Get-Ver "$root\chromium"
$fver = Get-Ver "$root\firefox"
Build-Zip "$root\chromium" "$root\dist\ImageCollector-chromium-v$cver.zip"
Build-Zip "$root\firefox"  "$root\dist\ImageCollector-firefox-v$fver.zip"
Write-Output "DONE"
