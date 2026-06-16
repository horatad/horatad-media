# _gen_media_index.py — สร้างดัชนี index.html ให้ทุกโฟลเดอร์ใน media-sources\
# รัน: python _gen_media_index.py   (regenerate ใหม่เมื่อไฟล์เปลี่ยน)
import os, html

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "media-sources")

def human(n):
    n = float(n)
    for u in ["B", "KB", "MB", "GB"]:
        if n < 1024:
            return (f"{n:.0f} {u}" if u == "B" else f"{n:.1f} {u}")
        n /= 1024
    return f"{n:.1f} TB"

CSS = """body{font-family:'Segoe UI','Leelawadee UI',Tahoma,sans-serif;max-width:920px;margin:24px auto;padding:0 16px;color:#222}
h1{font-size:22px;margin-bottom:4px} .sub{color:#777;font-size:13px;margin-bottom:16px}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{border-bottom:1px solid #eee;padding:6px 10px;text-align:left}
th{background:#f6f6f6;position:sticky;top:0} td.r,th.r{text-align:right}
a{color:#0a58ca;text-decoration:none} a:hover{text-decoration:underline} tr:hover td{background:#fafafa}"""

def folder_index(path, name):
    files = sorted(f for f in os.listdir(path)
                   if os.path.isfile(os.path.join(path, f)) and f != "index.html")
    rows, total = "", 0
    for i, f in enumerate(files, 1):
        sz = os.path.getsize(os.path.join(path, f)); total += sz
        ext = (os.path.splitext(f)[1].lstrip(".") or "-").upper()
        rows += (f"<tr><td>{i}</td><td><a href='{html.escape(f)}'>{html.escape(f)}</a></td>"
                 f"<td>{ext}</td><td class=r>{human(sz)}</td></tr>\n")
    doc = f"""<!doctype html><html lang=th><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>ดัชนี — {html.escape(name)}</title><style>{CSS}</style></head><body>
<h1>📁 {html.escape(name)}</h1>
<div class=sub>media-sources / {html.escape(name)} · {len(files)} ไฟล์ · รวม {human(total)} · <a href='../index.html'>← ดัชนีรวม</a></div>
<table><thead><tr><th>#</th><th>ชื่อไฟล์</th><th>ชนิด</th><th class=r>ขนาด</th></tr></thead>
<tbody>{rows}</tbody></table></body></html>"""
    with open(os.path.join(path, "index.html"), "w", encoding="utf-8") as fp:
        fp.write(doc)
    return len(files), total

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
<div class=sub>{len(subs)} โฟลเดอร์ · {gfiles} ไฟล์ · รวม {human(gtotal)} · แยกจาก lab ทดสอบที่ clips\\</div>
<table><thead><tr><th>โฟลเดอร์</th><th class=r>ไฟล์</th><th class=r>ขนาด</th></tr></thead>
<tbody>{rrows}</tbody></table></body></html>"""
    with open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8") as fp:
        fp.write(root)
    print(f"เสร็จ — {len(subs)} โฟลเดอร์ · {gfiles} ไฟล์ · {human(gtotal)} · ดัชนีรวม media-sources/index.html")

if __name__ == "__main__":
    main()
