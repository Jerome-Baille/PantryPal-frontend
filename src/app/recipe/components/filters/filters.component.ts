import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { BookService } from 'src/app/services/book.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {
  @Output() bookSelected = new EventEmitter<number>(); // Change event type to string

  bookControl = new FormControl();
  filteredBooks!: Observable<any[]>;
  books: any[] = [];

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
    return this.books.filter(book =>
      book.title.toLowerCase().includes(filterValue) ||
      book.author.toLowerCase().includes(filterValue)
    );
  }
  
  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    const selectedBookTitle = event.option.value;
    const selectedBookId = this.books.find(book => book.title === selectedBookTitle).id;
    this.bookSelected.emit(selectedBookId);
    this.bookControl.reset();
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
}
