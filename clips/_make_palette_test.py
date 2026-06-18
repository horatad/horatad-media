#!/usr/bin/env python
# สร้าง MIDI ทดสอบกลางสำหรับ "ฟัง BBCSO ครบทุกเครื่อง" (palette audition)
# ท่อนสั้น ~10 วิ: ไล่โน้ต 5 ตัว (เห็น attack/legato) + คอร์ดยาว (เห็น sustain/timbre)
# ช่วงเสียงกลาง (รอบ C4) เครื่องส่วนใหญ่เล่นได้ · velocity 96 (ดังกลาง ๆ)
# เอาไฟล์นี้ไปวาง "ทุก track" ตำแหน่งเดียวกัน เพื่อเทียบเสียงเครื่องต่อเครื่อง
import mido
from mido import Message, MidiFile, MidiTrack, MetaMessage

PPQ = 480
mf = MidiFile(ticks_per_beat=PPQ)
tr = MidiTrack(); mf.tracks.append(tr)
tr.append(MetaMessage('set_tempo', tempo=mido.bpm2tempo(100), time=0))

VEL = 96
def note(p, beats, gap=0):
    dur = int(beats * PPQ)
    tr.append(Message('note_on',  note=p, velocity=VEL, time=gap))
    tr.append(Message('note_off', note=p, velocity=0,   time=dur))

# 1) ไล่โน้ต C4 D4 E4 F4 G4 (ตัวละ 0.5 จังหวะ) — โชว์ attack/legato
for p in (60, 62, 64, 65, 67):
    note(p, 0.5)

# 2) โน้ตยาว C4 (2 จังหวะ) — โชว์ sustain
note(60, 2.0)

# 3) คอร์ด C major ยาว (C4 E4 G4 พร้อมกัน 3 จังหวะ) — โชว์ timbre รวม
DUR = int(3.0 * PPQ)
tr.append(Message('note_on', note=60, velocity=VEL, time=PPQ//2))  # หยุดสั้น ๆ ก่อน
tr.append(Message('note_on', note=64, velocity=VEL, time=0))
tr.append(Message('note_on', note=67, velocity=VEL, time=0))
tr.append(Message('note_off', note=60, velocity=0, time=DUR))
tr.append(Message('note_off', note=64, velocity=0, time=0))
tr.append(Message('note_off', note=67, velocity=0, time=0))

out = "_bbcso_palette_test.mid"
mf.save(out)
print("OK ->", out, "| length =", round(mf.length, 2), "sec")
