import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, catchError, debounceTime, finalize, of, switchMap } from 'rxjs';
import { EmailPreviewLocale, EmailTemplatePreview, EmailWorkflowRule } from '../../models/email-center.models';
import { EmailCenterApiService } from '../../services/email-center.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-email-template-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './email-template-panel.component.html',
  styleUrl: './email-template-panel.component.scss'
})
export class EmailTemplatePanelComponent implements OnChanges {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly emailCenterApi = inject(EmailCenterApiService);
  private readonly previewRequest$ = new Subject<void>();

  @Input() rule!: EmailWorkflowRule;
  @Input() canEdit = false;
  @Input() senderName = '-';
  @Input() triggerNotesKey = '';

  @Output() templateChange = new EventEmitter<void>();

  previewLocale: EmailPreviewLocale = 'en';
  previewMode: 'sample' | 'raw' = 'sample';
  previewHtml: SafeHtml = '';
  previewSubjectEn = '';
  previewSubjectAr = '';
  isPreviewLoading = false;
  previewError = '';

  constructor() {
    this.previewRequest$.pipe(
      debounceTime(350),
      switchMap(() => {
        if (!this.rule) {
          return of(null);
        }

        this.isPreviewLoading = true;
        this.previewError = '';
        this.cdr.markForCheck();

        return this.emailCenterApi.previewTemplate(this.rule, {
          useSampleValues: this.previewMode === 'sample',
          targetUrl: 'https://admin.zadna0.com/email-center'
        }).pipe(
          catchError(() => of(null)),
          finalize(() => {
            this.isPreviewLoading = false;
            this.cdr.markForCheck();
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((result) => {
      if (!result) {
        this.previewError = 'EMAIL_CENTER.TEMPLATE.PREVIEW_ERROR';
        this.previewHtml = '';
        this.previewSubjectEn = '';
        this.previewSubjectAr = '';
        this.cdr.markForCheck();
        return;
      }

      this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(result.html);
      this.previewSubjectEn = result.subjectEn;
      this.previewSubjectAr = result.subjectAr;
      this.previewError = '';
      this.cdr.markForCheck();
    });
  }

  get template(): EmailTemplatePreview {
    return this.rule.template;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rule']) {
      this.schedulePreviewRefresh();
    }
  }

  setPreviewLocale(locale: EmailPreviewLocale): void {
    this.previewLocale = locale;
  }

  setPreviewMode(mode: 'sample' | 'raw'): void {
    this.previewMode = mode;
    this.schedulePreviewRefresh();
  }

  onFieldChanged(): void {
    this.schedulePreviewRefresh();
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

  get activePreviewSubject(): string {
    return this.previewLocale === 'ar'
      ? this.previewSubjectAr || this.previewSubjectEn
      : this.previewSubjectEn || this.previewSubjectAr;
  }

  private schedulePreviewRefresh(): void {
    this.previewRequest$.next();
  }
}
