Add-Type -AssemblyName System.Drawing

# 1. Generate Screenshot 1 (1280 x 800)
$sw = 1280
$sh = 800
$bmpS = New-Object System.Drawing.Bitmap($sw, $sh)
$gS = [System.Drawing.Graphics]::FromImage($bmpS)
$gS.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Background Dark Slate
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point($sw, $sh)),
    [System.Drawing.Color]::FromArgb(255, 15, 23, 42),
    [System.Drawing.Color]::FromArgb(255, 30, 41, 59)
)
$gS.FillRectangle($bgBrush, 0, 0, $sw, $sh)

# App Window Header Representation
$winBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 30, 41, 59))
$gS.FillRectangle($winBrush, 100, 80, 1080, 640)

# Window Header
$headerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 51, 65, 85))
$gS.FillRectangle($headerBrush, 100, 80, 1080, 50)

# Title Text
$fontTitle = New-Object System.Drawing.Font("Segoe UI", 22, [System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Regular)
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 148, 163, 184))

$gS.DrawString('Image Downloader Collector Dashboard', $fontTitle, $whiteBrush, 130, 90)
$gS.DrawString('Powered by Tshirts I Want - Batch Save Graphic Designs', $fontSub, $subBrush, 130, 190)

# Grid Card Placeholders
$colors = @([System.Drawing.Color]::FromArgb(255, 59, 130, 246), [System.Drawing.Color]::FromArgb(255, 16, 185, 129), [System.Drawing.Color]::FromArgb(255, 239, 68, 68), [System.Drawing.Color]::FromArgb(255, 168, 85, 247))
for ($i = 0; $i -lt 4; $i++) {
    $x = 130 + ($i * 250)
    $cBrush = New-Object System.Drawing.SolidBrush($colors[$i % 4])
    $gS.FillRectangle($cBrush, $x, 260, 220, 200)
    $gS.FillRectangle($winBrush, $x, 470, 220, 180)
}

$bmpS.Save("C:\Projects\image-collector-extension\screenshot1.png", [System.Drawing.Imaging.ImageFormat]::Png)
$gS.Dispose()
$bmpS.Dispose()

# 2. Generate Small Promotional Tile (440 x 280)
$pw = 440
$ph = 280
$bmpP = New-Object System.Drawing.Bitmap($pw, $ph)
$gP = [System.Drawing.Graphics]::FromImage($bmpP)
$gP.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

$gP.FillRectangle($bgBrush, 0, 0, $pw, $ph)

# Title Text on Promo
$fontPromoTitle = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$fontPromoSub = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Regular)

$gP.DrawString('Image Downloader Collector', $fontPromoTitle, $whiteBrush, 30, 80)
$gP.DrawString('Batch Save Graphic Designs', $fontPromoSub, $subBrush, 30, 120)
$gP.DrawString('Powered by Tshirts I Want', $fontPromoSub, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 56, 189, 248))), 30, 160)

$bmpP.Save("C:\Projects\image-collector-extension\promo_small.png", [System.Drawing.Imaging.ImageFormat]::Png)
$gP.Dispose()
$bmpP.Dispose()

Write-Output 'Promo tile and Screenshot generated successfully!'
