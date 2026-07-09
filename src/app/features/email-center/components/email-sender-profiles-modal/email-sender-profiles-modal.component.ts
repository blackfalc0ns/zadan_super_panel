import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ModalShellComponent } from '@shared/components/ui/modal-shell/modal-shell.component';
import { EmailSenderProfile } from '../../models/email-center.models';
import { EmailSenderProfilesComponent } from '../email-sender-profiles/email-sender-profiles.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-email-sender-profiles-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule, ModalShellComponent, EmailSenderProfilesComponent],
  templateUrl: './email-sender-profiles-modal.component.html'
})
export class EmailSenderProfilesModalComponent {
  @Input() open = false;
  @Input() senderProfiles: EmailSenderProfile[] = [];
  @Output() closed = new EventEmitter<void>();
}
