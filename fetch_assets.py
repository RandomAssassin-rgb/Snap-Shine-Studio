import urllib.request
import urllib.parse
import json
import re
import os

def get_image_url(query):
    try:
        url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(query + " transparent png")
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        html = urllib.request.urlopen(req).read().decode('utf-8')
        # DuckDuckGo HTML doesn't have direct image links easily, let's use a public API or another source.
    except Exception as e:
        print("Error", e)
        return None

# Actually, an easier way is to just use some direct links I know or use a free API.
# Wait, I can search Wikimedia Commons.
def search_wikimedia(query):
    url = f"https://en.wikipedia.org/w/api.php?action=query&list=allimages&aiprop=url&format=json&aiprefix={urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        data = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
        images = data.get('query', {}).get('allimages', [])
        if images:
            return images[0]['url']
    except:
        pass
    return None

# It's highly unlikely I'll find "Snapchat dog filter" on Wikipedia.
