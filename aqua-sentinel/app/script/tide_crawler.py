import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import time

BASE_URL = (
    "https://nchmf.gov.vn/kttv/vi-VN/1/"
    "ban-tin-du-bao-thuy-trieu-10-ngay-tu-24-01-den-02-02-2026-post{}.html"
)

START_ID = 49990
MAX_TRY = 300
SLEEP = 0.5

articles = []

def extract_content(soup):
    div = soup.find("div", class_="content-news-detail")
    if div:
        return div.get_text("\n", strip=True)
    return None

for i in range(MAX_TRY):
    post_id = START_ID + i
    url = BASE_URL.format(post_id)

    try:
        r = requests.get(url, timeout=10)
    except Exception:
        continue

    if r.status_code != 200:
        continue

    soup = BeautifulSoup(r.text, "html.parser")

    title_tag = soup.find("h1")
    if not title_tag:
        continue

    title = title_tag.get_text(strip=True)

    # lọc đúng thủy triều
    if "thủy triều" not in title.lower():
        continue

    content = extract_content(soup)
    if not content:
        print(f"⚠️ No content for post {post_id}")
        continue

    articles.append({
        "post_id": post_id,
        "title": title,
        "content": content,
        "url": url
    })

    print(f"✅ Crawled post {post_id}")
    time.sleep(SLEEP)

output = {
    "source": "nchmf.gov.vn",
    "category": "thuy_trieu",
    "crawled_at": datetime.utcnow().isoformat() + "Z",
    "articles": articles
}

with open("thuy_trieu_news.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n🎉 Done! Total articles: {len(articles)}")
