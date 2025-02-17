import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

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
  private authStateSubject = new BehaviorSubject<boolean>(false);
  authState$ = this.authStateSubject.asObservable();

  constructor(
    private http: HttpClient,
  ) {
    this.verifyAuthState();
  }

  private verifyAuthState() {
    this.http.get<{auth: boolean}>(`${this.authURL}/verify`, { withCredentials: true })
      .subscribe({
        next: (response) => this.authStateSubject.next(response.auth),
        error: () => this.authStateSubject.next(false)
      });
  }

  logout() {
    return this.http.post(`${this.authURL}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.authStateSubject.next(false);
      })
    );
  }

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(`${this.authURL}/login`, { username, password }, { withCredentials: true }).pipe(
      tap(() => {
        this.authStateSubject.next(true);
      })
    );
  }

  register(username: string, email: string, password: string) {
    return this.http.post(`${this.authURL}/register`, { username, email, password }, { withCredentials: true });
  }

  refreshToken() {
    return this.http.post(`${this.authURL}/refresh`, {}, { withCredentials: true });
  }

  isLoggedIn(): Observable<boolean> {
    return this.authState$;
  }
}