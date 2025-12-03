import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from 'src/app/shared/models/book.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private http = inject(HttpClient);

  private booksURL = environment.booksURL;

  createBook(book: Book): Observable<Book> {
    return this.http.post<Book>(`${this.booksURL}`, { title: book.title, author: book.author }, { withCredentials: true });
  }

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.booksURL}`, { withCredentials: true });
  }

  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.booksURL}/${id}`, { withCredentials: true });
  }

  updateBook(id: number, title: string, author: string): Observable<Book> {
    return this.http.put<Book>(`${this.booksURL}/${id}`, { title: title, author: author }, { withCredentials: true });
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.booksURL}/${id}`, { withCredentials: true });
  }
}