import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

URL = "https://nchmf.gov.vn/kttv/vi-VN/1/du-bao-truong-nuoc-dang-lon-nhat-3-ngay-toi-post49993.html"

def crawl_article(url):
    r = requests.get(url, timeout=10)
    if r.status_code != 200:
        raise Exception("Request failed")

    soup = BeautifulSoup(r.text, "html.parser")

    title_tag = soup.find("h1")
    if not title_tag:
        raise Exception("No title found")

    content_div = soup.find("div", class_="content-news-detail")
    if not content_div:
        raise Exception("No content found")

    return {
        "title": title_tag.get_text(strip=True),
        "content": content_div.get_text("\n", strip=True),
        "url": url
    }

article = crawl_article(URL)

output = {
    "source": "nchmf.gov.vn",
    "category": "du_bao_muc_nuoc",
    "crawled_at": datetime.utcnow().isoformat() + "Z",
    "article": article
}

with open("du_bao_truong_nuoc_3_ngay.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("✅ Crawl done")
