#!/usr/bin/env python
# วาง MIDI ออร์เคสตรา (หลายพาร์ท) ลง palette rpp โดยแมปแต่ละพาร์ท→เครื่อง BBCSO ที่ตรงกัน
# → render ได้ "ทั้งวง BBCSO เล่นเพลงจริงพร้อมกัน"
# พาร์ทเล่นในช่วงเสียง/จังหวะจริงของเพลง (ใช้ tempo map ของไฟล์) ไม่ต้อง transpose
#
# ใช้: python _inject_symphony.py <symphony.mid> [palette.rpp] [out.rpp]
import sys, struct, re

MIDI = sys.argv[1]
SRC  = sys.argv[2] if len(sys.argv) > 2 else "_bbcso_palette.rpp"
OUT  = sys.argv[3] if len(sys.argv) > 3 else "_symphony_filled.rpp"

def read_vlq(d, i):
    v = 0
    while True:
        b = d[i]; i += 1; v = (v << 7) | (b & 0x7f)
        if not b & 0x80: break
    return v, i

def parse(path):
    d = open(path, 'rb').read(); assert d[:4] == b'MThd'
    fmt, ntrk, div = struct.unpack('>HHH', d[8:14]); i = 14
    tempos = []; tracks = []   # tracks: (name, [(tick,bytes)])
    while i < len(d) and d[i:i+4] == b'MTrk':
        ln = struct.unpack('>I', d[i+4:i+8])[0]; i += 8; end = i + ln
        t = 0; st = 0; name = None; evs = []
        while i < end:
            dt, i = read_vlq(d, i); t += dt
            b = d[i]
            if b & 0x80: st = b; i += 1
            else: b = st
            if b == 0xff:
                mt = d[i]; i += 1; ml, i = read_vlq(d, i); data = d[i:i+ml]; i += ml
                if mt == 0x51 and ml == 3: tempos.append((t, (data[0]<<16)|(data[1]<<8)|data[2]))
                elif mt in (0x03, 0x04) and name is None: name = data.decode('latin1','ignore')
            elif b in (0xf0, 0xf7):
                ml, i = read_vlq(d, i); i += ml
            else:
                ev = b & 0xf0
                if ev == 0xc0:            # program change — ข้าม
                    i += 1
                elif ev == 0xd0:
                    p1 = d[i]; i += 1; evs.append((t, bytes([0xd0, p1])))   # force ch0
                else:
                    p1 = d[i]; p2 = d[i+1]; i += 2
                    evs.append((t, bytes([ev, p1, p2])))                    # force ch0
        i = end; tracks.append((name or "-", evs))
    if not tempos: tempos = [(0, 500000)]
    tempos.sort()
    return div, tempos, tracks

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

div, tempos, mtracks = parse(MIDI)
t2s = t2s_fn(div, tempos)
TPS = 960.0

# bake พาร์ทหนึ่ง → (E-lines, ความยาววินาที)
def bake(evs):
    baked = sorted((int(round(t2s(tk) * TPS)), by) for tk, by in evs)
    e = ["        HASDATA 1 480 QN", "        CCINTERP 32", "        IGNTEMPO 1 120 4 4"]
    prev = 0
    for rt, by in baked:
        d = rt - prev; prev = rt
        e.append("        E %d %s" % (d, " ".join("%02x" % x for x in by)))
    e.append("        E %d b0 7b 00" % int(round(2 * TPS)))
    dur = (max(t2s(tk) for tk, _ in evs) + 1.0) if evs else 0.0
    return "\n".join(e), dur

# แมป: ชื่อ track palette (lower) → keyword หา MIDI track ที่ตรง
def midi_kw(palette_name):
    p = palette_name.lower()
    # เรียงเจาะจงก่อน: bassoon/trombone/tuba/piccolo/harp/piano ต้องมาก่อน "bass"
    table = [("violins 1","violins 1"),("violin 1","violins 1"),("violins 2","violins 2"),
             ("violin 2","violins 2"),("viola","viola"),("cello","cello"),
             ("bassoon","bassoon"),("trombone",None),("tuba",None),("piccolo",None),
             ("harp",None),("piano",None),
             ("contrabass","basses"),("double bass","basses"),("bass","basses"),
             ("horn","horn"),("trumpet","trumpet"),("flute","flute"),("oboe","oboe"),
             ("clarinet","clarinet"),("percussion","timpani"),("timpani","timpani")]
    for k, kw in table:
        if k in p: return kw
    return None

# index MIDI tracks by lowered name
def find_mtrack(kw):
    for nm, evs in mtracks:
        if kw and kw in nm.lower() and evs: return (nm, evs)
    return None

baked_cache = {}
def get_bake(nm, evs):
    if nm not in baked_cache: baked_cache[nm] = bake(evs)
    return baked_cache[nm]

def make_item(idx, src_block, dur):
    g1 = "{%08X-1111-4111-8111-%012X}" % (idx, idx)
    g2 = "{%08X-2222-4222-8222-%012X}" % (idx, idx)
    return "\n".join([
        "    <ITEM","      POSITION 0","      SNAPOFFS 0","      LENGTH %.6f" % (dur + 2),
        "      LOOP 0","      ALLTAKES 0","      FADEIN 1 0 0 1 0 0 0","      FADEOUT 1 0 0 1 0 0 0",
        "      MUTE 0 0","      SEL 0","      IGUID %s" % g1,"      IID %d" % (idx+1),
        "      NAME sym","      VOLPAN 1 0 1 -1","      SOFFS 0 0",
        "      PLAYRATE 1 1 0 -1 0 0.0025","      CHANMODE 0","      GUID %s" % g2,
        "      <SOURCE MIDI", src_block, "      >", "    >"])

lines = open(SRC, encoding="utf-8", errors="ignore").read().split("\n")
out = []; in_track = False; idx = 0; tname = None; mapped = 0
for ln in lines:
    if ln.startswith("  <TRACK"): in_track = True; tname = None
    if in_track and tname is None:
        m = re.match(r'\s*NAME "?(.*?)"?\s*$', ln)
        if m: tname = m.group(1)
    if in_track and re.match(r"\s*MUTESOLO ", ln): ln = "    MUTESOLO 0 0 0"
    if in_track and ln == "  >":
        kw = midi_kw(tname); mt = find_mtrack(kw)
        if mt:
            sb, dur = get_bake(*mt)
            out.append(make_item(idx, sb, dur)); mapped += 1
            print("   %2d. %-16s <- MIDI '%s' (%.0fs)" % (idx+1, tname, mt[0], dur))
        else:
            print("   %2d. %-16s <- (เงียบ ไม่มีพาร์ทในเพลงนี้)" % (idx+1, tname))
        idx += 1; in_track = False
    out.append(ln)

open(OUT, "w", encoding="utf-8").write("\n".join(out))
print("OK: แมป %d/%d เครื่อง -> %s" % (mapped, idx, OUT))
