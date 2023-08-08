import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RecipeService } from 'src/app/services/recipe.service';
import { LoaderService } from 'src/app/services/loader.service';
import { Recipe } from 'src/app/models/recipe.model';
import { Observable } from 'rxjs';
import { take, finalize } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RecipeResolver implements Resolve<Recipe[]> {
  constructor(
    private recipeService: RecipeService,
    private loaderService: LoaderService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Recipe[]> {
    this.loaderService.showLoader();

    return this.recipeService.getRecipes().pipe(
      take(1),
      finalize(() => this.loaderService.hideLoader())
    );
  }
}
