import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  public notifications: Observable<Notification[]> = this.notifications$.asObservable();

  private maxNotifications = 5;
  private timeoutIds: Map<string, NodeJS.Timeout> = new Map();

  show(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    duration: number = 4000,
  ): string {
    const id = this.generateId();
    const notification: Notification = {
      id,
      type,
      message,
      duration,
    };

    let currentNotifications = this.notifications$.value;

    // If max notifications reached, remove the oldest one
    if (currentNotifications.length >= this.maxNotifications) {
      const oldestNotification = currentNotifications[0];
      this.dismiss(oldestNotification.id);
      currentNotifications = this.notifications$.value;
    }

    currentNotifications.push(notification);
    this.notifications$.next([...currentNotifications]);
    console.log(`[Notification] Created: ${id}, Type: ${type}, Duration: ${duration}ms`);

    // Auto-dismiss after duration
    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        console.log(`[Notification] Dismissing: ${id} after ${duration}ms`);
        this.dismiss(id);
      }, duration);
      this.timeoutIds.set(id, timeoutId);
    }

    return id;
  }

  success(message: string, duration: number = 4000): string {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 4000): string {
    return this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 4000): string {
    return this.show(message, 'info', duration);
  }

  warning(message: string, duration: number = 4000): string {
    return this.show(message, 'warning', duration);
  }

  dismiss(id: string): void {
    console.log(`[Notification] Dismiss called for: ${id}`);

    // Clear the timeout if it exists
    const timeoutId = this.timeoutIds.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeoutIds.delete(id);
    }

    const currentNotifications = this.notifications$.value;
    const filtered = currentNotifications.filter((n) => n.id !== id);
    console.log(
      `[Notification] Before filter: ${currentNotifications.length}, After: ${filtered.length}`,
    );
    this.notifications$.next(filtered);
  }

  dismissAll(): void {
    this.timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
    this.timeoutIds.clear();
    this.notifications$.next([]);
  }

  setMaxNotifications(max: number): void {
    if (max > 0) {
      this.maxNotifications = max;
    }
  }

  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
