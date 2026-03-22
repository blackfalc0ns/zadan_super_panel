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

  private async loadMaterialSymbolsFont() {
    try {
      // Add class to hide icons initially
      this.renderer.addClass(this.document.body, 'icons-loading');
      
      // Wait for Material Symbols font to load
      await (document as any).fonts.load('400 24px "Material Symbols Outlined"');
      
      // Remove hiding class once loaded
      this.renderer.removeClass(this.document.body, 'icons-loading');
    } catch (error) {
      console.warn('Material Symbols font loading failed:', error);
      // Remove class anyway to show icons
      this.renderer.removeClass(this.document.body, 'icons-loading');
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
