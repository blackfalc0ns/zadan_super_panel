import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';

interface InternalNote {
  id: string;
  author: string;
  authorInitials: string;
  department: string;
  departmentColor: string;
  timestamp: string;
  message: string;
  avatarClass: string;
  avatarUrl?: string;
  borderColor: string;
}

interface ActivityLogEntry {
  id: string;
  actionKey: string;
  actionIcon: string;
  iconColor: string;
  executor: string;
  timestamp: string;
  description: string;
}

interface TimelineEvent {
  id: string;
  titleKey: string;
  descriptionKey: string;
  date: string;
  icon: string;
  bgColor: string;
}

@Component({
  selector: 'app-vendor-activity-log',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SectionHeaderComponent],
  templateUrl: './vendor-activity-log.component.html',
  styleUrls: ['./vendor-activity-log.component.scss']
})
export class VendorActivityLogComponent {
  vendorId = 'VND-9928';
  currentLang = 'ar';
  isRTL = true;
  showOnlyCritical = false;
  private readonly destroyRef = inject(DestroyRef);

  lastInteraction = 'Ø§Ù„ÙŠÙˆÙ…, 10:45';
  openNotes = 2;
  weeklyActivity = 14;
  weeklyGrowth = '+12%';

  internalNotes: InternalNote[] = [
    {
      id: '1',
      author: 'Ø£Ø­Ù…Ø¯ Ù…Ø­Ù…ÙˆØ¯',
      authorInitials: 'Ø£.Ù…',
      department: 'Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ù…Ø§Ù„ÙŠ',
      departmentColor: 'bg-blue-100 text-blue-700',
      timestamp: 'Ù…Ù†Ø° Ø³Ø§Ø¹ØªÙŠÙ†',
      message: 'ØªÙ… Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„ÙˆØ«Ø§Ø¦Ù‚ Ø§Ù„Ù…Ø§Ù„ÙŠØ© ÙˆØ§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ø¨Ù†ÙƒÙŠØŒ ÙƒÙ„ Ø´ÙŠØ¡ Ø³Ù„ÙŠÙ… ÙˆÙ…Ø·Ø§Ø¨Ù‚ Ù„Ù„Ø´Ø±ÙˆØ·. Ù†Ù†ØªØ¸Ø± Ù…ÙˆØ§ÙÙ‚Ø© Ø§Ù„Ø§Ù…ØªØ«Ø§Ù„ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ.',
      avatarClass: 'bg-blue-200 text-blue-700',
      avatarUrl: 'https://i.pravatar.cc/150?u=ahmed',
      borderColor: 'border-l-primary'
    },
    {
      id: '2',
      author: 'Ø³Ø§Ø±Ø© Ø®Ø§Ù„Ø¯',
      authorInitials: 'Ø³.Ø®',
      department: 'Ù‚Ø³Ù… Ø§Ù„Ø§Ù…ØªØ«Ø§Ù„',
      departmentColor: 'bg-orange-100 text-orange-700',
      timestamp: 'Ø£Ù…Ø³ Ù¡Ù¤:Ù£Ù ',
      message: 'Ø§Ù„Ø±Ø¬Ø§Ø¡ Ù…Ù† Ø§Ù„ØªØ§Ø¬Ø± ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø³Ø¬Ù„ Ø§Ù„ØªØ¬Ø§Ø±ÙŠ Ø­ÙŠØ« Ø£Ù†Ù‡ ÙŠÙ‚ØªØ±Ø¨ Ù…Ù† ØªØ§Ø±ÙŠØ® Ø§Ù„Ø§Ù†ØªÙ‡Ø§Ø¡ (Ù…ØªØ¨Ù‚ÙŠ Ø£Ù‚Ù„ Ù…Ù† Ø´Ù‡Ø±ÙŠÙ†).',
      avatarClass: 'bg-orange-200 text-orange-700',
      avatarUrl: 'https://i.pravatar.cc/150?u=sara',
      borderColor: 'border-l-accent-orange'
    }
  ];

  activityLog: ActivityLogEntry[] = [
    {
      id: '1',
      actionKey: 'ACTIVITY_LOG.ACTION.FINANCIAL_APPROVAL',
      actionIcon: 'check_circle',
      iconColor: 'text-green-500',
      executor: 'Ø£Ø­Ù…Ø¯ Ù…Ø­Ù…ÙˆØ¯ (Ø¥Ø¯Ø§Ø±Ø©)',
      timestamp: '2023-10-28 10:45',
      description: 'Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ø¨Ù†ÙƒÙŠ Ø§Ù„Ø¬Ø¯ÙŠØ¯'
    },
    {
      id: '2',
      actionKey: 'ACTIVITY_LOG.ACTION.BANK_DATA_EDIT',
      actionIcon: 'edit_document',
      iconColor: 'text-blue-500',
      executor: 'Ø§Ù„ØªØ§Ø¬Ø± (Ù†Ø¸Ø§Ù…)',
      timestamp: '2023-10-27 15:20',
      description: 'ØªØ­Ø¯ÙŠØ« Ø±Ù‚Ù… Ø§Ù„Ø¢ÙŠØ¨Ø§Ù†'
    },
    {
      id: '3',
      actionKey: 'ACTIVITY_LOG.ACTION.COMPLIANCE_WARNING',
      actionIcon: 'warning',
      iconColor: 'text-accent-orange',
      executor: 'Ø³Ø§Ø±Ø© Ø®Ø§Ù„Ø¯ (Ø¥Ø¯Ø§Ø±Ø©)',
      timestamp: '2023-10-26 14:30',
      description: 'Ø¥Ø±Ø³Ø§Ù„ Ø¥Ø´Ø¹Ø§Ø± Ù‚Ø±Ø¨ Ø§Ù†ØªÙ‡Ø§Ø¡ Ø§Ù„Ø³Ø¬Ù„'
    }
  ];

  timeline: TimelineEvent[] = [
    {
      id: '1',
      titleKey: 'ACTIVITY_LOG.TIMELINE.COMPLIANCE_APPROVAL',
      descriptionKey: 'ACTIVITY_LOG.TIMELINE.COMPLIANCE_APPROVAL_DESC',
      date: 'Ù Ù¢ Ù…Ø§ÙŠÙˆ Ù¢Ù Ù¢Ù£',
      icon: 'verified',
      bgColor: 'bg-primary'
    },
    {
      id: '2',
      titleKey: 'ACTIVITY_LOG.TIMELINE.DOCUMENTS_UPLOAD',
      descriptionKey: 'ACTIVITY_LOG.TIMELINE.DOCUMENTS_UPLOAD_DESC',
      date: 'Ù£Ù  Ø£Ø¨Ø±ÙŠÙ„ Ù¢Ù Ù¢Ù£',
      icon: 'folder_open',
      bgColor: 'bg-blue-500'
    },
    {
      id: '3',
      titleKey: 'ACTIVITY_LOG.TIMELINE.ACCOUNT_CREATION',
      descriptionKey: 'ACTIVITY_LOG.TIMELINE.ACCOUNT_CREATION_DESC',
      date: 'Ù¢Ù¨ Ø£Ø¨Ø±ÙŠÙ„ Ù¢Ù Ù¢Ù£',
      icon: 'person_add',
      bgColor: 'bg-slate-300'
    }
  ];

  constructor(
    private readonly translate: TranslateService,
    private readonly vendorDetailFacade: VendorDetailFacade
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.currentLang = event.lang;
        this.isRTL = event.lang === 'ar';
      });

    this.vendorDetailFacade.vendorId$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendorId) => {
        if (vendorId) {
          this.vendorId = vendorId;
        }
      });
  }

  get filteredActivityLog(): ActivityLogEntry[] {
    if (!this.showOnlyCritical) {
      return this.activityLog;
    }

    return this.activityLog.filter((entry) => entry.actionKey.includes('WARNING') || entry.actionKey.includes('APPROVAL'));
  }

  onAddNote(): void {
    const now = new Date();
    this.internalNotes = [
      {
        id: `note-${now.getTime()}`,
        author: this.currentLang === 'ar' ? 'فريق العمليات' : 'Operations Team',
        authorInitials: this.currentLang === 'ar' ? 'ف.ع' : 'O.T',
        department: this.currentLang === 'ar' ? 'الإدارة' : 'Operations',
        departmentColor: 'bg-primary/10 text-primary',
        timestamp: now.toLocaleTimeString(this.currentLang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        message: this.currentLang === 'ar'
          ? `تم إنشاء ملاحظة متابعة جديدة للتاجر ${this.vendorId}.`
          : `A follow-up note was created for vendor ${this.vendorId}.`,
        avatarClass: 'bg-primary/20 text-primary',
        borderColor: 'border-l-primary'
      },
      ...this.internalNotes
    ];
    this.openNotes = this.internalNotes.length;
  }

  onFilterLog(): void {
    this.showOnlyCritical = !this.showOnlyCritical;
  }

  onExportLog(): void {
    const rows = this.filteredActivityLog.map((entry) => [
      entry.actionKey,
      entry.executor,
      entry.timestamp,
      entry.description
    ].join(','));

    const blob = new Blob([['Action,Executor,Timestamp,Description', ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `vendor-activity-${this.vendorId}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }
}
