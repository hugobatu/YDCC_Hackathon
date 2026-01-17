import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSignal = signal(this.getStoredAuthState());
  public isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  private currentUserSignal = signal<any>(this.getStoredUser());
  public currentUser = this.currentUserSignal.asReadonly();

  constructor(private router: Router) {}

  login(email: string, password: string) {
    // Mock login - replace with actual API call
    const user = { email, name: email.split('@')[0] };
    localStorage.setItem('authToken', 'mock-token-' + Date.now());
    localStorage.setItem('user', JSON.stringify(user));
    this.isAuthenticatedSignal.set(true);
    this.currentUserSignal.set(user);
    return true;
  }

  signup(email: string, fullName: string, password: string) {
    // Mock signup - replace with actual API call
    const user = { email, name: fullName };
    localStorage.setItem('authToken', 'mock-token-' + Date.now());
    localStorage.setItem('user', JSON.stringify(user));
    this.isAuthenticatedSignal.set(true);
    this.currentUserSignal.set(user);
    return true;
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.isAuthenticatedSignal.set(false);
    this.currentUserSignal.set(null);
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSignal();
  }

  private getStoredAuthState(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('authToken');
    }
    return false;
  }

  private getStoredUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }
}
