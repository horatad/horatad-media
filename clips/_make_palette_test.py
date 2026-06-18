#!/usr/bin/env python
# MIDI ทดสอบกลางสำหรับ "ฟัง BBCSO ครบทุกเครื่อง" (palette audition)
# ออกแบบให้ "ตัดสินเสียงเครื่อง" ได้ครบทุกมิติ + ช่วงเสียงปลอดภัยกับเครื่องส่วนใหญ่
# (เพลงจริงใช้ไม่ได้ เพราะเขียนเจาะเครื่องเดียว เล่นข้ามเครื่อง = ออกนอกช่วง/เพี้ยน)
#
# โครงท่อน ~13 วิ (tempo 80) ช่วง G3–A4 เป็นหลัก:
#   1) วลี legato ไล่ขึ้น C-D-E-F-G   → โชว์การต่อเสียง/legato
#   2) โน้ตยาว A4 + dynamic swell (CC1 ↑↓) → โชว์การไล่ดัง-เบา (จุดเด่น BBCSO)
#   3) โน้ตสั้นกระชับ E-E (staccato)   → โชว์ attack/transient
#   4) คอร์ด C major ยาว (C-E-G)       → โชว์ timbre รวม/หางเสียง
# CC1 = mod wheel = BBCSO map เป็น "dynamics" (ไล่ชั้น sample) → ฟังคาแรกเตอร์เครื่องชัด
import mido
from mido import Message, MidiFile, MidiTrack, MetaMessage

PPQ = 480
mf = MidiFile(ticks_per_beat=PPQ)
tr = MidiTrack(); mf.tracks.append(tr)
tr.append(MetaMessage('set_tempo', tempo=mido.bpm2tempo(80), time=0))
tr.append(Message('control_change', control=1, value=64, time=0))  # ตั้ง dynamics กลาง

VEL = 96
def b(beats): return int(beats * PPQ)

def legato(p, beats, overlap=0.12):
    # note ยาวเกิน gap เล็กน้อยให้ต่อเสียง (legato)
    tr.append(Message('note_on',  note=p, velocity=VEL, time=0))
    tr.append(Message('note_off', note=p, velocity=0,   time=b(beats + overlap)))

def staccato(p, gap=0):
    tr.append(Message('note_on',  note=p, velocity=VEL+8, time=gap))
    tr.append(Message('note_off', note=p, velocity=0,     time=b(0.2)))

def cc(val, time=0):
    tr.append(Message('control_change', control=1, value=val, time=time))

# 1) legato ไล่ขึ้น
for p in (60, 62, 64, 65, 67):     # C D E F G
    legato(p, 0.5)

# 2) โน้ตยาว A4 + swell (CC1 40→115→55)
tr.append(Message('note_on', note=69, velocity=VEL, time=b(0.2)))
cc(40, b(0.0)); cc(70, b(0.5)); cc(100, b(0.5)); cc(115, b(0.4)); cc(80, b(0.4)); cc(55, b(0.4))
tr.append(Message('note_off', note=69, velocity=0, time=b(0.3)))

# 3) staccato E-E
staccato(64, gap=b(0.3))
staccato(64, gap=b(0.3))

# 4) คอร์ด C major ยาว + dynamics กลาง-เข้ม
cc(90, b(0.4))
tr.append(Message('note_on', note=55, velocity=VEL, time=0))   # G3 (เพิ่ม body ล่าง)
tr.append(Message('note_on', note=60, velocity=VEL, time=0))   # C4
tr.append(Message('note_on', note=64, velocity=VEL, time=0))   # E4
tr.append(Message('note_on', note=67, velocity=VEL, time=0))   # G4
DUR = b(3.5)
tr.append(Message('note_off', note=55, velocity=0, time=DUR))
tr.append(Message('note_off', note=60, velocity=0, time=0))
tr.append(Message('note_off', note=64, velocity=0, time=0))
tr.append(Message('note_off', note=67, velocity=0, time=0))

out = "_bbcso_palette_test.mid"
mf.save(out)
print("OK ->", out, "| length =", round(mf.length, 2), "sec")
