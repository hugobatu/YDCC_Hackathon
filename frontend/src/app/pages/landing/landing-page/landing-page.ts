import { Component } from '@angular/core';
import { HeroComponent } from '../sections/hero/hero';
import { Footer } from '../../../layout/footer/footer';
import { Header } from '../../../layout/header/header';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [HeroComponent, Header, Footer],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPageComponent {}
