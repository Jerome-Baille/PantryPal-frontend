import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecipeCreateComponent } from './components/recipe-create/recipe-create.component';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { RecipeDetailComponent } from './components/recipe-detail/recipe-detail.component';


const routes: Routes = [
  { path: 'create', component: RecipeCreateComponent },
  { path: 'list', component: RecipeListComponent },
  { path: 'detail/:id', component: RecipeDetailComponent},
  { path: '', pathMatch: 'full', redirectTo: 'list' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecipeRoutingModule { }
