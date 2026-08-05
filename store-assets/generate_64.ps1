Add-Type -AssemblyName System.Drawing

$size = 64
$outputPath1 = "C:\Projects\image-collector-extension\icon64.png"
$outputPath2 = "C:\Projects\image-collector-extension\icons\icon64.png"

$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point($size, $size)),
    [System.Drawing.Color]::FromArgb(255, 15, 23, 42),
    [System.Drawing.Color]::FromArgb(255, 30, 41, 59)
)

$radius = [int]($size * 0.22)
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddArc(0, 0, $radius*2, $radius*2, 180, 90)
$path.AddArc($size - $radius*2, 0, $radius*2, $radius*2, 270, 90)
$path.AddArc($size - $radius*2, $size - $radius*2, $radius*2, $radius*2, 0, 90)
$path.AddArc(0, $size - $radius*2, $radius*2, $radius*2, 90, 90)
$path.CloseAllFigures()

$g.FillPath($bgBrush, $path)

$accentBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point($size, $size)),
    [System.Drawing.Color]::FromArgb(255, 56, 189, 248),
    [System.Drawing.Color]::FromArgb(255, 16, 185, 129)
)

$frameMargin = [int]($size * 0.2)
$frameWidth = $size - ($frameMargin * 2)
$framePen = New-Object System.Drawing.Pen($accentBrush, [math]::Max(2, [int]($size * 0.06)))
$g.DrawRectangle($framePen, $frameMargin, $frameMargin, $frameWidth, $frameWidth)

$arrowBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point(0, $size)),
    [System.Drawing.Color]::FromArgb(255, 96, 165, 250),
    [System.Drawing.Color]::FromArgb(255, 52, 211, 153)
)

$centerX = [int]($size / 2)
$stemW = [math]::Max(3, [int]($size * 0.12))
$stemH = [int]($size * 0.28)
$stemY = [int]($size * 0.3)
$g.FillRectangle($arrowBrush, $centerX - [int]($stemW/2), $stemY, $stemW, $stemH)

$headW = [int]($size * 0.35)
$headH = [int]($size * 0.2)
$headY = $stemY + $stemH - [int]($size * 0.05)

$p1 = New-Object System.Drawing.Point(($centerX - [int]($headW/2)), $headY)
$p2 = New-Object System.Drawing.Point(($centerX + [int]($headW/2)), $headY)
$p3 = New-Object System.Drawing.Point($centerX, ($headY + $headH))

$pArray = [System.Drawing.Point[]]($p1, $p2, $p3)
$g.FillPolygon($arrowBrush, $pArray)

$baseW = [int]($size * 0.45)
$baseH = [math]::Max(2, [int]($size * 0.06))
$baseY = [int]($size * 0.74)
$g.FillRectangle($arrowBrush, $centerX - [int]($baseW/2), $baseY, $baseW, $baseH)

$bmp.Save($outputPath1, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($outputPath2, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Output "64x64 icon created successfully!"
