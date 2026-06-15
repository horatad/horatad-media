import sys, fitz
sys.stdout.reconfigure(encoding='utf-8')
d = fitz.open(r'C:\Users\user\OneDrive\Desktop\RoyalMarch.pdf')
print('pages:', d.page_count)
for i in [0,1]:
    print(f'\n=== page {i+1} text ===')
    print(d[i].get_text()[:600])
# render page 1 and a later page to PNG for viewing
for pno in [0, 1]:
    pix = d[pno].get_pixmap(dpi=120)
    out = rf'C:\horatad-media\clips\_rm_page{pno+1}.png'
    pix.save(out)
    print('saved', out, pix.width, 'x', pix.height)
