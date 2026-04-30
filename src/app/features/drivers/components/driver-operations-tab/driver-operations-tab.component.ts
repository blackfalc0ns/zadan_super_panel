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
  @Input() isActionPending = false;
  @Output() taskPreviewRequested = new EventEmitter<DriverTaskAssignment>();
  @Output() locationAccessActionRequested = new EventEmitter<'block' | 'unblock'>();

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

  get locationAccessTitle(): string {
    return this.isRTL ? 'التحكم في التتبع الموقعي' : 'Location access control';
  }

  get locationAccessStatusText(): string {
    return this.driver.operations.locationUpdatesBlocked
      ? (this.isRTL ? 'تحديثات الموقع متوقفة إداريًا' : 'Location updates are blocked by admin')
      : (this.isRTL ? 'تحديثات الموقع فعالة الآن' : 'Location updates are active');
  }

  get locationAccessDescription(): string {
    if (this.driver.operations.locationUpdatesBlocked) {
      const blockedAt = this.driver.operations.locationBlockedAtLabel;
      const reason = this.driver.operations.locationBlockReason;

      if (this.isRTL) {
        if (reason && blockedAt) {
          return `تم إيقاف التتبع بتاريخ ${blockedAt} بسبب: ${reason}`;
        }

        if (reason) {
          return `تم إيقاف التتبع بسبب: ${reason}`;
        }

        if (blockedAt) {
          return `تم إيقاف التتبع بتاريخ ${blockedAt}`;
        }

        return 'السائق لن يتمكن من إرسال أي تحديثات GPS جديدة حتى يتم فك الحظر.';
      }

      if (reason && blockedAt) {
        return `Tracking was blocked on ${blockedAt} because: ${reason}`;
      }

      if (reason) {
        return `Tracking was blocked because: ${reason}`;
      }

      if (blockedAt) {
        return `Tracking was blocked on ${blockedAt}.`;
      }

      return 'The driver cannot send new GPS updates until access is restored.';
    }

    if (this.driver.operations.lastLocationLabel) {
      return this.isRTL
        ? `آخر تحديث موقعي: ${this.driver.operations.lastLocationLabel}`
        : `Last location update: ${this.driver.operations.lastLocationLabel}`;
    }

    return this.isRTL
      ? 'لا يوجد Ping حديث محفوظ لهذا السائق حتى الآن.'
      : 'No recent location ping has been recorded for this driver yet.';
  }

  get locationAccessActionLabel(): string {
    return this.driver.operations.locationUpdatesBlocked
      ? (this.isRTL ? 'فك الحظر الموقعي' : 'Unblock location updates')
      : (this.isRTL ? 'إيقاف تحديثات الموقع' : 'Block location updates');
  }

  requestLocationAccessAction(): void {
    if (this.isActionPending) {
      return;
    }

    this.locationAccessActionRequested.emit(
      this.driver.operations.locationUpdatesBlocked ? 'unblock' : 'block');
  }
}
