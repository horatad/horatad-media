# _gen_media_index.py — สร้างดัชนี media-sources\ : root hub → detail.html ทุกโฟลเดอร์
#  เปียโน    : แปลง .mhtml ต้นฉบับ → detail.html (รายละเอียดเต็ม + ลิงก์เล่นไฟล์ local)
#  Media/others: อ่าน meta ในไฟล์ MIDI (track_name=ชื่อเพลง, text=นักประพันธ์/tempo)
#  กีตาร์    : ชื่อเพลงจากชื่อไฟล์ + นักประพันธ์จากโฟลเดอร์แม่ (meta ไม่มีชื่อเพลง)
# รัน: python _gen_media_index.py
import os, html, urllib.parse, email, re, base64
try:
    import mido
except ImportError:
    mido = None

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "media-sources")
MIDEXT = (".mid", ".midi")
META_MAX = 60   # โฟลเดอร์ไฟล์ <= นี้จึงอ่าน meta MIDI (กันช้ากับคลังกีตาร์ 1969 ไฟล์ที่ meta ไม่มีประโยชน์)
INSTR = {"grand piano", "piano", "guitar", "classic guitar", "classical guitar",
         "acoustic guitar", "nylon guitar", "melody", "bass", "harpsichord"}

def human(n):
    n = float(n)
    for u in ["B", "KB", "MB", "GB"]:
        if n < 1024:
            return (f"{n:.0f} {u}" if u == "B" else f"{n:.1f} {u}")
        n /= 1024
    return f"{n:.1f} TB"

CSS = """body{font-family:'Segoe UI','Leelawadee UI',Tahoma,sans-serif;max-width:1040px;margin:24px auto;padding:0 16px;color:#222}
h1{font-size:22px;margin-bottom:4px} .sub{color:#777;font-size:13px;margin-bottom:14px}
.bar{background:#eef3fb;border:1px solid #d6e3f5;border-radius:8px;padding:8px 12px;margin-bottom:14px;font-size:13px}
input{width:100%;padding:8px 10px;margin-bottom:12px;border:1px solid #ccc;border-radius:6px;font-size:14px}
table{border-collapse:collapse;width:100%;font-size:13px}
th,td{border-bottom:1px solid #eee;padding:5px 9px;text-align:left;vertical-align:top}
th{background:#f6f6f6;position:sticky;top:0} td.r,th.r{text-align:right;white-space:nowrap}
a{color:#0a58ca;text-decoration:none} a:hover{text-decoration:underline} tr:hover td{background:#fafafa}
.dir{color:#999;font-size:12px} .cmp{color:#555} .ex{color:#999;font-size:12px}"""

SEARCH_JS = """<script>
const q=document.getElementById('q'),rows=[...document.querySelectorAll('tbody tr')];
q&&q.addEventListener('input',()=>{const v=q.value.toLowerCase();let n=0;
rows.forEach(r=>{const m=r.dataset.k.includes(v);r.style.display=m?'':'none';if(m)n++;});
document.getElementById('cnt').textContent=n;});
</script>"""

def list_midis(base):
    out = []
    for dp, dn, fn in os.walk(base):
        for f in fn:
            if f.lower().endswith(MIDEXT):
                full = os.path.join(dp, f)
                rel = os.path.relpath(full, base).replace("\\", "/")
                out.append((rel, os.path.getsize(full)))
    out.sort(key=lambda x: x[0].lower())
    return out

# ---------- เปียโน: .mhtml → detail.html ----------
def convert_mhtml(mhtml_path, folder):
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
        raise ValueError("no html part")
    doc = html_part.get_payload(decode=True).decode(html_part.get_content_charset() or "utf-8", "replace")
    for loc, (ct, data) in resources.items():
        if data is not None and loc in doc:
            doc = doc.replace(loc, f"data:{ct};base64," + base64.b64encode(data).decode())
    local = set(f for f in os.listdir(folder) if f.lower().endswith(MIDEXT))
    def repl(m):
        b = os.path.basename(m.group(1))
        return 'href="' + (urllib.parse.quote(b) if b in local else m.group(1)) + '"'
    doc = re.sub(r'href="([^"]*\.mid)"', repl, doc, flags=re.I)
    bar = "<div style='font-family:sans-serif;background:#eef3fb;padding:8px 12px;font-size:13px'><a href='../index.html'>← ดัชนีรวม media-sources</a></div>"
    doc = re.sub(r"(<body[^>]*>)", r"\1" + bar, doc, count=1, flags=re.I) if re.search(r"<body", doc, re.I) else bar + doc
    with open(os.path.join(folder, "detail.html"), "w", encoding="utf-8") as fp:
        fp.write(doc)

# ---------- Media/others/กีตาร์: meta MIDI + ชื่อไฟล์ + โฟลเดอร์ → detail.html ----------
def derive(folder, rel, read_meta):
    title = composer = extra = ""
    if read_meta and mido:
        try:
            mid = mido.MidiFile(os.path.join(folder, rel), clip=True)
            tn, tx = [], []
            for tr in mid.tracks:
                for m in tr:
                    if not getattr(m, "is_meta", False):
                        continue
                    if m.type == "track_name":
                        s = (getattr(m, "name", "") or "").strip()
                        if s and s.lower() not in INSTR and not s.lower().startswith("track"):
                            tn.append(s)
                    elif m.type == "text":
                        t = (getattr(m, "text", "") or "").strip()
                        if t:
                            tx.append(t)
            if tn:
                title = tn[0]
            if tx:
                composer = tx[0]
                extra = " · ".join(tx[1:3])
        except Exception:
            pass
    parts = rel.replace("\\", "/").split("/")
    base = os.path.splitext(parts[-1])[0]
    if not composer and len(parts) >= 2:
        composer = parts[-2]
    if not title:
        title = base.replace("_", " ").strip()
        if composer and title.lower().startswith(composer.lower()):
            title = title[len(composer):].lstrip(" _-").strip() or title
    return html.escape(title), html.escape(composer), html.escape(extra)

def meta_detail(folder, name, items):
    read_meta = len(items) <= META_MAX
    src = "อ่านชื่อเพลงจาก meta ในไฟล์ MIDI" if read_meta else "ชื่อเพลงจากชื่อไฟล์ + นักประพันธ์จากโฟลเดอร์ (meta ไม่มีชื่อเพลง)"
    rows = ""
    for i, (rel, sz) in enumerate(items, 1):
        title, comp, extra = derive(folder, rel, read_meta)
        d = rel.rsplit("/", 1)[0] if "/" in rel else ""
        loc = f"<div class=dir>{html.escape(d)}/</div>" if d else ""
        ex = f"<div class=ex>{extra}</div>" if extra else ""
        key = f"{title} {comp} {rel}".lower()
        rows += (f"<tr data-k=\"{html.escape(key)}\"><td>{i}</td>"
                 f"<td><a href='{urllib.parse.quote(rel)}'>{title or html.escape(os.path.basename(rel))}</a>{ex}{loc}</td>"
                 f"<td class=cmp>{comp}</td><td class=r>{human(sz)}</td></tr>\n")
    total = sum(s for _, s in items)
    doc = f"""<!doctype html><html lang=th><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>{html.escape(name)} — รายละเอียด</title><style>{CSS}</style></head><body>
<h1>📁 {html.escape(name)}</h1>
<div class=sub><b id=cnt>{len(items)}</b> ไฟล์ MIDI · รวม {human(total)} · <a href='../index.html'>← ดัชนีรวม</a></div>
<div class=bar>ℹ️ {src}</div>
<input id=q placeholder="🔍 ค้นหาชื่อเพลง / นักประพันธ์ / โฟลเดอร์...">
<table><thead><tr><th>#</th><th>ชื่อเพลง</th><th>นักประพันธ์</th><th class=r>ขนาด</th></tr></thead>
<tbody>{rows}</tbody></table>{SEARCH_JS}</body></html>"""
    with open(os.path.join(folder, "detail.html"), "w", encoding="utf-8") as fp:
        fp.write(doc)

def main():
    subs = sorted(d for d in os.listdir(ROOT) if os.path.isdir(os.path.join(ROOT, d)))
    rrows, gfiles, gtotal = "", 0, 0
    for d in subs:
        path = os.path.join(ROOT, d)
        items = list_midis(path)
        n = len(items); tot = sum(s for _, s in items)
        gfiles += n; gtotal += tot
        # ลบ index.html เดิมของโฟลเดอร์ (เลิกใช้ · ใช้ detail.html แทน)
        old = os.path.join(path, "index.html")
        if os.path.exists(old):
            os.remove(old)
        # สร้าง detail.html
        src = next((f for f in sorted(os.listdir(path)) if f.lower().endswith((".mhtml", ".mht"))), None)
        kind = ""
        if src:
            try:
                convert_mhtml(os.path.join(path, src), path); kind = "🎼 ต้นฉบับเว็บ"
            except Exception:
                meta_detail(path, d, items); kind = "meta/ชื่อไฟล์"
        else:
            meta_detail(path, d, items); kind = "meta/ชื่อไฟล์"
        rrows += (f"<tr><td><a href='{html.escape(d)}/detail.html'>📁 {html.escape(d)}</a></td>"
                  f"<td class=ex>{kind}</td><td class=r>{n}</td><td class=r>{human(tot)}</td></tr>\n")
    root = f"""<!doctype html><html lang=th><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>media-sources — ดัชนีรวม</title><style>{CSS}</style></head><body>
<h1>🎼 media-sources — คลัง MIDI อ้างอิง</h1>
<div class=sub>{len(subs)} โฟลเดอร์ · {gfiles} ไฟล์ MIDI · รวม {human(gtotal)} · คลิกโฟลเดอร์ดูรายละเอียดเพลง + เล่นไฟล์ local</div>
<table><thead><tr><th>โฟลเดอร์</th><th>ที่มาข้อมูล</th><th class=r>ไฟล์</th><th class=r>ขนาด</th></tr></thead>
<tbody>{rrows}</tbody></table></body></html>"""
    with open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8") as fp:
        fp.write(root)
    print(f"เสร็จ — {len(subs)} โฟลเดอร์ · {gfiles} ไฟล์ MIDI · {human(gtotal)} · detail.html ครบทุกโฟลเดอร์")

if __name__ == "__main__":
    main()
