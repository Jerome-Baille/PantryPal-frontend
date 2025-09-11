import { Injectable } from '@angular/core';
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
  
  constructor() {}
  
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
