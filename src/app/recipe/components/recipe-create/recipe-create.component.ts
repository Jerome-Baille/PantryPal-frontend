import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface Recipe {
  title: string;
  instructions: string;
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
  constructor(private http: HttpClient) { }

  ingredients: Ingredient[] = [];
  recipe: Recipe = { title: '', instructions: '' };
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
    // Create the book
    this.http.post('http://localhost:3000/api/books', { title: this.book.title, author: this.book.author })
      .subscribe((bookResponse: any) => {
        const bookId = bookResponse.id;
        
        // Create the recipe
        this.http.post('http://localhost:3000/api/recipes', { 
          title: this.recipe.title, 
          instructions: this.recipe.instructions, 
          bookId: bookId 
        })
          .subscribe((recipeResponse: any) => {
            const recipeId = recipeResponse.id;
            
            // Create the ingredients
            for (const ingredient of this.ingredients) {
              this.http.post('http://localhost:3000/api/ingredients', { 
                name: ingredient.name, 
                quantity: ingredient.quantity, 
                unit: ingredient.unit, 
                recipeId: recipeId 
              })
                .subscribe(() => {
                  // Ingredient created successfully
                }, (error) => {
                  // Handle error
                });
            }
            
            // Reset the form
            this.resetForm();
            
            // Display success message or perform any other necessary actions
          }, (error) => {
            // Handle error
          });
      }, (error) => {
        // Handle error
      });
  }
  
  resetForm() {
    // Reset the form values and any other necessary state variables
    this.book = {
      title: '',
      author: ''
    };
    
    this.recipe = {
      title: '',
      instructions: ''
    };
    
    this.ingredients = [];
  }
  
}