import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  Driver,
  DriverFilters,
  DriverKPIs,
  DriverPerformance,
  DriverStatus,
  DriverVehicleType,
  VerificationStatus
} from '@drivers/models/drivers.domain.models';
import { DriverService } from '@drivers/services/drivers.api.service';
import { FilterField } from '../../../../../shared/components/ui/advanced-filter-panel/advanced-filter-panel.component';
import { KPICard } from '../../../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { DriversListViewComponent } from '../../../components/drivers-list-view/drivers-list-view.component';

type SelectOption<T> = {
  value: T;
  label: string;
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-drivers-list',
  standalone: true,
  imports: [DriversListViewComponent],
  templateUrl: './drivers-list.component.html'
})
export class DriversListComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  readonly statusOptions: SelectOption<DriverStatus>[] = [
    { value: 'Online', label: 'DRIVERS.STATUS.ONLINE' },
    { value: 'OnMission', label: 'DRIVERS.STATUS.ONMISSION' },
    { value: 'Offline', label: 'DRIVERS.STATUS.OFFLINE' },
    { value: 'Suspended', label: 'DRIVERS.STATUS.SUSPENDED' },
    { value: 'Banned', label: 'DRIVERS.STATUS.BANNED' }
  ];

  readonly verificationOptions: SelectOption<VerificationStatus>[] = [
    { value: VerificationStatus.Verified, label: 'DRIVERS.VERIFICATION.VERIFIED' },
    { value: VerificationStatus.UnderReview, label: 'DRIVERS.VERIFICATION.UNDER_REVIEW' },
    { value: VerificationStatus.Unverified, label: 'DRIVERS.VERIFICATION.UNVERIFIED' },
    { value: VerificationStatus.Suspended, label: 'DRIVERS.VERIFICATION.SUSPENDED' }
  ];

  readonly performanceOptions: SelectOption<DriverPerformance>[] = [
    { value: DriverPerformance.Excellent, label: 'DRIVERS.PERFORMANCE.EXCELLENT' },
    { value: DriverPerformance.Good, label: 'DRIVERS.PERFORMANCE.GOOD' },
    { value: DriverPerformance.NeedsImprovement, label: 'DRIVERS.PERFORMANCE.NEEDS_IMPROVEMENT' },
    { value: DriverPerformance.Low, label: 'DRIVERS.PERFORMANCE.LOW' }
  ];

  readonly vehicleTypeOptions: SelectOption<DriverVehicleType>[] = [
    { value: DriverVehicleType.Car, label: 'DRIVERS.VEHICLES.CAR' },
    { value: DriverVehicleType.Motorcycle, label: 'DRIVERS.VEHICLES.BIKE' },
    { value: DriverVehicleType.Scooter, label: 'DRIVERS.VEHICLES.SCOOTER' },
    { value: DriverVehicleType.Van, label: 'DRIVERS.VEHICLES.VAN' },
    { value: DriverVehicleType.Bicycle, label: 'DRIVERS.VEHICLES.BICYCLE' },
    { value: DriverVehicleType.Truck, label: 'DRIVERS.VEHICLES.TRUCK' }
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
    private readonly route: ActivatedRoute,
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
    const city = this.route.snapshot.queryParamMap.get('city');
    if (city) {
      this.filters = { ...this.filters, city };
      this.isFiltersExpanded = true;
    }
    this.loadDrivers();
    this.loadKPIs();
  }

  initializeFilterOptions(): void {
    this.filterFields = [
      {
        key: 'city',
        label: 'DRIVERS.FILTERS.CITY',
        type: 'select',
        color: '#0ea5e9',
        options: this.cityOptions.map((city) => ({
          value: city,
          label: this.getCityTranslationKey(city)
        }))
      },
      {
        key: 'status',
        label: 'DRIVERS.FILTERS.STATUS',
        type: 'select',
        color: '#10b981',
        options: this.statusOptions.map((option) => ({ value: option.value, label: option.label }))
      },
      {
        key: 'verificationStatus',
        label: 'DRIVERS.FILTERS.VERIFICATION_STATUS',
        type: 'select',
        color: '#f59e0b',
        options: this.verificationOptions.map((option) => ({ value: option.value, label: option.label }))
      },
      {
        key: 'vehicleType',
        label: 'DRIVERS.FILTERS.VEHICLE_TYPE',
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
        this.cdr.markForCheck();
        this.drivers = response.items;
        this.totalCount = response.totalCount;
        this.cityOptions = this.buildCityOptions(response.items);
        this.initializeFilterOptions();
        this.isLoading = false;
      },
      error: () => {
        this.cdr.markForCheck();
        this.isLoading = false;
        this.showError = true;
        this.errorMessage = 'DRIVERS.LOAD_ERROR';
      }
    });
  }

  loadKPIs(): void {
    this.driverService.getDriverKPIs().subscribe((response) => {
      this.cdr.markForCheck();
      this.kpis = response;
      this.kpiCards = [
        {
          id: 'total',
          title: 'DRIVERS.KPI.TOTAL_DRIVERS',
          value: this.kpis.total.toLocaleString('en-US'),
          icon: '<span class="material-symbols-outlined text-[20px]">group</span>',
          color: '#0f766e'
        },
        {
          id: 'online',
          title: 'DRIVERS.KPI.ONLINE_NOW',
          value: this.kpis.onlineNow.toLocaleString('en-US'),
          icon: '<span class="material-symbols-outlined text-[20px]">wifi_tethering</span>',
          color: '#14b8a6'
        },
        {
          id: 'mission',
          title: 'DRIVERS.KPI.ON_MISSION',
          value: this.kpis.onMission.toLocaleString('en-US'),
          icon: '<span class="material-symbols-outlined text-[20px]">local_shipping</span>',
          color: '#d97706'
        },
        {
          id: 'review',
          title: 'DRIVERS.KPI.UNDER_REVIEW',
          value: this.kpis.underReview.toLocaleString('en-US'),
          icon: '<span class="material-symbols-outlined text-[20px]">report_problem</span>',
          color: '#dc2626'
        },
        {
          id: 'suspended',
          title: 'DRIVERS.KPI.SUSPENDED',
          value: this.kpis.suspended.toLocaleString('en-US'),
          icon: '<span class="material-symbols-outlined text-[20px]">block</span>',
          color: '#ef4444'
        },
        {
          id: 'low-performance',
          title: 'DRIVERS.KPI.LOW_PERFORMANCE',
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
    const cities = drivers.map((driver) => driver.city).filter((c) => !!c);
    return Array.from(new Set(cities));
  }

  getCityTranslationKey(city: string): string {
    if (!city) return 'COMMON.CITIES.ALL';
    const normalized = city.trim().toUpperCase();
    const cityMap: Record<string, string> = {
      'RIYADH': 'RIYADH',
      'الرياض': 'RIYADH',
      'JEDDAH': 'JEDDAH',
      'جدة': 'JEDDAH',
      'DAMMAM': 'DAMMAM',
      'الدمام': 'DAMMAM',
      'MAKKAH': 'MAKKAH',
      'MECCA': 'MAKKAH',
      'مكة': 'MAKKAH',
      'MADINAH': 'MADINAH',
      'MEDINA': 'MADINAH',
      'المدينة': 'MADINAH',
      'TAIF': 'TAIF',
      'الطائف': 'TAIF',
      'TABUK': 'TABUK',
      'تبوك': 'TABUK',
      'ABHA': 'ABHA',
      'أبها': 'ABHA',
      'KHOBAR': 'KHOBAR',
      'الخبر': 'KHOBAR',
      'QATIF': 'QATIF',
      'القطيف': 'QATIF'
    };
    const keyToken = cityMap[normalized] || normalized;
    return `COMMON.CITIES.${keyToken}`;
  }
}



