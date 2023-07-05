import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CookieService } from '../shared/cookie.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
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
    return this.http.post<any>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
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
}