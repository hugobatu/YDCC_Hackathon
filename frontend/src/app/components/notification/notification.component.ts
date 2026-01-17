import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription!: Subscription;

  constructor(
    private notificationService: NotificationService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications.subscribe((notifications) => {
      this.notifications = notifications;
      // Force change detection to ensure the view updates immediately
      try { this.cd.detectChanges(); } catch (e) { /* noop */ }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }

  getIcon(type: string): string {
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠',
    };
    return icons[type as keyof typeof icons] || '';
  }
}
