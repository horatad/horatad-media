$fs  = "C:\horatad-media\clips\fluidsynth\fluidsynth-v2.5.4-win10-x64-glib\bin\fluidsynth.exe"
$bin = "C:\Users\user\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin"
$mid = "C:\horatad-media\clips\Violin test.mid"
$sfdir = "C:\Users\user\Documents\SoundFonts"
$outdir = "C:\horatad-media\clips"
# label + minimum-complete-size(MB) guard
$items = @(
  @{f="MuseScore_General.sf3";             lab="1 MuseScore General"; min=37}
  @{f="FluidR3_GM.sf2";                    lab="2 FluidR3";           min=140}
  @{f="GeneralUser_GS_v1.471.sf2";         lab="3 GeneralUser GS";    min=29}
  @{f="Arachno_SoundFont_Version_1.0.sf2"; lab="4 Arachno";           min=147}
  @{f="SGM-NicePianos-V1.2.sf2";           lab="5 SGM NicePianos";    min=308}
  @{f="TimbresOfHeaven-3.4.sf2";           lab="6 Timbres of Heaven";  min=370}
)
foreach ($it in $items) {
  $sf = Join-Path $sfdir $it.f
  $mp3 = Join-Path $outdir ("Violin - " + $it.lab + ".mp3")
  if (Test-Path $mp3) { Write-Output ("SKIP " + $it.lab); continue }
  if (-not (Test-Path $sf)) { Write-Output ("not yet: " + $it.lab); continue }
  if ((Get-Item $sf).Length/1MB -lt $it.min) { Write-Output ("incomplete, skip: " + $it.lab); continue }
  $wav = Join-Path $outdir "_vtmp.wav"
  Write-Output ("rendering " + $it.lab + " ...")
  & $fs -ni -r 44100 -g 0.9 -F $wav $sf $mid 2>$null | Out-Null
  if (Test-Path $wav) {
    & "$bin\ffmpeg.exe" -hide_banner -loglevel error -y -i $wav -af "loudnorm=I=-16:TP=-1.5" -ar 44100 -b:a 256k $mp3 2>$null
    Remove-Item $wav -Force -ErrorAction SilentlyContinue
    $v = & "$bin\ffmpeg.exe" -hide_banner -i $mp3 -af "volumedetect" -f null - 2>&1 | Select-String "mean_volume"
    Write-Output ("  done " + ($v -replace '.*\] ',''))
  } else { Write-Output ("  FAILED " + $it.lab) }
}
Write-Output "DONE"
