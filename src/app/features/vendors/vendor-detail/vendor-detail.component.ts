import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { VendorDetailHeaderComponent } from '../../../shared/components/ui/vendor-detail-header/vendor-detail-header.component';
import { VendorComplianceComponent } from '../vendor-compliance/vendor-compliance.component';
import { VendorActivityLogComponent } from '../vendor-activity-log/vendor-activity-log.component';
import { VendorOverviewComponent } from '../vendor-overview/vendor-overview.component';
import { VendorProductsComponent } from '../vendor-products/vendor-products.component';
import { VendorOrdersComponent } from '../vendor-orders/vendor-orders.component';
import { VendorFinanceComponent } from '../vendor-finance/vendor-finance.component';
import { VendorSettingsComponent } from '../vendor-settings/vendor-settings.component';
import { VendorAnalyticsComponent } from '../vendor-analytics/vendor-analytics.component';
import { EditOwnerModalComponent, OwnerData } from '../../../shared/components/ui/edit-owner-modal/edit-owner-modal.component';
import { EditLegalBankModalComponent, LegalBankData } from '../../../shared/components/ui/edit-legal-bank-modal/edit-legal-bank-modal.component';
import { EditStoreModalComponent, StoreData } from '../../../shared/components/ui/edit-store-modal/edit-store-modal.component';
import { CrViewerModalComponent, CommercialRegisterData } from '../../../shared/components/ui/cr-viewer-modal/cr-viewer-modal.component';
import { StatusPillComponent, StatusPillVariant } from '../../../shared/components/ui/status-pill/status-pill.component';
import { VendorDetail } from '../../../core/models/vendor';
import { VendorService } from '../../../core/services/vendor.service';

@Component({
  selector: 'app-vendor-detail',
  standalone: true,
  imports: [CommonModule, VendorDetailHeaderComponent, VendorComplianceComponent, VendorActivityLogComponent, VendorOverviewComponent, VendorProductsComponent, VendorOrdersComponent, VendorFinanceComponent, VendorSettingsComponent, VendorAnalyticsComponent, TranslateModule, EditOwnerModalComponent, EditLegalBankModalComponent, EditStoreModalComponent, CrViewerModalComponent, StatusPillComponent],
  templateUrl: './vendor-detail.component.html'
})
export class VendorDetailComponent implements OnInit {
  currentTab: string = 'overview';
  currentLang: string = 'ar';
  isRTL: boolean = true;
  vendorId = 'VND-9928';
  vendorDetail: VendorDetail | null = null;
  showEditOwnerModal = false;
  showEditLegalBankModal = false;
  showEditStoreModal = false;
  showCrViewerModal = false;

  storeData = {
    name: 'مؤسسة التقنية الحديثة التجارية',
    category: 'الإلكترونيات',
    location: 'الرياض',
    phone: '+966 50 123 4567',
    email: 'info@moderntech.com',
    completionRate: '100%',
    joinDate: '15 Jan 2022',
    lastUpdate: '14.39.2023-18:01'
  };

  bankingData = {
    accountHolder: 'محمد أحمد',
    accountNumber: '3001234567890123',
    bankName: 'البنك الأهلي',
    iban: 'SA9876543210987654321',
    swiftCode: 'RJHI SASR',
    cardNumber: '5409 5000 0000 0000 1234 6789',
    expiryDate: '20 Dec 2026'
  };

  legalDocuments = {
    commercialRegister: '1010123456',
    taxNumber: '300123456789012',
    establishmentName: 'مؤسسة التقنية',
    licenseNumber: 'L-987654'
  };

  progressPercentage = 95;

  ownerData: OwnerData = {
    fullName: 'عبدالله بن خالد بن عبدالعزيز',
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
    storeName: 'مؤسسة التقنية الحديثة التجارية',
    activityType: 'electronics',
    city: 'الرياض',
    nationalAddress: '7293 طريق الملك فهد، حي الملقا، الرياض 13524',
    crNumber: '1010123456',
    registrationDate: '15 Jan 2022',
    description: 'متجر متخصص في بيع الإلكترونيات والأجهزة الذكية'
  };

  crData: CommercialRegisterData = {
    crNumber: '1010123456',
    establishmentName: 'شركة زدانة التجارية',
    entityType: 'شركة ذات مسؤولية محدودة',
    expiryDate: '2024-12-31',
    issueDate: '2020-01-15',
    mainActivity: 'تجارة الجملة والتجزئة في المعدات والآلات',
    dataSource: 'منصة واثق (API)',
    verifiedBy: 'النظام الآلي (Zadana-Auto-Verify)',
    internalReference: 'ZAD-CR-99823-2023',
    isExpiringSoon: true,
    capital: '500,000 ريال',
    headquarters: 'الرياض - حي الملقا',
    ownerName: 'عبدالله بن خالد بن عبدالعزيز',
    ownerIdNumber: '10****4321'
  };

  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute,
    private vendorService: VendorService
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';
    
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.isRTL = event.lang === 'ar';

      if (this.vendorDetail) {
        this.applyVendorDetail(this.vendorDetail);
      }
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.vendorId = params['id'];
      }

      this.loadVendor();
    });

    // Check for tab query parameter
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.currentTab = params['tab'];
        // Update header tabs to reflect the active tab
        this.updateHeaderTab(params['tab']);
      }
    });
  }

  onTabChange(tabId: string) {
    this.currentTab = tabId;
  }

  updateHeaderTab(tabId: string) {
    // This will be called by the header component through a service or direct method
    // For now, we'll emit an event that the header can listen to
  }

  onEditClick(section: string) {
    console.log('Edit clicked for:', section);
    if (section === 'owner') {
      this.showEditOwnerModal = true;
    } else if (section === 'legal_bank') {
      this.showEditLegalBankModal = true;
    } else if (section === 'store') {
      this.showEditStoreModal = true;
    }
  }

  onSaveOwnerData(data: OwnerData) {
    console.log('Saving owner data:', data);
    this.ownerData = data;
    this.showEditOwnerModal = false;
  }

  onSaveLegalBankData(data: LegalBankData) {
    console.log('Saving legal bank data:', data);
    this.legalBankData = data;
    this.showEditLegalBankModal = false;
  }

  onSaveStoreData(data: StoreData) {
    console.log('Saving store data:', data);
    this.storeDataModal = data;
    this.showEditStoreModal = false;
  }

  onViewDetailsClick() {
    console.log('View details clicked');
  }

  onGenerateReportClick() {
    console.log('Generate report clicked');
  }

  onViewCrClick() {
    this.showCrViewerModal = true;
  }

  onCrAccept() {
    console.log('CR document accepted');
    this.showCrViewerModal = false;
  }

  onCrDownload() {
    console.log('CR document download requested');
  }

  onCrVerifySource() {
    console.log('CR source verification requested');
  }

  onVerifyAccount() {
    if (!this.vendorDetail) {
      return;
    }

    this.vendorService
      .approveVendorReview(this.vendorDetail.id, this.vendorDetail.commissionRate ?? 13)
      .subscribe((vendor) => this.applyVendorDetail(vendor));
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

  private loadVendor(): void {
    this.vendorService.getVendorById(this.vendorId).subscribe((vendor) => {
      this.applyVendorDetail(vendor);
    });
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
}
