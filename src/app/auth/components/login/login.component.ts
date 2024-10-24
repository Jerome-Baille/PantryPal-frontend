import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  }

  onLoginSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.router.navigate(['/recipe/list']);
        },
        error: (error) => {
          // Handle login error, e.g., display error message
          console.error('Login failed:', error);
        }
      });
    }
  }

  onRegisterSubmit() {
    if (this.registerForm.valid) {
      const { username, email, password } = this.registerForm.value;
      this.authService.register(username, email, password).subscribe({
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