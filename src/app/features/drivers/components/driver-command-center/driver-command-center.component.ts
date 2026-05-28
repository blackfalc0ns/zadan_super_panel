import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StatusPillComponent } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { DriverLifecycleStage, DriverWorkflowActionId, DriverWorkflowSummary } from '../../models/drivers.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-driver-command-center',
  standalone: true,
  imports: [CommonModule, TranslateModule, StatusPillComponent],
  templateUrl: './driver-command-center.component.html'
})
export class DriverCommandCenterComponent {
  @Input({ required: true }) workflow!: DriverWorkflowSummary;
  @Input({ required: true }) lifecycleStages!: DriverLifecycleStage[];
  @Input() isRTL = true;
  
  @Output() workflowActionRequested = new EventEmitter<DriverWorkflowActionId>();
  
  get readinessVariant(): 'success' | 'warning' | 'danger' {
    const map: Record<string, 'success' | 'warning' | 'danger'> = {
      READY: 'success',
      LIMITED: 'warning',
      BLOCKED: 'danger'
    };
    return map[this.workflow.readiness] || 'warning';
  }

  get lifecycleProgress(): number {
    if (this.lifecycleStages.length <= 1) return 0;
    const currentIndex = this.lifecycleStages.findIndex(s => s.state === 'current' || s.state === 'attention');
    if (currentIndex === -1) return 100;
    return (currentIndex / (this.lifecycleStages.length - 1)) * 100;
  }

  getStageStateClass(state: DriverLifecycleStage['state']): string {
    switch (state) {
      case 'completed': return 'bg-emerald-500 border-emerald-500 shadow-emerald-500/30 shadow-lg';
      case 'current': return 'bg-zadna-primary border-zadna-primary shadow-zadna-primary/30 shadow-lg ring-4 ring-zadna-primary/10';
      case 'attention': return 'bg-red-500 border-red-500 shadow-red-500/30 shadow-lg animate-pulse';
      case 'upcoming': return 'bg-white border-slate-200 text-slate-400';
      default: return 'bg-white border-slate-200 text-slate-400';
    }
  }
}
