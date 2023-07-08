import { Component } from '@angular/core';
import { RecipeService } from '../../../services/recipe.service';

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
  constructor(private recipeService: RecipeService) { }

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
    this.recipeService.createRecipe(this.book, this.recipe, this.ingredients);
    this.resetForm();
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