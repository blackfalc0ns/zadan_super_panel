import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';

interface VerificationItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  status: 'completed' | 'pending' | 'missing';
  statusLabelKey: string;
  iconBgClass: string;
  statusBgClass: string;
}

interface RiskIndicator {
  id: string;
  titleKey: string;
  descriptionKey: string;
  severity: 'high' | 'medium' | 'low';
  severityLabelKey: string;
  icon: string;
  borderClass: string;
  bgClass: string;
  iconClass: string;
  badgeClass: string;
}

interface ComplianceNote {
  id: string;
  authorKey: string;
  authorInitialsAr: string;
  authorInitialsEn: string;
  roleKey: string;
  timestampKey: string;
  messageKey: string;
  avatarClass: string;
}

@Component({
  selector: 'app-vendor-compliance',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './vendor-compliance.component.html'
})
export class VendorComplianceComponent {
  vendorId: string = 'VND-9928';
  currentLang: string = 'ar';
  isRTL: boolean = true;

  verificationItems: VerificationItem[] = [
    {
      id: 'identity',
      titleKey: 'COMPLIANCE.VERIFICATION.IDENTITY',
      descriptionKey: 'COMPLIANCE.VERIFICATION.IDENTITY_DESC',
      icon: 'badge',
      status: 'completed',
      statusLabelKey: 'COMPLIANCE.STATUS.COMPLETED',
      iconBgClass: 'bg-teal-50 text-teal-500',
      statusBgClass: 'bg-teal-50 text-teal-600'
    },
    {
      id: 'commercial',
      titleKey: 'COMPLIANCE.VERIFICATION.COMMERCIAL_REG',
      descriptionKey: 'COMPLIANCE.VERIFICATION.COMMERCIAL_DESC',
      icon: 'storefront',
      status: 'completed',
      statusLabelKey: 'COMPLIANCE.STATUS.COMPLETED',
      iconBgClass: 'bg-teal-50 text-teal-500',
      statusBgClass: 'bg-teal-50 text-teal-600'
    },
    {
      id: 'tax',
      titleKey: 'COMPLIANCE.VERIFICATION.TAX_CERT',
      descriptionKey: 'COMPLIANCE.VERIFICATION.TAX_DESC',
      icon: 'receipt_long',
      status: 'pending',
      statusLabelKey: 'COMPLIANCE.STATUS.UNDER_REVIEW',
      iconBgClass: 'bg-orange-50 text-orange-500',
      statusBgClass: 'bg-orange-50 text-orange-600'
    },
    {
      id: 'bank',
      titleKey: 'COMPLIANCE.VERIFICATION.BANK_ACCOUNT',
      descriptionKey: 'COMPLIANCE.VERIFICATION.BANK_DESC',
      icon: 'account_balance',
      status: 'completed',
      statusLabelKey: 'COMPLIANCE.STATUS.COMPLETED',
      iconBgClass: 'bg-teal-50 text-teal-500',
      statusBgClass: 'bg-teal-50 text-teal-600'
    },
    {
      id: 'license',
      titleKey: 'COMPLIANCE.VERIFICATION.MUNICIPAL_LICENSE',
      descriptionKey: 'COMPLIANCE.VERIFICATION.LICENSE_DESC',
      icon: 'verified',
      status: 'missing',
      statusLabelKey: 'COMPLIANCE.STATUS.MISSING',
      iconBgClass: 'bg-slate-100 text-slate-500',
      statusBgClass: 'bg-slate-100 text-slate-600'
    }
  ];

  riskIndicators: RiskIndicator[] = [
    {
      id: 'cancellation',
      titleKey: 'COMPLIANCE.RISK.HIGH_CANCELLATION',
      descriptionKey: 'COMPLIANCE.RISK.HIGH_CANCELLATION_DESC',
      severity: 'high',
      severityLabelKey: 'COMPLIANCE.SEVERITY.HIGH',
      icon: 'error',
      borderClass: 'border-red-100',
      bgClass: 'bg-red-50/50',
      iconClass: 'text-red-500',
      badgeClass: 'bg-red-100 text-red-700'
    },
    {
      id: 'address',
      titleKey: 'COMPLIANCE.RISK.ADDRESS_MISMATCH',
      descriptionKey: 'COMPLIANCE.RISK.ADDRESS_MISMATCH_DESC',
      severity: 'medium',
      severityLabelKey: 'COMPLIANCE.SEVERITY.MEDIUM',
      icon: 'report_problem',
      borderClass: 'border-orange-100',
      bgClass: 'bg-orange-50/50',
      iconClass: 'text-orange-500',
      badgeClass: 'bg-orange-100 text-orange-700'
    },
    {
      id: 'iban',
      titleKey: 'COMPLIANCE.RISK.IBAN_CHANGES',
      descriptionKey: 'COMPLIANCE.RISK.IBAN_CHANGES_DESC',
      severity: 'low',
      severityLabelKey: 'COMPLIANCE.SEVERITY.LOW',
      icon: 'info',
      borderClass: 'border-slate-200',
      bgClass: 'bg-slate-50',
      iconClass: 'text-slate-500',
      badgeClass: 'bg-slate-200 text-slate-700'
    }
  ];

  complianceNotes: ComplianceNote[] = [
    {
      id: '1',
      authorKey: 'COMPLIANCE.NOTES.AUTHORS.ABDULLAH_MOHAMMED',
      authorInitialsAr: 'ع.م',
      authorInitialsEn: 'A.M',
      roleKey: 'COMPLIANCE.NOTES.ROLES.REVIEW_TEAM',
      timestampKey: 'COMPLIANCE.NOTES.TIMESTAMPS.TODAY_1030',
      messageKey: 'COMPLIANCE.NOTES.MESSAGES.TAX_CERTIFICATE_BLUR',
      avatarClass: 'bg-primary/20 text-primary'
    },
    {
      id: '2',
      authorKey: 'COMPLIANCE.NOTES.AUTHORS.SARAH_FAHAD',
      authorInitialsAr: 'س.ف',
      authorInitialsEn: 'S.F',
      roleKey: 'COMPLIANCE.NOTES.ROLES.RISK_TEAM',
      timestampKey: 'COMPLIANCE.NOTES.TIMESTAMPS.YESTERDAY_0215',
      messageKey: 'COMPLIANCE.NOTES.MESSAGES.CANCELLATION_FOLLOWUP',
      avatarClass: 'bg-slate-200 text-slate-600'
    }
  ];

  newNote: string = '';

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

  onApproveVendor() {
    console.log('Approve vendor:', this.vendorId);
  }

  onRequestDocuments() {
    console.log('Request documents from vendor:', this.vendorId);
  }

  onSuspendAccount() {
    console.log('Suspend vendor account:', this.vendorId);
  }

  onRejectVendor() {
    console.log('Reject vendor:', this.vendorId);
  }

  onAddNote() {
    if (this.newNote.trim()) {
      console.log('Add note:', this.newNote);
      this.newNote = '';
    }
  }

  get verificationCompletedCount(): number {
    return this.verificationItems.filter(item => item.status === 'completed').length;
  }

  get lastReviewerInitials(): string {
    return this.isRTL ? 'م.أ' : 'M.A';
  }
}
