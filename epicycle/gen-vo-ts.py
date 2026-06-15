# gen-vo-ts.py — voiceover ไทยสำหรับ TwoSystemsVert (เทียบ geo/helio) · edge-tts
# run: python gen-vo-ts.py
import asyncio, edge_tts, os

VOICE = "th-TH-NiwatNeural"
RATE = "+6%"
OUT = "public/vo-ts"
os.makedirs(OUT, exist_ok=True)

SEGMENTS = [
    "ทำไมคนโบราณวาดจักรวาลผิด มานานถึงพันสี่ร้อยปี",
    "เมื่อราวพันเก้าร้อยปีก่อน",
    "ทอเลมีให้โลกเป็นศูนย์กลางของจักรวาล",
    "แต่ดาวเคราะห์กลับดูเหมือนเดินถอยหลัง",
    "เขาจึงแก้ด้วยเอพิไซเคิล วงโคจรซ้อนวงโคจร",
    "แต่ความจริง ดวงอาทิตย์ต่างหากที่เป็นศูนย์กลาง",
    "พอย้ายดวงอาทิตย์มาไว้ตรงกลาง",
    "ทุกอย่างก็เรียบง่ายขึ้นทันที",
    "ดาวถอยหลังกลายเป็นแค่ภาพลวงตา ตอนโลกแซง",
    "ข้างบน คือแบบทอเลมี วงยุ่บยั่บ",
    "ข้างล่าง คือแบบจริง เรียบกว่ากันมาก",
    "ทอเลมีไม่ได้โง่",
    "แบบจำลองของเขายังถูกใช้กันมานานกว่าพันสี่ร้อยปี",
    "แต่คำอธิบายที่เรียบง่ายกว่า มักจะใกล้ความจริงที่สุด",
]

async def main():
    for i, t in enumerate(SEGMENTS):
        f = f"{OUT}/seg{i:02d}.mp3"
        await edge_tts.Communicate(t, VOICE, rate=RATE).save(f)
        print("✓", f)

asyncio.run(main())
print("เสร็จ —", len(SEGMENTS), "segs ใน", OUT)
