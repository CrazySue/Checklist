Get-ChildItem 'C:\Users\CrazySue\Desktop' -Filter 'Checklist-v0.9*' | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
Write-Host '--- versions ---'
$files = @(
  'C:\Users\CrazySue\Desktop\Checklist-v0.9.0.html',
  'C:\Users\CrazySue\Desktop\Checklist-v0.9.1.html',
  'C:\Users\CrazySue\Desktop\Checklist-v0.9.2.html',
  'C:\Users\CrazySue\Desktop\Checklist-v0.9.0 (2).html'
)
foreach ($f in $files) {
  $m = Select-String -Path $f -Pattern "APP_VERSION = '([^']+)'" | Select-Object -First 1
  $v = if ($m) { $m.Matches.Groups[1].Value } else { '?' }
  Write-Host ($f + ' => ' + $v)
}
