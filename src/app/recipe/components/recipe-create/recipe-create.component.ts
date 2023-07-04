import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from '../../../shared/cookie.service';

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

@Component({
  selector: 'app-recipe-create',
  templateUrl: './recipe-create.component.html',
  styleUrls: ['./recipe-create.component.scss']
})
export class RecipeCreateComponent {
  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) { }

  ingredients: Ingredient[] = [];
  recipe: Recipe = { title: '', instructions: '', preparationTime: 0, preparationUnit: '', cookingTime: 0, cookingUnit: '', fridgeTime: 0, fridgeUnit: '', waitingTime: 0, waitingUnit: '' };
  book: Book = { title: '', author: '' };

  addIngredient() {
    this.ingredients.push({ name: '', quantity: 0, unit: '' });
  }

  removeIngredient(ingredient: Ingredient) {
    const index = this.ingredients.indexOf(ingredient);
    if (index >= 0) {
      this.ingredients.splice(index, 1);
    }
  }

  submitForm() {
    // Get the token from cookies
    const token = this.cookieService.getCookie('PPaccessToken');

    // Set up the headers with the authorization token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    // Create the book
    this.http.post('http://localhost:3000/api/books', { title: this.book.title, author: this.book.author }, { headers })
      .subscribe({
        next: (bookResponse: any) => {
          const bookId = bookResponse.id;

          // Create the recipe
          this.http.post('http://localhost:3000/api/recipes', {
            title: this.recipe.title,
            instructions: this.recipe.instructions,
            preparationTime: this.recipe.preparationTime,
            preparationUnit: this.recipe.preparationUnit,
            cookingTime: this.recipe.cookingTime,
            cookingUnit: this.recipe.cookingUnit,
            fridgeTime: this.recipe.fridgeTime,
            fridgeUnit: this.recipe.fridgeUnit,
            waitingTime: this.recipe.waitingTime,
            waitingUnit: this.recipe.waitingUnit,
            bookId: bookId
          }, { headers })
            .subscribe({
              next: (recipeResponse: any) => {
                const recipeId = recipeResponse.id;

                // Create the ingredients
                for (const ingredient of this.ingredients) {
                  this.http.post('http://localhost:3000/api/ingredients', {
                    name: ingredient.name,
                    quantity: ingredient.quantity,
                    unit: ingredient.unit,
                    recipeId: recipeId
                  }, { headers })
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
        },
        complete: () => {
          this.resetForm();
        }
      })
  }

  resetForm() {
    // Reset the form values and any other necessary state variables
    this.book = {
      title: '',
      author: ''
    };

    this.recipe = {
      title: '',
      instructions: '',
      preparationTime: 0,
      preparationUnit: '',
      cookingTime: 0,
      cookingUnit: '',
      fridgeTime: 0,
      fridgeUnit: '',
      waitingTime: 0,
      waitingUnit: ''
    };

    this.ingredients = [];
  }

}