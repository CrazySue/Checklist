$shell = New-Object -ComObject Shell.Application
$recycleBin = $shell.Namespace(0xA)
$items = $recycleBin.Items()
foreach ($item in $items) {
  $name = $item.Name
  if ($name -like 'Checklist-v0.9*') {
    $origPath = $recycleBin.GetDetailsOf($item, 1)
    Write-Host ("FOUND: " + $name + "  original: " + $origPath)
  }
}
Write-Host "done scanning recycle bin"
