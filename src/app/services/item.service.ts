import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private http = inject(HttpClient);

  private itemsURL = environment.itemsURL;

  updateRecipeIngredient(id: number, ingredient: { quantity?: number; unit?: string; recipeSectionId?: number | null; displayOrder?: number }) {
    return this.http.put(`${this.itemsURL}/recipeIngredients/${id}`, ingredient, { withCredentials: true });
  }

  createRecipeIngredient(ingredient: { name?: string; quantity?: number; unit?: string; recipeSectionId?: number | null }) { // new method
    return this.http.post(`${this.itemsURL}/recipeIngredients`, ingredient, { withCredentials: true });
  }

  getRecipeIngredientsByRecipeId(recipeId: number): Observable<{ id?: number; Ingredient: { id: number; name: string }; quantity: number; unit?: string; RecipeSection?: { id: number }; recipeSectionId?: number | null; displayOrder?: number }[]> {
    return this.http.get<{ id?: number; Ingredient: { id: number; name: string }; quantity: number; unit?: string; RecipeSection?: { id: number }; recipeSectionId?: number | null; displayOrder?: number }[]>(`${this.itemsURL}/recipeIngredients/recipe/${recipeId}`, { withCredentials: true });
  }

  deleteRecipeIngredient(id: number) {
    return this.http.delete(`${this.itemsURL}/recipeIngredients/${id}`, { withCredentials: true });
  }

  updateRecipeSection(id: number, section: { name?: string; displayOrder?: number }) {
    return this.http.put(`${this.itemsURL}/recipeSections/${id}`, section, { withCredentials: true });
  }

  createRecipeSection(section: { name: string; displayOrder?: number; recipeId: number }) { // new method
    return this.http.post(`${this.itemsURL}/recipeSections`, section, { withCredentials: true });
  }

  getRecipeSectionsByRecipeId(recipeId: number): Observable<{ id: number; name: string; displayOrder?: number }[]> {
    return this.http.get<{ id: number; name: string; displayOrder?: number }[]>(`${this.itemsURL}/recipeSections/recipe/${recipeId}`, { withCredentials: true });
  }

  updateRecipeTimer(id: number, timer: { name?: string; timeInSeconds?: number }) {
    return this.http.put(`${this.itemsURL}/timers/${id}`, timer, { withCredentials: true });
  }

  createTimer(timer: { name: string; timeInSeconds: number; recipeId?: number }) { // new method
    return this.http.post(`${this.itemsURL}/timers`, timer, { withCredentials: true });
  }

  deleteTimer(id: number) {
    return this.http.delete(`${this.itemsURL}/timers/${id}`, { withCredentials: true });
  }
}
