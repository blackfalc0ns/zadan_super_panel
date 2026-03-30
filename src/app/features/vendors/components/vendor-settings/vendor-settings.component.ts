import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent } from '../../../../shared/components/ui/status-pill/status-pill.component';

@Component({
  selector: 'app-vendor-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SectionHeaderComponent, StatusPillComponent],
  templateUrl: './vendor-settings.component.html'
})
export class VendorSettingsComponent {
  currentLang: string = 'ar';
  isRTL: boolean = true;

  constructor(private translate: TranslateService) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';
    
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.isRTL = event.lang === 'ar';
    });
  }

  onResetPassword() {
    console.log('Reset password clicked');
  }

  onArchiveAccount() {
    console.log('Archive account clicked');
  }
}
