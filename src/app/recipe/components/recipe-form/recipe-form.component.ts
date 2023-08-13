import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { Book as BookModel } from 'src/app/models/book.model';
import { BookService } from 'src/app/services/book.service';
import { IngredientService } from 'src/app/services/ingredient.service';
import { RecipeService } from 'src/app/services/recipe.service';

@Component({
  selector: 'app-recipe-form',
  templateUrl: './recipe-form.component.html',
  styleUrls: ['./recipe-form.component.scss']
})
export class RecipeFormComponent implements OnInit {
  isUpdateMode = false;
  recipeForm!: FormGroup;
  ingredients!: FormArray;
  book!: BookModel;
  isFormModified = false;

  recipe: any;
  error: boolean = false;

  isIngredientListModified = false;
  originalIngredients: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,

    private bookService: BookService,
    private ingredientService: IngredientService,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.ingredients = this.recipeForm.get('ingredients') as FormArray;

    // Check the URL to determine if it's a create or update scenario
    this.route.url.subscribe(segments => {
      if (segments.length > 0) {
        const action = segments[0].path; // "create" or "detail"
        if (action === 'create') {
          this.isUpdateMode = false;
          this.initializeCreateForm();
        } else if (action === 'update') {
          this.isUpdateMode = true;
          this.initializeUpdateForm();
        }
      }
    });
  }

  private initializeForm() {
    this.recipeForm = this.fb.group({
      Book: this.fb.group({
        id: [''],
        title: ['', Validators.required],
        author: ['', Validators.required]
      }),
      recipe: this.fb.group({
        title: ['', Validators.required],
        typeOfMeal: [''],
        instructions: ['', Validators.required],
        notes: [''],
        preparationTime: [0],
        preparationUnit: [''],
        cookingTime: [0],
        cookingUnit: [''],
        fridgeTime: [0],
        fridgeUnit: [''],
        waitingTime: [0],
        waitingUnit: ['']
      }),
      ingredients: this.fb.array([])
    });
  }

  initializeCreateForm() {
    this.book = { title: '', author: '' };
    this.recipeForm.valueChanges.subscribe(() => {
      this.isFormModified = true;
    })
  }

  initializeUpdateForm() {
    this.route.params.subscribe(params => {
      const recipeId = params['id']; // Get the recipe ID from the URL

      // Fetch the recipe data from the server using HTTP request
      this.recipeService.getRecipe(recipeId).subscribe({
        next: (response: any) => {
          this.recipe = response;
          this.getInitializerUpdateForm();
          this.error = false; // Set the error flag to false when API call is successful
        },
        error: (error) => {
          console.log('Error fetching recipe data:', error);
          this.error = true; // Set the error flag to true when API call fails
        }
      })
    });
  }

  getInitializerUpdateForm() {
    if (this.recipe) {
      this.recipeForm.patchValue({
        Book: {
          id: this.recipe.Book.id,
          title: this.recipe.Book.title,
          author: this.recipe.Book.author
        },
        recipe: {
          title: this.recipe.title,
          typeOfMeal: this.recipe.typeOfMeal,
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
        }
      });

      this.recipeForm.get('recipe')?.valueChanges.subscribe(() => {
        this.isFormModified = true;
      })

      // Initialize the ingredients FormArray
      if (Array.isArray(this.recipe.Ingredients)) {
        this.recipe.Ingredients.forEach((ingredient: any) => {
          const ingredientGroup = this.fb.group({
            id: [ingredient.id],
            name: [ingredient.name],
            quantity: [ingredient.quantity],
            unit: [ingredient.unit]
          });
          this.ingredients.push(ingredientGroup);
        });
      }

      // Detect changes in the ingredients FormArray
      this.recipeForm.get('ingredients')?.valueChanges.subscribe(() => {
        this.isIngredientListModified = true;
        this.isFormModified = true;
      });
    }
  }

  handleBookSelected(selectedBook: BookModel) {
    if (!this.isUpdateMode) {
      this.book = selectedBook;
      this.recipeForm.patchValue({
        Book: {
          title: selectedBook.title,
          author: selectedBook.author
        }
      });
    } else {
      const bookValue = {
        id: selectedBook.id || null,
        title: selectedBook.title,
        author: selectedBook.author
      };

      // If the selected book has an ID, update the book ID directly in the recipe
      if (bookValue.id) {
        this.recipeForm.patchValue({
          Book: bookValue
        });
        this.isFormModified = true;
      } else {
        // If the selected book is a new book, create the new book and update the recipe's bookId
        this.bookService.createBook({
          title: selectedBook.title,
          author: selectedBook.author
        }).subscribe((createdBook) => {
          // Update the recipe's bookId with the ID of the newly created book
          this.recipeForm.patchValue({
            Book: {
              id: createdBook.id, // Assign the ID of the created book
              title: selectedBook.title,
              author: selectedBook.author
            }
          });
          this.isFormModified = true;
        });
      }
    }
  }

  onSubmit() {
    if (!this.recipeForm.valid) {
      this.recipeForm.markAllAsTouched();
      return;
    }

    if (!this.isUpdateMode) {
      this.handleCreateSubmit();
    } else {
      this.handleUpdateSubmit();
    }
  }

  handleCreateSubmit() {
    const recipe = this.recipeForm.get('recipe')!.value;
    const ingredients = (this.recipeForm.get('ingredients') as FormArray).value;

    this.recipeService.createRecipe(this.book, recipe, ingredients).subscribe({
      next: () => {
        this.resetForm();
      },
      error: (error) => {
        // Handle error
        this.handleSnackBar(error.error.error.errors[0].message);
        console.error('Error creating recipe:', error)
      },
      complete: () => {
        this.handleSnackBar('Recipe created successfully!', ['snackbar-success']);
      }
    });
  }

  handleUpdateSubmit() {
    if (!this.isFormModified && !this.isIngredientListModified) {
      return;
    }

    const recipeId = this.recipe.id;
    const updatedRecipe = { ...this.recipe, ...this.recipeForm.value };
    const ingredients = updatedRecipe.Ingredients;
    delete updatedRecipe.Ingredients;

    const observables: Observable<any>[] = [];

    // Update book
    if (
      updatedRecipe.Book.title !== this.recipe.Book.title ||
      updatedRecipe.Book.author !== this.recipe.Book.author
    ) {
      updatedRecipe.bookId = updatedRecipe.Book.id;
    }

    // Update recipe
    if (JSON.stringify(updatedRecipe) !== JSON.stringify(this.recipe)) {
      observables.push(this.recipeService.updateRecipe(recipeId, updatedRecipe.recipe));
    }

    // Update ingredients
    if (this.isIngredientListModified) {
      observables.push(...this.getIngredientObservables(ingredients, recipeId));
    }

    forkJoin(observables).subscribe({
      next: () => {
        this.recipe = updatedRecipe;

        this.handleSnackBar('Recipe updated successfully!', ['snackbar-success']);
      },
      error: (error) => {
        this.handleSnackBar(error);
        console.error('Error while updating recipe: ', error)
      },
      complete: () => {
        // Redirect to the recipe details page
        this.router.navigate(['/recipe/detail', this.recipe.id]);
      }
    });
  }

  private handleSnackBar(message: string, panelClasses?: string[]) {
    this.snackBar.open(message, 'Done', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: panelClasses
    });
  }

  getIngredientObservables(ingredients: any[], recipeId: number): any[] {
    const observables: any[] = [];

    if (this.ingredients.length !== 0) {
      this.ingredients.controls.forEach((control, index) => {
        const ingredient = ingredients.find((i: any) => i.id === control.value.id);
        if (ingredient) {
          const updatedIngredient = control.value;

          // Check if the ingredient details have been modified
          if (!this.isIngredientListModified) {
            return; // Skip the PUT API call if the ingredient details are unchanged
          }

          // Make a PUT API call to update the existing ingredient
          observables.push(this.ingredientService.updateIngredient(ingredient.id, updatedIngredient));
        } else {
          const newIngredient = control.value;
          // Make a POST API call to create the new ingredient
          observables.push(this.ingredientService.createIngredient(recipeId, newIngredient));
        }
      });
    }

    return observables;
  }

  resetForm() {
    // Reset the form values and any other necessary state variables
    this.recipeForm.reset();
    this.ingredients.clear();
    this.recipeForm.markAsUntouched();

    this.recipeForm.get('Book.title')?.setErrors(null);
    this.recipeForm.get('Book.author')?.setErrors(null);

    // Set the validity of the required fields to true
    const recipeGroup = this.recipeForm.get('recipe') as FormGroup;
    Object.keys(recipeGroup.controls).forEach((key) => {
      recipeGroup.get(key)?.setErrors(null);
    });
  }
}
