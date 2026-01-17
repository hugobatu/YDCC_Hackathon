import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../../layout/header/header';
import { Footer } from '../../../layout/footer/footer';
import { NotificationService } from '../../../services/notification.service';

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

  constructor(private notificationService: NotificationService) {}

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

    // TODO: call signup API
    console.log('Signup attempt:', { fullName: this.fullName, email: this.email });

    setTimeout(() => {
      this.loading = false;
      this.notificationService.success('Signup successful! Please check your email to verify.', 4000);
      // Optionally reset form
      this.fullName = '';
      this.email = '';
      this.password = '';
      this.confirmPassword = '';
    }, 1500);
  }
}
