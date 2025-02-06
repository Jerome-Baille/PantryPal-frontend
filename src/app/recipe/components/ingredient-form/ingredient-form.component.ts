import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ItemService } from 'src/app/services/item.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SectionDialogComponent } from '../section-dialog/section-dialog.component';

@Component({
  selector: 'app-ingredient-form',
  templateUrl: './ingredient-form.component.html',
  styleUrls: ['./ingredient-form.component.scss']
})
export class IngredientFormComponent implements OnInit {
  @Input() recipeForm!: FormGroup;
  @Output() ingredientsSaved = new EventEmitter<void>();

  ingredients!: FormArray;
  recipeSections: any[] = [];
  private recipeId: number | null = null;
  isDirty = false;

  constructor(
    private formBuilder: FormBuilder,
    private itemService: ItemService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.ingredients = this.recipeForm.get('ingredients') as FormArray;
    this.route.params.subscribe(params => {
      this.recipeId = params['id'] ? +params['id'] : null;
      if (this.recipeId) {
        this.loadRecipeSections(this.recipeId);
        this.loadIngredients();
      }
    });
  }

  loadIngredients() {
    if (!this.recipeId) return;
    this.itemService.getRecipeIngredientsByRecipeId(this.recipeId).subscribe({
      next: (ingredientsData: any[]) => {
        this.ingredients.clear();
        ingredientsData.forEach(ing => {
          const sectionId = ing.RecipeSection ? ing.RecipeSection.id : (ing.recipeSectionId || null);
          const control = this.formBuilder.group({
            id: [ing.id || null],
            Ingredient: this.formBuilder.group({
              id: [ing.Ingredient.id],
              name: [ing.Ingredient.name, Validators.required]
            }),
            quantity: [ing.quantity, Validators.required],
            unit: [ing.unit],
            recipeSectionId: [sectionId]
          });
          this.ingredients.push(control);
        });
      },
      error: (error) => {
        console.error('Error loading ingredients:', error);
      }
    });
  }

  loadRecipeSections(recipeId: number) {
    this.itemService.getRecipeSectionsByRecipeId(recipeId).subscribe({
      next: (sections) => { this.recipeSections = sections; },
      error: (error) => {
        // Ignore 404 errors, log other errors
        if (error.status !== 404) {
          console.error('Error loading recipe sections:', error);
        }
      }
    });
  }

  addIngredient() {
    const ingredientForm = this.formBuilder.group({
      Ingredient: this.formBuilder.group({
        name: ['', Validators.required]
      }),
      quantity: [null, Validators.required],
      unit: [''],
      recipeSectionId: [null]
    });
    this.ingredients.push(ingredientForm);
  }

  onRemoveIngredient(index: number) {
    this.ingredients.removeAt(index);
  }

  addSaltAndPepper() {
    this.ingredients.push(
      this.formBuilder.group({
        Ingredient: this.formBuilder.group({ name: ['Sel'] }),
        quantity: [1],
        unit: ['Unit'],
        recipeSectionId: [null]
      })
    );
    this.ingredients.push(
      this.formBuilder.group({
        Ingredient: this.formBuilder.group({ name: ['Poivre'] }),
        quantity: [1],
        unit: ['Unit'],
        recipeSectionId: [null]
      })
    );
  }

  onSectionChange(ingredientControl: AbstractControl, sectionId: any) {
    if (sectionId === 'create') {
      const activeEl = document.activeElement as HTMLElement;
      if (activeEl && activeEl.tagName.toLowerCase() === 'mat-select') {
        activeEl.blur();
      }
      // Delay opening the dialog to let blur complete.
      setTimeout(() => {
        const dialogRef = this.dialog.open(SectionDialogComponent, {
          width: '350px',
          data: {
            recipeId: this.recipeId,
            nextDisplayOrder: this.recipeSections.length + 1
          }
        });
        dialogRef.afterClosed().subscribe((createdSection) => {
          if (createdSection) {
            this.recipeSections.push(createdSection);
            ingredientControl.patchValue({ recipeSectionId: createdSection.id });
            ingredientControl.markAsDirty();
            this.isDirty = true;
          }
        });
      }, 0);
      return;
    }
    if (ingredientControl instanceof FormGroup) {
      ingredientControl.patchValue({ recipeSectionId: sectionId });
      ingredientControl.markAsDirty();
      this.isDirty = true;
    } else {
      console.warn('Expected FormGroup for ingredient control');
    }
  }

  saveIngredients() {
    if (!this.recipeId) return;

    const observables: Observable<any>[] = [];

    this.ingredients.controls.forEach(control => {
      if (control.dirty && control.get('id')?.value) {
        const value = control.value;
        observables.push(
          this.itemService.updateRecipeIngredient(value.id, {
            quantity: value.quantity,
            unit: value.unit,
            recipeSectionId: value.recipeSectionId
          })
        );
      }
    });

    this.ingredients.controls
      .filter(control => !control.get('id')?.value)
      .forEach(control => {
        const value = control.value;
        observables.push(
          this.itemService.createRecipeIngredient({
            ...value,
            recipeId: this.recipeId
          })
        );
      });

    if (observables.length > 0) {
      forkJoin(observables).subscribe({
        next: () => {
          this.isDirty = false;
          this.ingredientsSaved.emit();
          this.loadIngredients();
        },
        error: (error) => {
          console.error('Error saving ingredients:', error);
        }
      });
    }
  }

  getSectionName(sectionId: number | null): string {
    if (!sectionId) return 'No Section';
    const section = this.recipeSections.find(s => s.id === sectionId);
    return section ? section.name : 'No Section';
  }
}