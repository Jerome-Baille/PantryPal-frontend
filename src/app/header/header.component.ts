import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth.service';
import { SearchService } from 'src/app/services/search.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatToolbarModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        FontAwesomeModule,
        MatInputModule
    ],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
    faMagnifyingGlass = faMagnifyingGlass;
    isDropdownMenuOpen = false;
    searchForm: FormGroup;
    isLogged: boolean = false;
    private authSubscription?: Subscription;

    constructor(
        private formBuilder: FormBuilder,
        private searchService: SearchService,
        private authService: AuthService,
        private router: Router,
        private snackbarService: SnackbarService
    ) {
        this.searchForm = this.formBuilder.group({
            search: ['']
        });
    }

    ngOnInit() {
        this.authSubscription = this.authService.isLoggedIn().subscribe(
            isLoggedIn => this.isLogged = isLoggedIn
        );
    }

    ngOnDestroy() {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
    }

    toggleDropdownMenu() {
        this.isDropdownMenuOpen = !this.isDropdownMenuOpen;
    }

    submitSearch(deviceSize: string) {
        const searchValue = this.searchForm.get('search')?.value;
        const targetUrl = '/recipe/list';

        if (!this.router.url.includes(targetUrl)) {
            this.router.navigate([targetUrl]);
        }

        this.searchService.setSearchValue(searchValue);
        this.searchForm.reset();

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