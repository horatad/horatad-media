# clips/ — แล็บผลิตเพลงประกอบ (BGM) สำหรับคลิปดาราศาสตร์

> ⚠️ ชื่อโฟลเดอร์ "clips" เป็นชื่อเดิม (ตามจริงคือ **แล็บเสียงดนตรี** ไม่ใช่วิดีโอ)
> สคริปต์ทั้งหมด **hardcode path `C:\horatad-media\clips\...`** → **ห้ามเปลี่ยนชื่อ/ย้ายไฟล์งาน** ไม่งั้น pipeline พัง (ถ้าจะ rename ต้องแก้ path ในทุกสคริปต์ก่อน)

ทำเพลง/เสียงประกอบให้คลิป Remotion (`epicycle/public/audio/`) — เช่น `shostakovich-waltz2-loop.wav` มาจากที่นี่

## Pipeline
```
โน้ตเพลง (PDF/MusicXML)
   └─(Audiveris OMR)→ MusicXML → (_mxl2midi.py)→ MIDI
หรือ แต่ง MIDI เอง (_make_*.py ใช้ mido)
   └─(fluidsynth + SoundFont .sf2/.sf3)→ WAV → (ffmpeg loudnorm)→ MP3
   └─ เทียบหลาย soundfont เลือกเสียงที่เข้ากับ mood (_render_*.ps1)
```

## สคริปต์หลัก (track ใน git)
| ไฟล์ | หน้าที่ |
|---|---|
| `_make_{duet,piano,violin}_test.py` | แต่ง MIDI ทดสอบเอง (mido) |
| `_mxl2midi.py` | MusicXML (จาก OMR) → MIDI |
| `_render_{piano_compare,symphony,valkyries,violin}.ps1` | render MIDI เทียบ 6 soundfont → mp3 (loudnorm -16 LUFS) |
| `_dl_soundfonts.ps1` | โหลด soundfont มาไว้ `Documents\SoundFonts\` |
| `_play_via_vms.py` / `_vms_*.ps1` | เล่น MIDI ผ่าน VirtualMIDISynth |
| `_pdf_inspect.py` | ตรวจหน้าโน้ต PDF |
| `tools/play-arachno.bat`, `tools/play-muse.bat` | เล่น MIDI เร็วๆ ด้วย fluidsynth (Arachno / MuseScore) |

## External deps (ไม่อยู่ใน repo — ติดตั้ง/โหลดเอง)
- **SoundFonts** → `C:\Users\user\Documents\SoundFonts\` (~1GB: Arachno, FluidR3, GeneralUser GS, MuseScore General, SGM NicePianos, Timbres of Heaven) · โหลดด้วย `_dl_soundfonts.ps1`
- **fluidsynth** → `clips\fluidsynth\` (+ สำเนาที่ `tools\fluidsynth\`) · gitignored
- **ffmpeg** → ผ่าน winget (Gyan.FFmpeg)
- **Audiveris** (OMR) → installer ย้ายไป `C:\Users\user\Downloads\horatad-installers\` · ติดตั้งแล้วใช้ที่ `tools\AudiverisExtract\`
- **VirtualMIDISynth / MIDIMapper** → installer อยู่ Downloads\horatad-installers เช่นกัน

## Master / ผลงานสำคัญ → backup บน Drive
`G:\My Drive\_FB&Social\_BGM-lab\` :
- `Shostakovich Waltz2 - seamless loop B (36s gapless).wav` ← BGM ที่ใช้จริงในคลิป (loop ใน epicycle)
- `Hora Staccato (Dinicu) - violin+piano MASTER.wav`
- `มาร์ชราชวัลลภ OMR (full band).mp3`

## ไม่ track ใน git (regenerable หรือใหญ่)
ไฟล์เสียง `*.wav/*.mp3` (auditions เทียบ soundfont = สร้างใหม่จาก .mid ได้) · soundfont `*.sf2/*.sf3` · installer · OMR intermediate (`_rm_*.png`, `_score*.pdf`, `omr_test/`, `omr_full/`) · `fluidsynth/`
