import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { CookieService } from '../shared/cookie.service';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from 'config/api-endpoints';


interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpireDate: Date;
  refreshTokenExpireDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private accessTokenSubject = new BehaviorSubject<string>('');

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router
  ) {
    const accessToken = this.cookieService.getCookie('PPaccessToken');
    if (accessToken) {
      this.accessTokenSubject.next(accessToken);
    }
  }

  // Method to get the authorization header
  getAuthorizationHeader(): string | null {
    const accessToken = this.accessTokenSubject.value;
    if (accessToken) {
      return `Bearer ${accessToken}`;
    } else {
      return null;
    }
  }

  // Method to handle token refresh
  refreshToken(): Observable<string> {
    const refreshToken = this.cookieService.getCookie('PPrefreshToken');
    if (!refreshToken) {
      this.logout();
      return throwError(() => 'Refresh token not found');
    }
    return this.http.post<any>(`${API_ENDPOINTS.auth}/refresh`, { refreshToken }).pipe(
      switchMap((response: any) => {
        const newAccessToken = response.accessToken;
        this.cookieService.setCookie('PPaccessToken', newAccessToken, response.accessTokenExpireDate);
        this.accessTokenSubject.next(newAccessToken);
        return this.accessTokenSubject;
      }),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  // Method to handle user logout
  logout(): void {
    this.cookieService.deleteCookie('PPaccessToken');
    this.cookieService.deleteCookie('PPrefreshToken');
    this.accessTokenSubject.next(null || '');
    // Redirect to login page
    this.router.navigate(['/auth/login']);
  }

  // Method to handle user login
  login(loginForm: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_ENDPOINTS.auth}/login`, loginForm).pipe(
      tap((response: LoginResponse) => {
        const newAccessToken = response.accessToken;
        this.cookieService.setCookie('PPaccessToken', newAccessToken, response.accessTokenExpireDate);
        this.accessTokenSubject.next(newAccessToken);
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  // Method to handle user registration
  register(registerForm: any): Observable<any> {
    const registerEndpoint = `${API_ENDPOINTS.user}`;

    return this.http.post(registerEndpoint, registerForm).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
}