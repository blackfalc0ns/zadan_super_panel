import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  Driver,
  DriverFilters,
  DriverKPIs,
  DriverPerformance,
  DriverStatus,
  VerificationStatus
} from '../../../core/models/driver';
import { DriverService } from '../../../core/services/driver.service';
import { FilterField } from '../../../shared/components/ui/advanced-filter-panel/advanced-filter-panel.component';
import { KPICard } from '../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { DriversListViewComponent } from '../components/drivers-list-view/drivers-list-view.component';

type SelectOption<T> = {
  value: T;
  label: string;
  translate?: boolean;
};

@Component({
  selector: 'app-drivers-list',
  standalone: true,
  imports: [DriversListViewComponent],
  templateUrl: './drivers-list.component.html'
})
export class DriversListComponent implements OnInit {
  readonly statusOptions: SelectOption<DriverStatus>[] = [
    { value: 'Online', label: 'متصل', translate: false },
    { value: 'OnMission', label: 'في مهمة', translate: false },
    { value: 'Offline', label: 'غير متصل', translate: false },
    { value: 'Suspended', label: 'موقوف', translate: false }
  ];

  readonly verificationOptions: SelectOption<VerificationStatus>[] = [
    { value: VerificationStatus.Verified, label: 'موثق', translate: false },
    { value: VerificationStatus.UnderReview, label: 'قيد المراجعة', translate: false },
    { value: VerificationStatus.Unverified, label: 'غير موثق', translate: false },
    { value: VerificationStatus.Suspended, label: 'موقوف مؤقتًا', translate: false }
  ];

  readonly performanceOptions: SelectOption<DriverPerformance>[] = [
    { value: DriverPerformance.Excellent, label: 'ممتاز', translate: false },
    { value: DriverPerformance.Good, label: 'جيد', translate: false },
    { value: DriverPerformance.NeedsImprovement, label: 'يحتاج تحسين', translate: false },
    { value: DriverPerformance.Low, label: 'ضعيف', translate: false }
  ];

  readonly vehicleTypeOptions: SelectOption<string>[] = [
    { value: 'سيارة', label: 'سيارة', translate: false },
    { value: 'دراجة', label: 'دراجة', translate: false },
    { value: 'سكوتر', label: 'سكوتر', translate: false },
    { value: 'فان', label: 'فان', translate: false }
  ];

  drivers: Driver[] = [];
  searchTerm = '';
  filters: DriverFilters = {};
  isFiltersExpanded = false;
  cityOptions: string[] = [];
  filterFields: FilterField[] = [];

  kpis: DriverKPIs = {
    total: 0,
    onlineNow: 0,
    onMission: 0,
    underReview: 0,
    suspended: 0,
    lowPerformance: 0
  };
  kpiCards: KPICard[] = [];

  isLoading = false;
  showError = false;
  errorMessage = '';
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;

  constructor(
    private readonly driverService: DriverService,
    private readonly router: Router,
    public readonly translate: TranslateService
  ) {}

  get isRTL(): boolean {
    return this.translate.currentLang !== 'en';
  }

  get hasActiveFilters(): boolean {
    return Object.keys(this.filters).some((key) => {
      const value = this.filters[key as keyof DriverFilters];
      return value !== undefined && value !== null && value !== '';
    });
  }

  ngOnInit(): void {
    this.cityOptions = this.buildCityOptions([]);
    this.initializeFilterOptions();
    this.loadDrivers();
    this.loadKPIs();
  }

  initializeFilterOptions(): void {
    this.filterFields = [
      {
        key: 'city',
        label: 'المدينة',
        type: 'select',
        color: '#0ea5e9',
        options: this.cityOptions.map((city) => ({ value: city, label: city }))
      },
      {
        key: 'status',
        label: 'حالة الاتصال',
        type: 'select',
        color: '#10b981',
        options: this.statusOptions.map((option) => ({ value: option.value, label: option.label }))
      },
      {
        key: 'verificationStatus',
        label: 'التحقق',
        type: 'select',
        color: '#f59e0b',
        options: this.verificationOptions.map((option) => ({ value: option.value, label: option.label }))
      },
      {
        key: 'vehicleType',
        label: 'نوع المركبة',
        type: 'select',
        color: '#8b5cf6',
        options: this.vehicleTypeOptions.map((option) => ({ value: option.value, label: option.label }))
      }
    ];
  }

  loadDrivers(): void {
    this.isLoading = true;
    this.showError = false;

    this.driverService.getDrivers(this.pageNumber, this.pageSize, this.searchTerm, this.filters).subscribe({
      next: (response) => {
        this.drivers = response.items;
        this.totalCount = response.totalCount;
        this.cityOptions = this.buildCityOptions(response.items);
        this.initializeFilterOptions();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showError = true;
        this.errorMessage = 'لم يتم العثور على نتائج مطابقة للفلاتر الحالية.';
      }
    });
  }

  loadKPIs(): void {
    this.driverService.getDriverKPIs().subscribe((response) => {
      this.kpis = response;
      this.kpiCards = [
        {
          id: 'total',
          title: 'إجمالي السائقين',
          value: this.kpis.total.toLocaleString('en-US'),
          icon: '<span class="material-symbols-outlined text-[20px]">group</span>',
          color: '#0f766e'
        },
        {
          id: 'online',
          title: 'المتصلون الآن',
          value: this.kpis.onlineNow.toLocaleString('en-US'),
          icon: '<span class="material-symbols-outlined text-[20px]">wifi_tethering</span>',
          color: '#14b8a6'
        },
        {
          id: 'mission',
          title: 'في مهمة نشطة',
          value: this.kpis.onMission.toLocaleString('en-US'),
          icon: '<span class="material-symbols-outlined text-[20px]">local_shipping</span>',
          color: '#d97706'
        },
        {
          id: 'review',
          title: 'قيد المراجعة',
          value: this.kpis.underReview.toLocaleString('en-US'),
          icon: '<span class="material-symbols-outlined text-[20px]">report_problem</span>',
          color: '#dc2626'
        },
        {
          id: 'suspended',
          title: 'موقوفون',
          value: this.kpis.suspended.toLocaleString('en-US'),
          icon: '<span class="material-symbols-outlined text-[20px]">block</span>',
          color: '#ef4444'
        },
        {
          id: 'low-performance',
          title: 'منخفضو الأداء',
          value: this.kpis.lowPerformance.toLocaleString('en-US'),
          icon: '<span class="material-symbols-outlined text-[20px]">trending_down</span>',
          color: '#f97316'
        }
      ];
    });
  }

  onSearch(): void {
    this.pageNumber = 1;
    this.loadDrivers();
  }

  onFiltersChange(newFilters: DriverFilters): void {
    this.filters = { ...this.filters, ...newFilters };
    this.pageNumber = 1;
    this.loadDrivers();
  }

  onFilterReset(): void {
    this.filters = {};
    this.searchTerm = '';
    this.pageNumber = 1;
    this.loadDrivers();
  }

  resetFilters(): void {
    this.onFilterReset();
  }

  toggleFilters(): void {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }

  changePage(page: number): void {
    if (page === this.pageNumber || page < 1) {
      return;
    }

    this.pageNumber = page;
    this.loadDrivers();
  }

  onKPICardClick(card: KPICard): void {
    switch (card.id) {
      case 'online':
        this.filters.status = 'Online';
        break;
      case 'mission':
        this.filters.status = 'OnMission';
        break;
      case 'review':
        this.filters.verificationStatus = VerificationStatus.UnderReview;
        break;
      case 'suspended':
        this.filters.status = 'Suspended';
        break;
      case 'low-performance':
        this.filters.performance = DriverPerformance.Low;
        break;
      default:
        this.filters = {};
        break;
    }

    this.pageNumber = 1;
    this.loadDrivers();
  }

  onTableRowClick(driver: Driver): void {
    this.router.navigate(['/drivers', driver.id]);
  }

  private buildCityOptions(drivers: Driver[]): string[] {
    const fallbackCities = ['الرياض', 'جدة', 'الدمام', 'الخبر', 'مكة', 'المدينة', 'الطائف', 'تبوك'];
    const cities = drivers.map((driver) => driver.city);
    return Array.from(new Set([...cities, ...fallbackCities]));
  }
}
