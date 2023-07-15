import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RecipeService } from '../../../services/recipe.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private recipeService: RecipeService,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder
  ) {
    this.recipeForm = this.formBuilder.group({
      book: this.formBuilder.group({
        title: ['', Validators.required],
        author: ['', Validators.required]
      }),
      recipe: this.formBuilder.group({
        title: ['', Validators.required],
        instructions: ['', Validators.required],
        preparationTime: [0],
        preparationUnit: [''],
        cookingTime: [0],
        cookingUnit: [''],
        fridgeTime: [0],
        fridgeUnit: [''],
        waitingTime: [0],
        waitingUnit: ['']
      }),
      ingredients: this.formBuilder.array([])
    });
  }

  ingredients!: FormArray;
  recipeForm!: FormGroup;
  book: Book = { title: '', author: '' };

  ngOnInit() {
    this.ingredients = this.recipeForm.get('ingredients') as FormArray;
  }

  handleBookSelected(selectedBook: Book) {
    this.book = selectedBook;
    this.recipeForm.patchValue({
      book: {
        title: selectedBook.title,
        author: selectedBook.author
      }
    });
  }

  submitForm() {
    const recipe = this.recipeForm.get('recipe')!.value;
    const ingredients = (this.recipeForm.get('ingredients') as FormArray).value;

    this.recipeService.createRecipe(this.book, recipe, ingredients).subscribe({
      next: () => {
        this.resetForm();
      },
      error: (error) => {
        // Handle error
        console.error("The recipe has not been created: " + error);
      },
      complete: () => {
        this.snackBar.open("Recipe created successfully!", "Done", {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snackbar-success']
        });
      }
    });
  }

  resetForm() {
    // Reset the form values and any other necessary state variables
    this.recipeForm.reset();
    this.ingredients.clear();
    this.recipeForm.markAsUntouched();

    // Set the validity of the required fields to true
    this.recipeForm.get('book.title')?.setErrors(null);
    this.recipeForm.get('book.author')?.setErrors(null);
    this.recipeForm.get('recipe.title')?.setErrors(null);
    this.recipeForm.get('recipe.instructions')?.setErrors(null);
  }
}