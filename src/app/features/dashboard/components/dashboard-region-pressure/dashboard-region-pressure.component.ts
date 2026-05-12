import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardRegionPressureRow } from '../../models/dashboard.models';

@Component({
  selector: 'app-dashboard-region-pressure',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './dashboard-region-pressure.component.html',
  styleUrl: './dashboard-region-pressure.component.scss'
})
export class DashboardRegionPressureComponent {
  @Input() rows: DashboardRegionPressureRow[] = [];
  @Input() isRTL = true;

  get totalPressureScore(): number {
    return this.rows.reduce((sum, row) => sum + row.score, 0);
  }

  getTotalIncidents(row: DashboardRegionPressureRow): number {
    return row.lateOrders + row.paymentIssues + row.driverGap;
  }

  getRegionPressureTone(score: number): string {
    if (score >= 15) return 'bg-red-500';
    if (score >= 8) return 'bg-amber-500';
    return 'bg-cyan-600';
  }

  getRegionPressureCardTone(score: number): string {
    if (score >= 15) return 'is-critical';
    if (score >= 8) return 'is-warning';
    return 'is-info';
  }

  getRegionPressureWidth(score: number): number {
    const maxScore = Math.max(...this.rows.map(r => r.score), 1);
    return Math.max(12, Math.round((score / maxScore) * 100));
  }

  trackByRegion(_index: number, item: DashboardRegionPressureRow): string {
    return item.regionKey;
  }
}
