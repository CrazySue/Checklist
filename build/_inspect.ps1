$lines = Get-Content 'E:\WorkSpace\Checklist\Checklist-v0.8.0.html' -Encoding UTF8
for ($i = 0; $i -lt $lines.Count; $i++) {
  $l = $lines[$i]
  if ($l -match '^</style>|^<style|font-family|HarmonyOS|</head>|<body|</body>|<script|</script>|<style id=|^<link|^<meta|^<title') {
    $s = $l.Substring(0, [Math]::Min($l.Length, 140))
    Write-Host (($i + 1).ToString()) ': ' $s
  }
}
