import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { LocalStorageService } from '../services/local-storage.service';

export const loginGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const token = inject(LocalStorageService).getDataByKey('token');
  const address = inject(LocalStorageService).getDataByKey('address');
  const router = inject(Router);
  const currentPath = route.url.map(segment => segment.path).join('/');

  // If user is logged in, block access to signup and redirect to home
  if (token) {
    router.navigate(['/home']);
    return false;
  }

  // If user is trying to access signup
  // if (currentPath === 'signup') {
  //   if (address) {
  //     return true; // Allow signup
  //   } else {
  //     router.navigate(['/']);
  //     return false;
  //   }
  // }

  return true;
};
