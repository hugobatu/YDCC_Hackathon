import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

BASE_URL = (
    "https://nchmf.gov.vn/kttv/vi-VN/1/"
    "ban-tin-du-bao-canh-bao-thuy-van-thoi-han-ngan-post{}.html"
)

START_ID = 52307
MAX_STEPS = 10   # hackathon: crawl tối đa 10 bài mới

HEADERS = {
    "User-Agent": "Mozilla/5.0 (HackathonCrawler)"
}


def parse_article(html: str, url: str):
    soup = BeautifulSoup(html, "html.parser")

    # --- Title ---
    title_tag = soup.find("h1")
    title = title_tag.get_text(strip=True) if title_tag else None

    # --- Published time ---
    published_at = None
    time_tag = soup.find("span", class_="time") or soup.find("div", class_="time")
    if time_tag:
        published_at = time_tag.get_text(strip=True)

    # --- Content ---
    content_div = (
        soup.find("div", class_="content")
        or soup.find("div", class_="noidung")
        or soup.find("article")
    )

    if not content_div:
        return None

    paragraphs = content_div.find_all(["p", "div"])
    content_text = "\n".join(
        p.get_text(" ", strip=True)
        for p in paragraphs
        if p.get_text(strip=True)
    )

    if len(content_text) < 200:  # tránh trang rác
        return None

    return {
        "source": "NCHMF",
        "category": "du_bao_thuy_van_ngan_han",
        "url": url,
        "title": title,
        "published_at": published_at,
        "crawled_at": datetime.utcnow().isoformat() + "Z",
        "content": content_text
    }


def crawl_incremental(start_id: int, max_steps: int = 10):
    results = []

    for i in range(max_steps):
        post_id = start_id + i
        url = BASE_URL.format(post_id)

        print(f"🔎 Trying post ID {post_id} ...")

        resp = requests.get(url, headers=HEADERS, timeout=15)

        if resp.status_code != 200:
            print(f"⛔ Stop at ID {post_id} (HTTP {resp.status_code})")
            break

        article = parse_article(resp.text, url)
        if not article:
            print(f"⛔ Stop at ID {post_id} (no valid content)")
            break

        print(f"✅ Crawled: {article['title']}")
        results.append(article)

    return results


if __name__ == "__main__":
    articles = crawl_incremental(START_ID, MAX_STEPS)

    with open("../news/hydrology_short_term_forecast.json", "w", encoding="utf-8") as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 Done. Saved {len(articles)} articles.")
