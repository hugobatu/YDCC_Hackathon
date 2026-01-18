/**
 * NEWS COMPONENT
 * ==============
 * Displays the latest industry news and updates for aquaculture farmers.
 * Shows a scrollable list of news items with title, summary, source, and date.
 * 
 * Features:
 * - Fetches news from NewsService on component initialization
 * - Displays news in a card-based layout
 * - Scrollable list for multiple news items
 * 
 * Location: Right sidebar of pool detail page (above AI Consultant)
 * 
 * Usage:
 * <app-news></app-news>
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService, NewsItem } from '../../services/news.service';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule],  // Required for *ngFor directive
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss'
})
export class NewsComponent implements OnInit {
  
  // ==================== SERVICES ====================
  /**
   * Injects the NewsService to fetch news data
   * Using Angular's inject() function for dependency injection
   */
  newsService = inject(NewsService);
  
  // ==================== COMPONENT STATE ====================
  /**
   * Stores the list of news items to display
   * Populated in ngOnInit from NewsService
   * Used in template with *ngFor directive
   * 
   * Each item contains:
   * - id: Unique identifier
   * - title: News headline
   * - summary: Brief description
   * - date: Publication date
   * - source: News source name
   */
  newsItems: NewsItem[] = [];

  // ==================== LIFECYCLE HOOKS ====================
  /**
   * Called when component is initialized
   * Fetches the latest news from the service
   * 
   * Flow:
   * 1. Subscribe to NewsService.getLatestNews()
   * 2. Receive Observable stream of news items
   * 3. Store items in newsItems array
   * 4. Template automatically updates via data binding
   * 
   * TODO: Add error handling and loading state
   * TODO: Replace with actual API call when backend is ready
   */
  ngOnInit() {
    // Subscribe to news service Observable
    this.newsService.getLatestNews().subscribe(data => {
      // Store received news items
      this.newsItems = data;
      
      // TODO: Add error handling
      // error: (error) => {
      //   console.error('Error loading news:', error);
      //   // Show error message to user
      // }
    });
  }
}
