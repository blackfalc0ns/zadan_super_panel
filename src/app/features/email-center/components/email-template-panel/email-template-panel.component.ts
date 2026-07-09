import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { EmailPreviewLocale, EmailTemplatePreview } from '../../models/email-center.models';
import { buildEmailTemplatePreviewHtml } from '../../utils/email-template-html.util';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-email-template-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './email-template-panel.component.html',
  styleUrl: './email-template-panel.component.scss'
})
export class EmailTemplatePanelComponent implements OnChanges, OnInit {
  private readonly sanitizer = inject(DomSanitizer);

  @Input() template!: EmailTemplatePreview;
  @Input() canEdit = false;
  @Input() senderName = '-';
  @Input() triggerNotesKey = '';

  @Output() templateChange = new EventEmitter<void>();

  previewLocale: EmailPreviewLocale = 'en';
  previewMode: 'sample' | 'raw' = 'sample';
  previewHtml: SafeHtml = '';

  ngOnInit(): void {
    this.refreshPreview();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['template']) {
      this.refreshPreview();
    }
  }

  setPreviewLocale(locale: EmailPreviewLocale): void {
    this.previewLocale = locale;
    this.refreshPreview();
  }

  setPreviewMode(mode: 'sample' | 'raw'): void {
    this.previewMode = mode;
    this.refreshPreview();
  }

  onFieldChanged(): void {
    this.refreshPreview();
    this.templateChange.emit();
  }

  insertVariable(variable: string, field: 'subject' | 'body'): void {
    if (!this.canEdit) {
      return;
    }

    const key = this.previewLocale;
    const current = this.template[field][key] ?? '';
    this.template[field][key] = current ? `${current} ${variable}` : variable;
    this.onFieldChanged();
  }

  get activeSubject(): string {
    return this.template.subject[this.previewLocale] ?? '';
  }

  set activeSubject(value: string) {
    this.template.subject[this.previewLocale] = value;
  }

  get activeBody(): string {
    return this.template.body[this.previewLocale] ?? '';
  }

  set activeBody(value: string) {
    this.template.body[this.previewLocale] = value;
  }

  get activeHeroUrl(): string {
    return this.previewLocale === 'ar'
      ? this.template.heroImageUrlAr ?? ''
      : this.template.heroImageUrlEn ?? '';
  }

  set activeHeroUrl(value: string) {
    if (this.previewLocale === 'ar') {
      this.template.heroImageUrlAr = value;
      return;
    }

    this.template.heroImageUrlEn = value;
  }

  private refreshPreview(): void {
    const html = buildEmailTemplatePreviewHtml(this.template, {
      previewLocale: this.previewLocale,
      targetUrl: 'https://admin.zadna0.com/email-center',
      useSampleValues: this.previewMode === 'sample'
    });

    this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
