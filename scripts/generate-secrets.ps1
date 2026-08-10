#
# [self-host] Fills every `change-me-*` placeholder in .env with a random value.
# Creates .env from .env.example first if it does not exist. Safe to re-run:
# values that are no longer placeholders are left alone.
#
$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "created .env from .env.example"
}

function New-Secret {
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    return ([Convert]::ToBase64String($bytes) -replace '[/+=]', '').Substring(0, 40)
}

$keys = @(
    "NEXTAUTH_SECRET", "DOCUMENT_PASSWORD_KEY", "VERIFICATION_SECRET",
    "INTERNAL_API_KEY", "REVALIDATE_TOKEN", "POSTGRES_PASSWORD",
    "REDIS_TOKEN", "STORAGE_SECRET_KEY"
)

$lines = Get-Content ".env"

foreach ($key in $keys) {
    if ($lines -match "^$key=change-me") {
        $value = New-Secret
        $lines = $lines -replace "^$key=.*", "$key=$value"
        Write-Host "  set $key"
    }
    else {
        Write-Host "  kept $key (already customised)"
    }
}

Set-Content ".env" $lines -Encoding utf8

Write-Host ""
Write-Host "Done. Now open .env and set PAPERMARK_HOST / PAPERMARK_URL, then run:"
Write-Host "  docker compose up -d --build"
