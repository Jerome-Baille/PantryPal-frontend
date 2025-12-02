import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, signal, effect, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { BookService } from 'src/app/services/book.service';
import { IngredientService } from 'src/app/services/ingredient.service';
import { LanguageService } from 'src/app/services/language.service';
import { FilterService } from 'src/app/services/filter.service';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAccordion,
    MatButtonModule,
    MatInputModule,
    MatListModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatChipsModule,
    TranslateModule
  ],
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
})
export class FiltersComponent implements OnInit, OnDestroy {
  @ViewChild('bookList') bookList: MatSelectionList | undefined;
  @ViewChild('ingredientList') ingredientList: MatSelectionList | undefined;
  @ViewChild('typeOfMealList') typeOfMealList!: MatSelectionList;

  @ViewChild(MatAccordion) accordion!: MatAccordion;

  // Services
  private filterService = inject(FilterService);
  private bookService = inject(BookService);
  private ingredientService = inject(IngredientService);
  private languageService = inject(LanguageService);

  // Signals
  visible = this.filterService.filtersVisible;
  books = signal<{ id: string; title: string; author: string }[]>([]);
  ingredients = signal<string[]>([]);
  dataLoaded = signal(false);

  bookControl = new FormControl();
  ingredientControl = new FormControl();
  typeOfMealControl = new FormControl();

  filteredBooks!: Observable<{ id: string; title: string }[]>;
  filteredIngredients!: Observable<string[]>;

  typeOfMeals: { name: string; value: string }[] = [
    { name: 'Starter', value: 'starter' },
    { name: 'Main Course', value: 'main-course' },
    { name: 'Dessert', value: 'dessert' }
  ];

  selectedBooks: Set<string> = new Set<string>();
  selectedIngredients: Set<string> = new Set<string>();
  selectedTypeOfMeals: string[] = [];

  private languageSubscription?: Subscription;
  currentLang: string;

  constructor() {
    this.currentLang = this.languageService.getCurrentLanguage();

    // Effect to load data when filter becomes visible
    effect(() => {
      if (this.visible()) {
        this.loadDataIfNeeded();
      }
    });
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

    this.languageSubscription = this.languageService.currentLanguage$.subscribe(
      lang => this.currentLang = lang
    );
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  loadDataIfNeeded(): void {
    if (!this.dataLoaded()) {
      this.getBooks();
      this.getIngredients();
      this.dataLoaded.set(true);
    }
  }

  private _filterBooks(value: string): { id: string; title: string }[] {
    const filterValue = value.toLowerCase();
    return this.books().filter(
      book =>
        book.title.toLowerCase().includes(filterValue) ||
        book.author.toLowerCase().includes(filterValue)
    ).map(book => ({ id: book.id, title: book.title }));
  }

  private _filterIngredients(value: string): string[] {
    const filterIngredientValue = value.toLowerCase();

    return this.ingredients().filter(
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

  toggleTypeOfMealSelection(typeOfMeals: string) {
    const index = this.selectedTypeOfMeals.indexOf(typeOfMeals);
    if (index !== -1) {
      this.selectedTypeOfMeals.splice(index, 1);
    } else {
      this.selectedTypeOfMeals.push(typeOfMeals);
    }
  }

  applyFilters() {
    const selectedBookIds = Array.from(this.selectedBooks).join(',');
    const selectedIngredientIds = Array.from(this.selectedIngredients).join(',');
    const selectedTypeOfMeals = this.selectedTypeOfMeals.join(',');

    this.filterService.applyFilters({
      bookIds: selectedBookIds || undefined,
      ingredientNames: selectedIngredientIds || undefined,
      typeOfMeals: selectedTypeOfMeals || undefined
    });

    // reset the form
    this.bookControl.setValue('');
    this.selectedBooks.clear();

    this.ingredientControl.setValue('');
    this.selectedIngredients.clear();

    this.typeOfMealControl.setValue('');
    this.selectedTypeOfMeals = [];

    // Uncheck the selected mat-list-option elements
    if (this.bookList) {
      this.bookList.deselectAll();
    }

    if (this.ingredientList) {
      this.ingredientList.deselectAll();
    }

    if (this.typeOfMealList) {
      this.typeOfMealList.deselectAll();
    }

    // hide the filters
    this.dismissFilters();
  }

  getBooks(): void {
    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books.set(books);
      },
      error: (error) => {
        console.error(error);
        this.books.set([]);
      }
    });
  }

  getIngredients(): void {
    this.ingredientService.getSetOfIngredients().subscribe({
      next: (ingredients) => {
        this.ingredients.set(ingredients);
      },
      error: (error) => {
        console.error(error);
        this.ingredients.set([]);
      }
    })
  }

  getSelectedBooks(): string[] {
    // Map the selected book ids to their corresponding titles
    return Array.from(this.selectedBooks).map(id => {
      const book = this.books().find(b => b.id === id);
      return book ? book.title : '';
    });
  }

  getSelectedIngredients(): string[] {
    // Convert the selectedIngredients Set to an array
    return Array.from(this.selectedIngredients);
  }

  getSelectedTypeOfMeals(): string[] {
    // Return the selectedTypeOfMeal array directly
    return this.selectedTypeOfMeals;
  }

  dismissFilters() {
    this.filterService.toggleFiltersVisibility();
  }

  clearFilters() {
    this.bookControl.setValue('');
    this.selectedBooks.clear();

    this.ingredientControl.setValue('');
    this.selectedIngredients.clear();

    this.typeOfMealControl.setValue('');
    this.selectedTypeOfMeals = [];

    // Uncheck the selected mat-list-option elements
    if (this.bookList) {
      this.bookList.deselectAll();
    }

    if (this.ingredientList) {
      this.ingredientList.deselectAll();
    }

    if (this.typeOfMealList) {
      this.typeOfMealList.deselectAll();
    }
  }
}