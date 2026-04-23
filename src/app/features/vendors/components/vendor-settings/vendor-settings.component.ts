import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Observable, take } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SectionHeaderComponent } from '../../../../shared/components/ui/section-header/section-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { VendorDetail } from '@vendors/models/vendors.domain.models';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';

type VendorSettingsDialog = 'reset-password' | 'suspend-account' | 'lock-login' | 'archive-account' | null;

@Component({
  selector: 'app-vendor-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SectionHeaderComponent, StatusPillComponent],
  templateUrl: './vendor-settings.component.html'
})
export class VendorSettingsComponent {
  activeDialog: VendorSettingsDialog = null;
  currentLang = 'ar';
  dialogError = '';
  dialogPrimaryValue = '';
  dialogSecondaryValue = '';
  dialogSubmitting = false;
  isRTL = true;
  notificationsSubmitting = false;
  operationsSubmitting = false;
  pageError = '';
  resetPasswordQueued = false;
  vendor: VendorDetail | null = null;
  acceptOrders = true;
  minimumOrderAmount: number | null = null;
  preparationTimeMinutes: number | null = null;
  emailNotificationsEnabled = true;
  smsNotificationsEnabled = false;
  newOrdersNotificationsEnabled = true;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly translate: TranslateService,
    private readonly vendorDetailFacade: VendorDetailFacade
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.currentLang = event.lang;
        this.isRTL = event.lang === 'ar';
      });

    this.vendorDetailFacade.vendor$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendor) => {
        this.vendor = vendor;
        this.acceptOrders = vendor?.operationsSettings?.acceptOrders ?? true;
        this.minimumOrderAmount = vendor?.operationsSettings?.minimumOrderAmount ?? null;
        this.preparationTimeMinutes = vendor?.operationsSettings?.preparationTimeMinutes ?? null;
        this.emailNotificationsEnabled = vendor?.notificationSettings?.emailNotificationsEnabled ?? true;
        this.smsNotificationsEnabled = vendor?.notificationSettings?.smsNotificationsEnabled ?? false;
        this.newOrdersNotificationsEnabled = vendor?.notificationSettings?.newOrdersNotificationsEnabled ?? true;
      });
  }

  get isAccountSuspended(): boolean {
    return this.vendor?.status === 'Suspended' && !this.isLoginLocked && !this.isArchived;
  }

  get isLoginLocked(): boolean {
    return !!this.vendor?.isLoginLocked;
  }

  get isArchived(): boolean {
    return !!this.vendor?.archivedAtUtc;
  }

  get canSuspendAccount(): boolean {
    return !!this.vendor && !this.isArchived && !this.isLoginLocked && this.vendor.status === 'Active';
  }

  get canReactivateAccount(): boolean {
    return !!this.vendor && !this.isArchived && !this.isLoginLocked && this.vendor.status === 'Suspended';
  }

  get isDialogOpen(): boolean {
    return this.activeDialog !== null;
  }

  get accountStatusLabel(): string {
    if (this.isArchived) {
      return this.isRTL ? 'مؤرشف' : 'Archived';
    }

    if (this.isLoginLocked) {
      return this.isRTL ? 'مقفل' : 'Locked';
    }

    return this.isAccountSuspended ? 'VENDORS.STATUS.SUSPENDED' : 'COMMON.ACTIVE';
  }

  get accountStatusVariant(): StatusPillVariant {
    if (this.isArchived) {
      return 'danger';
    }

    if (this.isLoginLocked) {
      return 'warning';
    }

    return this.isAccountSuspended ? 'danger' : 'success';
  }

  get loginActionLabel(): string {
    return this.isLoginLocked
      ? (this.isRTL ? 'فتح تسجيل الدخول' : 'Unlock login')
      : (this.isRTL ? 'قفل تسجيل الدخول' : 'Lock login');
  }

  get suspensionActionLabel(): string {
    return this.isAccountSuspended
      ? (this.isRTL ? 'إعادة تفعيل الحساب' : 'Reactivate account')
      : (this.isRTL ? 'تعليق الحساب' : 'Suspend account');
  }

  get lastUpdatedByLabel(): string {
    return this.vendor?.approvedBy || this.vendor?.assignedReviewer || '-';
  }

  get workingHoursLabel(): string {
    const hours = this.vendor?.operatingHours ?? [];
    const openDays = hours.filter((item) => item.isOpen);

    if (!openDays.length) {
      return this.isRTL ? 'لا توجد ساعات تشغيل محفوظة' : 'No saved working hours';
    }

    if (openDays.length === 7) {
      const first = openDays[0];
      const last = openDays[openDays.length - 1];
      return `${first.openTime} - ${last.closeTime}`;
    }

    return this.isRTL
      ? `${openDays.length} أيام مفتوحة`
      : `${openDays.length} open days`;
  }

  get lastUpdatedAtLabel(): string {
    const timestamp = this.vendor?.updatedAtUtc
      || this.vendor?.reviewCompletedAtUtc
      || this.vendor?.reviewStartedAtUtc
      || this.vendor?.approvedAtUtc
      || null;

    if (!timestamp) {
      return '-';
    }

    return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  }

  get dialogTitle(): string {
    switch (this.activeDialog) {
      case 'reset-password':
        return this.isRTL ? 'إعادة تعيين كلمة المرور' : 'Reset password';
      case 'suspend-account':
        return this.isRTL ? 'تعليق حساب التاجر' : 'Suspend vendor account';
      case 'lock-login':
        return this.isRTL ? 'قفل تسجيل الدخول' : 'Lock vendor login';
      case 'archive-account':
        return this.isRTL ? 'أرشفة حساب التاجر' : 'Archive vendor account';
      default:
        return '';
    }
  }

  get dialogDescription(): string {
    switch (this.activeDialog) {
      case 'reset-password':
        return this.isRTL
          ? 'أدخل كلمة مرور جديدة للتاجر. سيتم إرسال العملية مباشرة إلى الباك إند.'
          : 'Enter a new password for the vendor. The action will be sent to the backend immediately.';
      case 'suspend-account':
        return this.isRTL
          ? 'أضف سببًا واضحًا لتعليق الحساب حتى يظهر في السجل الإداري.'
          : 'Add a clear suspension reason so it appears in the admin audit trail.';
      case 'lock-login':
        return this.isRTL
          ? 'أدخل سبب قفل تسجيل الدخول. سيُمنع هذا التاجر من الدخول حتى يتم فتح القفل.'
          : 'Enter the reason for locking login. The vendor will be blocked until the lock is removed.';
      case 'archive-account':
        return this.isRTL
          ? 'أدخل سبب الأرشفة. سيبقى السجل محفوظًا لكن الحساب سيصبح غير نشط.'
          : 'Enter the archive reason. The record stays preserved, but the account becomes inactive.';
      default:
        return '';
    }
  }

  get dialogPrimaryLabel(): string {
    return this.activeDialog === 'reset-password'
      ? (this.isRTL ? 'كلمة المرور الجديدة' : 'New password')
      : (this.isRTL ? 'السبب' : 'Reason');
  }

  get dialogPrimaryPlaceholder(): string {
    switch (this.activeDialog) {
      case 'reset-password':
        return this.isRTL ? 'مثال: NewPass@12345' : 'Example: NewPass@12345';
      case 'lock-login':
        return this.isRTL ? 'اكتب سبب قفل تسجيل الدخول' : 'Write the login lock reason';
      case 'archive-account':
        return this.isRTL ? 'اكتب سبب أرشفة الحساب' : 'Write the archive reason';
      default:
        return this.isRTL ? 'اكتب السبب' : 'Write the reason';
    }
  }

  get dialogSecondaryLabel(): string {
    return this.isRTL ? 'تأكيد كلمة المرور' : 'Confirm password';
  }

  get dialogSecondaryPlaceholder(): string {
    return this.isRTL ? 'أعد إدخال كلمة المرور' : 'Re-enter the password';
  }

  get dialogConfirmLabel(): string {
    switch (this.activeDialog) {
      case 'reset-password':
        return this.isRTL ? 'تحديث كلمة المرور' : 'Update password';
      case 'suspend-account':
        return this.isRTL ? 'تعليق الحساب' : 'Suspend account';
      case 'lock-login':
        return this.isRTL ? 'قفل تسجيل الدخول' : 'Lock login';
      case 'archive-account':
        return this.isRTL ? 'أرشفة الحساب' : 'Archive account';
      default:
        return this.isRTL ? 'حفظ' : 'Save';
    }
  }

  get dialogPrimaryInputType(): 'text' | 'password' {
    return this.activeDialog === 'reset-password' ? 'password' : 'text';
  }

  get showDialogSecondaryInput(): boolean {
    return this.activeDialog === 'reset-password';
  }

  onResetPassword(): void {
    this.pageError = '';
    this.openDialog('reset-password');
  }

  toggleSuspended(): void {
    if (!this.vendor || this.isArchived || this.isLoginLocked) {
      return;
    }

    if (this.canReactivateAccount) {
      this.pageError = '';
      this.dialogSubmitting = true;
      this.vendorDetailFacade.reactivateVendorAccountRequest()
        .pipe(take(1))
        .subscribe({
          error: () => {
            this.pageError = this.vendorDetailFacade.mutationError || 'Unable to reactivate the vendor account right now.';
            this.dialogSubmitting = false;
          },
          complete: () => {
            this.dialogSubmitting = false;
          }
        });
      return;
    }

    if (!this.canSuspendAccount) {
      this.pageError = this.vendorDetailFacade.mutationError
        || (this.isRTL ? 'لا يمكن تعليق الحساب إلا إذا كان نشطًا حاليًا.' : 'The account can only be suspended while it is active.');
      return;
    }

    this.pageError = '';
    this.openDialog('suspend-account');
  }

  toggleLoginLock(): void {
    if (!this.vendor) {
      return;
    }

    if (this.isLoginLocked) {
      this.pageError = '';
      this.dialogSubmitting = true;
      this.vendorDetailFacade.unlockVendorLoginRequest()
        .pipe(take(1))
        .subscribe({
          error: () => {
            this.pageError = this.vendorDetailFacade.mutationError || 'Unable to unlock vendor login right now.';
            this.dialogSubmitting = false;
          },
          complete: () => {
            this.dialogSubmitting = false;
          }
        });
      return;
    }

    this.pageError = '';
    this.openDialog('lock-login');
  }

  onArchiveAccount(): void {
    if (!this.vendor || this.isArchived) {
      return;
    }

    this.pageError = '';
    this.openDialog('archive-account');
  }

  saveOperationsSettings(): void {
    if (!this.vendor || this.operationsSubmitting) {
      return;
    }

    this.pageError = '';
    this.operationsSubmitting = true;
    this.vendorDetailFacade.updateVendorOperationsSettingsRequest({
      acceptOrders: this.acceptOrders,
      minimumOrderAmount: this.minimumOrderAmount,
      preparationTimeMinutes: this.preparationTimeMinutes
    })
      .pipe(take(1))
      .subscribe({
        error: () => {
          this.pageError = this.vendorDetailFacade.mutationError || 'Unable to save vendor operations settings right now.';
          this.operationsSubmitting = false;
        },
        complete: () => {
          this.operationsSubmitting = false;
        }
      });
  }

  saveNotificationSettings(): void {
    if (!this.vendor || this.notificationsSubmitting) {
      return;
    }

    this.pageError = '';
    this.notificationsSubmitting = true;
    this.vendorDetailFacade.updateVendorNotificationSettingsRequest({
      emailNotificationsEnabled: this.emailNotificationsEnabled,
      smsNotificationsEnabled: this.smsNotificationsEnabled,
      newOrdersNotificationsEnabled: this.newOrdersNotificationsEnabled
    })
      .pipe(take(1))
      .subscribe({
        error: () => {
          this.pageError = this.vendorDetailFacade.mutationError || 'Unable to save vendor notification settings right now.';
          this.notificationsSubmitting = false;
        },
        complete: () => {
          this.notificationsSubmitting = false;
        }
      });
  }

  closeDialog(): void {
    if (this.dialogSubmitting) {
      return;
    }

    this.activeDialog = null;
    this.dialogError = '';
    this.dialogPrimaryValue = '';
    this.dialogSecondaryValue = '';
    this.dialogSubmitting = false;
  }

  confirmDialog(): void {
    const primaryValue = this.dialogPrimaryValue.trim();
    const secondaryValue = this.dialogSecondaryValue.trim();

    if (this.activeDialog === 'reset-password') {
      if (!primaryValue) {
        this.dialogError = this.isRTL ? 'أدخل كلمة المرور الجديدة.' : 'Enter the new password.';
        return;
      }

      if (primaryValue.length < 8) {
        this.dialogError = this.isRTL ? 'كلمة المرور يجب ألا تقل عن 8 أحرف.' : 'Password must be at least 8 characters.';
        return;
      }

      if (primaryValue !== secondaryValue) {
        this.dialogError = this.isRTL ? 'تأكيد كلمة المرور غير مطابق.' : 'Password confirmation does not match.';
        return;
      }

      this.dialogSubmitting = true;
      this.resetPasswordQueued = true;
      this.vendorDetailFacade.resetVendorPasswordRequest(primaryValue)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.dialogSubmitting = false;
            this.closeDialog();
          },
          error: () => {
            this.dialogError = this.vendorDetailFacade.mutationError || 'Unable to reset vendor password right now.';
            this.dialogSubmitting = false;
            this.resetPasswordQueued = false;
          },
          complete: () => {
            this.dialogSubmitting = false;
            this.resetPasswordQueued = false;
          }
        });
      return;
    }

    if (!primaryValue) {
      this.dialogError = this.isRTL ? 'هذا الحقل مطلوب.' : 'This field is required.';
      return;
    }

    this.dialogSubmitting = true;

    switch (this.activeDialog) {
      case 'suspend-account':
        this.runDialogAction(
          this.vendorDetailFacade.suspendVendorAccountRequest(primaryValue),
          'Unable to suspend the vendor account right now.'
        );
        break;
      case 'lock-login':
        this.runDialogAction(
          this.vendorDetailFacade.lockVendorLoginRequest(primaryValue),
          'Unable to lock vendor login right now.'
        );
        break;
      case 'archive-account':
        this.runDialogAction(
          this.vendorDetailFacade.archiveVendorAccountRequest(primaryValue),
          'Unable to archive the vendor account right now.'
        );
        break;
      default:
        this.dialogSubmitting = false;
        break;
    }
  }

  private openDialog(dialog: Exclude<VendorSettingsDialog, null>): void {
    this.activeDialog = dialog;
    this.dialogError = '';
    this.dialogPrimaryValue = '';
    this.dialogSecondaryValue = '';
    this.dialogSubmitting = false;
  }

  private runDialogAction(request$: Observable<VendorDetail>, fallbackMessage: string): void {
    request$
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.dialogSubmitting = false;
          this.closeDialog();
        },
        error: () => {
          this.dialogError = this.vendorDetailFacade.mutationError || fallbackMessage;
          this.dialogSubmitting = false;
        },
        complete: () => {
          this.dialogSubmitting = false;
        }
      });
  }
}
