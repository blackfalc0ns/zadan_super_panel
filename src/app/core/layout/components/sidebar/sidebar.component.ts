import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IsActiveMatchOptions, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
    @Input() currentLang: string = 'ar';

    private readonly router = inject(Router);
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

    navigateTo(route: string): void {
        if (this.router.url === route) {
            return;
        }

        void this.router.navigateByUrl(route);
    }

    get currentVendorDisputesRoute(): string | null {
        const match = this.router.url.match(/^\/vendors\/([^\/?#]+)(?:\/|$)/);
        return match ? `/vendors/${match[1]}/disputes` : null;
    }

    get isInsideVendorDetail(): boolean {
        return this.currentVendorDisputesRoute !== null;
    }

    navItemClasses(route: string, exact = false): string[] {
        return [
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-[13px] font-bold transition-colors group',
            this.isActive(route, exact)
                ? 'bg-white/15 text-white font-black shadow-inner'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
        ];
    }

    private isActive(route: string, exact: boolean): boolean {
        return this.router.isActive(
            route,
            exact ? this.exactMatchOptions : this.subsetMatchOptions);
    }
}
