from duckduckgo_search import DDGS
import urllib.request
import os

os.makedirs('public/ar-assets', exist_ok=True)

queries = {
    "thug_life_glasses.png": "thug life pixel glasses transparent png",
    "dog_ears.png": "snapchat dog filter ears transparent png",
    "dog_nose.png": "snapchat dog filter nose transparent png",
    "cupid_hearts.png": "snapchat heart crown transparent png",
    "pink_bow.png": "snapchat pink bow filter transparent png"
}

with DDGS() as ddgs:
    for filename, query in queries.items():
        results = list(ddgs.images(query, max_results=10))
        for res in results:
            url = res.get('image')
            if url:
                try:
                    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=5) as response:
                        img_data = response.read()
                        # Verify it's a png or we just save it as png
                        with open(f'public/ar-assets/{filename}', 'wb') as f:
                            f.write(img_data)
                    print(f"Downloaded {filename}")
                    break
                except Exception as e:
                    print(f"Failed {url}: {e}")
