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
    private languageSubscription?: Subscription;
    currentLang: string;

    constructor(
        private formBuilder: FormBuilder,
        public authService: AuthService,
        private router: Router,
        private snackbarService: SnackbarService,
        private languageService: LanguageService
    ) {
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

    onLoginClick() {
        this.authService.login();
    }

    onRegisterClick() {
        this.authService.register();
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
}