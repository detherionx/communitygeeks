"""Refresh locally hosted Google Fonts and their SIL licences."""
import pathlib, re, urllib.request

root = pathlib.Path(__file__).resolve().parents[1] / 'src/assets'
folder = root / 'fonts'
folder.mkdir(exist_ok=True)
url = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..400&family=Archivo:wght@400..700&family=IBM+Plex+Mono:wght@400;500&display=swap'
def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'})
    return urllib.request.urlopen(request, timeout=60).read()
css = fetch(url).decode()
assets = {}
def local(match):
    remote = match[1]
    if remote not in assets:
        name = f'font-{len(assets) + 1}' + pathlib.PurePosixPath(remote).suffix
        (folder / name).write_bytes(fetch(remote))
        assets[remote] = name
    return 'url(/assets/fonts/' + assets[remote] + ')'
css = re.sub(r'url\((https://fonts.gstatic.com/[^)]+)\)', local, css)
(root / 'css/fonts.css').write_text('/* Official Google Fonts, locally served. See assets/fonts/*-OFL.txt. */\n' + css, encoding='utf-8')
for family in ['fraunces', 'archivo', 'ibmplexmono']:
    (folder / f'{family}-OFL.txt').write_bytes(fetch(f'https://raw.githubusercontent.com/google/fonts/main/ofl/{family}/OFL.txt'))
(folder / 'sources.txt').write_text(url + '\n' + '\n'.join(f'{name} {source}' for source, name in assets.items()), encoding='utf-8')
print(f'Bundled {len(assets)} font subsets with licences.')
