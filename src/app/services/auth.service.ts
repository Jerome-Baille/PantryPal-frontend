import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { tap } from 'rxjs/operators';

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
  private authURL = environment.authURL;
  private readonly LOGIN_STATUS_KEY = 'isLoggedIn';

  constructor(
    private http: HttpClient,
  ) { }

  // Method to handle user logout
  logout() {
    return this.http.post(`${this.authURL}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.setLoginStatus(false);
      })
    );
  }

  // Method to handle user login
  login(username: string, password: string) {
    return this.http.post<LoginResponse>(`${this.authURL}/login`, { username, password }, { withCredentials: true }).pipe(
      tap(() => {
        this.setLoginStatus(true);
      })
    );
  }

  // Method to handle user registration
  register(username: string, email: string, password: string) {
    return this.http.post(`${this.authURL}/register`, { username, email, password }, { withCredentials: true });
  }

  refreshToken() {
    return this.http.post(`${this.authURL}/refresh`, {}, { withCredentials: true });
  }

  // Set login status in local storage
  private setLoginStatus(status: boolean) {
    localStorage.setItem(this.LOGIN_STATUS_KEY, JSON.stringify(status));
  }

  // Get login status from local storage
  isLoggedIn(): boolean {
    return JSON.parse(localStorage.getItem(this.LOGIN_STATUS_KEY) || 'false');
  }
}