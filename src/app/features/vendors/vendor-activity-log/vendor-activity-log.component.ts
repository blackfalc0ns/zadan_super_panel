import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { SectionHeaderComponent } from '../../../shared/components/ui/section-header/section-header.component';

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
  vendorId: string = 'VND-9928';
  currentLang: string = 'ar';
  isRTL: boolean = true;

  // Stats
  lastInteraction: string = 'اليوم, 10:45';
  openNotes: number = 2;
  weeklyActivity: number = 14;
  weeklyGrowth: string = '+12%';

  internalNotes: InternalNote[] = [
    {
      id: '1',
      author: 'أحمد محمود',
      authorInitials: 'أ.م',
      department: 'القسم المالي',
      departmentColor: 'bg-blue-100 text-blue-700',
      timestamp: 'منذ ساعتين',
      message: 'تم مراجعة الوثائق المالية والحساب البنكي، كل شيء سليم ومطابق للشروط. ننتظر موافقة الامتثال النهائي.',
      avatarClass: 'bg-blue-200 text-blue-700',
      avatarUrl: 'https://i.pravatar.cc/150?u=ahmed',
      borderColor: 'border-l-primary'
    },
    {
      id: '2',
      author: 'سارة خالد',
      authorInitials: 'س.خ',
      department: 'قسم الامتثال',
      departmentColor: 'bg-orange-100 text-orange-700',
      timestamp: 'أمس ١٤:٣٠',
      message: 'الرجاء من التاجر تحديث السجل التجاري حيث أنه يقترب من تاريخ الانتهاء (متبقي أقل من شهرين).',
      avatarClass: 'bg-orange-200 text-orange-700',
      avatarUrl: 'https://i.pravatar.cc/150?u=sara',
      borderColor: 'border-l-accent-orange'
    },
    {
      id: '3',
      author: 'عمر فاروق',
      authorInitials: 'ع.ف',
      department: 'الدعم الفني',
      departmentColor: 'bg-purple-100 text-purple-700',
      timestamp: '٢٥ أكتوبر',
      message: 'تم حل مشكلة الربط مع واجهة برمجة التطبيقات (API) للتاجر. النظام يعمل بكفاءة الآن.',
      avatarClass: 'bg-purple-200 text-purple-700',
      avatarUrl: 'https://i.pravatar.cc/150?u=omar',
      borderColor: 'border-l-slate-400'
    }
  ];

  activityLog: ActivityLogEntry[] = [
    {
      id: '1',
      actionKey: 'ACTIVITY_LOG.ACTION.FINANCIAL_APPROVAL',
      actionIcon: 'check_circle',
      iconColor: 'text-green-500',
      executor: 'أحمد محمود (إدارة)',
      timestamp: '2023-10-28 10:45',
      description: 'اعتماد الحساب البنكي الجديد'
    },
    {
      id: '2',
      actionKey: 'ACTIVITY_LOG.ACTION.BANK_DATA_EDIT',
      actionIcon: 'edit_document',
      iconColor: 'text-blue-500',
      executor: 'التاجر (نظام)',
      timestamp: '2023-10-27 15:20',
      description: 'تحديث رقم الآيبان'
    },
    {
      id: '3',
      actionKey: 'ACTIVITY_LOG.ACTION.COMPLIANCE_WARNING',
      actionIcon: 'warning',
      iconColor: 'text-accent-orange',
      executor: 'سارة خالد (إدارة)',
      timestamp: '2023-10-26 14:30',
      description: 'إرسال إشعار قرب انتهاء السجل'
    },
    {
      id: '4',
      actionKey: 'ACTIVITY_LOG.ACTION.API_UPDATE',
      actionIcon: 'build',
      iconColor: 'text-purple-500',
      executor: 'عمر فاروق (إدارة)',
      timestamp: '2023-10-25 09:15',
      description: 'إعادة ضبط مفاتيح الربط'
    },
    {
      id: '5',
      actionKey: 'ACTIVITY_LOG.ACTION.LOGIN',
      actionIcon: 'login',
      iconColor: 'text-slate-500',
      executor: 'التاجر',
      timestamp: '2023-10-25 08:00',
      description: 'تسجيل دخول ناجح (Riyadh, SA)'
    },
    {
      id: '6',
      actionKey: 'ACTIVITY_LOG.ACTION.PRODUCT_UPLOAD',
      actionIcon: 'upload_file',
      iconColor: 'text-slate-500',
      executor: 'التاجر',
      timestamp: '2023-10-20 11:30',
      description: 'استيراد ملف CSV (50 منتج)'
    },
    {
      id: '7',
      actionKey: 'ACTIVITY_LOG.ACTION.STORE_ACTIVATION',
      actionIcon: 'storefront',
      iconColor: 'text-primary',
      executor: 'نظام الآدمن',
      timestamp: '2023-05-02 10:00',
      description: 'تغيير الحالة إلى نشط'
    }
  ];

  timeline: TimelineEvent[] = [
    {
      id: '1',
      titleKey: 'ACTIVITY_LOG.TIMELINE.COMPLIANCE_APPROVAL',
      descriptionKey: 'ACTIVITY_LOG.TIMELINE.COMPLIANCE_APPROVAL_DESC',
      date: '٠٢ مايو ٢٠٢٣',
      icon: 'verified',
      bgColor: 'bg-primary'
    },
    {
      id: '2',
      titleKey: 'ACTIVITY_LOG.TIMELINE.DOCUMENTS_UPLOAD',
      descriptionKey: 'ACTIVITY_LOG.TIMELINE.DOCUMENTS_UPLOAD_DESC',
      date: '٣٠ أبريل ٢٠٢٣',
      icon: 'folder_open',
      bgColor: 'bg-blue-500'
    },
    {
      id: '3',
      titleKey: 'ACTIVITY_LOG.TIMELINE.ACCOUNT_CREATION',
      descriptionKey: 'ACTIVITY_LOG.TIMELINE.ACCOUNT_CREATION_DESC',
      date: '٢٨ أبريل ٢٠٢٣',
      icon: 'person_add',
      bgColor: 'bg-slate-300'
    }
  ];

  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';
    
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.isRTL = event.lang === 'ar';
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.vendorId = params['id'];
      }
    });
  }

  onAddNote() {
    console.log('Add new internal note');
  }

  onFilterLog() {
    console.log('Filter activity log');
  }

  onExportLog() {
    console.log('Export activity log');
  }
}
