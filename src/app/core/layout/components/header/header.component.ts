import { Component, DestroyRef, ElementRef, EnvironmentInjector, EventEmitter, HostListener, Input, OnInit, Output, ViewChild, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, from, of, Subject, switchMap, tap } from 'rxjs';
import { AdminNotification, AdminNotificationsService } from '../../../services/admin-notifications.service';
import type { AdminGlobalSearchGroup, AdminGlobalSearchResult } from '../../../services/admin-global-search.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
    @ViewChild('searchContainer') searchContainer?: ElementRef<HTMLElement>;
    @Input() currentLang: string = 'ar';
    @Input() isSidebarOpen: boolean = false;
    @Input() unreadNotificationCount: number = 0;
    @Output() languageSwitch = new EventEmitter<void>();
    @Output() toggleSidebar = new EventEmitter<void>();
    @Output() toggleNotificationsPanel = new EventEmitter<void>();
    notifications: AdminNotification[] = [];
    isNotificationsOpen = false;
    searchQuery = '';
    isSearchOpen = false;
    isSearchLoading = false;
    activeResultIndex = -1;
    searchGroups: AdminGlobalSearchGroup[] = [];
    flatResults: AdminGlobalSearchResult[] = [];
    readonly minSearchLength = 2;
    private readonly searchInput$ = new Subject<string>();
    private readonly destroyRef = inject(DestroyRef);
    private readonly environmentInjector = inject(EnvironmentInjector);

    constructor(
        private readonly adminNotificationsService: AdminNotificationsService,
        private readonly router: Router
    ) {}

    ngOnInit(): void {
        this.adminNotificationsService.unreadCount$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((count) => {
      this.cdr.markForCheck();
                this.unreadNotificationCount = count;
            });

        this.adminNotificationsService.recent$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((notifications) => {
      this.cdr.markForCheck();
                this.notifications = notifications;
            });

        this.adminNotificationsService.refreshRecent()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();

        this.searchInput$
            .pipe(
                debounceTime(220),
                distinctUntilChanged(),
                tap((query) => {
                    if (query.length < this.minSearchLength) {
                        this.isSearchLoading = false;
                        this.searchGroups = [];
                        this.flatResults = [];
                        this.activeResultIndex = -1;
                        this.isSearchOpen = query.length > 0;
                    } else {
                        this.isSearchLoading = true;
                        this.isSearchOpen = true;
                    }
                }),
                switchMap((query) => {
                    if (query.length < this.minSearchLength) {
                        return of([] as AdminGlobalSearchGroup[]);
                    }

                    return from(import('../../../services/admin-global-search.service')).pipe(
                        switchMap(({ AdminGlobalSearchService }) =>
                            this.environmentInjector
                                .get(AdminGlobalSearchService)
                                .search(query, this.currentLang === 'en' ? 'en' : 'ar')
                        )
                    );
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((groups) => {
      this.cdr.markForCheck();
                this.isSearchLoading = false;
                this.searchGroups = groups;
                this.rebuildFlatResults(groups);
            });
    }

    onLanguageSwitch() {
        this.languageSwitch.emit();
    }

    onToggleSidebar() {
        this.toggleSidebar.emit();
    }

    reload() {
        window.location.reload();
    }

    toggleNotifications(): void {
        this.isNotificationsOpen = !this.isNotificationsOpen;
        this.toggleNotificationsPanel.emit();
    }

    markAllNotificationsRead(): void {
        this.adminNotificationsService.markAllAsRead()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
    }

    openNotification(notification: AdminNotification): void {
        const targetUrl = this.adminNotificationsService.resolveTargetUrl(notification);
        this.adminNotificationsService.markAsRead(notification.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
      this.cdr.markForCheck();
                this.isNotificationsOpen = false;
                void this.router.navigateByUrl(targetUrl);
            });
    }

    openNotificationCenter(): void {
        this.isNotificationsOpen = false;
        void this.router.navigateByUrl('/notifications');
    }

    openLiveOps(): void {
        const queryParams = { liveOpsRefresh: Date.now() };

        if (this.router.url.startsWith('/live-ops')) {
            void this.router.navigate(['/live-ops'], {
                queryParams,
                queryParamsHandling: 'merge'
            });
            return;
        }

        void this.router.navigate(['/live-ops'], { queryParams });
    }

    onSearchInput(value: string): void {
        this.searchQuery = value;
        this.searchInput$.next(value.trim());
    }

    onSearchFocus(): void {
        if (this.searchQuery.trim().length > 0 || this.searchGroups.length > 0) {
            this.isSearchOpen = true;
        }
    }

    clearSearch(): void {
        this.searchQuery = '';
        this.isSearchLoading = false;
        this.searchGroups = [];
        this.flatResults = [];
        this.activeResultIndex = -1;
        this.isSearchOpen = false;
    }

    handleSearchKeydown(event: KeyboardEvent): void {
        if (!this.shouldShowSearchOverlay) {
            if (event.key === 'Escape') {
                this.clearSearch();
            }
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.moveActiveResult(1);
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.moveActiveResult(-1);
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            const targetIndex = this.activeResultIndex >= 0 ? this.activeResultIndex : 0;
            const result = this.flatResults[targetIndex];
            if (result) {
                this.selectSearchResult(result);
            }
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            this.closeSearchOverlay();
        }
    }

    selectSearchResult(result: AdminGlobalSearchResult): void {
        this.closeSearchOverlay();
        void this.router.navigateByUrl(result.route);
    }

    closeSearchOverlay(): void {
        this.isSearchOpen = false;
        this.activeResultIndex = -1;
    }

    get shouldShowSearchOverlay(): boolean {
        return this.isSearchOpen && (
            this.isSearchLoading ||
            this.searchQuery.trim().length > 0 ||
            this.searchGroups.length > 0
        );
    }

    get isSearchQueryTooShort(): boolean {
        const length = this.searchQuery.trim().length;
        return length > 0 && length < this.minSearchLength;
    }

    get hasSearchResults(): boolean {
        return this.flatResults.length > 0;
    }

    isActiveResult(result: AdminGlobalSearchResult): boolean {
        return this.activeResultIndex === (result.flatIndex ?? -1);
    }

    trackBySearchGroup(index: number, group: AdminGlobalSearchGroup): string {
        return group.source || index.toString();
    }

    trackBySearchResult(index: number, result: AdminGlobalSearchResult): string {
        return `${result.type}:${result.id}:${index}`;
    }

    displayTitle(notification: AdminNotification): string {
        return this.adminNotificationsService.getLocalizedTitle(notification, this.currentLang);
    }

    displayBody(notification: AdminNotification): string {
        return this.adminNotificationsService.getLocalizedBody(notification, this.currentLang);
    }

    priorityLabel(priority?: string | null): string {
        return this.adminNotificationsService.getPriorityLabel(priority, this.currentLang);
    }

    priorityClasses(priority?: string | null): string {
        switch ((priority ?? '').toLowerCase()) {
            case 'critical':
                return 'bg-red-50 text-red-700 border-red-100';
            case 'high':
                return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'low':
                return 'bg-slate-50 text-slate-500 border-slate-100';
            default:
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        }
    }

    trackByNotificationId(index: number, notification: AdminNotification): string {
        return notification.id || index.toString();
    }

    @HostListener('document:mousedown', ['$event'])
    onDocumentMouseDown(event: MouseEvent): void {
        if (!this.shouldShowSearchOverlay) {
            return;
        }

        const target = event.target as Node | null;
        if (target && this.searchContainer?.nativeElement.contains(target)) {
            return;
        }

        this.closeSearchOverlay();
    }

    private moveActiveResult(direction: 1 | -1): void {
        if (this.flatResults.length === 0) {
            this.activeResultIndex = -1;
            return;
        }

        if (this.activeResultIndex === -1) {
            this.activeResultIndex = direction === 1 ? 0 : this.flatResults.length - 1;
            return;
        }

        this.activeResultIndex = (this.activeResultIndex + direction + this.flatResults.length) % this.flatResults.length;
    }

    private rebuildFlatResults(groups: AdminGlobalSearchGroup[]): void {
        let currentIndex = 0;
        this.flatResults = groups.flatMap((group) =>
            group.results.map((result) => {
                result.flatIndex = currentIndex++;
                return result;
            })
        );
        this.activeResultIndex = this.flatResults.length > 0 ? 0 : -1;
    }
}
