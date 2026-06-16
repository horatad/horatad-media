// MIDI Index report -> .docx (docx-js) | run: cd epicycle && node _gen_midi_index.mjs <out.docx>
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import fs from "fs";
const out = process.argv[2] || "MIDI_INDEX.docx";
const P=(t,o={})=>new Paragraph({children:[new TextRun({text:t,...o})],spacing:{after:70}});
const H1=t=>new Paragraph({text:t,heading:HeadingLevel.HEADING_1,spacing:{before:220,after:90}});
const H2=t=>new Paragraph({text:t,heading:HeadingLevel.HEADING_2,spacing:{before:170,after:70}});
const B=t=>new Paragraph({text:t,bullet:{level:0},spacing:{after:35}});

const k=[
 new Paragraph({children:[new TextRun({text:"MIDI Index — คลังโน้ตเพลง Horatad",bold:true,size:32,color:"3a0ca3"})]}),
 P("รวมดัชนีไฟล์ MIDI ทั้งหมดสำหรับทำ BGM (render ผ่าน BBCSO/soundfont) · 16 มิ.ย. 2569 · ⭐ = เด่น/เหมาะ BGM",{italics:true,color:"666666"}),
 P("คลัง 3 แหล่ง: Beethoven Piano 29 ไฟล์ (clips\\beethoven) · Mozart Piano 21 ไฟล์ (clips\\mozart) · Classical Guitar 1,969 ไฟล์ (G:\\My Drive\\horatad-midi). เปียโนจาก piano-midi.de · public domain ลงโซเชียลปลอดภัย",{bold:true}),

 H1("1. Beethoven Piano Sonata (29 ไฟล์)"),
 B("mond_1/2/3 — Moonlight Sonata No.14 Op.27/2 · ⭐⭐ ท่อน1 Adagio sostenuto ช้าลึกสวย เหมาะ BGM อวกาศ · ท่อน3 Presto ดราม่า"),
 B("pathetique_1/2/3 — Pathétique No.8 Op.13 · ⭐⭐ ท่อน2 Adagio cantabile หวาน · ท่อน1 Grave-Allegro พลัง"),
 B("elise — Für Elise WoO 59 · ⭐ ดังสุด จำง่าย (เพลงเดี่ยว)"),
 B("waldstein_1/2/3 — Waldstein No.21 Op.53 · ท่อน1 Allegro con brio"),
 B("appass_1/2/3 — Appassionata No.23 Op.57 · ดราม่าเข้ม"),
 B("beethoven_les_adieux_1/2/3 — Les Adieux No.26 Op.81a"),
 B("beethoven_opus90_1/2 — Sonata No.27 Op.90 · ⭐ ท่อน2 Rondo ไพเราะนุ่ม"),
 B("beethoven_opus22_1..4 — Sonata No.11 Op.22 (4 ท่อน)"),
 B("beethoven_opus10_1/2/3 — Sonata Op.10 C minor"),
 B("beethoven_hammerklavier_1..4 — Hammerklavier No.29 Op.106 (ใหญ่/ยาว/ยาก)"),

 H1("2. Mozart Piano Sonata (21 ไฟล์)"),
 B("mz_545_1/2/3 — K.545 No.16 C 'Sonata facile' · ⭐⭐ ท่อน1 Allegro จำง่าย · ท่อน2 Andante อ่อนโยน"),
 B("mz_331_1/2/3 — K.331 No.11 A · ⭐⭐ ท่อน3 Alla Turca (Turkish March) ดังสุด · ท่อน1 ธีม+แปร"),
 B("mz_330_1/2/3 — K.330 No.10 C · ท่อน2 Andante cantabile หวาน"),
 B("mz_332_1/2/3 — K.332 No.12 F · ⭐ ท่อน2 Adagio สงบ"),
 B("mz_333_1/2/3 — K.333 No.13 B♭"),
 B("mz_570_1/2/3 — K.570 No.17 B♭ · ⭐ ท่อน2 Adagio ลึก"),
 B("mz_311_1/2/3 — K.311 No.8 D · ท่อน3 Rondo สดใส"),
 P("(ดัชนีละเอียด tempo ทุกท่อน → clips\\mozart\\_INDEX.md)",{italics:true,color:"888888"}),

 H1("3. Classical Guitar (1,969 ไฟล์ — ตามผู้ประพันธ์)"),
 B("Bach 306 · Sor 160 · Giuliani 158 · Barrios Mangoré 105 · Carulli 95 · Coste 64 · Carcassi 63 · Weiss 60"),
 B("Tárrega 58 · Ponce 55 · Castelnuovo-Tedesco 47 · Granados 28 · Albéniz 26 · Dowland 24 · Paganini 23 · + อีกหลายสิบ"),

 H1("วิธีใช้ — render เป็นเสียงจริง (headless)"),
 P("หลังตั้ง Piano ใน _piano_template.rpp:"),
 P("cd C:\\horatad-media\\clips"),
 P("python _mid2rpp.py mozart/mz_545_1.mid _piano_template.rpp _r.rpp C:\\horatad-media\\clips\\out.wav"),
 P('"C:\\Program Files\\REAPER (x64)\\reaper.exe" -renderproject C:\\horatad-media\\clips\\_r.rpp'),
 B("แนะนำ BGM ดาราศาสตร์: สงบ → mond_1, mz_545_2, pathetique_2 · สดใส → mz_545_1, elise"),

 new Paragraph({spacing:{before:220},alignment:AlignmentType.CENTER,children:[new TextRun({text:"Horatad · คลัง MIDI index · 16 มิ.ย. 2569",italics:true,color:"888888"})]}),
];
Packer.toBuffer(new Document({sections:[{children:k}]})).then(b=>{fs.writeFileSync(out,b);console.log("wrote",out,b.length);});
