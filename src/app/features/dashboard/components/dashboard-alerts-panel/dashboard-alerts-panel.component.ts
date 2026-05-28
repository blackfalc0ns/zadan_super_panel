import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardAlert, DashboardAttentionItem, DashboardQueue, DashboardSeverity } from '../../models/dashboard.models';

@Component({
  selector: 'app-dashboard-alerts-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './dashboard-alerts-panel.component.html',
  styleUrl: './dashboard-alerts-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardAlertsPanelComponent {
  @Input() alerts: DashboardAlert[] = [];
  @Input() attentionItems: DashboardAttentionItem[] = [];
  @Input() liveQueues: DashboardQueue[] = [];
  @Input() riskQueues: DashboardQueue[] = [];
  @Input() isRTL = true;

  get totalLiveCount(): number {
    return this.liveQueues.reduce((sum, q) => sum + q.count, 0);
  }

  get totalRiskCount(): number {
    return this.riskQueues.reduce((sum, q) => sum + q.count, 0);
  }

  getQueueToneClasses(severity: DashboardSeverity): string {
    const classes: Record<DashboardSeverity, string> = {
      critical: 'border-red-100 bg-red-50/50',
      warning: 'border-amber-100 bg-amber-50/50',
      info: 'border-cyan-100 bg-cyan-50/50',
      success: 'border-emerald-100 bg-emerald-50/50',
      neutral: 'border-slate-100 bg-white'
    };
    return classes[severity];
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
}
