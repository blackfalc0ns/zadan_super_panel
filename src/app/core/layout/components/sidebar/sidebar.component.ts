import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, Input, Output, EventEmitter, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { IsActiveMatchOptions, NavigationEnd, Router } from '@angular/router';
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
    
    readonly currentUser$ = this.authService.currentUser$;

    constructor() {
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => this.cdr.markForCheck());
    }

    private readonly exactMatchOptions: IsActiveMatchOptions = {
        paths: 'exact',
        queryParams: 'ignored',
        matrixParams: 'ignored',
        fragment: 'ignored'
    };

    private readonly subsetMatchOptions: IsActiveMatchOptions = {
        paths: 'subset',
        queryParams: 'ignored',
        matrixParams: 'ignored',
        fragment: 'ignored'
    };

    hasAnyPermission(permissions: string[]): boolean {
        return this.accessService.hasAnyPermission(permissions);
    }

    navigateTo(route: string): void {
        if (this.router.url === route) {
            return;
        }

        void this.router.navigateByUrl(route);
    }

    get currentVendorId(): string | null {
        const match = this.router.url.match(/^\/vendors\/([^/?#]+)/);
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

    navItemClasses(route: string, exact = false): string[] {
        return [
            'flex w-full items-center rounded-xl py-2.5 text-start text-[13px] font-bold transition-all duration-500 group relative overflow-hidden',
            this.isCollapsed ? 'justify-center px-0' : 'gap-3 px-3',
            this.isActive(route, exact)
                ? 'bg-gradient-to-r from-white/15 to-transparent border-s-2 border-zadna-accent text-white shadow-[inset_10px_0_20px_-10px_rgba(255,255,255,0.15)]'
                : 'text-white/60 hover:bg-white/10 hover:text-white hover:translate-x-1 border-s-2 border-transparent'
        ];
    }

    private isActive(route: string, exact: boolean): boolean {
        return this.router.isActive(
            route,
            exact ? this.exactMatchOptions : this.subsetMatchOptions);
    }
}
