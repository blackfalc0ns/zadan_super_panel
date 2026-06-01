import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StatusPillComponent, StatusPillVariant } from '@shared/components/ui/status-pill/status-pill.component';
import { EmailSenderProfile, EmailSenderProfileStatus } from '../../models/email-center.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-email-sender-profiles',
  standalone: true,
  imports: [CommonModule, TranslateModule, StatusPillComponent],
  templateUrl: './email-sender-profiles.component.html'
})
export class EmailSenderProfilesComponent {
  private readonly translate = inject(TranslateService);

  @Input() senderProfiles: EmailSenderProfile[] = [];

  isCollapsed = false;

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  getProfileName(profile: EmailSenderProfile): string {
    const key = `EMAIL_CENTER.PROFILES.${profile.id.toUpperCase().replace(/-/g, '_')}_NAME`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : profile.name;
  }

  getSenderProfileVariant(status: EmailSenderProfileStatus): StatusPillVariant {
    const variants: Record<EmailSenderProfileStatus, StatusPillVariant> = {
      primary: 'success',
      secondary: 'info',
      backup: 'warning'
    };

    return variants[status];
  }
}
