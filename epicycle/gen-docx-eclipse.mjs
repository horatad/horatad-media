import {Document,Packer,Paragraph,TextRun,AlignmentType} from 'docx';
import {writeFileSync} from 'fs';

const FONT='TH Sarabun New';
const H=(text,color='A8741A',size=30)=>new Paragraph({spacing:{before:240,after:120},children:[new TextRun({text,bold:true,size,color,font:FONT})]});
const P=(runs,opts={})=>new Paragraph({spacing:{after:120,line:300},alignment:opts.align,children:(Array.isArray(runs)?runs:[runs]).map(r=>typeof r==='string'?new TextRun({text:r,size:30,font:FONT}):new TextRun({size:30,font:FONT,...r}))});
const B=t=>({text:t,bold:true});
const HL=(t,color)=>({text:t,bold:true,color});

const doc=new Document({sections:[{
  properties:{page:{margin:{top:1000,bottom:1000,left:1100,right:1100}}},
  children:[
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:60},children:[new TextRun({text:'🌑 "ราหูอม" — ความจริงเบื้องหลังอุปราคา',bold:true,size:40,color:'C8901E',font:FONT})]}),
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},children:[new TextRun({text:'☀️ สุริยุปราคา · 🌕 จันทรุปราคา · ☄️ ราหู–เกตุ · 🔭 Saros · 🗓️ สุริยุปราคาแห่งศตวรรษ ๒ ส.ค. ๒๐๒๗',size:27,color:'555555',font:FONT})]}),

    P([{text:'คนโบราณเห็นดวงอาทิตย์หรือดวงจันทร์ "ค่อยๆ หายไป" กลางวันแสกๆ หรือกลางคืนเพ็ญ จึงเชื่อว่า '},HL('"ราหูอม"','C0392B'),{text:' — วันนี้เรารู้แล้วว่า '},B('ราหู–เกตุ คืออะไรจริงๆ'),{text:' และทำไมคนโบราณ "ทำนาย" อุปราคาล่วงหน้าได้ ทั้งที่ยังไม่รู้กลไก'}]),

    H('☄️ 1 — ราหู / เกตุ คือ "จุดตัด" ไม่ใช่ดาว'),
    P([{text:'ทางเดินดวงอาทิตย์บนฟ้า ('},B('สุริยวิถี'),{text:') กับทางเดินดวงจันทร์ (เอียงกันราว '},HL('๕°','C8901E'),{text:') '},B('ตัดกัน ๒ จุด'),{text:' — จุดขาขึ้นเรียก '},HL('ราหู (หัว)','C0392B'),{text:' จุดตรงข้ามเรียก '},HL('เกตุ (หาง)','C0392B'),{text:' · อุปราคาจะเกิด '},B('เฉพาะเมื่อ'),{text:' ดวงจันทร์ดับ/เพ็ญ เดินมาถึงจุดตัดนี้พอดี — เดือนอื่นจันทร์ผ่านเหนือ/ใต้ จึงไม่บัง'}]),

    H('☀️ 2 — สุริยุปราคา "ราหูอมตะวัน"'),
    P([{text:'เกิดตอน '},B('จันทร์ดับ'),{text:' เดินมาถึงจุดตัดพอดี → จานดวงจันทร์บังจานดวงอาทิตย์ · เป็นเรื่องบังเอิญมหัศจรรย์ที่ '},HL('จานทั้งสองโตเท่ากันบนฟ้า (~๐.๕°)','C8901E'),{text:' จึงบังได้พอดิบพอดี กลางวันมืดราวค่ำ ดาวโผล่ เห็น '},B('แสงโคโรนา'),{text:' รอบดวง'}]),

    H('🌕 3 — จันทรุปราคา "ราหูอมจันทร์"'),
    P([{text:'เกิดตอน '},B('จันทร์เพ็ญ'),{text:' มาถึงจุดตัด → จันทร์เข้าไปใน '},B('เงาโลก'),{text:' (อยู่ฝั่งตรงข้ามดวงอาทิตย์) กลายเป็นสีแดงอิฐ "จันทร์สีเลือด" · ปี ๒๕๖๙ มี '},HL('จันทรุปราคาเต็มดวง ๓ มี.ค. ตรงวันมาฆบูชา','C8901E'),{text:' (อุปราคาตรงวันพระใหญ่ — จังหวะเล่าเรื่องที่ดีมาก)'}]),

    H('🔭 4 — Saros: ทำนายได้โดยไม่ต้องเข้าใจกลไก'),
    P([{text:'ชาวบาบิโลนจดบันทึกท้องฟ้าเป็นร้อยปี จนพบว่าอุปราคา '},HL('"วนซ้ำทุก ๑๘ ปี ๑๑ วัน"','C8901E'),{text:' (รอบ Saros = ๒๒๓ เดือนจันทร์) · แค่รู้รอบซ้ำก็ '},B('ทำนายล่วงหน้าได้แม่น'),{text:' ทั้งที่ยังไม่รู้ว่าโลกโคจรรอบอะไร หรือเงาตกอย่างไร — และมักใช้เป็น '},HL('"ลางร้าย"','C0392B'),{text:' พยากรณ์บ้านเมือง'}]),

    H('🗓️ 5 — สุริยุปราคาแห่งศตวรรษ: ๒ ส.ค. ๒๐๒๗'),
    P([{text:'วันที่ '},HL('๒ สิงหาคม ค.ศ. ๒๐๒๗','C0392B'),{text:' จะเกิดสุริยุปราคาเต็มดวงที่ '},B('นานที่สุดในศตวรรษนี้ — ๖ นาที ๒๓ วินาที'),{text:' (อุปราคาเต็มดวงทั่วไปแค่ ๒–๓ นาที) · เห็นเต็มดวงพาดผ่านสเปน–อียิปต์–ซาอุดีอาระเบีย ส่วน '},B('ไทยเห็นเป็นอุปราคาบางส่วน'),{text:' · เป็น "ราหูอมตะวัน" ครั้งประวัติศาสตร์ที่ทั้งโลกรอชม'}]),

    P([{text:'📌 '},B('สรุป:'),{text:' พอเข้าใจกลไก "ราหูอม" ก็ไม่ใช่ปีศาจกลืนดวงอาทิตย์ แต่เป็น '},HL('เรขาคณิตของวงโคจรที่ทำนายได้ล่วงหน้าเป็นร้อยปี 🔭','C8901E'),{text:' — ความรู้ที่เชื่อมโหราศาสตร์โบราณกับดาราศาสตร์สมัยใหม่เข้าด้วยกัน'}]),

    new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:300},children:[new TextRun({text:'— Horatad · ดาราศาสตร์พบโหราศาสตร์ —',italics:true,size:26,color:'888888',font:FONT})]}),
  ],
}]});

const buf=await Packer.toBuffer(doc);
writeFileSync(process.argv[2],buf);
console.log('docx written:',process.argv[2]);
