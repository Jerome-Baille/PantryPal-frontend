import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from '../../../shared/cookie.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent {
  activeForm: 'login' | 'register' = 'login'; // Tracks the active form (login or register)

  loginForm: FormGroup;
  registerForm: FormGroup;
  isLogged: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private cookieService: CookieService,
    private authService: AuthService,
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

    // Check if user is logged in
    const userIdCookie = this.cookieService.getCookie('PPuserId');
    if (userIdCookie) {
      this.isLogged = true;
    }
  }

  onLoginSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.cookieService.setCookie('PPaccessToken', response.accessToken, response.accessTokenExpireDate);
          this.cookieService.setCookie('PPrefreshToken', response.refreshToken, response.refreshTokenExpireDate);
          this.cookieService.setCookie('PPuserId', response.userId, response.userIdExpireDate);
          this.isLogged = true;
        },
        error: (error) => {
          // Handle login error, e.g., display error message
          console.error('Login failed:', error);
        },
        complete: () => {
          // Handle successful login, e.g., redirect to dashboard
          this.router.navigate(['/recipe/list']);
        }
      });
    }
  }

  onRegisterSubmit() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          // Handle successful registration, e.g., redirect to login page with success message
          console.log('Registration successful:', response);
        },
        error: (error) => {
          // Handle registration error, e.g., display error message
          console.error('Registration failed:', error);
        }
      })
    }
  }

  onLogout() {
    this.authService.logout();
    this.isLogged = false;
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