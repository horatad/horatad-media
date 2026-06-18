#!/usr/bin/env python
# แทรก MIDI ทดสอบ (_bbcso_palette_test.mid) เป็น item ลง "ทุก track" ของ palette rpp
# แก้ปัญหา: พี่ save project มี BBCSO ครบแต่ลืมวาง MIDI item → render เงียบ
# วิธี: bake โน้ตเป็น E-lines (เหมือน _mid2rpp.py) สร้าง <ITEM> ต่อ track + GUID ไม่ซ้ำ
#        แทรกก่อนบรรทัดปิด track ("  >") · ออกเป็นไฟล์ใหม่ (_filled) ไม่แตะของพี่
import sys, struct, re

MIDI = "_bbcso_palette_test.mid"
SRC  = sys.argv[1] if len(sys.argv) > 1 else "_bbcso_palette.rpp"
OUT  = sys.argv[2] if len(sys.argv) > 2 else "_bbcso_palette_filled.rpp"

# ---- parse MIDI + bake (ตัดมาจาก _mid2rpp.py) ----
def read_vlq(d, i):
    v = 0
    while True:
        b = d[i]; i += 1; v = (v << 7) | (b & 0x7f)
        if not b & 0x80: break
    return v, i

def parse_midi(path):
    d = open(path, 'rb').read()
    assert d[:4] == b'MThd'
    fmt, ntrk, div = struct.unpack('>HHH', d[8:14]); i = 14
    evs = []; tempos = []
    while i < len(d) and d[i:i+4] == b'MTrk':
        ln = struct.unpack('>I', d[i+4:i+8])[0]; i += 8; end = i + ln
        t = 0; st = 0
        while i < end:
            dt, i = read_vlq(d, i); t += dt
            b = d[i]
            if b & 0x80: st = b; i += 1
            else: b = st
            if b == 0xff:
                mt = d[i]; i += 1; ml, i = read_vlq(d, i); data = d[i:i+ml]; i += ml
                if mt == 0x51 and ml == 3:
                    tempos.append((t, (data[0]<<16)|(data[1]<<8)|data[2]))
            elif b in (0xf0, 0xf7):
                ml, i = read_vlq(d, i); i += ml
            else:
                ev = b & 0xf0
                if ev in (0xc0, 0xd0):
                    p1 = d[i]; i += 1
                    if ev == 0xd0: evs.append((t, bytes([b, p1])))
                else:
                    p1 = d[i]; p2 = d[i+1]; i += 2
                    evs.append((t, bytes([b, p1, p2])))
        i = end
    if not tempos: tempos = [(0, 500000)]
    tempos.sort()
    return div, evs, tempos

def t2s_fn(div, tempos):
    pts = []; sec = 0.0; lt = 0; lu = tempos[0][1]
    for tk, us in tempos:
        sec += (tk - lt) / div * (lu / 1e6); pts.append((tk, sec, us)); lt = tk; lu = us
    def f(tick):
        bt, bs, us = pts[0]
        for ptk, ps, pu in pts:
            if ptk <= tick: bt, bs, us = ptk, ps, pu
            else: break
        return bs + (tick - bt) / div * (us / 1e6)
    return f

div, evs, tempos = parse_midi(MIDI)
t2s = t2s_fn(div, tempos)
TPS = 960.0
baked = sorted((int(round(t2s(tk) * TPS)), by) for tk, by in evs)
total_sec = (max(t2s(tk) for tk, _ in evs) + 1.0) if evs else 2.0
item_len = total_sec + 2.0
STEP = 13.0   # ระยะเหลื่อมเวลาต่อ track (วิ) — render รวดเดียวแล้วตัดแยกตาม STEP นี้

# เครื่องที่ช่วงเสียงไม่ตรงโน้ตทดสอบ → เลื่อนอ็อกเทฟ (0-based track index : semitone)
#   4=Basses (ต่ำ) -12 · 11=Piccolo (สูง) +24
TRANSPOSE = {4: -12, 11: 24}

def build_src(shift):
    e = ["        HASDATA 1 480 QN", "        CCINTERP 32", "        IGNTEMPO 1 120 4 4"]
    prev = 0
    for rt, by in baked:
        b = bytearray(by)
        if shift and (b[0] & 0xf0) in (0x80, 0x90, 0xa0):  # note off/on/poly-AT → transpose
            b[1] = max(0, min(127, b[1] + shift))
        delta = rt - prev; prev = rt
        e.append("        E %d %s" % (delta, " ".join("%02x" % x for x in b)))
    e.append("        E %d b0 7b 00" % int(round(2 * TPS)))
    return "\n".join(e)

def make_item(idx):
    g1 = "{%08X-1111-4111-8111-%012X}" % (idx, idx)
    g2 = "{%08X-2222-4222-8222-%012X}" % (idx, idx)
    return "\n".join([
        "    <ITEM",
        "      POSITION %.6f" % (idx * STEP),
        "      SNAPOFFS 0",
        "      LENGTH %.6f" % item_len,
        "      LOOP 0",
        "      ALLTAKES 0",
        "      FADEIN 1 0 0 1 0 0 0",
        "      FADEOUT 1 0 0 1 0 0 0",
        "      MUTE 0 0",
        "      SEL 0",
        "      IGUID %s" % g1,
        "      IID %d" % (idx + 1),
        "      NAME palette_test",
        "      VOLPAN 1 0 1 -1",
        "      SOFFS 0 0",
        "      PLAYRATE 1 1 0 -1 0 0.0025",
        "      CHANMODE 0",
        "      GUID %s" % g2,
        "      <SOURCE MIDI",
        build_src(TRANSPOSE.get(idx, 0)),
        "      >",
        "    >",
    ])

# ---- แทรก item ก่อนบรรทัดปิด track ("  >" = 2 ช่องว่าง) ----
lines = open(SRC, encoding="utf-8", errors="ignore").read().split("\n")
out = []; in_track = False; idx = 0; inserted = 0
for ln in lines:
    if ln.startswith("  <TRACK"):
        in_track = True
    if in_track and re.match(r"\s*MUTESOLO ", ln):
        ln = "    MUTESOLO 0 0 0"   # เปิดเสียงทุก track (ไม่ mute/solo) — เล่นครบในไทม์ไลน์เดียว
    if in_track and ln == "  >":
        out.append(make_item(idx)); inserted += 1; idx += 1
        in_track = False
    out.append(ln)

open(OUT, "w", encoding="utf-8").write("\n".join(out))
print("OK: baked %d events, item_len=%.1fs, STEP=%.1fs, แทรก %d track (เหลื่อมเวลา) -> %s"
      % (len(baked), item_len, STEP, inserted, OUT))
print("   total timeline ~%.0fs" % (inserted * STEP))
