import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent {
  activeForm: 'login' | 'register' = 'login'; // Tracks the active form (login or register)

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router
  ) {

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]]
    });
  }

  onLoginSubmit() {
    if (this.loginForm.valid) {
      const loginEndpoint = 'http://localhost:3000/api/auth/login';
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const body = JSON.stringify(this.loginForm.value);

      this.http.post<LoginResponse>(loginEndpoint, body, { headers }).subscribe({
        next: (response) => {
          this.cookieService.set('PPaccessToken', response.accessToken);
          this.cookieService.set('PPrefreshToken', response.refreshToken);
          this.cookieService.set('PPuserId', response.userId);
        },
        error: (error) => {
          // Handle login error, e.g., display error message
          console.error('Login failed:', error);
        },
        complete: () => {
          // Handle successful login, e.g., redirect to dashboard
          console.log('Login successful!');
          this.router.navigate(['/recipe/list']);
        }
      });
    }
  }

  onRegisterSubmit() {
    if (this.registerForm.valid) {
      const registerEndpoint = 'http://localhost:3000/api/users';
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const body = JSON.stringify(this.registerForm.value);

      this.http.post(registerEndpoint, body, { headers }).subscribe(
        (response) => {
          // Handle successful registration, e.g., redirect to login page with success message
          console.log('Registration successful:', response);
        },
        (error) => {
          // Handle registration error, e.g., display error message
          console.error('Registration failed:', error);
        }
      );
    }
  }

  // Switch to the login form
  switchToLoginForm() {
    this.activeForm = 'login';
  }

  // Switch to the register form
  switchToRegisterForm() {
    this.activeForm = 'register';
  }
}
