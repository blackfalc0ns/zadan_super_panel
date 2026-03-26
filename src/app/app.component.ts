import { Component, Inject, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'superadmin-panel';
  private readonly materialSymbolsDescriptor = '400 24px "Material Symbols Outlined"';

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2
  ) {
    // Hide Material Symbols text until font loads
    this.loadMaterialSymbolsFont();

    // Determine language from localStorage or default to 'ar'
    const savedLang = localStorage.getItem('lang') || 'ar';

    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('ar');
    this.translate.use(savedLang);

    // Apply RTL/LTR layout globally
    this.setDocumentDirection(savedLang);

    // Listen to language changes
    this.translate.onLangChange.subscribe((event) => {
      this.setDocumentDirection(event.lang);
      localStorage.setItem('lang', event.lang);
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
        if (fontSet.check(this.materialSymbolsDescriptor)) {
          this.renderer.removeClass(body, 'icons-loading');
        }
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
}
