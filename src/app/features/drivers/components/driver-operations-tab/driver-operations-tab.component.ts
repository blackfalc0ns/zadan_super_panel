import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DataTableComponent, TableColumn } from '../../../../shared/components/ui/data-table/data-table.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { DriverDetailRecord, DriverTaskAssignment } from '../../models/drivers.models';
import { getTaskStatusKey, getTaskStatusVariant } from '../../utils/driver-ui.utils';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-driver-operations-tab',
  standalone: true,
  imports: [CommonModule, TranslateModule, DataTableComponent, SectionHeaderComponent, AppPaginationComponent],
  templateUrl: './driver-operations-tab.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DriverOperationsTabComponent {
  @Input({ required: true }) driver!: DriverDetailRecord;
  @Input() mapPreviewUrl: SafeResourceUrl | null = null;
  @Input() isRTL = true;
  @Output() taskPreviewRequested = new EventEmitter<DriverTaskAssignment>();

  taskColumns: TableColumn[] = [
    { key: 'vendor', title: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.COLUMNS.VENDOR', type: 'custom' },
    { key: 'zone', title: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.COLUMNS.ZONE' },
    { key: 'status', title: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.COLUMNS.STATUS', type: 'custom' },
    { key: 'assignedAt', title: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.COLUMNS.ASSIGNED_AT' },
    { key: 'duration', title: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.COLUMNS.DURATION', type: 'custom' }
  ];

  currentPage = 1;
  pageSize = 5;

  get totalItems() {
    return this.driver?.operations?.taskAssignments?.length || 0;
  }

  get paginatedTasks() {
    const tasks = this.driver?.operations?.taskAssignments || [];
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return tasks.slice(start, end);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  getTaskVariant(status: string) {
    return getTaskStatusVariant(status as any);
  }

  getTaskStatusKey(status: string) {
    return getTaskStatusKey(status as any);
  }

  get hasCoordinates(): boolean {
    return this.driver.liveLatitude != null && this.driver.liveLongitude != null;
  }

  get mapCenterLat(): number {
    return this.driver?.liveLatitude ?? 24.7136; // Default to Riyadh
  }

  get mapCenterLng(): number {
    return this.driver?.liveLongitude ?? 46.6753; // Default to Riyadh
  }

  get mapsUrl(): string | null {
    if (!this.hasCoordinates) {
      return null;
    }

    return `https://www.google.com/maps?q=${this.driver.liveLatitude},${this.driver.liveLongitude}`;
  }

  get activeMissionLabel(): string {
    if (!this.driver.liveMissionId) {
      return 'COMMON.NOT_AVAILABLE';
    }
    return `#${this.driver.liveMissionId.substring(0, 8).toUpperCase()}`;
  }
}
