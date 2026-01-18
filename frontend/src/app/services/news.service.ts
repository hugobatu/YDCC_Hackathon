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

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/**
 * Interface for news item data structure
 * Defines the shape of news objects returned by this service
 */
export interface NewsItem {
  id: string;          // Unique identifier for the news item
  title: string;       // Headline of the news article
  summary: string;     // Brief description or excerpt
  date: Date;          // Publication date
  source: string;      // Source of the news (e.g., 'Aquaculture Daily')
}

/**
 * Service decorator makes this class injectable throughout the application
 * providedIn: 'root' means it's a singleton service available app-wide
 */
@Injectable({
  providedIn: 'root'
})
export class NewsService {

  constructor() { }

  // ==================== PUBLIC METHODS ====================
  
  /**
   * Fetches the latest news items
   * 
   * Returns: Observable stream of NewsItem array
   * 
   * Current Implementation:
   * - Returns mock data using RxJS 'of()' operator
   * - Immediately emits the data (synchronous)
   * 
   * TODO: Replace with actual HTTP call to backend API
   * Example:
   * return this.http.get<NewsItem[]>('/api/news/latest');
   * 
   * API Endpoint Expected:
   * GET /api/news/latest
   * Response: NewsItem[]
   */
  getLatestNews(): Observable<NewsItem[]> {
    // Mock news data for demonstration
    // Replace this entire array with API response
    const mockNews: NewsItem[] = [
      {
        id: '1',
        title: 'New Water Quality Regulations for 2026',
        summary: 'The Department of Fishery has released new guidelines for aquaculture water quality standards, focusing on ammonia limits.',
        date: new Date('2026-01-15T10:00:00'),
        source: 'Aquaculture Daily'
      },
      {
        id: '2',
        title: 'Seasonal Disease Alert',
        summary: 'Farmers in the region are advised to watch out for early signs of bacterial infections due to fluctuating temperatures.',
        date: new Date('2026-01-17T09:30:00'),
        source: 'Local Fishery Bureau'
      },
      {
        id: '3',
        title: 'Market Price Update: Shrimp',
        summary: 'Shrimp prices have seen a 5% increase this week driven by high export demand.',
        date: new Date('2026-01-18T08:00:00'),
        source: 'Market Watch'
      }
    ];
    
    // Return as Observable to match API pattern
    // 'of()' creates an Observable that immediately emits the value and completes
    return of(mockNews);
    
    // TODO: Replace with actual HTTP call:
    // return this.http.get<NewsItem[]>(`${this.apiUrl}/news/latest`)
    //   .pipe(
    //     catchError(error => {
    //       console.error('Error fetching news:', error);
    //       return of([]);  // Return empty array on error
    //     })
    //   );
  }
  
  // ==================== FUTURE METHODS ====================
  
  /**
   * TODO: Add method to fetch news by category
   * getNewsByCategory(category: string): Observable<NewsItem[]>
   */
  
  /**
   * TODO: Add method to fetch news details
   * getNewsById(id: string): Observable<NewsItem>
   */
  
  /**
   * TODO: Add method to mark news as read
   * markAsRead(newsId: string): Observable<void>
   */
}
