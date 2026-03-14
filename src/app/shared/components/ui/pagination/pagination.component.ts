import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, TranslateModule, AppButtonComponent],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class AppPaginationComponent {
  /** Current active page (1-indexed) */
  @Input() currentPage = 1;

  /** Number of items per page */
  @Input() pageSize = 10;

  /** Total number of items across all pages */
  @Input() totalItems = 0;

  /** Emits the new page number when user changes page */
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageChange.emit(page);
  }
}
