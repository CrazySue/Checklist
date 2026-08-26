$p = 'E:\WorkSpace\Checklist\Checklist-v0.9.3.html'
$lines = Get-Content $p -Encoding UTF8
for ($i = 0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match "APP_VERSION = '([^']+)'") {
    Write-Host ("line " + ($i+1) + ": " + $lines[$i])
    $lines[$i] = $lines[$i] -replace "APP_VERSION = '[^']+'", "APP_VERSION = 'Release v0.9.3'"
    Set-Content -Path $p -Value $lines -Encoding UTF8
    Write-Host "bumped to v0.9.3"
    break
  }
}
