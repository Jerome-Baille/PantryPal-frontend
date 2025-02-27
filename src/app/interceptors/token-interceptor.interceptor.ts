import { inject, signal, effect } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from, Subscription } from 'rxjs';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

// Using signals for refresh state management
const isRefreshing = signal<boolean>(false);
const refreshSuccess = signal<boolean>(false);

// Define a better structure for pending requests
interface PendingRequest {
  request: HttpRequest<unknown>;
  observer: {
    next: (value: HttpEvent<unknown>) => void;
    error: (error: any) => void;
    complete: () => void;
  };
}

// Create a pending requests queue with observers
const pendingRequests: PendingRequest[] = [];

export const tokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip interception for specific auth endpoints
  if (req.url.includes('/auth/refresh') || req.url.includes('/auth/logout')) {
    return next(req);
  }
  
  // Ensure all requests use withCredentials
  const requestWithCreds = req.clone({
    withCredentials: true
  });

  return next(requestWithCreds).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - logout and redirect to login
        console.log('Session expired. Redirecting to login.');
        return authService.logout().pipe(
          switchMap(() => {
            if (router.url !== '/auth/login') {
              router.navigate(['/auth/login']);
            }
            return throwError(() => new Error('Session expired'));
          })
        );
      } else if (error.status === 403) {
        // Forbidden - try to refresh token
        return handleTokenRefresh(requestWithCreds, next, authService, router);
      }
      // Any other error passes through
      return throwError(() => error);
    })
  );
};

/**
 * Handle token refresh when receiving 403 errors
 */
function handleTokenRefresh(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing()) {
    // Start refresh process
    isRefreshing.set(true);
    refreshSuccess.set(false);
    pendingRequests.length = 0; // Clear pending requests

    // Set up effect to process pending requests when refresh succeeds
    const refreshEffect = effect(() => {
      if (refreshSuccess()) {
        // Process all pending requests when token is refreshed successfully
        console.log(`Processing ${pendingRequests.length} pending requests after token refresh`);
        
        // Handle all pending requests
        pendingRequests.forEach(({ request, observer }) => {
          next(request).subscribe({
            next: (event) => observer.next(event),
            error: (err) => observer.error(err),
            complete: () => observer.complete()
          });
        });
        
        pendingRequests.length = 0; // Clear after processing
        refreshEffect.destroy(); // Clean up the effect
      }
    });

    return authService.refreshToken().pipe(
      switchMap(() => {
        // Token refresh successful
        isRefreshing.set(false);
        refreshSuccess.set(true);
        // Retry the original request
        return next(request);
      }),
      catchError((error) => {
        // Token refresh failed
        isRefreshing.set(false);
        refreshEffect.destroy(); // Clean up the effect

        // Logout and redirect on authentication failure
        return authService.logout().pipe(
          switchMap(() => {
            router.navigate(['/auth/login']);
            return throwError(() => new Error('Token refresh failed'));
          })
        );
      }),
      finalize(() => {
        isRefreshing.set(false);
      })
    );
  } else {
    // Queue this request until token refresh completes
    return new Observable<HttpEvent<unknown>>(observer => {
      // Add this request to the pending queue with its observer
      pendingRequests.push({
        request,
        observer: {
          next: (value) => observer.next(value),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        }
      });
    });
  }
}