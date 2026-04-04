import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

type RouteTarget = string | Array<string | number>;

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss'
})
export class AppPageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() showBack = false;
  @Input() showToolbar = false;
  @Input() backUrl: RouteTarget = '..';
  @Input() breadcrumbs: Array<{ label: string; url?: RouteTarget }> = [];

  @Output() backClick = new EventEmitter<void>();

  onBack(): void {
    this.backClick.emit();
  }
}
