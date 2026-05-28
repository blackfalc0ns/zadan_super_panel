import { AfterViewInit, Component, Inject, OnInit, Renderer2, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { filter, take } from 'rxjs';
import { AdminSupportCaseRealtimeService } from './core/services/admin-support-case-realtime.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {
  private readonly cdr = inject(ChangeDetectorRef);
  title = 'superadmin-panel';
  private readonly materialSymbolsDescriptor = '400 24px "Material Symbols Outlined"';
  private initialContentReadySignaled = false;

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private adminSupportCaseRealtime: AdminSupportCaseRealtimeService,
    private router: Router
  ) {
    // Hide Material Symbols text until font loads
    this.loadMaterialSymbolsFont();

    // Determine language from localStorage or default to 'ar'.
    // Whitelist accepted values to prevent injection of arbitrary attribute values
    // when the document direction/lang attributes are set later.
    const ALLOWED_LANGS = ['ar', 'en'] as const;
    const rawLang = (() => {
      try {
        return localStorage.getItem('lang');
      } catch {
        return null;
      }
    })();
    const savedLang = ALLOWED_LANGS.includes(rawLang as typeof ALLOWED_LANGS[number])
      ? (rawLang as typeof ALLOWED_LANGS[number])
      : 'ar';

    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('ar');
    this.translate.use(savedLang);

    // Apply RTL/LTR layout globally
    this.setDocumentDirection(savedLang);

    // Listen to language changes
    this.translate.onLangChange.subscribe((event) => {
      this.cdr.markForCheck();
      this.setDocumentDirection(event.lang);
      localStorage.setItem('lang', event.lang);
    });
  }

  ngOnInit(): void {
    this.adminSupportCaseRealtime.startMonitoring();
  }

  ngAfterViewInit(): void {
    if (this.router.navigated) {
      this.signalInitialContentReady();
      return;
    }

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        take(1)
      )
      .subscribe(() => {
      this.cdr.markForCheck();
      this.signalInitialContentReady();
    });
  }

  private async loadMaterialSymbolsFont(): Promise<void> {
    const body = this.document.body;

    if (!body) {
      return;
    }

    try {
      this.renderer.addClass(body, 'icons-loading');

      const fontSet = this.document.fonts;
      if (!fontSet) {
        window.setTimeout(() => this.renderer.removeClass(body, 'icons-loading'), 1500);
        return;
      }

      if (fontSet.check(this.materialSymbolsDescriptor)) {
        this.renderer.removeClass(body, 'icons-loading');
        return;
      }

      await Promise.race([
        fontSet.load(this.materialSymbolsDescriptor),
        fontSet.ready,
        new Promise((resolve) => window.setTimeout(resolve, 4000))
      ]);

      if (fontSet.check(this.materialSymbolsDescriptor)) {
        this.renderer.removeClass(body, 'icons-loading');
        return;
      }

      // Fallback for browsers that finish loading slightly after the first readiness check.
      window.setTimeout(() => {
        this.renderer.removeClass(body, 'icons-loading');
      }, 1200);
    } catch (error) {
      console.warn('Material Symbols font loading failed:', error);
      window.setTimeout(() => this.renderer.removeClass(body, 'icons-loading'), 1500);
    }
  }

  private setDocumentDirection(lang: string) {
    const htmlTag = this.document.getElementsByTagName('html')[0] as HTMLHtmlElement;
    if (lang === 'ar') {
      this.renderer.setAttribute(htmlTag, 'dir', 'rtl');
      this.renderer.setAttribute(htmlTag, 'lang', 'ar');
    } else {
      this.renderer.setAttribute(htmlTag, 'dir', 'ltr');
      this.renderer.setAttribute(htmlTag, 'lang', 'en');
    }
  }

  private signalInitialContentReady(): void {
    if (this.initialContentReadySignaled) {
      return;
    }

    this.initialContentReadySignaled = true;

    // Wait for the routed component to paint before removing the first-open splash.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          window.dispatchEvent(new CustomEvent('zadna:initial-content-ready'));
        }, 80);
      });
    });
  }
}
