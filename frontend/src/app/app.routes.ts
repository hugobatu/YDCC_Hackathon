import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing/landing-page/landing-page';
import { LoginPage } from './pages/auth/login-page/login-page';
import { SignupPage } from './pages/auth/signup-page/signup-page';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginPage },
  { path: 'signup', component: SignupPage }
];