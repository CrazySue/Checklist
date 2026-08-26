$lines = Get-Content 'E:\WorkSpace\Checklist\Checklist-v0.9.0.html' -Encoding UTF8
$inKw = $false
$rows = 0
$langCounts = @{ 'zh-CN'=0; 'zh-TW'=0; 'en'=0; 'ja'=0; 'ko'=0; 'fr'=0; 'de'=0; 'es'=0; 'ru'=0; 'pt'=0 }
for ($i = 0; $i -lt $lines.Count; $i++) {
  $l = $lines[$i]
  if ($l -match "const AUTO_ICON_KEYWORDS") { $inKw = $true; continue }
  if ($inKw) {
    if ($l -match "^];") { break }
    if ($l -match "^\s*\['(.*)', '(.*)'\],?\s*$") {
      $rows++
      $parts = $Matches[1] -split '\|'
      $names = @('zh-CN','zh-TW','en','ja','ko','fr','de','es','ru','pt')
      for ($j = 0; $j -lt $parts.Count -and $j -lt 10; $j++) {
        if ($parts[$j].Trim().Length -gt 0) { $langCounts[$names[$j]]++ }
      }
    }
  }
}
Write-Host "Total rows: $rows"
foreach ($k in @('zh-CN','zh-TW','en','ja','ko','fr','de','es','ru','pt')) {
  Write-Host ("{0}: {1}" -f $k, $langCounts[$k])
}
