import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { StatusPillComponent } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { DriverDetailRecord } from '../../models/drivers.models';
import { getSupportStatusVariant, getSupportStatusKey, getPriorityVariant, getPriorityKey } from '../../utils/driver-ui.utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-driver-support-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, StatusPillComponent, SectionHeaderComponent],
  templateUrl: './driver-support-tab.component.html'
})
export class DriverSupportTabComponent {
  @Input({ required: true }) driver!: DriverDetailRecord;
  @Input() quickNote = '';
  @Input() isRTL = true;
  
  @Output() quickNoteChange = new EventEmitter<string>();
  @Output() quickNoteAdded = new EventEmitter<void>();

  onQuickNoteChange(value: string) {
    this.quickNote = value;
    this.quickNoteChange.emit(value);
  }

  getTicketStatusVariant(status: string) {
    return getSupportStatusVariant(status as any);
  }

  getTicketPriorityVariant(priority: string) {
    return getPriorityVariant(priority as any);
  }

  getTicketStatusKey(status: string) {
    return getSupportStatusKey(status as any);
  }

  getTicketPriorityKey(priority: string) {
    return getPriorityKey(priority as any);
  }
}
