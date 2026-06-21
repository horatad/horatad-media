# clips/ — แล็บผลิตเพลงประกอบ (BGM) สำหรับคลิปดาราศาสตร์

> ⚠️ ชื่อโฟลเดอร์ "clips" เป็นชื่อเดิม (ตามจริงคือ **แล็บเสียงดนตรี** ไม่ใช่วิดีโอ)
> สคริปต์ทั้งหมด **hardcode path `C:\horatad-media\clips\...`** → **ห้ามเปลี่ยนชื่อ/ย้ายไฟล์งาน** ไม่งั้น pipeline พัง (ถ้าจะ rename ต้องแก้ path ในทุกสคริปต์ก่อน)

ทำเพลง/เสียงประกอบให้คลิป Remotion (`epicycle/public/audio/`) — เช่น `shostakovich-waltz2-loop.wav` มาจากที่นี่

> 📚 **คลัง MIDI อ้างอิง (reference sources) ย้ายออกไป `C:\horatad-media\media-sources\` แล้ว (17 มิ.ย. 2569)** — โฟลเดอร์นักประพันธ์ (mozart, beethoven, chopin ฯลฯ) + Media/ + others/ · แต่ละโฟลเดอร์มีดัชนี `index.html` (regen ด้วย `_gen_media_index.py` ที่ราก project) · `clips\` เหลือเฉพาะ **lab/ทดสอบ** (สคริปต์ + ไฟล์ MIDI ที่ hardcode + omr + outputs)

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
- **fluidsynth** → `tools\fluidsynth\` (render scripts `_render_*.ps1` ชี้ที่นี่แล้ว · เดิมมีสำเนาซ้ำใน clips/ ลบทิ้งแล้ว) · gitignored
- **ffmpeg** → ผ่าน winget (Gyan.FFmpeg)
- **Audiveris** (OMR) → installer ย้ายไป `C:\Users\user\Downloads\horatad-installers\` · ติดตั้งแล้วใช้ที่ `tools\AudiverisExtract\`
- **VirtualMIDISynth / MIDIMapper** → installer อยู่ Downloads\horatad-installers เช่นกัน

## Master / ผลงานสำคัญ → backup บน Drive
`G:\My Drive\horatad-media\_BGM-lab\` :
- `Shostakovich Waltz2 - seamless loop B (36s gapless).wav` ← BGM ที่ใช้จริงในคลิป (loop ใน epicycle)
- `Hora Staccato (Dinicu) - violin+piano MASTER.wav` ← **master = rework 17 มิ.ย. 2569** (REAPER `clips\HoraStaccato.rpp` → render `clips\HoraStaccato.wav` · มิกซ์ดังขึ้น) · ตัวเก่า 11 มิ.ย. ลบทิ้งแล้ว (กันสับสน) · คลิปใช้ในวิดีโอ = `epicycle\public\audio\hora-staccato-clip.mp3` (ตัด 62วิ −5.5dB)
- ~~`มาร์ชราชวัลลภ OMR (full band).mp3`~~ **ลบทิ้ง 22 มิ.ย. 2569** — OMR ถอดโน้ตมั่ว (เสียงไม่เป็นจังหวะ/ทำนอง · ทำนองหายครึ่งหลัง) ใช้ไม่ได้ · ลบทั้ง Drive + MIDI source (`RoyalMarch_full.mid`) · ถ้าจะทำใหม่ต้องหาสกอร์ดีๆ แล้ว OMR/คีย์ใหม่ (สกอร์เต็มวงฟรีที่ freesheetmarchingband.wordpress.com)

## ไม่ track ใน git (regenerable หรือใหญ่)
ไฟล์เสียง `*.wav/*.mp3` (auditions เทียบ soundfont = สร้างใหม่จาก .mid ได้) · soundfont `*.sf2/*.sf3` · installer · OMR intermediate (`_rm_*.png`, `_score*.pdf`, `omr_test/`, `omr_full/`) · `fluidsynth/`

## เคลียร์ทดสอบ (21 มิ.ย. 2569)
พี่ปีเตอร์สั่งเคลียร์ clips/ ทิ้งของทดสอบ+output+source ทั้งหมด (445M → 161K). **เหลือเฉพาะ scripts (`.py/.ps1/.lua`) + README + `_4front_vst.snippet`** — clips/ = lab tooling ล้วน.
ลบทั้งหมด: test render `*.wav` (Mozart/untitled/_piano/_bbcso/testmidi), soundfont-audition `*.mp3` (Violin/Valkyries/Symphony/Piano/Duet ×6), OMR intermediate, master copy ที่อยู่ Drive แล้ว, test+master source MIDI/`.rpp` (รวม `HoraStaccato.rpp`, Hora/RoyalMarch `.mid`), `Backups/` `Media/`, `skaters-waltz.mp3`+`_yt-source.webm`.
- ⚠️ **master = render เสียงบน Drive `_BGM-lab\` เท่านั้น** (Shostakovich/Hora) — source REAPER/MIDI ลบแล้ว แก้ไข master เดิมไม่ได้ ต้องทำใหม่จาก scripts
- BGM ที่ใช้จริงในคลิป = copy ใน `epicycle\public\audio\` (ไม่กระทบ) · ทดสอบ soundfont รอบใหม่ = รัน scripts สร้างใหม่
