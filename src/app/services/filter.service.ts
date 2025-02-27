import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FilterOptions {
  bookIds?: string;
  ingredientNames?: string;
  typeOfMeals?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  // Signals for reactive state
  filtersVisible = signal(false);
  private filters = new BehaviorSubject<FilterOptions>({});
  
  // Observable for component communication
  activeFilters = this.filters.asObservable();
  
  constructor() {}
  
  toggleFiltersVisibility(): void {
    this.filtersVisible.update(value => !value);
  }
  
  applyFilters(filters: FilterOptions): void {
    this.filters.next(filters);
  }
  
  resetFilters(): void {
    this.filters.next({});
  }
  
  getFilters(): FilterOptions {
    return this.filters.getValue();
  }
}
