import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StatusPillComponent, StatusPillVariant } from '../../../../../shared/components/ui/status-pill/status-pill.component';
import { CrViewerModalComponent, CommercialRegisterData } from '@vendors/components/workflows/cr-viewer-modal/cr-viewer-modal.component';
import { EditLegalBankModalComponent, LegalBankData } from '@vendors/components/workflows/edit-legal-bank-modal/edit-legal-bank-modal.component';
import { EditOwnerModalComponent, OwnerData } from '@vendors/components/workflows/edit-owner-modal/edit-owner-modal.component';
import { EditStoreModalComponent, StoreData } from '@vendors/components/workflows/edit-store-modal/edit-store-modal.component';
import { VendorDetail } from '@vendors/models/vendors.domain.models';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';

@Component({
  selector: 'app-vendor-detail',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    EditOwnerModalComponent,
    EditLegalBankModalComponent,
    EditStoreModalComponent,
    CrViewerModalComponent,
    StatusPillComponent,
    FormsModule
  ],
  templateUrl: './vendor-detail.component.html'
})
export class VendorDetailComponent implements OnInit {
  currentLang = 'ar';
  isRTL = true;
  vendorId = '';
  vendorDetail: VendorDetail | null = null;
  showEditOwnerModal = false;
  showEditLegalBankModal = false;
  showEditStoreModal = false;
  showCrViewerModal = false;

  showApproveModal = false;
  showRejectModal = false;
  commissionRate = 12;
  modalError = '';
  rejectionNotes = '';
  submitting = false;

  private readonly destroyRef = inject(DestroyRef);

  storeData = {
    name: '',
    category: '',
    location: '',
    phone: '',
    email: '',
    completionRate: '0%',
    joinDate: '',
    lastUpdate: ''
  };

  bankingData = {
    accountHolder: '',
    accountNumber: '',
    bankName: '',
    iban: '',
    swiftCode: '',
    cardNumber: '',
    expiryDate: ''
  };

  legalDocuments = {
    commercialRegister: '',
    taxNumber: '',
    establishmentName: '',
    licenseNumber: ''
  };

  progressPercentage = 0;

  ownerData: OwnerData = {
    fullName: '',
    idNumber: '',
    nationality: 'MODALS.OWNER_EDIT.NATIONALITIES.SAUDI',
    email: '',
    phone: '',
    phoneCode: '+966'
  };

  legalBankData: LegalBankData = {
    commercialRegister: '',
    taxNumber: '',
    expiryDate: '',
    bankName: '',
    paymentCycle: '',
    iban: ''
  };

  storeDataModal: StoreData = {
    businessNameAr: '',
    businessNameEn: '',
    activityType: '',
    region: '',
    city: '',
    nationalAddress: '',
    commercialRegistrationNumber: '',
    registrationDate: '',
    descriptionAr: '',
    descriptionEn: ''
  };

  crData: CommercialRegisterData = {
    crNumber: '',
    establishmentName: '',
    entityType: '',
    expiryDate: '',
    issueDate: '',
    mainActivity: '',
    dataSource: 'API',
    verifiedBy: '',
    internalReference: '',
    isExpiringSoon: false,
    capital: '',
    headquarters: '',
    ownerName: '',
    ownerIdNumber: ''
  };

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

        if (this.vendorDetail) {
          this.applyVendorDetail(this.vendorDetail);
        }
      });
  }

  ngOnInit(): void {
    this.vendorDetailFacade.vendor$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendor) => {
        if (!vendor) {
          return;
        }

        this.vendorId = vendor.id;
        this.applyVendorDetail(vendor);
      });
  }

  onEditClick(section: string): void {
    if (section === 'owner') {
      this.showEditOwnerModal = true;
    } else if (section === 'legal_bank') {
      this.showEditLegalBankModal = true;
    } else if (section === 'store') {
      this.showEditStoreModal = true;
    }
  }

  onSaveOwnerData(data: OwnerData): void {
    this.modalError = '';
    this.vendorDetailFacade.updateVendorOwnerRequest({
      ownerName: data.fullName,
      ownerEmail: data.email,
      ownerPhone: `${data.phoneCode} ${data.phone}`.trim(),
      idNumber: data.idNumber || null,
      nationality: data.nationality
    })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.ownerData = data;
          this.showEditOwnerModal = false;
        },
        error: () => {
          this.modalError = this.vendorDetailFacade.mutationError || 'Unable to save owner data right now.';
        }
      });
  }

  onSaveLegalBankData(data: LegalBankData): void {
    this.modalError = '';
    const normalizedIban = this.normalizeIban(data.iban);
    this.vendorDetailFacade.updateVendorLegalBankingRequest({
      commercialRegistrationNumber: data.commercialRegister,
      commercialRegistrationExpiryDate: data.expiryDate || null,
      taxId: data.taxNumber,
      licenseNumber: this.vendorDetail?.licenseNumber || null,
      bankName: data.bankName,
      accountHolderName: this.vendorDetail?.primaryBankAccount?.accountHolderName || this.vendorDetail?.ownerName || '',
      iban: normalizedIban,
      swiftCode: this.vendorDetail?.primaryBankAccount?.swiftCode || null,
      payoutCycle: data.paymentCycle,
      commercialRegisterDocumentUrl: this.vendorDetail?.commercialRegisterDocumentUrl || null
    })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.legalBankData = data;
          this.showEditLegalBankModal = false;
        },
        error: () => {
          this.modalError = this.vendorDetailFacade.mutationError || 'Unable to save legal and banking data right now.';
        }
      });
  }

  onSaveStoreData(data: StoreData): void {
    this.modalError = '';
    this.vendorDetailFacade.updateVendorStoreRequest({
      businessNameAr: data.businessNameAr,
      businessNameEn: data.businessNameEn,
      businessType: this.toBusinessTypeValue(data.activityType),
      contactEmail: this.vendorDetail?.contactEmail || '',
      contactPhone: this.vendorDetail?.contactPhone || '',
      descriptionAr: this.nullIfEmpty(data.descriptionAr),
      descriptionEn: this.nullIfEmpty(data.descriptionEn),
      logoUrl: this.vendorDetail?.logoUrl || null,
      commercialRegisterDocumentUrl: this.vendorDetail?.commercialRegisterDocumentUrl || null,
      region: this.nullIfEmpty(data.region),
      city: this.nullIfEmpty(data.city),
      nationalAddress: this.nullIfEmpty(data.nationalAddress),
      commercialRegistrationNumber: this.nullIfEmpty(data.commercialRegistrationNumber)
    })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.storeDataModal = data;
          this.showEditStoreModal = false;
        },
        error: () => {
          this.modalError = this.vendorDetailFacade.mutationError || 'Unable to save store data right now.';
        }
      });
  }

  onViewCrClick(): void {
    this.showCrViewerModal = true;
  }

  onCrAccept(): void {
    this.showCrViewerModal = false;
  }

  onCrDownload(): void {
    this.downloadTextFile(
      `commercial-register-${this.vendorId}.txt`,
      [
        `CR Number: ${this.crData.crNumber}`,
        `Establishment: ${this.crData.establishmentName}`,
        `Issue Date: ${this.crData.issueDate}`,
        `Expiry Date: ${this.crData.expiryDate}`
      ].join('\n')
    );
  }

  onCrVerifySource(): void {
    const reference = this.crData.internalReference || this.crData.crNumber;
    void navigator.clipboard?.writeText(reference);
  }

  onVerifyAccount(): void {
    if (!this.vendorDetail) {
      return;
    }

    if (this.vendorDetail.status === 'Pending') {
      this.modalError = '';
      this.showApproveModal = true;
    }
  }

  confirmApprove(): void {
    if (!this.vendorDetail || this.submitting) {
      return;
    }

    this.submitting = true;
    this.modalError = '';
    this.vendorDetailFacade.approveVendorReviewRequest(this.commissionRate)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.showApproveModal = false;
        },
        error: () => {
          this.modalError = this.vendorDetailFacade.mutationError || 'Unable to approve the vendor right now.';
          this.submitting = false;
        },
        complete: () => {
          this.submitting = false;
        }
      });
  }

  openRejectModal(): void {
    this.rejectionNotes = '';
    this.modalError = '';
    this.showRejectModal = true;
  }

  confirmReject(): void {
    if (!this.vendorDetail || !this.rejectionNotes.trim() || this.submitting) {
      return;
    }

    this.submitting = true;
    this.modalError = '';
    this.vendorDetailFacade.rejectVendorReviewRequest(this.rejectionNotes)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.showRejectModal = false;
          this.rejectionNotes = '';
        },
        error: () => {
          this.modalError = this.vendorDetailFacade.mutationError || 'Unable to reject the vendor right now.';
          this.submitting = false;
        },
        complete: () => {
          this.submitting = false;
        }
      });
  }

  getCurrentStatusLabel(): string {
    const map: Record<string, string> = {
      Active: 'COMMON.ACTIVE',
      Pending: 'VENDORS.STATUS.PENDING',
      Suspended: 'VENDORS.STATUS.SUSPENDED',
      Rejected: 'VENDORS.STATUS.REJECTED'
    };

    return map[this.vendorDetail?.status || ''] ?? 'VENDORS.STATUS.PENDING';
  }

  getCurrentStatusVariant(): StatusPillVariant {
    const map: Record<string, StatusPillVariant> = {
      Active: 'success',
      Pending: 'warning',
      Suspended: 'danger',
      Rejected: 'danger'
    };

    return map[this.vendorDetail?.status || ''] ?? 'neutral';
  }

  getVerificationLabel(): string {
    const map: Record<string, string> = {
      Verified: 'VENDOR_DETAIL.STATUS_VERIFIED',
      Pending: 'VENDORS.STATUS.PENDING',
      Unverified: 'VENDOR_REVIEW.STATUS.UNVERIFIED'
    };

    return map[this.vendorDetail?.verificationStatus || ''] ?? 'VENDORS.STATUS.PENDING';
  }

  getVerificationVariant(): StatusPillVariant {
    const map: Record<string, StatusPillVariant> = {
      Verified: 'success',
      Pending: 'warning',
      Unverified: 'neutral'
    };

    return map[this.vendorDetail?.verificationStatus || ''] ?? 'neutral';
  }

  getBankNameLabel(bankName: string): string {
    const bankKeys: Record<string, string> = {
      alrajhi: 'MODALS.LEGAL_BANK_EDIT.BANKS.ALRAJHI',
      alahli: 'MODALS.LEGAL_BANK_EDIT.BANKS.ALAHLI',
      inma: 'MODALS.LEGAL_BANK_EDIT.BANKS.INMA',
      alinma: 'MODALS.LEGAL_BANK_EDIT.BANKS.ALINMA'
    };

    const normalized = (bankName || '').toLowerCase();
    return bankKeys[normalized] ? this.translate.instant(bankKeys[normalized]) : bankName;
  }

  getPaymentCycleLabel(paymentCycle: string): string {
    const cycleKeys: Record<string, string> = {
      weekly: 'MODALS.LEGAL_BANK_EDIT.WEEKLY',
      biweekly: 'MODALS.LEGAL_BANK_EDIT.BIWEEKLY',
      monthly: 'MODALS.LEGAL_BANK_EDIT.MONTHLY'
    };

    const normalized = (paymentCycle || '').toLowerCase();
    return cycleKeys[normalized] ? this.translate.instant(cycleKeys[normalized]) : paymentCycle;
  }

  getDisplayStoreName(vendor: VendorDetail | null = this.vendorDetail): string {
    if (!vendor) {
      return '---';
    }

    const preferred = this.currentLang === 'ar' ? vendor.businessNameAr : vendor.businessNameEn;
    const alternate = this.currentLang === 'ar' ? vendor.businessNameEn : vendor.businessNameAr;
    return preferred?.trim() || alternate?.trim() || vendor.ownerName?.trim() || vendor.contactEmail?.trim() || '---';
  }

  getDisplayBusinessType(businessType?: string | null): string {
    const normalized = (businessType || '').trim();
    if (!normalized) {
      return '---';
    }

    const keyMap: Record<string, string> = {
      electronics: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.ELECTRONICS',
      food: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.FOOD',
      grocery: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.FOOD',
      fashion: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.FASHION',
      home: 'MODALS.STORE_EDIT.ACTIVITY_TYPES.HOME'
    };

    const translatedKey = keyMap[normalized.toLowerCase()];
    if (translatedKey) {
      return this.translate.instant(translatedKey);
    }

    return normalized
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (value) => value.toUpperCase());
  }

  getDisplayReviewer(): string {
    const explicitReviewer = this.vendorDetail?.approvedBy?.trim();
    if (explicitReviewer) {
      return explicitReviewer;
    }

    const noteAuthor = this.vendorDetail?.reviewNotes?.find((note) => !!note.authorName?.trim())?.authorName?.trim();
    return noteAuthor || '---';
  }

  private applyVendorDetail(vendor: VendorDetail): void {
    const ownerPhone = this.parsePhone(vendor.ownerPhone || vendor.contactPhone);
    const storeName = this.getDisplayStoreName(vendor);
    const bankName = (vendor.primaryBankAccount?.bankName || '').toLowerCase();
    const payoutCycle = (vendor.payoutCycle || '').toLowerCase();

    this.vendorDetail = vendor;
    this.progressPercentage = vendor.documentsCompleteness ?? 0;
    this.storeData = {
      name: storeName,
      category: vendor.businessType,
      location: vendor.city || vendor.region || '',
      phone: vendor.contactPhone,
      email: vendor.contactEmail,
      completionRate: `${vendor.documentsCompleteness ?? 0}%`,
      joinDate: vendor.createdAtUtc,
      lastUpdate: vendor.updatedAtUtc || vendor.reviewUpdatedAtUtc || vendor.createdAtUtc
    };

    this.bankingData = {
      accountHolder: vendor.primaryBankAccount?.accountHolderName || vendor.ownerName,
      accountNumber: '',
      bankName,
      iban: vendor.primaryBankAccount?.iban || '',
      swiftCode: vendor.primaryBankAccount?.swiftCode || '',
      cardNumber: '',
      expiryDate: vendor.commercialRegistrationExpiryDate || ''
    };

    this.ownerData = {
      fullName: vendor.ownerName,
      idNumber: vendor.idNumber || '',
      nationality: vendor.nationality || 'MODALS.OWNER_EDIT.NATIONALITIES.SAUDI',
      email: vendor.ownerEmail,
      phone: ownerPhone.number,
      phoneCode: ownerPhone.code
    };

    this.legalBankData = {
      commercialRegister: vendor.commercialRegistrationNumber,
      taxNumber: vendor.taxId || '',
      expiryDate: vendor.commercialRegistrationExpiryDate || '',
      bankName,
      paymentCycle: payoutCycle,
      iban: this.formatIbanForDisplay(vendor.primaryBankAccount?.iban || '')
    };

    this.storeDataModal = {
      businessNameAr: vendor.businessNameAr || '',
      businessNameEn: vendor.businessNameEn || '',
      activityType: this.resolveActivityType(vendor.businessType),
      region: vendor.region || '',
      city: vendor.city || '',
      nationalAddress: vendor.nationalAddress || '',
      commercialRegistrationNumber: vendor.commercialRegistrationNumber,
      registrationDate: vendor.createdAtUtc,
      descriptionAr: vendor.descriptionAr || '',
      descriptionEn: vendor.descriptionEn || ''
    };

    this.legalDocuments = {
      commercialRegister: vendor.commercialRegistrationNumber,
      taxNumber: vendor.taxId || '',
      establishmentName: storeName,
      licenseNumber: vendor.licenseNumber || ''
    };

    this.crData = {
      crNumber: vendor.commercialRegistrationNumber,
      establishmentName: storeName,
      entityType: vendor.businessType,
      expiryDate: vendor.commercialRegistrationExpiryDate || '',
      issueDate: vendor.createdAtUtc,
      mainActivity: vendor.businessType,
      dataSource: 'API',
      verifiedBy: vendor.approvedBy || '',
      internalReference: vendor.id,
      isExpiringSoon: this.isExpiringSoon(vendor.commercialRegistrationExpiryDate),
      capital: '',
      headquarters: vendor.nationalAddress || vendor.city || '',
      ownerName: vendor.ownerName,
      ownerIdNumber: vendor.idNumber || ''
    };
  }

  private parsePhone(phone: string): { code: string; number: string } {
    const normalized = (phone || '').trim();
    if (!normalized) {
      return { code: '+966', number: '' };
    }

    const [code, ...rest] = normalized.split(' ');
    if (code.startsWith('+') && rest.length > 0) {
      return { code, number: rest.join(' ') };
    }

    return { code: '+966', number: normalized.replace(/^\+966\s*/, '') };
  }

  private formatIbanForDisplay(iban: string): string {
    return (iban || '').replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
  }

  private normalizeIban(iban: string): string {
    const sanitized = (iban || '').replace(/\s+/g, '').toUpperCase();
    if (!sanitized) {
      return '';
    }

    return sanitized.startsWith('SA') ? sanitized : `SA${sanitized}`;
  }

  private resolveActivityType(businessType: string): string {
    const normalized = (businessType || '').toLowerCase();
    if (normalized.includes('elect')) {
      return 'electronics';
    }

    if (normalized.includes('food') || normalized.includes('grocery')) {
      return 'food';
    }

    if (normalized.includes('fashion')) {
      return 'fashion';
    }

    if (normalized.includes('home')) {
      return 'home';
    }

    return normalized || 'electronics';
  }

  private toBusinessTypeValue(activityType: string): string {
    const normalized = (activityType || '').trim().toLowerCase();
    const mapping: Record<string, string> = {
      electronics: 'Electronics',
      food: 'Food',
      fashion: 'Fashion',
      home: 'Home'
    };

    return mapping[normalized] ?? this.vendorDetail?.businessType ?? 'Retail';
  }

  private nullIfEmpty(value: string): string | null {
    const normalized = value.trim();
    return normalized ? normalized : null;
  }

  private isExpiringSoon(value?: string | null): boolean {
    if (!value) {
      return false;
    }

    const expiry = new Date(value);
    const diff = expiry.getTime() - Date.now();
    return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 30;
  }

  private downloadTextFile(fileName: string, content: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = objectUrl;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(objectUrl);
  }
}
