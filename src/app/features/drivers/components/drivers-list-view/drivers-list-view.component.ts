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
import { localizeSaudiCity } from '../../../../shared/utils/saudi-geography-display';
import {
 getDriverStatusKey,
 getDriverStatusVariant as getDriverStatusPillVariant,
 getDriverRestrictionLabelKey,
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
 return localizeSaudiCity(this.translate, city);
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

 getDriverRestrictionLabel(driver: Driver): string | null {
 return getDriverRestrictionLabelKey(driver);
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
 const trimmed = subtitle?.trim();
 if (!trimmed) {
 return 'DRIVERS.TABLE.NO_ACTIVITY';
 }

 return trimmed.startsWith('DRIVERS.') ? trimmed : 'DRIVERS.TABLE.NO_ACTIVITY';
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


