import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    faMagnifyingGlass = faMagnifyingGlass;
    isDropdownMenuOpen = false;
    searchForm: FormGroup;
    isLogged: boolean = false;

    constructor(
        private formBuilder: FormBuilder,
        private searchService: SearchService,
        private authService: AuthService,
        private router: Router
    ) {
        this.searchForm = this.formBuilder.group({
            search: ['']
        });
    }

    ngOnInit() {
        this.isLogged = this.authService.isLoggedIn();
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
                this.isLogged = false;
                this.router.navigate(['/auth/login']);
            },
            error: (error) => {
                console.error('Logout failed:', error);
            }
        });
    }
}