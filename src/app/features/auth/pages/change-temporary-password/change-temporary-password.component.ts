import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';

const SAFE_RETURN_URL = /^\/(?!\/)([\w\-./?=&%#]+)?$/;

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-change-temporary-password',
 standalone: true,
 imports: [CommonModule, ReactiveFormsModule, TranslateModule],
 template: `
 <div
 class="min-h-screen py-24 lg:py-12 relative font-sans flex items-center justify-center bg-zadna-bgLight overflow-hidden selection:bg-zadna-primary selection:text-white">

 <!-- ================= BACKGROUND ARTEFACTS & GRAND FEEL ================= -->
 <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
 <div class="absolute inset-0 bg-gradient-to-br from-zadna-primaryLight/8 via-transparent to-zadna-accentLight/6"></div>
 
 <div class="absolute top-0 right-0 w-[50vw] h-[50vw] opacity-40"
 style="background: radial-gradient(circle at center, rgba(18, 124, 140, 0.15) 0%, transparent 70%);">
 </div>
 
 <div class="absolute bottom-0 left-0 w-[45vw] h-[45vw] opacity-30"
 style="background: radial-gradient(circle at center, rgba(245, 158, 11, 0.12) 0%, transparent 70%);">
 </div>

 <div
 class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTU5LjUgMGguNXY2MGgtLjV6TTBvNTloNjB2LjVIMHoiIGZpbGw9IiNlN2U1ZTRcIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-60">
 </div>
 </div>

 <!-- ================= TOP NAVIGATION ================= -->
 <div class="absolute top-6 sm:top-8 end-6 sm:end-12 xl:end-16 z-50 flex items-center animate-puzzle-down stagger-1">
 <div class="flex items-center bg-white/60 backdrop-blur-2xl border border-white/80 p-1.5 rounded-full shadow-[0_12px_24px_rgba(18,124,140,0.15)] dir-ltr"
 style="direction: ltr;">
 <button (click)="switchLanguage('en')"
 [ngClass]="{'bg-white text-zadna-primaryDark shadow-lg scale-105': translate.currentLang === 'en', 'text-gray-500 hover:text-zadna-primary hover:bg-white/40': translate.currentLang!== 'en'}"
 class="px-6 py-2.5 rounded-full text-sm font-black tracking-widest uppercase transition-all duration-300">
 EN
 </button>
 <button (click)="switchLanguage('ar')"
 [ngClass]="{'bg-white text-zadna-primaryDark shadow-lg scale-105': translate.currentLang === 'ar', 'text-gray-500 hover:text-zadna-primary hover:bg-white/40': translate.currentLang!== 'ar'}"
 class="px-6 py-2.5 rounded-full text-sm font-black tracking-widest uppercase transition-all duration-300">
 AR</button>
 </div>
 </div>

 <!-- ================= MAIN CONTAINER ================= -->
 <div
 class="relative z-10 w-full max-w-[1700px] mx-auto px-6 md:px-12 xl:px-20 flex flex-col xl:flex-row-reverse items-center justify-center xl:justify-between gap-16 xl:gap-24">

 <!-- ================= LEFT: EPIC MARKETPLACE VISION ================= -->
 <div
 class="hidden xl:flex w-full xl:w-[55%] flex-col justify-center xl:pr-10 rtl:xl:pl-10 rtl:xl:pr-0 animate-puzzle-left stagger-2">

 <div
 class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 border border-white/80 shadow-[0_4px_12px_rgba(18,124,140,0.08)] backdrop-blur-md w-max mb-10 transform hover:scale-105 transition-transform cursor-default animate-puzzle-up stagger-3">
 <span class="relative flex h-3 w-3">
 <span
 class="animate-ping absolute inline-flex h-full w-full rounded-full bg-zadna-accent opacity-75"></span>
 <span class="relative inline-flex rounded-full h-3 w-3 bg-zadna-accent"></span>
 </span>
 <span class="text-xs font-black tracking-widest text-zadna-primaryDark uppercase">{{
                        'LOGIN.ADMIN_PORTAL' | translate }}</span>
 </div>

 <h1
 class="text-[2rem] md:text-[2.5rem] lg:text-[2.75rem] xl:text-[3rem] font-black text-zadna-bgDark leading-[1.2] tracking-tight mb-6 animate-puzzle-up stagger-4">
 <div class="mb-2 md:mb-3">Security First</div>
 <span class="relative inline-block mt-2 md:mt-3">
 <span
 class="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-zadna-primary to-zadna-primaryLight">Protect Your Account</span>
 <svg class="absolute w-full h-3 md:h-4 -bottom-1 left-0 z-0 text-zadna-accent/20"
 viewBox="0 0 100 20" preserveAspectRatio="none">
 <path d="M0 10 Q 50 20 100 10" stroke="currentColor" stroke-width="8" fill="none"
 stroke-linecap="round" />
 </svg>
 </span>
 </h1>

 <p
 class="text-base text-gray-500 font-medium leading-relaxed max-w-2xl mb-8 opacity-90 tracking-wide animate-puzzle-up stagger-5">
 For your security, you must set a new, permanent password for this account before you can continue to the administration dashboard.
 </p>

 </div>

 <!-- ================= RIGHT: THE FORM ================= -->
 <div
 class="w-full max-w-[560px] xl:w-[45%] shrink-0 relative flex justify-center xl:justify-end animate-puzzle-right stagger-2">
 <div class="w-full max-w-[560px] relative">

 <div class="absolute -top-10 -right-10 w-40 h-40 bg-zadna-accent/10 rounded-full blur-xl opacity-60"></div>
 <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-zadna-primary/10 rounded-full blur-xl opacity-60"></div>

 <div
 class="bg-white/80 backdrop-blur-2xl border border-white rounded-[1.5rem] p-6 md:p-8 shadow-[0_30px_60px_-15px_rgba(18,124,140,0.15)] relative overflow-hidden">

 <div
 class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zadna-primary via-zadna-accent to-zadna-primary">
 </div>

 <div class="flex flex-col items-center mb-8 text-center animate-puzzle-scale-rotate stagger-4">
 <div class="w-full h-20 relative flex items-center justify-center group cursor-default">
 <div
 class="absolute inset-0 bg-zadna-primary/10 rounded-full blur-2xl scale-75 group-hover:scale-110 transition-transform duration-700">
 </div>
 <img src="assets/images/شعار 2-20260305T104717Z-3-001/شعار 2/شفاف (1).png" alt="Zadna Logo"
 class="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(18,124,140,0.2)] z-10 transition-transform duration-500 hover:scale-110"
 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
 </div>
 <h2 class="text-2xl font-black text-gray-900 tracking-tight mt-4 animate-puzzle-up stagger-5">
 Change Temporary Password
 </h2>
 </div>

 <div *ngIf="errorMessage"
 class="rounded-2xl bg-red-50/40 backdrop-blur-md border border-red-100/50 p-5 mb-10 flex items-center gap-4 shadow-[0_10px_20px_-10px_rgba(239,68,68,0.2)] animate-puzzle-up">
 <div
 class="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
 <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z">
 </path>
 </svg>
 </div>
 <p class="text-[13px] font-bold text-red-900 leading-relaxed">{{ errorMessage }}</p>
 </div>

 <form class="space-y-5" [formGroup]="form" (ngSubmit)="submit()">

 <!-- Current Password -->
 <div class="space-y-2 animate-puzzle-up stagger-6">
 <div class="flex items-center justify-between mx-1">
 <label class="text-xs font-black text-gray-400 uppercase tracking-widest">
 Current Temporary Password
 </label>
 </div>
 <div class="relative group">
 <div [ngClass]="translate.currentLang === 'ar' ? 'right-0 pr-4' : 'left-0 pl-4'"
 class="absolute inset-y-0 flex items-center pointer-events-none text-gray-300 group-focus-within:text-zadna-primary transition-colors">
 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
 d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
 </svg>
 </div>
 <input formControlName="currentPassword" [type]="showPasswords ? 'text' : 'password'" autocomplete="current-password" required
 [ngClass]="[
 translate.currentLang === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4',
 (form.get('currentPassword')?.touched || submitted) && form.get('currentPassword')?.invalid ? 'border-red-400 bg-red-50/20' : 'border-transparent'
 ]"
 class="block w-full py-3 bg-gray-50/50 border-2 focus:border-zadna-primary/30 focus:bg-white text-gray-900 rounded-xl placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-zadna-primary/10 transition-all font-bold text-base shadow-sm hover:shadow-md">
 </div>
 </div>

 <!-- New Password -->
 <div class="space-y-2 animate-puzzle-up stagger-7">
 <div class="flex items-center justify-between mx-1">
 <label class="text-xs font-black text-gray-400 uppercase tracking-widest">
 New Password
 </label>
 </div>
 <div class="relative group">
 <div [ngClass]="translate.currentLang === 'ar' ? 'right-0 pr-4' : 'left-0 pl-4'"
 class="absolute inset-y-0 flex items-center pointer-events-none text-gray-300 group-focus-within:text-zadna-primary transition-colors">
 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
 d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
 </svg>
 </div>
 <input formControlName="newPassword" [type]="showPasswords ? 'text' : 'password'" autocomplete="new-password" required
 [ngClass]="[
 translate.currentLang === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4',
 (form.get('newPassword')?.touched || submitted) && form.get('newPassword')?.invalid ? 'border-red-400 bg-red-50/20' : 'border-transparent'
 ]"
 class="block w-full py-3 bg-gray-50/50 border-2 focus:border-zadna-primary/30 focus:bg-white text-gray-900 rounded-xl placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-zadna-primary/10 transition-all font-bold text-base shadow-sm hover:shadow-md">
 </div>
 </div>

 <!-- Confirm Password -->
 <div class="space-y-2 animate-puzzle-up stagger-8">
 <div class="flex items-center justify-between mx-1">
 <label class="text-xs font-black text-gray-400 uppercase tracking-widest">
 Confirm Password
 </label>
 </div>
 <div class="relative group">
 <div [ngClass]="translate.currentLang === 'ar' ? 'right-0 pr-4' : 'left-0 pl-4'"
 class="absolute inset-y-0 flex items-center pointer-events-none text-gray-300 group-focus-within:text-zadna-primary transition-colors">
 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
 d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
 </svg>
 </div>
 <input formControlName="confirmPassword" [type]="showPasswords ? 'text' : 'password'" autocomplete="new-password" required
 [ngClass]="[
 translate.currentLang === 'ar' ? 'pr-11 pl-11' : 'pl-11 pr-11',
 (form.get('confirmPassword')?.touched || submitted) && form.get('confirmPassword')?.invalid ? 'border-red-400 bg-red-50/20' : 'border-transparent'
 ]"
 class="block w-full py-3 bg-gray-50/50 border-2 focus:border-zadna-primary/30 focus:bg-white text-gray-900 rounded-xl placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-zadna-primary/10 transition-all font-bold text-base shadow-sm hover:shadow-md">
 
 <button type="button" (click)="togglePasswords()"
 [ngClass]="translate.currentLang === 'ar' ? 'left-0 pl-4' : 'right-0 pr-4'"
 class="absolute inset-y-0 flex items-center text-gray-300 hover:text-zadna-primary transition-colors focus:outline-none cursor-pointer">
 <svg *ngIf="!showPasswords" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
 </svg>
 <svg *ngIf="showPasswords" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
 </svg>
 </button>
 </div>
 </div>

 <!-- Submit Button -->
 <div class="pt-4 animate-puzzle-up stagger-9">
 <button type="submit" [disabled]="isLoading"
 class="group relative w-full flex justify-center items-center py-3 px-4 overflow-hidden rounded-xl shadow-[0_8px_20px_rgba(18,124,140,0.3)] font-black text-white bg-zadna-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-[0.98]">

 <div class="absolute inset-0 bg-gradient-to-r from-zadna-primaryDark via-zadna-primary to-zadna-primaryDark opacity-0 group-hover:opacity-100 transition-opacity duration-500">
 </div>

 <span *ngIf="isLoading" class="relative z-10 block h-3 w-28 overflow-hidden rounded-full bg-white/25">
 <span class="admin-skeleton-button-placeholder"></span>
 </span>

 <span *ngIf="!isLoading" class="flex items-center relative z-10 tracking-widest uppercase">
 Save New Password
 <svg [ngClass]="translate.currentLang === 'ar' ? 'mr-3 group-hover:-translate-x-2' : 'ml-3 group-hover:translate-x-2'"
 class="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path *ngIf="translate.currentLang!== 'ar'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
 <path *ngIf="translate.currentLang === 'ar'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
 </svg>
 </span>
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 </div>
 </div>
 `
})
export class ChangeTemporaryPasswordComponent {
 private readonly cdr = inject(ChangeDetectorRef);
 public translate = inject(TranslateService);
 
 isLoading = false;
 errorMessage = '';
 readonly form: FormGroup;
 private readonly returnUrl: string;
 showPasswords = false;
 submitted = false;

 constructor(
 private readonly fb: FormBuilder,
 private readonly route: ActivatedRoute,
 private readonly router: Router,
 private readonly authService: AuthService
 ) {
 const candidate = this.route.snapshot.queryParams['returnUrl'];
 this.returnUrl = this.sanitizeReturnUrl(candidate) ?? '/dashboard';
 
 this.form = this.fb.group({
 currentPassword: ['', Validators.required],
 newPassword: ['', [Validators.required, Validators.minLength(8)]],
 confirmPassword: ['', Validators.required]
 });
 }

 submit(): void {
 this.submitted = true;
 if (this.form.invalid) {
 return;
 }

 const value = this.form.getRawValue();
 if (value.newPassword!== value.confirmPassword) {
 this.errorMessage = 'New password and confirmation do not match.';
 return;
 }

 this.isLoading = true;
 this.errorMessage = '';
 this.authService.changeTemporaryPassword(value.currentPassword ?? '', value.newPassword ?? '').subscribe({
 next: () => this.router.navigateByUrl(this.returnUrl),
 error: (err) => {
 this.cdr.markForCheck();
 this.isLoading = false;
 this.errorMessage = err.error?.message || 'Could not change password. Check the current password and try again.';
 }
 });
 }

 togglePasswords() {
 this.showPasswords =!this.showPasswords;
 }

 switchLanguage(lang: string) {
 this.translate.use(lang);
 }

 private sanitizeReturnUrl(value: unknown): string | null {
 if (typeof value!== 'string') return null;
 const trimmed = value.trim();
 if (!trimmed ||!trimmed.startsWith('/')) return null;
 if (trimmed.startsWith('//') || trimmed.startsWith('/\\')) return null;
 // Just extract the base path to avoid infinitely compounding query strings
 const withoutQuery = trimmed.split('?')[0];
 if (!SAFE_RETURN_URL.test(withoutQuery)) return null;
 return withoutQuery;
 }
}
