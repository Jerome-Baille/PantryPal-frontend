import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, EMPTY, throwError } from 'rxjs';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: Subject<void> = new Subject<void>();

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.snackBar.open('Unauthorized access. Redirecting to login.', 'Close', { duration: 3000 });
          if (this.router.url !== '/auth/login') {
            this.router.navigate(['/auth/login']);
          }
          return EMPTY;
        } else if (error.status === 403) {
          this.snackBar.open('Forbidden access. Refreshing token.', 'Close', { duration: 3000 });
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
                this.snackBar.open('Token refresh failed. Please login again.', 'Close', { duration: 3000 });
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
          this.snackBar.open(`Error: ${error.message}`, 'Close', { duration: 3000 });
          return throwError(() => error);
        }
      })
    );
  }
}