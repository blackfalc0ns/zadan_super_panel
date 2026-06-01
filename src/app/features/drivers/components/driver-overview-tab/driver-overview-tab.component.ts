import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, ChangeDetectorRef } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { KeyValueGridComponent } from '../../../../shared/components/ui/key-value-grid/key-value-grid.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { DriverDetailRecord } from '../../models/drivers.models';
import { getVehicleTypeKey } from '../../utils/driver-ui.utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-driver-overview-tab',
  standalone: true,
  imports: [CommonModule, TranslateModule, KeyValueGridComponent, SectionHeaderComponent],
  templateUrl: './driver-overview-tab.component.html'
})
export class DriverOverviewTabComponent {
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  copiedFields: Record<string, boolean> = {};

  @Input({ required: true }) driver!: DriverDetailRecord;
  @Input() isRTL = true;
  @Output() tabChange = new EventEmitter<string>();

  get personalInfoItems() {
    return [
      { label: 'DRIVERS.DETAIL.OVERVIEW.FULL_NAME', value: `${this.driver.firstName} ${this.driver.lastName}` },
      { label: 'DRIVERS.DETAIL.OVERVIEW.PHONE_NUMBER', value: this.driver.phoneNumber, direction: 'ltr' as const, copyable: true, key: 'phone' },
      { label: 'DRIVERS.DETAIL.OVERVIEW.EMAIL', value: this.driver.email, direction: 'ltr' as const, copyable: true, key: 'email' },
      { label: 'DRIVERS.DETAIL.OVERVIEW.CITY', value: this.driver.city, isCity: true },
      { label: 'DRIVERS.DETAIL.OVERVIEW.JOINED_AT', value: this.driver.joinedAt }
    ];
  }

  get vehicleInfoItems() {
    return [
      {
        label: 'DRIVERS.DETAIL.OVERVIEW.VEHICLE_TYPE',
        value: this.driver.vehicleType ? getVehicleTypeKey(this.driver.vehicleType) : 'COMMON.NOT_AVAILABLE',
        translateValue: true
      },
      {
        label: 'DRIVERS.DETAIL.OVERVIEW.LICENSE_NUMBER',
        value: this.driver.licenseNumber || 'COMMON.NOT_AVAILABLE',
        direction: 'ltr' as const,
        translateValue: !this.driver.licenseNumber,
        copyable: !!this.driver.licenseNumber,
        key: 'license'
      },
      {
        label: 'DRIVERS.DETAIL.OVERVIEW.ZONE',
        value: this.driver.zoneName || this.driver.liveZone || 'COMMON.NOT_AVAILABLE',
        translateValue: !this.driver.zoneName && !this.driver.liveZone
      }
    ];
  }

  copyToClipboard(field: string, text: string) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.copiedFields[field] = true;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.copiedFields[field] = false;
        this.cdr.markForCheck();
      }, 2000);
    });
  }

  getTranslatedCity(city?: string): string {
    if (!city) return '';
    const normalized = city.trim().toUpperCase();
    const cityMap: Record<string, string> = {
      'RIYADH': 'RIYADH',
      'الرياض': 'RIYADH',
      'JEDDAH': 'JEDDAH',
      'جدة': 'JEDDAH',
      'DAMMAM': 'DAMMAM',
      'الدمام': 'DAMMAM',
      'MAKKAH': 'MAKKAH',
      'MECCA': 'MAKKAH',
      'مكة': 'MAKKAH',
      'MADINAH': 'MADINAH',
      'MEDINA': 'MADINAH',
      'المدينة': 'MADINAH',
      'TAIF': 'TAIF',
      'الطائف': 'TAIF',
      'TABUK': 'TABUK',
      'تبوك': 'TABUK',
      'ABHA': 'ABHA',
      'أبها': 'ABHA',
      'KHOBAR': 'KHOBAR',
      'الخبر': 'KHOBAR',
      'QATIF': 'QATIF',
      'القطيف': 'QATIF'
    };
    const keyToken = cityMap[normalized] || normalized;
    const key = `COMMON.CITIES.${keyToken}`;
    const translated = this.translate.instant(key);
    return translated === key ? city : translated;
  }

  get hasSupportUpdateTimestamp(): boolean {
    return !!this.driver.support.lastUpdateLabel
      && !this.driver.support.lastUpdateLabel.startsWith('DRIVERS.')
      && !this.driver.support.lastUpdateLabel.startsWith('COMMON.');
  }

  get completedChecklistItems(): number {
    return this.driver.profileReadiness.checklist.filter((item) => item.completed).length;
  }

  get missingRequirementLabels(): string[] {
    return this.driver.profileReadiness.missingRequirements.map((requirement) =>
      `DRIVERS.DETAIL.VERIFICATION.BACKEND.REJECTION_REASONS.${requirement.toUpperCase()}`);
  }

  get hasReviewNote(): boolean {
    return Boolean(this.driver.verification.decisionNote || this.driver.verification.internalNote);
  }

  get reviewNote(): string {
    return this.driver.verification.decisionNote || this.driver.verification.internalNote || '';
  }
}
