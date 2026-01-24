import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../../layout/header/header';
import { Footer } from '../../../layout/footer/footer';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { LoadingService } from '../../../services/loading.service';
import { forkJoin } from 'rxjs';

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
    // Validate form
    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin';
      this.notificationService.error(this.errorMessage, 4000);
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Mật khẩu xác nhận không khớp';
      this.notificationService.error(this.errorMessage, 4000);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Email không hợp lệ';
      this.notificationService.error(this.errorMessage, 4000);
      return;
    }

    // Validate password length
    if (this.password.length < 6) {
      this.errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự';
      this.notificationService.error(this.errorMessage, 4000);
      return;
    }

    this.errorMessage = '';
    this.loading = true;
    this.loadingService.show();

    // Gọi API signup thật
    this.authService.signup(this.email, this.fullName, this.password).subscribe({
      next: (signupResponse) => {
        // Sau khi signup thành công, tự động login
        this.authService.login(this.email, this.password).subscribe({
          next: (loginResponse) => {
            this.loading = false;
            this.loadingService.hide();
            this.notificationService.success(
              'Đăng ký thành công! Chào mừng bạn đến với Aqua Sentinel AI.', 
              4000
            );
            // Redirect to dashboard
            this.router.navigate(['/dashboard']);
          },
          error: (loginError) => {
            // Signup thành công nhưng login thất bại
            this.loading = false;
            this.loadingService.hide();
            this.notificationService.success(
              'Đăng ký thành công! Vui lòng đăng nhập.', 
              4000
            );
            this.router.navigate(['/login']);
          }
        });
      },
      error: (error) => {
        this.loading = false;
        this.loadingService.hide();
        
        // Xử lý lỗi từ API
        let errorMsg = 'Đăng ký thất bại. Vui lòng thử lại.';
        
        if (error.status === 400) {
          errorMsg = 'Email đã được đăng ký';
        } else if (error.status === 422) {
          errorMsg = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
        } else if (error.status === 0) {
          errorMsg = 'Không thể kết nối đến server. Vui lòng kiểm tra lại.';
        } else if (error.error?.detail) {
          errorMsg = error.error.detail;
        }
        
        this.errorMessage = errorMsg;
        this.notificationService.error(errorMsg, 4000);
      }
    });
  }
}
