import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DataTableComponent, TableColumn } from '../../../../shared/components/ui/data-table/data-table.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { DriverDetailRecord, DriverTaskAssignment } from '../../models/drivers.models';
import { getTaskStatusKey, getTaskStatusVariant } from '../../utils/driver-ui.utils';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-driver-operations-tab',
  standalone: true,
  imports: [CommonModule, TranslateModule, DataTableComponent, SectionHeaderComponent],
  templateUrl: './driver-operations-tab.component.html'
})
export class DriverOperationsTabComponent {
  @Input({ required: true }) driver!: DriverDetailRecord;
  @Input() mapPreviewUrl: SafeResourceUrl | null = null;
  @Input() isRTL = true;
  @Output() taskPreviewRequested = new EventEmitter<DriverTaskAssignment>();

  taskColumns: TableColumn[] = [
    { key: 'id', title: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.COLUMNS.ID' },
    { key: 'vendor', title: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.COLUMNS.VENDOR' },
    { key: 'zone', title: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.COLUMNS.ZONE' },
    { key: 'status', title: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.COLUMNS.STATUS', type: 'custom' },
    { key: 'assignedAt', title: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.COLUMNS.ASSIGNED_AT' },
    { key: 'duration', title: 'DRIVERS.DETAIL.OPERATIONS.DYNAMIC.COLUMNS.DURATION' }
  ];

  getTaskVariant(status: string) {
    return getTaskStatusVariant(status as any);
  }

  getTaskStatusKey(status: string) {
    return getTaskStatusKey(status as any);
  }
}
