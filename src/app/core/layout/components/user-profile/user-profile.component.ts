import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminUser, AuthService } from '../../../services/auth.service';
import {
  getAdminUserContactLine,
  getAdminUserInitials,
  getAdminUserShortId,
  getAdminRoleDisplayName,
  resolveAdminRoleLabelKey
} from '../../../utils/admin-user-display.utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() isCollapsed = false;
  @Output() logout = new EventEmitter<void>();

  user: AdminUser | null = null;

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.user = user;
        this.cdr.markForCheck();
      });

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((_event: LangChangeEvent) => this.cdr.markForCheck());
  }

  get initials(): string {
    return getAdminUserInitials(this.user?.fullName);
  }

  get displayName(): string {
    return this.user?.fullName?.trim() || this.translate.instant('SIDEBAR_EXTRA.ADMIN_STATUS');
  }

  get roleLabelKey(): string | null {
    return resolveAdminRoleLabelKey(this.user);
  }

  get roleDisplayName(): string {
    return getAdminRoleDisplayName(this.user);
  }

  get contactLine(): string | null {
    return getAdminUserContactLine(this.user);
  }

  get shortUserId(): string {
    return getAdminUserShortId(this.user?.id);
  }

  get profilePhotoUrl(): string | null {
    return this.user?.profilePhotoUrl?.trim() || null;
  }

  get isActionRequired(): boolean {
    return !!this.user?.mustChangePassword;
  }

  onLogout(): void {
    this.logout.emit();
  }
}
