import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../../layout/header/header';
import { Footer } from '../../../layout/footer/footer';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';

  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      this.notificationService.error('Please fill in all fields', 3000);
      return;
    }
    this.errorMessage = '';
    this.loading = true;
    this.loadingService.show();
    
    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      // Call auth service to login
      this.authService.login(this.email, this.password);
      this.loadingService.hide();
      this.notificationService.success('Login successful! Welcome back.', 4000);
      // Redirect to dashboard
      this.router.navigate(['/dashboard']);
    }, 2000);
  }
}
