# _gen_media_index.py — สร้างดัชนี index.html ให้ทุกโฟลเดอร์ใน media-sources\
# รองรับโครงซ้อนหลายชั้น (เปียโน=แบน · กีตาร์=A-B/composer/...) · ลิสต์เฉพาะไฟล์ MIDI (.mid/.midi)
# รัน: python _gen_media_index.py   (regenerate ใหม่เมื่อไฟล์เปลี่ยน)
import os, html, urllib.parse, email, re, base64

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

def convert_mhtml(mhtml_path, folder):
    """แปลง .mhtml ต้นฉบับ → detail.html: ฝัง resource เป็น data-uri + แก้ลิงก์ .mid ชี้ไฟล์ local"""
    msg = email.message_from_bytes(open(mhtml_path, "rb").read())
    html_part, resources = None, {}
    for part in msg.walk():
        ct = part.get_content_type()
        if ct.startswith("multipart"):
            continue
        loc = part.get("Content-Location", "")
        if ct == "text/html" and html_part is None:
            html_part = part
        elif loc:
            resources[loc] = (ct, part.get_payload(decode=True))
    if html_part is None:
        return None
    doc = html_part.get_payload(decode=True).decode(html_part.get_content_charset() or "utf-8", "replace")
    for loc, (ct, data) in resources.items():
        if data is not None and loc in doc:
            doc = doc.replace(loc, f"data:{ct};base64," + base64.b64encode(data).decode())
    local = set(f for f in os.listdir(folder) if f.lower().endswith(MIDEXT))
    def repl(m):
        b = os.path.basename(m.group(1))
        return 'href="' + (urllib.parse.quote(b) if b in local else m.group(1)) + '"'
    doc = re.sub(r'href="([^"]*\.mid)"', repl, doc, flags=re.I)
    with open(os.path.join(folder, "detail.html"), "w", encoding="utf-8") as fp:
        fp.write(doc)
    return "detail.html"

def folder_index(path, name):
    items = list_midis(path)
    total = sum(s for _, s in items)
    # ถ้ามี .mhtml ต้นฉบับ → แปลงเป็น detail.html (รายละเอียดเพลงเต็ม + เล่นไฟล์ local) แล้วลิงก์ให้
    dlink = ""
    src = next((f for f in sorted(os.listdir(path)) if f.lower().endswith((".mhtml", ".mht"))), None)
    if src:
        try:
            convert_mhtml(os.path.join(path, src), path)
            dlink = " · <a href='detail.html'>📄 รายละเอียดเพลงเต็ม (เล่นไฟล์ local ได้)</a>"
        except Exception as e:
            dlink = f" · <a href='{urllib.parse.quote(src)}'>📄 รายละเอียดเพลงเต็ม (ต้นฉบับ)</a>"
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
<div class=sub>media-sources / {html.escape(name)} · <b id=cnt>{len(items)}</b> ไฟล์ MIDI · รวม {human(total)}{dlink} · <a href='../index.html'>← ดัชนีรวม</a></div>
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
