import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-detail-header',
 standalone: true,
 imports: [CommonModule],
 templateUrl: './detail-header.component.html'
})
export class DetailHeaderComponent {
 @Input() title = '';
 @Input() breadcrumbs: { label: string; action?: () => void }[] = [];
 @Input() actionButtonLabel = 'تعديل';
 @Input() actionButtonIcon: 'edit' | 'save' = 'edit';
 @Input() isActionDisabled = false;
 @Input() containerClass = 'max-w-7xl mx-auto mb-0 relative z-10';
 @Input() headerClass = 'flex justify-between items-center p-4 md:p-6';

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
