import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardSection, DashboardSeverity, DashboardExceptionRow, DashboardRankedRow, DashboardRankedList } from '../../models/dashboard.models';

interface SectionTab {
  id: string;
  titleKey: string;
  icon: string;
  severity: DashboardSeverity;
  statsCount: number;
  exceptionsCount: number;
  rankedRowsCount: number;
  signalCount: number;
}

@Component({
  selector: 'app-dashboard-sections',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './dashboard-sections.component.html',
  styleUrl: './dashboard-sections.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardSectionsComponent implements OnChanges {
  @Input() primarySections: DashboardSection[] = [];
  @Input() secondarySections: DashboardSection[] = [];
  @Input() isRTL = true;

  activeTabId = '';
  tabs: SectionTab[] = [];

  get allSections(): DashboardSection[] {
    return [...this.primarySections, ...this.secondarySections];
  }

  get activeSection(): DashboardSection | undefined {
    return this.allSections.find(s => s.id === this.activeTabId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['primarySections'] || changes['secondarySections']) {
      this.buildTabs();
    }
  }

  setActiveTab(id: string): void {
    this.activeTabId = id;
  }

  private buildTabs(): void {
    this.tabs = this.allSections.map(s => ({
      id: s.id,
      titleKey: s.titleKey,
      icon: this.getSectionIcon(s.id),
      severity: s.status.severity,
      statsCount: s.stats.length,
      exceptionsCount: s.exceptions.length,
      rankedRowsCount: s.rankedLists.reduce((sum, list) => sum + list.rows.length, 0),
      signalCount: s.exceptions.length + s.rankedLists.reduce((sum, list) => sum + list.rows.length, 0)
    }));
    const activeTabStillVisible = this.tabs.some(tab => tab.id === this.activeTabId);
    if (this.tabs.length > 0 && (!this.activeTabId || !activeTabStillVisible)) {
      this.activeTabId = this.tabs[0].id;
    }
  }

  getSectionIcon(sectionId: string): string {
    const icons: Record<string, string> = {
      'system-health': 'monitor_heart',
      'order-ops': 'shopping_bag',
      'vendor-ops': 'storefront',
      'driver-ops': 'local_shipping',
      'customer-support': 'support_agent',
      'finance-ops': 'account_balance',
      'catalog-health': 'inventory_2',
      'marketing-pulse': 'campaign',
      'access-security': 'shield'
    };
    return icons[sectionId] ?? 'dashboard';
  }

  getSeverityDotClass(severity: DashboardSeverity): string {
    const classes: Record<DashboardSeverity, string> = {
      critical: 'bg-red-400',
      warning: 'bg-amber-400',
      info: 'bg-cyan-400',
      success: 'bg-emerald-400',
      neutral: 'bg-slate-300'
    };
    return classes[severity];
  }

  getSeverityColor(severity: DashboardSeverity): string {
    const colors: Record<DashboardSeverity, string> = {
      critical: '#dc2626',
      warning: '#d97706',
      info: '#0891b2',
      success: '#059669',
      neutral: '#64748b'
    };
    return colors[severity];
  }

  getPriorityBadgeClasses(severity: DashboardSeverity): string {
    const classes: Record<DashboardSeverity, string> = {
      critical: 'bg-red-50 text-red-700 border border-red-100',
      warning: 'bg-amber-50 text-amber-700 border border-amber-100',
      info: 'bg-cyan-50 text-cyan-700 border border-cyan-100',
      success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
      neutral: 'bg-slate-50 text-slate-600 border border-slate-200'
    };
    return classes[severity];
  }

  getStatToneClass(tone: DashboardSeverity): string {
    const classes: Record<DashboardSeverity, string> = {
      critical: 'border-l-red-400',
      warning: 'border-l-amber-400',
      info: 'border-l-zadna-primary',
      success: 'border-l-emerald-400',
      neutral: 'border-l-slate-200'
    };
    return classes[tone];
  }

  getExceptionSeverityClass(severity: DashboardSeverity): string {
    const classes: Record<DashboardSeverity, string> = {
      critical: 'text-red-600',
      warning: 'text-amber-600',
      info: 'text-cyan-600',
      success: 'text-emerald-600',
      neutral: 'text-slate-500'
    };
    return classes[severity];
  }

  trackBySection(_index: number, section: DashboardSection): string {
    return section.id;
  }

  trackByException(_index: number, row: DashboardExceptionRow): string {
    return row.id;
  }

  trackByRankedRow(_index: number, row: DashboardRankedRow): string {
    return row.id;
  }

  trackByList(_index: number, list: DashboardRankedList): string {
    return list.id;
  }

  trackByTab(_index: number, tab: SectionTab): string {
    return tab.id;
  }
}
