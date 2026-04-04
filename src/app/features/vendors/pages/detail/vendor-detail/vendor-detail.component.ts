import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CrViewerModalComponent, CommercialRegisterData } from '@vendors/components/workflows/cr-viewer-modal/cr-viewer-modal.component';
import { EditLegalBankModalComponent, LegalBankData } from '@vendors/components/workflows/edit-legal-bank-modal/edit-legal-bank-modal.component';
import { EditOwnerModalComponent, OwnerData } from '@vendors/components/workflows/edit-owner-modal/edit-owner-modal.component';
import { EditStoreModalComponent, StoreData } from '@vendors/components/workflows/edit-store-modal/edit-store-modal.component';
import { VendorDetail } from '@vendors/models/vendors.domain.models';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';
import { StatusPillComponent, StatusPillVariant } from '../../../../../shared/components/ui/status-pill/status-pill.component';

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
    StatusPillComponent
  ],
  templateUrl: './vendor-detail.component.html'
})
export class VendorDetailComponent implements OnInit {
  currentLang = 'ar';
  isRTL = true;
  vendorId = 'VND-9928';
  vendorDetail: VendorDetail | null = null;
  showEditOwnerModal = false;
  showEditLegalBankModal = false;
  showEditStoreModal = false;
  showCrViewerModal = false;
  private readonly destroyRef = inject(DestroyRef);

  storeData = {
    name: 'Ã™â€¦Ã˜Â¤Ã˜Â³Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ˜ÂªÃ™â€šÃ™â€ Ã™Å Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â¯Ã™Å Ã˜Â«Ã˜Â© Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â¬Ã˜Â§Ã˜Â±Ã™Å Ã˜Â©',
    category: 'Ã˜Â§Ã™â€žÃ˜Â¥Ã™â€žÃ™Æ’Ã˜ÂªÃ˜Â±Ã™Ë†Ã™â€ Ã™Å Ã˜Â§Ã˜Âª',
    location: 'Ã˜Â§Ã™â€žÃ˜Â±Ã™Å Ã˜Â§Ã˜Â¶',
    phone: '+966 50 123 4567',
    email: 'info@moderntech.com',
    completionRate: '100%',
    joinDate: '15 Jan 2022',
    lastUpdate: '14.39.2023-18:01'
  };

  bankingData = {
    accountHolder: 'Ã™â€¦Ã˜Â­Ã™â€¦Ã˜Â¯ Ã˜Â£Ã˜Â­Ã™â€¦Ã˜Â¯',
    accountNumber: '3001234567890123',
    bankName: 'Ã˜Â§Ã™â€žÃ˜Â¨Ã™â€ Ã™Æ’ Ã˜Â§Ã™â€žÃ˜Â£Ã™â€¡Ã™â€žÃ™Å ',
    iban: 'SA9876543210987654321',
    swiftCode: 'RJHI SASR',
    cardNumber: '5409 5000 0000 0000 1234 6789',
    expiryDate: '20 Dec 2026'
  };

  legalDocuments = {
    commercialRegister: '1010123456',
    taxNumber: '300123456789012',
    establishmentName: 'Ã™â€¦Ã˜Â¤Ã˜Â³Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ˜ÂªÃ™â€šÃ™â€ Ã™Å Ã˜Â©',
    licenseNumber: 'L-987654'
  };

  progressPercentage = 95;

  ownerData: OwnerData = {
    fullName: 'Ã˜Â¹Ã˜Â¨Ã˜Â¯Ã˜Â§Ã™â€žÃ™â€žÃ™â€¡ Ã˜Â¨Ã™â€  Ã˜Â®Ã˜Â§Ã™â€žÃ˜Â¯ Ã˜Â¨Ã™â€  Ã˜Â¹Ã˜Â¨Ã˜Â¯Ã˜Â§Ã™â€žÃ˜Â¹Ã˜Â²Ã™Å Ã˜Â²',
    idNumber: '10****4321',
    nationality: 'MODALS.OWNER_EDIT.NATIONALITIES.SAUDI',
    email: 'info@moderntech.com',
    phone: '50 123 4567',
    phoneCode: '+966'
  };

  legalBankData: LegalBankData = {
    commercialRegister: '1010123456',
    taxNumber: '300123456700003',
    expiryDate: '2024-05-15',
    bankName: 'alrajhi',
    paymentCycle: 'biweekly',
    iban: '12 8000 0000 6080 1234 5678'
  };

  storeDataModal: StoreData = {
    storeName: 'Ã™â€¦Ã˜Â¤Ã˜Â³Ã˜Â³Ã˜Â© Ã˜Â§Ã™â€žÃ˜ÂªÃ™â€šÃ™â€ Ã™Å Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â¯Ã™Å Ã˜Â«Ã˜Â© Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â¬Ã˜Â§Ã˜Â±Ã™Å Ã˜Â©',
    activityType: 'electronics',
    city: 'Ã˜Â§Ã™â€žÃ˜Â±Ã™Å Ã˜Â§Ã˜Â¶',
    nationalAddress: '7293 Ã˜Â·Ã˜Â±Ã™Å Ã™â€š Ã˜Â§Ã™â€žÃ™â€¦Ã™â€žÃ™Æ’ Ã™ÂÃ™â€¡Ã˜Â¯Ã˜Å’ Ã˜Â­Ã™Å  Ã˜Â§Ã™â€žÃ™â€¦Ã™â€žÃ™â€šÃ˜Â§Ã˜Å’ Ã˜Â§Ã™â€žÃ˜Â±Ã™Å Ã˜Â§Ã˜Â¶ 13524',
    crNumber: '1010123456',
    registrationDate: '15 Jan 2022',
    description: 'Ã™â€¦Ã˜ÂªÃ˜Â¬Ã˜Â± Ã™â€¦Ã˜ÂªÃ˜Â®Ã˜ÂµÃ˜Âµ Ã™ÂÃ™Å  Ã˜Â¨Ã™Å Ã˜Â¹ Ã˜Â§Ã™â€žÃ˜Â¥Ã™â€žÃ™Æ’Ã˜ÂªÃ˜Â±Ã™Ë†Ã™â€ Ã™Å Ã˜Â§Ã˜Âª Ã™Ë†Ã˜Â§Ã™â€žÃ˜Â£Ã˜Â¬Ã™â€¡Ã˜Â²Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â°Ã™Æ’Ã™Å Ã˜Â©'
  };

  crData: CommercialRegisterData = {
    crNumber: '1010123456',
    establishmentName: 'Ã˜Â´Ã˜Â±Ã™Æ’Ã˜Â© Ã˜Â²Ã˜Â¯Ã˜Â§Ã™â€ Ã˜Â© Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â¬Ã˜Â§Ã˜Â±Ã™Å Ã˜Â©',
    entityType: 'Ã˜Â´Ã˜Â±Ã™Æ’Ã˜Â© Ã˜Â°Ã˜Â§Ã˜Âª Ã™â€¦Ã˜Â³Ã˜Â¤Ã™Ë†Ã™â€žÃ™Å Ã˜Â© Ã™â€¦Ã˜Â­Ã˜Â¯Ã™Ë†Ã˜Â¯Ã˜Â©',
    expiryDate: '2024-12-31',
    issueDate: '2020-01-15',
    mainActivity: 'Ã˜ÂªÃ˜Â¬Ã˜Â§Ã˜Â±Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¬Ã™â€¦Ã™â€žÃ˜Â© Ã™Ë†Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â¬Ã˜Â²Ã˜Â¦Ã˜Â© Ã™ÂÃ™Å  Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¹Ã˜Â¯Ã˜Â§Ã˜Âª Ã™Ë†Ã˜Â§Ã™â€žÃ˜Â¢Ã™â€žÃ˜Â§Ã˜Âª',
    dataSource: 'Ã™â€¦Ã™â€ Ã˜ÂµÃ˜Â© Ã™Ë†Ã˜Â§Ã˜Â«Ã™â€š (API)',
    verifiedBy: 'Ã˜Â§Ã™â€žÃ™â€ Ã˜Â¸Ã˜Â§Ã™â€¦ Ã˜Â§Ã™â€žÃ˜Â¢Ã™â€žÃ™Å  (Zadana-Auto-Verify)',
    internalReference: 'ZAD-CR-99823-2023',
    isExpiringSoon: true,
    capital: '500,000 Ã˜Â±Ã™Å Ã˜Â§Ã™â€ž',
    headquarters: 'Ã˜Â§Ã™â€žÃ˜Â±Ã™Å Ã˜Â§Ã˜Â¶ - Ã˜Â­Ã™Å  Ã˜Â§Ã™â€žÃ™â€¦Ã™â€žÃ™â€šÃ˜Â§',
    ownerName: 'Ã˜Â¹Ã˜Â¨Ã˜Â¯Ã˜Â§Ã™â€žÃ™â€žÃ™â€¡ Ã˜Â¨Ã™â€  Ã˜Â®Ã˜Â§Ã™â€žÃ˜Â¯ Ã˜Â¨Ã™â€  Ã˜Â¹Ã˜Â¨Ã˜Â¯Ã˜Â§Ã™â€žÃ˜Â¹Ã˜Â²Ã™Å Ã˜Â²',
    ownerIdNumber: '10****4321'
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
    this.ownerData = data;
    this.vendorDetailFacade.updateVendorLocally({
      ownerName: data.fullName,
      ownerEmail: data.email,
      ownerPhone: `${data.phoneCode} ${data.phone}`.trim()
    });
    this.showEditOwnerModal = false;
  }

  onSaveLegalBankData(data: LegalBankData): void {
    this.legalBankData = data;
    this.vendorDetailFacade.updateVendorLocally({
      commercialRegistrationNumber: data.commercialRegister,
      taxId: data.taxNumber
    });
    this.showEditLegalBankModal = false;
  }

  onSaveStoreData(data: StoreData): void {
    this.storeDataModal = data;
    this.vendorDetailFacade.updateVendorLocally({
      businessNameAr: data.storeName,
      businessNameEn: data.storeName,
      businessType: this.translate.instant(`MODALS.STORE_EDIT.ACTIVITIES.${data.activityType}`),
      city: data.city
    });
    this.showEditStoreModal = false;
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

    this.vendorDetailFacade.approveVendorReview(this.vendorDetail.commissionRate ?? 13);
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

    return bankKeys[bankName] ? this.translate.instant(bankKeys[bankName]) : bankName;
  }

  getPaymentCycleLabel(paymentCycle: string): string {
    const cycleKeys: Record<string, string> = {
      weekly: 'MODALS.LEGAL_BANK_EDIT.WEEKLY',
      biweekly: 'MODALS.LEGAL_BANK_EDIT.BIWEEKLY',
      monthly: 'MODALS.LEGAL_BANK_EDIT.MONTHLY'
    };

    return cycleKeys[paymentCycle] ? this.translate.instant(cycleKeys[paymentCycle]) : paymentCycle;
  }

  private applyVendorDetail(vendor: VendorDetail): void {
    this.vendorDetail = vendor;
    this.progressPercentage = vendor.documentsCompleteness || this.progressPercentage;
    this.storeData = {
      ...this.storeData,
      name: this.currentLang === 'ar' ? vendor.businessNameAr : vendor.businessNameEn,
      category: vendor.businessType,
      location: vendor.city || this.storeData.location,
      phone: vendor.contactPhone,
      email: vendor.contactEmail
    };
    this.ownerData = {
      ...this.ownerData,
      fullName: vendor.ownerName,
      email: vendor.ownerEmail,
      phone: vendor.ownerPhone.replace('+966 ', '')
    };
    this.legalBankData = {
      ...this.legalBankData,
      commercialRegister: vendor.commercialRegistrationNumber,
      taxNumber: vendor.taxId || this.legalBankData.taxNumber
    };
    this.storeDataModal = {
      ...this.storeDataModal,
      storeName: this.currentLang === 'ar' ? vendor.businessNameAr : vendor.businessNameEn,
      city: vendor.city || this.storeDataModal.city,
      crNumber: vendor.commercialRegistrationNumber
    };
    this.legalDocuments = {
      ...this.legalDocuments,
      commercialRegister: vendor.commercialRegistrationNumber,
      taxNumber: vendor.taxId || this.legalDocuments.taxNumber
    };
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
