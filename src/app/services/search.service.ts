import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchValueSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  searchValue$ = this.searchValueSubject.asObservable();

  setSearchValue(searchValue: string) {
    this.searchValueSubject.next(searchValue);
  }

  getSearchValue(): string {
    return this.searchValueSubject.getValue();
  }
}