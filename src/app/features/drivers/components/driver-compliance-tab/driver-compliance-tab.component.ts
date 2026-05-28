import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DataTableComponent, TableColumn } from '../../../../shared/components/ui/data-table/data-table.component';
import { KpiCardsComponent, KPICard } from '../../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { DriverDetailRecord, DriverIncidentRecord } from '../../models/drivers.models';
import {
  getIncidentSeverityVariant,
  getIncidentStatusVariant,
  getDocumentStatusVariant,
  getIncidentSeverityKey,
  getIncidentStatusKey,
  getIncidentTypeKey
} from '../../utils/driver-ui.utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-driver-compliance-tab',
  standalone: true,
  imports: [CommonModule, TranslateModule, DataTableComponent, KpiCardsComponent, SectionHeaderComponent],
  templateUrl: './driver-compliance-tab.component.html'
})
export class DriverComplianceTabComponent {
  @Input({ required: true }) driver!: DriverDetailRecord;
  @Input() isRTL = true;
  @Output() incidentPreviewRequested = new EventEmitter<DriverIncidentRecord>();

  incidentColumns: TableColumn[] = [
    { key: 'id', title: 'DRIVERS.DETAIL.COMPLIANCE.INCIDENTS.COLUMNS.ID' },
    { key: 'type', title: 'DRIVERS.DETAIL.COMPLIANCE.INCIDENTS.COLUMNS.TYPE' },
    { key: 'severity', title: 'DRIVERS.DETAIL.COMPLIANCE.INCIDENTS.COLUMNS.SEVERITY', type: 'custom' },
    { key: 'status', title: 'DRIVERS.DETAIL.COMPLIANCE.INCIDENTS.COLUMNS.STATUS', type: 'custom' },
    { key: 'createdAt', title: 'DRIVERS.DETAIL.COMPLIANCE.INCIDENTS.COLUMNS.DATE' }
  ];

  get complianceKpis(): KPICard[] {
    return [
      {
        id: 'open-cases',
        title: 'DRIVERS.DETAIL.COMPLIANCE.KPIS.OPEN_CASES',
        value: this.driver.compliance.openCases.toString(),
        icon: '<span class="material-symbols-outlined">folder_open</span>',
        color: this.driver.compliance.openCases > 0 ? '#f59e0b' : '#10b981'
      },
      {
        id: 'critical-cases',
        title: 'DRIVERS.DETAIL.COMPLIANCE.KPIS.CRITICAL_CASES',
        value: this.driver.compliance.criticalCases.toString(),
        icon: '<span class="material-symbols-outlined">warning</span>',
        color: this.driver.compliance.criticalCases > 0 ? '#ef4444' : '#10b981'
      },
      {
        id: 'expired-docs',
        title: 'DRIVERS.DETAIL.COMPLIANCE.KPIS.EXPIRED_DOCS',
        value: this.driver.compliance.expiredDocuments.toString(),
        icon: '<span class="material-symbols-outlined">description</span>',
        color: this.driver.compliance.expiredDocuments > 0 ? '#ef4444' : '#10b981'
      }
    ];
  }

  getIncidentSeverityVariant(severity: string) {
    return getIncidentSeverityVariant(severity as any);
  }

  getIncidentStatusVariant(status: string) {
    return getIncidentStatusVariant(status as any);
  }

  getDocumentStatusVariant(status: string) {
    return getDocumentStatusVariant(status as any);
  }

  getIncidentSeverityKey(severity: string) {
    return getIncidentSeverityKey(severity as any);
  }

  getIncidentStatusKey(status: string) {
    return getIncidentStatusKey(status as any);
  }

  getIncidentTypeKey(type: string) {
    return getIncidentTypeKey(type);
  }
}
