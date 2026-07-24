import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface SettlementConfig {
  vendorId: string;
  vendorName: string;
  currentBalance: number;
  availableBalance: number;
  periodFrom: string;
  periodTo: string;
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

type SettlementRuleCode =
  | 'GROSS_REQUIRED'
  | 'NET_REQUIRED'
  | 'NET_MISMATCH'
  | 'DEDUCTIONS_EXCEED_GROSS'
  | 'NEGATIVE_DEDUCTION'
  | 'PERIOD_REQUIRED'
  | 'PERIOD_INVALID'
  | 'PERIOD_IN_FUTURE'
  | 'PERIOD_TOO_OLD'
  | 'PERIOD_TOO_LONG'
  | 'BANK_REQUIRED'
  | 'BALANCE_INSUFFICIENT'
  | 'APPROVAL_REQUIRED'
  | 'AMOUNT_TOO_LARGE';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-create-settlement-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './create-settlement-modal.component.html',
  styleUrls: ['./create-settlement-modal.component.scss']
})
export class CreateSettlementModalComponent implements OnChanges {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);

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
  @Input() bankVerified = false;
  @Output() close = new EventEmitter<void>();
  @Output() createSettlement = new EventEmitter<SettlementConfig>();
  @Output() saveDraft = new EventEmitter<SettlementConfig>();

  config: SettlementConfig = this.createEmptyConfig();
  showBreakdown = false;
  validationAttempted = false;

  private readonly maxAmount = 10_000_000;
  private readonly maxPeriodDays = 93;

  ngOnChanges(changes: SimpleChanges): void {
    this.config.vendorId = this.vendorId;
    this.config.vendorName = this.vendorName;
    this.config.currentBalance = this.currentBalance;
    this.config.availableBalance = this.availableBalance;
    this.config.totalSales = this.totalSales;
    this.config.returns = this.returns;
    this.config.additionalFees = this.additionalFees;
    this.config.financialAdjustments = this.financialAdjustments;
    this.config.requiresApproval = true;
    this.calculateNetAmount();

    if (changes['isOpen']?.currentValue === true) {
      this.validationAttempted = false;
      this.showBreakdown = false;
      this.setQuickPeriod('this-month');
      this.config.requiresApproval = true;
    }

    this.cdr.markForCheck();
  }

  get isRTL(): boolean {
    return this.translate.currentLang === 'ar';
  }

  get currentLang(): string {
    return this.translate.currentLang || 'ar';
  }

  get hasVerifiedBank(): boolean {
    return this.bankVerified && !!this.bankIban?.trim();
  }

  get ruleCodes(): SettlementRuleCode[] {
    return this.evaluateRules();
  }

  get canSubmit(): boolean {
    return this.ruleCodes.length === 0;
  }

  onClose(): void {
    this.close.emit();
  }

  onCreateSettlement(): void {
    this.validationAttempted = true;
    this.config.requiresApproval = true;
    this.calculateNetAmount();
    this.cdr.markForCheck();

    if (!this.canSubmit) {
      return;
    }

    this.createSettlement.emit({ ...this.config, requiresApproval: true });
  }

  onSaveDraft(): void {
    // Drafts are disabled for exceptional settlements — they must go through finance review.
    this.validationAttempted = true;
    this.cdr.markForCheck();
  }

  toggleBreakdown(): void {
    this.showBreakdown = !this.showBreakdown;
  }

  setQuickPeriod(period: 'this-month' | 'last-month' | 'last-7-days'): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    switch (period) {
      case 'this-month':
        this.config.periodFrom = this.toDateInput(new Date(year, month, 1));
        this.config.periodTo = this.toDateInput(new Date(year, month + 1, 0));
        break;
      case 'last-month':
        this.config.periodFrom = this.toDateInput(new Date(year, month - 1, 1));
        this.config.periodTo = this.toDateInput(new Date(year, month, 0));
        break;
      case 'last-7-days': {
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 6);
        this.config.periodFrom = this.toDateInput(last7Days);
        this.config.periodTo = this.toDateInput(today);
        break;
      }
    }

    this.cdr.markForCheck();
  }

  onAmountChange(): void {
    this.calculateNetAmount();
    this.cdr.markForCheck();
  }

  onPeriodChange(): void {
    this.cdr.markForCheck();
  }

  calculateNetAmount(): void {
    const gross = this.toNumber(this.config.totalSales);
    const returns = this.toNumber(this.config.returns);
    const fees = this.toNumber(this.config.additionalFees);
    const adjustments = this.toNumber(this.config.financialAdjustments);
    this.config.netAmount = this.round(gross - returns - fees + adjustments);
  }

  ruleLabel(code: SettlementRuleCode): string {
    return this.translate.instant(`MODALS.CREATE_SETTLEMENT.RULES.${code}`);
  }

  private evaluateRules(): SettlementRuleCode[] {
    const codes: SettlementRuleCode[] = [];
    const gross = this.toNumber(this.config.totalSales);
    const returns = this.toNumber(this.config.returns);
    const fees = this.toNumber(this.config.additionalFees);
    const adjustments = this.toNumber(this.config.financialAdjustments);
    const net = this.round(gross - returns - fees + adjustments);
    const expectedNet = net;

    if (gross <= 0) {
      codes.push('GROSS_REQUIRED');
    }
    if (net <= 0) {
      codes.push('NET_REQUIRED');
    }
    if (returns < 0 || fees < 0) {
      codes.push('NEGATIVE_DEDUCTION');
    }
    if (returns + fees > gross + Math.max(0, adjustments) + 0.01) {
      codes.push('DEDUCTIONS_EXCEED_GROSS');
    }
    if (Math.abs(expectedNet - this.toNumber(this.config.netAmount)) > 0.01) {
      codes.push('NET_MISMATCH');
    }
    if ([gross, returns, fees, adjustments, net].some((value) => Math.abs(value) > this.maxAmount)) {
      codes.push('AMOUNT_TOO_LARGE');
    }

    const from = this.parseDate(this.config.periodFrom);
    const to = this.parseDate(this.config.periodTo);
    const today = this.startOfDay(new Date());
    if (!from || !to) {
      codes.push('PERIOD_REQUIRED');
    } else {
      if (from.getTime() > to.getTime()) {
        codes.push('PERIOD_INVALID');
      }
      if (to.getTime() > today.getTime()) {
        codes.push('PERIOD_IN_FUTURE');
      }
      const oldest = new Date(today);
      oldest.setFullYear(oldest.getFullYear() - 1);
      if (from.getTime() < oldest.getTime()) {
        codes.push('PERIOD_TOO_OLD');
      }
      const days = Math.floor((to.getTime() - from.getTime()) / 86_400_000) + 1;
      if (days > this.maxPeriodDays) {
        codes.push('PERIOD_TOO_LONG');
      }
    }

    if (!this.hasVerifiedBank) {
      codes.push('BANK_REQUIRED');
    }

    if (net > this.toNumber(this.availableBalance) + 0.01) {
      codes.push('BALANCE_INSUFFICIENT');
    }

    if (!this.config.requiresApproval) {
      codes.push('APPROVAL_REQUIRED');
    }

    return codes;
  }

  private createEmptyConfig(): SettlementConfig {
    return {
      vendorId: '',
      vendorName: '',
      currentBalance: 0,
      availableBalance: 0,
      periodFrom: '',
      periodTo: '',
      priority: 'normal',
      applyExceptionalFee: false,
      exceptionalFeeAmount: '',
      totalSales: 0,
      returns: 0,
      additionalFees: 0,
      financialAdjustments: 0,
      netAmount: 0,
      requiresApproval: true
    };
  }

  private toNumber(value: unknown): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private toDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseDate(value: string): Date | null {
    if (!value?.trim()) {
      return null;
    }
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) {
      return null;
    }
    return this.startOfDay(new Date(year, month - 1, day));
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
