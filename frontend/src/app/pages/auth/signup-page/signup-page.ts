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
  selector: 'app-signup-page',
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './signup-page.html',
  styleUrl: './signup-page.scss',
})
export class SignupPage {
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  onSignup() {
    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      this.notificationService.error(this.errorMessage, 4000);
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.notificationService.error(this.errorMessage, 4000);
      return;
    }

    this.errorMessage = '';
    this.loading = true;
    this.loadingService.show();

    setTimeout(() => {
      this.loading = false;
      // Call auth service to signup
      this.authService.signup(this.email, this.fullName, this.password);
      this.loadingService.hide();
      this.notificationService.success('Signup successful! Welcome to Aqua Sentinel AI.', 4000);
      // Redirect to dashboard
      this.router.navigate(['/dashboard']);
    }, 1500);
  }
}
