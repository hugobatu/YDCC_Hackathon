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
    // Mock data simluating the JSON files provided in 'news' folder
    // Since we cannot read file system directly in browser, we mock the content here
    const mockNews: NewsItem[] = [
      {
        id: 'weather_24h',
        title: 'Dự Báo Thời Tiết Đất Liền 24h',
        summary: 'Thông tin dự báo thời tiết chi tiết trong 24 giờ tới cho khu vực đất liền, bao gồm nhiệt độ, độ ẩm và lượng mưa.',
        date: new Date(),
        source: 'weather_land_forecast_24h.json'
      },
      {
        id: 'hydrology',
        title: 'Dự Báo Thủy Văn Ngắn Hạn',
        summary: 'Cập nhật tình hình thủy văn và dự báo ngắn hạn cho các lưu vực sông chính.',
        date: new Date(),
        source: ' '
      },
      {
        id: 'tide',
        title: 'Dự Báo Thủy Triều',
        summary: 'Số liệu dự báo mực nước triều trong ngày, phục vụ việc lấy nước và thoát nước cho ao nuôi.',
        date: new Date(),
        source: 'tide.json'
      },
      {
        id: 'water_level',
        title: 'Dự Báo Mực Nước',
        summary: 'Thông tin quan trắc và dự báo mực nước tại các trạm đo đạc chính.',
        date: new Date(),
        source: 'water_level.json'
      },
      {
        id: 'water_flow',
        title: 'Thông Tin Dòng Chảy',
        summary: 'Dữ liệu về lưu lượng và tốc độ dòng chảy, hỗ trợ đánh giá khả năng cấp thoát nước.',
        date: new Date(),
        source: 'water_flow.json'
      }
    ];
    
    return of(mockNews);
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
