import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing/landing-page/landing-page';
import { LoginPage } from './pages/auth/login-page/login-page';
import { SignupPage } from './pages/auth/signup-page/signup-page';
import { DashboardPages } from './pages/dashboard/dashboard-pages/dashboard-pages';
import { PoolDetailComponent } from './pages/dashboard/pool-detail/pool-detail.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginPage },
  { path: 'signup', component: SignupPage },
  { 
    path: 'dashboard', 
    component: DashboardPages,
    canActivate: [authGuard]
  },
  { 
    path: 'dashboard/:id', 
    component: PoolDetailComponent,
    canActivate: [authGuard]
  }
];