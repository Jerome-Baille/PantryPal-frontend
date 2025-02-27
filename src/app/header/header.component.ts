import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SearchService } from 'src/app/services/search.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { SearchComponent } from '../search/search.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        RouterLinkActive,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatInputModule,
        TranslateModule,
        SearchComponent
    ],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
    isDropdownMenuOpen = false;
    isMobile: boolean = false;
    isRecipeListRoute: boolean = false;
    private languageSubscription?: Subscription;
    private breakpointSubscription?: Subscription;
    currentLang: string;

    constructor(
        private searchService: SearchService,
        public authService: AuthService,
        private router: Router,
        private snackbarService: SnackbarService,
        private languageService: LanguageService,
        private breakpointObserver: BreakpointObserver
    ) {
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