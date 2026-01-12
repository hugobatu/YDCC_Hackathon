import {
  Component,
  signal,
  effect,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.scss'
})
export class HeroComponent {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  images = [
    '/assets/hero-1.jpg',
    '/assets/hero-2.jpg',
    '/assets/hero-3.jpg'
  ];

  currentIndex = signal(0);

  constructor() {
    if (this.isBrowser) {
      setInterval(() => {
        this.currentIndex.update(
          i => (i + 1) % this.images.length
        );
      }, 5000);
    }
  }
}