#!/usr/bin/env python
# Render BBCSO palette audition: solo ทีละ track ใน _bbcso_palette.rpp แล้ว
# reaper -renderproject → ได้ WAV ต่อเครื่อง (เครื่องเดียวต่อไฟล์)
#
# ใช้: python _render_palette.py [project.rpp]   (default _bbcso_palette.rpp)
# ต้องตั้ง multitrack เสร็จก่อน: แต่ละ track = BBCSO 1 เครื่อง + MIDI item เดียวกัน
#
# กลไก: render เคารพ solo → set MUTESOLO ของ track เป้าหมาย solo=1, ที่เหลือ 0
#        + แทน RENDER_FILE เป็น out/_palette_NN_<track>.wav แล้วสั่ง render ทีละตัว
import sys, os, re, subprocess, unicodedata

REAPER = r"C:\Program Files\REAPER (x64)\reaper.exe"
PROJ = sys.argv[1] if len(sys.argv) > 1 else "_bbcso_palette.rpp"
OUTDIR = os.path.abspath("_palette_out")
os.makedirs(OUTDIR, exist_ok=True)

lines = open(PROJ, encoding="utf-8", errors="ignore").read().split("\n")

# เก็บชื่อ track (NAME แรกหลัง <TRACK) ตามลำดับ + index ของบรรทัด MUTESOLO ราย track
track_names, mutesolo_idx = [], []
i = 0
while i < len(lines):
    if lines[i].strip().startswith("<TRACK"):
        # หา NAME "..." บรรทัดถัดไปในบล็อก track (ก่อนเจอ <FXCHAIN/<ITEM)
        for j in range(i + 1, min(i + 8, len(lines))):
            m = re.match(r'\s*NAME "?(.*?)"?\s*$', lines[j])
            if m:
                track_names.append(m.group(1) or "track%d" % len(track_names))
                break
        else:
            track_names.append("track%d" % len(track_names))
    if re.match(r"\s*MUTESOLO ", lines[i]):
        mutesolo_idx.append(i)
    i += 1

n = len(mutesolo_idx)
if n == 0:
    sys.exit("ไม่พบ track (MUTESOLO) ใน %s — ตั้ง project ก่อน" % PROJ)
if len(track_names) < n:
    track_names += ["track%d" % k for k in range(len(track_names), n)]
print("พบ %d track: %s" % (n, ", ".join(track_names[:n])))

def slug(s):
    s = unicodedata.normalize("NFC", s).strip().replace(" ", "_")
    return re.sub(r'[\\/:*?"<>|]+', "", s) or "track"

for k in range(n):
    buf = list(lines)
    # solo เฉพาะ track k
    for t, idx in enumerate(mutesolo_idx):
        parts = buf[idx].split()
        # MUTESOLO <mute> <solo> <solodefeat...> — set mute=0, solo=(t==k)
        if len(parts) >= 3:
            parts[1] = "0"
            parts[2] = "1" if t == k else "0"
            buf[idx] = ("    " + " ".join(parts))
    out_wav = os.path.join(OUTDIR, "_palette_%02d_%s.wav" % (k + 1, slug(track_names[k])))
    for li, ln in enumerate(buf):
        if ln.strip().startswith("RENDER_FILE"):
            buf[li] = '  RENDER_FILE "%s"' % out_wav
        elif ln.strip().startswith("RENDER_STEMS"):
            buf[li] = "  RENDER_STEMS 0"
    tmp = os.path.join(OUTDIR, "_tmp_render_%02d.rpp" % (k + 1))
    open(tmp, "w", encoding="utf-8").write("\n".join(buf))
    print("[%d/%d] render %s ..." % (k + 1, n, os.path.basename(out_wav)))
    subprocess.run([REAPER, "-renderproject", tmp], check=False)
    os.remove(tmp)

print("เสร็จ → ไฟล์อยู่ %s" % OUTDIR)
