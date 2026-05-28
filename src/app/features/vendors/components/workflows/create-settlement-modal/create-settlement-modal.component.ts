import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface SettlementConfig {
  vendorId: string;
  vendorName: string;
  currentBalance: number;
  availableBalance: number;
  periodFrom: string;
  periodTo: string;
  settlementType: 'manual' | 'auto';
  priority: 'normal' | 'high' | 'low';
  applyExceptionalFee: boolean;
  exceptionalFeeAmount: string;
  totalSales: number;
  returns: number;
  additionalFees: number;
  financialAdjustments: number;
  netAmount: number;
  requiresApproval: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-create-settlement-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './create-settlement-modal.component.html',
  styleUrls: ['./create-settlement-modal.component.scss']
})
export class CreateSettlementModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() vendorId = '';
  @Input() vendorName = '';
  @Input() currentBalance = 0;
  @Input() availableBalance = 0;
  @Input() totalSales = 0;
  @Input() returns = 0;
  @Input() additionalFees = 0;
  @Input() financialAdjustments = 0;
  @Input() bankName = '';
  @Input() bankIban = '';
  @Output() close = new EventEmitter<void>();
  @Output() createSettlement = new EventEmitter<SettlementConfig>();
  @Output() saveDraft = new EventEmitter<SettlementConfig>();

  config: SettlementConfig = {
    vendorId: '',
    vendorName: '',
    currentBalance: 0,
    availableBalance: 0,
    periodFrom: '2023-10-01',
    periodTo: '2023-10-31',
    settlementType: 'manual',
    priority: 'normal',
    applyExceptionalFee: false,
    exceptionalFeeAmount: '',
    totalSales: 0,
    returns: 0,
    additionalFees: 0,
    financialAdjustments: 0,
    netAmount: 0,
    requiresApproval: false
  };

  showBreakdown = false;

  constructor(private translate: TranslateService) {}

  ngOnChanges(_: SimpleChanges): void {
    this.config.vendorId = this.vendorId;
    this.config.vendorName = this.vendorName;
    this.config.currentBalance = this.currentBalance;
    this.config.availableBalance = this.availableBalance;
    this.config.totalSales = this.totalSales;
    this.config.returns = this.returns;
    this.config.additionalFees = this.additionalFees;
    this.config.financialAdjustments = this.financialAdjustments;
    this.calculateNetAmount();
  }

  get isRTL(): boolean {
    return this.translate.currentLang === 'ar';
  }

  get currentLang(): string {
    return this.translate.currentLang || 'ar';
  }

  onClose() {
    this.close.emit();
  }

  onCreateSettlement() {
    this.createSettlement.emit(this.config);
  }

  onSaveDraft() {
    this.saveDraft.emit(this.config);
  }

  toggleBreakdown() {
    this.showBreakdown = !this.showBreakdown;
  }

  setQuickPeriod(period: 'this-month' | 'last-month' | 'last-7-days') {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    switch (period) {
      case 'this-month':
        this.config.periodFrom = new Date(year, month, 1).toISOString().split('T')[0];
        this.config.periodTo = new Date(year, month + 1, 0).toISOString().split('T')[0];
        break;
      case 'last-month':
        this.config.periodFrom = new Date(year, month - 1, 1).toISOString().split('T')[0];
        this.config.periodTo = new Date(year, month, 0).toISOString().split('T')[0];
        break;
      case 'last-7-days':
        this.config.periodTo = today.toISOString().split('T')[0];
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 7);
        this.config.periodFrom = last7Days.toISOString().split('T')[0];
        break;
    }
  }

  calculateNetAmount() {
    this.config.netAmount =
      this.config.totalSales -
      this.config.returns -
      this.config.additionalFees +
      this.config.financialAdjustments;
  }
}
