import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../../layout/header/header';
import { Footer } from '../../../layout/footer/footer';
import { NotificationService } from '../../../services/notification.service';

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

  constructor(private notificationService: NotificationService) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      this.notificationService.error('Please fill in all fields', 3000);
      return;
    }
    this.errorMessage = '';
    this.loading = true;
    
    // TODO: Implement actual login logic
    console.log('Login attempt:', { email: this.email, password: this.password, rememberMe: this.rememberMe });
    
    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      this.notificationService.success('Login successful! Welcome back.', 4000);
      // You can redirect here after showing the notification
      // this.router.navigate(['/dashboard']);
    }, 2000);
  }
}
