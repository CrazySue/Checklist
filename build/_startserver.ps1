Start-Process node -ArgumentList 'E:\WorkSpace\Checklist\build\_server.js' -WindowStyle Hidden
Start-Sleep -Seconds 1
try {
  $r = Invoke-WebRequest -Uri 'http://localhost:8931/Checklist-v0.9.0.html' -UseBasicParsing -TimeoutSec 15
  Write-Host ('status: ' + $r.StatusCode + ' length: ' + $r.RawContentLength)
} catch {
  Write-Host ('ERR: ' + $_.Exception.Message)
}
