$out = node --check 'E:\WorkSpace\Checklist\build\_main.js' 2>&1
Write-Host $out
Write-Host ("exit: " + $LASTEXITCODE)
