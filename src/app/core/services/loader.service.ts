import { Injectable, signal, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  // internal counter as a signal
  private loadingCount = signal(0);

  // derived readonly signal for templates
  readonly isLoading = computed(() => this.loadingCount() > 0);

  // Observable interop for parts of the app that expect an Observable
  readonly isLoading$ = toObservable(this.isLoading);

  showLoader() {
    this.loadingCount.update(n => n + 1);
  }

  hideLoader() {
    // small delay to reduce flicker on very fast requests
    setTimeout(() => {
      this.loadingCount.update(n => Math.max(0, n - 1));
    }, 100);
  }
}