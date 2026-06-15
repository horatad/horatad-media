$fs  = "C:\horatad-media\clips\fluidsynth\fluidsynth-v2.5.4-win10-x64-glib\bin\fluidsynth.exe"
$bin = "C:\Users\user\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin"
$mid = "C:\horatad-media\clips\Piano test.mid"
$sfdir = "C:\Users\user\Documents\SoundFonts"
$outdir = "C:\horatad-media\clips"
# friendly labels
$label = @{
  "MuseScore_General.sf3"             = "1 MuseScore General"
  "FluidR3_GM.sf2"                    = "2 FluidR3"
  "GeneralUser_GS_v1.471.sf2"         = "3 GeneralUser GS"
  "Arachno_SoundFont_Version_1.0.sf2" = "4 Arachno"
  "SGM-NicePianos-V1.2.sf2"           = "5 SGM NicePianos"
  "TimbresOfHeaven-3.4.sf2"           = "6 Timbres of Heaven"
}
foreach ($sf in Get-ChildItem $sfdir -Include *.sf2,*.sf3 -Recurse) {
  $name = $sf.Name
  $lab = if ($label.ContainsKey($name)) { $label[$name] } else { [IO.Path]::GetFileNameWithoutExtension($name) }
  $mp3 = Join-Path $outdir ("Piano - " + $lab + ".mp3")
  if (Test-Path $mp3) { Write-Output "SKIP $lab"; continue }
  if ($sf.Length -lt 1MB) { Write-Output "skip (incomplete) $lab"; continue }
  $wav = Join-Path $outdir "_ptmp.wav"
  Write-Output "rendering $lab ..."
  & $fs -ni -r 44100 -g 0.9 -F $wav $sf.FullName $mid 2>$null | Out-Null
  if (Test-Path $wav) {
    & "$bin\ffmpeg.exe" -hide_banner -loglevel error -y -i $wav -af "loudnorm=I=-16:TP=-1.5" -ar 44100 -b:a 256k $mp3 2>$null
    Remove-Item $wav -Force -ErrorAction SilentlyContinue
    if (Test-Path $mp3) { Write-Output ("  done -> " + (Split-Path $mp3 -Leaf)) }
  } else { Write-Output "  RENDER FAILED $lab" }
}
Write-Output "ALL DONE"
