import math, mido

TPB = 480
beat = TPB
bar = 4 * beat
mid = mido.MidiFile(ticks_per_beat=TPB)
tr = mido.MidiTrack(); mid.tracks.append(tr)
tr.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(68), time=0))
tr.append(mido.Message('program_change', program=0, channel=0, time=0))  # Acoustic Grand Piano

# progression: (bass, [triad low->high], melody[half@beat1, quarter@beat3])
prog = [
  (36, [60,64,67], [76,72]),  # C
  (43, [55,59,62], [74,71]),  # G
  (45, [57,60,64], [72,69]),  # Am
  (41, [53,57,60], [69,65]),  # F
]
CYCLES = 3
events = []  # (abs_tick, type, note, vel)  type: 'on'/'off'/'cc'
def note(t, n, dur, v):
    events.append((t,'on',n,v)); events.append((t+dur,'off',n,0))
def cc(t, ctrl, val):
    events.append((t,'cc',ctrl,val))

for c in range(CYCLES):
    for p in range(4):
        i = c*4 + p
        bs = i*bar
        phase = i/(CYCLES*4-1)
        vacc = int(50 + 26*math.sin(math.pi*phase))     # accompaniment dynamic swell
        vmel = min(112, vacc+20)
        root,triad,mel = prog[p]
        # sustain pedal: lift+repress at each chord change (clean resonance)
        cc(bs, 64, 0); cc(bs+8, 64, 127)
        # bass root (whole note)
        note(bs, root, bar-20, min(110, vacc+8))
        # LH arpeggio, 8 eighth notes
        pat = [0,1,2,1,0,1,2,1]
        for k,idx in enumerate(pat):
            note(bs + k*(beat//2), triad[idx], beat//2 - 10, vacc + (6 if k==0 else 0))
        # RH melody: half note @beat1, quarter @beat3
        note(bs, mel[0], beat*2-20, vmel)
        note(bs+beat*2, mel[1], beat-20, vmel-4)
# final resolve chord (C major), held
end = CYCLES*4*bar
cc(end,64,0); cc(end+8,64,127)
for n,v in [(36,70),(48,64),(60,66),(64,66),(67,68),(72,74)]:
    note(end, n, bar*2, v)
cc(end+bar*2, 64, 0)

# build track from sorted absolute events
events.sort(key=lambda e:(e[0], 0 if e[1]=='off' else 1))
prev=0
for t,typ,a,b in events:
    dt=t-prev; prev=t
    if typ=='on':  tr.append(mido.Message('note_on', note=a, velocity=b, time=dt, channel=0))
    elif typ=='off': tr.append(mido.Message('note_off', note=a, velocity=0, time=dt, channel=0))
    else: tr.append(mido.Message('control_change', control=a, value=b, time=dt, channel=0))

out = r"C:\horatad-media\clips\Piano test.mid"
mid.save(out)
print(f"saved {out}  length={mid.length:.1f}s  events={len(events)}")
