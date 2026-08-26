$lines = Get-Content 'E:\WorkSpace\Checklist\build\_v09_script.txt' -Encoding UTF8
$targets = @('function switchPage','function renderHome','function showHomeView','function resetChecklist','function completeItem','function renderBottombar','const RIPPLE_SELECTOR','function renderFormItems','function appendFormItem','function renderSettings','function openForm','function openLanguageMenu','function init(','function switchChecklist','function bindEvents','function showEditPage','function selectIcon','function refreshChecklistIconRow','function animateIconSwap')
foreach ($p in $targets) {
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match [regex]::Escape($p)) { Write-Host ($i+1) ': ' $p; break }
  }
}
