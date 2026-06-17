# _gen_media_index.py — ดัชนี media-sources\ แบบหมวด (taxonomy):
#   media-sources/index.html (hub) → piano-classical/index.html (hub ย่อย) → <composer>/detail.html
#                                   → guitar/detail.html
#   เปียโน composer : แปลง .mhtml → detail.html (รายละเอียดเต็ม + ลิงก์เล่น local)
#   Media/others    : อ่าน meta MIDI → ชื่อเพลง/นักประพันธ์/tempo
#   guitar          : ชื่อเพลงจากชื่อไฟล์ + นักประพันธ์จากโฟลเดอร์ + ค้นหา
# รัน: python _gen_media_index.py
import os, html, urllib.parse, email, re, base64
try:
    import mido
except ImportError:
    mido = None

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "media-sources")
MIDEXT = (".mid", ".midi")
META_MAX = 60
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

def is_category(folder):
    """หมวด = มี subfolder ที่บรรจุ .mid โดยตรง (เช่น piano-classical/mozart) · กีตาร์(A-B/composer/) ไม่ใช่
    ข้ามโฟลเดอร์ที่ขึ้นต้น _ (เช่น _downloaded, _pages — เป็นของระบบ ไม่ใช่ composer)"""
    for sub in os.listdir(folder):
        if sub.startswith("_"):
            continue
        sp = os.path.join(folder, sub)
        if os.path.isdir(sp) and any(f.lower().endswith(MIDEXT) for f in os.listdir(sp)):
            return True
    return False

# ---------- เปียโน composer: .mhtml → detail.html ----------
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
    bar = "<div style='font-family:sans-serif;background:#eef3fb;padding:8px 12px;font-size:13px'><a href='../index.html'>← กลับ</a></div>"
    doc = re.sub(r"(<body[^>]*>)", r"\1" + bar, doc, count=1, flags=re.I) if re.search(r"<body", doc, re.I) else bar + doc
    with open(os.path.join(folder, "detail.html"), "w", encoding="utf-8") as fp:
        fp.write(doc)

# ---------- meta MIDI + ชื่อไฟล์ + โฟลเดอร์ → detail.html ----------
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
                composer = tx[0]; extra = " · ".join(tx[1:3])
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
    src = "อ่านชื่อเพลงจาก meta ในไฟล์ MIDI" if read_meta else "ชื่อเพลงจากชื่อไฟล์ + นักประพันธ์จากโฟลเดอร์ (คลังใหญ่ · meta ไม่มีชื่อเพลง)"
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
<div class=sub><b id=cnt>{len(items)}</b> ไฟล์ MIDI · รวม {human(total)} · <a href='../index.html'>← กลับ</a></div>
<div class=bar>ℹ️ {src}</div>
<input id=q placeholder="🔍 ค้นหาชื่อเพลง / นักประพันธ์ / โฟลเดอร์...">
<table><thead><tr><th>#</th><th>ชื่อเพลง</th><th>นักประพันธ์</th><th class=r>ขนาด</th></tr></thead>
<tbody>{rows}</tbody></table>{SEARCH_JS}</body></html>"""
    with open(os.path.join(folder, "detail.html"), "w", encoding="utf-8") as fp:
        fp.write(doc)

# ---------- guitar: แปลงหน้า index ที่ save (_pages/*.mhtml) → .html + แก้ลิงก์ local / มาร์ก ⬇️ ----------
GUITAR_ANCHOR = re.compile(r'<a\b([^>]*?)href="([^"]*\.mid)"([^>]*?)>(.*?)</a>', re.I | re.S)

def _guitar_localmap(folder, pages_dir):
    m = {}
    for dp, dn, fn in os.walk(folder):
        if "_pages" in dp.replace("\\", "/").split("/"):
            continue
        for f in fn:
            if f.lower().endswith(MIDEXT):
                m[f] = urllib.parse.quote(os.path.relpath(os.path.join(dp, f), pages_dir).replace("\\", "/"), safe="/")
    return m

def _convert_page(mhtml_path, out_html, localmap, miss_urls):
    msg = email.message_from_bytes(open(mhtml_path, "rb").read())
    hp, res = None, {}
    for part in msg.walk():
        ct = part.get_content_type()
        if ct.startswith("multipart"):
            continue
        loc = part.get("Content-Location", "")
        if ct == "text/html" and hp is None:
            hp = part
        elif loc:
            res[loc] = (ct, part.get_payload(decode=True))
    if hp is None:
        return 0, 0
    doc = hp.get_payload(decode=True).decode(hp.get_content_charset() or "utf-8", "replace")
    for loc, (ct, data) in res.items():
        if data and loc in doc:
            doc = doc.replace(loc, f"data:{ct};base64," + base64.b64encode(data).decode())
    c = [0, 0]
    def repl(m):
        pre, url, post, text = m.groups(); b = os.path.basename(url)
        if b in localmap:
            c[0] += 1; return f'<a{pre}href="{localmap[b]}"{post}>{text}</a>'
        c[1] += 1; miss_urls[b] = url
        return f'<a{pre}href="{url}"{post} style="color:#c33" title="ยังไม่มีในเครื่อง">{text} ⬇️</a>'
    doc = GUITAR_ANCHOR.sub(repl, doc)
    bar = "<div style='font-family:sans-serif;background:#eef3fb;padding:8px 12px;font-size:13px'><a href='../index.html'>← กลับ</a> · 🔴⬇️ = ยังไม่มีในเครื่อง (คลิกโหลดจากเว็บ)</div>"
    doc = re.sub(r"(<body[^>]*>)", r"\1" + bar, doc, count=1, flags=re.I) if re.search(r"<body", doc, re.I) else bar + doc
    open(out_html, "w", encoding="utf-8").write(doc)
    return c[0], c[1]

def guitar_hub(folder, name, items):
    pages_dir = os.path.join(folder, "_pages")
    localmap = _guitar_localmap(folder, pages_dir)
    miss_urls, rows = {}, ""
    for mh in sorted(f for f in os.listdir(pages_dir) if f.lower().endswith((".mhtml", ".mht"))):
        nm = os.path.splitext(mh)[0]
        ok, miss = _convert_page(os.path.join(pages_dir, mh), os.path.join(pages_dir, nm + ".html"), localmap, miss_urls)
        disp = nm.replace("Classical Guitar Midi Archives - ", "").replace("Classical Guitar Midi Archives", "หน้าหลัก")
        badge = f"<span style='color:#c33'>⬇️ {miss}</span>" if miss else "<span style='color:#2a2'>ครบ</span>"
        rows += (f"<tr><td><a href='_pages/{urllib.parse.quote(nm + '.html')}'>📄 {html.escape(disp)}</a></td>"
                 f"<td class=r>{ok}</td><td class=r>{badge}</td></tr>\n")
    with open(os.path.join(pages_dir, "_download_list.txt"), "w", encoding="utf-8") as f:
        for b, u in sorted(miss_urls.items()):
            f.write(u + "\n")
    meta_detail(folder, name, items)   # รายการไฟล์ทั้งหมดในเครื่อง (ค้นหาได้)
    total = sum(s for _, s in items)
    doc = f"""<!doctype html><html lang=th><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>{html.escape(name)} — ดัชนี</title><style>{CSS}</style></head><body>
<h1>🎸 {html.escape(name)} — Classical Guitar Midi Archives</h1>
<div class=sub>{len(items)} ไฟล์ในเครื่อง · <a href='../index.html'>← ดัชนีรวม</a></div>
<div class=bar>🔴 <b>⬇️ N</b> = เพลงในหน้านั้นที่ยังไม่มีไฟล์ในเครื่อง (เปิดหน้าแล้วคลิก ⬇️ โหลดจากเว็บ) · รายการ URL: <code>_pages/_download_list.txt</code> ({len(miss_urls)} ไฟล์)</div>
<table><thead><tr><th>หน้า</th><th class=r>มีในเครื่อง</th><th class=r>ต้องโหลด</th></tr></thead>
<tbody>{rows}</tbody></table>
<p style='font-size:13px;color:#777'>📋 <a href='detail.html'>รายการไฟล์ทั้งหมดในเครื่อง (ค้นหาได้)</a></p></body></html>"""
    with open(os.path.join(folder, "index.html"), "w", encoding="utf-8") as fp:
        fp.write(doc)
    return len(items), total, len(miss_urls)

# ---------- recursive: คืน (entry_html, nfiles, total, kind) ----------
def process(folder, name, is_root=False):
    for stale in ("index.html", "detail.html"):
        p = os.path.join(folder, stale)
        if os.path.exists(p):
            os.remove(p)
    # กีตาร์: ถ้ามี _pages/*.mhtml → ทำ guitar_hub เสมอ (ก่อนเช็ค category · กัน _downloaded ทำให้เพี้ยน)
    pages = os.path.join(folder, "_pages")
    if not is_root and os.path.isdir(pages) and any(f.lower().endswith((".mhtml", ".mht")) for f in os.listdir(pages)):
        items = list_midis(folder)
        total = sum(s for _, s in items)
        nf, tot, nmiss = guitar_hub(folder, name, items)
        return "index.html", nf, tot, f"🎸 หน้าเว็บต้นฉบับ · ⬇️ {nmiss}"
    if not is_root and not is_category(folder):
        items = list_midis(folder)
        total = sum(s for _, s in items)
        src = next((f for f in sorted(os.listdir(folder)) if f.lower().endswith((".mhtml", ".mht"))), None)
        if src:
            try:
                convert_mhtml(os.path.join(folder, src), folder); kind = "🎼 ต้นฉบับเว็บ"
            except Exception:
                meta_detail(folder, name, items); kind = "meta/ชื่อไฟล์"
        else:
            meta_detail(folder, name, items)
            kind = "meta MIDI" if len(items) <= META_MAX else "ชื่อไฟล์/โฟลเดอร์"
        return "detail.html", len(items), total, kind
    # หมวด (category) หรือ root → ทำ hub
    children = sorted(d for d in os.listdir(folder) if os.path.isdir(os.path.join(folder, d)))
    rows, cf, ct = "", 0, 0
    for c in children:
        entry, n, tot, kind = process(os.path.join(folder, c), c)
        cf += n; ct += tot
        rows += (f"<tr><td><a href='{urllib.parse.quote(c)}/{entry}'>📁 {html.escape(c)}</a></td>"
                 f"<td class=ex>{kind}</td><td class=r>{n}</td><td class=r>{human(tot)}</td></tr>\n")
    if is_root:
        title = "🎼 media-sources — คลัง MIDI อ้างอิง"
        sub = f"{len(children)} หมวด · {cf} ไฟล์ MIDI · รวม {human(ct)} · คลิกเข้าดูรายละเอียดเพลง + เล่นไฟล์ local"
    else:
        title = f"📂 {html.escape(name)}"
        sub = f"{len(children)} โฟลเดอร์ · {cf} ไฟล์ MIDI · รวม {human(ct)} · <a href='../index.html'>← กลับ</a>"
    doc = f"""<!doctype html><html lang=th><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>{html.escape(name)} — ดัชนี</title><style>{CSS}</style></head><body>
<h1>{title}</h1><div class=sub>{sub}</div>
<table><thead><tr><th>โฟลเดอร์</th><th>ที่มาข้อมูล</th><th class=r>ไฟล์</th><th class=r>ขนาด</th></tr></thead>
<tbody>{rows}</tbody></table></body></html>"""
    with open(os.path.join(folder, "index.html"), "w", encoding="utf-8") as fp:
        fp.write(doc)
    return "index.html", cf, ct, ("หมวด" if not is_root else "")

def main():
    _, files, total, _ = process(ROOT, "media-sources", is_root=True)
    print(f"เสร็จ — {files} ไฟล์ MIDI · {human(total)} · ดัชนี hub + detail.html ครบทุกชั้น")

if __name__ == "__main__":
    main()
