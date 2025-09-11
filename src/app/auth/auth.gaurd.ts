import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { LocalStorageService } from '../services/local-storage.service';


@Injectable({
    providedIn: 'root',
  })
  export class AuthGuard implements CanActivate {
    constructor(private router:Router, private localStorageService: LocalStorageService){}
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
      | Observable<boolean | UrlTree>
      | Promise<boolean | UrlTree>
      | boolean
      | UrlTree {
      const token = this.localStorageService.getDataByKey('token');
      if (token) {
        return true;
      } else {
       this.router.navigate(['/login']);
        return false;
      }
    }
  }
