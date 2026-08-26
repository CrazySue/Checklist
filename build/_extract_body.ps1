$lines = Get-Content 'E:\WorkSpace\Checklist\Checklist-v0.8.0.html' -Encoding UTF8
$out = 'E:\WorkSpace\Checklist\build\_body.txt'
$start = 943; $end = 1023
if ($start -ge 1) { $start-- }
$sel = $lines[$start..$end]
Set-Content -Path $out -Value $sel -Encoding UTF8
Write-Host "wrote $($sel.Count) lines"
