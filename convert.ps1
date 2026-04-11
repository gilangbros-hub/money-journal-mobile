Add-Type -AssemblyName System.Drawing
$imagePath = Join-Path $PWD "assets\logo.png"
$convertedPath = Join-Path $PWD "assets\logo_converted.png"
$img = [System.Drawing.Image]::FromFile($imagePath)
$img.Save($convertedPath, [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
