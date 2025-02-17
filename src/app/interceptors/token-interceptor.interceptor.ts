import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { Observable, Subject, EMPTY, throwError } from 'rxjs';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: Subject<void> = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
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
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            return this.authService.refreshToken().pipe(
              switchMap(() => {
                this.isRefreshing = false;
                this.refreshTokenSubject.next();
                return next.handle(req);
              }),
              catchError(refreshError => {
                this.isRefreshing = false;
                return throwError(() => refreshError);
              }),
              finalize(() => {
                this.isRefreshing = false;
              })
            );
          } else {
            return this.refreshTokenSubject.pipe(
              switchMap(() => next.handle(req))
            );
          }
        } else {
          return throwError(() => error);
        }
      })
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