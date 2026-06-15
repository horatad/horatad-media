import {AbsoluteFill,useCurrentFrame,interpolate} from 'remotion';
import {VenusPhaseVert} from './VenusPhaseVert.jsx';

// ── repost ผูกเหตุการณ์ปี 2569: reuse VenusPhaseVert + การ์ดเปิด (โผล่ช่วง intro 5วิ ก่อนพากย์) ──
// 22 ก.ย. & 27 พ.ย. ดาวศุกร์สว่างที่สุด · 14 ก.ย. ดวงจันทร์บังดาวศุกร์ (NARIT)
export function VenusBrightestVert(){
  const f=useCurrentFrame();
  const op=interpolate(f,[0,18,135,165],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return(
    <AbsoluteFill style={{background:'#020a16'}}>
      <VenusPhaseVert/>
      {op>0.001&&(
        <AbsoluteFill style={{opacity:op,justifyContent:'center',alignItems:'center',pointerEvents:'none'}}>
          <div style={{
            background:'rgba(4,10,24,0.86)',border:'1px solid rgba(150,200,255,0.35)',
            borderRadius:28,padding:'48px 56px',textAlign:'center',maxWidth:920,
            boxShadow:'0 0 70px rgba(120,180,255,0.3)'}}>
            <div style={{color:'#9fd0ff',fontSize:36,fontWeight:600,letterSpacing:1}}>🌟 ปรากฏการณ์ท้องฟ้า ปี ๒๕๖๙</div>
            <div style={{color:'#ffffff',fontSize:78,fontWeight:800,margin:'18px 0 8px'}}>ดาวศุกร์สว่างที่สุด</div>
            <div style={{color:'#bfe0ff',fontSize:50,fontWeight:700}}>๒๒ ก.ย. &amp; ๒๗ พ.ย.</div>
            <div style={{color:'rgba(190,224,255,0.85)',fontSize:34,marginTop:24}}>🌙 ดวงจันทร์บังดาวศุกร์ — ๑๔ ก.ย. ๒๕๖๙</div>
            <div style={{color:'rgba(255,255,255,0.6)',fontSize:28,marginTop:28,fontStyle:'italic'}}>ทำไม "เสี้ยว" ถึงสว่างกว่า "เต็มดวง"? ↓</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
}
