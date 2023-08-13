import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../config/api-endpoints';
import { Observable } from 'rxjs';
import { Book } from 'src/app/models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  constructor(
    private http: HttpClient
  ) { }

  createBook(book: Book): Observable<Book> {
    return this.http.post<Book>(API_ENDPOINTS.books, { title: book.title, author: book.author });
  }

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(API_ENDPOINTS.books);
  }

  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${API_ENDPOINTS.books}/${id}`);
  }

  updateBook(id: number, title: string, author: string): Observable<any> {
    return this.http.put(`${API_ENDPOINTS.books}/${id}`, { title: title, author: author });
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINTS.books}/${id}`);
  }
}