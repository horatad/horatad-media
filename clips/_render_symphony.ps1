$fs  = "C:\horatad-media\tools\fluidsynth\fluidsynth-v2.5.4-win10-x64-glib\bin\fluidsynth.exe"
$bin = "C:\Users\user\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin"
$mid = "C:\horatad-media\clips\_Sym5-1.mid"
$sfdir = "C:\Users\user\Documents\SoundFonts"
$items = @(
  @{f="MuseScore_General.sf3";lab="1 MuseScore General"}
  @{f="FluidR3_GM.sf2";lab="2 FluidR3"}
  @{f="GeneralUser_GS_v1.471.sf2";lab="3 GeneralUser GS"}
  @{f="Arachno_SoundFont_Version_1.0.sf2";lab="4 Arachno"}
  @{f="SGM-NicePianos-V1.2.sf2";lab="5 SGM NicePianos"}
  @{f="TimbresOfHeaven-3.4.sf2";lab="6 Timbres of Heaven"}
)
foreach ($it in $items) {
  $sf = Join-Path $sfdir $it.f
  $mp3 = "C:\horatad-media\clips\Symphony - $($it.lab).mp3"
  $wav = "C:\horatad-media\clips\_symtmp.wav"
  Write-Output ("rendering " + $it.lab + " ...")
  & $fs -ni -r 44100 -g 0.9 -F $wav $sf $mid 2>$null | Out-Null
  if (Test-Path $wav) {
    & "$bin\ffmpeg.exe" -hide_banner -loglevel error -y -t 55 -i $wav -af "loudnorm=I=-16:TP=-1.5" -ar 44100 -b:a 256k $mp3 2>$null
    Remove-Item $wav -Force -ErrorAction SilentlyContinue
    $v = & "$bin\ffmpeg.exe" -hide_banner -i $mp3 -af "volumedetect" -f null - 2>&1 | Select-String "mean_volume"
    Write-Output ("  done " + ($v -replace '.*\] ',''))
  } else { Write-Output ("  FAILED " + $it.lab) }
}
Write-Output "ALL DONE"
