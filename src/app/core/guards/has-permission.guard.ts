import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AccessService } from '../services/access.service';
import { AuthService } from '../services/auth.service';

/**
 * Route guard that checks the route's `data.permission` against the active user's
 * effective permissions. The guard is permission-aware in two ways:
 *
 *  1. It accepts a single `permission` string OR an array `anyPermissions` that
 *     the user must hold any of.
 *  2. If the user object has not been loaded yet (e.g. during a hard refresh
 *     before the AuthService bootstraps), it waits for the first emission of
 *     `currentUser$` before evaluating to avoid spurious redirects.
 */
@Injectable({
  providedIn: 'root'
})
export class HasPermissionGuard {
  constructor(
    private accessService: AccessService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const required = route.data['permission'] as string | undefined;
    const anyOf = route.data['anyPermissions'] as string[] | undefined;

    if (!required && (!anyOf || anyOf.length === 0)) {
      return true;
    }

    const evaluate = (): boolean => {
      if (anyOf && anyOf.length > 0 && this.accessService.hasAnyPermission(anyOf)) {
        return true;
      }
      if (required && this.accessService.hasPermission(required)) {
        return true;
      }
      return false;
    };

    // If we already have a user loaded, evaluate synchronously.
    if (this.authService.currentUserValue) {
      return evaluate() ? true : this.router.createUrlTree(['/unauthorized']);
    }

    // Otherwise wait for the first user emission (or null) before deciding.
    return this.authService.currentUser$.pipe(
      take(1),
      map(() => (evaluate() ? true : this.router.createUrlTree(['/unauthorized'])))
    );
  }
}
