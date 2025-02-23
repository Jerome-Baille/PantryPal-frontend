import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass, faUser } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth.service';
import { SearchService } from 'src/app/services/search.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { SearchComponent } from '../search/search.component';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        FontAwesomeModule,
        MatInputModule,
        TranslateModule,
        SearchComponent
    ],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
    faMagnifyingGlass = faMagnifyingGlass;
    faUser = faUser;
    isDropdownMenuOpen = false;
    isLogged: boolean = false;
    private authSubscription?: Subscription;
    private languageSubscription?: Subscription;
    currentLang: string;

    constructor(
        private searchService: SearchService,
        private authService: AuthService,
        private router: Router,
        private snackbarService: SnackbarService,
        private languageService: LanguageService
    ) {
        this.currentLang = this.languageService.getCurrentLanguage();
    }

    ngOnInit() {
        this.authSubscription = this.authService.isLoggedIn().subscribe(
            isLoggedIn => this.isLogged = isLoggedIn
        );
        
        this.languageSubscription = this.languageService.currentLanguage$.subscribe(
            lang => this.currentLang = lang
        );
    }

    ngOnDestroy() {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
        if (this.languageSubscription) {
            this.languageSubscription.unsubscribe();
        }
    }

    toggleDropdownMenu() {
        this.isDropdownMenuOpen = !this.isDropdownMenuOpen;
    }

    handleSearch(searchValue: string, deviceSize: string) {
        const targetUrl = '/recipe/list';

        if (!this.router.url.includes(targetUrl)) {
            this.router.navigate([targetUrl]);
        }

        if (deviceSize === 'mobile') {
            this.toggleDropdownMenu();
        }
    }

    onLogout() {
        this.authService.logout().subscribe({
            next: () => {
                this.snackbarService.showInfo('You have been logged out.');
                this.isLogged = false;
                this.router.navigate(['/auth/login']);
            },
            error: (error) => {
                this.snackbarService.showError('An error occurred while logging out.');
                console.error('Logout failed:', error);
            }
        });
    }
}