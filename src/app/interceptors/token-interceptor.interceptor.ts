import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { Observable, Subject, EMPTY, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, finalize, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Bypass interceptor logic for auth endpoints
    if (req.url.includes('/auth/refresh') || req.url.includes('/auth/logout')) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.logout().subscribe(() => {
            if (this.router.url !== '/auth/login') {
              this.router.navigate(['/auth/login']);
            }
          });
          return EMPTY;
        } else if (error.status === 403) {
          return this.handle403Error(req, next);
        } else {
          return throwError(() => error);
        }
      })
    );
  }

  private handle403Error(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token);
          return next.handle(request);
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(null);
          if (err.status === 401) {
            this.authService.logout().subscribe(() => {
              this.router.navigate(['/auth/login']);
            });
          }
          return throwError(() => err);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(() => next.handle(request))
    );
  }
}

export const tokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const interceptor = new AuthInterceptor(authService, router);
  return interceptor.intercept(req, { handle: next });
};