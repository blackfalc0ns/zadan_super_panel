import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  Driver,
  DriverFilters,
  DriverPerformance,
  DriverStatus,
  VerificationStatus
} from '../../../../core/models/driver';
import { AdvancedFilterPanelComponent, FilterField } from '../../../../shared/components/ui/advanced-filter-panel/advanced-filter-panel.component';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { DataTableComponent, TableColumn } from '../../../../shared/components/ui/data-table/data-table.component';
import { KpiCardsComponent, KPICard } from '../../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { StatusPillComponent } from '../../../../shared/components/ui/status-pill/status-pill.component';
import {
  getDriverStatusLabel as getDriverStatusLabelText,
  getDriverStatusVariant as getDriverStatusPillVariant,
  getIssueIcon as getIssueIconName,
  getIssueLabel as getIssueTextLabel,
  getIssueVariant as getIssueTone,
  getPerformanceLabel as getPerformanceTextLabel,
  getVerificationLabel as getVerificationTextLabel,
  getVerificationVariant as getVerificationPillVariant
} from '../../driver-ui.utils';

@Component({
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
  @Input() isRTL = true;
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
    { key: 'driver', title: 'السائق', width: '24%', align: 'left', type: 'custom' },
    { key: 'driverId', title: 'معرّف السائق', width: '10%', align: 'center', type: 'custom' },
    { key: 'city', title: 'المدينة', width: '8%', align: 'center', type: 'custom' },
    { key: 'status', title: 'الحالة', width: '9%', align: 'center', type: 'custom' },
    { key: 'verificationStatus', title: 'التحقق', width: '10%', align: 'center', type: 'custom' },
    { key: 'tasks', title: 'المهام', width: '10%', align: 'center', type: 'custom' },
    { key: 'performance', title: 'الأداء', width: '11%', align: 'center', type: 'custom' },
    { key: 'wallet', title: 'المحفظة', width: '8%', align: 'center', type: 'custom' },
    { key: 'issues', title: 'المشكلات', width: '5%', align: 'center', type: 'custom' },
    { key: 'actions', title: 'الإجراءات', width: '5%', align: 'center', type: 'custom' }
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
    return getDriverStatusLabelText(status);
  }

  getVerificationStatusVariant(status: VerificationStatus) {
    return getVerificationPillVariant(status);
  }

  getVerificationLabel(status: VerificationStatus): string {
    return getVerificationTextLabel(status);
  }

  getPerformanceLabel(performance: DriverPerformance): string {
    return getPerformanceTextLabel(performance);
  }

  getIssueIcon(issue: string): string {
    return getIssueIconName(issue);
  }

  getIssueLabel(issue: string): string {
    return getIssueTextLabel(issue);
  }

  getIssueVariant(issue: string): 'success' | 'warning' | 'danger' {
    return getIssueTone(issue);
  }
}
