import sys, time, ctypes, mido
from ctypes import wintypes

MID = sys.argv[1] if len(sys.argv) > 1 else r"C:\horatad-media\clips\Hora Staccato - violin+piano (expressive).mid"
winmm = ctypes.WinDLL('winmm')

class CAPS(ctypes.Structure):
    _fields_ = [("wMid",wintypes.WORD),("wPid",wintypes.WORD),("vDriverVersion",wintypes.UINT),
                ("szPname",wintypes.WCHAR*32),("wTechnology",wintypes.WORD),("wVoices",wintypes.WORD),
                ("wNotes",wintypes.WORD),("wChannelMask",wintypes.WORD),("dwSupport",wintypes.DWORD)]

n = winmm.midiOutGetNumDevs()
dev = None
for i in range(n):
    c = CAPS()
    winmm.midiOutGetDevCapsW(i, ctypes.byref(c), ctypes.sizeof(c))
    print(f"  [{i}] {c.szPname}")
    if 'VirtualMIDISynth' in c.szPname and dev is None:
        dev = i
if dev is None:
    print("VirtualMIDISynth device NOT FOUND"); sys.exit(1)
print(f">>> playing via device [{dev}] VirtualMIDISynth ...", flush=True)

h = wintypes.HANDLE()
rc = winmm.midiOutOpen(ctypes.byref(h), dev, 0, 0, 0)
if rc != 0:
    print(f"midiOutOpen failed rc={rc}"); sys.exit(1)

try:
    for msg in mido.MidiFile(MID):
        if msg.time:
            time.sleep(msg.time)
        if msg.is_meta:
            continue
        b = msg.bytes()
        while len(b) < 3: b.append(0)
        dword = b[0] | (b[1] << 8) | (b[2] << 16)
        winmm.midiOutShortMsg(h, dword)
    print(">>> done")
finally:
    time.sleep(0.5)
    winmm.midiOutReset(h)
    winmm.midiOutClose(h)
