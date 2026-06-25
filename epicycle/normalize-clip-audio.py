# -*- coding: utf-8 -*-
"""
normalize เสียงต้นทางของคลิป (voiceover + BGM clip) ให้เป็น -16 LUFS
= มาตรฐานมิกซ์เสียง Shorts (ดู SHORTS_TEMPLATE.md ## 4) ให้ "เสียงคน:เพลง" เข้ากันทุกคลิป
   โดยไม่ต้องจูน gain/duck ทีละคลิป

วิธี: two-pass loudnorm + linear=true (รักษามิติ ไม่กดแบน) · TP -1.5 dB · q:a 0
มาตรฐานเดียวกับคลัง BGM "My favorite" ([[bgm-loudness-standard]])

ใช้ (ใส่ไฟล์หรือโฟลเดอร์ก็ได้ · โฟลเดอร์ = ทุก .mp3/.wav ข้างใน):
  python normalize-clip-audio.py public/vo-jupiter public/audio/paganini-o-mamma-clip.mp3
ตัวอย่างต่อคลิปใหม่:
  python normalize-clip-audio.py public/vo-<ชื่อ> public/audio/<เพลง>-clip.mp3
"""
import json
import os
import re
import subprocess
import sys
import tempfile

I_TARGET, TP_TARGET, LRA_TARGET = -16.0, -1.5, 11.0
EXTS = (".mp3", ".wav")


def expand(paths):
    out = []
    for p in paths:
        if os.path.isdir(p):
            out += [os.path.join(p, f) for f in sorted(os.listdir(p))
                    if f.lower().endswith(EXTS)]
        elif os.path.isfile(p):
            out.append(p)
        else:
            print(f"  ? ไม่พบ {p}")
    return out


def measure(path):
    cmd = ["ffmpeg", "-hide_banner", "-i", path, "-af",
           f"loudnorm=I={I_TARGET}:TP={TP_TARGET}:LRA={LRA_TARGET}:print_format=json",
           "-f", "null", "-"]
    out = subprocess.run(cmd, capture_output=True, text=True).stderr
    block = out[out.rfind("{"):out.rfind("}") + 1]
    return json.loads(block)


def normalize(path):
    name = os.path.basename(path)
    d = measure(path)
    is_wav = path.lower().endswith(".wav")
    fd, tmp = tempfile.mkstemp(suffix=".wav" if is_wav else ".mp3",
                               dir=os.path.dirname(path) or ".")
    os.close(fd)
    af = (f"loudnorm=I={I_TARGET}:TP={TP_TARGET}:LRA={LRA_TARGET}:"
          f"measured_I={d['input_i']}:measured_TP={d['input_tp']}:"
          f"measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:"
          f"offset={d['target_offset']}:linear=true")
    codec = ["-c:a", "pcm_s16le"] if is_wav else ["-c:a", "libmp3lame", "-q:a", "0"]
    r = subprocess.run(["ffmpeg", "-y", "-hide_banner", "-i", path, "-af", af, *codec, tmp],
                       capture_output=True, text=True)
    if r.returncode != 0 or not os.path.getsize(tmp):
        os.path.exists(tmp) and os.remove(tmp)
        print(f"  ✗ {name} — ffmpeg error")
        return
    os.replace(tmp, path)
    print(f"  ✓ {name}  ({d['input_i']} -> {I_TARGET} LUFS)")


def main():
    files = expand(sys.argv[1:])
    if not files:
        sys.exit("ใส่ไฟล์/โฟลเดอร์เสียงที่จะ normalize (vo + bgm clip)")
    print(f"normalize -> {I_TARGET} LUFS / TP {TP_TARGET} dB  ({len(files)} ไฟล์)")
    for f in files:
        normalize(f)
    print("เสร็จ · ต่อไปตั้ง Music gain=1.0 duck=0.55 แล้ว render+วัด (SHORTS_TEMPLATE.md ## 4)")


if __name__ == "__main__":
    main()
