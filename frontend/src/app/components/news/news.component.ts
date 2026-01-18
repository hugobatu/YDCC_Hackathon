import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService, NewsItem } from '../../services/news.service';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss'
})
export class NewsComponent implements OnInit {
  newsService = inject(NewsService);
  newsItems: NewsItem[] = [];

  ngOnInit() {
    this.newsService.getLatestNews().subscribe(data => {
      this.newsItems = data;
    });
  }
}
