import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';
import { DisputeQuickActionFormValue, DisputeQuickActionModalConfig, createEmptyQuickActionFormValue } from '../../models/disputes.models';

@Component({
  selector: 'app-dispute-quick-action-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalShellComponent],
  templateUrl: './dispute-quick-action-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisputeQuickActionModalComponent {
  @Input() isOpen = false;
  @Input() isRtl = true;
  @Input() config: DisputeQuickActionModalConfig | null = null;
  @Input() value: DisputeQuickActionFormValue = createEmptyQuickActionFormValue();

  @Output() close = new EventEmitter<void>();
  @Output() submitAction = new EventEmitter<DisputeQuickActionFormValue>();

  get canSubmit(): boolean {
    if (!this.config) {
      return false;
    }

    if (this.config.primaryRequired && !this.value.primaryValue.trim()) {
      return false;
    }

    if (this.config.secondaryRequired && !this.value.secondaryValue.trim()) {
      return false;
    }

    return true;
  }

  submit(): void {
    if (!this.canSubmit) {
      return;
    }

    this.submitAction.emit({
      primaryValue: this.value.primaryValue.trim(),
      secondaryValue: this.value.secondaryValue.trim()
    });
  }
}
