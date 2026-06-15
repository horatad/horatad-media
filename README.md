# horatad-media — คลิปแอนิเมชันดาราศาสตร์/ปฏิทิน (Horatad)

โปรเจกต์ทำคลิปอธิบายดาราศาสตร์/ปฏิทินไทย ลง FB/Social + YouTube Shorts สนับสนุนงาน **Horatad** (โหราศาสตร์/ปฏิทินไทย)

## โครงสร้าง repo

```
horatad-media/                 ← repo เปลือกห่อ (เอกสาร + workflow)
├── CLAUDE.md                  คู่มือโปรเจกต์ (Claude อ่านทุก session)
├── STATE.md                   สถานะงานสำหรับศูนย์บัญชาการ
├── SHORTS_TEMPLATE.md         ⭐ recipe มาตรฐานผลิต Shorts
├── SHORTS_BEST_PRACTICES.md   หลักการ 7-beat / hook
├── FB-output/                 staging คลิป .mp4 + .docx (gitignored → ขึ้น Drive _FB&Social)
├── archive/                   ต้นแบบรุ่นเก่า (epicycle-v8.html = prototype HTML รุ่นแรก)
│
└── epicycle/        ← 🟢 โปรเจกต์ Remotion ตัวจริง — โค้ดคลิปทั้งหมดอยู่ที่นี่
```

> **โค้ดงานทั้งหมดอยู่ใน `epicycle/`** · root เป็นแค่เปลือกห่อ (เอกสาร + ที่ staging) — ไม่มี Remotion project ที่ root

## วิธีใช้ (โปรเจกต์จริง = epicycle)

```bash
cd epicycle
npm install              # ครั้งแรก
npm run dev              # พรีวิว → http://localhost:3000 (remotion studio)

# render ภาพนิ่งเช็ค beat
npx remotion still src/index.js <CompId> out/<x>.png --frame=N
# render เต็ม
npx remotion render src/index.js <CompId> out/<x>.mp4
```

รายละเอียด recipe การทำคลิป → [SHORTS_TEMPLATE.md](SHORTS_TEMPLATE.md) · สถานะคลิป → [CLAUDE.md](CLAUDE.md)

## การจัดเก็บงาน
- staging: `FB-output/YYMMDD <ชื่อ>/` (.mp4 + .docx)
- backup คลิป: คัดลอกขึ้น `G:\My Drive\_FB&Social\YYMMDD <ชื่อ>\` (Google Drive for Desktop)
- backup โค้ด: commit + push `main` (repo นี้ครอบ epicycle/ source แล้ว ตั้งแต่ 15 มิ.ย. 2569)
