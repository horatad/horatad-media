# regen-seg05-09.py — regenerate เฉพาะ seg05-09 (ข้อความใหม่ · สั้นลง + แก้ Epicycle→สุริยยาตร์)
# ต้องเปิด F5 voice server ก่อน: C:\horatad-voice\start-voice-server.bat
import os, json, base64, subprocess, urllib.request

F5_GATEWAY = "http://localhost:8765"
OUT = "public/vo-bangkok1782"
SPEED = 0.92

SEGS = [
    (5, "ในปี ๒๓๒๕ ยังไม่มีเวลามาตรฐาน แต่ละเมืองใช้เวลาสุริยะ"),
    (6, "กรุงเทพที่ร้อยองศาครึ่งตะวันออก ช้ากว่าเวลาโซนสิบแปดนาที"),
    (7, "รัชกาลที่หกประกาศเวลามาตรฐาน ปีสองพันสี่ร้อยหกสาม"),
    (8, "หกโมงห้าสิบสี่ เวลาสุริยะ คือเจ็ดโมงสิบสอง เวลามาตรฐาน"),
    (9, "โหราจารย์ใช้คัมภีร์สุริยยาตร์คำนวณ รู้ว่าดาวพฤหัสกับเสาร์ยังกุมกันอยู่"),
]

def health():
    try:
        with urllib.request.urlopen(F5_GATEWAY+"/health", timeout=5) as r:
            return bool(json.loads(r.read()).get("ok"))
    except Exception as e:
        print(f"❌ F5 ไม่ตอบ ({e}) → เปิด start-voice-server.bat ก่อน")
        return False

def tts(text):
    body = json.dumps({"text": text, "speed": SPEED}).encode()
    req  = urllib.request.Request(F5_GATEWAY+"/tts", data=body,
                                  headers={"Content-Type":"application/json"})
    with urllib.request.urlopen(req, timeout=300) as r:
        return base64.b64decode(json.loads(r.read())["audioContent"])

if not health():
    exit(1)

os.makedirs(OUT, exist_ok=True)
for idx, text in SEGS:
    fn = f"{OUT}/seg{idx:02d}.mp3"
    wav = tts(text)
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i","pipe:0",
                    "-codec:a","libmp3lame","-q:a","2", fn],
                   input=wav, check=True)
    print(f"  ✓ seg{idx:02d} → {fn}  ({len(text)} อักษร)")

print("\n✅ เสร็จ — วัด DUR ด้วย:")
print("  python -c \"import subprocess,json; [print(f'seg{i:02d}: ' + str(round(float([x for x in subprocess.check_output(['ffprobe','-v','quiet','-show_entries','format=duration','-of','json',f'public/vo-bangkok1782/seg{i:02d}.mp3']).decode().split() if x.replace('.','').isdigit()][0])*30))) for i in range(11)]\"")
