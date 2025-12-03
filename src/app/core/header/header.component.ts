import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { SearchService } from 'src/app/core/services/search.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { MatTooltip } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { SearchComponent } from '../../shared/components/search/search.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbar,
    MatButton,
    TranslateModule,
    MatTooltip,
    SearchComponent
],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
    private searchService = inject(SearchService);
    authService = inject(AuthService);
    private router = inject(Router);
    private snackbarService = inject(SnackbarService);
    private languageService = inject(LanguageService);
    private breakpointObserver = inject(BreakpointObserver);

    isDropdownMenuOpen = false;
    isMobile = false;
    isRecipeListRoute = false;
    private languageSubscription?: Subscription;
    private breakpointSubscription?: Subscription;
    currentLang: string;

    constructor() {
        this.currentLang = this.languageService.getCurrentLanguage();
    }

    ngOnInit() {
        this.languageSubscription = this.languageService.currentLanguage$.subscribe(
            lang => this.currentLang = lang
        );

        this.breakpointSubscription = this.breakpointObserver
            .observe([Breakpoints.HandsetPortrait])
            .subscribe(result => {
                this.isMobile = result.matches;
            });

        // Subscribe to router events to check current route
        this.router.events.subscribe(() => {
            this.isRecipeListRoute = this.router.url === '/recipe/list';
        });
    }

    ngOnDestroy() {
        if (this.languageSubscription) {
            this.languageSubscription.unsubscribe();
        }
        if (this.breakpointSubscription) {
            this.breakpointSubscription.unsubscribe();
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
                this.router.navigate(['/auth/login']);
            },
            error: (error) => {
                this.snackbarService.showError('An error occurred while logging out.');
                console.error('Logout failed:', error);
            }
        });
    }
}