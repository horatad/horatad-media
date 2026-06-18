#!/usr/bin/env python
# Render BBCSO palette audition แบบ "เปิด REAPER ครั้งเดียว":
# project (_filled) วาง MIDI แต่ละเครื่องเหลื่อมเวลากัน (STEP วิ) → render master รวดเดียว
# → ffmpeg ตัดแยกเป็น WAV ต่อเครื่องตามตำแหน่ง POSITION ของแต่ละ item
#
# ใช้: python _render_palette.py [_bbcso_palette_filled.rpp]
import sys, os, re, subprocess, unicodedata

REAPER = r"C:\Program Files\REAPER (x64)\reaper.exe"
PROJ = sys.argv[1] if len(sys.argv) > 1 else "_bbcso_palette_filled.rpp"
OUTDIR = os.path.abspath("_palette_out"); os.makedirs(OUTDIR, exist_ok=True)
MASTER = os.path.abspath(os.path.join(OUTDIR, "_palette_master.wav"))
CUTLEN = 12.0   # วินาทีที่ตัดต่อเครื่อง (ครอบเสียง ~8วิ + หางรีเวิร์บ)

lines = open(PROJ, encoding="utf-8", errors="ignore").read().split("\n")

# ชื่อ track (NAME แรกหลัง <TRACK) + POSITION ของ item แต่ละ track (เรียงลำดับ track)
names, positions = [], []
i = 0
while i < len(lines):
    if lines[i].startswith("  <TRACK"):
        nm = None; pos = None
        j = i + 1
        while j < len(lines) and not lines[j].startswith("  <TRACK"):
            if nm is None:
                m = re.match(r'\s*NAME "?(.*?)"?\s*$', lines[j])
                if m: nm = m.group(1)
            mp = re.match(r"\s*POSITION ([0-9.]+)", lines[j])
            if mp and pos is None: pos = float(mp.group(1))
            j += 1
        names.append(nm or "track%d" % len(names))
        positions.append(pos if pos is not None else len(positions) * 13.0)
        i = j; continue
    i += 1

n = len(names)
print("พบ %d track:" % n)
for k in range(n):
    print("  %2d. %-18s @ %.1fs" % (k + 1, names[k], positions[k]))

# ตั้ง render settings: master mix, ทั้งโปรเจกต์
for li, ln in enumerate(lines):
    s = ln.strip()
    if s.startswith("RENDER_FILE"):   lines[li] = '  RENDER_FILE "%s"' % MASTER
    elif s.startswith("RENDER_STEMS"): lines[li] = "  RENDER_STEMS 0"
    elif s.startswith("RENDER_RANGE"): lines[li] = "  RENDER_RANGE 1 0 0 0 1000"
tmp = os.path.join(OUTDIR, "_render_all.rpp")
open(tmp, "w", encoding="utf-8").write("\n".join(lines))

print("\n>>> เปิด REAPER ครั้งเดียว render master (~%.0fs timeline) ..." % (n * 13.0))
subprocess.run([REAPER, "-renderproject", tmp], check=False)
if not os.path.exists(MASTER):
    sys.exit("!! ไม่พบ master render — ดู REAPER")

def slug(s):
    s = unicodedata.normalize("NFC", s).strip().replace(" ", "_")
    return re.sub(r'[\\/:*?"<>|]+', "", s) or "track"

print("\n>>> ตัดแยกเป็นไฟล์ต่อเครื่อง (ffmpeg) ...")
for k in range(n):
    out_wav = os.path.join(OUTDIR, "_palette_%02d_%s.wav" % (k + 1, slug(names[k])))
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                    "-ss", "%.3f" % positions[k], "-t", "%.3f" % CUTLEN,
                    "-i", MASTER, out_wav], check=False)
    print("   %2d. %s" % (k + 1, os.path.basename(out_wav)))

print("\nเสร็จ → %s (เปิด REAPER ครั้งเดียว)" % OUTDIR)
