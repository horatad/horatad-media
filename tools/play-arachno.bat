@echo off
title MIDI Player - Arachno (warm) - close window to stop
echo.
echo   Now playing : %~nx1
echo   SoundFont   : Arachno (warm tone - solo / small ensemble / games)
echo.
echo   Close this window to stop playback.
echo.
"C:\horatad-media\tools\fluidsynth\fluidsynth-v2.5.4-win10-x64-glib\bin\fluidsynth.exe" -ni -g 1.8 "C:\Users\user\Documents\SoundFonts\Arachno_SoundFont_Version_1.0.sf2" "%~1"
