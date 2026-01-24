import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Interface cho response từ /api/login
 */
interface LoginResponse {
  access_token: string;
  token_type: string;
  user_name: string;
}

/**
 * Interface cho response từ /api/signup
 */
interface SignupResponse {
  user_id: string;
  email: string;
  fullname: string;
  created_at: string;
}

/**
 * Interface cho thông tin user lưu trong localStorage
 */
interface User {
  user_id?: string;
  email: string;
  fullname?: string;
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSignal = signal(this.getStoredAuthState());
  public isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  private currentUserSignal = signal<User | null>(this.getStoredUser());
  public currentUser = this.currentUserSignal.asReadonly();

  // API Base URL
  private apiUrl = environment.apiUrl || 'http://localhost:8000/api';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  /**
   * Đăng nhập với API thật
   * Endpoint: POST /api/login
   * Body: FormData với username (email) và password
   */
  login(email: string, password: string): Observable<LoginResponse> {
    // Tạo FormData theo yêu cầu của OAuth2PasswordRequestForm
    const formData = new FormData();
    formData.append('username', email); // Chú ý: backend dùng 'username' cho email
    formData.append('password', password);

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, formData).pipe(
      tap((response) => {
        // Lưu access token
        localStorage.setItem('access_token', response.access_token);
        
        // Lưu user info
        const user: User = { 
          email: response.user_name,
          name: response.user_name 
        };
        // Fix: Phải stringify object trước khi lưu để tránh lỗi JSON.parse khi reload
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update signals
        this.isAuthenticatedSignal.set(true);
        this.currentUserSignal.set(user);
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Đăng ký tài khoản mới
   * Endpoint: POST /api/signup
   * Body: JSON với email, fullname, password
   */
  signup(email: string, fullname: string, password: string): Observable<SignupResponse> {
    const body = {
      email,
      fullname,
      password
    };

    return this.http.post<SignupResponse>(`${this.apiUrl}/signup`, body).pipe(
      tap((response) => {
        // Sau khi signup thành công, tự động login
        // Tạo mock token vì signup response không trả về token
        const user: User = {
          user_id: response.user_id,
          email: response.email,
          fullname: response.fullname,
          name: response.fullname
        };
        
        // Lưu user info  
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update signals (nhưng chưa set authenticated vì cần login)
        this.currentUserSignal.set(user);
      }),
      catchError((error) => {
        console.error('Signup error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Đăng xuất
   */
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.isAuthenticatedSignal.set(false);
    this.currentUserSignal.set(null);
    this.router.navigate(['/']);
  }

  /**
   * Kiểm tra trạng thái đăng nhập
   */
  isLoggedIn(): boolean {
    return this.isAuthenticatedSignal();
  }

  /**
   * Lấy access token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  /**
   * Lấy trạng thái auth từ localStorage
   */
  private getStoredAuthState(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('access_token');
    }
    return false;
  }

  /**
   * Lấy user info từ localStorage với error handling an toàn
   */
  private getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      try {
        return JSON.parse(userStr);
      } catch (e) {
        // Nếu data bị lỗi (ví dụ do lưu string trần), xóa đi để tránh crash lần sau
        console.error('Error parsing stored user data:', e);
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  }
}
