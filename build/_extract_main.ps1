$lines = Get-Content 'E:\WorkSpace\Checklist\Checklist-v0.9.0.html' -Encoding UTF8
# 提取 <script> ... </script>（最后一个 script 块，即主逻辑）
$start = -1; $end = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match '^\s*<script>\s*$') { $start = $i }
  if ($lines[$i] -match '^\s*</script>\s*$') { $end = $i }
}
Write-Host "script lines: $($start+1) .. $($end+1)"
$sel = $lines[($start+1)..($end-1)]
Set-Content -Path 'E:\WorkSpace\Checklist\build\_main.js' -Value $sel -Encoding UTF8
Write-Host "wrote $($sel.Count) lines"
