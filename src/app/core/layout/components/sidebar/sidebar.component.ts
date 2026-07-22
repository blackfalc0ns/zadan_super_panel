import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, Input, Output, EventEmitter, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { HasPermissionDirective } from '../../../../shared/directives/has-permission.directive';
import { AuthService } from '../../../../core/services/auth.service';
import { AccessService } from '../../../../core/services/access.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, TranslateModule, HasPermissionDirective],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
    @Input() currentLang: string = 'ar';
    @Input() isCollapsed = false;
    @Output() toggleCollapse = new EventEmitter<void>();

    private readonly router = inject(Router);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly destroyRef = inject(DestroyRef);
    private readonly authService = inject(AuthService);
    private readonly accessService = inject(AccessService);
    private activePath = this.normalizePath(this.router.url);

    readonly currentUser$ = this.authService.currentUser$;

    private readonly baseNavClasses =
        'flex w-full items-center rounded-xl py-2.5 text-start text-[13px] font-bold transition-colors duration-150 group relative overflow-hidden';
    private readonly activeNavClasses =
        'bg-gradient-to-r from-white/15 to-transparent border-s-2 border-zadna-accent text-white shadow-[inset_10px_0_20px_-10px_rgba(255,255,255,0.15)]';
    private readonly idleNavClasses =
        'text-white/60 hover:bg-white/10 hover:text-white border-s-2 border-transparent';

    constructor() {
        this.router.events
            .pipe(
                filter((event): event is NavigationEnd => event instanceof NavigationEnd),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((event) => {
                this.activePath = this.normalizePath(event.urlAfterRedirects);
                this.cdr.markForCheck();
            });
    }

    hasAnyPermission(permissions: string[]): boolean {
        return this.accessService.hasAnyPermission(permissions);
    }

    navigateTo(route: string): void {
        const target = this.normalizePath(route);
        if (this.activePath === target) {
            return;
        }

        void this.router.navigateByUrl(route);
    }

    get currentVendorId(): string | null {
        const match = this.activePath.match(/^\/vendors\/([^/]+)/);
        const candidate = match?.[1]?.trim();
        return candidate && candidate !== 'view' ? candidate : null;
    }

    get currentVendorDisputesRoute(): string | null {
        return this.currentVendorId ? `/vendors/${this.currentVendorId}/disputes` : null;
    }

    get isInsideVendorDetail(): boolean {
        return this.currentVendorId !== null;
    }

    get isVendorDisputesActive(): boolean {
        const route = this.currentVendorDisputesRoute;
        return route ? this.isActive(route, true) : false;
    }

    navItemClasses(route: string, exact = false): string {
        const layout = this.isCollapsed ? 'justify-center px-0' : 'gap-3 px-3';
        const state = this.isActive(route, exact) ? this.activeNavClasses : this.idleNavClasses;
        return `${this.baseNavClasses} ${layout} ${state}`;
    }

    private isActive(route: string, exact: boolean): boolean {
        const target = this.normalizePath(route);
        if (exact) {
            return this.activePath === target;
        }

        return this.activePath === target || this.activePath.startsWith(`${target}/`);
    }

    private normalizePath(url: string): string {
        const path = (url || '/').split('?')[0].split('#')[0] || '/';
        return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
    }
}
