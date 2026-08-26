Set-Location 'E:\WorkSpace\Checklist\build'
Write-Host "===== TEST A (issues 1,2,6) ====="
node _smoke093a.js
Write-Host ""
Write-Host "===== TEST B (issues 3,4,5,8,9,10 + regressions) ====="
node _smoke093b.js
