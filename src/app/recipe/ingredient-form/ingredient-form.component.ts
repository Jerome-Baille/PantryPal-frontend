import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { ItemService } from 'src/app/services/item.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, forkJoin, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SectionDialogComponent } from '../section-dialog/section-dialog.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { IngredientService } from 'src/app/services/ingredient.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-ingredient-form',
    standalone: true,
    imports: [
      CommonModule, 
      ReactiveFormsModule, 
      MatFormFieldModule, 
      MatOptionModule, 
      MatIconModule, 
      MatInputModule,
      MatSelectModule,
      MatButtonModule,
      TranslateModule,
      DragDropModule
    ],
    templateUrl: './ingredient-form.component.html',
    styleUrls: ['./ingredient-form.component.scss'],
})
export class IngredientFormComponent implements OnInit, OnDestroy {
  @Input() recipeForm!: FormGroup;

  ingredients!: FormArray;
  recipeSections: any[] = [];
  private recipeId: number | null = null;
  private languageSubscription?: Subscription;
  currentLang: string;

  constructor(
    private formBuilder: FormBuilder,
    private itemService: ItemService,
    private ingredientService: IngredientService, // <-- new injection
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private languageService: LanguageService
  ) {
    this.currentLang = languageService.getCurrentLanguage();
  }

  ngOnInit() {
    this.ingredients = this.recipeForm.get('ingredients') as FormArray;
    this.route.params.subscribe(params => {
      this.recipeId = params['id'] ? +params['id'] : null;
      if (this.recipeId) {
        this.loadRecipeSections(this.recipeId);
        this.loadIngredients();
      }
    });
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(
      lang => this.currentLang = lang
    );
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  loadIngredients() {
    if (!this.recipeId) return;
    this.itemService.getRecipeIngredientsByRecipeId(this.recipeId).subscribe({
      next: (ingredientsData: any[]) => {
        this.ingredients.clear();
        // Sort ingredients by section and displayOrder
        ingredientsData.sort((a, b) => {
          if (a.recipeSectionId !== b.recipeSectionId) {
            return (a.recipeSectionId || 0) - (b.recipeSectionId || 0);
          }
          return (a.displayOrder || 0) - (b.displayOrder || 0);
        });
        
        ingredientsData.forEach((ing, index) => {
          const sectionId = ing.RecipeSection ? ing.RecipeSection.id : (ing.recipeSectionId || null);
          const control = this.formBuilder.group({
            id: [ing.id || null],
            Ingredient: this.formBuilder.group({
              id: [ing.Ingredient.id],
              name: [ing.Ingredient.name, Validators.required]
            }),
            quantity: [ing.quantity, Validators.required],
            unit: [ing.unit],
            recipeSectionId: [sectionId],
            displayOrder: [ing.displayOrder || index]
          });
          this.ingredients.push(control);
        });
      },
      error: (error) => {
        console.error('Error loading ingredients:', error);
      }
    });
  }

  drop(event: CdkDragDrop<any>) {
    moveItemInArray(this.ingredients.controls, event.previousIndex, event.currentIndex);
    
    // Update displayOrder for all ingredients in the same section
    const targetSectionId = event.container.data;
    const sectionIngredients = this.ingredients.controls
      .filter(control => control.get('recipeSectionId')?.value === targetSectionId);

    const observables: Observable<any>[] = [];
    
    sectionIngredients.forEach((control, index) => {
      const id = control.get('id')?.value;
      if (id) {
        control.patchValue({ displayOrder: index });
        observables.push(
          this.itemService.updateRecipeIngredient(id, {
            displayOrder: index,
            quantity: control.get('quantity')?.value,
            unit: control.get('unit')?.value,
            recipeSectionId: control.get('recipeSectionId')?.value
          })
        );
      }
    });

    if (observables.length > 0) {
      forkJoin(observables).subscribe({
        next: () => {
          this.loadIngredients();
        },
        error: (error) => {
          console.error('Error updating ingredient order:', error);
        }
      });
    }
  }

  loadRecipeSections(recipeId: number) {
    this.itemService.getRecipeSectionsByRecipeId(recipeId).subscribe({
      next: (sections) => { 
        this.recipeSections = sections.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
      },
      error: (error) => {
        console.error('Error loading recipe sections:', error);
      }
    });
  }

  addIngredient() {
    const ingredientForm = this.formBuilder.group({
      Ingredient: this.formBuilder.group({ name: ['', Validators.required] }),
      quantity: [null, Validators.required],
      unit: ['Unit'],
      recipeSectionId: [null]
    });
    ingredientForm.markAsDirty();
    this.ingredients.push(ingredientForm);
  }

  onRemoveIngredient(index: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { title: 'Confirm Delete', message: 'Are you sure you want to delete this ingredient?' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const ingredientControl = this.ingredients.at(index);
        const ingredientId = ingredientControl.get('id')?.value;
        if (ingredientId) {
          this.itemService.deleteRecipeIngredient(ingredientId).subscribe({
            next: () => {
              this.ingredients.removeAt(index);
            },
            error: (error) => {
              console.error('Error deleting ingredient:', error);
            }
          });
        } else {
          this.ingredients.removeAt(index);
        }
      }
    });
  }

  addSaltAndPepper() {
    const selForm = this.formBuilder.group({
      Ingredient: this.formBuilder.group({ name: ['Sel'] }),
      quantity: [1],
      unit: ['Unit'],
      recipeSectionId: [null]
    });
    selForm.markAsDirty();
    this.ingredients.push(selForm);
    
    const poivreForm = this.formBuilder.group({
      Ingredient: this.formBuilder.group({ name: ['Poivre'] }),
      quantity: [1],
      unit: ['Unit'],
      recipeSectionId: [null]
    });
    poivreForm.markAsDirty();
    this.ingredients.push(poivreForm);
  }

  onSectionChange(ingredientControl: AbstractControl, event: MatSelectChange) {
    const sectionId = event.value;
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
          }
        });
      }, 0);
      return;
    }
    if (ingredientControl instanceof FormGroup) {
      ingredientControl.patchValue({ recipeSectionId: sectionId });
      ingredientControl.markAsDirty();
    } else {
      console.warn('Expected FormGroup for ingredient control');
    }
  }



  getSectionName(sectionId: number | null): string {
    if (!sectionId) return 'No Section';
    const section = this.recipeSections.find(s => s.id === sectionId);
    return section ? section.name : 'No Section';
  }

  getIngredientsForSection(sectionId: number | null) {
    return this.ingredients.controls.filter(control => 
      control.get('recipeSectionId')?.value === sectionId
    );
  }

  getFormGroupIndex(control: AbstractControl): number {
    return this.ingredients.controls.indexOf(control);
  }
}