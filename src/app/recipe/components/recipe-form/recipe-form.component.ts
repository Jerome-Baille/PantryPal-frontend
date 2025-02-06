import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin, merge, EMPTY } from 'rxjs';
import { Book as BookModel } from 'src/app/models/book.model';
import { BookService } from 'src/app/services/book.service';
import { IngredientService } from 'src/app/services/ingredient.service';
import { RecipeService } from 'src/app/services/recipe.service';
import { ItemService } from 'src/app/services/item.service'; // new import

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

  isTimerModified = false; // new flag
  removedTimers: number[] = []; // new property to track timer IDs for deletion

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,

    private bookService: BookService,
    private ingredientService: IngredientService,
    private itemService: ItemService // injected for timer updates
  ) {
    this.initializeForm();
    // Initialize ingredients FormArray reference
    this.ingredients = this.recipeForm.get('ingredients') as FormArray;
  }

  ngOnInit(): void {
    // New subscription to timer changes
    this.recipeForm.get('timers')?.valueChanges.subscribe(() => {
      this.isTimerModified = true;
    });

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
      const recipeId = params['id']; // Get the recipe ID from the URL

      // Fetch the recipe data from the server using HTTP request
      this.recipeService.getRecipe(recipeId).subscribe({
        next: (response: any) => {
          this.recipe = response;
          this.getInitializerUpdateForm();
          this.subscribeToFormChanges(); // subscribe after initial patching
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
          instructions: this.recipe.instructions,
          notes: this.recipe.notes
        }
      }, { emitEvent: false });

      // Update timers FormArray including timer id
      if (this.recipe.timers && Array.isArray(this.recipe.timers)) {
        const timersFormArray = this.recipeForm.get('timers') as FormArray;
        this.recipe.timers.forEach((timer: any) => {
          const total = timer.time_in_seconds;
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
    // Only track changes to Book and recipe groups
    merge(
      this.recipeForm.get('Book')!.valueChanges,
      this.recipeForm.get('recipe')!.valueChanges
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
    const timersRaw = (this.recipeForm.get('timers') as FormArray).value;
    
    // Remove timers from initial recipe creation; they will be created separately.
    this.recipeService.createRecipe(this.book, recipe, ingredients, []).subscribe({
      next: (recipeResponse) => {
        const recipeId = recipeResponse.id;
        // Create timers separately for new ones (without an id)
        const timerObservables = timersRaw
          .filter((t: any) => !t.id)
          .map((t: any) => {
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
              this.handleSnackBar('Recipe and timers created successfully!', ['snackbar-success']);
            },
            error: (error) => this.handleSnackBar(error)
          });
        } else {
          this.resetForm();
          this.handleSnackBar('Recipe created successfully!', ['snackbar-success']);
        }
      },
      error: (error) => {
        this.handleSnackBar(error.error.error.errors[0].message);
        console.error('Error creating recipe:', error);
      }
    });
  }

  handleUpdateSubmit() {
    const recipeId = this.recipe.id;
    const updatedRecipe = { ...this.recipe, ...this.recipeForm.value };
    delete updatedRecipe.timers;
    const recipeUpdates: Observable<any>[] = [];

    if (this.isFormModified) {
      const currentRecipe = this.recipeForm.get('recipe')?.value;
      const originalRecipe = {
        title: this.recipe.title,
        typeOfMeal: this.recipe.typeOfMeal,
        instructions: this.recipe.instructions,
        notes: this.recipe.notes
      };
      
      if (JSON.stringify(currentRecipe) !== JSON.stringify(originalRecipe)) {
        recipeUpdates.push(this.recipeService.updateRecipe(recipeId, updatedRecipe.recipe));
      }
    }

    // Process timers: update only dirty timers or create new ones.
    const timersFormArray = this.recipeForm.get('timers') as FormArray;
    const timerObservables: Observable<any>[] = [];
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

    // Execute recipe updates and timer updates separately.
    if (recipeUpdates.length > 0) {
      forkJoin(recipeUpdates).subscribe({
        next: () => {
          this.recipe = { ...this.recipe, ...updatedRecipe };
          forkJoin(timerObservables.length > 0 ? timerObservables : [new Observable(sub => { sub.next(); sub.complete(); })])
          .subscribe({
            next: () => {
              // Now process deletions for removed timers.
              if (this.removedTimers.length > 0) {
                const deleteObservables = this.removedTimers.map(id => this.itemService.deleteTimer(id));
                forkJoin(deleteObservables).subscribe({
                  next: () => {
                    this.removedTimers = [];
                    this.handleSnackBar('Recipe updated successfully!', ['snackbar-success']);
                    this.router.navigate(['/recipe/detail', this.recipe.id]);
                  },
                  error: (error) => {
                    console.error('Error deleting timers: ', error);
                    this.removedTimers = [];
                    this.handleSnackBar('Recipe updated successfully!', ['snackbar-success']);
                    this.router.navigate(['/recipe/detail', this.recipe.id]);
                  }
                });
              } else {
                this.handleSnackBar('Recipe updated successfully!', ['snackbar-success']);
                this.router.navigate(['/recipe/detail', this.recipe.id]);
              }
            },
            error: (error) => {
              this.handleSnackBar(error);
              console.error('Error updating timers: ', error);
            }
          });
        },
        error: (error) => {
          this.handleSnackBar(error);
          console.error('Error while updating recipe: ', error);
        }
      });
    } else if (timerObservables.length > 0) { // Only timer updates present.
      forkJoin(timerObservables).subscribe({
        next: () => {
          if (this.removedTimers.length > 0) {
            const deleteObservables = this.removedTimers.map(id => this.itemService.deleteTimer(id));
            forkJoin(deleteObservables).subscribe({
              next: () => {
                this.removedTimers = [];
                this.handleSnackBar('Timers updated successfully!', ['snackbar-success']);
                this.router.navigate(['/recipe/detail', this.recipe.id]);
              },
              error: (error) => {
                console.error('Error deleting timers: ', error);
                this.removedTimers = [];
                this.handleSnackBar('Timers updated successfully!', ['snackbar-success']);
                this.router.navigate(['/recipe/detail', this.recipe.id]);
              }
            });
          } else {
            this.handleSnackBar('Timers updated successfully!', ['snackbar-success']);
            this.router.navigate(['/recipe/detail', this.recipe.id]);
          }
        },
        error: (error) => {
          this.handleSnackBar(error);
          console.error('Error updating timers: ', error);
        }
      });
    } else if (this.removedTimers.length > 0) { // Add this new condition
      // Handle case where only timer deletions exist
      const deleteObservables = this.removedTimers.map(id => this.itemService.deleteTimer(id));
      forkJoin(deleteObservables).subscribe({
        next: () => {
          this.removedTimers = [];
          this.handleSnackBar('Timers deleted successfully!', ['snackbar-success']);
          this.router.navigate(['/recipe/detail', this.recipe.id]);
        },
        error: (error) => {
          console.error('Error deleting timers: ', error);
          this.removedTimers = [];
          this.handleSnackBar(error);
        }
      });
    }
  }

  private handleSnackBar(message: string, panelClasses?: string[]) {
    this.snackBar.open(message, 'Done', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: panelClasses
    });
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

  // Add handler for ingredient saves
  onIngredientsSaved() {
    // Optionally handle ingredient save completion
    this.handleSnackBar('Ingredients saved successfully!', ['snackbar-success']);
  }
}
