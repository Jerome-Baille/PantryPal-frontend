import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from 'src/app/models/book.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private booksURL = environment.booksURL;

  constructor(
    private http: HttpClient
  ) { }

  createBook(book: Book): Observable<Book> {
    return this.http.post<Book>(`${this.booksURL}`, { title: book.title, author: book.author }, { withCredentials: true });
  }

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.booksURL}`, { withCredentials: true });
  }

  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.booksURL}/${id}`, { withCredentials: true });
  }

  updateBook(id: number, title: string, author: string): Observable<any> {
    return this.http.put(`${this.booksURL}/${id}`, { title: title, author: author }, { withCredentials: true });
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.booksURL}/${id}`, { withCredentials: true });
  }
}