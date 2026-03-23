import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';
import { DriverAssignmentForm, DriverCandidate, OrderDetail } from '../../orders.models';

@Component({
  selector: 'app-order-driver-assignment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalShellComponent],
  templateUrl: './order-driver-assignment-modal.component.html',
  styleUrl: './order-driver-assignment-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderDriverAssignmentModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() order: OrderDetail | null = null;
  @Input() drivers: DriverCandidate[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() submitAssignment = new EventEmitter<DriverAssignmentForm>();

  readonly assignmentReasons: DriverAssignmentForm['assignmentReason'][] = [
    'driver_delay',
    'customer_request',
    'vehicle_issue',
    'manual_optimization',
    'other'
  ];

  form: DriverAssignmentForm = this.createEmptyForm();

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen']?.currentValue || changes['order'] || changes['drivers']) && this.isOpen) {
      this.form = this.createDefaultForm();
    }
  }

  get cityOptions(): string[] {
    return Array.from(new Set(this.drivers.map((driver) => driver.city)));
  }

  get filteredDrivers(): DriverCandidate[] {
    const search = this.form.searchQuery.trim().toLowerCase();

    return this.drivers
      .filter((driver) => {
        const matchesSearch = !search
          || driver.name.toLowerCase().includes(search)
          || driver.code.toLowerCase().includes(search)
          || driver.phone.toLowerCase().includes(search);

        const matchesCity = this.form.city === 'all' || driver.city === this.form.city;
        const matchesAvailability = this.form.availability === 'all'
          || (this.form.availability === 'available' && driver.status === 'AVAILABLE')
          || (this.form.availability === 'busy' && driver.status === 'DELIVERING');
        const matchesVerification = this.form.verification === 'all'
          || (this.form.verification === 'verified' && driver.verified);

        return matchesSearch && matchesCity && matchesAvailability && matchesVerification;
      })
      .sort((first, second) => {
        if (first.status !== second.status) {
          return first.status === 'AVAILABLE' ? -1 : 1;
        }

        if (first.distanceKm !== second.distanceKm) {
          return first.distanceKm - second.distanceKm;
        }

        return second.rating - first.rating;
      });
  }

  get selectedDriver(): DriverCandidate | undefined {
    return this.drivers.find((driver) => driver.id === this.form.selectedDriverId);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  selectDriver(driverId: string): void {
    this.form.selectedDriverId = driverId;
  }

  resetFilters(): void {
    const selectedDriverId = this.form.selectedDriverId;

    this.form = {
      ...this.form,
      searchQuery: '',
      city: 'all',
      availability: 'all',
      verification: 'all',
      selectedDriverId
    };
  }

  onSubmit(): void {
    if (!this.form.selectedDriverId) {
      return;
    }

    this.submitAssignment.emit({ ...this.form });
  }

  getDriverStatusKey(driver: DriverCandidate): string {
    return driver.status === 'AVAILABLE'
      ? 'ORDERS.DETAIL.DRIVER_MODAL.STATUS_AVAILABLE'
      : 'ORDERS.DETAIL.DRIVER_MODAL.STATUS_DELIVERING';
  }

  getDriverStatusClasses(driver: DriverCandidate): string {
    return driver.status === 'AVAILABLE'
      ? 'bg-zadna-primary/10 text-zadna-primary'
      : 'bg-amber-100 text-amber-700';
  }

  getRecommendationToneClasses(): string {
    if (this.selectedDriver?.lowPerformance) {
      return 'border-red-200 bg-red-50/80 text-red-700';
    }

    if (this.selectedDriver?.status === 'DELIVERING') {
      return 'border-amber-200 bg-amber-50/80 text-amber-700';
    }

    return 'border-teal-200 bg-teal-50/80 text-teal-700';
  }

  getRecommendationIcon(): string {
    if (this.selectedDriver?.lowPerformance) {
      return 'warning';
    }

    if (this.selectedDriver?.status === 'DELIVERING') {
      return 'schedule';
    }

    return 'verified';
  }

  getRecommendationTitleKey(): string {
    if (this.selectedDriver?.lowPerformance) {
      return 'ORDERS.DETAIL.DRIVER_MODAL.WARNING_TITLE';
    }

    if (this.selectedDriver?.status === 'DELIVERING') {
      return 'ORDERS.DETAIL.DRIVER_MODAL.BUSY_TITLE';
    }

    return 'ORDERS.DETAIL.DRIVER_MODAL.GOOD_TITLE';
  }

  getRecommendationBodyKey(): string {
    if (this.selectedDriver?.lowPerformance) {
      return 'ORDERS.DETAIL.DRIVER_MODAL.WARNING_BODY';
    }

    if (this.selectedDriver?.status === 'DELIVERING') {
      return 'ORDERS.DETAIL.DRIVER_MODAL.BUSY_BODY';
    }

    return 'ORDERS.DETAIL.DRIVER_MODAL.GOOD_BODY';
  }

  trackByDriverId(_: number, driver: DriverCandidate): string {
    return driver.id;
  }

  private createDefaultForm(): DriverAssignmentForm {
    const recommendedDriver = this.drivers
      .slice()
      .sort((first, second) => {
        if (first.status !== second.status) {
          return first.status === 'AVAILABLE' ? -1 : 1;
        }

        if (first.distanceKm !== second.distanceKm) {
          return first.distanceKm - second.distanceKm;
        }

        return second.rating - first.rating;
      })[0];

    return {
      searchQuery: '',
      city: 'all',
      availability: 'all',
      verification: 'all',
      selectedDriverId: recommendedDriver?.id || '',
      assignmentReason: 'manual_optimization',
      internalNotes: '',
      notifyDriver: true,
      notifyMerchant: true,
      notifyCustomer: false
    };
  }

  private createEmptyForm(): DriverAssignmentForm {
    return {
      searchQuery: '',
      city: 'all',
      availability: 'all',
      verification: 'all',
      selectedDriverId: '',
      assignmentReason: 'manual_optimization',
      internalNotes: '',
      notifyDriver: true,
      notifyMerchant: true,
      notifyCustomer: false
    };
  }
}
