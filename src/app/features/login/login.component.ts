import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { environment } from 'src/environments/environment';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { LanguageService } from 'src/app/core/services/language.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [MatCardModule, MatButtonModule, RouterLink, TranslateModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
    authService = inject(AuthService);
    private router = inject(Router);
    private languageService = inject(LanguageService);

    private languageSubscription?: Subscription;
    currentLang: string;
    isDev = !environment.production;

    constructor() {
        const languageService = this.languageService;

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