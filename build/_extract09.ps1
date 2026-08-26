$lines = Get-Content 'E:\WorkSpace\Checklist\Checklist-v0.9.0.html' -Encoding UTF8
# 脚本从 <script> 开始到 </script> 结束
$script = New-Object System.Collections.Generic.List[string]
$inScript = $false
foreach ($l in $lines) {
  if ($l -match '^\s*<script>') { $inScript = $true; continue }
  if ($l -match '^\s*</script>') { $inScript = $false; continue }
  if ($inScript) { $script.Add($l) }
}
$out = 'E:\WorkSpace\Checklist\build\_v09_script.txt'
$res = New-Object System.Collections.Generic.List[string]
foreach ($l in $script) {
  if ($l.Length -gt 4000) { $res.Add("[LONG_BASE64 " + $l.Length + "]") }
  else { $res.Add($l) }
}
Set-Content -Path $out -Value $res -Encoding UTF8
Write-Host "script lines: $($res.Count)"
