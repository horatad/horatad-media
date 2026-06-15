import {Document,Packer,Paragraph,TextRun,AlignmentType} from 'docx';
import {writeFileSync} from 'fs';

// สคริปต์โพสต์ FB/YouTube สำหรับคลิป Shorts60 (ปโตเลมี/epicycle) — รูปแบบเดียวกับ Epicycle-vs-Heliocentric
const FONT='TH Sarabun New';
const H=(text,color='1F5FA8',size=30)=>new Paragraph({spacing:{before:240,after:120},children:[new TextRun({text,bold:true,size,color,font:FONT})]});
const P=(runs,opts={})=>new Paragraph({spacing:{after:120,line:300},alignment:opts.align,children:(Array.isArray(runs)?runs:[runs]).map(r=>typeof r==='string'?new TextRun({text:r,size:30,font:FONT}):new TextRun({size:30,font:FONT,...r}))});
const B=t=>({text:t,bold:true});
const HL=(t,color)=>({text:t,bold:true,color});

const doc=new Document({sections:[{
  properties:{page:{margin:{top:1000,bottom:1000,left:1100,right:1100}}},
  children:[
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:60},children:[new TextRun({text:'🌌 พระเคราะห์ที่นักโหราศาสตร์ไทยใช้ดูดวง',bold:true,size:38,color:'1F5FA8',font:FONT})]}),
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:60},children:[new TextRun({text:'จริงๆ คือดาวที่ "ทอเลมี" ชาวกรีกวาดไว้เมื่อ 1,900 ปีก่อน',bold:true,size:34,color:'C77F00',font:FONT})]}),
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},children:[new TextRun({text:'☿ ปโตเลมี · 🌀 เอพิไซเคิล · 🛕 พระเคราะห์ทั้งเก้า · เส้นทาง 1,900 ปี 2 อารยธรรม',size:27,color:'555555',font:FONT})]}),

    P([{text:'ปริศนาเล็กๆ บนท้องฟ้า — "ทำไมดาวบางดวงดูเหมือน '},B('เดินถอยหลัง'),{text:'?" — กลายเป็นจุดเริ่มของเรื่องที่เชื่อม '},B('ดาราศาสตร์กรีกโบราณ'),{text:' เข้ากับ '},B('พระเคราะห์ที่นักโหราศาสตร์ไทยใช้ดูดวง'),{text:' ไล่ทีละขั้น 👇'}]),

    H('🌀 ตอนที่ 1 — ปริศนา "ดาวเดินถอยหลัง" กับทอเลมี'),
    P([{text:'ดาวเคราะห์บนฟ้าปกติเดินไปทางหนึ่ง แต่บางช่วงกลับดู '},B('"วกถอยหลัง"'),{text:' ในหมู่ดาว (retrograde) · ราว '},HL('ค.ศ. 150','1F5FA8'),{text:' '},B('คลอดิอุส ปโตเลมี'),{text:' (Claudius Ptolemy — อ่าน "ทอเลมี") เขียนตำรา '},{text:'Almagest',italics:true},{text:' วางจักรวาลให้ '},HL('โลกอยู่นิ่งตรงกลาง','C0392B'),{text:' แล้วแก้ปัญหาดาวถอยหลังด้วย '},HL('เอพิไซเคิล (Epicycle) 🌀','C77F00'),{text:' — ให้ดาววิ่งเป็น "วงเล็กซ้อนบนวงใหญ่"'}]),

    H('⏳ ตอนที่ 2 — ผิด... แต่แม่นยำ 1,400 ปี'),
    P([{text:'โมเดลโลกเป็นศูนย์กลาง '},HL('ผิด','C0392B'),{text:' (จริงๆ ดวงอาทิตย์เป็นศูนย์กลาง · "ถอยหลัง" เป็นแค่ภาพลวงตาตอนโลกแซงดาว) — แต่มันกลับ '},B('ทำนายตำแหน่งดาวได้แม่นพอใช้งานจริง'),{text:' ใช้ทำปฏิทินและโหราศาสตร์ได้ '},HL('นานกว่า 1,400 ปี','1F5FA8'),{text:' จนโคเปอร์นิคัส (ค.ศ. 1543) เสนอให้ดวงอาทิตย์อยู่กลาง'}]),

    H('🌏 ตอนที่ 3 — ความรู้เดินทางจากกรีก สู่อินเดีย'),
    P([{text:'น่าทึ่งที่ '},HL('ยุคเดียวกับ Almagest พอดี (ราว ค.ศ. 150)','C77F00'),{text:' ตำราโหราศาสตร์กรีกถูกแปลเป็นภาษาสันสกฤตในอินเดีย ชื่อ '},B('"ยวนชาตกะ" (Yavanajataka)'),{text:' — '},{text:'yavana',italics:true},{text:' = "ชาวกรีก/โยนก" + '},{text:'jataka',italics:true},{text:' = "ชะตากำเนิด"'}]),
    P([{text:'ทั้ง '},B('12 ราศี'),{text:' และระบบ '},B('ดาวเคราะห์'),{text:' ถูกแปลตรงจากกรีก กลายเป็นรากฐานของ '},HL('โหราศาสตร์ฮินดู (Jyotisha)','1F5FA8'),{text:' และระบบ "นพเคราะห์"'}]),

    H('🛕 ตอนที่ 4 — 7 ดาวกรีก + ราหู/เกตุ = พระเคราะห์ทั้งเก้า'),
    P([{text:'กรีก (และทอเลมี) รู้จักดาวบนฟ้า '},HL('7 ดวง','1F5FA8'),{text:' = อาทิตย์ ☉ จันทร์ ☽ + ดาวเคราะห์ที่เห็นด้วยตาเปล่า 5 (พุธ ศุกร์ อังคาร พฤหัส เสาร์)'}]),
    P([{text:'อินเดียเติมอีก 2 — '},HL('ราหู และ เกตุ','C0392B'),{text:' ซึ่งจริงๆ '},B('ไม่ใช่ดาว'),{text:' แต่เป็น '},B('"จุดตัด" ของวงโคจรดวงจันทร์กับเส้นทางดวงอาทิตย์'),{text:' (lunar nodes) — จุดที่ทำให้เกิดอุปราคา · รวมเป็น '},HL('พระเคราะห์ทั้งเก้า (นพเคราะห์)','C77F00'),{text:' แล้วส่งต่อผ่านอินเดีย-เขมร มาถึง '},B('โหราศาสตร์ไทย'),{text:' ที่เราไหว้และดูดวงกันทุกวันนี้'}]),

    H('✨ สรุป — 1 ระบบดาว · 2 อารยธรรม · 1,900 ปี'),
    P([{text:'ดาวพระเคราะห์ที่เราคุ้นเคย '},HL('7 ใน 9 ดวง','1F5FA8'),{text:' คือ '},B('ดาวดวงเดียวกับที่ทอเลมีวาดไว้ใน Almagest เมื่อ 1,900 ปีก่อน'),{text:' (ราหู/เกตุ คือส่วนที่อินเดียเพิ่มทีหลัง) · '},HL('โมเดล epicycle ของทอเลมีผิด','C0392B'),{text:' — แต่ "ดาว" ที่มันพยายามอธิบาย ยังอยู่กับเราทุกวัน ทั้งบนฟ้าและในดวงชะตา 🌍🔭'}]),

    new Paragraph({spacing:{before:200,after:80},children:[new TextRun({text:'#Horatad  #ดาราศาสตร์  #โหราศาสตร์  #ปโตเลมี  #Epicycle  #นพเคราะห์  #ปฏิทินไทย',size:26,color:'1F5FA8',font:FONT})]}),
    new Paragraph({children:[new TextRun({text:'🎬 คลิปประกอบ: ทำไมดาวเดินถอยหลัง? — ปโตเลมีถึงนพเคราะห์ไทย (Shorts)  ·  Horatad',size:26,color:'888888',italics:true,font:FONT})]}),
  ],
}]});

const buf=await Packer.toBuffer(doc);
writeFileSync(process.argv[2],buf);
console.log('docx written:',process.argv[2]);
