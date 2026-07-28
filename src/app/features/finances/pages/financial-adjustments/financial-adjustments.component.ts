import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take, forkJoin } from 'rxjs';
import { FinanceService } from '../../services/finance.service';
import { FinancialAdjustment, FinancialAdjustmentStats, EntityType, AdjustmentDirection } from '../../models/finance.models';
import { FinanceStatusBadgeComponent } from '../../components/finance-status-badge/finance-status-badge.component';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { KpiCardsComponent, KPICard } from '../../../../shared/components/ui/kpi-cards/kpi-cards.component';
import { InlineBannerComponent } from '../../../../shared/components/ui/inline-banner/inline-banner.component';
import { FINANCE_ENTITY_LABEL_KEYS, getFinanceLocale } from '../../utils/finance-i18n.utils';

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-financial-adjustments',
 standalone: true,
 imports: [
 CommonModule,
 FormsModule,
 TranslateModule,
 FinanceStatusBadgeComponent,
 ModalShellComponent,
 AppButtonComponent,
 AppCardComponent,
    AppPageHeaderComponent,
    KpiCardsComponent,
    InlineBannerComponent
  ],
  templateUrl: './financial-adjustments.component.html'
})
export class FinancialAdjustmentsComponent implements OnInit {
 private readonly cdr = inject(ChangeDetectorRef);
  private readonly financeService = inject(FinanceService);
  private readonly translate = inject(TranslateService);

 adjustments: FinancialAdjustment[] = [];
 showCreateModal = false;
  selectedAdjustment: FinancialAdjustment | null = null;
  kpiCards: KPICard[] = [];
  adjustmentStats: FinancialAdjustmentStats | null = null;

  searchQuery = '';
 selectedDirection: 'all' | 'credit' | 'debit' = 'all';
  selectedCategory = 'all';
  selectedEntityType: 'all' | EntityType = 'all';

 form: {
 entityType: EntityType;
 entityId: string;
 direction: AdjustmentDirection;
 amount: number;
 reason: string;
 category: string;
 } = {
 entityType: 'vendor',
 entityId: '',
 direction: 'credit',
 amount: 0,
 reason: '',
 category: 'compensation'
 };

 loadError = false;
 submitError = '';
 isSubmitting = false;

 entityTypes = [
 { value: 'vendor' as EntityType, labelKey: FINANCE_ENTITY_LABEL_KEYS['vendor'], icon: 'store' },
 { value: 'driver' as EntityType, labelKey: FINANCE_ENTITY_LABEL_KEYS['driver'], icon: 'local_shipping' }
 ];

 categories = [
 { value: 'compensation', labelKey: 'FINANCES.ADJUSTMENTS.CATEGORIES.COMPENSATION' },
 { value: 'cod_recovery', labelKey: 'FINANCES.ADJUSTMENTS.CATEGORIES.COD_RECOVERY' },
 { value: 'promotion', labelKey: 'FINANCES.ADJUSTMENTS.CATEGORIES.PROMOTION' },
 { value: 'penalty', labelKey: 'FINANCES.ADJUSTMENTS.CATEGORIES.PENALTY' },
 { value: 'correction', labelKey: 'FINANCES.ADJUSTMENTS.CATEGORIES.CORRECTION' },
 { value: 'other', labelKey: 'FINANCES.ADJUSTMENTS.CATEGORIES.OTHER' }
 ];

 ngOnInit(): void {
 this.loadAdjustments();
 }

 loadAdjustments(): void {
 this.loadError = false;
 const filter = {
 ownerType: this.selectedEntityType === 'all' ? undefined : this.selectedEntityType
 };

 forkJoin({
 adjustments: this.financeService.getAdjustments(filter),
 stats: this.financeService.getAdjustmentStats(filter)
 }).pipe(take(1)).subscribe({
 next: ({ adjustments, stats }) => {
 this.adjustments = adjustments;
 this.adjustmentStats = stats;
 this.refreshKpiCards();
 this.cdr.markForCheck();
 },
 error: () => {
 this.loadError = true;
 this.adjustmentStats = null;
 this.cdr.markForCheck();
 }
 });
 }

 onEntityTypeChange(entityType: 'all' | EntityType): void {
 this.selectedEntityType = entityType;
 this.loadAdjustments();
 }

  get isRTL(): boolean {
    return this.translate.currentLang?.startsWith('ar') ?? true;
  }

 get totalCredits(): number {
    return this.adjustments
      .filter(a => a.direction === 'credit' && a.status === 'approved')
      .reduce((sum, a) => sum + a.amount, 0);
 }

 get totalDebits(): number {
    return this.adjustments
      .filter(a => a.direction === 'debit' && a.status === 'approved')
      .reduce((sum, a) => sum + a.amount, 0);
 }

 get netAdjustments(): number {
 return this.totalCredits - this.totalDebits;
 }

 get pendingCount(): number {
 return this.adjustments.filter(a => a.status === 'pending_approval').length;
 }

  get modalDir(): 'rtl' | 'ltr' {
    return this.isRTL ? 'rtl' : 'ltr';
  }

 getFilteredAdjustments(): FinancialAdjustment[] {
 return this.adjustments.filter(adj => {
      if (this.selectedDirection !== 'all' && adj.direction !== this.selectedDirection) {
 return false;
 }

      if (this.selectedCategory !== 'all' && adj.category !== this.selectedCategory) {
 return false;
 }

 if (this.searchQuery.trim()) {
 const query = this.searchQuery.toLowerCase();
 const ref = (adj.adjustmentRef || '').toLowerCase();
 const entityName = (adj.entityName || '').toLowerCase();
 const reason = (adj.reason || '').toLowerCase();
        if (!ref.includes(query) && !entityName.includes(query) && !reason.includes(query)) {
 return false;
 }
 }

 return true;
 });
 }

 openCreateModal(): void {
 this.showCreateModal = true;
 }

 closeCreateModal(): void {
 this.showCreateModal = false;
 this.resetForm();
 }

  openDetail(adjustment: FinancialAdjustment): void {
    this.selectedAdjustment = adjustment;
  }

  closeDetail(): void {
    this.selectedAdjustment = null;
 }

 submitAdjustment(): void {
 const ownerId = this.form.entityId.trim();
 if (!this.form.reason || !this.form.amount || !ownerId) {
 return;
 }

 this.isSubmitting = true;
 this.submitError = '';

 const newAdj: Partial<FinancialAdjustment> = {
 entityType: this.form.entityType,
 entityId: ownerId,
 direction: this.form.direction,
 amount: this.form.amount,
 currency: 'SAR',
 reason: this.form.reason,
 category: this.form.category
 };

 this.financeService.createAdjustment(newAdj).pipe(take(1)).subscribe({
 next: (adj) => {
 this.adjustments = [adj, ...this.adjustments];
 this.refreshKpiCards();
 this.resetForm();
 this.showCreateModal = false;
 this.isSubmitting = false;
 this.cdr.markForCheck();
 },
 error: () => {
 this.submitError = 'FINANCES.ADJUSTMENTS.ERRORS.SUBMIT_FAILED';
 this.isSubmitting = false;
 this.cdr.markForCheck();
 }
 });
 }

 displayLabel(value: string): string {
 return value.startsWith('FINANCES.') ? this.translate.instant(value) : value;
 }

 getEntityLabelKey(type: string): string {
 return FINANCE_ENTITY_LABEL_KEYS[type] ?? type;
 }

  getEntityBadgeClass(type: string): string {
    return type === 'vendor'
      ? 'bg-cyan-50 text-cyan-700 border-cyan-100'
      : 'bg-amber-50 text-amber-700 border-amber-100';
 }

 getCategoryLabelKey(cat: string): string {
 const map: Record<string, string> = {
 compensation: 'FINANCES.ADJUSTMENTS.CATEGORIES.COMPENSATION',
 cod_recovery: 'FINANCES.ADJUSTMENTS.CATEGORIES.COD_RECOVERY',
 promotion: 'FINANCES.ADJUSTMENTS.CATEGORIES.PROMOTION',
 penalty: 'FINANCES.ADJUSTMENTS.CATEGORIES.PENALTY',
 correction: 'FINANCES.ADJUSTMENTS.CATEGORIES.CORRECTION',
 other: 'FINANCES.ADJUSTMENTS.CATEGORIES.OTHER'
 };
 return map[cat] ?? cat;
 }

 getCategoryIcon(cat: string): string {
 switch (cat) {
 case 'compensation': return 'monetization_on';
 case 'cod_recovery': return 'payments';
 case 'promotion': return 'redeem';
 case 'penalty': return 'gavel';
 case 'correction': return 'build';
 default: return 'help_outline';
 }
 }

 getCategoryColor(cat: string): string {
 switch (cat) {
 case 'compensation': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
 case 'cod_recovery': return 'bg-amber-50 text-amber-600 border-amber-100';
 case 'promotion': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
 case 'penalty': return 'bg-rose-50 text-rose-600 border-rose-100';
 case 'correction': return 'bg-sky-50 text-sky-600 border-sky-100';
 default: return 'bg-slate-50 text-slate-500 border-slate-100';
 }
 }

  trackById(_: number, adjustment: FinancialAdjustment): string {
    return adjustment.id;
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString(getFinanceLocale(this.translate.currentLang), {
      timeZone: 'Asia/Riyadh',
      calendar: 'gregory'
    });
 }

 formatNumber(value: number): string {
 return value.toLocaleString(getFinanceLocale(this.translate.currentLang), {
 minimumFractionDigits: 0,
 maximumFractionDigits: 2
 });
 }

  private refreshKpiCards(): void {
    const stats = this.adjustmentStats;
    const totalCredits = stats?.totalCredits ?? this.totalCredits;
    const totalDebits = stats?.totalDebits ?? this.totalDebits;
    const netAdjustments = stats?.netImpact ?? this.netAdjustments;
    const pendingCount = stats?.pendingCount ?? this.pendingCount;
    const currency = this.translate.instant('FINANCES.CURRENCY');
    this.kpiCards = [
      {
        id: 'credits',
        title: 'FINANCES.ADJUSTMENTS.KPI.TOTAL_CREDITS',
        value: `${this.formatNumber(totalCredits)} ${currency}`,
        icon: 'arrow_downward',
        color: '#10b981'
      },
      {
        id: 'debits',
        title: 'FINANCES.ADJUSTMENTS.KPI.TOTAL_DEBITS',
        value: `${this.formatNumber(totalDebits)} ${currency}`,
        icon: 'arrow_upward',
        color: '#f43f5e'
      },
      {
        id: 'net',
        title: 'FINANCES.ADJUSTMENTS.KPI.NET_IMPACT',
        value: `${netAdjustments >= 0 ? '+' : ''}${this.formatNumber(netAdjustments)} ${currency}`,
        icon: 'account_balance',
        color: '#6366f1'
      },
      {
        id: 'pending',
        title: 'FINANCES.ADJUSTMENTS.KPI.PENDING',
        value: pendingCount,
        icon: 'pending_actions',
        color: '#f59e0b',
        trend: pendingCount > 0
          ? { value: pendingCount, isPositive: false, label: String(pendingCount) }
          : undefined
      }
    ];
 }

 private resetForm(): void {
    this.form = {
      entityType: 'vendor',
      entityId: '',
      direction: 'credit',
      amount: 0,
      reason: '',
      category: 'compensation'
    };
    this.submitError = '';
 }
}
