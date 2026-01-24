import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard - Bảo vệ các route yêu cầu xác thực
 * 
 * Guard này kiểm tra xem người dùng đã đăng nhập chưa.
 * Nếu chưa đăng nhập, chuyển hướng về trang login
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Lưu URL người dùng đang cố gắng truy cập để redirect sau khi login
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  
  return false;
};
