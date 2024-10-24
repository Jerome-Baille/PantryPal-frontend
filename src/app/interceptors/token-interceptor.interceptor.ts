import { inject } from '@angular/core';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { throwError, Subject, EMPTY } from 'rxjs';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

let isRefreshing = false;
const refreshTokenSubject = new Subject<void>();

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // Navigate to /auth only if not already there
                if (router.url !== '/auth/login') {
                    router.navigate(['/auth/login']);
                }
                return EMPTY;
            } else if (error.status === 403) {
                if (!isRefreshing) {
                    isRefreshing = true;
                    return authService.refreshToken().pipe(
                        switchMap(() => {
                            isRefreshing = false;
                            refreshTokenSubject.next();
                            return next(req);
                        }),
                        catchError(refreshError => {
                            isRefreshing = false;
                            return throwError(() => refreshError);
                        }),
                        finalize(() => {
                            isRefreshing = false;
                        })
                    );
                } else {
                    return refreshTokenSubject.pipe(
                        switchMap(() => next(req))
                    );
                }
            } else {
                return throwError(() => error);
            }
        })
    );
};