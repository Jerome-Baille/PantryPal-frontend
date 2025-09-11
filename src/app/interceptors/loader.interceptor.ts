import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoaderService } from '../services/loader.service';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  
  // Skip loader for refresh token requests and other background operations
  const skipLoader = req.headers.get('x-skip-loader') === 'true' || 
                    req.url.includes('/refresh') ||
                    req.url.includes('/verify');

  if (skipLoader) {
    return next(req);
  }

  loaderService.showLoader();

  return next(req).pipe(
    finalize(() => loaderService.hideLoader())
  );
};
