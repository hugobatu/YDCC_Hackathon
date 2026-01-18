import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: Date;
  source: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  constructor() { }

  getLatestNews(): Observable<NewsItem[]> {
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
    return of(mockNews);
  }
}
