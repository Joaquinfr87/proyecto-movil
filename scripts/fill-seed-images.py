#!/usr/bin/env python3
"""Descarga fotos de ejemplo desde Wikimedia Commons para supabase/scenario-images/.

Uso:
    python3 scripts/fill-seed-images.py

- Reanudable: salta las carpetas que ya esten completas.
- Respeta el rate limit de Wikimedia (pausa de 10s entre peticiones + reintentos).
- Al terminar, ejecutar `pnpm db:reset` para subir las imagenes al bucket local.

Solo dependencias de la libreria estandar de Python 3.
"""
import json
import os
import re
import shutil
import time
import urllib.parse
import urllib.request

BASE = "/home/joaquin/repos/lugares-interactivos/supabase/scenario-images"
UID = "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e{}"
API = "https://commons.wikimedia.org/w/api.php"
UA = {"User-Agent": "LugaresInteractivosSeedFiller/1.0 (academic project)"}
PAUSE = 10

# (num, cantidad_imagenes, [terminos_de_busqueda en orden de preferencia])
SCENARIOS = [
    ("01", 3, ["Estadio Hernando Siles La Paz", "Estadio Hernando Siles"]),
    ("02", 2, ["Coliseo Eduardo Leon", "indoor basketball arena"]),
    ("03", 2, ["Coliseo Ciudad de La Paz", "indoor sports hall volleyball"]),
    ("04", 1, ["Estadio Municipal El Alto", "football stadium altitude"]),
    ("05", 3, ["Estadio Ramon Tahuichi Aguilera", "Estadio Tahuichi Aguilera"]),
    ("06", 2, ["indoor basketball arena interior", "coliseo deportivo"]),
    ("07", 2, ["indoor arena concert stage", "multipurpose arena"]),
    ("08", 3, ["Estadio Felix Capriles", "Estadio Wilstermann Cochabamba"]),
    ("09", 2, ["indoor futsal arena", "indoor soccer arena"]),
    ("10", 2, ["sports complex football fields aerial", "canchas futbol"]),
    ("11", 1, ["Estadio Olimpico Patria Sucre", "Estadio Patria"]),
    ("12", 1, ["Estadio Victor Agustin Ugarte", "Estadio Potosi"]),
    ("13", 1, ["Estadio Bolivia Trinidad", "football stadium floodlights"]),
    ("14", 2, ["Estadio Jesus Bermudez Oruro", "Estadio Bermudez"]),
    ("15", 1, ["football pitch aerial view", "estadio futbol campo"]),
    ("16", 1, ["cancha sintetica futbol", "futsal court night"]),
    ("17", 1, ["multi-sport court outdoor", "cancha multiple"]),
    ("18", 2, ["futsal court indoor", "synthetic football pitch"]),
    ("19", 1, ["polideportivo exterior", "sports center building"]),
    ("20", 2, ["tennis court clay", "tennis club court"]),
]


def fetch(url: str, dest: str | None = None, tries: int = 4) -> bytes | None:
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            if dest is not None:
                with open(dest, "wb") as f:
                    f.write(data)
            return data
        except Exception as e:
            wait = PAUSE * (attempt + 1)
            print(f"      reintento en {wait}s ({e})")
            time.sleep(wait)
    return None


def api_search(term: str, limit: int = 10) -> list[dict]:
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": term,
        "gsrnamespace": "6",
        "gsrlimit": str(limit),
        "prop": "imageinfo",
        "iiprop": "url|mime|size",
        "iiurlwidth": "1280",
    }
    url = API + "?" + urllib.parse.urlencode(params)
    time.sleep(PAUSE)
    raw = fetch(url)
    if raw is None:
        return []
    data = json.loads(raw)
    pages = data.get("query", {}).get("pages", {})
    ordered = sorted(pages.values(), key=lambda p: p.get("index", 999))
    out = []
    for p in ordered:
        infos = p.get("imageinfo") or []
        if not infos:
            continue
        info = infos[0]
        if info.get("mime") == "image/jpeg" and info.get("thumburl"):
            out.append({"title": p["title"], "thumburl": info["thumburl"]})
    return out


def download(url: str, dest: str) -> bool:
    # Wikimedia solo permite miniaturas en tamaños estandar; normalizar a 1280px
    url = re.sub(r"(/thumb/[^/]+/[^/]+/)\d+px-", r"\g<1>1280px-", url)
    time.sleep(PAUSE)
    data = fetch(url, dest=dest)
    return data is not None and os.path.getsize(dest) > 30_000


used_files: dict[str, str] = {}
results: list[tuple[str, int, int]] = []

for num, count, terms in SCENARIOS:
    folder = os.path.join(BASE, UID.format(num))
    # Reanudar: contar imagenes ya descargadas
    got = 0
    while got < count and os.path.exists(os.path.join(folder, f"image-{got + 1}.jpg")):
        got += 1
    if got >= count:
        print(f"[skip] {UID.format(num)} ya completo ({got}/{count})")
        results.append((UID.format(num), count, got))
        continue
    seen: set[str] = set()
    for term in terms:
        if got >= count:
            break
        try:
            candidates = api_search(term)
        except Exception as e:
            print(f"  [!] error buscando '{term}': {e}")
            continue
        for cand in candidates:
            if got >= count:
                break
            title = cand["title"]
            if title in seen or title in used_files:
                continue
            seen.add(title)
            dest = os.path.join(folder, f"image-{got + 1}.jpg")
            try:
                if download(cand["thumburl"], dest):
                    got += 1
                    used_files[title] = dest
                    print(f"  [ok] {title} -> {os.path.relpath(dest, BASE)}")
            except Exception as e:
                print(f"  [!] fallo descarga {title}: {e}")
    results.append((UID.format(num), count, got))

print("\n=== RESUMEN ===")
complete = 0
for uid, want, got in results:
    status = "OK " if got >= want else "FALTA"
    print(f"[{status}] {uid}: {got}/{want}")
    complete += got >= want
print(f"\n{complete}/{len(results)} escenarios completos")
