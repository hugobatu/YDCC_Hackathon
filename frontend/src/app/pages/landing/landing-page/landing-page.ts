import { Component } from '@angular/core';
import { HeroComponent } from '../sections/hero/hero';
import { Footer } from '../../../layout/footer/footer';
import { Header } from '../../../layout/header/header';
import { MetricsSection } from '../sections/metrics/metrics';
import { Visualization } from '../sections/visualization/visualization';
@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [Header, HeroComponent, MetricsSection, Visualization, Footer],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPageComponent {}
