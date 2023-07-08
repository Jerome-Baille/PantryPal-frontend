import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RecipeService } from 'src/app/services/recipe.service';

@Component({
  selector: 'app-recipe-update',
  templateUrl: './recipe-update.component.html',
  styleUrls: ['./recipe-update.component.scss']
})
export class RecipeUpdateComponent implements OnInit {
  recipe: any;
  error: boolean = false; // Flag to indicate API call success

  recipeForm: FormGroup = this.fb.group({
    bookTitle: [''],
    bookAuthor: [''],
    title: ['', Validators.required],
    preparationTime: [''],
    preparationUnit: [''],
    cookingTime: [''],
    cookingUnit: [''],
    fridgeTime: [''],
    fridgeUnit: [''],
    waitingTime: [''],
    waitingUnit: [''],
    instructions: [''],
    ingredients: this.fb.array([])
  });
  isFormModified = false;

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const recipeId = params['id']; // Get the recipe ID from the URL

      // Fetch the recipe data from the server using HTTP request
      this.recipeService.getRecipe(recipeId).subscribe({
        next: (response: any) => {
          this.recipe = response;
          this.initializeForm();
          this.error = false; // Set the error flag to false when API call is successful
        },
        error: (error) => {
          console.log('Error fetching recipe data:', error);
          this.error = true; // Set the error flag to true when API call fails
        }
      })
    });
  }

  initializeForm() {
    if (this.recipe) {
      this.recipeForm.patchValue({
        bookTitle: this.recipe.Book.title,
        bookAuthor: this.recipe.Book.author,
        title: this.recipe.title,
        preparationTime: this.recipe.preparationTime,
        preparationUnit: this.recipe.preparationUnit,
        cookingTime: this.recipe.cookingTime,
        cookingUnit: this.recipe.cookingUnit,
        fridgeTime: this.recipe.fridgeTime,
        fridgeUnit: this.recipe.fridgeUnit,
        waitingTime: this.recipe.waitingTime,
        waitingUnit: this.recipe.waitingUnit,
        instructions: this.recipe.instructions
      });

      // Initialize the ingredients FormArray
      if (Array.isArray(this.recipe.Ingredients)) {
        this.recipe.Ingredients.forEach((ingredient: any) => {
          this.addIngredient(ingredient.id, ingredient.name, ingredient.quantity, ingredient.unit);
        });
      }
    }
  }


  // Helper methods to handle the ingredients FormArray
  get ingredients() {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  addIngredient(id: number = 0, name: string = '', quantity: number = 0, unit: string = '') {
    const ingredientGroup = this.fb.group({
      id: [id],
      name: [name],
      quantity: [quantity],
      unit: [unit]
    });
    this.ingredients.push(ingredientGroup);
  }
  removeIngredient(index: number) {
    this.ingredients.removeAt(index);
  }

  onInput() {
    this.isFormModified = true;
  }

  onSubmit() {
    const bookId = this.recipe.Book.id;
    const recipeId = this.recipe.id;
    const updatedRecipe = { ...this.recipe, ...this.recipeForm.value };
    const ingredients = updatedRecipe.Ingredients;
    delete updatedRecipe.Ingredients;

    // Update bookTitle and bookAuthor
    if (updatedRecipe.bookTitle !== this.recipe.bookTitle || updatedRecipe.bookAuthor !== this.recipe.bookAuthor) {
      this.recipeService.updateBook(bookId, updatedRecipe.bookTitle, updatedRecipe.bookAuthor).subscribe({
        next: (response) => {
          console.log(response.message);
        },
        error: (error) => {
          console.log('Error updating book:', error);
        }
      })
    } else {
      console.log('Book is already up to date');
    }

    // Update recipe
    if (JSON.stringify(updatedRecipe) !== JSON.stringify(this.recipe)) {
      this.recipeService.updateRecipe(recipeId, updatedRecipe).subscribe({
        next: (response) => {
          console.log(response.message);
          this.recipe = updatedRecipe;
        },
        error: (error) => {
          console.log('Error updating recipe:', error);
        }
      })
    } else {
      console.log('Recipe is already up to date');
    }

    // Update ingredients
    if (this.ingredients.length === 0) {
      console.log('No ingredients to update');
      return;
    } else {
      this.ingredients.controls.forEach((control, index) => {
        const ingredient = ingredients[index];
        const updatedIngredient = control.value;
        this.recipeService.updateIngredient(ingredient.id, updatedIngredient).subscribe({
          next: (response) => {
            ingredients[index] = updatedIngredient;
            console.log(response.message);
          },
          error: (error) => {
            console.log('Error updating ingredient:', error);
          }
        })
      });
    }
  }
}