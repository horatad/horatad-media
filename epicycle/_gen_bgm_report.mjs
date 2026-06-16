// Generate BGM/BBCSO Master Plan + Job Report as .docx (docx-js)
// run: cd epicycle && node _gen_bgm_report.mjs <out.docx>
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import fs from "fs";

const out = process.argv[2] || "BGM_BBCSO_MASTERPLAN_REPORT.docx";
const P = (t, o = {}) => new Paragraph({ children: [new TextRun({ text: t, ...o })], spacing: { after: 80 }, ...o.p });
const H1 = (t) => new Paragraph({ text: t, heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 100 } });
const H2 = (t) => new Paragraph({ text: t, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 80 } });
const B = (t) => new Paragraph({ text: t, bullet: { level: 0 }, spacing: { after: 40 } });
const NUM = (t, ref) => new Paragraph({ text: t, numbering: { reference: ref, level: 0 }, spacing: { after: 40 } });

const kids = [
  new Paragraph({ children:[new TextRun({text:"Master Plan + Job Report — เสียงประกอบ BGM (BBCSO)",bold:true,size:34,color:"3a0ca3"})] }),
  P("โปรเจกต์ C:\\horatad-media (โรงงานทำคลิปดาราศาสตร์ Horatad) · 16 มิ.ย. 2569 · รวม Job Report + Master Plan + อ้างอิงงานเก่า ในไฟล์เดียว", {italics:true, color:"666666"}),
  P("สรุป 30 วินาที: วันนี้ติดตั้งวงออร์เคสตราจริง BBC Symphony Orchestra (Discover) + REAPER สำเร็จ และสร้าง pipeline render เสียงแบบ headless (ไม่ต้องเปิดจอ) ได้แล้ว — เปลี่ยน MIDI เป็นเสียงวงจริงคุณภาพสูงแทน/เสริม soundfont เดิม · ค้างจุดเดียว: ตั้ง Piano ใน template ให้ติด", {bold:true}),

  H1("PART A — JOB REPORT (งานวันนี้ 16 มิ.ย.)"),
  H2("1. ติดตั้งเครื่องมือเสียงระดับโปร"),
  B("✓ BBC Symphony Orchestra Discover (Spitfire) — วงจริงอัด Maida Vale · ฟรี royalty-free · VST3 + library 228MB ครบทุกกลุ่มเครื่อง"),
  B("✓ REAPER 7.74 (DAW/VST host) — eval ใช้ฟรี · ถ้าใช้ยาว license $60 ครั้งเดียว (ยังไม่จำเป็น)"),
  H2("2. ⭐ Headless Render Pipeline (ของใหม่สำคัญสุด)"),
  P("MIDI → _mid2rpp.py → .rpp → reaper.exe -renderproject → WAV  (ผ่าน command line ล้วน ไม่เปิดจอ)", {bold:true}),
  B("✓ สคริปต์ C:\\horatad-media\\clips\\_mid2rpp.py แปลง MIDI เป็น REAPER project"),
  B("✓ รักษา timing/รูบาโตของ performance ครบ (bake วินาทีจริงลง tick)"),
  B("✓ REAPER eval nag ไม่บล็อก CLI render — render เงียบๆ เป็น batch ได้"),
  B("ผล: ต่อไปแค่บอกชื่อ MIDI → ได้ WAV เสียงวงจริง ไม่ต้องคลิกใน DAW อีก"),
  H2("3. ผลทดสอบเสียง (verify แล้ว)"),
  B("✓ Strings Violins 1 — พี่ปีเตอร์ฟัง 'ดีกว่าที่คิด' · ขึ้น Drive แล้ว"),
  B("✓ Percussion — เบาตามธรรมชาติ (อัดบาลานซ์จริงในวง) ดัน gain แล้วชัด"),
  B("⚠ Piano (Mozart K.545) — render สำเร็จแต่ออกเป็น Percussion เพราะ template ยังตั้ง Percussion"),
  H2("4. จัดระเบียบคลัง MIDI"),
  B("✓ ย้าย MIDI กีตาร์ 1,974 ไฟล์ → G:\\My Drive\\horatad-midi\\Guitar121015\\"),
  B("✓ ลบโฟลเดอร์ว่าง 7 อัน (Drive Trash กู้ได้ 30 วัน)"),
  B("✓ Mozart sonata 21 ไฟล์ + Beethoven → clips\\mozart, clips\\beethoven (piano-midi.de)"),
  H2("🔧 จุดค้างเดียว (ส่งต่อ session ใหม่)"),
  P("clips\\_piano_template.rpp ยังเป็น Percussion ไม่ใช่ Piano — ปลั๊ก BBCSO ไม่รับคลิกรีโมท ต้องตั้ง Piano ด้วยมือ:", {bold:true}),
  NUM("เปิด REAPER → ปลั๊ก BBCSO track 1 → dropdown → หมวด Piano → คลิก Piano → Load → เช็คขึ้น 'Piano : Piano'","fix"),
  NUM("Ctrl+S save ทับ template","fix"),
  NUM("rerun: python _mid2rpp.py mozart/mz_545_1.mid _piano_template.rpp _render_545.rpp <out.wav> ; reaper.exe -renderproject _render_545.rpp","fix"),

  H1("PART B — MASTER PLAN (แผนเสียงประกอบ)"),
  P("เป้าหมาย: ยกระดับ BGM จาก soundfont สังเคราะห์ (ฟังเทียม โดยเฉพาะเครื่องสาย) → เสียงวงจริง BBCSO (ธรรมชาติ) สำหรับชิ้นที่ต้องการคุณภาพสูง"),
  H2("กลยุทธ์ใช้งาน (trade-off)"),
  B("soundfont (เดิม): สังเคราะห์ · ปลั๊กเดียวทำทั้งวง · เหมาะ backing เร็ว/ทำทั้งวงรวบเดียว"),
  B("BBCSO Discover (ใหม่): อัดวงจริง · 1 instance = 1 เครื่อง (ต้องแยก track) · เหมาะชิ้นเด่น/โซโล/กลุ่มเดียว (เปียโน, เครื่องสาย intro)"),
  H2("คลังวัตถุดิบ (public domain = ลงโซเชียลปลอดภัย)"),
  B("Mozart Piano Sonata K.311–570 (21 ไฟล์ · Alla Turca K.331-3, Sonata facile K.545-1) + Beethoven"),
  B("คลังคลาสสิก/กีตาร์เพิ่มบน G:\\My Drive\\horatad-midi\\"),
  B("แหล่งฟรีคุณภาพดี: piano-midi.de, Mutopia, IMSLP — ไม่ต้องจ่าย midiworld (ฟรีอยู่แล้ว)"),
  H2("integration กับโรงงานคลิป (epicycle/)"),
  B("เสียง BBCSO → epicycle\\public\\audio\\ → component Music.jsx เสียบเข้าคลิป Remotion · เหมาะกับ 3 คลิปที่ยังเงียบ (MercuryRetro, EclipseStory, Opposition)"),

  H1("PART C — อ้างอิงงานเก่า (สถานะโปรเจกต์รวม)"),
  H2("โรงงานทำคลิปดาราศาสตร์ (Remotion)"),
  B("เสร็จ 8/8: Shorts แนวตั้ง 1080×1920 — Shorts60, TwoSystemsVert, MoonPhaseVert, MercuryRetroVert, VenusPhaseVert, VenusBrightestVert, OppositionVert, EclipseStoryVert (voiceover+caption+bgm+credit · ขึ้น Drive + git push ครบ)"),
  B("คลิปจัตุรัสเดิม: Venus Phase, Moon Phase, Epicycle vs Heliocentric + ชุด 14 มิ.ย. (Mercury/Venus/Eclipse/Opposition)"),
  H2("งานค้างเดิม (ก่อนวันนี้)"),
  B("🎧 Shorts60 เพลง Skaters' Waltz loop seam — ค้าง v03 รอพี่เคาะ"),
  B("🔧 รอรีวิว+ปรับทีเดียว: Venus เฟสยังไม่ sync caption · EclipseStoryVert text baked ซ้อน · เลือกเพลง mood · credit wording"),
  B("🔇 3 คลิปเงียบ: MercuryRetro, EclipseStory, Opposition (← BBCSO ช่วยได้)"),
  B("⏸ ค้างเก่า: EclipsePhase, Adhikamasa (prototype)"),

  H1("ขั้นถัดไป (session ใหม่)"),
  NUM("(สำคัญ) ตั้ง Piano ใน _piano_template.rpp → render Mozart/Beethoven sonata เป็น batch","nx"),
  NUM("เลือกเพลง BGM (BBCSO) ใส่ 3 คลิปที่เงียบ","nx"),
  NUM("จูน Shorts60 loop seam (v03→finalize) + รีวิวชุด 15 มิ.ย.","nx"),

  new Paragraph({ spacing:{before:240}, alignment:AlignmentType.CENTER, children:[new TextRun({text:"Horatad · ดาราศาสตร์พบโหราศาสตร์ — 16 มิ.ย. 2569",italics:true,color:"888888"})] }),
];

const doc = new Document({
  numbering: { config: [
    { reference:"fix", levels:[{level:0,format:"decimal",text:"%1.",alignment:AlignmentType.START}] },
    { reference:"nx", levels:[{level:0,format:"decimal",text:"%1.",alignment:AlignmentType.START}] },
  ]},
  sections: [{ children: kids }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(out, b); console.log("wrote", out, b.length, "bytes"); });
