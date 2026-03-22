import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface FinancialStatementConfig {
  statementType: 'comprehensive' | 'payments' | 'deductions' | 'returns';
  dateFrom: Date;
  dateTo: Date;
  includedData: {
    sales: boolean;
    returns: boolean;
    discounts: boolean;
    commissions: boolean;
    netAmount: boolean;
  };
  exportFormat: 'pdf' | 'excel' | 'csv';
}

export interface StatementPreview {
  vendorName: string;
  dateRange: string;
  estimatedRecords: number;
  estimatedFileSize: string;
  totalAmount: number;
}

@Component({
  selector: 'app-financial-statement-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './financial-statement-modal.component.html',
  styleUrls: ['./financial-statement-modal.component.scss']
})
export class FinancialStatementModalComponent {
  @Input() isOpen = false;
  @Input() vendorName = 'متجر زادانة المميز';
  @Output() close = new EventEmitter<void>();
  @Output() download = new EventEmitter<FinancialStatementConfig>();
  @Output() preview = new EventEmitter<FinancialStatementConfig>();

  constructor(private translate: TranslateService) {}

  get isRTL(): boolean {
    return this.translate.currentLang === 'ar';
  }

  config: FinancialStatementConfig = {
    statementType: 'comprehensive',
    dateFrom: new Date(2023, 11, 1), // Dec 1, 2023
    dateTo: new Date(2024, 0, 6), // Jan 6, 2024
    includedData: {
      sales: true,
      returns: true,
      discounts: true,
      commissions: true,
      netAmount: true
    },
    exportFormat: 'excel'
  };

  quickDateRanges = [
    { label: 'آخر 7 أيام', days: 7 },
    { label: 'هذا الشهر', days: 30 },
    { label: 'آخر 30 يوم', days: 30 }
  ];

  selectedQuickRange = 'هذا الشهر';

  // Calendar state
  currentMonthFrom = new Date(2023, 11, 1);
  currentMonthTo = new Date(2024, 0, 1);

  get previewData(): StatementPreview {
    const daysDiff = Math.ceil((this.config.dateTo.getTime() - this.config.dateFrom.getTime()) / (1000 * 60 * 60 * 24));
    return {
      vendorName: this.vendorName,
      dateRange: `${this.formatDate(this.config.dateFrom)} - ${this.formatDate(this.config.dateTo)}`,
      estimatedRecords: Math.floor(daysDiff * 35), // ~35 records per day
      estimatedFileSize: `${(daysDiff * 0.065).toFixed(1)} MB`,
      totalAmount: 45250.00
    };
  }

  onClose() {
    this.close.emit();
  }

  onDownload() {
    this.download.emit(this.config);
  }

  onPreview() {
    this.preview.emit(this.config);
  }

  selectQuickRange(label: string, days: number) {
    this.selectedQuickRange = label;
    this.config.dateTo = new Date();
    this.config.dateFrom = new Date();
    this.config.dateFrom.setDate(this.config.dateTo.getDate() - days);
  }

  selectStatementType(type: 'comprehensive' | 'payments' | 'deductions' | 'returns') {
    this.config.statementType = type;
  }

  selectExportFormat(format: 'pdf' | 'excel' | 'csv') {
    this.config.exportFormat = format;
  }

  toggleIncludedData(field: keyof FinancialStatementConfig['includedData']) {
    this.config.includedData[field] = !this.config.includedData[field];
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // Calendar navigation
  previousMonthFrom() {
    this.currentMonthFrom = new Date(this.currentMonthFrom.getFullYear(), this.currentMonthFrom.getMonth() - 1, 1);
  }

  nextMonthFrom() {
    this.currentMonthFrom = new Date(this.currentMonthFrom.getFullYear(), this.currentMonthFrom.getMonth() + 1, 1);
  }

  previousMonthTo() {
    this.currentMonthTo = new Date(this.currentMonthTo.getFullYear(), this.currentMonthTo.getMonth() - 1, 1);
  }

  nextMonthTo() {
    this.currentMonthTo = new Date(this.currentMonthTo.getFullYear(), this.currentMonthTo.getMonth() + 1, 1);
  }

  getMonthName(date: Date): string {
    return date.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
  }

  selectDateFrom(day: number) {
    this.config.dateFrom = new Date(this.currentMonthFrom.getFullYear(), this.currentMonthFrom.getMonth(), day);
  }

  selectDateTo(day: number) {
    this.config.dateTo = new Date(this.currentMonthTo.getFullYear(), this.currentMonthTo.getMonth(), day);
  }

  isSelectedFrom(day: number): boolean {
    const date = new Date(this.currentMonthFrom.getFullYear(), this.currentMonthFrom.getMonth(), day);
    return date.toDateString() === this.config.dateFrom.toDateString();
  }

  isSelectedTo(day: number): boolean {
    const date = new Date(this.currentMonthTo.getFullYear(), this.currentMonthTo.getMonth(), day);
    return date.toDateString() === this.config.dateTo.toDateString();
  }

  getDaysInMonth(date: Date): number[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }
}
