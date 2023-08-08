import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecipeRoutingModule } from './recipe-routing.module';
import { RecipeCreateComponent } from './components/recipe-create/recipe-create.component';
import { SharedModule } from '../shared/shared.module';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { RecipeDetailComponent } from './components/recipe-detail/recipe-detail.component';
import { RecipeUpdateComponent } from './components/recipe-update/recipe-update.component';
import { IngredientFormComponent } from './components/ingredient-form/ingredient-form.component';
import { BookFormComponent } from './components/book-form/book-form.component';
import { FiltersComponent } from './components/filters/filters.component';
import { RecipeResolver } from 'src/app/recipe/resolvers/recipe.resolver';

@NgModule({
  declarations: [
    RecipeCreateComponent,
    RecipeListComponent,
    RecipeDetailComponent,
    RecipeUpdateComponent,
    IngredientFormComponent,
    BookFormComponent,
    FiltersComponent
  ],
  imports: [
    CommonModule,
    RecipeRoutingModule,
    SharedModule
  ],
  exports: [
    RecipeCreateComponent
  ],
  providers: [
    RecipeResolver
  ]
})
export class RecipeModule { }
