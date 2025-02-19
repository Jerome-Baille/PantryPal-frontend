import { Routes } from '@angular/router';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';
import { RecipeListComponent } from './recipe/recipe-list/recipe-list.component';
import { RecipeFormComponent } from './recipe/recipe-form/recipe-form.component';
import { LoginComponent } from './login/login.component';
import { RecipeDetailComponent } from './recipe/recipe-detail/recipe-detail.component';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
    { path: 'shopping/list', component: ShoppingListComponent },
    { path: 'recipe/create', component: RecipeFormComponent },
    { path: 'recipe/list', component: RecipeListComponent },
    { path: 'recipe/detail/:id', component: RecipeDetailComponent },
    { path: 'recipe/update/:id', component: RecipeFormComponent },
    { path: 'auth/login', component: LoginComponent },
    { path: 'profile', component: ProfileComponent },
    { path: '', pathMatch: 'full', redirectTo: 'recipe/list' }
];
