# Corrige variables de Vercel que se pegaron con saltos de linea (CRLF).
# Uso: powershell -File scripts/fix-vercel-env.ps1
# Requiere: vercel CLI autenticado en el proyecto.

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

function Set-VercelEnv {
  param(
    [string]$Name,
    [string]$Value,
    [string]$Environment = 'production'
  )
  Write-Host "Updating $Name ..."
  vercel env rm $Name $Environment --yes 2>$null | Out-Null
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
  $ms = New-Object System.IO.MemoryStream(, $bytes)
  vercel env add $Name $Environment <# stdin #> 2>&1 | Out-Null
  # vercel env add reads stdin on some versions; use pipe:
  $Value | vercel env add $Name $Environment --force 2>&1
}

# Valores limpios (sin \r\n). Las credenciales deben venir desde el entorno local.
if ([string]::IsNullOrWhiteSpace($env:ADMIN_EMAIL)) {
  throw 'Set ADMIN_EMAIL in your shell before running this script.'
}

if ([string]::IsNullOrWhiteSpace($env:ADMIN_PASSWORD)) {
  throw 'Set ADMIN_PASSWORD in your shell before running this script.'
}

$fixes = @{
  'ADMIN_EMAIL' = $env:ADMIN_EMAIL
  'ADMIN_PASSWORD' = $env:ADMIN_PASSWORD
  'AUTH_URL' = 'https://calafetapropiedades.vercel.app'
  'NEXTAUTH_URL' = 'https://calafetapropiedades.vercel.app'
  'APP_ORIGIN' = 'https://calafetapropiedades.vercel.app'
  'AUTH_TRUST_HOST' = 'true'
}

foreach ($entry in $fixes.GetEnumerator()) {
  Write-Host "==> $($entry.Key)"
  vercel env rm $entry.Key production --yes 2>$null
  $entry.Value | vercel env add $entry.Key production
}

Write-Host 'Done. Redeploy: vercel --prod'
