import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { SnackbarService } from '../services/snackbar.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, MatCardModule, ReactiveFormsModule, TranslateModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
    activeForm: 'login' | 'register' = 'login';
    loginForm: FormGroup;
    registerForm: FormGroup;
    private languageSubscription?: Subscription;
    currentLang: string;

    constructor(
        private formBuilder: FormBuilder,
        public authService: AuthService,
        private router: Router,
        private snackbarService: SnackbarService,
        private languageService: LanguageService
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

        this.currentLang = languageService.getCurrentLanguage();
    }

    ngOnInit() {
        // Using signal directly through the authService
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/recipe/list']);
        }

        this.languageSubscription = this.languageService.currentLanguage$.subscribe(
            lang => this.currentLang = lang
        );
    }

    ngOnDestroy() {
        if (this.languageSubscription) {
            this.languageSubscription.unsubscribe();
        }
    }

    onLoginSubmit() {
        if (this.loginForm.valid) {
            const { username, password } = this.loginForm.value;
            this.authService.login(username, password).subscribe({
                next: () => {
                    this.snackbarService.showInfo('You have been logged in.');
                    setTimeout(() => this.router.navigate(['/recipe/list']), 100);
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