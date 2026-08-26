$lines = Get-Content 'E:\WorkSpace\Checklist\build\_script.txt' -Encoding UTF8
$out = 'E:\WorkSpace\Checklist\build\_script_clean.txt'
$res = New-Object System.Collections.Generic.List[string]
for ($i = 0; $i -lt $lines.Count; $i++) {
  $l = $lines[$i]
  if ($l.Length -gt 4000) {
    $res.Add("[LONG_BASE64_LINE " + ($i + 1) + " len=" + $l.Length + "]")
  } else {
    $res.Add($l)
  }
}
Set-Content -Path $out -Value $res -Encoding UTF8
Write-Host "wrote $($res.Count) lines"
