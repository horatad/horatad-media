import mido, math
TPB=480; beat=TPB
mid=mido.MidiFile(ticks_per_beat=TPB)
tr=mido.MidiTrack(); mid.tracks.append(tr)
tr.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(104), time=0))
tr.append(mido.Message('program_change', program=40, channel=0, time=0))  # violin
tr.append(mido.Message('program_change', program=0,  channel=1, time=0))  # piano

ev=[]  # (tick, 'on'/'off'/'cc', chan, a, b)
def n(ch, t, note, dur, vel):
    ev.append((t,'on',ch,note,vel)); ev.append((t+dur-12,'off',ch,note,0))
def cc(ch,t,ctrl,val): ev.append((t,'cc',ch,ctrl,val))

# F major. chords per bar: root + triad notes (for piano arpeggio)
F=65
chords = [  # (bass, [triad asc])
 (41,[53,57,60]),  # F:  F2, F3 A3 C4
 (41,[53,57,60]),
 (36,[48,52,55]),  # C:  C2, C3 E3 G3
 (36,[48,52,55]),
 (38,[50,53,57]),  # Dm: D2, D3 F3 A3
 (46,[46,50,53]),  # Bb: Bb2,Bb2 D3 F3
 (36,[48,52,55,58]),# C7: C2, C3 E3 G3 Bb3
 (41,[53,57,60]),  # F
]
# violin melody per 8-bar theme: list of (note, beats)
theme = [
 [(72,1),(77,1),(81,2)],            # C5 F5 A5(held)
 [(81,.5),(79,.5),(77,1),(76,1),(74,1)],
 [(72,2),(76,1),(79,1)],
 [(79,2),(77,1),(76,1)],
 [(74,1),(77,1),(81,2)],
 [(70,1),(74,1),(77,2)],
 [(67,1),(72,1),(76,1),(79,1)],
 [(77,4)],
]
def build(start_tick, octave=0, vbase=70):
    for b in range(8):
        bs = start_tick + b*4*beat
        bass,triad = chords[b]
        # piano: bass half note + arpeggio eighths (brought forward in mix)
        n(1, bs, bass, beat*2, min(110, vbase+6))
        pat = (triad*3)[:8]
        for k,note in enumerate(pat):
            n(1, bs+k*(beat//2), note+0, beat//2, vbase-2 + (6 if k==0 else 0))
        # violin melody (slightly tamed so piano is audible)
        t=bs
        for (mn,db) in theme[b]:
            dur=int(db*beat); mn2=mn+octave
            vel=min(102, vbase+2)
            n(0, t, mn2, dur, vel)
            if db>=2:  # expression swell on held notes
                steps=int(db*4)
                for s in range(steps+1):
                    cc(0, t+int(s/steps*(dur-12)), 11, min(127,int(75+40*math.sin(math.pi*s/steps))))
            t+=dur

cc(0,0,11,100)
build(0, octave=0, vbase=66)
build(8*4*beat, octave=0, vbase=82)   # repeat louder
# final held F chord
end=16*4*beat
n(0,end,77,beat*4,90)
for note in [41,53,57,60,65]: n(1,end,note,beat*4,70)

ev.sort(key=lambda e:(e[0], 0 if e[1]=='off' else (1 if e[1]=='cc' else 2)))
prev=0
for t,typ,ch,a,b in ev:
    dt=t-prev; prev=t
    if typ=='on': tr.append(mido.Message('note_on',note=a,velocity=b,time=dt,channel=ch))
    elif typ=='off': tr.append(mido.Message('note_off',note=a,velocity=0,time=dt,channel=ch))
    else: tr.append(mido.Message('control_change',control=a,value=b,time=dt,channel=ch))
out=r"C:\horatad-media\clips\Violin+Piano duet test.mid"
mid.save(out)
print(f"saved {out}  length={mid.length:.1f}s")
