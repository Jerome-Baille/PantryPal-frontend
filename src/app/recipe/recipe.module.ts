import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecipeRoutingModule } from './recipe-routing.module';
import { SharedModule } from '../shared/shared.module';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { RecipeDetailComponent } from './components/recipe-detail/recipe-detail.component';
import { IngredientFormComponent } from './components/ingredient-form/ingredient-form.component';
import { BookFormComponent } from './components/book-form/book-form.component';
import { FiltersComponent } from './components/filters/filters.component';
import { RecipeResolver } from 'src/app/recipe/resolvers/recipe.resolver';
import { RecipeFormComponent } from './components/recipe-form/recipe-form.component';

@NgModule({
  declarations: [
    RecipeListComponent,
    RecipeDetailComponent,
    IngredientFormComponent,
    BookFormComponent,
    FiltersComponent,
    RecipeFormComponent
  ],
  imports: [
    CommonModule,
    RecipeRoutingModule,
    SharedModule
  ],
  exports: [],
  providers: [
    RecipeResolver
  ]
})
export class RecipeModule { }
