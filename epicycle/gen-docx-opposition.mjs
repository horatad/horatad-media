import {Document,Packer,Paragraph,TextRun,AlignmentType} from 'docx';
import {writeFileSync} from 'fs';

const FONT='TH Sarabun New';
const H=(text,color='6B3FA0',size=30)=>new Paragraph({spacing:{before:240,after:120},children:[new TextRun({text,bold:true,size,color,font:FONT})]});
const P=(runs,opts={})=>new Paragraph({spacing:{after:120,line:300},alignment:opts.align,children:(Array.isArray(runs)?runs:[runs]).map(r=>typeof r==='string'?new TextRun({text:r,size:30,font:FONT}):new TextRun({size:30,font:FONT,...r}))});
const B=t=>({text:t,bold:true});
const HL=(t,color)=>({text:t,bold:true,color});

const doc=new Document({sections:[{
  properties:{page:{margin:{top:1000,bottom:1000,left:1100,right:1100}}},
  children:[
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:60},children:[new TextRun({text:'🪐 ดาวเคราะห์ "ใกล้โลก" — Opposition',bold:true,size:40,color:'7B4FB0',font:FONT})]}),
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},children:[new TextRun({text:'🌌 ตรงข้ามดวงอาทิตย์ · 🔆 สว่างสุด · 🌙 ขึ้นทั้งคืน · ℞ ถอยหลังพอดี',size:28,color:'555555',font:FONT})]}),

    P([{text:'ปี ๒๕๖๙ มีข่าว '},HL('"ดาวเสาร์ใกล้โลก ๔ ต.ค."','7B4FB0'),{text:' และ '},HL('"ดวงจันทร์บังดาวพฤหัสบดี ๓ พ.ย."','7B4FB0'),{text:' · คำว่า "ใกล้โลก" ของดาวเคราะห์นอกมีชื่อทางการว่า '},B('"opposition" (ตรงข้ามดวงอาทิตย์)'),{text:' — บทนี้อธิบายว่าทำไมมันคือจังหวะที่ดูดาวดวงนั้นดีที่สุดของปี'}]),

    H('🌌 1 — "Opposition" คือดาวอยู่ตรงข้ามดวงอาทิตย์'),
    P([{text:'ดาวเคราะห์นอก (อังคาร พฤหัส เสาร์) โคจร '},B('ไกลกว่าโลก'),{text:' · ปีละครั้งโลกจะแซงผ่านมันในแนวเดียวกับดวงอาทิตย์พอดี ทำให้ดาวมาอยู่ '},HL('"ฝั่งตรงข้ามดวงอาทิตย์" เมื่อมองจากโลก','7B4FB0'),{text:' — เรียก opposition'}]),

    H('🔆 2 — ตรงข้ามดวงอาทิตย์ = ใกล้โลกสุด = สว่างสุด'),
    P([{text:'ตอน opposition โลกอยู่ '},B('ระหว่างดวงอาทิตย์กับดาวดวงนั้นพอดี'),{text:' → ระยะ '},HL('ใกล้โลกที่สุดในรอบปี','7B4FB0'),{text:' จานจึงโตที่สุดและสว่างที่สุด · ตรงข้ามกับตอนดาวอยู่หลังดวงอาทิตย์ (conjunction) ที่ไกลและจาง'}]),

    H('🌙 3 — ขึ้นหัวค่ำ–ตกรุ่งเช้า เห็นได้ทั้งคืน'),
    P([{text:'เพราะอยู่ตรงข้ามดวงอาทิตย์ ดาวจึง '},HL('ขึ้นทางทิศตะวันออกตอนดวงอาทิตย์ตก และตกทางตะวันตกตอนรุ่งสาง','7B4FB0'),{text:' — โผล่ให้ดู '},B('ตลอดทั้งคืน'),{text:' ขึ้นสูงกลางฟ้าตอนเที่ยงคืน เป็นจังหวะถ่ายภาพ/ส่องกล้องที่ดีที่สุด'}]),

    H('℞ 4 — และเป็นช่วงที่ดาว "ถอยหลัง" (พักร) พอดี'),
    P([{text:'น่าทึ่งที่ '},HL('ดาวเคราะห์นอกจะ retrograde (พักร) พอดีช่วง opposition','C0392B'),{text:' — เพราะโลกวงในกำลัง "ไล่แซง" มัน เราเลยเห็นมันวกถอยในหมู่ดาวชั่วคราว (เหมือนเรื่องดาวพุธพักร แต่กลับด้าน: '},B('ดาวนอกพักรตอนโลกแซง'),{text:' ส่วนดาวในพักรตอนมันแซงโลก)'}]),
    P([{text:'ในโมเดลโบราณ (epicycle) จังหวะนี้คือตอนที่ '},B('"วงเล็ก" (epicycle) เหวี่ยงดาวลงมาด้านใกล้โลก'),{text:' — โหราจึงผูกดาวพักรกับ "กำลังดาวแปรปรวน"'}]),

    H('♄ 5 — เหตุการณ์ปี ๒๕๖๙'),
    P([{text:'🪐 '},HL('๔ ต.ค. — ดาวเสาร์ใกล้โลก (opposition)','7B4FB0'),{text:' : ส่องกล้องเล็กเห็นวงแหวนได้'}]),
    P([{text:'🌙 '},HL('๓ พ.ย. — ดวงจันทร์บังดาวพฤหัสบดี','7B4FB0'),{text:' : จันทร์เคลื่อนมาบังพฤหัส เห็นพฤหัส "หาย" หลังขอบดวงจันทร์แล้วโผล่กลับ'}]),
    P([{text:'📌 '},B('สรุป:'),{text:' "ดาวใกล้โลก" ไม่ใช่ดาวโคจรเข้ามาหาเรา แต่เป็น '},HL('จังหวะที่โลกแซงผ่านในแนวตรงข้ามดวงอาทิตย์ 🌌','7B4FB0'),{text:' — ใกล้สุด สว่างสุด เห็นทั้งคืน และถอยหลังพอดี ครบในเหตุการณ์เดียว'}]),

    new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:300},children:[new TextRun({text:'— Horatad · ดาราศาสตร์พบโหราศาสตร์ —',italics:true,size:26,color:'888888',font:FONT})]}),
  ],
}]});

const buf=await Packer.toBuffer(doc);
writeFileSync(process.argv[2],buf);
console.log('docx written:',process.argv[2]);
