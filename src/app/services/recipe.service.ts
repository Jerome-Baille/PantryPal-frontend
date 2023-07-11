import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../config/api-endpoints';
import { Observable } from 'rxjs';

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface Recipe {
  title: string;
  instructions: string;
  preparationTime: number;
  preparationUnit: string;
  cookingTime: number;
  cookingUnit: string;
  fridgeTime: number;
  fridgeUnit: string;
  waitingTime: number;
  waitingUnit: string;
}

interface Book {
  title: string;
  author: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  constructor(
    private http: HttpClient
  ) { }

  createRecipe(book: Book, recipe: Recipe, ingredients: Ingredient[]) {
    // Create the book
    this.http.post(API_ENDPOINTS.books, { title: book.title, author: book.author })
      .subscribe({
        next: (bookResponse: any) => {
          const bookId = bookResponse.id;

          // Create the recipe
          this.http.post(API_ENDPOINTS.recipes, {
            title: recipe.title,
            instructions: recipe.instructions,
            preparationTime: recipe.preparationTime,
            preparationUnit: recipe.preparationUnit,
            cookingTime: recipe.cookingTime,
            cookingUnit: recipe.cookingUnit,
            fridgeTime: recipe.fridgeTime,
            fridgeUnit: recipe.fridgeUnit,
            waitingTime: recipe.waitingTime,
            waitingUnit: recipe.waitingUnit,
            bookId: bookId
          })
            .subscribe({
              next: (recipeResponse: any) => {
                const recipeId = recipeResponse.id;

                // Create the ingredients
                for (const ingredient of ingredients) {
                  this.http.post(API_ENDPOINTS.ingredients, {
                    name: ingredient.name,
                    quantity: ingredient.quantity,
                    unit: ingredient.unit,
                    recipeId: recipeId
                  })
                    .subscribe({
                      next: (ingredientResponse: any) => {
                        console.log("The ingredient has been created: " + ingredientResponse);
                      },
                      error: (error) => {
                        // Handle error
                        console.error("The ingredient has not been created: " + error);
                      }
                    });
                }
              },
              error: (error) => {
                // Handle error
                console.error("The recipe has not been created: " + error);
              }

            })
        },
        error: (error) => {
          // Handle error
          console.error("The book has not been created: " + error);
        }
      })
  }

  addIngredient(recipeId: number, ingredient: Ingredient): Observable<any> {
    return this.http.post(API_ENDPOINTS.ingredients, {
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      recipeId: recipeId
    });
  }

  getRecipes(): Observable<any> {
    return this.http.get<any[]>(API_ENDPOINTS.recipes);
  }

  getRecipe(id: number): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.recipes}/${id}`);
  }

  updateBook(id: number, title: string, author: string): Observable<any> {
    return this.http.put(`${API_ENDPOINTS.books}/${id}`, { title: title, author: author });
  }

  updateIngredient(id: number, ingredient: Ingredient): Observable<any> {
    return this.http.put(`${API_ENDPOINTS.ingredients}/${id}`, ingredient);
  }

  updateRecipe(id: number, recipe: Recipe): Observable<any> {
    return this.http.put(`${API_ENDPOINTS.recipes}/${id}`, recipe);
  }

  deleteRecipe(id: number): Observable<any> {
    return this.http.delete(`${API_ENDPOINTS.recipes}/${id}`);
  }

  deleteIngredient(id: number): Observable<any> {
    return this.http.delete(`${API_ENDPOINTS.ingredients}/${id}`);
  }
}