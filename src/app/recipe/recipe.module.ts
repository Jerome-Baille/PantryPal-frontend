import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecipeRoutingModule } from './recipe-routing.module';
import { RecipeCreateComponent } from './components/recipe-create/recipe-create.component';
import { SharedModule } from '../shared/shared.module';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { RecipeDetailComponent } from './components/recipe-detail/recipe-detail.component';


@NgModule({
  declarations: [
    RecipeCreateComponent,
    RecipeListComponent,
    RecipeDetailComponent
  ],
  imports: [
    CommonModule,
    RecipeRoutingModule,
    SharedModule
  ],
  exports: [
    RecipeCreateComponent
  ]
})
export class RecipeModule { }
