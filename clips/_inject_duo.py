#!/usr/bin/env python
# ประกอบ REAPER project 2 track สำหรับ duo ไวโอลิน+เปียโน:
#   track1 = BBCSO Violins 1 (ดึงจาก _bbcso_palette.rpp)  <- พาร์ทไวโอลิน
#   track2 = 4Front R-Piano   (VST block จาก _4front_vst.snippet) <- พาร์ทเปียโน(2มือรวม)
# ใช้: python _inject_duo.py <duo.mid> [out.rpp]
import sys, struct, re

MIDI = sys.argv[1]
OUT  = sys.argv[2] if len(sys.argv) > 2 else "_duo_filled.rpp"
PAL  = "_bbcso_palette.rpp"

def read_vlq(d, i):
    v = 0
    while True:
        b = d[i]; i += 1; v = (v << 7) | (b & 0x7f)
        if not b & 0x80: break
    return v, i

def parse(path):
    d = open(path, 'rb').read(); assert d[:4] == b'MThd'
    fmt, ntrk, div = struct.unpack('>HHH', d[8:14]); i = 14
    tempos = []; tracks = []
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
                if mt == 0x51 and ml == 3: tempos.append((t,(data[0]<<16)|(data[1]<<8)|data[2]))
                elif mt in (0x03,0x04) and name is None: name = data.decode('latin1','ignore')
            elif b in (0xf0,0xf7):
                ml, i = read_vlq(d, i); i += ml
            else:
                ev = b & 0xf0
                if ev == 0xc0: i += 1
                elif ev == 0xd0: p1=d[i]; i+=1; evs.append((t, bytes([0xd0,p1])))
                else: p1=d[i]; p2=d[i+1]; i+=2; evs.append((t, bytes([ev,p1,p2])))
        i = end; tracks.append((name or "-", evs))
    if not tempos: tempos=[(0,500000)]
    tempos.sort(); return div, tempos, tracks

def t2s_fn(div, tempos):
    pts=[]; sec=0.0; lt=0; lu=tempos[0][1]
    for tk,us in tempos:
        sec += (tk-lt)/div*(lu/1e6); pts.append((tk,sec,us)); lt=tk; lu=us
    def f(tick):
        bt,bs,us=pts[0]
        for ptk,ps,pu in pts:
            if ptk<=tick: bt,bs,us=ptk,ps,pu
            else: break
        return bs+(tick-bt)/div*(us/1e6)
    return f

div, tempos, mtracks = parse(MIDI)
t2s = t2s_fn(div, tempos)
TPS = 960.0

def pick(*keys):  # รวม events จาก track ที่ชื่อมี keyword
    evs=[]
    for nm,ev in mtracks:
        if any(k in nm.lower() for k in keys): evs += ev
    return evs

violin = pick("violin","violino")
piano  = pick("piano")
print("ไวโอลิน %d events · เปียโน %d events"%(len(violin),len(piano)))

def bake(evs, setvel=None):
    # setvel: ถ้ากำหนด → ดัน velocity โน้ตทุกตัวขึ้นเป็นค่านี้ (BBCSO dynamics=velocity
    # → ดัง+สว่างขึ้น) · กันปัญหา section เล่นเบา-ทึบเพราะ velocity ต้นฉบับต่ำ
    baked=sorted((int(round(t2s(tk)*TPS)),by) for tk,by in evs)
    e=["        HASDATA 1 480 QN","        CCINTERP 32","        IGNTEMPO 1 120 4 4"]
    prev=0
    for rt,by in baked:
        b=bytearray(by)
        if setvel and (b[0]&0xf0)==0x90 and b[2]>0:   # note-on vel>0
            b[2]=max(1,min(127,setvel))
        d=rt-prev; prev=rt
        e.append("        E %d %s"%(d," ".join("%02x"%x for x in b)))
    e.append("        E %d b0 7b 00"%int(round(2*TPS)))
    dur=(max(t2s(tk) for tk,_ in evs)+1.0) if evs else 0.0
    return "\n".join(e), dur

vln_src, vln_dur = bake(violin, setvel=115)  # BBCSO ไวโอลิน: ดัน velocity → ดัง+สว่าง
pno_src, pno_dur = bake(piano)               # 4Front เปียโน: คง velocity เดิม

def make_item(idx, src, dur):
    g="{%08X-3333-4333-8333-%012X}"%(idx,idx)
    return "\n".join(["    <ITEM","      POSITION 0","      SNAPOFFS 0","      LENGTH %.6f"%(dur+2),
        "      LOOP 0","      ALLTAKES 0","      FADEIN 1 0 0 1 0 0 0","      FADEOUT 1 0 0 1 0 0 0",
        "      MUTE 0 0","      SEL 0","      IGUID %s"%g,"      IID %d"%(idx+1),"      NAME duo",
        "      VOLPAN 1 0 1 -1","      SOFFS 0 0","      PLAYRATE 1 1 0 -1 0 0.0025","      CHANMODE 0",
        "      GUID %s"%g.replace("3333","4444"),"      <SOURCE MIDI",src,"      >","    >"])

pal = open(PAL,encoding="utf-8",errors="ignore").read().split("\n")
# header = ก่อน track แรก
ft = next(i for i,l in enumerate(pal) if l.startswith("  <TRACK"))
header = pal[:ft]

# ดึงบล็อก track "Violins 1"
def track_block(name):
    i=0
    while i<len(pal):
        if pal[i].startswith("  <TRACK"):
            # ชื่อ track = NAME แรก
            for j in range(i+1,i+6):
                m=re.match(r'\s*NAME "?(.*?)"?\s*$',pal[j])
                if m:
                    if m.group(1)==name:
                        k=i+1
                        while pal[k]!="  >": k+=1
                        return pal[i:k+1]
                    break
        i+=1
    return None

vln_blk = track_block("Violins 1")
assert vln_blk, "ไม่เจอ track Violins 1"

# สร้าง piano track: copy vln block, แทน VST (BBCSO→4Front), เปลี่ยนชื่อ+GUID, ใส่ MUTESOLO ปกติ
four = open("_4front_vst.snippet",encoding="utf-8").read().split("\n")
pno_blk = list(vln_blk)
# แทนบล็อก <VST ...> ด้วย 4Front
vs=next(i for i,l in enumerate(pno_blk) if l.strip().startswith("<VST"))
ve=next(i for i in range(vs+1,len(pno_blk)) if pno_blk[i]=="      >")
pno_blk = pno_blk[:vs] + four + pno_blk[ve+1:]
# เปลี่ยนชื่อ + GUID ไม่ให้ซ้ำ
for i,l in enumerate(pno_blk):
    m=re.match(r'(\s*NAME )"?.*?"?\s*$',l)
    if m: pno_blk[i]=m.group(1)+'"Piano-4Front"'
    pno_blk[i]=pno_blk[i].replace("A22D","B33D")  # บิด GUID เล็กน้อย

def insert_item(blk, item):
    out=list(blk); out.insert(len(out)-1, item)  # ก่อน "  >" สุดท้าย
    # unmute/unsolo
    for i,l in enumerate(out):
        if re.match(r"\s*MUTESOLO ",l): out[i]="    MUTESOLO 0 0 0"
    return out

vln_blk = insert_item(vln_blk, make_item(0, vln_src, vln_dur))
pno_blk = insert_item(pno_blk, make_item(1, pno_src, pno_dur))

out = header + vln_blk + pno_blk + [">",""]
open(OUT,"w",encoding="utf-8").write("\n".join(out))
print("OK -> %s (ไวโอลิน %.0fs · เปียโน %.0fs)"%(OUT, vln_dur, pno_dur))
