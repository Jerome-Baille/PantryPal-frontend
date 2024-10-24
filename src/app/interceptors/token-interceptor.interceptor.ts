import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: Subject<void> = new Subject<void>();

    constructor(private authService: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const modifiedRequest = req.clone({
            withCredentials: true
        });

        return next.handle(modifiedRequest).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 403) {
                    if (!this.isRefreshing) {
                        this.isRefreshing = true;
                        return this.authService.refreshToken().pipe(
                            switchMap(() => {
                                this.isRefreshing = false;
                                this.refreshTokenSubject.next();
                                const retryRequest = req.clone({
                                    withCredentials: true
                                });
                                return next.handle(retryRequest);
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
                            switchMap(() => {
                                const retryRequest = req.clone({
                                    withCredentials: true
                                });
                                return next.handle(retryRequest);
                            })
                        );
                    }
                } else {
                    return throwError(() => error);
                }
            })
        );
    }
}