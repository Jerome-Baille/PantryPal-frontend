import { Component, EventEmitter, Output, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchService } from '../services/search.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-out', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class SearchComponent implements OnInit, OnDestroy {
  @Output() onSearch = new EventEmitter<string>();
  @Output() afterSearch = new EventEmitter<void>();
  @ViewChild('searchInput', { static: true }) searchInput!: ElementRef;
  
  searchForm: FormGroup;
  dropdownResults: any[] = [];
  isLoading = false;
  showDropdown = false;
  showNoResults = false;
  selectedIndex = -1;
  // Prevent reopening dropdown immediately after user manually closes it
  private manuallyClosed = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private searchService: SearchService,
    private router: Router
  ) {
    this.searchForm = this.formBuilder.group({
      search: ['']
    });
  }

  ngOnInit() {
    // Subscribe to dropdown results
    this.subscriptions.push(
      this.searchService.dropdownResults$.subscribe(results => {
        this.dropdownResults = results;
        this.updateDropdownVisibility();
      })
    );

    // Subscribe to loading state
    this.subscriptions.push(
      this.searchService.isLoading$.subscribe(loading => {
        this.isLoading = loading;
        this.updateDropdownVisibility();
      })
    );

    // Listen to input changes for dropdown search
    this.subscriptions.push(
      this.searchForm.get('search')!.valueChanges.subscribe(value => {
        if (value && value.length > 0) {
          // User is typing again; allow dropdown to show
          this.manuallyClosed = false;
          this.searchService.searchForDropdown(value);
          this.selectedIndex = -1;
        } else {
          this.hideDropdown();
        }
      })
    );
  }

  private updateDropdownVisibility() {
    const searchValue = this.searchForm.get('search')?.value;
    const hasSearchValue = searchValue && searchValue.length > 0;
    
    if (hasSearchValue && !this.manuallyClosed) {
      if (this.isLoading) {
        // Show loading state
        this.showDropdown = true;
        this.showNoResults = false;
      } else if (this.dropdownResults.length > 0) {
        // Show results
        this.showDropdown = true;
        this.showNoResults = false;
      } else {
        // Show no results message
        this.showDropdown = true;
        this.showNoResults = true;
      }
    } else {
      // No search value, hide everything
      this.showDropdown = false;
      this.showNoResults = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any) {
    const searchContainer = this.searchInput.nativeElement.closest('.search-container');
    if (!searchContainer || !searchContainer.contains(event.target)) {
      // Mark as manually closed to prevent immediate reopen from async updates
      this.manuallyClosed = true;
      this.hideDropdown();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.showDropdown) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.dropdownResults.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0) {
          this.selectRecipe(this.dropdownResults[this.selectedIndex]);
        } else {
          this.submitSearch();
        }
        break;
      case 'Escape':
        this.hideDropdown();
        break;
    }
  }

  onInputFocus() {
    const searchValue = this.searchForm.get('search')?.value;
    if (searchValue && searchValue.length > 0) {
      // User intends to interact again; allow dropdown to show
      this.manuallyClosed = false;
      // Re-trigger search or show existing results
      if (this.dropdownResults.length > 0) {
        this.updateDropdownVisibility();
      } else {
        this.searchService.searchForDropdown(searchValue);
      }
    }
  }

  selectRecipe(recipe: any) {
    this.hideDropdown();
    this.router.navigate(['/recipe/detail', recipe.id]);
    this.searchForm.get('search')?.setValue('');
    this.afterSearch.emit();
  }

  submitSearch() {
    const searchValue = this.searchForm.get('search')?.value;
    if (searchValue && searchValue.trim().length > 0) {
      this.onSearch.emit(searchValue);
      this.searchService.setSearchValue(searchValue);
      this.hideDropdown();
      this.searchForm.reset();
      this.afterSearch.emit();
    }
  }

  viewAllResults() {
    const searchValue = this.searchForm.get('search')?.value;
    if (searchValue) {
      this.submitSearch();
    }
  }

  private hideDropdown() {
    this.showDropdown = false;
    this.showNoResults = false;
    this.selectedIndex = -1;
    this.searchService.clearDropdownResults();
  }
}
