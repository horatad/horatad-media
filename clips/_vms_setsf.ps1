# เพิ่ม SoundFont เข้า VirtualMIDISynth.conf แล้ว restart synth
$conf = "C:\Program Files\VirtualMIDISynth\VirtualMIDISynth.conf"
$sf   = "C:\Users\user\Documents\SoundFonts\MuseScore_General.sf3"

# ปิด synth ก่อนแก้ (กันเขียนทับตอน exit)
Get-Process VirtualMIDISynth -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Milliseconds 800

$lines = Get-Content $conf
$out = New-Object System.Collections.Generic.List[string]
$inSF = $false; $added = $false
foreach ($l in $lines) {
  if ($l -match '^\[SoundFonts\]') { $out.Add($l); $out.Add("sf1=*$sf"); $inSF=$true; $added=$true; continue }
  if ($inSF -and $l -match '^\[') { $inSF=$false }      # ออกจาก section
  if ($inSF -and $l -match '^\s*sf\d+\s*=') { continue } # ลบ sf เดิม (ถ้ามี)
  $out.Add($l)
}
if (-not $added) { $out.Add("[SoundFonts]"); $out.Add("sf1=*$sf") }
Set-Content -Path $conf -Value $out -Encoding UTF8

# relaunch synth
Start-Process "C:\Program Files\VirtualMIDISynth\VirtualMIDISynth.exe"
Start-Sleep -Seconds 2
"--- [SoundFonts] section หลังแก้ ---"
$txt = Get-Content $conf
$i = ($txt | Select-String '\[SoundFonts\]').LineNumber
$txt[($i-1)..([math]::Min($i+2,$txt.Count-1))]
