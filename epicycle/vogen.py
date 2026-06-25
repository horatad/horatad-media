# vogen.py — สร้าง voiceover ไทยได้ 2 เสียง (OPTION เลือกได้ต่อคลิป)
#   engine="edge" → th-TH-NiwatNeural (edge-tts · ออนไลน์ Microsoft)        = เสียงกลางเดิม
#   engine="f5"   → "เสียงโหราทาส" (F5-TTS clone พี่ปีเตอร์ · ลีลาโหร)      = ผ่าน A/B 25 มิ.ย. 69
#
# ใช้:  from vogen import gen
#       gen(SEGMENTS, "public/vo-xxx", engine="f5")        # โหราทาส
#       gen(SEGMENTS, "public/vo-xxx", engine="edge")      # Niwat
#
# ⚠️ F5 ต้องเปิดเซิร์ฟเวอร์ก่อน: C:\horatad-voice\start-voice-server.bat (gateway :8765)
#   ข้อจำกัด F5 (กันเสียงเพี้ยน): บทไทยล้วน · เลขเป็นคำไทย · ประโยคสั้น (<180 อักษร) · speed 0.85 (อย่าต่ำกว่า)
import os, json, base64, subprocess, urllib.request

F5_GATEWAY = "http://localhost:8765"
F5_SPEED   = 0.85


# ── edge-tts (Niwat) ────────────────────────────────────────────────
def gen_edge(segments, out, voice="th-TH-NiwatNeural", rate="+6%"):
    import asyncio, edge_tts
    os.makedirs(out, exist_ok=True)
    async def _run():
        for i, t in enumerate(segments):
            fn = f"{out}/seg{i:02d}.mp3"
            await edge_tts.Communicate(t, voice, rate=rate).save(fn)
            print(f"  OK seg{i:02d} (edge/Niwat)")
    asyncio.run(_run())


# ── F5 "เสียงโหราทาส" ───────────────────────────────────────────────
def _f5_health():
    try:
        with urllib.request.urlopen(F5_GATEWAY + "/health", timeout=5) as r:
            return bool(json.loads(r.read()).get("ok"))
    except Exception as e:
        print(f"❌ F5 gateway ไม่ตอบ ({e}) → เปิด C:\\horatad-voice\\start-voice-server.bat ก่อน")
        return False


def _f5_tts(text, speed=F5_SPEED):
    body = json.dumps({"text": text, "speed": speed}).encode("utf-8")
    req = urllib.request.Request(F5_GATEWAY + "/tts", data=body,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300) as r:
        return base64.b64decode(json.loads(r.read())["audioContent"])   # WAV bytes


def gen_f5(segments, out, speed=F5_SPEED):
    if not _f5_health():
        raise RuntimeError("F5 voice server ไม่พร้อม")
    os.makedirs(out, exist_ok=True)
    for i, t in enumerate(segments):
        wav = _f5_tts(t, speed)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "pipe:0",
                        "-codec:a", "libmp3lame", "-q:a", "2", f"{out}/seg{i:02d}.mp3"],
                       input=wav, check=True)
        print(f"  OK seg{i:02d} (f5/โหราทาส · {len(t)} อักษร)")


# ── dispatcher ──────────────────────────────────────────────────────
def gen(segments, out, engine="f5", **kw):
    print(f"🎙️  voiceover · engine={engine} · {len(segments)} segs → {out}/")
    (gen_f5 if engine == "f5" else gen_edge)(segments, out, **kw)
    print(f"✅ เสร็จ {len(segments)} segs → {out}/")
