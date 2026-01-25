/**
 * NEWS SERVICE
 * ============
 * Provides news data for the application.
 * Currently returns mock data but designed to be replaced with actual API calls.
 * 
 * Purpose:
 * - Fetch industry news and updates for aquaculture farmers
 * - Provide information about regulations, diseases, market prices, etc.
 * 
 * Usage:
 * inject(NewsService).getLatestNews().subscribe(news => {...})
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';

/**
 * Interface for news item data structure
 */
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: Date;
  source: string;
}

interface NewsRawJson {
  source: string;
  category: string;
  url: string;
  title: string;
  published_at: string | null;
  crawled_at: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private http = inject(HttpClient);

  // List of news files to fetch
  private readonly newsFiles = [
    { file: 'weather_land_forecast_24h.json', label: 'Dự báo thời tiết trong 24h' },
    { file: 'hydrology_short_term_forecast.json', label: 'Dự báo thuỷ văn' },
    { file: 'tide.json', label: 'Dự báo thuỷ triều' },
    { file: 'water_flow.json', label: 'Dự báo dòng chảy của biển' },
    { file: 'water_level.json', label: 'Dự báo mực nước' }
  ];

  /**
   * Fetches the latest news items from static JSON files
   */
  getLatestNews(): Observable<NewsItem[]> {
    const requests = this.newsFiles.map(item => 
      this.http.get<NewsRawJson>(`/news/${item.file}`).pipe(
        map(data => ({ data, label: item.label, file: item.file })),
        catchError(error => {
          console.error(`Error loading ${item.file}`, error);
          return of(null);
        })
      )
    );

    return forkJoin(requests).pipe(
      map(results => {
        return results
          .filter(result => result !== null)
          .map(result => {
            const { data, label, file } = result!;
            return {
              id: file,
              title: data.title || label, // Use JSON title if available, else label
              summary: data.content,
              date: new Date(data.crawled_at),
              source: data.source || 'NCHMF'
            } as NewsItem;
          });
      })
    );
  }
}
