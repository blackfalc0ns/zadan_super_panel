import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { catchError, filter, of, take } from 'rxjs';
import {
  buildLocalizedPageTitle,
  resolveSplashFallbackTitle
} from '../utils/page-title-i18n.util';
import { resolveAdminPageTitleKey } from '../utils/admin-page-title.config';

@Injectable({ providedIn: 'root' })
export class AdminPageTitleService {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly translate = inject(TranslateService);

  private customTitleKey: string | null = null;

  constructor() {
    this.ensureFallbackTitle();

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.customTitleKey = null;
        this.applyTitle();
      });

    this.translate.onLangChange.subscribe(() => this.applyTitle());
    this.translate.onTranslationChange.subscribe(() => this.applyTitle());
    this.translate.onDefaultLangChange.subscribe(() => this.applyTitle());
  }

  /** Override the tab title until the next navigation. */
  setTitleKey(titleKey: string | null): void {
    this.customTitleKey = titleKey;
    this.applyTitle();
  }

  private applyTitle(): void {
    const titleKey =
      this.customTitleKey ??
      this.resolveRouteTitleKey() ??
      resolveAdminPageTitleKey(this.router.url);

    this.translate
      .get([titleKey, 'PAGE_TITLES.BRAND', 'PAGE_TITLES.DEFAULT'])
      .pipe(
        take(1),
        catchError(() => of(null))
      )
      .subscribe((translations: Record<string, string> | null) => {
        if (!translations) {
          this.ensureFallbackTitle();
          return;
        }

        const resolvedTitle = buildLocalizedPageTitle(titleKey, translations);
        if (!resolvedTitle) {
          this.ensureFallbackTitle();
          return;
        }

        this.title.setTitle(resolvedTitle);
      });
  }

  private ensureFallbackTitle(): void {
    const current = this.title.getTitle()?.trim() ?? '';
    if (!current || current === '__APP_TITLE__' || current.includes('PAGE_TITLES.')) {
      const lang = this.translate.currentLang || this.translate.defaultLang || this.readStoredLang();
      this.title.setTitle(resolveSplashFallbackTitle(lang));
    }
  }

  private readStoredLang(): string {
    try {
      const stored = localStorage.getItem('lang');
      return stored === 'en' || stored === 'ar' ? stored : 'ar';
    } catch {
      return 'ar';
    }
  }

  private resolveRouteTitleKey(): string | null {
    let route: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    let titleKey: string | null = null;

    while (route?.firstChild) {
      route = route.firstChild;
      const routeTitleKey = route.data['titleKey'];
      if (typeof routeTitleKey === 'string' && routeTitleKey.trim()) {
        titleKey = routeTitleKey.trim();
      }
    }

    return titleKey;
  }
}
