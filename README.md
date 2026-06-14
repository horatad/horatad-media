# นพเคราะห์ Epicycle — Remotion Video Project

## วิธี Setup (5 นาที)

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. Preview ใน browser (interactive timeline)
npm start

# 3. Render วิดีโอเต็ม (40วิ, 1080×1080)
npm run build

# 4. Render เฉพาะ scene
npm run render:retro   # Mars Retrograde Loop
npm run render:all     # Full System
```

Output อยู่ที่ `out/` folder

---

## โครงสร้าง

```
src/
  physics.ts          ← ฟิสิกส์เหมือน simulation หลัก (copy-paste)
  components/
    Renderer.tsx      ← Canvas renderer ใช้ร่วมทุก scene
  scenes/
    EpicycleExplainer.tsx  ← Scene 1: Epicycle คืออะไร? (10s)
    MarsRetrograde.tsx     ← Scene 2: Mars trail กลีบดอกไม้ (15s)
    FullSystem.tsx         ← Scene 3: ระบบครบทุกดาว (15s)
  Root.tsx            ← Register compositions
  index.ts            ← Entry point
```

---

## Compositions

| ID | Description | Duration |
|---|---|---|
| `EpicycleExplainer` | อธิบาย deferent + epicycle ทีละขั้น | 10s |
| `MarsRetrograde` | Trail กลีบดอกไม้ พร้อม loop counter | 15s |
| `FullSystem` | ทุกดาวพร้อม trail | 15s |
| `EpicycleFull` | ทุก scene ต่อกัน | 40s |

---

## ต้องการ

- Node.js 18+
- Google Chrome (สำหรับ render)
- RAM 4GB+

---

## เพิ่ม Scene ใหม่

1. สร้างไฟล์ใน `src/scenes/`
2. ใช้ `useCurrentFrame()` เป็น frame number
3. ส่งไปที่ `EpicycleCanvas` หรือ `gP()` โดยตรง
4. Register ใน `Root.tsx`

Physics functions (`gP`, `isRetro`, `getPhase`) เป็น pure function
รับ frame → คืนตำแหน่ง ไม่มี side effect ใดๆ
