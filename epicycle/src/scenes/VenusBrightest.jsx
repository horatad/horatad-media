import {AbsoluteFill,useCurrentFrame,interpolate} from 'remotion';
import {VenusPhase} from './VenusPhase.jsx';

// ── repost ผูกเหตุการณ์จริง: reuse VenusPhase เต็ม + การ์ดเปิดบอกวันปรากฏการณ์ปี 2569 ──
// 22 ก.ย. & 27 พ.ย. ดาวศุกร์สว่างที่สุด · 14 ก.ย. ดวงจันทร์บังดาวศุกร์ (NARIT)
export function VenusBrightest(){
  const f=useCurrentFrame();
  const op=interpolate(f,[0,18,120,150],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return(
    <AbsoluteFill style={{background:'#020a16'}}>
      <VenusPhase/>
      {op>0.001&&(
        <AbsoluteFill style={{opacity:op,justifyContent:'center',alignItems:'center',pointerEvents:'none'}}>
          <div style={{
            background:'rgba(4,10,24,0.82)',border:'1px solid rgba(150,200,255,0.35)',
            borderRadius:24,padding:'40px 56px',textAlign:'center',maxWidth:820,
            boxShadow:'0 0 60px rgba(120,180,255,0.25)'}}>
            <div style={{color:'#9fd0ff',fontSize:30,fontWeight:600,letterSpacing:1}}>🌟 ปรากฏการณ์ท้องฟ้า ปี ๒๕๖๙</div>
            <div style={{color:'#ffffff',fontSize:62,fontWeight:800,margin:'14px 0 6px'}}>ดาวศุกร์สว่างที่สุด</div>
            <div style={{color:'#bfe0ff',fontSize:40,fontWeight:700}}>๒๒ ก.ย. &amp; ๒๗ พ.ย.</div>
            <div style={{color:'rgba(190,224,255,0.85)',fontSize:27,marginTop:18}}>🌙 ดวงจันทร์บังดาวศุกร์ — ๑๔ ก.ย. ๒๕๖๙</div>
            <div style={{color:'rgba(255,255,255,0.6)',fontSize:23,marginTop:22,fontStyle:'italic'}}>ทำไม "เสี้ยว" ถึงสว่างกว่า "เต็มดวง"? ↓</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
}
