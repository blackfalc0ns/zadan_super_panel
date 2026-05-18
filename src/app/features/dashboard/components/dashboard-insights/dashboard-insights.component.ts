import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface InsightPanel {
  id: string;
  titleKey: string;
  icon: string;
  iconClass: string;
  description: string;
  value: string;
  trendLabel?: string;
}

@Component({
  selector: 'app-dashboard-insights',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './dashboard-insights.component.html',
  styles: [':host { display: block; }']
})
export class DashboardInsightsComponent {
  @Input() panels: InsightPanel[] = [];
}
