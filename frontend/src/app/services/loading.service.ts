import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private isLoadingSignal = signal(false);
  public isLoading = this.isLoadingSignal.asReadonly();

  show() {
    this.isLoadingSignal.set(true);
  }

  hide() {
    this.isLoadingSignal.set(false);
  }

  toggle() {
    this.isLoadingSignal.set(!this.isLoadingSignal());
  }
}
