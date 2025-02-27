import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { tap } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';

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
  
  // New signal to track if verification is complete
  private verificationCompleted = signal<boolean>(false);

  // Create observables from the signals
  readonly authState$ = toObservable(this.isAuthenticated);
  readonly verificationCompleted$ = toObservable(this.verificationCompleted.asReadonly());

  constructor(
    private http: HttpClient,
  ) {
    this.verifyAuthState();
  }

  private verifyAuthState() {
    this.http.get<{auth: boolean}>(`${this.authURL}/verify`, { withCredentials: true })
      .subscribe({
        next: (response) => {
          this.authState.set(response.auth);
          this.verificationCompleted.set(true);
        },
        error: () => {
          this.authState.set(false);
          this.verificationCompleted.set(true);
        }
      });
  }

  // Wait until verification is complete then emit the authState value
  waitForAuthState(): Observable<boolean> {
    return combineLatest([this.authState$, this.verificationCompleted$]).pipe(
      filter(([_, verified]) => verified),
      map(([auth, _]) => auth),
      take(1)
    );
  }
  
  // For backward compatibility with existing components
  isLoggedIn(): Observable<boolean> {
    return this.waitForAuthState();
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
}