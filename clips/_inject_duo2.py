#!/usr/bin/env python
# วาง Spring MIDI ลง _duo_violinone.rpp: track1=ไวโอลิน(Sonatina) track2=เปียโน(4Front)
# (แมปตามลำดับ track · POSITION 0 · velocity ธรรมชาติ — Sonatina ตอบสนอง velocity ปกติ)
# ใช้: python _inject_duo2.py <duo.mid> [project.rpp] [out.rpp]
import sys, struct, re

MIDI = sys.argv[1]
PROJ = sys.argv[2] if len(sys.argv) > 2 else "_duo_violinone.rpp"
OUT  = sys.argv[3] if len(sys.argv) > 3 else "_duo2_filled.rpp"

def read_vlq(d,i):
    v=0
    while True:
        b=d[i]; i+=1; v=(v<<7)|(b&0x7f)
        if not b&0x80: break
    return v,i

def parse(path):
    d=open(path,'rb').read(); assert d[:4]==b'MThd'
    fmt,ntrk,div=struct.unpack('>HHH',d[8:14]); i=14; tempos=[]; tracks=[]
    while i<len(d) and d[i:i+4]==b'MTrk':
        ln=struct.unpack('>I',d[i+4:i+8])[0]; i+=8; end=i+ln; t=0; st=0; name=None; evs=[]
        while i<end:
            dt,i=read_vlq(d,i); t+=dt
            b=d[i]
            if b&0x80: st=b; i+=1
            else: b=st
            if b==0xff:
                mt=d[i]; i+=1; ml,i=read_vlq(d,i); data=d[i:i+ml]; i+=ml
                if mt==0x51 and ml==3: tempos.append((t,(data[0]<<16)|(data[1]<<8)|data[2]))
                elif mt in(0x03,0x04) and name is None: name=data.decode('latin1','ignore')
            elif b in(0xf0,0xf7):
                ml,i=read_vlq(d,i); i+=ml
            else:
                ev=b&0xf0
                if ev==0xc0: i+=1
                elif ev==0xd0: p1=d[i]; i+=1; evs.append((t,bytes([0xd0,p1])))
                else: p1=d[i]; p2=d[i+1]; i+=2; evs.append((t,bytes([ev,p1,p2])))
        i=end; tracks.append((name or "-",evs))
    if not tempos: tempos=[(0,500000)]
    tempos.sort(); return div,tempos,tracks

def t2s_fn(div,tempos):
    pts=[]; sec=0.0; lt=0; lu=tempos[0][1]
    for tk,us in tempos:
        sec+=(tk-lt)/div*(lu/1e6); pts.append((tk,sec,us)); lt=tk; lu=us
    def f(tick):
        bt,bs,us=pts[0]
        for ptk,ps,pu in pts:
            if ptk<=tick: bt,bs,us=ptk,ps,pu
            else: break
        return bs+(tick-bt)/div*(us/1e6)
    return f

div,tempos,mt=parse(MIDI)
t2s=t2s_fn(div,tempos); TPS=960.0
def pick(*keys):
    e=[]
    for nm,ev in mt:
        if any(k in nm.lower() for k in keys): e+=ev
    return e
violin=pick("violin","violino"); piano=pick("piano")
print("ไวโอลิน %d ev · เปียโน %d ev"%(len(violin),len(piano)))

import math
def bake(evs, vibrato=False, vib_hz=5.5, vib_cents=17):
    baked=[(int(round(t2s(tk)*TPS)),by) for tk,by in evs]
    if vibrato and baked:
        # ฉีด vibrato: pitchbend LFO ไซน์ ขณะมีโน้ตค้าง (กัน organ drone)
        # ติดตามโน้ตที่ค้างอยู่ → ใส่ pitchbend เฉพาะตอนมีเสียง
        depth=int(8192*vib_cents/200.0)  # สมมติ pitchbend range ±2 semitone
        onate=sorted(baked,key=lambda x:x[0])
        active=0; spans=[]; start=None
        for rt,by in onate:
            s=by[0]&0xf0
            if s==0x90 and by[2]>0:
                if active==0: start=rt
                active+=1
            elif s==0x80 or (s==0x90 and by[2]==0):
                active=max(0,active-1)
                if active==0 and start is not None: spans.append((start,rt)); start=None
        if start is not None: spans.append((start,onate[-1][0]))
        STEP=48  # ~50ms (20 จุด/วิ)
        for a,b in spans:
            if b-a<STEP: continue
            t=a
            while t<=b:
                val=8192+int(depth*math.sin(2*math.pi*vib_hz*(t/TPS)))
                val=max(0,min(16383,val))
                baked.append((t,bytes([0xe0,val&0x7f,(val>>7)&0x7f])))
                t+=STEP
        baked.append((0,bytes([0xe0,0x00,0x40])))  # center ตอนเริ่ม
    baked.sort(key=lambda x:x[0])
    e=["        HASDATA 1 480 QN","        CCINTERP 32","        IGNTEMPO 1 120 4 4"]
    prev=0
    for rt,by in baked:
        d=rt-prev; prev=rt
        e.append("        E %d %s"%(d," ".join("%02x"%x for x in by)))
    e.append("        E %d b0 7b 00"%int(round(2*TPS)))
    dur=(max(t2s(tk) for tk,_ in evs)+1.0) if evs else 0.0
    return "\n".join(e),dur

import os
VIB = os.environ.get("VIB","0")=="1"   # VSCO2 Arco Vib มี vibrato จริงแล้ว → default ไม่ฉีด
vsrc,vdur=bake(violin, vibrato=VIB); psrc,pdur=bake(piano)
def item(idx,src,dur):
    g="{%08X-5555-4555-8555-%012X}"%(idx,idx)
    return "\n".join(["    <ITEM","      POSITION 0","      SNAPOFFS 0","      LENGTH %.6f"%(dur+2),
        "      LOOP 0","      ALLTAKES 0","      FADEIN 1 0 0 1 0 0 0","      FADEOUT 1 0 0 1 0 0 0",
        "      MUTE 0 0","      SEL 0","      IGUID %s"%g,"      IID %d"%(idx+1),"      NAME duo",
        "      VOLPAN 1 0 1 -1","      SOFFS 0 0","      PLAYRATE 1 1 0 -1 0 0.0025","      CHANMODE 0",
        "      GUID %s"%g.replace("5555","6666"),"      <SOURCE MIDI",src,"      >","    >"])

lines=open(PROJ,encoding="utf-8",errors="ignore").read().split("\n")
out=[]; in_track=False; tidx=0
for ln in lines:
    if ln.startswith("  <TRACK"): in_track=True
    if in_track and re.match(r"\s*MUTESOLO ",ln): ln="    MUTESOLO 0 0 0"
    if in_track and ln=="  >":
        if tidx==0: out.append(item(0,vsrc,vdur)); print("  track1 <- ไวโอลิน")
        elif tidx==1: out.append(item(1,psrc,pdur)); print("  track2 <- เปียโน")
        tidx+=1; in_track=False
    out.append(ln)
open(OUT,"w",encoding="utf-8").write("\n".join(out))
print("OK -> %s (ไวโอลิน %.0fs เปียโน %.0fs)"%(OUT,vdur,pdur))
