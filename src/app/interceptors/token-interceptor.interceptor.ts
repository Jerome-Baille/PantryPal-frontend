import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { LoaderService } from '../services/loader.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private loaderService: LoaderService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loaderService.showLoader(); // Show the loader
    const authHeader = this.authService.getAuthorizationHeader();
    if (authHeader) {
      request = request.clone({
        setHeaders: {
          Authorization: authHeader
        }
      });
    }
    return next.handle(request).pipe(
      catchError(error => {
        if (error.status === 403 && !request.url.endsWith('/refresh')) {
          return this.authService.refreshToken().pipe(
            switchMap(() => {
              const newAuthHeader = this.authService.getAuthorizationHeader();
              if (newAuthHeader) {
                request = request.clone({
                  setHeaders: {
                    Authorization: newAuthHeader
                  }
                });
              }
              return next.handle(request);
            }),
            catchError(error => {
              this.authService.logout();
              return throwError(() => error);
            })
          );
        } else {
          return throwError(() => error);
        }
      }),
      finalize(() => {
        this.loaderService.hideLoader(); // Hide the loader
      })
    );
  }
}