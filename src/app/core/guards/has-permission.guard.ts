import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { AccessService } from '../services/access.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HasPermissionGuard {
  constructor(private accessService: AccessService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const requiredPermission = route.data['permission'] as string;
    
    if (!requiredPermission) {
      return true;
    }
    
    if (this.accessService.hasPermission(requiredPermission)) {
      return true;
    }
    
    return this.router.createUrlTree(['/unauthorized']);
  }
}
