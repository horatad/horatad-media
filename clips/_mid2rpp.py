#!/usr/bin/env python
# Convert a standard MIDI file into a REAPER project (.rpp) based on a template
# that already has BBCSO=Piano on track 1. Timing/rubato is preserved by baking
# each event's absolute SECONDS into ticks at a fixed 120 BPM / 480 PPQ (IGNTEMPO 1).
import sys, struct, re

def read_vlq(d, i):
    v = 0
    while True:
        b = d[i]; i += 1; v = (v << 7) | (b & 0x7f)
        if not b & 0x80: break
    return v, i

def parse_midi(path):
    d = open(path, 'rb').read()
    assert d[:4] == b'MThd', "not a MIDI file"
    fmt, ntrk, div = struct.unpack('>HHH', d[8:14])
    i = 14
    chan_events = []   # (abs_tick, bytes)
    tempos = []        # (abs_tick, usec_per_qn)
    while i < len(d) and d[i:i+4] == b'MTrk':
        ln = struct.unpack('>I', d[i+4:i+8])[0]; i += 8; end = i + ln
        t = 0; st = 0
        while i < end:
            dt, i = read_vlq(d, i); t += dt
            b = d[i]
            if b & 0x80: st = b; i += 1
            else: b = st
            if b == 0xff:
                mt = d[i]; i += 1; ml, i = read_vlq(d, i); data = d[i:i+ml]; i += ml
                if mt == 0x51 and ml == 3:
                    tempos.append((t, (data[0] << 16) | (data[1] << 8) | data[2]))
            elif b in (0xf0, 0xf7):
                ml, i = read_vlq(d, i); i += ml
            else:
                ev = b & 0xf0
                if ev in (0xc0, 0xd0):
                    p1 = d[i]; i += 1
                    if ev == 0xd0:  # channel aftertouch - keep
                        chan_events.append((t, bytes([b, p1])))
                    # program change (c0) skipped (plugin ignores)
                else:  # 8x 9x ax bx ex : 3-byte
                    p1 = d[i]; p2 = d[i+1]; i += 2
                    chan_events.append((t, bytes([b, p1, p2])))
        i = end
    if not tempos: tempos = [(0, 500000)]
    tempos.sort()
    return div, chan_events, tempos

def tick_to_sec_fn(div, tempos):
    # build cumulative seconds at each tempo change
    pts = []  # (tick, sec, usec_per_qn)
    sec = 0.0; last_tick = 0; last_us = tempos[0][1]
    for tk, us in tempos:
        sec += (tk - last_tick) / div * (last_us / 1e6)
        pts.append((tk, sec, us)); last_tick = tk; last_us = us
    def f(tick):
        # find last pt with tick <= tick
        base_tick, base_sec, us = pts[0]
        for ptk, psec, pus in pts:
            if ptk <= tick: base_tick, base_sec, us = ptk, psec, pus
            else: break
        return base_sec + (tick - base_tick) / div * (us / 1e6)
    return f

def main():
    midi, template, out_rpp, out_wav = sys.argv[1:5]
    div, evs, tempos = parse_midi(midi)
    t2s = tick_to_sec_fn(div, tempos)
    # REAPER fixed grid: 120bpm, 480ppq -> 960 ticks/sec
    TPS = 960.0
    baked = []
    for tk, by in evs:
        rt = int(round(t2s(tk) * TPS))
        baked.append((rt, by))
    baked.sort(key=lambda x: x[0])
    total_sec = (max(t2s(tk) for tk, _ in evs) + 1.0) if evs else 2.0
    # build E lines
    lines = ["        HASDATA 1 480 QN", "        CCINTERP 32", "        IGNTEMPO 1 120 4 4"]
    prev = 0
    for rt, by in baked:
        delta = rt - prev; prev = rt
        hexs = " ".join("%02x" % b for b in by)
        lines.append("        E %d %s" % (delta, hexs))
    # all-notes-off tail
    lines.append("        E %d b0 7b 00" % int(round(2 * TPS)))
    src_block = "\n".join(lines)

    txt = open(template, encoding='utf-8', errors='ignore').read().split("\n")
    out = []
    i = 0; item_len = total_sec + 3.0
    while i < len(txt):
        ln = txt[i]
        if ln.strip().startswith("LENGTH ") and "<" not in ln:
            out.append(re.sub(r"LENGTH [0-9.]+", "LENGTH %.6f" % item_len, ln)); i += 1; continue
        if ln.strip().startswith("RENDER_FILE"):
            out.append('  RENDER_FILE "%s"' % out_wav); i += 1; continue
        if "<SOURCE MIDI" in ln:
            out.append(ln)               # keep "<SOURCE MIDI"
            j = i + 1
            # skip until the closing ">" of this source
            while j < len(txt) and txt[j].strip() != ">":
                j += 1
            out.append(src_block)
            out.append(txt[j])           # the ">"
            i = j + 1; continue
        out.append(ln); i += 1
    open(out_rpp, "w", encoding='utf-8').write("\n".join(out))
    print("OK events=%d dur=%.1fs -> %s" % (len(baked), total_sec, out_rpp))

main()
