const fs=require('fs');const path=require('path');
const {Document,Packer,Paragraph,TextRun,HeadingLevel,AlignmentType,LevelFormat,BorderStyle}=require('docx');

const OUTDIR=path.join(__dirname,'..','FB-output','260611 Epicycle vs Heliocentric');
fs.mkdirSync(OUTDIR,{recursive:true});

// ---- run helpers ----
const T=(t,o={})=>new TextRun({text:t,...o});
const B=t=>T(t,{bold:true});
const GEO=t=>T(t,{bold:true,color:'B26A00'});   // geocentric/epicycle = amber
const HEL=t=>T(t,{bold:true,color:'1F6FB2'});    // heliocentric = blue
const OK=t=>T(t,{bold:true,color:'2E7D32'});     // valid = green
const P=(children,o={})=>new Paragraph({spacing:{after:140,line:288},children,...o});
const bullet=children=>new Paragraph({numbering:{reference:'bul',level:0},spacing:{after:90,line:284},children});

const doc=new Document({
  styles:{
    default:{document:{run:{font:'Arial',size:24}}},
    paragraphStyles:[
      {id:'Title',name:'Title',basedOn:'Normal',next:'Normal',quickFormat:true,
        run:{size:34,bold:true,font:'Arial',color:'1A1A1A'},
        paragraph:{spacing:{after:80},outlineLevel:0}},
      {id:'Heading2',name:'Heading 2',basedOn:'Normal',next:'Normal',quickFormat:true,
        run:{size:28,bold:true,font:'Arial',color:'12325A'},
        paragraph:{spacing:{before:280,after:140},outlineLevel:1}},
    ]
  },
  numbering:{config:[
    {reference:'bul',levels:[{level:0,format:LevelFormat.BULLET,text:'•',alignment:AlignmentType.LEFT,
      style:{paragraph:{indent:{left:560,hanging:280}}}}]}
  ]},
  sections:[{
    properties:{page:{size:{width:11906,height:16838},margin:{top:1300,right:1300,bottom:1300,left:1300}}},
    children:[
      new Paragraph({style:'Title',children:[T('🌌 2,000 ปีที่มนุษย์วาดจักรวาล "ผิด" — แต่ผิดอย่างมีเหตุผล')]}),
      new Paragraph({spacing:{after:200},children:[T('(แล้วทำไมหมอดู–ปฏิทินทุกวันนี้ยัง "ถูก" ที่ใช้แบบเก่า?)',{italics:true,color:'666666',size:24})]}),

      // ---- 1 ----
      new Paragraph({style:'Heading2',children:[T('🌍 ตอนที่ 1 — ปโตเลมี กับโลกเป็นศูนย์กลาง')]}),
      P([T('ราว '),B('ค.ศ. 150'),T(' '),B('คลอดิอุส ปโตเลมี'),T(' (Claudius Ptolemy) เขียนตำรา '),T('Almagest',{italics:true}),T(' วางจักรวาลให้ '),GEO('โลกอยู่นิ่งตรงกลาง'),T(' — ดวงอาทิตย์ ดวงจันทร์ และดาวเคราะห์ โคจรรอบโลก')]),
      P([T('ปัญหาคือ ดาวเคราะห์ดัน "เดินถอยหลัง" บ้าง เร็ว–ช้าไม่สม่ำเสมอบ้าง ทางแก้ของปโตเลมีคือ '),GEO('เอพิไซเคิล (Epicycle)'),T(' 🌀 — ให้ดาววิ่งเป็น "วงเล็กซ้อนอยู่บนวงใหญ่"')]),
      P([T('ผลคือ… ทำนายตำแหน่งดาวบนท้องฟ้าได้แม่นพอใช้งานจริง ใช้ทำปฏิทินและโหราศาสตร์ได้ '),B('นานกว่า 1,400 ปี')]),

      // ---- 2 ----
      new Paragraph({style:'Heading2',children:[T('☀️ ตอนที่ 2 — แล้วใครเปลี่ยน? เพราะอะไร?')]}),
      bullet([T('🔭 '),B('โคเปอร์นิคัส (ค.ศ. 1543)'),T(' เสนอ "เอาดวงอาทิตย์ไว้ตรงกลางสิ" — ทุกอย่างเรียบง่ายขึ้นทันที: ดาวอังคารถอยหลังกลายเป็นแค่ '),HEL('ภาพลวงตา'),T(' ตอนโลกแซง และพุธ–ศุกร์ที่ "ไม่เคยห่างดวงอาทิตย์" ก็อธิบายได้เอง (เห็นชัดในคลิปนี้!) แต่เขายังใช้วงกลม เลยยังไม่แม่นกว่าเดิมเท่าไร')]),
      P([B('เครื่องมือพิสูจน์เริ่มพัฒนาขึ้น:')],{spacing:{before:60,after:80}}),
      bullet([B('ทือโค บราเฮ'),T(' (Tycho Brahe) วัดตำแหน่งดาวแม่นยำที่สุดในยุคนั้น (ด้วยตาเปล่า + เครื่องมือขนาดยักษ์ ยังไม่มีกล้องด้วยซ้ำ)')]),
      bullet([B('เคปเลอร์ (ค.ศ. 1609)'),T(' เอาข้อมูลของทือโคมาคำนวณ → พบว่าวงโคจรเป็น '),HEL('วงรี'),T(' ไม่ใช่วงกลม → ทิ้งเอพิไซเคิลได้หมด แม่นยำขึ้นแบบก้าวกระโดด')]),
      bullet([B('กาลิเลโอ (ค.ศ. 1610)'),T(' ส่องกล้องโทรทรรศน์ เห็น '),HEL('เฟสของดาวศุกร์เต็มดวง'),T(' (แบบที่เราเคยทำคลิป Venus Phase!) = ศุกร์ต้องโคจรรอบ"ดวงอาทิตย์" ไม่ใช่รอบโลก + เห็นดวงจันทร์โคจรรอบดาวพฤหัส = ไม่ใช่ทุกอย่างโคจรรอบโลก')]),
      bullet([T('🍎 '),B('นิวตัน (ค.ศ. 1687)'),T(' อธิบาย "ทำไม" ด้วยแรงโน้มถ่วง → heliocentric มีรากฐานฟิสิกส์รองรับ')]),
      bullet([T('ต่อมาวัด '),B('พารัลแลกซ์ของดาวฤกษ์'),T(' ได้จริง (ค.ศ. 1838) = หลักฐานตรงๆ ว่าโลกเคลื่อนที่')]),

      // ---- 3 ----
      new Paragraph({style:'Heading2',children:[T('🔭 ตอนที่ 3 — ทำไมโหราศาสตร์–ปฏิทิน ยังใช้ "โลกเป็นศูนย์กลาง"?')]}),
      P([T('จุดนี้คนเข้าใจผิดบ่อยที่สุด 👇 โหราศาสตร์และปฏิทินสนใจ '),B('"ดาวอยู่ตรงไหนของท้องฟ้า เมื่อมองจากโลก"'),T(' (อยู่ราศีไหน เรือนไหน) — ซึ่งเป็นมุมมองจากโลกโดยธรรมชาติ')]),
      P([OK('✅ การใช้กรอบ geocentric กับ "ตำแหน่งที่เห็นจากโลก" จึงถูกต้องและเหมาะสม'),T(' เหมือนเราพูดว่า "ดวงอาทิตย์ขึ้นทางทิศตะวันออก" ทั้งที่จริงโลกหมุน — ไม่ผิด เพราะกำลังพูดถึงสิ่งที่เห็นจากจุดที่เรายืน')]),
      P([T('⚠️ '),B('แต่ต้องแยกให้ชัด:'),T(' geocentric ในฐานะ "กรอบมองตำแหน่งดาว" = '),OK('valid 100%'),T(' · ส่วน "โลกเป็นศูนย์กลางจักรวาลจริงๆ" = อันนั้น '),HEL('heliocentric'),T(' ถูกกว่า — เป็นคนละประเด็นกัน')]),
      P([T('เกร็ด: แม้แต่ปฏิทินดาราศาสตร์สมัยใหม่ ก็คำนวณแบบ heliocentric แล้ว "แปลงกลับ" เป็นตำแหน่งที่เห็นจากโลกเพื่อใช้งานอยู่ดี')]),

      // ---- สรุป ----
      new Paragraph({style:'Heading2',children:[T('✨ สรุป')]}),
      P([B('ปโตเลมีไม่ได้ "โง่"'),T(' — โมเดลของเขาทำนายท้องฟ้าได้จริง · '),HEL('heliocentric'),T(' ชนะเพราะ '),B('เรียบง่ายกว่า + มีหลักฐานหนุน'),T(' · ส่วนปฏิทิน–โหราศาสตร์ที่ใช้ตำแหน่งจากโลก ก็ยัง valid ในฐานะ "สิ่งที่เห็นจากโลก" 🌍🔭')]),

      new Paragraph({spacing:{before:220,after:60},children:[T('#Horatad  #ดาราศาสตร์  #โหราศาสตร์  #Epicycle  #Heliocentric  #ปฏิทินไทย',{color:'1F6FB2',size:22})]}),
      new Paragraph({border:{top:{style:BorderStyle.SINGLE,size:6,color:'CCCCCC',space:8}},spacing:{before:160},
        children:[T('🎬 คลิปประกอบ: Epicycle vs Heliocentric  ·  Horatad created · 11 June 2026',{color:'888888',size:20})]}),
    ]
  }]
});

Packer.toBuffer(doc).then(buf=>{
  const out=path.join(OUTDIR,'Epicycle-vs-Heliocentric-FB.docx');
  fs.writeFileSync(out,buf);
  console.log('WROTE',out,buf.length,'bytes');
  // copy final clip into same folder
  const clip=path.join(__dirname,'out','two-systems.mp4');
  const dst=path.join(OUTDIR,'epicycle-heliocentric 11Jun26.mp4');
  fs.copyFileSync(clip,dst);
  console.log('COPIED clip ->',dst);
});
