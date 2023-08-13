import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { RecipeDetailComponent } from './components/recipe-detail/recipe-detail.component';
import { RecipeResolver } from './resolvers/recipe.resolver';
import { RecipeFormComponent } from './components/recipe-form/recipe-form.component';


const routes: Routes = [
  { path: 'create', component: RecipeFormComponent },
  { 
    path: 'list', 
    component: RecipeListComponent,
    resolve: { recipes: RecipeResolver } 
  },
  { path: 'detail/:id', component: RecipeDetailComponent},
  { path: 'update/:id', component: RecipeFormComponent},
  { path: '', pathMatch: 'full', redirectTo: 'list' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecipeRoutingModule { }
