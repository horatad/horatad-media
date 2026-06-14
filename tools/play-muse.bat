@echo off
title MIDI Player - MuseScore (orchestra) - close window to stop
echo.
echo   Now playing : %~nx1
echo   SoundFont   : MuseScore General (balanced - full orchestra / many instruments)
echo.
echo   Close this window to stop playback.
echo.
"C:\horatad-media\tools\fluidsynth\fluidsynth-v2.5.4-win10-x64-glib\bin\fluidsynth.exe" -ni -g 1.4 "C:\Users\user\Documents\SoundFonts\MuseScore_General.sf3" "%~1"
