import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  Driver,
  DriverFilters,
  DriverPerformance,
  DriverStatus,
  VerificationStatus
} from '@drivers/models/drivers.domain.models';
import { AdvancedFilterPanelComponent, FilterField } from '../../../../shared/components/ui/advanced-filter-panel/advanced-filter-panel.component';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { DataTableComponent, TableColumn } from '../../../../shared/components/ui/data-table/data-table.component';
import { KpiCardsComponent, KPICard } from '../../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { StatusPillComponent } from '../../../../shared/components/ui/status-pill/status-pill.component';
import {
  getDriverStatusKey,
  getDriverStatusVariant as getDriverStatusPillVariant,
  getIssueIcon as getIssueIconName,
  getIssueKey,
  getIssueVariant as getIssueTone,
  getPerformanceKey,
  getVerificationKey,
  getVerificationVariant as getVerificationPillVariant
} from '../../utils/driver-ui.utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-drivers-list-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AdvancedFilterPanelComponent,
    AppButtonComponent,
    AppPageHeaderComponent,
    KpiCardsComponent,
    DataTableComponent,
    StatusPillComponent,
    AppPaginationComponent
  ],
  templateUrl: './drivers-list-view.component.html',
  styleUrl: './drivers-list-view.component.scss'
})
export class DriversListViewComponent {
  private readonly translate = inject(TranslateService);

  @Input() isRTL = true;

  getTranslatedCity(city?: string): string {
    if (!city) return '';
    
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
    const key = `COMMON.CITIES.${keyToken}`;
    const translated = this.translate.instant(key);
    return translated === key ? city : translated;
  }
  @Input() searchTerm = '';
  @Input() drivers: Driver[] = [];
  @Input() filters: DriverFilters = {};
  @Input() filterFields: FilterField[] = [];
  @Input() isFiltersExpanded = false;
  @Input() hasActiveFilters = false;
  @Input() kpiCards: KPICard[] = [];
  @Input() isLoading = false;
  @Input() showError = false;
  @Input() errorMessage = '';
  @Input() pageNumber = 1;
  @Input() pageSize = 10;
  @Input() totalCount = 0;

  @Output() searchTermChange = new EventEmitter<string>();
  @Output() searchRequested = new EventEmitter<void>();
  @Output() filtersChanged = new EventEmitter<DriverFilters>();
  @Output() filtersReset = new EventEmitter<void>();
  @Output() toggleFiltersRequested = new EventEmitter<void>();
  @Output() kpiCardSelected = new EventEmitter<KPICard>();
  @Output() rowSelected = new EventEmitter<Driver>();
  @Output() pageChanged = new EventEmitter<number>();

  readonly tableColumns: TableColumn[] = [
    { key: 'driver', title: 'DRIVERS.TABLE.DRIVER', width: '24%', align: 'left', type: 'custom' },
    { key: 'driverId', title: 'DRIVERS.TABLE.DRIVER_ID', width: '10%', align: 'center', type: 'custom' },
    { key: 'city', title: 'DRIVERS.TABLE.CITY', width: '8%', align: 'center', type: 'custom' },
    { key: 'status', title: 'DRIVERS.TABLE.STATUS', width: '9%', align: 'center', type: 'custom' },
    { key: 'verificationStatus', title: 'DRIVERS.TABLE.VERIFICATION_STATUS', width: '10%', align: 'center', type: 'custom' },
    { key: 'tasks', title: 'DRIVERS.TABLE.TASKS', width: '10%', align: 'center', type: 'custom' },
    { key: 'performance', title: 'DRIVERS.TABLE.PERFORMANCE', width: '11%', align: 'center', type: 'custom' },
    { key: 'wallet', title: 'DRIVERS.TABLE.WALLET', width: '8%', align: 'center', type: 'custom' },
    { key: 'issues', title: 'DRIVERS.TABLE.ISSUES', width: '5%', align: 'center', type: 'custom' },
    { key: 'actions', title: 'DRIVERS.TABLE.ACTIONS', width: '5%', align: 'center', type: 'custom' }
  ];

  onSearch(): void {
    this.searchTermChange.emit(this.searchTerm);
    this.searchRequested.emit();
  }

  onSearchTermInput(value: string): void {
    this.searchTerm = value;
    this.onSearch();
  }

  onFiltersChange(newFilters: DriverFilters): void {
    this.filtersChanged.emit(newFilters);
  }

  onFilterReset(): void {
    this.filtersReset.emit();
  }

  resetFilters(): void {
    this.filtersReset.emit();
  }

  toggleFilters(): void {
    this.toggleFiltersRequested.emit();
  }

  changePage(page: number): void {
    this.pageChanged.emit(page);
  }

  onKPICardClick(card: KPICard): void {
    this.kpiCardSelected.emit(card);
  }

  onTableRowClick(driver: Driver): void {
    this.rowSelected.emit(driver);
  }

  getDriverStatusVariant(status: DriverStatus) {
    return getDriverStatusPillVariant(status);
  }

  getDriverStatusLabel(status: DriverStatus): string {
    return getDriverStatusKey(status);
  }

  getVerificationStatusVariant(status: VerificationStatus) {
    return getVerificationPillVariant(status);
  }

  getVerificationLabel(status: VerificationStatus): string {
    return getVerificationKey(status);
  }

  getPerformanceLabel(performance: DriverPerformance): string {
    return getPerformanceKey(performance);
  }

  getTaskSubtitle(subtitle?: string): string {
    if (!subtitle) {
      return 'DRIVERS.TABLE.NO_ACTIVITY';
    }

    const subtitleKeys: Record<string, string> = {
      // Arabic keys
      'آخر تسليم قبل 10 دقائق': 'DRIVERS.TASK_SUBTITLES.LAST_DELIVERY_10_MIN',
      'توصيل قيد التنفيذ': 'DRIVERS.TASK_SUBTITLES.DELIVERY_IN_PROGRESS',
      'لا يوجد نشاط': 'DRIVERS.TABLE.NO_ACTIVITY',
      'متاح في المنطقة الشرقية': 'DRIVERS.TASK_SUBTITLES.EASTERN_REGION_AVAILABLE',
      'آخر ظهور منذ 6 ساعات': 'DRIVERS.TASK_SUBTITLES.LAST_SEEN_6_HOURS',
      'يشحن 3 طلبات حالياً': 'DRIVERS.TASK_SUBTITLES.CARRYING_3_ORDERS',
      'مستوى خدمة ممتاز': 'DRIVERS.TASK_SUBTITLES.EXCELLENT_SERVICE_LEVEL',
      'مستندات قيد المراجعة': 'DRIVERS.TASK_SUBTITLES.DOCUMENTS_UNDER_REVIEW',
      'منطقة التسليم الجنوبية': 'DRIVERS.TASK_SUBTITLES.SOUTH_DELIVERY_ZONE',
      'جاهز للاستلام القادم': 'DRIVERS.TASK_SUBTITLES.READY_FOR_NEXT_PICKUP',
      'إيقاف لحين التسوية': 'DRIVERS.TASK_SUBTITLES.SUSPENDED_PENDING_SETTLEMENT',
      'أفضل معدل قبول في المنطقة': 'DRIVERS.TASK_SUBTITLES.BEST_ACCEPTANCE_RATE',
      
      // English keys
      'Last delivery was 10 minutes ago': 'DRIVERS.TASK_SUBTITLES.LAST_DELIVERY_10_MIN',
      'Last delivery 10 minutes ago': 'DRIVERS.TASK_SUBTITLES.LAST_DELIVERY_10_MIN',
      'Delivery in progress': 'DRIVERS.TASK_SUBTITLES.DELIVERY_IN_PROGRESS',
      'No activity': 'DRIVERS.TABLE.NO_ACTIVITY',
      'Available in the Eastern region': 'DRIVERS.TASK_SUBTITLES.EASTERN_REGION_AVAILABLE',
      'Last seen 6 hours ago': 'DRIVERS.TASK_SUBTITLES.LAST_SEEN_6_HOURS',
      'Carrying 3 orders now': 'DRIVERS.TASK_SUBTITLES.CARRYING_3_ORDERS',
      'Excellent service level': 'DRIVERS.TASK_SUBTITLES.EXCELLENT_SERVICE_LEVEL',
      'Documents under review': 'DRIVERS.TASK_SUBTITLES.DOCUMENTS_UNDER_REVIEW',
      'Southern delivery zone': 'DRIVERS.TASK_SUBTITLES.SOUTH_DELIVERY_ZONE',
      'Ready for the next pickup': 'DRIVERS.TASK_SUBTITLES.READY_FOR_NEXT_PICKUP',
      'Suspended pending settlement': 'DRIVERS.TASK_SUBTITLES.SUSPENDED_PENDING_SETTLEMENT',
      'Best acceptance rate in the region': 'DRIVERS.TASK_SUBTITLES.BEST_ACCEPTANCE_RATE'
    };

    const trimmed = subtitle.trim();
    if (subtitleKeys[trimmed]) {
      return subtitleKeys[trimmed];
    }
    
    const lower = trimmed.toLowerCase();
    for (const [key, value] of Object.entries(subtitleKeys)) {
      if (key.toLowerCase() === lower) {
        return value;
      }
    }

    return subtitle;
  }

  getIssueIcon(issue: string): string {
    return getIssueIconName(issue);
  }

  getIssueLabel(issue: string): string {
    return getIssueKey(issue);
  }

  getIssueVariant(issue: string): 'success' | 'warning' | 'danger' {
    return getIssueTone(issue);
  }
}


