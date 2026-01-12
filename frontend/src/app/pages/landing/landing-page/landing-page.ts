import { Component } from '@angular/core';
import { HeroComponent } from '../sections/hero/hero';
import { ImageSliderComponent } from '../sections/image-slider/image-slider';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [HeroComponent, ImageSliderComponent],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPageComponent {}
