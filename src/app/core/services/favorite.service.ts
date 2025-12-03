import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

interface FavoriteResponse {
  recipes: { id: number; title: string }[];
  totalRecipes: number;
  currentPage: number;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private http = inject(HttpClient);

  private favoriteURL = environment.favoriteURL;

  createFavorite(favorite: { recipeId: number }) {
    return this.http.post(`${this.favoriteURL}/add`, favorite, { withCredentials: true });
  }

  deleteFavorite(recipeId: number) {
    return this.http.delete(`${this.favoriteURL}/remove/${recipeId}`, { withCredentials: true });
  }

  getUsersFavorites(): Observable<FavoriteResponse> {
    return this.http.get<FavoriteResponse>(`${this.favoriteURL}/user`, { withCredentials: true });
  }
}
