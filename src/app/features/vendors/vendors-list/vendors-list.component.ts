import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VendorService } from '../../../core/services/vendor.service';
import { Vendor, VendorStatus } from '../../../core/models/vendor';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AppButtonComponent } from '../../../shared/components/ui/button/button.component';
import { AppInputComponent } from '../../../shared/components/ui/form-controls/input.component';
import { AppCardComponent } from '../../../shared/components/ui/card/card.component';
import { AppPageHeaderComponent } from '../../../shared/components/ui/page-header/page-header.component';
import { AppBadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import { AppPaginationComponent } from '../../../shared/components/ui/pagination/pagination.component';


@Component({
  selector: 'app-vendors-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterLink,
    TranslateModule,
    AppButtonComponent,
    AppInputComponent,
    AppCardComponent,
    AppPageHeaderComponent,
    AppBadgeComponent,
    AppPaginationComponent
  ],
  templateUrl: './vendors-list.component.html',
  styles: [`
    table {
      border-collapse: separate !important;
      border-spacing: 0 !important;
      table-layout: fixed !important;
    }
    
    thead th {
      position: sticky;
      top: 0;
      background: white;
      z-index: 10;
    }
    
    tbody tr {
      background: rgba(255, 255, 255, 0.5);
    }
    
    tbody tr:hover {
      background: white;
    }
    
    td, th {
      vertical-align: middle !important;
      text-align: center !important;
    }
    
    td:first-child, th:first-child {
      text-align: center !important;
    }
    
    td:nth-child(3), th:nth-child(3) {
      text-align: start !important;
    }
  `]
})
export class VendorsListComponent implements OnInit {
  Math = Math; // Available in template

  vendors: Vendor[] = [];
  isLoading = false;

  // Pagination & Filtering
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  searchTerm = '';
  statusFilter: string = '';
  
  // Dropdown States
  isStatusDropdownOpen = false;

  selectStatus(status: string) {
    this.statusFilter = status;
    this.isStatusDropdownOpen = false;
    this.onFilterChange();
  }

  constructor(
    private vendorService: VendorService,
    public translate: TranslateService
  ) { }

  get activeLang(): string {
    return this.translate.currentLang || 'ar';
  }

  ngOnInit(): void {
    this.loadVendors();
  }

  loadVendors() {
    this.isLoading = true;
    const statusParam = this.statusFilter ? (this.statusFilter as VendorStatus) : undefined;

    this.vendorService.getVendors(this.pageNumber, this.pageSize, this.searchTerm, statusParam)
      .subscribe({
        next: (response) => {
          this.vendors = response.items;

          // FOR VISUAL VERIFICATION: If no vendors are returned (empty DB), add mock data
          if (this.vendors.length === 0 && !this.searchTerm && !this.statusFilter) {
            this.vendors = [
              {
                id: '1',
                userId: 'u1',
                businessNameEn: 'Zadana Global Trade',
                businessNameAr: 'زادانا لتجارة العالمية',
                descriptionEn: 'Import and export of agricultural goods.',
                descriptionAr: 'استيراد وتصدير السلع الزراعية.',
                contactEmail: 'ops@zadana-global.com',
                contactPhone: '+20 123 456 7890',
                commercialRecord: 'CR-12345',
                taxNumber: 'TX-67890',
                commissionRate: 12.5,
                status: VendorStatus.Active,
                isActive: true
              },
              {
                id: '2',
                userId: 'u2',
                businessNameEn: 'EcoSupply Logistics',
                businessNameAr: 'إيكو سبلاي للخدمات اللوجستية',
                descriptionEn: 'Sustainable supply chain solutions.',
                descriptionAr: 'حلول سلاسل التوريد المستدامة.',
                contactEmail: 'verify@ecosupply.io',
                contactPhone: '+966 50 123 4567',
                commercialRecord: null,
                taxNumber: null,
                commissionRate: 8.0,
                status: VendorStatus.Pending,
                isActive: false
              },
              {
                id: '3',
                userId: 'u3',
                businessNameEn: 'Harvest Hub',
                businessNameAr: 'مركز الحصاد',
                descriptionEn: 'Direct farm-to-table platform.',
                descriptionAr: 'منصة مباشرة من المزرعة إلى المائدة.',
                contactEmail: 'admin@harvesthub.net',
                contactPhone: '+971 4 123 4567',
                commercialRecord: 'CR-998877',
                taxNumber: 'TX-554433',
                commissionRate: 15.0,
                status: VendorStatus.Suspended,
                isActive: false
              },
              {
                id: '4',
                userId: 'u4',
                businessNameEn: 'FreshLine Markets',
                businessNameAr: 'أسواق فريش لاين',
                descriptionEn: 'Premium fresh produce retail network.',
                descriptionAr: 'شبكة محلات التجزئة للمنتجات الطازجة الممتازة.',
                contactEmail: 'support@freshline.com',
                contactPhone: '+20 100 987 6543',
                commercialRecord: 'CR-443322',
                taxNumber: 'TX-112233',
                commissionRate: 10.0,
                status: VendorStatus.Rejected,
                isActive: false
              }
            ];
            this.totalCount = this.vendors.length;
            this.totalPages = 1;
          } else {
            this.pageNumber = response.pageNumber;
            this.totalPages = response.totalPages;
            this.totalCount = response.totalCount;
            this.hasPreviousPage = response.hasPreviousPage;
            this.hasNextPage = response.hasNextPage;
          }

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading vendors', err);
          this.isLoading = false;
        }
      });
  }

  onSearch() {
    this.pageNumber = 1; // Reset to first page
    this.loadVendors();
  }

  onFilterChange() {
    this.pageNumber = 1; // Reset to first page
    this.loadVendors();
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageNumber = newPage;
      this.loadVendors();
    }
  }
}
