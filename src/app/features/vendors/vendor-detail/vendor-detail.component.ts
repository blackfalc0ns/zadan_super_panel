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

@Component({
  selector: 'app-vendor-detail',
  standalone: true,
  imports: [CommonModule, VendorDetailHeaderComponent, VendorComplianceComponent, VendorActivityLogComponent, VendorOverviewComponent, VendorProductsComponent, VendorOrdersComponent, VendorFinanceComponent, VendorSettingsComponent, VendorAnalyticsComponent, TranslateModule],
  templateUrl: './vendor-detail.component.html'
})
export class VendorDetailComponent implements OnInit {
  currentTab: string = 'overview';
  currentLang: string = 'ar';
  isRTL: boolean = true;

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
  }

  ngOnInit() {
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
  }

  onViewDetailsClick() {
    console.log('View details clicked');
  }

  onGenerateReportClick() {
    console.log('Generate report clicked');
  }
}