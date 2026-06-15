$conf = "C:\Program Files\VirtualMIDISynth\VirtualMIDISynth.conf"
$sf = "C:\Users\user\Documents\SoundFonts\FluidR3_GM.sf2"
Get-Process VirtualMIDISynth -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Milliseconds 800
$lines = Get-Content $conf
$out = New-Object System.Collections.Generic.List[string]
$inSF=$false
foreach ($l in $lines) {
  if ($l -match '^\[SoundFonts\]') { $out.Add($l); $out.Add("sf1=$sf"); $out.Add("sf1.enabled=1"); $inSF=$true; continue }
  if ($inSF -and $l -match '^\[') { $inSF=$false }
  if ($inSF -and $l -match '^\s*sf\d+') { continue }   # drop old sf lines
  $out.Add($l)
}
Set-Content -Path $conf -Value $out -Encoding UTF8
Start-Process "C:\Program Files\VirtualMIDISynth\VirtualMIDISynth.exe"
Start-Sleep -Seconds 2
"--- [SoundFonts] ---"
$t = Get-Content $conf; $i = ($t | Select-String '\[SoundFonts\]').LineNumber
$t[($i-1)..([math]::Min($i+2,$t.Count-1))]
