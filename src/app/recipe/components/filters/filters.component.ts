import { Component, EventEmitter, OnInit, Output, Input, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { BookService } from 'src/app/services/book.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {
  @Output() bookSelected = new EventEmitter<string>();
  @Input() visible: boolean = false;
  @Output() dismissFiltersEvent = new EventEmitter<boolean>();

  @ViewChild('bookList') bookList: any;

  bookControl = new FormControl();
  filteredBooks!: Observable<any[]>;
  books: any[] = [];
  selectedBooks: Set<string> = new Set<string>();

  constructor(private bookService: BookService) {
    this.getBooks();
  }

  ngOnInit(): void {
    this.filteredBooks = this.bookControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterBooks(value || ''))
    );
  }

  private _filterBooks(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.books.filter(
      book =>
        book.title.toLowerCase().includes(filterValue) ||
        book.author.toLowerCase().includes(filterValue)
    );
  }

  toggleSelection(bookId: string) {
    if (this.selectedBooks.has(bookId)) {
      this.selectedBooks.delete(bookId);
    } else {
      this.selectedBooks.add(bookId);
    }
  }

  applyFilters() {
    const selectedBookIds = Array.from(this.selectedBooks).join(',');
    this.bookSelected.emit(selectedBookIds);

    // reset the form
    this.bookControl.setValue('');
    this.selectedBooks.clear();

    // Uncheck the selected mat-list-option elements
    if (this.bookList) {
      this.bookList.deselectAll();
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

  dismissFilters() {
    this.visible = !this.visible;
    this.dismissFiltersEvent.emit(this.visible);
  }
}