import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DataTableComponent, TableColumn } from '../../../../shared/components/ui/data-table/data-table.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { DriverDetailRecord, DriverFinanceEntry } from '../../models/drivers.models';
import { getFinanceStatusVariant, getFinanceStatusKey } from '../../utils/driver-ui.utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-driver-finance-tab',
  standalone: true,
  imports: [CommonModule, TranslateModule, DataTableComponent, SectionHeaderComponent, FormsModule],
  templateUrl: './driver-finance-tab.component.html'
})
export class DriverFinanceTabComponent {
  @Input({ required: true }) driver!: DriverDetailRecord;
  @Input() isRTL = true;

  // Active filters
  activeFilter: string = 'ALL';
  searchQuery: string = '';
  expandedRowId: string | null = null;

  // Settlement Modal Form state
  showSettleModal: boolean = false;
  settleAmount: number = 0;
  settleMethod: string = 'BANKACCOUNT';
  settleReference: string = '';
  settleNotes: string = '';
  isSettling: boolean = false;
  settleSuccess: boolean = false;

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

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.expandedRowId = null;
  }

  toggleRow(rowId: string) {
    if (this.expandedRowId === rowId) {
      this.expandedRowId = null;
    } else {
      this.expandedRowId = rowId;
    }
  }

  getFilteredEntries(): DriverFinanceEntry[] {
    if (!this.driver?.finance?.entries) {
      return [];
    }

    return this.driver.finance.entries.filter(entry => {
      // 1. Filter by status tabs
      let statusMatches = true;
      if (this.activeFilter !== 'ALL') {
        statusMatches = entry.status === this.activeFilter;
      }

      // 2. Search query matches reference or type or date
      let searchMatches = true;
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        const refMatches = entry.reference?.toLowerCase().includes(query) || entry.id?.toLowerCase().includes(query);
        const typeMatches = entry.type?.toLowerCase().includes(query);
        const methodMatches = entry.method?.toLowerCase().includes(query);
        const dateMatches = entry.date?.includes(query);
        searchMatches = !!(refMatches || typeMatches || methodMatches || dateMatches);
      }

      return statusMatches && searchMatches;
    });
  }

  getTransactionIcon(type: string): string {
    const typeUpper = type?.toUpperCase() || '';
    if (typeUpper.includes('TRANSFER') || typeUpper.includes('PAYOUT')) {
      return 'account_balance';
    }
    if (typeUpper.includes('CASH') || typeUpper.includes('COLLECTED') || typeUpper.includes('COD')) {
      return 'payments';
    }
    if (typeUpper.includes('DEBIT') || typeUpper.includes('DEDUCTION') || typeUpper.includes('HOLD')) {
      return 'vertical_align_bottom';
    }
    if (typeUpper.includes('REFUND') || typeUpper.includes('CREDIT') || typeUpper.includes('RELEASE') || typeUpper.includes('ADJUSTMENT')) {
      return 'vertical_align_top';
    }
    return 'receipt_long';
  }

  getTransactionColorClass(type: string): string {
    const typeUpper = type?.toUpperCase() || '';
    if (typeUpper.includes('TRANSFER') || typeUpper.includes('PAYOUT')) {
      return 'bg-purple-50 text-purple-600 border-purple-100/80 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30';
    }
    if (typeUpper.includes('CASH') || typeUpper.includes('COLLECTED') || typeUpper.includes('COD')) {
      return 'bg-emerald-50 text-emerald-600 border-emerald-100/80 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
    }
    if (typeUpper.includes('DEBIT') || typeUpper.includes('DEDUCTION') || typeUpper.includes('HOLD')) {
      return 'bg-rose-50 text-rose-600 border-rose-100/80 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
    }
    return 'bg-blue-50 text-blue-600 border-blue-100/80 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
  }

  getTransactionTypeLabel(type: string): string {
    if (type?.startsWith('DRIVERS.DETAIL.FINANCE.')) {
      return type;
    }
    const typeUpper = type?.toUpperCase() || '';
    return `DRIVERS.DETAIL.FINANCE.BACKEND.TYPES.${typeUpper}`;
  }

  getMethodLabel(method: string): string {
    if (method?.startsWith('DRIVERS.DETAIL.FINANCE.')) {
      return method;
    }
    const methodUpper = method?.toUpperCase() || '';
    return `DRIVERS.DETAIL.FINANCE.BACKEND.METHODS.${methodUpper}`;
  }

  openSettleModal() {
    this.settleAmount = this.driver.finance.dueAmount;
    this.settleMethod = 'BANKACCOUNT';
    this.settleNotes = '';
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    this.settleReference = `TXN-${randomNum}`;
    
    this.showSettleModal = true;
    this.settleSuccess = false;
    this.isSettling = false;
  }

  closeSettleModal() {
    this.showSettleModal = false;
  }

  submitSettlement() {
    if (this.settleAmount <= 0) return;
    
    this.isSettling = true;
    
    setTimeout(() => {
      this.isSettling = false;
      this.settleSuccess = true;
      
      const amountPaid = this.settleAmount;
      
      // Update model data
      this.driver.finance.dueAmount = Math.max(0, this.driver.finance.dueAmount - amountPaid);
      this.driver.finance.availableBalance = Math.max(0, this.driver.finance.availableBalance - amountPaid);
      
      const today = new Date();
      const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
      
      const newEntry: DriverFinanceEntry = {
        id: `ENT-${Math.floor(10000 + Math.random() * 90000)}`,
        reference: this.settleReference,
        type: 'SETTLEMENT',
        status: 'SETTLED',
        statusLabel: 'DRIVERS.DETAIL.FINANCE.DYNAMIC.STATUS.SETTLED',
        amount: -amountPaid,
        fee: 0,
        method: this.settleMethod,
        date: formattedDate
      };
      
      this.driver.finance.entries = [newEntry, ...this.driver.finance.entries];
    }, 1500);
  }
}

