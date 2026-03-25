import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { WorkflowLinkCard } from '../../../../core/services/workflow-links.service';
import { StatusPillComponent } from '../status-pill/status-pill.component';

@Component({
  selector: 'app-workflow-links-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, StatusPillComponent],
  templateUrl: './workflow-links-panel.component.html'
})
export class WorkflowLinksPanelComponent {
  @Input() cards: WorkflowLinkCard[] = [];
  @Input() titleKey = 'WORKFLOW_LINKS.TITLE';
  @Input() subtitleKey = 'WORKFLOW_LINKS.SUBTITLE';

  trackById(_: number, card: WorkflowLinkCard): string {
    return card.id;
  }
}
