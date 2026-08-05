Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipPath = "C:\Projects\ImageCollector_v1.0.0.zip"
$rootDir = "C:\Projects\image-collector-extension"

# Delete existing zip
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

# List of files to include
$filesToInclude = @(
    "manifest.json",
    "background.js",
    "content.js",
    "content.css",
    "popup.html",
    "popup.css",
    "popup.js",
    "README.md",
    "icon.svg",
    "icon16.png",
    "icon48.png",
    "icon128.png",
    "icon300.png",
    "screenshot1.png",
    "promo_small.png",
    "icons/icon16.png",
    "icons/icon32.png",
    "icons/icon48.png",
    "icons/icon128.png"
)

foreach ($relativePath in $filesToInclude) {
    $fullPath = Join-Path $rootDir ($relativePath.Replace('/', '\'))
    if (Test-Path $fullPath) {
        # POSIX entry name strictly with forward slashes '/'
        $entryName = $relativePath.Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $fullPath, $entryName, [System.IO.Compression.CompressionLevel]::Optimal)
    }
}

$zip.Dispose()
Write-Output "POSIX ZIP created successfully!"
