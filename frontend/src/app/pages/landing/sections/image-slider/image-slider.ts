import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-slider.html',
  styleUrls: ['./image-slider.scss']
})
export class ImageSliderComponent {
  slides = [
    {
      image: '1.jpg',
      title: 'Build Modern Web Experiences',
      subtitle: 'Fast. Scalable. Beautiful.'
    },
    {
      image: '2.jpg',
      title: 'Angular 21 Ready',
      subtitle: 'Enterprise-grade frontend'
    },
    {
      image: '3.jpg',
      title: 'Clean Architecture',
      subtitle: 'Built for long-term growth'
    }
  ];

  currentIndex = 0;

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prev() {
    this.currentIndex =
      (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }
}
