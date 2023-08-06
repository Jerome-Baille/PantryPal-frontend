import { Component, EventEmitter, OnInit, Output, Input, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { BookService } from 'src/app/services/book.service';
import { IngredientService } from 'src/app/services/ingredient.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {
  @Output() filtersSelected = new EventEmitter<{ bookIds?: string, ingredientNames?: string }>();
  @Input() visible: boolean = false;
  @Output() dismissFiltersEvent = new EventEmitter<boolean>();

  @ViewChild('bookList') bookList: any;
  @ViewChild('ingredientList') ingredientList: any;

  bookControl = new FormControl();
  ingredientControl = new FormControl();

  filteredBooks!: Observable<any[]>;
  filteredIngredients!: Observable<any[]>;

  books: any[] = [];
  ingredients: any[] = [];

  selectedBooks: Set<string> = new Set<string>();
  selectedIngredients: Set<string> = new Set<string>();

  constructor(
    private bookService: BookService,
    private ingredientService: IngredientService
  ) {
    this.getBooks();
    this.getIngredients();
  }

  ngOnInit(): void {
    this.filteredBooks = this.bookControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterBooks(value || ''))
    );

    this.filteredIngredients = this.ingredientControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterIngredients(value || ''))
    );
  }

  private _filterBooks(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.books.filter(
      book =>
        book.title.toLowerCase().includes(filterValue) ||
        book.author.toLowerCase().includes(filterValue)
    ).map(book => ({ id: book.id, title: book.title }));
  }


  private _filterIngredients(value: string): any {
    const filterIngredientValue = value.toLowerCase();

    return this.ingredients.filter(
      ingredient =>
        ingredient.toLowerCase().includes(filterIngredientValue)
    );
  }

  toggleSelection(bookId: string) {
    if (this.selectedBooks.has(bookId)) {
      this.selectedBooks.delete(bookId);
    } else {
      this.selectedBooks.add(bookId);
    }
  }

  toggleIngredientSelection(ingredientId: string) {
    if (this.selectedIngredients.has(ingredientId)) {
      this.selectedIngredients.delete(ingredientId);
    } else {
      this.selectedIngredients.add(ingredientId);
    }
  }

  applyFilters() {
    const selectedBookIds = Array.from(this.selectedBooks).join(',');
    const selectedIngredientIds = Array.from(this.selectedIngredients).join(',');

    this.filtersSelected.emit({
      bookIds: selectedBookIds || undefined,
      ingredientNames: selectedIngredientIds || undefined
    });

    // reset the form
    this.bookControl.setValue('');
    this.selectedBooks.clear();
    this.ingredientControl.setValue('');
    this.selectedIngredients.clear();

    // Uncheck the selected mat-list-option elements
    if (this.bookList) {
      this.bookList.deselectAll();
    }

    if (this.ingredientList) {
      this.ingredientList.deselectAll();
    }

    // hide the filters
    this.dismissFilters();
  }

  getBooks(): void {
    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books = books;
      },
      error: (error) => {
        console.error(error);
        this.books = [];
      }
    });
  }

  getIngredients(): void {
    this.ingredientService.getSetOfIngredients().subscribe({
      next: (ingredients) => {
        this.ingredients = ingredients;
      },
      error: (error) => {
        console.error(error);
        this.ingredients = [];
      }
    })
  }

  getSelectedBooks(): any[] {
    // Map the selected book ids to their corresponding titles
    return Array.from(this.selectedBooks).map(id => {
      const book = this.books.find(book => book.id === id);
      return book ? book.title : '';
    });
  }

  getSelectedIngredients(): any[] {
    // Convert the selectedIngredients Set to an array
    return Array.from(this.selectedIngredients);
  }

  dismissFilters() {
    this.visible = !this.visible;
    this.dismissFiltersEvent.emit(this.visible);
  }

  clearFilters() {
    this.bookControl.setValue('');
    this.selectedBooks.clear();
    this.ingredientControl.setValue('');
    this.selectedIngredients.clear();

    // Uncheck the selected mat-list-option elements
    if (this.bookList) {
      this.bookList.deselectAll();
    }

    if (this.ingredientList) {
      this.ingredientList.deselectAll();
    }
  }
}