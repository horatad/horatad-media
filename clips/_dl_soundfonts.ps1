$dir = "C:\Users\user\Documents\SoundFonts"
$base = "https://archive.org/download/free-soundfonts-sf2-2019-04/"
$fonts = [ordered]@{
  "GeneralUser_GS_v1.471.sf2"         = "GeneralUser GS v1.471.sf2"
  "Arachno_SoundFont_Version_1.0.sf2" = "Arachno_SoundFont_Version_1.0.sf2"
  "SGM-NicePianos-V1.2.sf2"           = "SGM-v2.01-NicePianosGuitarsBass-V1.2.sf2"
  "TimbresOfHeaven-3.4.sf2"           = "Timbres Of Heaven GM_GS_XG_SFX V 3.4 Final.sf2"
}
foreach ($local in $fonts.Keys) {
  $remote = $fonts[$local]
  $out = Join-Path $dir $local
  if ((Test-Path $out) -and (Get-Item $out).Length -gt 1MB) { Write-Output "SKIP exists: $local"; continue }
  $url = $base + [uri]::EscapeDataString($remote)
  try {
    Write-Output "downloading $local ..."
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -UserAgent "Mozilla/5.0"
    $b = [System.IO.File]::OpenRead($out); $h = New-Object byte[] 12; [void]$b.Read($h,0,12); $b.Close()
    $magic = -join ($h[0..3] | ForEach-Object {[char]$_}); $form = -join ($h[8..11] | ForEach-Object {[char]$_})
    $valid = ($magic -eq "RIFF" -and $form -eq "sfbk")
    $tag = if ($valid) { "VALID" } else { "BAD" }
    Write-Output ("  -> {0:N1} MB  header={1}/{2}  {3}" -f ((Get-Item $out).Length/1MB), $magic, $form, $tag)
  } catch { Write-Output ("  ERR: " + $_.Exception.Message) }
}
Write-Output "DONE"
