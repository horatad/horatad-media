# STATE — C:\horatad-media · ทำคลิปดาราศาสตร์ (อ่าน 30 วินาที)

> ไฟล์เดียวบอก "โฟลเดอร์นี้คืออะไร ตอนนี้ทำอะไรค้างอยู่" · Claude อ่านก่อนเริ่ม
> เครื่องหมาย: ✓ = ตรวจจริงแล้ว · ⚠️ = ยังเดา
> สร้าง: 2026-06-13 (โดย Claude) · รายละเอียดเต็ม → `CLAUDE.md` ในโฟลเดอร์นี้

---

## คืออะไร (1 บรรทัด)
🎬 **โรงงานทำคลิป** — แอนิเมชันอธิบายดาราศาสตร์/ปฏิทิน (Remotion) ลง FB/YouTube เพื่อโปรโมทงานโหราฯ Horatad

## สถานะ
- ✓ **โปรเจกต์ที่ใช้จริง = `epicycle\` (Remotion/JSX)** · พรีวิว: `cd epicycle` → `npm run dev` → localhost:3000
- ✓ ทุกคลิป 1080×1080 · 30fps · ฟิสิกส์ที่ `epicycle\src\physics.js`
- ✓ **เสร็จแล้ว (อยู่บน Drive):** Venus Phase (260609) · Moon Phase (260611)
- ▶ **งานถัดไป:** "Epicycle vs Heliocentric" — ฉาก heliocentric retrograde ทำใหม่ (reuse FullEpicycle/MarsRetrograde ฝั่ง geocentric)
- ⏸ **ค้าง:** Adhikamasa (อธิกมาส) — prototype 4 วง
- ⚠️ ไม่มี git · ไม่พึ่ง engine ของ horatad (โค้ดแยกอิสระ) · backlog เต็มอยู่ใน auto-memory `content-backlog.md`

## เชื่อมกับระบบยังไง
```
C:\horatad-media (คลิป) ──staging──▶ FB-output\YYMMDD ชื่อ\ ──คัดลอก──▶ G:\My Drive\_FB&Social\
```
- **ขาออก ← โปรโมท horatad** · ไม่มีโปรเจกต์อื่น depend กลับ · ความถูกต้องดาราศาสตร์อิงข้อมูลชุดเดียวกับ horatad แต่คำนวณในโค้ดตัวเอง
- ❗ เก็บงานเสร็จขึ้น `G:\My Drive\_FB&Social\` เสมอ (ไม่ใช้ MCP Drive connector = คนละบัญชี)

## งงตรงไหนดูที่ไหน
- รายละเอียด render/scene/Drive → `CLAUDE.md` (โฟลเดอร์นี้)
- ภาพรวม ecosystem → `C:\horatad\ECOSYSTEM.md`
