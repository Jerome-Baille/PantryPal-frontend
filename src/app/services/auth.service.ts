import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

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
  
  // Using signal instead of BehaviorSubject
  private authState = signal<boolean>(false);
  
  // Expose the signal as a readonly signal
  readonly isAuthenticated = this.authState.asReadonly();
  
  // Create an observable from the signal for backward compatibility
  readonly authState$ = toObservable(this.isAuthenticated);

  constructor(
    private http: HttpClient,
  ) {
    this.verifyAuthState();
  }

  private verifyAuthState() {
    this.http.get<{auth: boolean}>(`${this.authURL}/verify`, { withCredentials: true })
      .subscribe({
        next: (response) => this.authState.set(response.auth),
        error: () => this.authState.set(false)
      });
  }

  logout() {
    return this.http.post(`${this.authURL}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.authState.set(false);
      })
    );
  }

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(`${this.authURL}/login`, { username, password }, { withCredentials: true }).pipe(
      tap(() => {
        this.authState.set(true);
      })
    );
  }

  register(username: string, email: string, password: string) {
    return this.http.post(`${this.authURL}/register`, { username, email, password }, { withCredentials: true });
  }

  refreshToken() {
    return this.http.post(`${this.authURL}/refresh`, {}, { withCredentials: true });
  }

  // For backward compatibility with existing components
  isLoggedIn(): Observable<boolean> {
    return this.authState$;
  }
}