import sys, music21
from music21 import bar, repeat
sys.stdout.reconfigure(encoding='utf-8')
inp, outp = sys.argv[1], sys.argv[2]
s = music21.converter.parse(inp)
# strip repeat structures that break MIDI export (play straight through)
removed = 0
for el in list(s.recurse().getElementsByClass((bar.Repeat, repeat.RepeatExpression, repeat.RepeatMark))):
    site = el.activeSite
    try:
        if site is not None:
            site.remove(el); removed += 1
    except Exception:
        pass
print('removed repeat marks:', removed)
try:
    s.write('midi', fp=outp)
    print('wrote', outp, '| notes:', len(s.flatten().notes))
except Exception as e:
    # fallback: flatten to a single part of notes only
    print('retry flatten:', e)
    flat = music21.stream.Score()
    p = music21.stream.Part()
    for n in s.flatten().notesAndRests:
        p.append(n)
    flat.append(p)
    flat.write('midi', fp=outp)
    print('wrote (flattened)', outp, '| notes:', len(flat.flatten().notes))
