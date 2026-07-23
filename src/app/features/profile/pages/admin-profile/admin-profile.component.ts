import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService, type AdminUser } from '@core/services/auth.service';
import { AppPageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { StatusPillComponent, type StatusPillVariant } from '@shared/components/ui/status-pill/status-pill.component';
import { AdminNotificationPreferences, AdminNotificationsService } from '@core/services/admin-notifications.service';
import { ADMIN_NOTIFICATION_SOUND_OPTIONS, AdminNotificationSound, AdminNotificationSoundService } from '@core/services/admin-notification-sound.service';
import { AdminOneSignalService } from '@core/services/admin-one-signal.service';
import { describeApiError } from '@shared/utils/api-error.util';
import { ToastService } from '@shared/services/toast.service';
import {
  ADMIN_ROLE_PRESETS,
  DIRECTORY_PANEL_LABELS,
  type DirectoryPanelScope,
  type DirectoryRolePreset
} from '../../../admin-users/public-api';

const API_PANEL_SCOPE_MAP: Record<string, DirectoryPanelScope> = {
  SuperAdminPanel: 'super_admin_panel',
  VendorPanel: 'vendor_panel',
  DriverApp: 'driver_app',
  CustomerApp: 'customer_app'
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, AppPageHeaderComponent, StatusPillComponent],
  template: `
    <div class="h-full flex flex-col bg-slate-50/50 pb-10 overflow-y-auto" [dir]="'SIDEBAR.DIR' | translate">
      <app-page-header
        [title]="'ADMIN_PROFILE.TITLE'"
        [subtitle]="'ADMIN_PROFILE.SUBTITLE'"
        [showBack]="true"
        [backUrl]="'/dashboard'"
        [showToolbar]="true"
        [breadcrumbs]="[
          { label: 'SIDEBAR.HOME', url: '/dashboard' },
          { label: 'ADMIN_PROFILE.BREADCRUMB' }
        ]">
        <span title-prefix class="material-symbols-outlined text-[28px] text-zadna-primary">account_circle</span>

        <div actions class="flex items-center gap-3">
          <button
            type="button"
            (click)="saveProfile()"
            [disabled]="isSavingProfile || profileForm.invalid"
            class="px-6 py-3 bg-gradient-to-br from-zadna-primary to-teal-700 text-white rounded-2xl text-[14px] font-black flex items-center gap-2 shadow-xl shadow-zadna-primary/20 hover:shadow-zadna-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0">
            <span class="material-symbols-outlined text-[20px]">save</span>
            {{ (isSavingProfile ? 'ADMIN_PROFILE.ACTIONS.SAVING' : 'ADMIN_PROFILE.ACTIONS.SAVE') | translate }}
          </button>
        </div>
      </app-page-header>

      <div class="px-4 md:px-10 py-4 max-w-[120rem] mx-auto w-full space-y-6">
        <div *ngIf="isLoading" class="admin-skeleton-detail">
          <div class="admin-skeleton-detail-hero">
            <div class="flex items-center gap-4">
              <span class="admin-skeleton admin-skeleton-avatar" style="width: 5rem; height: 5rem"></span>
              <div class="space-y-3">
                <span class="admin-skeleton admin-skeleton-line lg w-72"></span>
                <span class="admin-skeleton admin-skeleton-line w-96 max-w-full"></span>
              </div>
            </div>
            <span class="admin-skeleton admin-skeleton-chip"></span>
          </div>
          <div class="admin-skeleton-form mt-5">
            <div *ngFor="let item of [1,2,3,4]" class="admin-skeleton-form-field">
              <span class="admin-skeleton admin-skeleton-line sm w-1/3"></span>
              <span class="admin-skeleton admin-skeleton-line lg"></span>
            </div>
          </div>
        </div>

        <ng-container *ngIf="!isLoading && user">
          <section class="rounded-[2rem] border border-slate-200/60 bg-white/75 backdrop-blur-xl p-6 lg:p-8 shadow-[0_10px_40px_-16px_rgba(15,23,42,0.22)] overflow-hidden relative">
            <div class="absolute -top-20 -end-10 h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(18,124,140,0.14),_transparent_70%)] blur-2xl pointer-events-none"></div>
            <div class="absolute -bottom-16 -start-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(228,130,21,0.09),_transparent_70%)] blur-2xl pointer-events-none"></div>

            <div class="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div class="flex items-center gap-5">
                <div class="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-zadna-primary to-teal-700 text-2xl font-black text-white shadow-xl shadow-zadna-primary/20">
                  {{ initials }}
                </div>
                <div>
                  <p class="inline-flex rounded-full bg-zadna-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-zadna-primary">
                    {{ 'ADMIN_PROFILE.BADGE' | translate }}
                  </p>
                  <h1 class="mt-3 text-2xl md:text-3xl font-black tracking-tight text-slate-950">{{ user.fullName }}</h1>
                  <p class="mt-2 text-[14px] font-bold text-slate-500">{{ user.email || ('ADMIN_PROFILE.FALLBACKS.NO_EMAIL' | translate) }}</p>
                  <div class="mt-4 flex flex-wrap items-center gap-2">
                    <app-status-pill [label]="accountStatusLabelKey" [variant]="accountStatusVariant" size="sm"></app-status-pill>
                    <span class="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-black text-slate-600">
                      <ng-container *ngIf="roleLabelKey; else rawRoleName">{{ roleLabelKey | translate }}</ng-container>
                      <ng-template #rawRoleName>{{ rawRoleName }}</ng-template>
                    </span>
                    <span class="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-black text-slate-600">
                      <ng-container *ngIf="hasFullAccess; else permissionCountBadge">
                        {{ 'ADMIN_PROFILE.ACCESS.FULL_ACCESS' | translate }}
                      </ng-container>
                      <ng-template #permissionCountBadge>
                        {{ 'ADMIN_PROFILE.ACCESS.PERMISSION_COUNT' | translate: { count: permissionCount } }}
                      </ng-template>
                    </span>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 sm:min-w-[18rem]">
                <div class="rounded-2xl border border-slate-200/70 bg-white/80 p-4">
                  <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{{ 'ADMIN_PROFILE.STATS.SCOPE' | translate }}</p>
                  <p class="mt-2 text-[13px] font-black text-slate-900">
                    <ng-container *ngIf="activeScope; else globalScopeLabel">
                      <ng-container *ngIf="roleLabelKey; else rawScopeRole">{{ roleLabelKey | translate }}</ng-container>
                      <ng-template #rawScopeRole>{{ rawRoleName }}</ng-template>
                      <span> - </span>
                      <ng-container *ngIf="panelLabelKey; else rawPanelScope">{{ panelLabelKey | translate }}</ng-container>
                      <ng-template #rawPanelScope>{{ activeScope.panelScope }}</ng-template>
                    </ng-container>
                    <ng-template #globalScopeLabel>{{ 'ADMIN_PROFILE.ACCESS.GLOBAL_SCOPE' | translate }}</ng-template>
                  </p>
                </div>
                <div class="rounded-2xl border border-slate-200/70 bg-white/80 p-4">
                  <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{{ 'ADMIN_PROFILE.STATS.PASSWORD' | translate }}</p>
                  <p class="mt-2 text-[13px] font-black" [class.text-amber-600]="user.mustChangePassword" [class.text-emerald-600]="!user.mustChangePassword">
                    {{ user.mustChangePassword ? ('ADMIN_PROFILE.SECURITY.TEMPORARY' | translate) : ('ADMIN_PROFILE.SECURITY.UPDATED' | translate) }}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div *ngIf="user.mustChangePassword" class="rounded-3xl border border-amber-200 bg-amber-50/90 px-5 py-4 text-[13px] font-bold text-amber-800">
            {{ 'ADMIN_PROFILE.SECURITY.MUST_CHANGE_PASSWORD' | translate }}
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <section class="xl:col-span-2 rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-xl p-6 lg:p-8 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)]">
              <div class="mb-8">
                <p class="text-[10px] font-black uppercase tracking-[0.18em] text-zadna-primary bg-zadna-primary/5 inline-flex px-2 py-1 rounded-md mb-2">{{ 'ADMIN_PROFILE.PERSONAL.BADGE' | translate }}</p>
                <h3 class="text-xl font-black text-slate-900">{{ 'ADMIN_PROFILE.PERSONAL.TITLE' | translate }}</h3>
                <p class="text-[13px] font-bold text-slate-400 mt-1">{{ 'ADMIN_PROFILE.PERSONAL.SUBTITLE' | translate }}</p>
              </div>

              <form [formGroup]="profileForm" class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label class="flex flex-col gap-2 md:col-span-2">
                  <span class="text-[11px] font-black tracking-widest uppercase text-slate-500">{{ 'ADMIN_PROFILE.FIELDS.FULL_NAME' | translate }}</span>
                  <input formControlName="fullName" type="text" class="h-12 w-full rounded-2xl border-2 border-slate-200 bg-slate-50/50 px-4 text-[14px] font-bold text-slate-900 text-start focus:border-zadna-primary focus:bg-white focus:ring-4 focus:ring-zadna-primary/10 transition-all outline-none" />
                  <p *ngIf="fieldInvalid('fullName')" class="text-[12px] font-bold text-red-600 text-start">{{ 'ADMIN_PROFILE.ERRORS.FULL_NAME' | translate }}</p>
                </label>

                <label class="flex flex-col gap-2">
                  <span class="text-[11px] font-black tracking-widest uppercase text-slate-500">{{ 'ADMIN_PROFILE.FIELDS.EMAIL' | translate }}</span>
                  <input formControlName="email" type="email" class="h-12 w-full rounded-2xl border-2 border-slate-200 bg-slate-50/50 px-4 text-[14px] font-bold text-slate-900 text-start focus:border-zadna-primary focus:bg-white focus:ring-4 focus:ring-zadna-primary/10 transition-all outline-none" />
                  <p *ngIf="fieldInvalid('email')" class="text-[12px] font-bold text-red-600 text-start">{{ 'ADMIN_PROFILE.ERRORS.EMAIL' | translate }}</p>
                </label>

                <label class="flex flex-col gap-2">
                  <span class="text-[11px] font-black tracking-widest uppercase text-slate-500">{{ 'ADMIN_PROFILE.FIELDS.PHONE' | translate }}</span>
                  <input formControlName="phone" type="text" class="h-12 w-full rounded-2xl border-2 border-slate-200 bg-slate-50/50 px-4 text-[14px] font-bold text-slate-900 text-start focus:border-zadna-primary focus:bg-white focus:ring-4 focus:ring-zadna-primary/10 transition-all outline-none" />
                  <p *ngIf="fieldInvalid('phone')" class="text-[12px] font-bold text-red-600 text-start">{{ 'ADMIN_PROFILE.ERRORS.PHONE' | translate }}</p>
                </label>
              </form>
            </section>

            <section class="rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-xl p-6 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] space-y-4">
              <div>
                <p class="text-[10px] font-black uppercase tracking-[0.18em] text-zadna-primary bg-zadna-primary/5 inline-flex px-2 py-1 rounded-md mb-2">{{ 'ADMIN_PROFILE.ACCESS.BADGE' | translate }}</p>
                <h3 class="text-xl font-black text-slate-900">{{ 'ADMIN_PROFILE.ACCESS.TITLE' | translate }}</h3>
                <p class="text-[13px] font-bold text-slate-400 mt-1">{{ 'ADMIN_PROFILE.ACCESS.SUBTITLE' | translate }}</p>
              </div>

              <div class="space-y-3">
                <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{{ 'ADMIN_PROFILE.ACCESS.ROLE' | translate }}</p>
                  <p class="mt-2 text-[14px] font-black text-slate-900">
                    <ng-container *ngIf="roleLabelKey; else accessRawRole">{{ roleLabelKey | translate }}</ng-container>
                    <ng-template #accessRawRole>{{ rawRoleName }}</ng-template>
                  </p>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{{ 'ADMIN_PROFILE.ACCESS.ACTIVE_SCOPE' | translate }}</p>
                  <p class="mt-2 text-[14px] font-black text-slate-900">
                    <ng-container *ngIf="activeScope; else accessGlobalScope">
                      <ng-container *ngIf="roleLabelKey; else accessScopeRole">{{ roleLabelKey | translate }}</ng-container>
                      <ng-template #accessScopeRole>{{ rawRoleName }}</ng-template>
                      <span> - </span>
                      <ng-container *ngIf="panelLabelKey; else accessRawPanel">{{ panelLabelKey | translate }}</ng-container>
                      <ng-template #accessRawPanel>{{ activeScope.panelScope }}</ng-template>
                    </ng-container>
                    <ng-template #accessGlobalScope>{{ 'ADMIN_PROFILE.ACCESS.GLOBAL_SCOPE' | translate }}</ng-template>
                  </p>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{{ 'ADMIN_PROFILE.ACCESS.PERMISSIONS' | translate }}</p>
                  <p class="mt-2 text-[14px] font-black text-slate-900">
                    <ng-container *ngIf="hasFullAccess; else accessPermissionCount">
                      {{ 'ADMIN_PROFILE.ACCESS.FULL_ACCESS' | translate }}
                    </ng-container>
                    <ng-template #accessPermissionCount>
                      {{ 'ADMIN_PROFILE.ACCESS.PERMISSION_COUNT' | translate: { count: permissionCount } }}
                    </ng-template>
                  </p>
                </div>
              </div>
            </section>
          </div>

          <section class="rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-xl p-6 lg:p-8 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)]">
            <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p class="text-[10px] font-black uppercase tracking-[0.18em] text-zadna-primary bg-zadna-primary/5 inline-flex px-2 py-1 rounded-md mb-2">{{ 'NOTIFICATIONS_CENTER.SOUND.LABEL' | translate }}</p>
                <h3 class="text-xl font-black text-slate-900">{{ 'NOTIFICATIONS_CENTER.SOUND.TITLE' | translate }}</h3>
                <p class="text-[13px] font-bold text-slate-400 mt-1">{{ 'NOTIFICATIONS_CENTER.SOUND.SUBTITLE' | translate }}</p>
              </div>

              <span class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black"
                [ngClass]="hasPersistentSoundPreference ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700'">
                <span class="material-symbols-outlined text-[16px]">{{ hasPersistentSoundPreference ? 'cloud_done' : 'devices' }}</span>
                {{ (hasPersistentSoundPreference ? 'NOTIFICATIONS_CENTER.SOUND.STATUS_DEVICE' : 'NOTIFICATIONS_CENTER.SOUND.STATUS_LOCAL') | translate }}
              </span>
            </div>

            <div *ngIf="isLoadingNotificationPreferences" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <span *ngFor="let item of [1,2,3,4,5]" class="admin-skeleton admin-skeleton-line h-16 rounded-2xl"></span>
            </div>

            <ng-container *ngIf="!isLoadingNotificationPreferences">
              <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <button
                  *ngFor="let option of notificationSoundOptions"
                  type="button"
                  (click)="selectedNotificationSound = option.value"
                  class="rounded-2xl border px-4 py-3 text-start transition"
                  [ngClass]="selectedNotificationSound === option.value
                    ? 'border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/10'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'">
                  <span class="block text-[11px] font-black uppercase tracking-[0.14em]" [ngClass]="selectedNotificationSound === option.value ? 'text-white/70' : 'text-slate-400'">
                    {{ 'NOTIFICATIONS_CENTER.SOUND.LABEL' | translate }}
                  </span>
                  <span class="mt-2 block text-[13px] font-black">{{ option.labelKey | translate }}</span>
                </button>
              </div>

              <p class="mt-4 text-[12px] font-semibold leading-6"
                [ngClass]="hasPersistentSoundPreference ? 'text-slate-500' : 'text-amber-700'">
                {{ (hasPersistentSoundPreference ? 'NOTIFICATIONS_CENTER.SOUND.HINT_DEVICE' : 'NOTIFICATIONS_CENTER.SOUND.HINT_LOCAL') | translate }}
              </p>

              <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  (click)="previewNotificationSound()"
                  class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-[12px] font-black text-slate-700 transition hover:bg-slate-50">
                  <span class="material-symbols-outlined text-[18px]">play_circle</span>
                  {{ 'NOTIFICATIONS_CENTER.SOUND.PREVIEW' | translate }}
                </button>

                <button
                  type="button"
                  (click)="saveNotificationSoundPreference()"
                  [disabled]="isSavingNotificationSound"
                  class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-[12px] font-black text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
                  <span *ngIf="isSavingNotificationSound" class="admin-skeleton admin-skeleton-line sm w-14"></span>
                  <span *ngIf="!isSavingNotificationSound" class="material-symbols-outlined text-[18px]">music_note</span>
                  {{ 'NOTIFICATIONS_CENTER.SOUND.SAVE' | translate }}
                </button>

                <button
                  type="button"
                  (click)="enableBrowserPush()"
                  [disabled]="isEnablingBrowserPush"
                  class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-zadna-primary/20 bg-zadna-primary/5 px-5 text-[12px] font-black text-zadna-primary transition hover:bg-zadna-primary/10 disabled:cursor-not-allowed disabled:opacity-50">
                  <span class="material-symbols-outlined text-[18px]">notifications_active</span>
                  {{ (isEnablingBrowserPush ? 'NOTIFICATIONS_CENTER.WEB_PUSH.ENABLING' : 'NOTIFICATIONS_CENTER.WEB_PUSH.ENABLE') | translate }}
                </button>

                <button
                  type="button"
                  (click)="sendPushTest()"
                  [disabled]="isSendingPushTest"
                  class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-[12px] font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                  <span class="material-symbols-outlined text-[18px]">send</span>
                  {{ (isSendingPushTest ? 'NOTIFICATIONS_CENTER.WEB_PUSH.TESTING' : 'NOTIFICATIONS_CENTER.WEB_PUSH.TEST') | translate }}
                </button>
              </div>
            </ng-container>
          </section>

          <section class="rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-xl p-6 lg:p-8 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)]">
            <div class="mb-8">
              <p class="text-[10px] font-black uppercase tracking-[0.18em] text-zadna-primary bg-zadna-primary/5 inline-flex px-2 py-1 rounded-md mb-2">{{ 'ADMIN_PROFILE.SECURITY.BADGE' | translate }}</p>
              <h3 class="text-xl font-black text-slate-900">{{ 'ADMIN_PROFILE.SECURITY.TITLE' | translate }}</h3>
              <p class="text-[13px] font-bold text-slate-400 mt-1">{{ 'ADMIN_PROFILE.SECURITY.SUBTITLE' | translate }}</p>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
              <form [formGroup]="passwordForm" class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label class="flex flex-col gap-2 md:col-span-2">
                  <span class="text-[11px] font-black tracking-widest uppercase text-slate-500">{{ 'ADMIN_PROFILE.SECURITY.CURRENT_PASSWORD' | translate }}</span>
                  <input formControlName="currentPassword" type="password" autocomplete="current-password" class="h-12 w-full rounded-2xl border-2 border-slate-200 bg-slate-50/50 px-4 text-[14px] font-bold text-slate-900 focus:border-zadna-primary focus:bg-white focus:ring-4 focus:ring-zadna-primary/10 transition-all outline-none" />
                </label>

                <label class="flex flex-col gap-2">
                  <span class="text-[11px] font-black tracking-widest uppercase text-slate-500">{{ 'ADMIN_PROFILE.SECURITY.NEW_PASSWORD' | translate }}</span>
                  <input formControlName="newPassword" type="password" autocomplete="new-password" class="h-12 w-full rounded-2xl border-2 border-slate-200 bg-slate-50/50 px-4 text-[14px] font-bold text-slate-900 focus:border-zadna-primary focus:bg-white focus:ring-4 focus:ring-zadna-primary/10 transition-all outline-none" />
                </label>

                <label class="flex flex-col gap-2">
                  <span class="text-[11px] font-black tracking-widest uppercase text-slate-500">{{ 'ADMIN_PROFILE.SECURITY.CONFIRM_PASSWORD' | translate }}</span>
                  <input formControlName="confirmPassword" type="password" autocomplete="new-password" class="h-12 w-full rounded-2xl border-2 border-slate-200 bg-slate-50/50 px-4 text-[14px] font-bold text-slate-900 focus:border-zadna-primary focus:bg-white focus:ring-4 focus:ring-zadna-primary/10 transition-all outline-none" />
                </label>

                <div class="md:col-span-2 flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    (click)="changePassword()"
                    [disabled]="isChangingPassword || passwordForm.invalid"
                    class="px-5 py-3 rounded-2xl bg-slate-950 text-white text-[13px] font-black hover:bg-slate-800 transition disabled:opacity-50">
                    {{ isChangingPassword ? ('ADMIN_PROFILE.SECURITY.SAVING_PASSWORD' | translate) : ('ADMIN_PROFILE.SECURITY.CHANGE_PASSWORD' | translate) }}
                  </button>
                  <p class="text-[12px] font-bold text-slate-400">{{ 'ADMIN_PROFILE.SECURITY.PASSWORD_HINT' | translate }}</p>
                </div>
              </form>

              <div class="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5 space-y-4">
                <div>
                  <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{{ 'ADMIN_PROFILE.SECURITY.STATUS' | translate }}</p>
                  <p class="mt-2 text-[14px] font-black text-slate-900">{{ user.mustChangePassword ? ('ADMIN_PROFILE.SECURITY.TEMPORARY' | translate) : ('ADMIN_PROFILE.SECURITY.UPDATED' | translate) }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{{ 'ADMIN_PROFILE.SECURITY.ACCESS_VERSION' | translate }}</p>
                  <p class="mt-2 text-[14px] font-black text-slate-900">{{ user.access?.permissionVersion ?? ('ADMIN_PROFILE.FALLBACKS.NOT_AVAILABLE' | translate) }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{{ 'ADMIN_PROFILE.SECURITY.GUIDANCE' | translate }}</p>
                  <p class="mt-2 text-[13px] font-bold leading-6 text-slate-500">{{ 'ADMIN_PROFILE.SECURITY.GUIDANCE_TEXT' | translate }}</p>
                </div>
              </div>
            </div>
          </section>
        </ng-container>
      </div>
    </div>
  `
})
export class AdminProfileComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  user: AdminUser | null = null;
  isLoading = true;
  isSavingProfile = false;
  isChangingPassword = false;
  readonly notificationSoundOptions = [...ADMIN_NOTIFICATION_SOUND_OPTIONS];
  selectedNotificationSound: AdminNotificationSound = 'classic';
  isLoadingNotificationPreferences = true;
  isSavingNotificationSound = false;
  isEnablingBrowserPush = false;
  isSendingPushTest = false;
  readonly profileForm;
  readonly passwordForm;
  private notificationPreferences: AdminNotificationPreferences | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly translate: TranslateService,
    private readonly notificationsService: AdminNotificationsService,
    private readonly notificationSoundService: AdminNotificationSoundService,
    private readonly adminOneSignalService: AdminOneSignalService,
    private readonly toastService: ToastService
  ) {
    this.selectedNotificationSound = this.notificationSoundService.getCurrentSound();

    this.profileForm = this.fb.nonNullable.group({
      fullName: ['', [Validators.required, Validators.maxLength(200)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
      phone: ['', [Validators.required, Validators.maxLength(20)]]
    });

    this.passwordForm = this.fb.nonNullable.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cdr.markForCheck());

    this.loadProfile();
    this.loadNotificationPreferences();
  }

  get initials(): string {
    const source = this.user?.fullName?.trim() ?? '';
    if (!source) {
      return 'AD';
    }

    const parts = source.split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  get activeScope() {
    return this.user?.access?.activeScope ?? null;
  }

  get roleLabelKey(): string | null {
    return resolveRoleLabelKey(this.user);
  }

  get panelLabelKey(): string | null {
    const scope = this.activeScope;
    return scope ? resolvePanelLabelKey(scope.panelScope) : null;
  }

  get rawRoleName(): string {
    return this.user?.access?.activeScope?.roleName || this.user?.role || '-';
  }

  get hasFullAccess(): boolean {
    return (this.user?.access?.permissions ?? []).includes('*');
  }

  get permissionCount(): number {
    return this.user?.access?.permissions?.length ?? 0;
  }

  get accountStatusVariant(): StatusPillVariant {
    return this.user?.mustChangePassword ? 'warning' : 'success';
  }

  get accountStatusLabelKey(): string {
    return this.user?.mustChangePassword
      ? 'ADMIN_PROFILE.STATUS.ACTION_REQUIRED'
      : 'ADMIN_PROFILE.STATUS.ACTIVE';
  }

  get hasPersistentSoundPreference(): boolean {
    return (this.notificationPreferences?.webDeviceCount ?? 0) > 0;
  }

  fieldInvalid(fieldName: 'fullName' | 'email' | 'phone'): boolean {
    const control = this.profileForm.controls[fieldName];
    return control.invalid && (control.dirty || control.touched);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSavingProfile = true;
    this.authService.updateCurrentUserProfile(this.profileForm.getRawValue()).subscribe({
      next: (user) => {
        this.cdr.markForCheck();
        this.user = user;
        this.profileForm.patchValue({
          fullName: user.fullName ?? '',
          email: user.email ?? '',
          phone: user.phone ?? ''
        });
        this.isSavingProfile = false;
        this.notify(this.text('ADMIN_PROFILE.MESSAGES.PROFILE_UPDATED'), 'success');
      },
      error: (err) => {
        this.cdr.markForCheck();
        this.isSavingProfile = false;
        this.notify(this.resolveProfileErrorMessage(err), 'error');
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const value = this.passwordForm.getRawValue();
    if (value.newPassword !== value.confirmPassword) {
      this.notify(this.text('ADMIN_PROFILE.MESSAGES.PASSWORD_MISMATCH'), 'error');
      return;
    }

    this.isChangingPassword = true;
    this.authService.changePassword({
      currentPassword: value.currentPassword,
      newPassword: value.newPassword
    }).subscribe({
      next: () => {
        this.cdr.markForCheck();
        this.isChangingPassword = false;
        this.notify(this.text('ADMIN_PROFILE.MESSAGES.PASSWORD_UPDATED'), 'success');
        this.passwordForm.reset({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      },
      error: (err) => {
        this.cdr.markForCheck();
        this.isChangingPassword = false;
        this.notify(this.resolvePasswordErrorMessage(err), 'error');
      }
    });
  }

  previewNotificationSound(): void {
    this.notificationSoundService.preview(this.selectedNotificationSound);
  }

  async enableBrowserPush(): Promise<void> {
    this.isEnablingBrowserPush = true;
    const toastTitle = this.text('NOTIFICATIONS_CENTER.SOUND.TITLE');

    if (!this.adminOneSignalService.isBrowserPushSupported()) {
      this.isEnablingBrowserPush = false;
      this.toastService.error(this.text('NOTIFICATIONS_CENTER.WEB_PUSH.UNSUPPORTED'), toastTitle);
      this.cdr.markForCheck();
      return;
    }

    const permission = await this.adminOneSignalService.requestBrowserPermission();
    if (permission === 'unsupported') {
      this.isEnablingBrowserPush = false;
      this.toastService.error(this.text('NOTIFICATIONS_CENTER.WEB_PUSH.UNSUPPORTED'), toastTitle);
      this.cdr.markForCheck();
      return;
    }

    if (permission === 'denied') {
      this.isEnablingBrowserPush = false;
      this.toastService.error(this.text('NOTIFICATIONS_CENTER.WEB_PUSH.DENIED'), toastTitle);
      this.cdr.markForCheck();
      return;
    }

    const registered = await this.adminOneSignalService.requestPermissionAndRegister();
    this.isEnablingBrowserPush = false;
    this.loadNotificationPreferences();

    if (registered) {
      this.toastService.success(this.text('NOTIFICATIONS_CENTER.WEB_PUSH.ENABLED'), toastTitle);
    } else if (permission === 'granted' || this.adminOneSignalService.getBrowserPermission() === 'granted') {
      this.toastService.success(this.text('NOTIFICATIONS_CENTER.WEB_PUSH.PERMISSION_GRANTED'), toastTitle);
    } else {
      this.toastService.error(this.text('NOTIFICATIONS_CENTER.WEB_PUSH.ENABLE_FAILED'), toastTitle);
    }

    this.cdr.markForCheck();
  }

  async sendPushTest(): Promise<void> {
    this.isSendingPushTest = true;
    const toastTitle = this.text('NOTIFICATIONS_CENTER.SOUND.TITLE');

    if (this.adminOneSignalService.isBrowserPushSupported()) {
      const permission = await this.adminOneSignalService.requestBrowserPermission();
      if (permission === 'denied') {
        this.isSendingPushTest = false;
        this.toastService.error(this.text('NOTIFICATIONS_CENTER.WEB_PUSH.DENIED'), toastTitle);
        this.cdr.markForCheck();
        return;
      }
    }

    const registrationPromise = this.adminOneSignalService.isConfigured()
      ? this.adminOneSignalService.requestPermissionAndRegister()
      : Promise.resolve(false);

    this.notificationsService.sendTestNotification().subscribe({
      next: () => {
        void registrationPromise.then((registered) => {
          this.adminOneSignalService.showLocalTestNotification(
            this.text('NOTIFICATIONS_CENTER.WEB_PUSH.TEST_TITLE'),
            this.text('NOTIFICATIONS_CENTER.WEB_PUSH.TEST_BODY')
          );

          this.isSendingPushTest = false;
          this.toastService.success(
            registered
              ? this.text('NOTIFICATIONS_CENTER.WEB_PUSH.TEST_SENT')
              : this.text('NOTIFICATIONS_CENTER.WEB_PUSH.TEST_SENT_PARTIAL'),
            toastTitle
          );
          this.notificationsService.refreshRecent().subscribe();
          this.loadNotificationPreferences();
          this.cdr.markForCheck();
        });
      },
      error: () => {
        void registrationPromise.finally(() => {
          this.isSendingPushTest = false;
          this.toastService.error(this.text('NOTIFICATIONS_CENTER.WEB_PUSH.TEST_FAILED'), toastTitle);
          this.cdr.markForCheck();
        });
      }
    });
  }

  saveNotificationSoundPreference(): void {
    this.notificationSoundService.setSound(this.selectedNotificationSound);
    const toastTitle = this.text('NOTIFICATIONS_CENTER.SOUND.TITLE');

    if (!this.notificationPreferences || this.notificationsService.requiresApiSession) {
      this.toastService.success(this.text('ADMIN_PROFILE.MESSAGES.NOTIFICATION_SOUND_SAVED_LOCAL'), toastTitle);
      return;
    }

    this.isSavingNotificationSound = true;
    this.notificationsService.updatePreferences({
      ...this.notificationPreferences,
      sound: this.selectedNotificationSound
    }).subscribe({
      next: (preferences) => {
        this.cdr.markForCheck();
        this.notificationPreferences = preferences;
        if (preferences.webDeviceCount > 0) {
          this.selectedNotificationSound = preferences.sound;
          this.notificationSoundService.setSound(preferences.sound);
        }

        this.isSavingNotificationSound = false;
        this.toastService.success(this.text('ADMIN_PROFILE.MESSAGES.NOTIFICATION_SOUND_SAVED'), toastTitle);
      },
      error: () => {
        this.cdr.markForCheck();
        this.isSavingNotificationSound = false;
        this.toastService.error(this.text('ADMIN_PROFILE.MESSAGES.NOTIFICATION_SOUND_SAVE_FAILED'), toastTitle);
      }
    });
  }

  private loadProfile(): void {
    const fallbackUser = this.authService.currentUserValue;
    if (fallbackUser) {
      this.setUser(fallbackUser);
    }

    this.authService.refreshAccess().subscribe({
      next: (user) => {
        this.cdr.markForCheck();
        this.setUser(user ?? fallbackUser);
        this.isLoading = false;
      },
      error: () => {
        this.cdr.markForCheck();
        this.setUser(fallbackUser);
        this.isLoading = false;
      }
    });
  }

  private loadNotificationPreferences(): void {
    this.isLoadingNotificationPreferences = true;
    this.notificationsService.getPreferences().subscribe({
      next: (preferences) => {
        this.cdr.markForCheck();
        this.notificationPreferences = preferences;
        if (preferences.webDeviceCount > 0) {
          this.selectedNotificationSound = preferences.sound;
          this.notificationSoundService.setSound(preferences.sound);
        } else {
          this.selectedNotificationSound = this.notificationSoundService.getCurrentSound();
        }
        this.isLoadingNotificationPreferences = false;
      },
      error: () => {
        this.cdr.markForCheck();
        this.selectedNotificationSound = this.notificationSoundService.getCurrentSound();
        this.isLoadingNotificationPreferences = false;
      }
    });
  }

  private setUser(user: AdminUser | null): void {
    this.user = user;
    this.profileForm.patchValue({
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? ''
    });
  }

  private text(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }

  private notify(message: string, type: 'success' | 'error', titleKey = 'ADMIN_PROFILE.TITLE'): void {
    const title = this.text(titleKey);
    if (type === 'success') {
      this.toastService.success(message, title);
      return;
    }

    this.toastService.error(message, title);
  }

  private resolveProfileErrorMessage(err: unknown): string {
    return describeApiError(err, this.translate, {
      fallbackKey: 'ADMIN_PROFILE.MESSAGES.PROFILE_UPDATE_FAILED',
      codePrefix: 'ADMIN_PROFILE.ERROR_CODES'
    });
  }

  private resolvePasswordErrorMessage(err: unknown): string {
    return describeApiError(err, this.translate, {
      fallbackKey: 'ADMIN_PROFILE.MESSAGES.PASSWORD_UPDATE_FAILED',
      codePrefix: 'ADMIN_PROFILE.ERROR_CODES'
    });
  }
}

function resolvePanelLabelKey(panelScope: string): string | null {
  const normalized = API_PANEL_SCOPE_MAP[panelScope];
  if (normalized) {
    return DIRECTORY_PANEL_LABELS[normalized];
  }

  const snake = panelScope
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/-/g, '_')
    .toLowerCase() as DirectoryPanelScope;

  return DIRECTORY_PANEL_LABELS[snake] ?? null;
}

function resolveRoleLabelKey(user: AdminUser | null): string | null {
  if (!user) {
    return null;
  }

  const roleCode = (user.access?.activeScope?.roleCode ?? user.role ?? '').toLowerCase();
  const preset = ADMIN_ROLE_PRESETS.find((entry: DirectoryRolePreset) =>
    roleCode === entry.id
    || roleCode.startsWith(`${entry.id}_`)
    || roleCode.includes(entry.id));

  if (preset) {
    return preset.nameKey;
  }

  if (roleCode.includes('super_admin') || user.role === 'SuperAdmin') {
    return 'ADMIN_USERS.PRESETS.SUPER_ADMIN.NAME';
  }

  return null;
}
