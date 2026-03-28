import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DetailTabsNavComponent, DetailTabNavItem } from '../detail-tabs-nav/detail-tabs-nav.component';

interface Tab {
  id: string;
  labelKey: string;
  count?: number;
  active: boolean;
}

@Component({
  selector: 'app-vendor-detail-header',
  standalone: true,
  imports: [CommonModule, TranslateModule, DetailTabsNavComponent],
  templateUrl: './vendor-detail-header.component.html',
  styleUrls: ['./vendor-detail-header.component.scss']
})
export class VendorDetailHeaderComponent implements OnChanges {
  @Output() tabChanged = new EventEmitter<string>();
  @Input() activeTab: string = 'overview';

  currentLang: string = 'ar';
  isRTL: boolean = true;

  title = '';
  vendorId = 'VND-9928';
  registrationDate = '';
  category = '';

  tabs: Tab[] = [
    { id: 'overview', labelKey: 'VENDOR_DETAIL.TAB_OVERVIEW', active: true },
    { id: 'data', labelKey: 'VENDOR_DETAIL.TAB_BASIC_DATA', active: false },
    { id: 'analytics', labelKey: 'VENDOR_DETAIL.TAB_ANALYTICS', active: false },
    { id: 'products', labelKey: 'VENDOR_DETAIL.TAB_PRODUCTS', count: 142, active: false },
    { id: 'finance', labelKey: 'VENDOR_DETAIL.TAB_FINANCE', active: false },
    { id: 'compliance', labelKey: 'VENDOR_DETAIL.TAB_COMPLIANCE', active: false },
    { id: 'logs', labelKey: 'VENDOR_DETAIL.TAB_LOGS', active: false },
    { id: 'settings', labelKey: 'VENDOR_DETAIL.TAB_SETTINGS', active: false }
  ];

  constructor(private translate: TranslateService) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';
    this.updateHeaderContent();
    
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.isRTL = event.lang === 'ar';
      this.updateHeaderContent();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activeTab'] && changes['activeTab'].currentValue) {
      this.tabs.forEach(tab => tab.active = tab.id === changes['activeTab'].currentValue);
    }
  }

  onTabClick(tabId: string) {
    this.tabs.forEach(tab => tab.active = tab.id === tabId);
    this.tabChanged.emit(tabId);
  }

  get navTabs(): DetailTabNavItem[] {
    return this.tabs.map((tab) => ({
      id: tab.id,
      labelKey: tab.labelKey,
      count: tab.count
    }));
  }

  private updateHeaderContent(): void {
    this.title = this.translate.instant('VENDOR_DETAIL.HEADER_TITLE');
    this.registrationDate = this.translate.instant('VENDOR_DETAIL.REGISTERED_SINCE');
    this.category = this.translate.instant('VENDOR_DETAIL.CATEGORY_VALUE');
  }
}
