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
