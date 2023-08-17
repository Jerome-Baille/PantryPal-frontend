import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

import { SearchService } from 'src/app/services/search.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
    faMagnifyingGlass = faMagnifyingGlass;
    isDropdownMenuOpen = false;
    searchForm: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private searchService: SearchService,
        private router: Router
    ) {
        this.searchForm = this.formBuilder.group({
            search: ['']
        });
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
}