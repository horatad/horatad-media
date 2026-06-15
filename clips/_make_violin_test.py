import mido
TPB=480; beat=TPB
mid=mido.MidiFile(ticks_per_beat=TPB)
tr=mido.MidiTrack(); mid.tracks.append(tr)
tr.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(64), time=0))
tr.append(mido.Message('program_change', program=40, channel=0, time=0))  # Violin

# lyrical solo line in D major: (midi_note, dur_in_beats)  rests = note None
# exposes: long held notes (loop/vibrato), stepwise legato, register change
mel = [
 (69,4),            # A4 long (opening, held - tests sustain/vibrato)
 (69,1),(71,1),(69,1),(67,1),
 (66,4),            # F#4 held
 (66,1),(67,1),(69,1),(71,1),
 (69,3),(74,1),     # rise to D5
 (74,2),(73,1),(71,1),
 (69,4),            # A4 held (breath)
 (74,4),            # D5 held high (tests high register)
 (74,1),(76,1),(78,1),(76,1),
 (74,2),(69,2),
 (71,2),(69,2),
 (67,4),            # G4 held
 (69,2),(66,2),
 (62,6),            # D4 final long resolve (very exposed)
]
events=[]  # (tick,'on'/'off'/'cc',a,b)
t=0
N=len(mel)
for i,(n,d) in enumerate(mel):
    dur=int(d*beat)
    phase=i/(N-1)
    vel=int(58+30* (0.5-0.5* __import__('math').cos(2* __import__('math').pi* min(phase,1)) ) )  # gentle arch 58..88
    vel=max(52,min(96,vel))
    if n is not None:
        events.append((t,'on',n,vel)); events.append((t+dur-15,'off',n,0))
        # expression swell on long notes (>=2 beats): rise then fall via CC11
        if d>=2:
            steps=max(4,int(d*4))
            for s in range(steps+1):
                f=s/steps
                val=int(70+45* __import__('math').sin(__import__('math').pi*f))  # 70..115..70
                events.append((t+int(f*(dur-15)),'cc',11,min(127,val)))
    t+=dur

events.sort(key=lambda e:(e[0], 0 if e[1]=='off' else (1 if e[1]=='cc' else 2)))
prev=0
# ensure expression starts full
tr.append(mido.Message('control_change',control=11,value=100,time=0,channel=0))
for tk,typ,a,b in events:
    dt=tk-prev; prev=tk
    if typ=='on': tr.append(mido.Message('note_on',note=a,velocity=b,time=dt,channel=0))
    elif typ=='off': tr.append(mido.Message('note_off',note=a,velocity=0,time=dt,channel=0))
    else: tr.append(mido.Message('control_change',control=a,value=b,time=dt,channel=0))
out=r"C:\horatad-media\clips\Violin test.mid"
mid.save(out)
print(f"saved {out}  length={mid.length:.1f}s")
