$lines = Get-Content 'E:\WorkSpace\Checklist\Checklist-v0.8.0.html' -Encoding UTF8
$out = 'E:\WorkSpace\Checklist\build\_script.txt'
$start = 1024; $end = 3146
if ($start -ge 1) { $start-- }
$sel = $lines[$start..$end]
Set-Content -Path $out -Value $sel -Encoding UTF8
Write-Host "wrote $($sel.Count) lines"
