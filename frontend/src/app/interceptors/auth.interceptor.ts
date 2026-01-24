import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Auth Interceptor - Tự động thêm JWT token vào các request
 * 
 * Interceptor này:
 * 1. Tự động thêm Bearer token vào header Authorization
 * 2. Xử lý lỗi 401 (Unauthorized) và chuyển về trang login
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Lấy token từ localStorage
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('access_token') 
    : null;

  // Clone request và thêm Authorization header nếu có token
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Xử lý request và bắt lỗi
  return next(authReq).pipe(
    catchError((error) => {
      // Nếu lỗi 401 (Unauthorized), xóa token và redirect về login
      if (error.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
