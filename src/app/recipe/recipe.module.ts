import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecipeRoutingModule } from './recipe-routing.module';
import { SharedModule } from '../shared/shared.module';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { RecipeDetailComponent } from './components/recipe-detail/recipe-detail.component';
import { IngredientFormComponent } from './components/ingredient-form/ingredient-form.component';
import { BookFormComponent } from './components/book-form/book-form.component';
import { FiltersComponent } from './components/filters/filters.component';
import { RecipeFormComponent } from './components/recipe-form/recipe-form.component';
import { SectionDialogComponent } from './components/section-dialog/section-dialog.component';

@NgModule({
  declarations: [
    RecipeListComponent,
    RecipeDetailComponent,
    IngredientFormComponent,
    BookFormComponent,
    FiltersComponent,
    RecipeFormComponent,
    SectionDialogComponent
  ],
  imports: [
    CommonModule,
    RecipeRoutingModule,
    SharedModule
  ],
  exports: [],
  providers: []
})
export class RecipeModule { }
