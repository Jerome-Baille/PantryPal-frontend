import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, forkJoin, merge, Subscription } from 'rxjs';
import { Book as BookModel } from 'src/app/shared/models/book.model';
import { Recipe } from 'src/app/shared/models/recipe.model';
import { BookService } from 'src/app/core/services/book.service';
import { RecipeService } from 'src/app/core/services/recipe.service';
import { ItemService } from 'src/app/core/services/item.service';
import { IngredientService } from 'src/app/core/services/ingredient.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { BookFormComponent } from '../book-form/book-form.component';
import { IngredientFormComponent } from '../ingredient-form/ingredient-form.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    BookFormComponent,
    IngredientFormComponent,
    TranslateModule
  ],
  templateUrl: './recipe-form.component.html',
  styleUrls: ['./recipe-form.component.scss']
})
export class RecipeFormComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private recipeService = inject(RecipeService);
  private snackbarService = inject(SnackbarService);
  private fb = inject(FormBuilder);
  private bookService = inject(BookService);
  private itemService = inject(ItemService);
  private ingredientService = inject(IngredientService);
  private languageService = inject(LanguageService);

  isUpdateMode = false;
  recipeForm!: FormGroup;
  ingredients!: FormArray;
  book!: BookModel;
  isFormModified = false;

  recipe: Recipe | null = null;
  error = false;

  isTimerModified = false;
  removedTimers: number[] = [];
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  private languageSubscription?: Subscription;
  currentLang: string;

  constructor() {
    const languageService = this.languageService;

    this.initializeForm();
    this.ingredients = this.recipeForm.get('ingredients') as FormArray;
    this.currentLang = languageService.getCurrentLanguage();
  }

  ngOnInit(): void {
    // New subscription to timer changes
    this.recipeForm.get('timers')?.valueChanges.subscribe(() => {
      this.isTimerModified = true;
    });

    // Check the URL to determine if it's a create or update scenario
    this.route.url.subscribe(segments => {
      const paths = segments.map(segment => segment.path);
      if (paths.includes('create')) {
        this.isUpdateMode = false;
        this.initializeCreateForm();
      } else if (paths.includes('update')) {
        this.isUpdateMode = true;
        this.initializeUpdateForm();
      }
    });

    this.languageSubscription = this.languageService.currentLanguage$.subscribe(
      (lang: string) => this.currentLang = lang
    );
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
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
        servings: [1, [Validators.required, Validators.min(1)]],
        instructions: ['', Validators.required],
        notes: ['']
      }),
      ingredients: this.fb.array([]),
      timers: this.fb.array([]) // timers: now with hours/minutes/seconds
    });
  }

  initializeCreateForm() {
    this.book = { title: '', author: '' };
    this.subscribeToFormChanges();
  }

  initializeUpdateForm() {
    this.route.params.subscribe(params => {
      const recipeId = params['id'];

      // Fetch the recipe data from the server using HTTP request
      this.recipeService.getRecipe(recipeId).subscribe({
        next: (response) => {
          this.recipe = response;
          this.getInitializerUpdateForm();
          this.subscribeToFormChanges(); // subscribe after initial patching
          this.error = false; // Set the error flag to false when API call is successful
        },
        error: (error: unknown) => {
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
          id: this.recipe.Book?.id,
          title: this.recipe.Book?.title,
          author: this.recipe.Book?.author
        },
        recipe: {
          title: this.recipe.title,
          typeOfMeal: this.recipe.typeOfMeal,
          servings: this.recipe.servings || 1,
          instructions: this.recipe.instructions,
          notes: this.recipe.notes
        }
      }); // Removed { emitEvent: false } option

      // Set image preview if recipe has an image
      if (this.recipe.picture) {
        this.imagePreview = this.recipe.picture;
      }

      // Update timers FormArray including timer id
      if (this.recipe.timers && Array.isArray(this.recipe.timers)) {
        const timersFormArray = this.recipeForm.get('timers') as FormArray;
        this.recipe.timers.forEach((timer) => {
          const total = timer.time_in_seconds ?? timer.timeInSeconds ?? 0;
          const hours = Math.floor(total / 3600);
          const minutes = Math.floor((total % 3600) / 60);
          const seconds = total % 60;
          timersFormArray.push(this.fb.group({
            id: [timer.id], // new field
            name: [timer.name],
            hours: [hours],
            minutes: [minutes],
            seconds: [seconds]
          }));
        });
      }
    }
  }

  private subscribeToFormChanges() {
    // Track changes to Book, recipe, and ingredients groups
    merge(
      this.recipeForm.get('Book')!.valueChanges,
      this.recipeForm.get('recipe')!.valueChanges,
      this.recipeForm.get('ingredients')!.valueChanges
    ).subscribe(() => {
      this.isFormModified = true;
    });
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
    // Removed duplicate timer processing loop from here.
  }

  handleCreateSubmit() {
    const recipe = this.recipeForm.get('recipe')!.value;
    const ingredients = (this.recipeForm.get('ingredients') as FormArray).value;
    // Extract timers from form without mapping them here
    const timersRaw = (this.recipeForm.get('timers') as FormArray).value as { id?: number; name: string; hours: number; minutes: number; seconds: number }[];

    // Remove timers from initial recipe creation; they will be created separately.
    this.recipeService.createRecipe(this.book, recipe, ingredients, [], this.selectedImage || undefined).subscribe({
      next: (recipeResponse) => {
        const recipeId = recipeResponse.id;
        // Create timers separately for new ones (without an id)
        const timerObservables = timersRaw
          .filter((t) => !t.id)
          .map((t) => {
            const newTimer = {
              name: t.name,
              timeInSeconds: (Number(t.hours) * 3600) + (Number(t.minutes) * 60) + Number(t.seconds),
              recipeId: recipeId // include recipeId if backend requires it
            };
            return this.itemService.createTimer(newTimer);
          });
        if (timerObservables.length > 0) {
          forkJoin(timerObservables).subscribe({
            next: () => {
              this.resetForm();
              this.snackbarService.showSuccess('Recipe and timers created successfully!');
              this.router.navigate(['/recipe/detail', recipeId]);
            },
            error: (error: unknown) => this.snackbarService.showError(String(error))
          });
        } else {
          this.resetForm();
          this.snackbarService.showSuccess('Recipe created successfully!');
          this.router.navigate(['/recipe/detail', recipeId]);
        }
      },
      error: (error: { error?: { error?: { errors?: { message: string }[] } } }) => {
        this.snackbarService.showError(error.error?.error?.errors?.[0]?.message || 'Error creating recipe');
        console.error('Error creating recipe:', error);
      }
    });
  }

  handleUpdateSubmit() {
    if (!this.recipe) return;
    
    const recipeId = this.recipe.id;
    const updatedRecipe = { ...this.recipe, ...this.recipeForm.value };
    delete updatedRecipe.timers;
    const recipeUpdates: Observable<unknown>[] = [];
    const ingredientObservables: Observable<unknown>[] = [];

    if (this.isFormModified) {
      const currentRecipe = this.recipeForm.get('recipe')?.value;
      const originalRecipe = {
        title: this.recipe.title,
        typeOfMeal: this.recipe.typeOfMeal,
        instructions: this.recipe.instructions,
        notes: this.recipe.notes
      };

      if (JSON.stringify(currentRecipe) !== JSON.stringify(originalRecipe)) {
        recipeUpdates.push(this.recipeService.updateRecipe(recipeId, updatedRecipe.recipe, this.selectedImage || undefined));
      }
    }

    // Process ingredient updates and creations
    const ingredientsArray = this.recipeForm.get('ingredients') as FormArray;
    ingredientsArray.controls.forEach(control => {
      const id = control.get('id')?.value;
      if (id && control.dirty) {
        // Update existing ingredient
        if (control.get('Ingredient.name')?.dirty) {
          const ingredientId = control.get('Ingredient.id')?.value;
          const newName = control.get('Ingredient.name')?.value;
          ingredientObservables.push(
            this.ingredientService.updateIngredient(ingredientId, { name: newName })
          );
        }
        if (control.get('quantity')?.dirty || control.get('unit')?.dirty || control.get('recipeSectionId')?.dirty) {
          ingredientObservables.push(
            this.itemService.updateRecipeIngredient(id, {
              quantity: control.value.quantity,
              unit: control.value.unit,
              recipeSectionId: control.value.recipeSectionId
            })
          );
        }
      } else if (!id) {
        // Create new ingredient
        ingredientObservables.push(
          this.ingredientService.createIngredient(recipeId, control.value)
        );
      }
    });

    // Process timers: update only dirty timers or create new ones.
    const timersFormArray = this.recipeForm.get('timers') as FormArray;
    const timerObservables: Observable<unknown>[] = [];
    timersFormArray.controls.forEach(timerCtrl => {
      const timerValue = timerCtrl.value;
      if (!timerValue.id) {
        const newTimer = {
          name: timerValue.name,
          timeInSeconds: (Number(timerValue.hours) * 3600) + (Number(timerValue.minutes) * 60) + Number(timerValue.seconds),
          recipeId
        };
        timerObservables.push(this.itemService.createTimer(newTimer));
      } else if (timerCtrl.dirty) {
        const updatedTimer = {
          name: timerValue.name,
          timeInSeconds: (Number(timerValue.hours) * 3600) + (Number(timerValue.minutes) * 60) + Number(timerValue.seconds)
        };
        timerObservables.push(this.itemService.updateRecipeTimer(timerValue.id, updatedTimer));
      }
    });

    // Combine all observables
    const allObservables = [...recipeUpdates, ...ingredientObservables, ...timerObservables];

    // Execute all updates together
    if (allObservables.length > 0) {
      forkJoin(allObservables).subscribe({
        next: () => {
          this.recipe = { ...this.recipe, ...updatedRecipe };
          // Process deletions for removed timers
          if (this.removedTimers.length > 0) {
            const deleteObservables = this.removedTimers.map(id => this.itemService.deleteTimer(id));
            forkJoin(deleteObservables).subscribe({
              next: () => {
                this.removedTimers = [];
                this.snackbarService.showSuccess('Recipe updated successfully!');
                this.router.navigate(['/recipe/detail', this.recipe!.id]);
              },
              error: (error: unknown) => {
                console.error('Error deleting timers: ', error);
                this.removedTimers = [];
                this.snackbarService.showSuccess('Recipe updated successfully!');
                this.router.navigate(['/recipe/detail', this.recipe!.id]);
              }
            });
          } else {
            this.snackbarService.showSuccess('Recipe updated successfully!');
            this.router.navigate(['/recipe/detail', this.recipe!.id]);
          }
        },
        error: (error: unknown) => {
          this.snackbarService.showError(String(error));
          console.error('Error updating recipe: ', error);
        }
      });
    } else if (this.removedTimers.length > 0) {
      // Handle case where only timer deletions exist
      const deleteObservables = this.removedTimers.map(id => this.itemService.deleteTimer(id));
      forkJoin(deleteObservables).subscribe({
        next: () => {
          this.removedTimers = [];
          this.snackbarService.showSuccess('Timers deleted successfully!');
          this.router.navigate(['/recipe/detail', this.recipe!.id]);
        },
        error: (error: unknown) => {
          console.error('Error deleting timers: ', error);
          this.removedTimers = [];
          this.snackbarService.showError(String(error));
        }
      });
    }
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

    this.isTimerModified = false; // reset timer flag
  }

  // Add a getter for timers FormArray for convenience
  get timers(): FormArray {
    return this.recipeForm.get('timers') as FormArray;
  }

  addTimer() {
    const timersArray = this.recipeForm.get('timers') as FormArray;
    // Create a new timer without an "id" property
    timersArray.push(new FormGroup({
      name: new FormControl(''),
      hours: new FormControl(0),
      minutes: new FormControl(0),
      seconds: new FormControl(0)
    }));
  }

  removeTimer(index: number) {
    const timersArray = this.timers;
    const timerControl = timersArray.at(index);
    const timerValue = timerControl.value;
    if (timerValue.id) {
      // Mark the timer for deletion rather than calling the backend immediately.
      this.removedTimers.push(timerValue.id);
    }
    timersArray.removeAt(index);
  }



  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
      if (!allowedTypes.includes(file.type)) {
        this.snackbarService.showError('Invalid file type. Only JPEG, PNG, WebP, and AVIF are allowed.');
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.snackbarService.showError('File size exceeds 10MB limit.');
        return;
      }
      
      this.selectedImage = file;
      this.isFormModified = true;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagePreview = e.target?.result as string || null;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
    this.isFormModified = true;
  }
}
