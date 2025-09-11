import { inject, runInInjectionContext, EnvironmentInjector, signal } from '@angular/core';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { throwError, Observable, from } from 'rxjs';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

// Using signals instead of Subject for token refresh state
let isRefreshing = false;
const refreshTokenSignal = signal<boolean>(false);

// A queue to store pending requests during refresh
const pendingRequests: Array<{
  resolve: (value: boolean) => void;
}> = [];

// Function to notify waiting requests. Pass `success` to indicate whether refresh succeeded.
function notifyRefreshComplete(success: boolean) {
  // Update signal to notify components
  refreshTokenSignal.set(success);

  // Resolve any pending requests with the success state
  pendingRequests.forEach(request => {
    request.resolve(success);
  });

  // Clear the queue
  pendingRequests.length = 0;

  // Reset signal state after a short delay
  setTimeout(() => {
    refreshTokenSignal.set(false);
  }, 100);
}

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  // Bypass refresh token endpoints
  if (req.url.includes('/refresh')) {
    return next(req);
  }

  // Helper to determine whether the error should trigger a token refresh
  function shouldAttemptRefresh(error: HttpErrorResponse | any) {
    if (!error) return false;
    // Backend explicit flag
    if (error?.error?.shouldRefresh) return true;
    // Backend returns JSON error shape: { error: 'no_token' } or { error: 'token_expired' }
    if (error?.error?.error === 'no_token' || error?.error?.error === 'token_expired') return true;
    // Generic 401 Unauthorized — only attempt refresh if body indicates token issue
    if (error instanceof HttpErrorResponse && error.status === 401) {
      const body = error.error;
      // If body is an object with an error/message mentioning token, try refresh
      if (body && typeof body === 'object') {
        const msg = String(body.message || body.error || '').toLowerCase();
        if (msg.includes('token') || msg.includes('access token') || msg.includes('no_token') || msg.includes('missing')) {
          return true;
        }
      }
    }
    return false;
  }

  const injector = inject(EnvironmentInjector);
  
  // We'll use the injector inside the pipes where we need the services
  const modifiedRequest = req.clone({
    withCredentials: true
  });

  return next(modifiedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (shouldAttemptRefresh(error)) {
        if (!isRefreshing) {
          isRefreshing = true;

          return runInInjectionContext(injector, () => {
            const authService = inject(AuthService);
            const router = inject(Router);

            return authService.refreshToken().pipe(
              switchMap(() => {
                isRefreshing = false;
                // Notify queued requests that refresh succeeded
                notifyRefreshComplete(true);
                const retryRequest = req.clone({
                  withCredentials: true
                });
                return next(retryRequest);
              }),
              catchError(refreshError => {
                isRefreshing = false;
                // Notify queued requests that refresh failed
                notifyRefreshComplete(false);
                // Log out the user and redirect to login
                // authService.logout() returns an observable; call it but don't block
                try { authService.logout().subscribe({ next: () => {}, error: () => {} }); } catch {}
                router.navigate(['/auth/login']);
                return throwError(() => refreshError);
              }),
              finalize(() => {
                isRefreshing = false;
              })
            );
          });
        } else {
          // Wait for the refresh to complete using a promise that resolves with success/failure
          return from(
            new Promise<boolean>((resolve) => {
              // Add this request to the pending queue
              pendingRequests.push({ resolve });

              // Set up a timeout to avoid hanging forever
              setTimeout(() => {
                resolve(false);
              }, 10000); // 10 second timeout
            })
          ).pipe(
            switchMap((refreshSucceeded) => {
              const retryRequest = req.clone({
                withCredentials: true
              });
              if (refreshSucceeded) {
                return next(retryRequest);
              }
              // If refresh failed (or timed out), propagate an error so caller can handle it
              return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized', error: 'RefreshFailed' }));
            })
          );
        }
      } else {
        return throwError(() => error);
      }
    })
  );
}