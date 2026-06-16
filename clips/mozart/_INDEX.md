# ดัชนี Mozart Piano Sonata MIDI (piano-midi.de)
> โฟลเดอร์ `C:\horatad-media\clips\mozart\` · ที่มา: Classical Piano Midi Page (Bernd Krueger) · public domain composition
> ไฟล์ชื่อ `mz_<K>_<ท่อน>.mid` · ⭐ = ท่อนดัง/เหมาะทำ BGM

| ไฟล์ | โซนาตา | ท่อน | tempo / ชื่อ |
|---|---|---|---|
| `mz_311_1` | No. 8 · D major · **K.311** | 1 | Allegro con spirito |
| `mz_311_2` | No. 8 · D major · K.311 | 2 | Andante con espressione |
| `mz_311_3` | No. 8 · D major · K.311 | 3 | Rondo: Allegro |
| `mz_330_1` | No. 10 · C major · **K.330** | 1 | Allegro moderato |
| `mz_330_2` | No. 10 · C major · K.330 | 2 | Andante cantabile (หวาน ช้า) |
| `mz_330_3` | No. 10 · C major · K.330 | 3 | Allegretto |
| `mz_331_1` | No. 11 · A major · **K.331** | 1 | Andante grazioso (ธีม+แปร) — นุ่ม ⭐ |
| `mz_331_2` | No. 11 · A major · K.331 | 2 | Menuetto |
| `mz_331_3` | No. 11 · A major · K.331 | 3 | **Rondo Alla Turca** (Turkish March) ⭐⭐ ดังสุด |
| `mz_332_1` | No. 12 · F major · **K.332** | 1 | Allegro |
| `mz_332_2` | No. 12 · F major · K.332 | 2 | Adagio (ช้า สงบ) |
| `mz_332_3` | No. 12 · F major · K.332 | 3 | Allegro assai (เร็ว) |
| `mz_333_1` | No. 13 · B♭ major · **K.333** | 1 | Allegro |
| `mz_333_2` | No. 13 · B♭ major · K.333 | 2 | Andante cantabile |
| `mz_333_3` | No. 13 · B♭ major · K.333 | 3 | Allegretto grazioso |
| `mz_545_1` | No. 16 · C major · **K.545** *"Sonata facile"* | 1 | **Allegro** ⭐⭐ จำง่าย เหมาะ BGM |
| `mz_545_2` | No. 16 · C major · K.545 | 2 | Andante (ช้า อ่อนโยน) ⭐ |
| `mz_545_3` | No. 16 · C major · K.545 | 3 | Rondo: Allegretto |
| `mz_570_1` | No. 17 · B♭ major · **K.570** | 1 | Allegro |
| `mz_570_2` | No. 17 · B♭ major · K.570 | 2 | Adagio (ช้า ลึก) ⭐ |
| `mz_570_3` | No. 17 · B♭ major · K.570 | 3 | Allegretto |

## แนะนำสำหรับ BGM คลิปดาราศาสตร์
- **สงบ/ช้า (อวกาศ ครุ่นคิด):** `mz_545_2`, `mz_332_2`, `mz_570_2`, `mz_330_2`
- **สดใส/จำง่าย (เปิดคลิป):** `mz_545_1` (Sonata facile), `mz_331_1`
- **โดดเด่น/มีพลัง:** `mz_331_3` (Alla Turca)

## วิธี render (headless · หลังตั้ง Piano template เสร็จ)
```
cd C:\horatad-media\clips
python _mid2rpp.py mozart/mz_545_1.mid _piano_template.rpp _r.rpp C:\horatad-media\clips\out_545_1.wav
"C:\Program Files\REAPER (x64)\reaper.exe" -renderproject C:\horatad-media\clips\_r.rpp
```
