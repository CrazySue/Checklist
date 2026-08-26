$lines = Get-Content 'E:\WorkSpace\Checklist\Checklist-v0.9.3.html' -Encoding UTF8
# CSS 在 </style> 之前
$patterns = @('.si-icon','.fi-remove','.support-btn','.settings-item{','.settings-item ','.settings-item.clickable','.icon-circle-btn','.fi-icon-btn','.all-done','.switch{','.switch-thumb','.form-item','.lang-item','@media(min-width','@media(orientation','.page-leave','.page-enter','.page{','.page-active','.text-field','.about-credit a')
foreach ($p in $patterns) {
  for ($i = 0; $i -lt [Math]::Min($lines.Count, 1000); $i++) {
    if ($lines[$i] -match [regex]::Escape($p)) { Write-Host ($i+1) ': ' $p; break }
  }
}
