import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, MatCardModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
    activeForm: 'login' | 'register' = 'login';
    loginForm: FormGroup;
    registerForm: FormGroup;
    isLogged: boolean = false;
    private authSubscription?: Subscription;

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', Validators.required]
        });

        this.registerForm = this.formBuilder.group({
            username: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]]
        });
    }

    ngOnInit() {
        this.authSubscription = this.authService.isLoggedIn().subscribe(
            isLoggedIn => {
                this.isLogged = isLoggedIn;
                if (isLoggedIn) {
                    this.router.navigate(['/recipe/list']);
                }
            }
        );
    }

    ngOnDestroy() {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
    }

    onLoginSubmit() {
        if (this.loginForm.valid) {
            const { username, password } = this.loginForm.value;
            this.authService.login(username, password).subscribe({
                next: () => {
                    this.router.navigate(['/recipe/list']);
                },
                error: (error) => {
                    console.error('Login failed:', error);
                }
            });
        }
    }

    onRegisterSubmit() {
        if (this.registerForm.valid) {
            const { username, email, password } = this.registerForm.value;
            this.authService.register(username, email, password).subscribe({
                next: () => {
                    this.switchToLoginForm();
                },
                error: (error) => {
                    console.error('Registration failed:', error);
                }
            });
        }
    }

    onLogout() {
        this.authService.logout().subscribe({
            next: () => {
                this.router.navigate(['/auth/login']);
            },
            error: (error) => {
                console.error('Logout failed:', error);
            }
        });
    }

    switchToLoginForm() {
        this.activeForm = 'login';
    }

    switchToRegisterForm() {
        this.activeForm = 'register';
    }
}