import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BookService } from 'src/app/services/book.service';
import { Book as BookModel } from 'src/app/models/book.model';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatInputModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule
  ],
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.scss'],
})
export class BookFormComponent implements OnInit {
  @Input() recipeForm!: FormGroup;
  @Output() bookSelected = new EventEmitter<BookModel>();

  bookForm: FormGroup;
  bookList: BookModel[] = [];

  constructor(
    private bookService: BookService,
    private fb: FormBuilder
  ) {
    this.bookForm = this.fb.group({
      bookSelection: new FormControl('existing', Validators.required),
      id: new FormControl(''),
      title: new FormControl(''),
      author: new FormControl('')
    });
  }

  ngOnInit() {
    this.fetchExistingBooks();
  }

  private fetchExistingBooks() {
    this.bookService.getBooks().subscribe((books: BookModel[]) => {
      this.bookList = books;

      const selectedBook = this.recipeForm.get('Book')?.value;
      if (selectedBook) {
        this.bookForm.patchValue(selectedBook);
      }
    });
  }

  onBookSelectionChange() {
    const bookSelection = this.bookForm.get('bookSelection')?.value;

    if (bookSelection === 'existing') {
      const bookId = this.bookForm.get('id')?.value;
      const selectedBook = this.bookList.find(book => book.id === bookId);

      if (selectedBook) {
        this.bookSelected.emit(selectedBook);
      }
    } else if (bookSelection === 'new') {
      if (this.bookForm.valid) {
        const { title, author } = this.bookForm.value;
        this.bookSelected.emit({ title, author });
      }
    }
  }
}
