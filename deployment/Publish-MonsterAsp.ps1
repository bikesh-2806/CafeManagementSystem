[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$repositoryRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$frontendRoot = Join-Path $repositoryRoot 'frontend'
$backendProject = Join-Path $repositoryRoot 'backend\RestaurantManagement.Api\RestaurantManagement.Api.csproj'
$angularOutput = Join-Path $frontendRoot 'dist\frontend'
$publishRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'MonsterAsp'))
$zipPath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'MonsterAsp.zip'))
$expectedParent = [System.IO.Path]::GetFullPath($PSScriptRoot) + [System.IO.Path]::DirectorySeparatorChar

if (-not $publishRoot.StartsWith($expectedParent, [System.StringComparison]::OrdinalIgnoreCase) -or
    -not $zipPath.StartsWith($expectedParent, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'Refusing to create deployment artifacts outside the deployment directory.'
}

Push-Location $frontendRoot
try {
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) {
        throw 'Angular production build failed.'
    }
}
finally {
    Pop-Location
}

if (Test-Path -LiteralPath $publishRoot) {
    Remove-Item -LiteralPath $publishRoot -Recurse -Force
}

& dotnet publish $backendProject `
    --configuration Release `
    --no-restore `
    --output $publishRoot

if ($LASTEXITCODE -ne 0) {
    throw '.NET publish failed.'
}

$webRoot = Join-Path $publishRoot 'wwwroot'
New-Item -ItemType Directory -Path $webRoot -Force | Out-Null
Copy-Item -Path (Join-Path $angularOutput '*') -Destination $webRoot -Recurse -Force

$databaseScripts = Join-Path $publishRoot 'DatabaseScripts'
New-Item -ItemType Directory -Path $databaseScripts -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'Database.sql') -Destination $databaseScripts
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'Incremental_MenuItems.sql') -Destination $databaseScripts
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'MONSTERASP-README.txt') -Destination $publishRoot

if (Test-Path -LiteralPath $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
}

Compress-Archive -Path (Join-Path $publishRoot '*') -DestinationPath $zipPath -CompressionLevel Optimal

Write-Host "MonsterASP.NET package created at: $publishRoot"
Write-Host "MonsterASP.NET ZIP created at: $zipPath"
