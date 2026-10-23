"""Rebuild photo-note typography as SVG, retaining original photo pixels and layout."""
from pathlib import Path
from base64 import b64encode
from html import escape
import json
from PIL import Image
root=Path(__file__).resolve().parents[1]
folder=root/'assets/work-in-pictures'
notes=[
('01','09',650,'AT HOME',['My workstation','at home'],['An earlier multi-monitor setup.']),
('02','10',600,'EARLIER SETUPS',['My older','computer desks'],['Two photographs from the archive.']),
('03','11',470,'MY RETRO HARDWARE',['IBM Selectric','& vintage computing'],['Pieces from my own collection.']),
('04','12',650,'HÔPITAL DU VALAIS',['Hospital','infrastructure'],['The server rack, front and back.']),
('06','13',550,'WORKING FROM HOME',['My home office','during COVID'],['Built around an ultrawide monitor.']),
('07','14',185,'GENEVA TO SAINT-TROPEZ',['Trading','on holiday'],['It would not fit','in the helicopter.','So I drove the kit','from Geneva to','Saint-Tropez.']),
('08','15',650,'HÔPITAL DU VALAIS',['At my IT desk','in the hospital'],['A photograph from my time at Hôpital du Valais.']),
('09','16',490,'HÔPITAL DU VALAIS',['A week immersed','in cardiology'],['Understanding','hospital teams','beyond IT.']),
('10','17',460,'LIVING IN JAPAN / 2003–2005',['Shinjuku, Tokyo'],['From my time living in Japan.']),
('11','18',650,'ERI',['At my desk','at ERI'],['An evening at the office.'])
]
font=b64encode((root/'assets/fonts/SelectricMono.otf').read_bytes()).decode()
metadata=[]
for page,num,cover,kicker,title,subtitle in notes:
    original=folder/f'page-{page}.webp'
    im=Image.open(original).convert('RGB'); w,h=im.size
    bg='#%02x%02x%02x'%im.getpixel((5,5)); dark=sum(im.getpixel((5,5)))<300
    ink='#efeee3' if dark else '#18251f'; muted='#aabbac' if dark else '#526158'
    raster=b64encode(original.read_bytes()).decode()
    parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title desc">',f'<title id="title">{escape(" ".join(title))}</title>',f'<desc id="desc">{escape(" ".join(subtitle))} Original photographs retained.</desc>',f'<style>@font-face{{font-family:Selectric;src:url(data:font/otf;base64,{font}) format("opentype")}}text{{font-family:Selectric,"Courier New",monospace}}</style>',f'<image width="1600" height="2000" href="data:image/webp;base64,{raster}"/>',f'<rect width="1600" height="{cover}" fill="{bg}"/>']
    narrow=page in ['07','09']
    if narrow: parts.append(f'<rect x="0" y="{cover}" width="710" height="{1830-cover}" fill="{bg}"/>')
    parts += [f'<rect y="1850" width="1600" height="150" fill="{bg}"/>',f'<text x="94" y="102" fill="{muted}" font-size="28">{escape(kicker)}</text>',f'<path d="M94 140H1506" stroke="{muted}" opacity=".35" stroke-width="2"/>']
    size=72 if narrow else 96
    start=260
    for i,line in enumerate(title): parts.append(f'<text x="94" y="{start+i*112}" fill="{ink}" font-size="{size}">{escape(line)}</text>')
    suby=(start+len(title)*112+55) if narrow else (start+(len(title)-1)*112+84)
    for i,line in enumerate(subtitle): parts.append(f'<text x="94" y="{suby+i*57}" fill="{muted}" font-size="{36 if narrow else 36}">{escape(line)}</text>')
    parts += [f'<text x="94" y="1898" fill="{muted}" font-size="27">MAXIME GRENU / PERSONAL ARCHIVE</text>',f'<text x="1506" y="1898" text-anchor="end" fill="{muted}" font-size="27">{num}</text>','</svg>']
    (folder/f'page-{page}.svg').write_text('\n'.join(parts),encoding='utf-8')
    metadata.append({'source':original.name,'visual':f'page-{page}.svg','archive_number':num,'title':' '.join(title),'subtitle':' '.join(subtitle)})
(folder/'photo-notes.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
