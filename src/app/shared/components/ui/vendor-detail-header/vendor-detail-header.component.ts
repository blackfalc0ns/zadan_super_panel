import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface Tab {
  id: string;
  labelKey: string;
  count?: number;
  active: boolean;
}

@Component({
  selector: 'app-vendor-detail-header',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './vendor-detail-header.component.html',
  styleUrls: ['./vendor-detail-header.component.scss']
})
export class VendorDetailHeaderComponent implements OnChanges {
  @Output() tabChanged = new EventEmitter<string>();
  @Input() activeTab: string = 'overview';

  currentLang: string = 'ar';
  isRTL: boolean = true;

  // Drag to scroll properties
  isDragging = false;
  startX = 0;
  scrollLeft = 0;

  title = 'تفاصيل التاجر - متجر التقنية الحديثة';
  vendorId = 'VND-9928';
  registrationDate = 'مسجل منذ ٢ مايو ٢٠٢٣';
  category = 'إلكترونيات وتقنية';

  tabs: Tab[] = [
    { id: 'overview', labelKey: 'VENDOR_DETAIL.TAB_OVERVIEW', active: true },
    { id: 'data', labelKey: 'VENDOR_DETAIL.TAB_BASIC_DATA', active: false },
    { id: 'analytics', labelKey: 'VENDOR_DETAIL.TAB_ANALYTICS', active: false },
    { id: 'products', labelKey: 'VENDOR_DETAIL.TAB_PRODUCTS', count: 142, active: false },
    { id: 'orders', labelKey: 'VENDOR_DETAIL.TAB_ORDERS', count: 1230, active: false },
    { id: 'finance', labelKey: 'VENDOR_DETAIL.TAB_FINANCE', active: false },
    { id: 'compliance', labelKey: 'VENDOR_DETAIL.TAB_COMPLIANCE', active: false },
    { id: 'logs', labelKey: 'VENDOR_DETAIL.TAB_LOGS', active: false },
    { id: 'settings', labelKey: 'VENDOR_DETAIL.TAB_SETTINGS', active: false }
  ];

  constructor(private translate: TranslateService) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';
    
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.isRTL = event.lang === 'ar';
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activeTab'] && changes['activeTab'].currentValue) {
      this.tabs.forEach(tab => tab.active = tab.id === changes['activeTab'].currentValue);
    }
  }

  onTabClick(tabId: string) {
    if (this.isDragging) return; // Prevent click if the user was just dragging
    this.tabs.forEach(tab => tab.active = tab.id === tabId);
    this.tabChanged.emit(tabId);
  }

  // Drag to scroll functionality
  onMouseDown(event: MouseEvent, container: HTMLElement) {
    this.isDragging = true;
    container.classList.add('cursor-grabbing');
    this.startX = event.pageX - container.offsetLeft;
    this.scrollLeft = container.scrollLeft;
  }

  onMouseLeave(container: HTMLElement) {
    this.isDragging = false;
    container.classList.remove('cursor-grabbing');
  }

  onMouseUp(container: HTMLElement) {
    this.isDragging = false;
    container.classList.remove('cursor-grabbing');
  }

  onMouseMove(event: MouseEvent, container: HTMLElement) {
    if (!this.isDragging) return;
    event.preventDefault();
    const x = event.pageX - container.offsetLeft;
    const walk = (x - this.startX) * 2; // Scroll speed multiplier
    container.scrollLeft = this.scrollLeft - walk;
  }
}