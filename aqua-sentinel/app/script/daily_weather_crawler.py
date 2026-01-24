import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

URL = "https://nchmf.gov.vn/kttv/vi-VN/1/thoi-tiet-dat-lien-24h-12h2-15.html"

def crawl_weather_land_forecast(url: str):
    resp = requests.get(url, timeout=15)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")

    # --- Title ---
    title_tag = soup.find("h1")
    title = title_tag.get_text(strip=True) if title_tag else "Dự báo thời tiết đất liền 24h"

    # --- Published date (nếu có) ---
    published_at = None
    time_tag = soup.find("span", class_="time") or soup.find("div", class_="time")
    if time_tag:
        published_at = time_tag.get_text(strip=True)

    # --- Content ---
    content_div = (
        soup.find("div", class_="content") or
        soup.find("div", class_="noidung") or
        soup.find("article")
    )

    if not content_div:
        raise RuntimeError("Không tìm thấy content div")

    paragraphs = content_div.find_all(["p", "div"])
    content_text = "\n".join(
        p.get_text(" ", strip=True)
        for p in paragraphs
        if p.get_text(strip=True)
    )

    return {
        "source": "NCHMF",
        "category": "thoi_tiet_dat_lien_24h",
        "url": url,
        "title": title,
        "published_at": published_at,
        "crawled_at": datetime.utcnow().isoformat() + "Z",
        "content": content_text
    }


if __name__ == "__main__":
    data = crawl_weather_land_forecast(URL)

    with open("../news/weather_land_forecast_24h.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("✅ Crawled & saved to weather_land_forecast_24h.json")
