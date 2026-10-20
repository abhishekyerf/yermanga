# Generates lib/pd-data.json from Internet Archive IIIF manifests for a curated list of public-domain Golden Age comics.
import json, urllib.request, urllib.parse, concurrent.futures as cf
IDS = ["weird-comics-004","atomic-war-01","atomic-war-02","atomic-war-03","atomic-war-04"]  # pages = leaf count from IIIF manifest; images use archive.org/download/{id}/page/n{k}_w{w}.jpg
UA = {"User-Agent": "YerManga/1.0 (abhishekkumar.vibe@gmail.com)"}
def get(u): return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=180))
import time, re
def retry(u):
    for k in range(4):
        try: return get(u)
        except Exception as e: err=e; time.sleep(3)
    raise err
def one(i):
    md = retry(f"https://archive.org/metadata/{i}")["metadata"]
    man = retry(f"https://iiif.archive.org/iiif/3/{i}/manifest.json")
    groups = {}
    for c in man["items"]:
        body = c["items"][0]["items"][0]["body"]
        svc = (body.get("service") or [{}])[0].get("id") or body["id"].split("/full/")[0]
        groups.setdefault(urllib.parse.unquote(svc).split("/")[-2], []).append(svc)
    pages = next(iter(groups.values()))
    d = md.get("description", ""); d = d if isinstance(d, str) else " ".join(d)
    d = re.sub(r"\s+", " ", re.sub("<[^>]+>", " ", d)).strip()[:600]
    cr = md.get("creator", ""); cr = cr if isinstance(cr, str) else ", ".join(cr)
    return {"id": i, "title": md.get("title", i), "date": str(md.get("date", ""))[:4], "description": d or "A public-domain Golden Age comic from the Internet Archive.", "creator": cr, "pages": pages}
out = []
def safe(i):
    try: return one(i)
    except Exception as e: print("FAIL", i, e)
with cf.ThreadPoolExecutor(4) as ex: out = [r for r in ex.map(safe, IDS) if r]
json.dump(out, open("lib/pd-data.json", "w"))
for o in out: print(o["id"], o["date"], len(o["pages"]), o["pages"][0][:110])
