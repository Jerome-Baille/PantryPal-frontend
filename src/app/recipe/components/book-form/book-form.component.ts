import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BookService } from 'src/app/services/book.service';

@Component({
  selector: 'app-book-form',
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.scss']
})
export class BookFormComponent {
  @Input() recipeForm!: FormGroup;
  @Output() bookSelected = new EventEmitter<any>();
  books: any[] = [];

  constructor(
    private bookService: BookService
  ) { }

  ngOnInit() {
    // Fetch list of existing books from service or API
    this.bookService.getBooks().subscribe((books: any[]) => {
      this.books = books;
    });

    // Add form groups and controls for existing book selection and new book addition
    this.recipeForm.addControl('bookSelection', new FormControl('existing', Validators.required));
    this.recipeForm.addControl('existingBook', new FormGroup({
      'bookId': new FormControl('', Validators.required)
    }));
    this.recipeForm.addControl('newBook', new FormGroup({
      'title': new FormControl('', Validators.required),
      'author': new FormControl('', Validators.required)
    }));
  }

  // onBookSelected() {
  //   const bookSelection = this.recipeForm.get('bookSelection')!.value;
  //   if (bookSelection === 'existing') {
  //     const bookId = this.recipeForm.get('existingBook.bookId')!.value;
  //     const selectedBook = this.books.find(book => book.id === bookId);
  //     this.bookSelected.emit(selectedBook);
  //     console.log(selectedBook);
  //   } else {
  //     const newBook = this.recipeForm.get('newBook')!.value;
  //     this.bookSelected.emit(newBook);
  //     console.log(newBook);
  //   }
  // }

  onBookSelectionChange() {
    const bookSelection = this.recipeForm.get('bookSelection')?.value;
    if (bookSelection === 'existing') {
      const bookId = this.recipeForm.get('existingBook.bookId')?.value;
      const selectedBook = this.books.find(book => book.id === bookId);
      if (selectedBook) {
        this.bookSelected.emit(selectedBook);
      }
    } else if (bookSelection === 'new') {
      const title = this.recipeForm.get('newBook.title')?.value;
      const author = this.recipeForm.get('newBook.author')?.value;

      if (title && author) {
        const newBook = { title, author };
        this.bookSelected.emit(newBook);
      }
    }
  }
}