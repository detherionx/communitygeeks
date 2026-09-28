$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$php = Join-Path $projectRoot '.local-tools\php\php.exe'
$config = Join-Path $projectRoot 'public\api\cal.config.php'
$router = Join-Path $projectRoot 'scripts\cal-preview-router.php'
$site = Join-Path $projectRoot '_site'
$caBundle = 'C:\Program Files\Git\mingw64\etc\ssl\certs\ca-bundle.crt'

if (-not (Test-Path -LiteralPath $php)) { throw 'Local PHP runtime not found.' }
if (-not (Test-Path -LiteralPath $config)) {
    throw 'Missing public/api/cal.config.php. Copy public/api/cal.config.example.php, then add the API key.'
}
if (-not (Test-Path -LiteralPath $caBundle)) { throw 'Git CA bundle not found.' }

Push-Location $projectRoot
try {
    npm run validate:content
    if ($LASTEXITCODE -ne 0) { throw 'Content validation failed.' }
    npx eleventy
    if ($LASTEXITCODE -ne 0) { throw 'The site build failed.' }

    & $php -d "extension_dir=$projectRoot\.local-tools\php\ext" -d 'extension=php_curl.dll' `
        -d "openssl.cafile=$caBundle" -d "curl.cainfo=$caBundle" `
        -S 127.0.0.1:8081 -t $site $router
} finally {
    Pop-Location
}
