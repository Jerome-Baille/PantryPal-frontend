import { Injectable, signal } from '@angular/core';
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
  private filters = new BehaviorSubject<FilterOptions>({});

  // Observable for component communication
  activeFilters = this.filters.asObservable();

  // Signal for visibility
  filtersVisible = signal(false);

  applyFilters(filters: FilterOptions): void {
    this.filters.next(filters);
  }

  resetFilters(): void {
    this.filters.next({});
  }

  getFilters(): FilterOptions {
    return this.filters.getValue();
  }

  toggleFiltersVisibility(): void {
    this.filtersVisible.update(v => !v);
  }
}
