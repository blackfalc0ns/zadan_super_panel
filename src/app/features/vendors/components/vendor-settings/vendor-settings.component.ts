import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Observable, take } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StatusPillComponent, StatusPillVariant } from '../../../../shared/components/ui/status-pill/status-pill.component';
import { ToastService } from '@shared/services/toast.service';
import { VendorDetail } from '@vendors/models/vendors.domain.models';
import { VendorDetailFacade } from '@vendors/services/vendor-detail.facade';
import { AdminVendorStoreAvailabilityState } from '@vendors/services/vendor.api.service';

type VendorSettingsDialog = 'reset-password' | 'suspend-account' | 'lock-login' | 'archive-account' | null;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-vendor-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, StatusPillComponent],
  templateUrl: './vendor-settings.component.html',
  styleUrls: ['./vendor-settings.component.scss']
})
export class VendorSettingsComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  activeDialog: VendorSettingsDialog = null;
  acceptOrders = true;
  currentLang = 'ar';
  dialogError = '';
  dialogPrimaryValue = '';
  dialogSecondaryValue = '';
  dialogSubmitting = false;
  emailNotificationsEnabled = true;
  isRTL = true;
  minimumOrderAmount: number | null = null;
  newOrdersNotificationsEnabled = true;
  notificationsSubmitting = false;
  operationsSubmitting = false;
  storeAvailabilitySubmitting = false;
  pageError = '';
  pageSuccess = '';
  preparationTimeMinutes: number | null = null;
  resetPasswordQueued = false;
  smsNotificationsEnabled = false;
  storeManualMode: 'online' | 'offline' = 'online';
  storeManualReason = '';
  vendor: VendorDetail | null = null;
  commissionRate: number | null = null;
  commissionSubmitting = false;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly translate: TranslateService,
    private readonly vendorDetailFacade: VendorDetailFacade,
    private readonly toastService: ToastService
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.isRTL = this.currentLang === 'ar';

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
      this.cdr.markForCheck();
        this.currentLang = event.lang;
        this.isRTL = event.lang === 'ar';
      });

    this.vendorDetailFacade.vendor$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vendor) => {
      this.cdr.markForCheck();
        this.vendor = vendor;
        this.acceptOrders = vendor?.operationsSettings?.acceptOrders ?? true;
        this.minimumOrderAmount = vendor?.operationsSettings?.minimumOrderAmount ?? null;
        this.preparationTimeMinutes = vendor?.operationsSettings?.preparationTimeMinutes ?? null;
        this.emailNotificationsEnabled = vendor?.notificationSettings?.emailNotificationsEnabled ?? true;
        this.smsNotificationsEnabled = vendor?.notificationSettings?.smsNotificationsEnabled ?? false;
        this.newOrdersNotificationsEnabled = vendor?.notificationSettings?.newOrdersNotificationsEnabled ?? true;
        this.commissionRate = vendor?.commissionRate ?? null;
      });

    this.vendorDetailFacade.storeAvailability$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
      this.cdr.markForCheck();
        this.storeManualMode = state.manualMode;
        this.storeManualReason = state.manualReason ?? '';
      });
  }

  get vendorDisplayName(): string {
    if (!this.vendor) {
      return '';
    }
    return this.vendor.businessNameAr || this.vendor.businessNameEn || this.vendor.ownerName || '';
  }

  get activeNotificationChannelsCount(): number {
    return [
      this.emailNotificationsEnabled,
      this.smsNotificationsEnabled,
      this.newOrdersNotificationsEnabled
    ].filter(Boolean).length;
  }

  get accountStatusLabel(): string {
    if (this.isArchived) {
      return this.text('مؤرشف', 'Archived');
    }

    if (this.isLoginLocked) {
      return this.text('مقفل', 'Locked');
    }

    return this.isAccountSuspended
      ? this.text('معلق', 'Suspended')
      : this.text('نشط', 'Active');
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

  get accountControlHint(): string {
    if (this.isArchived) {
      return this.text('الحساب مؤرشف ولا يقبل إجراءات تشغيل جديدة.', 'The account is archived and no longer accepts operational actions.');
    }

    if (this.isLoginLocked) {
      return this.text('الدخول مقفل. افتح تسجيل الدخول قبل أي تشغيل يومي.', 'Login is locked. Unlock access before daily operations.');
    }

    if (this.isCrExpired) {
      return this.text('السجل التجاري منتهي الصلاحية. يجب تحديث تاريخ السجل أولاً.', 'The Commercial Registration is expired. The CR date must be updated first.');
    }

    if (this.canReactivateAccount) {
      return this.text('الإجراء الصحيح الآن هو إعادة تشغيل الحساب إلى Active.', 'The correct next action is reactivating the account to Active.');
    }

    if (this.canSuspendAccount) {
      return this.text('يمكن تعليق الحساب مؤقتا إذا احتجت لإيقاف التشغيل.', 'You can suspend the account temporarily if operations must pause.');
    }

    return this.text('لا توجد إجراءات حساسة متاحة للحالة الحالية.', 'No sensitive control action is available for the current state.');
  }

  get dialogConfirmLabel(): string {
    switch (this.activeDialog) {
      case 'reset-password':
        return this.text('تحديث كلمة المرور', 'Update password');
      case 'suspend-account':
        return this.text('تعليق الحساب', 'Suspend account');
      case 'lock-login':
        return this.text('قفل الدخول', 'Lock login');
      case 'archive-account':
        return this.text('أرشفة الحساب', 'Archive account');
      default:
        return this.text('حفظ', 'Save');
    }
  }

  get dialogDescription(): string {
    switch (this.activeDialog) {
      case 'reset-password':
        return this.text('أدخل كلمة مرور جديدة للتاجر. سيتم تسجيل العملية في سجل النشاط.', 'Enter a new vendor password. The action will be written to the activity log.');
      case 'suspend-account':
        return this.text('أضف سبب واضح لتعليق الحساب حتى يظهر في السجل التشغيلي.', 'Add a clear suspension reason so it appears in the activity log.');
      case 'lock-login':
        return this.text('أدخل سبب قفل الدخول. سيتم منع التاجر من الدخول حتى يتم فتحه.', 'Enter the lock reason. The vendor will be blocked until login is unlocked.');
      case 'archive-account':
        return this.text('أدخل سبب الأرشفة. سيبقى السجل محفوظا لكن الحساب سيتوقف تشغيليا.', 'Enter the archive reason. The record stays preserved, but the account is operationally stopped.');
      default:
        return '';
    }
  }

  get dialogPrimaryInputType(): 'text' | 'password' {
    return this.activeDialog === 'reset-password' ? 'password' : 'text';
  }

  get dialogPrimaryLabel(): string {
    return this.activeDialog === 'reset-password'
      ? this.text('كلمة المرور الجديدة', 'New password')
      : this.text('السبب', 'Reason');
  }

  get dialogPrimaryPlaceholder(): string {
    if (this.activeDialog === 'reset-password') {
      return this.text('مثال: NewPass@12345', 'Example: NewPass@12345');
    }

    return this.text('اكتب السبب بوضوح', 'Write the reason clearly');
  }

  get dialogSecondaryLabel(): string {
    return this.text('تأكيد كلمة المرور', 'Confirm password');
  }

  get dialogSecondaryPlaceholder(): string {
    return this.text('أعد إدخال كلمة المرور', 'Re-enter the password');
  }

  get dialogTitle(): string {
    switch (this.activeDialog) {
      case 'reset-password':
        return this.text('إعادة تعيين كلمة المرور', 'Reset password');
      case 'suspend-account':
        return this.text('تعليق حساب التاجر', 'Suspend vendor account');
      case 'lock-login':
        return this.text('قفل تسجيل الدخول', 'Lock vendor login');
      case 'archive-account':
        return this.text('أرشفة حساب التاجر', 'Archive vendor account');
      default:
        return '';
    }
  }

  get isAccountSuspended(): boolean {
    return this.vendor?.status === 'Suspended' && !this.isLoginLocked && !this.isArchived;
  }

  get isArchived(): boolean {
    return !!this.vendor?.archivedAtUtc;
  }

  get isDialogOpen(): boolean {
    return this.activeDialog !== null;
  }

  get isLoginLocked(): boolean {
    return !!this.vendor?.isLoginLocked;
  }

  get isCrExpired(): boolean {
    if (!this.vendor?.commercialRegistrationExpiryDate) {
      return false;
    }
    const expiry = new Date(this.vendor.commercialRegistrationExpiryDate);
    expiry.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiry.getTime() < today.getTime();
  }

  get canReactivateAccount(): boolean {
    return !!this.vendor && !this.isCrExpired && !this.isArchived && !this.isLoginLocked && this.vendor.status === 'Suspended';
  }

  get canSuspendAccount(): boolean {
    return !!this.vendor && !this.isArchived && !this.isLoginLocked && this.vendor.status === 'Active';
  }

  get lastUpdatedAtLabel(): string {
    const timestamp = this.vendor?.updatedAtUtc
      || this.vendor?.reviewCompletedAtUtc
      || this.vendor?.reviewStartedAtUtc
      || this.vendor?.approvedAtUtc
      || null;

    return timestamp ? this.formatDateTime(timestamp) : '-';
  }

  get lastUpdatedByLabel(): string {
    return this.vendor?.approvedBy || this.vendor?.assignedReviewer || '-';
  }

  get latestNotePreview(): string {
    const note = this.vendor?.reviewNotes?.[0];
    return note?.message?.trim() || note?.messageKey || this.text('لا توجد ملاحظة تشغيلية حديثة.', 'No recent operational note.');
  }

  get loginActionLabel(): string {
    return this.isLoginLocked
      ? this.text('فتح تسجيل الدخول', 'Unlock login')
      : this.text('قفل تسجيل الدخول', 'Lock login');
  }

  get settingsHealthLabel(): string {
    if (this.isArchived) {
      return this.text('الحساب مؤرشف. راجع السجل قبل أي قرار جديد.', 'The account is archived. Review the audit log before any new decision.');
    }

    if (this.isLoginLocked) {
      return this.text('الحساب مقفل حاليا. إعدادات التشغيل محفوظة لكن الدخول متوقف.', 'The account is locked. Operations settings are preserved, but login is blocked.');
    }

    if (this.isCrExpired) {
      return this.text('الحساب موقوف تلقائيًا بسبب انتهاء السجل التجاري. يرجى مراجعة وتحديث تاريخ انتهاء السجل أولاً.', 'The account is automatically suspended because the Commercial Registration has expired. Please review and update the CR expiry date first.');
    }

    if (this.isAccountSuspended) {
      return this.text('الحساب معلق تشغيليا ويمكن إعادة تشغيله من لوحة الإدارة.', 'The account is operationally suspended and can be reactivated from the control desk.');
    }

    return this.text('كل إعداد في هذه الصفحة مرتبط مباشرة بالباك إند ويحدث بيانات التاجر بعد الحفظ.', 'Every setting on this page is connected to the backend and refreshes vendor data after saving.');
  }

  get storeAvailabilityBadgeLabel(): string {
    return this.isStoreOffline
      ? this.text('أوفلاين في التطبيق', 'Offline in app')
      : this.text('أونلاين في التطبيق', 'Online in app');
  }

  get isStoreOffline(): boolean {
    return this.storeManualMode === 'offline';
  }

  get showDialogSecondaryInput(): boolean {
    return this.activeDialog === 'reset-password';
  }

  get suspensionActionLabel(): string {
    return this.isAccountSuspended
      ? this.text('إعادة تشغيل الحساب', 'Reactivate account')
      : this.text('تعليق الحساب', 'Suspend account');
  }

  get workingHoursLabel(): string {
    const hours = this.vendor?.operatingHours ?? [];
    const openDays = hours.filter((item) => item.isOpen);

    if (!openDays.length) {
      return this.text('لا توجد ساعات محفوظة', 'No saved working hours');
    }

    if (openDays.length === 7) {
      const first = openDays[0];
      const last = openDays[openDays.length - 1];
      return `${first.openTime} - ${last.closeTime}`;
    }

    return this.text(`${openDays.length} أيام مفتوحة`, `${openDays.length} open days`);
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
        this.dialogError = this.text('أدخل كلمة المرور الجديدة.', 'Enter the new password.');
        this.cdr.markForCheck();
        return;
      }

      if (primaryValue.length < 8) {
        this.dialogError = this.text('كلمة المرور يجب ألا تقل عن 8 أحرف.', 'Password must be at least 8 characters.');
        this.cdr.markForCheck();
        return;
      }

      if (primaryValue !== secondaryValue) {
        this.dialogError = this.text('تأكيد كلمة المرور غير مطابق.', 'Password confirmation does not match.');
        this.cdr.markForCheck();
        return;
      }

      this.dialogSubmitting = true;
      this.resetPasswordQueued = true;
      this.vendorDetailFacade.resetVendorPasswordRequest(primaryValue)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.cdr.markForCheck();
            this.setSuccess(this.text('تمت إعادة تعيين كلمة المرور بنجاح.', 'Password reset succeeded.'));
            this.dialogSubmitting = false;
            this.closeDialog();
          },
          error: () => {
            this.cdr.markForCheck();
            this.setDialogError(this.vendorDetailFacade.mutationError || this.text('تعذر تحديث كلمة المرور الآن.', 'Unable to reset vendor password right now.'));
            this.dialogSubmitting = false;
            this.resetPasswordQueued = false;
          },
          complete: () => {
            this.dialogSubmitting = false;
            this.resetPasswordQueued = false;
            this.cdr.markForCheck();
          }
        });
      return;
    }

    if (!primaryValue) {
      this.dialogError = this.text('هذا الحقل مطلوب.', 'This field is required.');
      this.cdr.markForCheck();
      return;
    }

    this.dialogSubmitting = true;

    switch (this.activeDialog) {
      case 'suspend-account':
        this.runDialogAction(
          this.vendorDetailFacade.suspendVendorAccountRequest(primaryValue),
          this.text('تعذر تعليق الحساب الآن.', 'Unable to suspend the vendor account right now.'),
          this.text('تم تعليق الحساب وتسجيل السبب بنجاح.', 'Vendor account suspended and logged successfully.')
        );
        break;
      case 'lock-login':
        this.runDialogAction(
          this.vendorDetailFacade.lockVendorLoginRequest(primaryValue),
          this.text('تعذر قفل تسجيل الدخول الآن.', 'Unable to lock vendor login right now.'),
          this.text('تم قفل تسجيل الدخول وتسجيل السبب بنجاح.', 'Vendor login locked and logged successfully.')
        );
        break;
      case 'archive-account':
        this.runDialogAction(
          this.vendorDetailFacade.archiveVendorAccountRequest(primaryValue),
          this.text('تعذر أرشفة الحساب الآن.', 'Unable to archive the vendor account right now.'),
          this.text('تمت أرشفة الحساب بنجاح.', 'Vendor account archived successfully.')
        );
        break;
      default:
        this.dialogSubmitting = false;
        break;
    }
  }

  onArchiveAccount(): void {
    if (!this.vendor || this.isArchived) {
      return;
    }

    this.clearFeedback();
    this.openDialog('archive-account');
  }

  onResetPassword(): void {
    this.clearFeedback();
    this.openDialog('reset-password');
  }

  saveStoreAvailability(): void {
    if (!this.vendor || this.storeAvailabilitySubmitting) {
      return;
    }

    this.clearFeedback();
    this.storeAvailabilitySubmitting = true;

    const payload: AdminVendorStoreAvailabilityState = {
      manualMode: this.storeManualMode,
      manualReason: this.storeManualMode === 'offline' ? (this.storeManualReason.trim() || null) : null
    };

    this.vendorDetailFacade.updateVendorStoreAvailabilityStateRequest(payload)
      .pipe(take(1))
      .subscribe({
        next: () => this.setSuccess(this.text('تم حفظ حالة ظهور المتجر في التطبيق بنجاح.', 'Store app visibility was saved successfully.')),
        error: () => {
          this.cdr.markForCheck();
          this.setPageError(this.vendorDetailFacade.mutationError || this.text('تعذر حفظ حالة ظهور المتجر الآن.', 'Unable to save store visibility right now.'));
          this.storeAvailabilitySubmitting = false;
        },
        complete: () => {
          this.storeAvailabilitySubmitting = false;
          this.cdr.markForCheck();
        }
      });
  }

  setStoreManualMode(mode: 'online' | 'offline'): void {
    this.storeManualMode = mode;
    if (mode === 'online') {
      this.storeManualReason = '';
    }
  }

  saveNotificationSettings(): void {
    if (!this.vendor || this.notificationsSubmitting) {
      return;
    }

    this.clearFeedback();
    this.notificationsSubmitting = true;
    this.vendorDetailFacade.updateVendorNotificationSettingsRequest({
      emailNotificationsEnabled: this.emailNotificationsEnabled,
      smsNotificationsEnabled: this.smsNotificationsEnabled,
      newOrdersNotificationsEnabled: this.newOrdersNotificationsEnabled
    })
      .pipe(take(1))
      .subscribe({
        next: () => this.setSuccess(this.text('تم حفظ إعدادات الإشعارات بنجاح.', 'Notification settings were saved successfully.')),
        error: () => {
          this.cdr.markForCheck();
          this.setPageError(this.vendorDetailFacade.mutationError || this.text('تعذر حفظ إعدادات الإشعارات الآن.', 'Unable to save vendor notification settings right now.'));
          this.notificationsSubmitting = false;
        },
        complete: () => {
          this.notificationsSubmitting = false;
          this.cdr.markForCheck();
        }
      });
  }

  saveOperationsSettings(): void {
    if (!this.vendor || this.operationsSubmitting) {
      return;
    }

    this.clearFeedback();
    this.operationsSubmitting = true;
    this.vendorDetailFacade.updateVendorOperationsSettingsRequest({
      acceptOrders: this.acceptOrders,
      minimumOrderAmount: this.minimumOrderAmount,
      preparationTimeMinutes: this.preparationTimeMinutes
    })
      .pipe(take(1))
      .subscribe({
        next: () => this.setSuccess(this.text('تم حفظ إعدادات التشغيل بنجاح.', 'Operations settings were saved successfully.')),
        error: () => {
          this.cdr.markForCheck();
          this.setPageError(this.vendorDetailFacade.mutationError || this.text('تعذر حفظ إعدادات التشغيل الآن.', 'Unable to save vendor operations settings right now.'));
          this.operationsSubmitting = false;
        },
        complete: () => {
          this.operationsSubmitting = false;
          this.cdr.markForCheck();
        }
      });
  }

  saveCommissionRate(): void {
    if (!this.vendor || this.commissionSubmitting) {
      return;
    }

    if (this.commissionRate === null || this.commissionRate === undefined || this.commissionRate < 0 || this.commissionRate > 100) {
      this.pageError = this.text(
        'يرجى إدخال نسبة عمولة صالحة بين 0 و 100.',
        'Please enter a valid commission rate between 0 and 100.'
      );
      this.cdr.markForCheck();
      return;
    }

    this.clearFeedback();
    this.commissionSubmitting = true;
    this.vendorDetailFacade.updateVendorCommissionRateRequest(this.commissionRate)
      .pipe(take(1))
      .subscribe({
        next: () => this.setSuccess(this.text('تم حفظ نسبة العمولة بنجاح.', 'Commission rate was saved successfully.')),
        error: () => {
          this.cdr.markForCheck();
          this.setPageError(this.vendorDetailFacade.mutationError || this.text('تعذر حفظ نسبة العمولة الآن.', 'Unable to save commission rate right now.'));
          this.commissionSubmitting = false;
        },
        complete: () => {
          this.commissionSubmitting = false;
          this.cdr.markForCheck();
        }
      });
  }

  toggleLoginLock(): void {
    if (!this.vendor) {
      return;
    }

    if (this.isLoginLocked) {
      this.clearFeedback();
      this.dialogSubmitting = true;
      this.vendorDetailFacade.unlockVendorLoginRequest()
        .pipe(take(1))
        .subscribe({
          next: () => this.setSuccess(this.text('تم فتح تسجيل الدخول بنجاح.', 'Vendor login unlocked successfully.')),
          error: () => {
            this.cdr.markForCheck();
            this.setPageError(this.vendorDetailFacade.mutationError || this.text('تعذر فتح تسجيل الدخول الآن.', 'Unable to unlock vendor login right now.'));
            this.dialogSubmitting = false;
          },
          complete: () => {
            this.dialogSubmitting = false;
            this.cdr.markForCheck();
          }
        });
      return;
    }

    this.clearFeedback();
    this.openDialog('lock-login');
  }

  toggleSuspended(): void {
    if (!this.vendor || this.isArchived || this.isLoginLocked) {
      return;
    }

    if (this.canReactivateAccount) {
      this.clearFeedback();
      this.dialogSubmitting = true;
      this.vendorDetailFacade.reactivateVendorAccountRequest()
        .pipe(take(1))
        .subscribe({
          next: () => this.setSuccess(this.text('تمت إعادة تشغيل الحساب بنجاح.', 'Vendor account reactivated successfully.')),
          error: () => {
            this.cdr.markForCheck();
            this.setPageError(this.vendorDetailFacade.mutationError || this.text('تعذر إعادة تشغيل الحساب الآن.', 'Unable to reactivate the vendor account right now.'));
            this.dialogSubmitting = false;
          },
          complete: () => {
            this.dialogSubmitting = false;
            this.cdr.markForCheck();
          }
        });
      return;
    }

    if (!this.canSuspendAccount) {
      this.pageSuccess = '';
      this.pageError = this.text('لا يمكن تعليق الحساب إلا إذا كان نشطا حاليا.', 'The account can only be suspended while it is active.');
      this.cdr.markForCheck();
      return;
    }

    this.clearFeedback();
    this.openDialog('suspend-account');
  }

  private clearFeedback(): void {
    this.pageError = '';
    this.pageSuccess = '';
    this.cdr.markForCheck();
  }

  private formatDateTime(value: string): string {
    return new Intl.DateTimeFormat(this.currentLang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', { timeZone: 'Asia/Riyadh',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }

  private openDialog(dialog: Exclude<VendorSettingsDialog, null>): void {
    this.activeDialog = dialog;
    this.dialogError = '';
    this.dialogPrimaryValue = '';
    this.dialogSecondaryValue = '';
    this.dialogSubmitting = false;
  }

  private runDialogAction(request$: Observable<VendorDetail>, fallbackMessage: string, successMessage: string): void {
    request$
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.cdr.markForCheck();
          this.setSuccess(successMessage);
          this.dialogSubmitting = false;
          this.closeDialog();
        },
        error: () => {
          this.cdr.markForCheck();
          this.setDialogError(this.vendorDetailFacade.mutationError || fallbackMessage);
          this.dialogSubmitting = false;
        },
        complete: () => {
          this.dialogSubmitting = false;
          this.cdr.markForCheck();
        }
      });
  }

  private setSuccess(message: string): void {
    this.pageError = '';
    this.pageSuccess = message;
    this.toastService.success(message, this.text('إعدادات المورد', 'Vendor settings'));
    this.cdr.markForCheck();
  }

  private setPageError(message: string): void {
    this.pageSuccess = '';
    this.pageError = message;
    this.toastService.error(message, this.text('إعدادات المورد', 'Vendor settings'));
    this.cdr.markForCheck();
  }

  private setDialogError(message: string): void {
    this.dialogError = message;
    this.toastService.error(message, this.text('إعدادات المورد', 'Vendor settings'));
    this.cdr.markForCheck();
  }

  private text(ar: string, en: string): string {
    return this.isRTL ? ar : en;
  }
}
