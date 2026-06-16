# _gen_media_index.py — สร้างดัชนี index.html ให้ทุกโฟลเดอร์ใน media-sources\
# รองรับโครงซ้อนหลายชั้น (เปียโน=แบน · กีตาร์=A-B/composer/...) · ลิสต์เฉพาะไฟล์ MIDI (.mid/.midi)
# รัน: python _gen_media_index.py   (regenerate ใหม่เมื่อไฟล์เปลี่ยน)
import os, html

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "media-sources")
MIDEXT = (".mid", ".midi")

def human(n):
    n = float(n)
    for u in ["B", "KB", "MB", "GB"]:
        if n < 1024:
            return (f"{n:.0f} {u}" if u == "B" else f"{n:.1f} {u}")
        n /= 1024
    return f"{n:.1f} TB"

CSS = """body{font-family:'Segoe UI','Leelawadee UI',Tahoma,sans-serif;max-width:1000px;margin:24px auto;padding:0 16px;color:#222}
h1{font-size:22px;margin-bottom:4px} .sub{color:#777;font-size:13px;margin-bottom:16px}
input{width:100%;padding:8px 10px;margin-bottom:12px;border:1px solid #ccc;border-radius:6px;font-size:14px}
table{border-collapse:collapse;width:100%;font-size:13px}
th,td{border-bottom:1px solid #eee;padding:5px 9px;text-align:left;vertical-align:top}
th{background:#f6f6f6;position:sticky;top:0} td.r,th.r{text-align:right;white-space:nowrap}
a{color:#0a58ca;text-decoration:none} a:hover{text-decoration:underline} tr:hover td{background:#fafafa}
.dir{color:#999}"""

# js ค้นหาง่ายๆ (filter แถวตาม path)
SEARCH_JS = """<script>
const q=document.getElementById('q'),rows=[...document.querySelectorAll('tbody tr')];
q&&q.addEventListener('input',()=>{const v=q.value.toLowerCase();let n=0;
rows.forEach(r=>{const m=r.dataset.k.includes(v);r.style.display=m?'':'none';if(m)n++;});
document.getElementById('cnt').textContent=n;});
</script>"""

def list_midis(base):
    """คืน list ของ (relpath, size) ของไฟล์ MIDI ทุกชั้นใต้ base"""
    out = []
    for dp, dn, fn in os.walk(base):
        for f in fn:
            if f.lower().endswith(MIDEXT):
                full = os.path.join(dp, f)
                rel = os.path.relpath(full, base).replace("\\", "/")
                out.append((rel, os.path.getsize(full)))
    out.sort(key=lambda x: x[0].lower())
    return out

def folder_index(path, name):
    items = list_midis(path)
    total = sum(s for _, s in items)
    rows = ""
    for i, (rel, sz) in enumerate(items, 1):
        d, b = (rel.rsplit("/", 1) + [""])[:2] if "/" in rel else ("", rel)
        loc = f"<span class=dir>{html.escape(d)}/</span>" if d else ""
        rows += (f"<tr data-k=\"{html.escape(rel.lower())}\"><td>{i}</td>"
                 f"<td>{loc}<a href='{html.escape(rel)}'>{html.escape(b)}</a></td>"
                 f"<td class=r>{human(sz)}</td></tr>\n")
    doc = f"""<!doctype html><html lang=th><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>ดัชนี — {html.escape(name)}</title><style>{CSS}</style></head><body>
<h1>📁 {html.escape(name)}</h1>
<div class=sub>media-sources / {html.escape(name)} · <b id=cnt>{len(items)}</b> ไฟล์ MIDI · รวม {human(total)} · <a href='../index.html'>← ดัชนีรวม</a></div>
<input id=q placeholder="🔍 ค้นหาชื่อไฟล์ / โฟลเดอร์...">
<table><thead><tr><th>#</th><th>ไฟล์ (โฟลเดอร์/ชื่อ)</th><th class=r>ขนาด</th></tr></thead>
<tbody>{rows}</tbody></table>{SEARCH_JS}</body></html>"""
    with open(os.path.join(path, "index.html"), "w", encoding="utf-8") as fp:
        fp.write(doc)
    return len(items), total

def main():
    subs = sorted(d for d in os.listdir(ROOT) if os.path.isdir(os.path.join(ROOT, d)))
    rrows, gfiles, gtotal = "", 0, 0
    for d in subs:
        n, tot = folder_index(os.path.join(ROOT, d), d)
        gfiles += n; gtotal += tot
        rrows += (f"<tr><td><a href='{html.escape(d)}/index.html'>📁 {html.escape(d)}</a></td>"
                  f"<td class=r>{n}</td><td class=r>{human(tot)}</td></tr>\n")
    root = f"""<!doctype html><html lang=th><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>media-sources — ดัชนีรวม</title><style>{CSS}</style></head><body>
<h1>🎼 media-sources — คลัง MIDI อ้างอิง (reference sources)</h1>
<div class=sub>{len(subs)} โฟลเดอร์ · {gfiles} ไฟล์ MIDI · รวม {human(gtotal)} · เก็บ local (เทสเร็ว) · master อนาคต→Drive</div>
<table><thead><tr><th>โฟลเดอร์</th><th class=r>ไฟล์ MIDI</th><th class=r>ขนาด</th></tr></thead>
<tbody>{rrows}</tbody></table></body></html>"""
    with open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8") as fp:
        fp.write(root)
    print(f"เสร็จ — {len(subs)} โฟลเดอร์ · {gfiles} ไฟล์ MIDI · {human(gtotal)}")

if __name__ == "__main__":
    main()
