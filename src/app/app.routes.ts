import { Routes } from '@angular/router';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';
import { RecipeListComponent } from './recipe/recipe-list/recipe-list.component';
import { RecipeFormComponent } from './recipe/recipe-form/recipe-form.component';
import { LoginComponent } from './login/login.component';
import { AfterLoginComponent } from './login/after-login.component';
import { AfterRegisterComponent } from './login/after-register.component';
import { RecipeDetailComponent } from './recipe/recipe-detail/recipe-detail.component';
import { ProfileComponent } from './profile/profile.component';
import { ShareAcceptComponent } from './share/share-accept/share-accept.component';
import { authGuard } from './guards/auth.guard';
import { environment } from 'src/environments/environment';

const baseRoutes: Routes = [
    { path: 'shopping/list', component: ShoppingListComponent, canActivate: [authGuard] },
    { path: 'recipe/create', component: RecipeFormComponent, canActivate: [authGuard] },
    { path: 'recipe/list', component: RecipeListComponent, canActivate: [authGuard] },
    { path: 'recipe/detail/:id', component: RecipeDetailComponent, canActivate: [authGuard] },
    { path: 'recipe/update/:id', component: RecipeFormComponent, canActivate: [authGuard] },
    { path: 'auth/login', component: LoginComponent },
    { path: 'auth/after-login', component: AfterLoginComponent },
    { path: 'auth/after-register', component: AfterRegisterComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
    { path: "favorites", component: RecipeListComponent, canActivate: [authGuard] },
    { path: 'share/accept/:token', component: ShareAcceptComponent },
    { path: '', pathMatch: 'full', redirectTo: 'recipe/list' }
];

// Add dev-only route during development only — lazy-loaded so production builds can tree-shake it out
export const routes: Routes = ((): Routes => {
    if (!environment.production) {
        return [
            ...baseRoutes,
            { path: 'auth/dev-login', loadComponent: () => import('./login/dev-login.component').then(m => m.DevLoginComponent) }
        ];
    }
    return baseRoutes;
})();
