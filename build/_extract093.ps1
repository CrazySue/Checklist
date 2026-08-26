$lines = Get-Content 'E:\WorkSpace\Checklist\Checklist-v0.9.3.html' -Encoding UTF8
$script = New-Object System.Collections.Generic.List[string]
$inScript = $false
foreach ($l in $lines) {
  if ($l -match '^\s*<script>') { $inScript = $true; continue }
  if ($l -match '^\s*</script>') { $inScript = $false; continue }
  if ($inScript) { $script.Add($l) }
}
$out = 'E:\WorkSpace\Checklist\build\_v093_script.txt'
$res = New-Object System.Collections.Generic.List[string]
foreach ($l in $script) {
  if ($l.Length -gt 4000) { $res.Add("[LONG_BASE64 " + $l.Length + "]") }
  else { $res.Add($l) }
}
Set-Content -Path $out -Value $res -Encoding UTF8
Write-Host "script lines: $($res.Count)"
$targets = @('function switchPage','function renderHome','function showHomeView','function resetChecklist','function completeItem','const RIPPLE_SELECTOR','function renderFormItems','function appendFormItem','function renderSettings','function openForm','function openLanguageMenu','function animateIconSwap','function refreshChecklistIconRow','function showEditPage','function selectIcon')
foreach ($p in $targets) {
  for ($i = 0; $i -lt $res.Count; $i++) {
    if ($res[$i] -match [regex]::Escape($p)) { Write-Host ($i+1) ': ' $p; break }
  }
}
