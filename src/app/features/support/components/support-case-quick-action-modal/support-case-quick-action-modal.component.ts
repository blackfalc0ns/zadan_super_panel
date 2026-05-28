import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ModalShellComponent } from '../../../../shared/components/ui/modal-shell/modal-shell.component';
import {
  SupportCaseQuickActionFormValue,
  SupportCaseQuickActionModalConfig,
  createEmptySupportCaseQuickActionFormValue
} from '../../models/support-cases.models';

@Component({
  selector: 'app-support-case-quick-action-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ModalShellComponent],
  templateUrl: './support-case-quick-action-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportCaseQuickActionModalComponent {
  @Input() isOpen = false;
  @Input() isRtl = true;
  @Input() config: SupportCaseQuickActionModalConfig | null = null;
  @Input() value: SupportCaseQuickActionFormValue = createEmptySupportCaseQuickActionFormValue();

  @Output() close = new EventEmitter<void>();
  @Output() submitAction = new EventEmitter<SupportCaseQuickActionFormValue>();

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
