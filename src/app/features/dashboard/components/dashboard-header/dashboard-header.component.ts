import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SearchableSelectComponent, SearchableSelectOption } from '../../../../shared/components/ui/form-controls/select/searchable-select.component';
import { DashboardFilterState, DashboardSnapshot } from '../../models/dashboard.models';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SearchableSelectComponent],
  templateUrl: './dashboard-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardHeaderComponent {
  @Input() dashboard!: DashboardSnapshot;
  @Input() filterState!: DashboardFilterState;
  @Input() isRTL = true;
  @Input() dateRangeOptions: SearchableSelectOption[] = [];
  @Input() regionOptions: SearchableSelectOption[] = [];
  @Input() vendorOptions: SearchableSelectOption[] = [];

  @Output() filterChanged = new EventEmitter<DashboardFilterState>();
  @Output() refreshRequested = new EventEmitter<void>();

  onDateRangeChange(value: string): void {
    this.filterState = { ...this.filterState, dateRange: value as DashboardFilterState['dateRange'] };
    this.filterChanged.emit(this.filterState);
  }

  onRegionChange(value: string): void {
    this.filterState = {
      ...this.filterState,
      region: value,
      vendorId: 'all'
    };
    this.filterChanged.emit(this.filterState);
  }

  onVendorChange(value: string): void {
    this.filterState = { ...this.filterState, vendorId: value };
    this.filterChanged.emit(this.filterState);
  }
}
