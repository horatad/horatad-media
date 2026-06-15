# gen-vo.py — generate voiceover ไทย (edge-tts, ฟรี) ต่อ segment ตาม timing ของ Caption
# run: python gen-vo.py   (จากโฟลเดอร์ epicycle/)
import asyncio, edge_tts, os

VOICE = "th-TH-NiwatNeural"   # เสียงชาย neural
RATE = "+6%"
OUT = "public/vo"
os.makedirs(OUT, exist_ok=True)

# บทเสียง — ตรงกับ Caption segments (เขียนตัวเลขเป็นคำ · "ทอเลมี" ออกเสียงถูก)
SEGMENTS = [
    "ทำไมดาวบนฟ้า ถึงดูเหมือนเดินถอยหลัง",
    "เมื่อพันเก้าร้อยปีก่อน ทอเลมี นักดาราศาสตร์กรีก",
    "อธิบายปริศนานี้ไว้แล้ว",
    "เขาวาดวงโคจรซ้อนวงโคจร เรียกว่า เอพิไซเคิล",
    "ดาวเดินวนในวงเล็ก ขณะที่วงใหญ่พาโคจรรอบโลก",
    "โมเดลนี้ผิด",
    "โลกไม่ใช่ศูนย์กลาง",
    "แต่มันแม่นพอจะทำนายท้องฟ้าได้นานถึงพันสี่ร้อยปี",
    "ความรู้นี้เดินทางจากกรีก สู่อินเดีย",
    "เติมราหูและเกตุ ครบเป็นพระเคราะห์ทั้งเก้า",
    "แล้วส่งต่อมาถึงโหราศาสตร์ไทย",
    "พระเคราะห์ที่นักโหราศาสตร์ไทยใช้ดูดวง",
    "คือดาวดวงเดียวกับที่ทอเลมีวาดไว้ เมื่อพันเก้าร้อยปีก่อน",
]

async def main():
    for i, t in enumerate(SEGMENTS):
        f = f"{OUT}/seg{i:02d}.mp3"
        await edge_tts.Communicate(t, VOICE, rate=RATE).save(f)
        print("✓", f)

asyncio.run(main())
print("เสร็จ —", len(SEGMENTS), "segments ใน", OUT)
