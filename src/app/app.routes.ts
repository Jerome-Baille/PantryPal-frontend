import { Routes } from '@angular/router';
import { ShoppingListComponent } from './features/shopping-list/shopping-list.component';
import { RecipeListComponent } from './features/recipe/recipe-list/recipe-list.component';
import { RecipeFormComponent } from './features/recipe/recipe-form/recipe-form.component';
import { RecipeDetailComponent } from './features/recipe/recipe-detail/recipe-detail.component';
import { ProfileComponent } from './features/profile/profile.component';
import { authGuard } from './core/guards/auth.guard';
import { environment } from 'src/environments/environment';
import { LoginComponent } from './features/login/login.component';
import { AfterLoginComponent } from './features/login/after-login.component';
import { AfterRegisterComponent } from './features/login/after-register.component';
import { ShareAcceptComponent } from './features/share/share-accept/share-accept.component';

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
            { path: 'auth/dev-login', loadComponent: () => import('./features/login/dev-login.component').then(m => m.DevLoginComponent) }
        ];
    }
    return baseRoutes;
})();
