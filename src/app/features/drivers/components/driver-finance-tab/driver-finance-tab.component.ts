import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DataTableComponent, TableColumn } from '../../../../shared/components/ui/data-table/data-table.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { DriverDetailRecord, DriverFinanceEntry } from '../../models/drivers.models';
import { getFinanceStatusVariant, getFinanceStatusKey } from '../../utils/driver-ui.utils';

@Component({
  selector: 'app-driver-finance-tab',
  standalone: true,
  imports: [CommonModule, TranslateModule, DataTableComponent, SectionHeaderComponent],
  templateUrl: './driver-finance-tab.component.html'
})
export class DriverFinanceTabComponent {
  @Input({ required: true }) driver!: DriverDetailRecord;
  @Input() isRTL = true;

  financeColumns: TableColumn[] = [
    { key: 'id', title: 'DRIVERS.DETAIL.FINANCE.COLUMNS.ID' },
    { key: 'type', title: 'DRIVERS.DETAIL.FINANCE.COLUMNS.TYPE' },
    { key: 'amount', title: 'DRIVERS.DETAIL.FINANCE.COLUMNS.AMOUNT' },
    { key: 'fee', title: 'DRIVERS.DETAIL.FINANCE.COLUMNS.FEE' },
    { key: 'status', title: 'DRIVERS.DETAIL.FINANCE.COLUMNS.STATUS', type: 'custom' },
    { key: 'date', title: 'DRIVERS.DETAIL.FINANCE.COLUMNS.DATE' }
  ];

  getFinanceStatusVariant(status: string) {
    return getFinanceStatusVariant(status as any);
  }

  getFinanceStatusKey(status: string) {
    return getFinanceStatusKey(status as any);
  }
}
