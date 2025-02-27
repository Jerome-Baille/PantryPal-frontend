import { Routes } from '@angular/router';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';
import { RecipeListComponent } from './recipe/recipe-list/recipe-list.component';
import { RecipeFormComponent } from './recipe/recipe-form/recipe-form.component';
import { LoginComponent } from './login/login.component';
import { RecipeDetailComponent } from './recipe/recipe-detail/recipe-detail.component';
import { ProfileComponent } from './profile/profile.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'shopping/list', component: ShoppingListComponent, canActivate: [authGuard] },
    { path: 'recipe/create', component: RecipeFormComponent, canActivate: [authGuard] },
    { path: 'recipe/list', component: RecipeListComponent, canActivate: [authGuard] },
    { path: 'recipe/detail/:id', component: RecipeDetailComponent, canActivate: [authGuard] },
    { path: 'recipe/update/:id', component: RecipeFormComponent, canActivate: [authGuard] },
    { path: 'auth/login', component: LoginComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
    { path: "favorites", component: RecipeListComponent, canActivate: [authGuard] },
    { path: '', pathMatch: 'full', redirectTo: 'recipe/list' }
];
