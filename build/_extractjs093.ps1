$lines = Get-Content 'E:\WorkSpace\Checklist\Checklist-v0.9.3.html' -Encoding UTF8
$script = New-Object System.Collections.Generic.List[string]
$inScript = $false
foreach ($l in $lines) {
  if ($l -match '^\s*<script>') { $inScript = $true; continue }
  if ($l -match '^\s*</script>') { $inScript = $false; continue }
  if ($inScript) { $script.Add($l) }
}
Set-Content -Path 'E:\WorkSpace\Checklist\build\_main093.js' -Value $script -Encoding UTF8
Write-Host "extracted $($script.Count) lines"
