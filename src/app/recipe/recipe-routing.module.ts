import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecipeCreateComponent } from './components/recipe-create/recipe-create.component';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { RecipeDetailComponent } from './components/recipe-detail/recipe-detail.component';
import { RecipeUpdateComponent } from './components/recipe-update/recipe-update.component';
import { RecipeResolver } from './resolvers/recipe.resolver';


const routes: Routes = [
  { path: 'create', component: RecipeCreateComponent },
  { 
    path: 'list', 
    component: RecipeListComponent,
    resolve: { recipes: RecipeResolver } 
  },
  { path: 'detail/:id', component: RecipeDetailComponent},
  { path: 'update/:id', component: RecipeUpdateComponent},
  { path: '', pathMatch: 'full', redirectTo: 'list' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecipeRoutingModule { }
