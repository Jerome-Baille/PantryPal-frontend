import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SearchService } from '../services/search.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  @Output() onSearch = new EventEmitter<string>();
  @Output() afterSearch = new EventEmitter<void>();
  
  searchForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private searchService: SearchService
  ) {
    this.searchForm = this.formBuilder.group({
      search: ['']
    });
  }

  submitSearch() {
    const searchValue = this.searchForm.get('search')?.value;
    this.onSearch.emit(searchValue);
    this.searchService.setSearchValue(searchValue);
    this.searchForm.reset();
    this.afterSearch.emit();
  }
}
