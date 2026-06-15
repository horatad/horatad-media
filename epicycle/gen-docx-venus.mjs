import {Document,Packer,Paragraph,TextRun,AlignmentType} from 'docx';
import {writeFileSync} from 'fs';

const FONT='TH Sarabun New';
const H=(text,color='8A5A00',size=30)=>new Paragraph({spacing:{before:240,after:120},children:[new TextRun({text,bold:true,size,color,font:FONT})]});
const P=(runs,opts={})=>new Paragraph({spacing:{after:120,line:300},alignment:opts.align,children:(Array.isArray(runs)?runs:[runs]).map(r=>typeof r==='string'?new TextRun({text:r,size:30,font:FONT}):new TextRun({size:30,font:FONT,...r}))});
const B=t=>({text:t,bold:true});
const HL=(t,color)=>({text:t,bold:true,color});

const doc=new Document({sections:[{
  properties:{page:{margin:{top:1000,bottom:1000,left:1100,right:1100}}},
  children:[
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:60},children:[new TextRun({text:'☀️✨ ดาวศุกร์สว่างที่สุด — ปี ๒๕๖๙',bold:true,size:40,color:'C77F00',font:FONT})]}),
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},children:[new TextRun({text:'🌟 สว่างสุด ๒๒ ก.ย. & ๒๗ พ.ย. · 🌙 จันทร์บังศุกร์ ๑๔ ก.ย. · 💫 ดาวรุ่ง–ดาวประจำเมือง',size:28,color:'555555',font:FONT})]}),

    P([{text:'ปี ๒๕๖๙ ดาวศุกร์จะ '},HL('"สว่างที่สุด" ถึง ๒ ครั้ง','C77F00'),{text:' และมี '},B('ดวงจันทร์บังดาวศุกร์'),{text:' ให้ดูด้วย · แต่เรื่องที่หลายคนงงคือ — ทำไมดาวศุกร์ '},B('"เสี้ยว"'),{text:' ถึงสว่างกว่าตอน '},B('"เต็มดวง"'),{text:'? บทนี้ไล่ทีละขั้น'}]),

    H('🌗 1 — ดาวศุกร์ "มีเฟส" เหมือนดวงจันทร์'),
    P([{text:'ดาวศุกร์โคจรรอบดวงอาทิตย์ '},B('วงในกว่าโลก'),{text:' เราจึงเห็นมันเป็นเสี้ยว/ครึ่ง/เกือบเต็ม สลับไปตามมุม เหมือนดวงจันทร์ · '},HL('กาลิเลโอส่องเห็นเฟสนี้เมื่อปี ค.ศ. ๑๖๑๐','8A5A00'),{text:' กลายเป็นหลักฐานเด็ดล้มความเชื่อ "โลกเป็นศูนย์กลาง" — เพราะถ้าโลกเป็นศูนย์กลาง ดาวศุกร์จะไม่มีทางเห็นเป็นเต็มดวงได้'}]),

    H('💡 2 — เสี้ยว = ใกล้โลก = สว่างที่สุด (ขัดสามัญสำนึก!)'),
    P([{text:'หลายคนคิดว่า "เต็มดวงต้องสว่างสุด" — '},HL('ผิด! ❌','C0392B'),{text:' ตอนดาวศุกร์เต็มดวง มันอยู่ '},B('ไกลสุด (อีกฟากดวงอาทิตย์)'),{text:' จึงเล็กและจาง'}]),
    P([{text:'ตอนเป็น '},HL('เสี้ยวบาง','C77F00'),{text:' กลับเป็นช่วงที่ศุกร์ '},B('เข้าใกล้โลกที่สุด'),{text:' จานโตขึ้นมาก แม้สว่างแค่เสี้ยวเดียวก็ยัง '},HL('สว่างรวมมากที่สุด','C77F00'),{text:' (นักดาราศาสตร์เรียก greatest brilliancy — เกิดตอนจานสว่างราว ๒๗%) สว่างถึงระดับ '},B('เห็นได้กลางวัน'),{text:' และทอดเงาจางๆ ได้'}]),
    P([{text:'🔦 '},{text:'เหมือนไฟฉายดวงใหญ่ที่อยู่ใกล้ ส่องสว่างกว่าหลอดเล็กที่อยู่ไกล แม้เปิดไม่เต็มดวง'}]),

    H('📅 3 — เหตุการณ์ดาวศุกร์ ปี ๒๕๖๙ (NARIT)'),
    P([{text:'🌙 '},HL('๑๔ ก.ย. — ดวงจันทร์บังดาวศุกร์','C77F00'),{text:' (occultation: จันทร์เคลื่อนมาบังศุกร์พอดี เห็นศุกร์ "หาย" แล้วโผล่กลับ)'}]),
    P([{text:'🌟 '},HL('๒๒ ก.ย. & ๒๗ พ.ย. — ดาวศุกร์สว่างที่สุด','C77F00'),{text:' (greatest brilliancy ทั้งสองรอบ — รอบหนึ่งเป็นดาวรุ่งก่อนฟ้าสาง อีกรอบเป็นดาวประจำเมืองหัวค่ำ)'}]),

    H('💫 4 — "ดาวรุ่ง" กับ "ดาวประจำเมือง" คือดวงเดียวกัน'),
    P([{text:'ดาวศุกร์โผล่ได้ทั้ง '},B('ก่อนรุ่งสาง (ดาวรุ่ง / ดาวประกายพรึก)'),{text:' และ '},B('หัวค่ำหลังตะวันตก (ดาวประจำเมือง)'),{text:' — '},HL('เป็นดาวดวงเดียวกัน','C77F00'),{text:' แค่อยู่คนละฟากของวงโคจรเทียบดวงอาทิตย์ · คนโบราณหลายชาติเคยนึกว่าเป็นดาวสองดวง'}]),

    H('♀ 5 — โหราศาสตร์: ดาวศุกร์'),
    P([{text:'ในโหราศาสตร์ไทย '},HL('ดาวศุกร์ (เลข ๖)','C77F00'),{text:' เป็นดาวแห่ง '},B('ความรัก ความงาม ศิลปะ การเงิน เสน่ห์'),{text:' · ช่วงที่ศุกร์สว่างเด่นบนฟ้าจริง จึงเป็นจังหวะดีที่จะชวนคนแหงนมองแล้วโยงเข้าความหมายทางโหรได้พอดี'}]),
    P([{text:'📌 '},B('สรุป:'),{text:' ครั้งหน้าเห็นดาวสว่างจ้าดวงเดียวตอนหัวค่ำหรือก่อนรุ่ง — นั่นคือดาวศุกร์ และถ้ามันเป็น '},HL('เสี้ยวบางๆ ในกล้อง','C77F00'),{text:' นั่นแหละคือตอนที่มัน "สว่างที่สุด" 🌟'}]),

    new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:300},children:[new TextRun({text:'— Horatad · ดาราศาสตร์พบโหราศาสตร์ —',italics:true,size:26,color:'888888',font:FONT})]}),
  ],
}]});

const buf=await Packer.toBuffer(doc);
writeFileSync(process.argv[2],buf);
console.log('docx written:',process.argv[2]);
