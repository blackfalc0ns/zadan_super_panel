import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { VendorService } from '../../../core/services/vendor.service';
import { Vendor, VendorStatus } from '../../../core/models/vendor';
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
  Math = Math;

  vendors: Vendor[] = [];
  isLoading = false;

  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  searchTerm = '';
  statusFilter: string = '';
  isStatusDropdownOpen = false;

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

  selectStatus(status: string) {
    this.statusFilter = status;
    this.isStatusDropdownOpen = false;
    this.onFilterChange();
  }

  loadVendors() {
    this.isLoading = true;
    const statusParam = this.statusFilter ? (this.statusFilter as VendorStatus) : undefined;

    this.vendorService.getVendors(this.pageNumber, this.pageSize, this.searchTerm, statusParam)
      .subscribe({
        next: (response) => {
          this.vendors = response.items ?? [];
          this.pageNumber = response.pageNumber ?? this.pageNumber;
          this.totalPages = response.totalPages ?? 0;
          this.totalCount = response.totalCount ?? 0;
          this.hasPreviousPage = response.hasPreviousPage ?? false;
          this.hasNextPage = response.hasNextPage ?? false;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading vendors', err);
          this.vendors = [];
          this.totalCount = 0;
          this.totalPages = 0;
          this.hasPreviousPage = false;
          this.hasNextPage = false;
          this.isLoading = false;
        }
      });
  }

  onSearch() {
    this.pageNumber = 1;
    this.loadVendors();
  }

  onFilterChange() {
    this.pageNumber = 1;
    this.loadVendors();
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageNumber = newPage;
      this.loadVendors();
    }
  }

  getCommissionLabel(vendor: Vendor): string {
    return vendor.commissionRate == null ? '-' : `${vendor.commissionRate}%`;
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Active': 'نشط',
      'Pending': 'قيد المراجعة',
      'PendingReview': 'قيد المراجعة',
      'Rejected': 'مرفوض',
      'Suspended': 'موقوف'
    };
    return statusMap[status] || status;
  }
}
