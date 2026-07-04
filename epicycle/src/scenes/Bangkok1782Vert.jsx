import {useCurrentFrame,interpolate,Easing,staticFile} from 'remotion';
import {Narration} from '../Narration.jsx';
import {Caption}   from '../Caption.jsx';
import {Music}     from '../Music.jsx';
import {Credit}    from '../Credit.jsx';
import * as bkkTiming from '../timing-bangkok1782.js';
const {SEG,VO_END,DURATION,CREDIT_AT,BEAT} = bkkTiming;

const W=1080,H=1920;

function ease(f,a,b,fa,fb,e=Easing.inOut(Easing.ease)){
  return interpolate(f,[a,b],[fa,fb],
    {extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:e});
}
function shotOp(from,to,frame,fade=30){
  return Math.min(ease(frame,from,from+fade,0,1), ease(frame,to-fade,to,1,0));
}

const STARS=[
  [90,80,1.8,0.7],[280,140,1,0.5],[540,60,2.2,0.8],[800,100,1.4,0.6],
  [950,200,1.9,0.75],[190,320,1.1,0.4],[700,260,1.6,0.65],[410,420,1,0.5],
  [900,370,2.1,0.7],[155,530,1.3,0.55],[610,490,1,0.45],[860,560,1.9,0.7],
  [255,670,1.6,0.6],[765,710,1.1,0.5],[455,780,2.1,0.8],[100,840,1,0.4],
  [685,830,1.6,0.65],[935,790,1.1,0.5],[355,910,1.3,0.55],[825,950,1.9,0.7],
  [60,370,1.4,0.5],[1005,440,1.7,0.6],[475,190,1,0.4],[645,340,1.3,0.55],
  [330,200,1.2,0.5],[750,160,0.9,0.4],[500,310,1.1,0.45],[870,430,1.6,0.6],
];
function Stars({op=1}){
  return<>{STARS.map(([cx,cy,r,o],i)=>
    <circle key={i} cx={cx} cy={cy} r={r} fill="white" opacity={o*op}/>)}</>;
}

// ======= SHOT A-NIGHT: ก่อนรุ่ง ฟ้ามืด เห็นดาว =======
function ShotANight({frame}){
  const op=shotOp(0, BEAT.dawn+20, frame);
  if(op<0.01) return null;
  const horizY=H*0.60;
  const starOp=ease(frame,BEAT.venus-10,BEAT.venus+25,0,1);
  const labOp=ease(frame,BEAT.venus,BEAT.venus+20,0,1)*
               ease(frame,BEAT.jupiter-20,BEAT.jupiter+30,1,0);
  const pulse=frame>=BEAT.jupiter
    ? 0.22+0.16*Math.sin((frame-BEAT.jupiter)*0.14) : 0;
  const lineOp=ease(frame,BEAT.jupiter,BEAT.jupiter+25,0,0.9);
  const jx=210, jy=horizY-390;
  const sx=280, sy=horizY-420;
  const vx=820, vy=horizY-245;
  const mx=720, my=horizY-190;

  return(
    <g opacity={op}>
      <defs>
        <linearGradient id="skyn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#05071a"/>
          <stop offset="60%" stopColor="#0b1235"/>
          <stop offset="88%" stopColor="#162660"/>
          <stop offset="100%" stopColor="#1d3575"/>
        </linearGradient>
        <linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#091420"/>
          <stop offset="100%" stopColor="#030a10"/>
        </linearGradient>
      </defs>
      <rect width={W} height={horizY} fill="url(#skyn)"/>
      <rect y={horizY} width={W} height={H-horizY} fill="url(#gnd)"/>
      <ellipse cx={W/2} cy={horizY+100} rx={320} ry={22} fill="#0c1f3a" opacity={0.7}/>
      <path d={`M0 ${horizY} Q270 ${horizY-16} ${W/2} ${horizY+2} Q760 ${horizY+8} ${W} ${horizY-4}`}
        fill="none" stroke="#1e3560" strokeWidth={2}/>
      <rect x={160} y={horizY-100} width={16} height={100} fill="#060e1c"/>
      <polygon points={`160,${horizY-100} 168,${horizY-142} 176,${horizY-100}`} fill="#060e1c"/>
      <rect x={790} y={horizY-75} width={28} height={75} fill="#060e1c"/>
      <rect x={808} y={horizY-122} width={7} height={50} fill="#060e1c"/>
      <Stars op={1}/>
      <text x={W-95} y={horizY-24} fill="#5a8ab8" fontSize={28}
        fontFamily="Sarabun,sans-serif" opacity={0.65}>ตะวันออก ▶</text>
      <text x={190} y={horizY-24} fill="#5a8ab8" fontSize={28}
        fontFamily="Sarabun,sans-serif" opacity={0.65}>◀ ใต้</text>
      <g opacity={starOp}>
        <circle cx={vx} cy={vy} r={55} fill="#fffde0" opacity={0.12}/>
        <circle cx={vx} cy={vy} r={20} fill="#fffde0" opacity={0.96}/>
        <circle cx={mx} cy={my} r={9}  fill="#e8e0c0" opacity={0.92}/>
        {labOp>0.04&&<>
          <text x={vx} y={vy-36} textAnchor="middle" fill="white" fontSize={34}
            fontFamily="Sarabun,sans-serif" opacity={labOp}
            style={{filter:'drop-shadow(0 0 8px #000)'}}>ดาวศุกร์</text>
          <text x={mx-50} y={my-24} textAnchor="middle" fill="#d0c8a0" fontSize={28}
            fontFamily="Sarabun,sans-serif" opacity={labOp*0.85}>ดาวพุธ</text>
        </>}
      </g>
      <g opacity={starOp}>
        {pulse>0&&<>
          <circle cx={jx} cy={jy} r={80} fill="#f5c842" opacity={pulse*0.18}/>
          <circle cx={sx} cy={sy} r={65} fill="#e0c870" opacity={pulse*0.14}/>
        </>}
        <line x1={jx} y1={jy} x2={sx} y2={sy}
          stroke="#f5c842" strokeWidth={2.5} strokeDasharray="7 5" opacity={lineOp}/>
        <circle cx={jx} cy={jy} r={24} fill="#f5e87a" opacity={0.96}/>
        <circle cx={sx} cy={sy} r={18} fill="#e8d880" opacity={0.96}/>
        <ellipse cx={sx} cy={sy} rx={34} ry={9}
          fill="none" stroke="#c8b050" strokeWidth={3.5} opacity={0.88}/>
        {labOp>0.04&&<>
          <text x={jx-22} y={jy+58} textAnchor="middle" fill="white" fontSize={32}
            fontFamily="Sarabun,sans-serif" opacity={labOp}>ดาวพฤหัสบดี</text>
          <text x={sx+28} y={sy-36} textAnchor="middle" fill="white" fontSize={32}
            fontFamily="Sarabun,sans-serif" opacity={labOp}>ดาวเสาร์</text>
        </>}
        {lineOp>0.3&&<text x={(jx+sx)/2-50} y={(jy+sy)/2-18} textAnchor="middle"
          fill="#f5c842" fontSize={36} fontFamily="Sarabun,sans-serif" opacity={lineOp}>
          2.4°
        </text>}
      </g>
      {frame>=BEAT.date&&frame<BEAT.venus&&(
        <g opacity={ease(frame,BEAT.date,BEAT.date+22,0,1)}>
          <rect x={90} y={170} width={W-180} height={200} rx={20}
            fill="rgba(5,10,28,0.90)" stroke="#c8a84b" strokeWidth={2}/>
          <text x={W/2} y={244} textAnchor="middle" fill="#c8a84b"
            fontSize={44} fontFamily="Sarabun,sans-serif">๖ เมษายน ๒๓๒๕</text>
          <text x={W/2} y={300} textAnchor="middle" fill="white"
            fontSize={36} fontFamily="Sarabun,sans-serif">สถาปนากรุงรัตนโกสินทร์</text>
          <text x={W/2} y={346} textAnchor="middle" fill="#7a9ec8"
            fontSize={28} fontFamily="Sarabun,sans-serif">April 6, 1782 CE</text>
        </g>
      )}
    </g>
  );
}

// ======= SHOT A-DAWN: ฤกษ์ 06:54 น. ฟ้าสว่าง ดาวหาย =======
function ShotADawn({frame}){
  const op=shotOp(BEAT.dawn-20, BEAT.time+20, frame);
  if(op<0.01) return null;
  const horizY=H*0.55;
  const starsVanish=ease(frame,BEAT.dawn,BEAT.dawn+60,1,0);
  const twistOp=ease(frame,BEAT.dawn+40,BEAT.dawn+80,0,1);
  return(
    <g opacity={op}>
      <defs>
        <linearGradient id="skyd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#1a3060"/>
          <stop offset="40%" stopColor="#3a6098"/>
          <stop offset="75%" stopColor="#6090c8"/>
          <stop offset="100%" stopColor="#88b0d8"/>
        </linearGradient>
        <linearGradient id="gndd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#1a2e18"/>
          <stop offset="100%" stopColor="#0c180a"/>
        </linearGradient>
        <radialGradient id="sunG" cx="50%" cy="100%" r="60%">
          <stop offset="0%"  stopColor="#ffe080" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#ffe080" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width={W} height={horizY} fill="url(#skyd)"/>
      <ellipse cx={W-80} cy={horizY} rx={380} ry={280} fill="url(#sunG)"/>
      <rect y={horizY} width={W} height={H-horizY} fill="url(#gndd)"/>
      <path d={`M0 ${horizY} Q270 ${horizY-14} ${W/2} ${horizY+2} Q760 ${horizY+8} ${W} ${horizY-4}`}
        fill="none" stroke="#405a30" strokeWidth={2}/>
      <rect x={155} y={horizY-95} width={16} height={95} fill="#0d1e08"/>
      <polygon points={`155,${horizY-95} 163,${horizY-138} 171,${horizY-95}`} fill="#0d1e08"/>
      <rect x={785} y={horizY-70} width={28} height={70} fill="#0d1e08"/>
      <Stars op={starsVanish}/>
      <circle cx={W-40} cy={horizY-60} r={45} fill="#ffe870" opacity={0.9}/>
      <circle cx={W-40} cy={horizY-60} r={70} fill="#ffe870" opacity={0.25}/>
      <g opacity={twistOp}>
        <rect x={60} y={160} width={W-120} height={310} rx={20}
          fill="rgba(5,10,28,0.92)" stroke="#c8a84b" strokeWidth={2}/>
        <text x={W/2} y={228} textAnchor="middle" fill="#c8a84b"
          fontSize={36} fontFamily="Sarabun,sans-serif">ฤกษ์สถาปนา ๐๖:๕๔ น.</text>
        <line x1={100} y1={248} x2={W-100} y2={248} stroke="#c8a84b" strokeWidth={1} opacity={0.4}/>
        <text x={W/2} y={296} textAnchor="middle" fill="white"
          fontSize={34} fontFamily="Sarabun,sans-serif">ดวงอาทิตย์ขึ้นแล้ว</text>
        <text x={W/2} y={342} textAnchor="middle" fill="#e87a7a"
          fontSize={34} fontFamily="Sarabun,sans-serif">ดาวทั้งหมดหายไปจากสายตา</text>
        <text x={W/2} y={400} textAnchor="middle" fill="#8aafe0"
          fontSize={28} fontFamily="Sarabun,sans-serif">แต่ดาวพฤหัส-เสาร์ยังอยู่บนฟ้า</text>
        <text x={W/2} y={440} textAnchor="middle" fill="#8aafe0"
          fontSize={28} fontFamily="Sarabun,sans-serif">ที่ alt ~47° — มองไม่เห็นด้วยตาเปล่า</text>
      </g>
    </g>
  );
}

// ======= SHOT B-TIME: เรื่องเวลาท้องถิ่น → เวลามาตรฐาน =======
function ShotBTime({frame}){
  const op=shotOp(BEAT.time-20, BEAT.astro+20, frame);
  if(op<0.01) return null;

  const FD=22;
  // sub-phase opacities — cross-fade at segment boundaries
  const s5op = Math.min(ease(frame,SEG[5].from,SEG[5].from+FD,0,1),
                        ease(frame,SEG[5].end,SEG[5].end+FD,1,0));
  const s6op = Math.min(ease(frame,SEG[5].end,SEG[5].end+FD,0,1),
                        ease(frame,SEG[6].end,SEG[6].end+FD,1,0));
  const s7op = Math.min(ease(frame,SEG[6].end,SEG[6].end+FD,0,1),
                        ease(frame,SEG[7].end,SEG[7].end+FD,1,0));
  const s8op = ease(frame,SEG[7].end,SEG[7].end+FD,0,1);

  // longitude diagram constants
  const LON_Y=H*0.50, LON_L=80, LON_R=W-80;
  const MIN_L=98.5, MAX_L=106.5;
  const lon2x=(l)=>LON_L+(l-MIN_L)/(MAX_L-MIN_L)*(LON_R-LON_L);
  const BKK_X=lon2x(100.52);
  const UTC_X=lon2x(105.0);

  const RAYS=[0,45,90,135,180,225,270,315];

  return(
    <g opacity={op}>
      <rect width={W} height={H} fill="#040818"/>
      <Stars op={0.3}/>

      {/* ===== SEG 5: ไม่มีเวลามาตรฐาน — แต่ละเมืองใช้เวลาสุริยะของตนเอง ===== */}
      <g opacity={s5op}>
        <text x={W/2} y={178} textAnchor="middle" fill="#c8a84b"
          fontSize={46} fontFamily="Sarabun,sans-serif" fontWeight="bold">เวลาสุริยะ</text>
        <text x={W/2} y={236} textAnchor="middle" fill="#6a8ab0"
          fontSize={30} fontFamily="Sarabun,sans-serif">ดวงอาทิตย์อยู่สูงสุด = เที่ยงวัน</text>

        {/* 3 city sun-dials */}
        {[
          {x:190, label:'เชียงใหม่', lon:'98.98°E', time:'06:52', col:'#a8cce0'},
          {x:540, label:'กรุงเทพฯ',  lon:'100.52°E',time:'06:54', col:'#f5c842'},
          {x:890, label:'อุบลราชธานี',lon:'104.85°E',time:'07:11', col:'#a8cce0'},
        ].map(({x,label,lon,time,col},i)=>(
          <g key={i}>
            <circle cx={x} cy={500} r={42} fill="#ffe870" opacity={0.88}/>
            {RAYS.map((a,j)=>(
              <line key={j}
                x1={x+52*Math.cos(a*Math.PI/180)} y1={500+52*Math.sin(a*Math.PI/180)}
                x2={x+68*Math.cos(a*Math.PI/180)} y2={500+68*Math.sin(a*Math.PI/180)}
                stroke="#ffe870" strokeWidth={3} opacity={0.65}/>
            ))}
            <text x={x} y={592} textAnchor="middle" fill={col}
              fontSize={28} fontFamily="Sarabun,sans-serif">{label}</text>
            <text x={x} y={630} textAnchor="middle" fill="#4a6a88"
              fontSize={22} fontFamily="monospace">{lon}</text>
            <text x={x} y={686} textAnchor="middle" fill="#f0e080"
              fontSize={44} fontFamily="monospace" fontWeight="bold">{time}</text>
          </g>
        ))}

        <text x={W/2} y={H-340} textAnchor="middle" fill="#5a7a9a"
          fontSize={28} fontFamily="Sarabun,sans-serif">แต่ละเมืองมีเวลาสุริยะต่างกัน</text>
        <text x={W/2} y={H-296} textAnchor="middle" fill="#3a5a78"
          fontSize={26} fontFamily="Sarabun,sans-serif">ก่อนมีเวลามาตรฐาน ไม่มีปัญหา</text>
      </g>

      {/* ===== SEG 6: ลองจิจูด กรุงเทพ vs UTC+7 ===== */}
      <g opacity={s6op}>
        <text x={W/2} y={178} textAnchor="middle" fill="#c8a84b"
          fontSize={42} fontFamily="Sarabun,sans-serif" fontWeight="bold">กรุงเทพฯ กับ UTC+7</text>

        {/* Ruler */}
        <line x1={LON_L} y1={LON_Y} x2={LON_R} y2={LON_Y}
          stroke="#2a4878" strokeWidth={4}/>
        {[99,100,101,102,103,104,105,106].map(l=>(
          <g key={l}>
            <line x1={lon2x(l)} y1={LON_Y-22} x2={lon2x(l)} y2={LON_Y+22}
              stroke="#2a4878" strokeWidth={2.5}/>
            <text x={lon2x(l)} y={LON_Y+52} textAnchor="middle"
              fill="#3a5878" fontSize={26} fontFamily="monospace">{l}°</text>
          </g>
        ))}

        {/* Bangkok marker — gold */}
        <line x1={BKK_X} y1={LON_Y-22} x2={BKK_X} y2={LON_Y-170}
          stroke="#f5c842" strokeWidth={2.5} strokeDasharray="6 4"/>
        <circle cx={BKK_X} cy={LON_Y} r={20} fill="#f5c842"/>
        <rect x={BKK_X-145} y={LON_Y-270} width={290} height={100} rx={12}
          fill="rgba(4,8,22,0.94)" stroke="#f5c842" strokeWidth={2}/>
        <text x={BKK_X} y={LON_Y-216} textAnchor="middle" fill="#f5c842"
          fontSize={32} fontFamily="Sarabun,sans-serif" fontWeight="bold">กรุงเทพฯ</text>
        <text x={BKK_X} y={LON_Y-178} textAnchor="middle" fill="#c8a84b"
          fontSize={26} fontFamily="monospace">100°31′E</text>

        {/* UTC+7 marker — blue */}
        <line x1={UTC_X} y1={LON_Y-22} x2={UTC_X} y2={LON_Y-170}
          stroke="#5ab0e8" strokeWidth={2.5} strokeDasharray="6 4"/>
        <circle cx={UTC_X} cy={LON_Y} r={20} fill="#5ab0e8"/>
        <rect x={UTC_X-145} y={LON_Y-270} width={290} height={100} rx={12}
          fill="rgba(4,8,22,0.94)" stroke="#5ab0e8" strokeWidth={2}/>
        <text x={UTC_X} y={LON_Y-216} textAnchor="middle" fill="#5ab0e8"
          fontSize={32} fontFamily="Sarabun,sans-serif" fontWeight="bold">เส้นโซน</text>
        <text x={UTC_X} y={LON_Y-178} textAnchor="middle" fill="#5ab0e8"
          fontSize={26} fontFamily="monospace">UTC+7 · 105°E</text>

        {/* Gap bracket */}
        <line x1={BKK_X+25} y1={LON_Y+110} x2={UTC_X-25} y2={LON_Y+110}
          stroke="#e87a7a" strokeWidth={3}/>
        <line x1={BKK_X+25} y1={LON_Y+98} x2={BKK_X+25} y2={LON_Y+122}
          stroke="#e87a7a" strokeWidth={3}/>
        <line x1={UTC_X-25} y1={LON_Y+98} x2={UTC_X-25} y2={LON_Y+122}
          stroke="#e87a7a" strokeWidth={3}/>
        <text x={(BKK_X+UTC_X)/2} y={LON_Y+168} textAnchor="middle"
          fill="#e87a7a" fontSize={44} fontFamily="Sarabun,sans-serif" fontWeight="bold">
          ช้ากว่า 18 นาที
        </text>
      </g>

      {/* ===== SEG 7: รัชกาลที่ 6 ประกาศเวลามาตรฐาน ===== */}
      <g opacity={s7op}>
        <text x={W/2} y={178} textAnchor="middle" fill="#c8a84b"
          fontSize={42} fontFamily="Sarabun,sans-serif" fontWeight="bold">เวลามาตรฐานไทย</text>

        {/* Decree card */}
        <rect x={70} y={260} width={W-140} height={480} rx={22}
          fill="rgba(4,8,22,0.96)" stroke="#c8a84b" strokeWidth={2.5}/>
        {/* Corner ornaments */}
        {[[92,282],[W-92,282],[92,718],[W-92,718]].map(([cx,cy],i)=>(
          <g key={i}>
            <circle cx={cx} cy={cy} r={8} fill="none" stroke="#c8a84b" strokeWidth={2}/>
            <circle cx={cx} cy={cy} r={3} fill="#c8a84b"/>
          </g>
        ))}

        {/* Diamond ornament */}
        <polygon points={`${W/2},330 ${W/2+22},360 ${W/2},390 ${W/2-22},360`}
          fill="#c8a84b" opacity={0.8}/>

        <text x={W/2} y={434} textAnchor="middle" fill="#c8a84b"
          fontSize={36} fontFamily="Sarabun,sans-serif">พระราชกฤษฎีกา</text>
        <line x1={110} y1={452} x2={W-110} y2={452} stroke="#c8a84b" strokeWidth={1} opacity={0.45}/>

        <text x={W/2} y={506} textAnchor="middle" fill="white"
          fontSize={40} fontFamily="Sarabun,sans-serif" fontWeight="bold">รัชกาลที่ ๖</text>
        <text x={W/2} y={558} textAnchor="middle" fill="#8aafe0"
          fontSize={32} fontFamily="Sarabun,sans-serif">๑ เมษายน พ.ศ. ๒๔๖๓</text>
        <line x1={110} y1={578} x2={W-110} y2={578} stroke="#3a5070" strokeWidth={1} opacity={0.5}/>

        <text x={W/2} y={628} textAnchor="middle" fill="white"
          fontSize={34} fontFamily="Sarabun,sans-serif">เวลามาตรฐานไทย UTC+7</text>
        <text x={W/2} y={676} textAnchor="middle" fill="#6a9ab8"
          fontSize={28} fontFamily="Sarabun,sans-serif">นาฬิกาทั่วประเทศเร็วขึ้น 18 นาที</text>

        <text x={W/2} y={H-300} textAnchor="middle" fill="#4a6a80"
          fontSize={26} fontFamily="Sarabun,sans-serif">ก่อนหน้านี้ 143 ปี ยังใช้เวลาสุริยะ</text>
      </g>

      {/* ===== SEG 8: เปรียบเทียบ 06:54 vs 07:12 ===== */}
      <g opacity={s8op}>
        <text x={W/2} y={178} textAnchor="middle" fill="#c8a84b"
          fontSize={42} fontFamily="Sarabun,sans-serif" fontWeight="bold">เวลาเดียวกัน ต่างระบบ</text>

        {/* Solar time box */}
        <rect x={42} y={268} width={450} height={390} rx={20}
          fill="rgba(4,8,22,0.95)" stroke="#c8a84b" strokeWidth={2.5}/>
        <text x={267} y={340} textAnchor="middle" fill="#a0b0c0"
          fontSize={26} fontFamily="Sarabun,sans-serif">เวลาสุริยะ</text>
        <text x={267} y={340+18} textAnchor="middle" fill="#a0b0c0"
          fontSize={22} fontFamily="Sarabun,sans-serif">ท้องถิ่น</text>
        <text x={267} y={490} textAnchor="middle" fill="#f5e060"
          fontSize={86} fontFamily="monospace" fontWeight="bold">06:54</text>
        <line x1={82} y1={520} x2={462} y2={520} stroke="#c8a84b" strokeWidth={1} opacity={0.3}/>
        <text x={267} y={572} textAnchor="middle" fill="#8a9ab0"
          fontSize={26} fontFamily="Sarabun,sans-serif">กรุงเทพ 100°31′E</text>
        <text x={267} y={614} textAnchor="middle" fill="#c8a84b"
          fontSize={28} fontFamily="Sarabun,sans-serif">ฤกษ์สถาปนาจริง</text>

        {/* Arrow */}
        <text x={W/2} y={472} textAnchor="middle" fill="#3a5878"
          fontSize={62} fontFamily="sans-serif">=</text>

        {/* Standard time box */}
        <rect x={588} y={268} width={450} height={390} rx={20}
          fill="rgba(4,8,22,0.95)" stroke="#5ab0e8" strokeWidth={2.5}/>
        <text x={813} y={340} textAnchor="middle" fill="#a0b0c0"
          fontSize={26} fontFamily="Sarabun,sans-serif">เวลามาตรฐาน</text>
        <text x={813} y={340+18} textAnchor="middle" fill="#a0b0c0"
          fontSize={22} fontFamily="Sarabun,sans-serif">ปัจจุบัน</text>
        <text x={813} y={490} textAnchor="middle" fill="#5ab0e8"
          fontSize={86} fontFamily="monospace" fontWeight="bold">07:12</text>
        <line x1={628} y1={520} x2={1008} y2={520} stroke="#5ab0e8" strokeWidth={1} opacity={0.3}/>
        <text x={813} y={572} textAnchor="middle" fill="#8a9ab0"
          fontSize={26} fontFamily="Sarabun,sans-serif">UTC+7 · 105°E</text>
        <text x={813} y={614} textAnchor="middle" fill="#5ab0e8"
          fontSize={28} fontFamily="Sarabun,sans-serif">เร็วกว่า 18 นาที</text>

        <text x={W/2} y={H-340} textAnchor="middle" fill="#5a7a98"
          fontSize={28} fontFamily="Sarabun,sans-serif">บางตำราบอก ๗:๑๕ คือปัดเศษ</text>
        <text x={W/2} y={H-296} textAnchor="middle" fill="#3a5a78"
          fontSize={26} fontFamily="Sarabun,sans-serif">ฤกษ์จริง = ๐๖:๕๔ เวลาสุริยะ</text>
      </g>
    </g>
  );
}

// ======= SHOT C: สุริยยาตร์ — geocentric · โหราจารย์คำนวณ =======
function ShotC({frame}){
  const op=shotOp(BEAT.astro-20, BEAT.payoff+20, frame);
  if(op<0.01) return null;

  const t=(frame-BEAT.astro)/160;
  const cx=W/2, cy=H*0.36;

  // Geocentric: Earth at center, Sun + planets orbiting
  const RS_SUN=180;
  const RJ=300, RS_SAT=420;
  const sunAng=t*Math.PI*2*0.9;
  const jAng=t*Math.PI*2;
  const sAng=t*Math.PI*2*0.41+0.18;

  const sunX=cx+RS_SUN*Math.cos(sunAng);
  const sunY=cy+RS_SUN*Math.sin(sunAng)*0.40;
  const jx=cx+RJ*Math.cos(jAng);
  const jy=cy+RJ*Math.sin(jAng)*0.40;
  const sx=cx+RS_SAT*Math.cos(sAng);
  const sy=cy+RS_SAT*Math.sin(sAng)*0.40;

  const sep=Math.hypot(jx-sx,jy-sy);
  const glow=sep<100?(100-sep)/100:0;
  const textOp=ease(frame,BEAT.astro+50,BEAT.astro+90,0,1);
  const labOp=ease(frame,BEAT.astro+30,BEAT.astro+60,0,1);

  return(
    <g opacity={op}>
      <rect width={W} height={H} fill="#03040d"/>
      <Stars op={0.55}/>

      {/* วงโคจร */}
      <ellipse cx={cx} cy={cy} rx={RS_SUN} ry={RS_SUN*0.40}
        fill="none" stroke="#5a6898" strokeWidth={1.5} strokeDasharray="5 5" opacity={0.45}/>
      <ellipse cx={cx} cy={cy} rx={RJ} ry={RJ*0.40}
        fill="none" stroke="#3a5888" strokeWidth={1.5} strokeDasharray="6 5" opacity={0.50}/>
      <ellipse cx={cx} cy={cy} rx={RS_SAT} ry={RS_SAT*0.40}
        fill="none" stroke="#2a4878" strokeWidth={1.5} strokeDasharray="6 5" opacity={0.40}/>

      {/* โลก — ศูนย์กลาง geocentric */}
      <circle cx={cx} cy={cy} r={80}  fill="#1a4080" opacity={0.20}/>
      <circle cx={cx} cy={cy} r={48}  fill="#1a60c0" opacity={0.30}/>
      <circle cx={cx} cy={cy} r={32}  fill="#2880e0" opacity={0.90}/>
      <circle cx={cx} cy={cy} r={32}  fill="none" stroke="#60a8e8" strokeWidth={2} opacity={0.7}/>
      <text x={cx} y={cy+58} textAnchor="middle" fill="#60a8e8"
        fontSize={26} fontFamily="Sarabun,sans-serif" opacity={0.9}>โลก</text>

      {/* ดวงอาทิตย์ */}
      <circle cx={sunX} cy={sunY} r={60}  fill="#ffe870" opacity={0.12}/>
      <circle cx={sunX} cy={sunY} r={30}  fill="#fff4a0" opacity={0.50}/>
      <circle cx={sunX} cy={sunY} r={20}  fill="#fffac8" opacity={0.96}/>
      <text x={sunX} y={sunY-32} textAnchor="middle" fill="#ffe870"
        fontSize={22} fontFamily="Sarabun,sans-serif" opacity={labOp*0.8}>อาทิตย์</text>

      {/* conjunction glow */}
      {glow>0.05&&<ellipse cx={(jx+sx)/2} cy={(jy+sy)/2}
        rx={110*glow} ry={65*glow} fill="#f5c842" opacity={glow*0.32}/>}

      {/* Jupiter */}
      <circle cx={jx} cy={jy} r={20} fill="#f5e870" opacity={0.96}/>
      <text x={jx} y={jy-30} textAnchor="middle" fill="#f5c842"
        fontSize={24} fontFamily="Sarabun,sans-serif" opacity={labOp}>ดาวพฤหัส</text>

      {/* Saturn + ring */}
      <circle cx={sx} cy={sy} r={16} fill="#e8d880" opacity={0.96}/>
      <ellipse cx={sx} cy={sy} rx={30} ry={8}
        fill="none" stroke="#c8b050" strokeWidth={3.5} opacity={0.88}/>
      <text x={sx} y={sy-30} textAnchor="middle" fill="#e0c870"
        fontSize={24} fontFamily="Sarabun,sans-serif" opacity={labOp}>ดาวเสาร์</text>

      {/* orbit labels */}
      <text x={cx} y={cy+RS_SAT*0.40+30} textAnchor="middle" fill="#3a5888"
        fontSize={20} fontFamily="Sarabun,sans-serif" opacity={0.5}>ระบบ geocentric — โลกเป็นศูนย์กลาง</text>

      {/* text panel */}
      <g opacity={textOp}>
        <rect x={60} y={H-560} width={W-120} height={220} rx={18}
          fill="rgba(3,4,15,0.88)" stroke="#c8a84b" strokeWidth={1.5}/>
        <text x={W/2} y={H-476} textAnchor="middle" fill="white"
          fontSize={38} fontFamily="Sarabun,sans-serif" fontWeight="bold">
          คัมภีร์สุริยยาตร์
        </text>
        <text x={W/2} y={H-424} textAnchor="middle" fill="#c8a84b"
          fontSize={30} fontFamily="Sarabun,sans-serif">
          สูตรดาราศาสตร์จากอินเดีย · กว่าพันปี
        </text>
        <text x={W/2} y={H-376} textAnchor="middle" fill="#7a9ab8"
          fontSize={26} fontFamily="Sarabun,sans-serif">
          รู้ตำแหน่งดาวแม้ตาเปล่ามองไม่เห็น
        </text>
      </g>
    </g>
  );
}

// ======= SHOT E: Payoff — ท้องฟ้า + ครุฑ + text =======
function ShotE({frame}){
  const op=shotOp(BEAT.payoff-20, DURATION, frame);
  if(op<0.01) return null;
  const pulse=0.20+0.14*Math.sin(frame*0.10);
  const textOp=ease(frame,BEAT.payoff+20,BEAT.payoff+60,0,1);
  const garudaOp=ease(frame,BEAT.payoff+30,BEAT.payoff+95,0,0.30);
  const jx=W/2-75, jy=H*0.28;
  const sx=W/2+92, sy=H*0.26;
  return(
    <g opacity={op}>
      <defs>
        <radialGradient id="skyE" cx="50%" cy="30%" r="72%">
          <stop offset="0%"  stopColor="#0e1840"/>
          <stop offset="100%" stopColor="#030510"/>
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#skyE)"/>
      <Stars op={1}/>
      <rect x={0} y={H-180} width={W} height={180} fill="#06101e"/>
      <circle cx={jx} cy={jy} r={110} fill="#f5c842" opacity={pulse*0.11}/>
      <circle cx={jx} cy={jy} r={26}  fill="#f5e870" opacity={0.96}/>
      <circle cx={sx} cy={sy} r={80}  fill="#e0c870" opacity={pulse*0.10}/>
      <circle cx={sx} cy={sy} r={18}  fill="#e8d888" opacity={0.96}/>
      <ellipse cx={sx} cy={sy} rx={36} ry={10}
        fill="none" stroke="#c8b050" strokeWidth={4} opacity={0.9}/>
      <line x1={jx} y1={jy} x2={sx} y2={sy}
        stroke="#f5c842" strokeWidth={2} strokeDasharray="8 6" opacity={0.65}/>
      {/* ครุฑ — SVG <image> ใน <g> เดียวกัน ไม่มี border */}
      <image
        href={staticFile('garuda.png')}
        x={W*0.04} y={H*0.30}
        width={W*0.92}
        opacity={garudaOp}
        style={{mixBlendMode:'screen'}}
      />
      <g opacity={textOp} fontFamily="Tahoma,'Leelawadee UI','Noto Sans Thai',sans-serif" fontWeight="bold">
        <text x={W/2} y={H-460} textAnchor="middle" fill="white" fontSize={44}
          style={{filter:'drop-shadow(0 2px 10px rgba(0,0,0,.95))'}}>
          ดาวสองดวงนี้กุมกัน
        </text>
        <text x={W/2} y={H-400} textAnchor="middle" fill="#c8a84b" fontSize={44}
          style={{filter:'drop-shadow(0 2px 10px rgba(0,0,0,.95))'}}>
          ทุกยี่สิบปี
        </text>
        <text x={W/2} y={H-336} textAnchor="middle" fill="#8aafe0" fontSize={38}
          style={{filter:'drop-shadow(0 2px 10px rgba(0,0,0,.95))'}}>
          และทุกครั้ง โลกก็เปลี่ยน
        </text>
        <text x={W/2} y={H-282} textAnchor="middle" fill="#5a7aa0" fontSize={32}
          style={{filter:'drop-shadow(0 2px 10px rgba(0,0,0,.95))'}}>
          ครั้งต่อไป — พ.ศ. ๒๕๘๓
        </text>
      </g>
    </g>
  );
}

// ======= Main =======
export function Bangkok1782Vert(){
  const frame=useCurrentFrame();
  return(
    <div style={{width:W,height:H,background:'#03040d',overflow:'hidden',position:'relative'}}>
      <svg width={W} height={H} style={{position:'absolute',top:0,left:0}}>
        <ShotANight frame={frame}/>
        <ShotADawn  frame={frame}/>
        <ShotBTime  frame={frame}/>
        <ShotC      frame={frame}/>
        <ShotE      frame={frame}/>
      </svg>
      <Caption timing={bkkTiming}/>
      <Narration timing={bkkTiming} voDir="vo-bangkok1782"/>
      <Music timing={bkkTiming} music="audio/ton-barathes-clip.mp3"
        gain={1.0} duck={0.55} creditAt={CREDIT_AT}/>
      <Credit timing={bkkTiming} startAt={CREDIT_AT}
        label="ข้อมูลดาราศาสตร์" source="PyEphem · ephem.rhodesmill.org"
        sub="ปรากฏการณ์จริง ๖ เม.ย. พ.ศ. ๒๓๒๕ · ฤกษ์ ๐๖:๕๔ น."/>
    </div>
  );
}
