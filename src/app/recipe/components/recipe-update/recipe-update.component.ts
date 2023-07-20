import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from 'src/app/services/book.service';
import { RecipeService } from 'src/app/services/recipe.service';
import { IngredientService } from 'src/app/services/ingredient.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-recipe-update',
  templateUrl: './recipe-update.component.html',
  styleUrls: ['./recipe-update.component.scss']
})
export class RecipeUpdateComponent implements OnInit {
  recipe: any;
  error: boolean = false;
  isFormModified = false;
  isIngredientDeleted = false;
  isIngredientModified = false;

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
    notes: [''],
    ingredients: this.fb.array([])
  });


  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private recipeService: RecipeService,
    private ingredientService: IngredientService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router
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
        instructions: this.recipe.instructions,
        notes: this.recipe.notes
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
    const ingredient = this.ingredients.at(index).value;
    if (ingredient.id) {
      this.ingredientService.deleteIngredient(ingredient.id).subscribe({
        next: (response) => {
          console.log(response.message);
          this.ingredients.removeAt(index);
          this.isIngredientDeleted = true;
        },
        error: (error) => {
          console.log('Error deleting ingredient:', error);
        }
      });
    } else {
      this.ingredients.removeAt(index);
      this.isIngredientDeleted = false;
    }
  }

  onInput() {
    this.isFormModified = true;
  }

  updateIngredientFlag() {
    this.isFormModified = true;
    this.isIngredientModified = this.ingredients.controls.some(
      (control, index) => {
        const ingredient = this.recipe.Ingredients[index];
        return (
          ingredient &&
          (ingredient.name !== control.value.name ||
            ingredient.quantity !== control.value.quantity ||
            ingredient.unit !== control.value.unit)
        );
      }
    );
  }

  onSubmit() {
    if (!this.isFormModified && !this.isIngredientDeleted && !this.isIngredientModified) {
      return;
    }

    const bookId = this.recipe.Book.id;
    const recipeId = this.recipe.id;
    const updatedRecipe = { ...this.recipe, ...this.recipeForm.value };
    const ingredients = updatedRecipe.Ingredients;
    delete updatedRecipe.Ingredients;

    const observables = [];

    // Update bookTitle and bookAuthor
    if (updatedRecipe.bookTitle !== this.recipe.Book.title || updatedRecipe.bookAuthor !== this.recipe.Book.author) {
      observables.push(this.bookService.updateBook(bookId, updatedRecipe.bookTitle, updatedRecipe.bookAuthor));
    }

    // Update recipe
    if (JSON.stringify(updatedRecipe) !== JSON.stringify(this.recipe)) {
      observables.push(this.recipeService.updateRecipe(recipeId, updatedRecipe));
    }

    // Update ingredients
    if (this.isIngredientModified || this.isIngredientDeleted) {
      if (this.ingredients.length !== 0) {
        this.ingredients.controls.forEach((control, index) => {
          const ingredient = ingredients.find((i: any) => i.id === control.value.id);
          if (ingredient) {
            const updatedIngredient = control.value;
            observables.push(this.ingredientService.updateIngredient(ingredient.id, updatedIngredient));
          } else {
            const newIngredient = control.value;
            observables.push(this.ingredientService.createIngredient(recipeId, newIngredient));
          }
        });
      }
    }

    forkJoin(observables).subscribe({
      next: () => {
        this.recipe = updatedRecipe;
        this.snackBar.open('Recipe updated successfully', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      },
      error: (error) => {
        console.log('Error updating recipe:', error);
        this.snackBar.open('Error updating recipe', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      },
      complete: () => {
        // Redirect to the recipe details page
        this.router.navigate(['/recipe/detail', this.recipe.id]);
      }
    });
  }
}