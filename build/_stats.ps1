$lines = Get-Content 'E:\WorkSpace\Checklist\Checklist-v0.8.0.html' -Encoding UTF8
$kw = 0
$inKw = $false
for ($i = 0; $i -lt $lines.Count; $i++) {
  $l = $lines[$i]
  if ($l -match "const AUTO_ICON_KEYWORDS") { $inKw = $true; continue }
  if ($inKw) {
    if ($l -match "^];") { $inKw = $false; continue }
    if ($l -match "^\s*\['") { $kw++ }
  }
}
Write-Host "AUTO_ICON_KEYWORDS rows: $kw"

# 定位关键函数行号
$patterns = @('function renderTopbar','function renderHome','function showHomeView','function completeItem','function resetChecklist','function renderBottombar','function switchChecklist','function openForm','function renderChecklistIconRow','function refreshChecklistIconRow','function renderForm\(','function handleExport','function handleImport','function renderSettings','function openLanguageMenu','function renderIconPickerGrid','function selectIcon','function switchPage','function bindEvents','function init\(','APP_VERSION','all-done','btnSettings','function updateStaticLabels','const RIPPLE_SELECTOR','function autoIconFor','const ICON_LIBRARY','function resetChecklist')
foreach ($p in $patterns) {
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match [regex]::Escape($p)) { Write-Host ($i+1) ': ' $p; break }
  }
}
