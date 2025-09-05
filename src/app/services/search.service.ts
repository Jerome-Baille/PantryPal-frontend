import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter, catchError } from 'rxjs/operators';
import { RecipeService } from './recipe.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchValueSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  searchValue$ = this.searchValueSubject.asObservable();

  private searchInputSubject = new Subject<string>();
  private dropdownResultsSubject = new BehaviorSubject<any[]>([]);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  dropdownResults$ = this.dropdownResultsSubject.asObservable();
  isLoading$ = this.isLoadingSubject.asObservable();

  constructor(private recipeService: RecipeService) {
    // Set up debounced search for dropdown
    this.searchInputSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(term => term.length > 0),
      switchMap(term => {
        this.isLoadingSubject.next(true);
        return this.recipeService.searchRecipesForDropdown(term).pipe(
          catchError(error => {
            console.error('Search error:', error);
            return of([]); // Return empty array on error
          })
        );
      })
    ).subscribe({
      next: (results) => {
        this.dropdownResultsSubject.next(results);
        this.isLoadingSubject.next(false);
      },
      error: (error) => {
        console.error('Search subscription error:', error);
        this.dropdownResultsSubject.next([]);
        this.isLoadingSubject.next(false);
      }
    });
  }

  setSearchValue(searchValue: string) {
    this.searchValueSubject.next(searchValue);
  }

  getSearchValue(): string {
    return this.searchValueSubject.getValue();
  }

  searchForDropdown(term: string) {
    if (term.trim().length === 0) {
      this.dropdownResultsSubject.next([]);
      this.isLoadingSubject.next(false);
      return;
    }
    
    this.isLoadingSubject.next(true);
    this.searchInputSubject.next(term.trim());
  }

  clearDropdownResults() {
    this.dropdownResultsSubject.next([]);
    this.isLoadingSubject.next(false);
  }
}