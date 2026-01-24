import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
  private route = inject(ActivatedRoute);

  onLogin() {
    // Validate form
    if (!this.email || !this.password) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin';
      this.notificationService.error(this.errorMessage, 3000);
      return;
    }

    this.errorMessage = '';
    this.loading = true;
    this.loadingService.show();
    
    // Gọi API login thật
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        this.loadingService.hide();
        this.notificationService.success('Đăng nhập thành công! Chào mừng bạn trở lại.', 4000);
        
        // Redirect về trang được yêu cầu trước đó hoặc dashboard
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        this.loading = false;
        this.loadingService.hide();
        
        // Xử lý lỗi từ API
        let errorMsg = 'Đăng nhập thất bại. Vui lòng thử lại.';
        
        if (error.status === 401) {
          errorMsg = 'Email hoặc mật khẩu không chính xác';
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
