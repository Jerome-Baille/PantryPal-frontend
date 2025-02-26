import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { Recipe } from '../models/favorite.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private favoriteURL = environment.favoriteURL;

  constructor(
    private http: HttpClient
  ) { }

  createFavorite(favorite: any) {
    return this.http.post(`${this.favoriteURL}/add`, favorite, { withCredentials: true });
  }

  deleteFavorite(recipeId: number) {
    return this.http.delete(`${this.favoriteURL}/remove/${recipeId}`, { withCredentials: true });
  }

  getUsersFavorites(): Observable<any> {
    return this.http.get<any>(`${this.favoriteURL}/user`, { withCredentials: true });
  }
}
