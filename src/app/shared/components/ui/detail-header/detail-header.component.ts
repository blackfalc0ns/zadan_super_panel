import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-header.component.html'
})
export class DetailHeaderComponent {
  @Input() title: string = '';
  @Input() breadcrumbs: { label: string; action?: () => void }[] = [];
  @Input() actionButtonLabel: string = 'تعديل';
  @Input() actionButtonIcon: 'edit' | 'save' = 'edit';
  @Input() isActionDisabled: boolean = false;
  
  @Output() backClick = new EventEmitter<void>();
  @Output() actionClick = new EventEmitter<void>();

  onBackClick(): void {
    this.backClick.emit();
  }

  onActionClick(): void {
    this.actionClick.emit();
  }

  onBreadcrumbClick(breadcrumb: { label: string; action?: () => void }): void {
    if (breadcrumb.action) {
      breadcrumb.action();
    }
  }
}
