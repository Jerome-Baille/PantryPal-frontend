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

    submitSearch() {
        const searchValue = this.searchForm.get('search')?.value;

        const currentUrl = this.router.url;
        const targetUrl = '/recipe/list';

        if (currentUrl.includes(targetUrl)) {
            this.searchService.setSearchValue(searchValue);
            this.searchForm.reset();
        } else {
            this.router.navigate([targetUrl]).then(() => {
                this.searchService.setSearchValue(searchValue);
                this.searchForm.reset();
            });
        }
    }

}