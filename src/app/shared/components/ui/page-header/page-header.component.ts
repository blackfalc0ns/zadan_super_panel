import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

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
  @Input() backUrl: string | any[] = '..';
  @Input() breadcrumbs: { label: string, url?: string | any[] }[] = [];

  @Output() backClick = new EventEmitter<void>();

  onBack(): void {
    this.backClick.emit();
  }
}
