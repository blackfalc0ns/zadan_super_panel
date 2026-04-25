import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { VendorService } from '@vendors/services/vendor.api.service';

type WorkspaceFeatureId = 'offers' | 'staff' | 'support';

interface WorkspaceFeature {
  id: WorkspaceFeatureId;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  icon: string;
  tone: string;
  data: unknown;
  draft: string;
  isSaving: boolean;
  error: string;
  savedAt?: string;
}

@Component({
  selector: 'app-vendor-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="mx-auto flex w-full max-w-[1500px] flex-col gap-3 px-3 py-3" dir="rtl">
      <div class="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-[11px] font-black text-[#127c8c]">ربط Admin Panel مع Vendor Panel</p>
            <h2 class="mt-1 text-2xl font-black tracking-tight text-slate-950">تشغيل التاجر الموحد</h2>
            <p class="mt-1 text-[12px] font-bold text-slate-500">
              هذه النافذة تعرض نفس بيانات Vendor Panel التشغيلية، وأي حفظ هنا ينعكس على التاجر من نفس الـ API.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-700">
              Server-backed
            </span>
            <button
              type="button"
              (click)="loadWorkspace()"
              class="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-black text-slate-700 transition hover:bg-white">
              تحديث البيانات
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="isLoading" class="rounded-[24px] border border-slate-200 bg-white p-8 text-center text-sm font-black text-slate-500">
        جاري تحميل بيانات التشغيل من الباك...
      </div>

      <div *ngIf="!isLoading" class="grid gap-3 xl:grid-cols-[0.9fr_1.4fr]">
        <aside class="rounded-[26px] border border-slate-200 bg-white p-3 shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-black text-slate-950">نوافذ التشغيل</h3>
            <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">{{ features.length }} modules</span>
          </div>

          <div class="space-y-2">
            <button
              *ngFor="let feature of features"
              type="button"
              (click)="selectFeature(feature.id)"
              class="w-full rounded-2xl border p-3 text-right transition"
              [ngClass]="selectedFeatureId === feature.id ? 'border-[#127c8c] bg-[#edf8fa] shadow-sm' : 'border-slate-100 bg-slate-50 hover:bg-white'">
              <div class="flex items-start justify-between gap-3">
                <span class="material-symbols-outlined rounded-xl p-2 text-[18px]" [ngClass]="feature.tone">{{ feature.icon }}</span>
                <div class="min-w-0 flex-1">
                  <p class="text-[13px] font-black text-slate-950">{{ feature.titleAr }}</p>
                  <p class="mt-1 text-[11px] font-bold leading-relaxed text-slate-500">{{ feature.subtitleAr }}</p>
                </div>
              </div>
              <div class="mt-3 grid grid-cols-3 gap-1.5">
                <div class="rounded-xl bg-white px-2 py-2 text-center">
                  <p class="text-[10px] font-black text-slate-400">العناصر</p>
                  <p class="text-sm font-black text-slate-900">{{ getFeatureCount(feature) }}</p>
                </div>
                <div class="rounded-xl bg-white px-2 py-2 text-center">
                  <p class="text-[10px] font-black text-slate-400">الحالة</p>
                  <p class="text-[11px] font-black text-emerald-600">{{ feature.error ? 'خطأ' : 'جاهز' }}</p>
                </div>
                <div class="rounded-xl bg-white px-2 py-2 text-center">
                  <p class="text-[10px] font-black text-slate-400">آخر حفظ</p>
                  <p class="truncate text-[11px] font-black text-slate-700">{{ feature.savedAt || '-' }}</p>
                </div>
              </div>
            </button>
          </div>
        </aside>

        <main *ngIf="selectedFeature" class="rounded-[26px] border border-slate-200 bg-white shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
            <div>
              <p class="text-[11px] font-black text-[#127c8c]">{{ selectedFeature.titleAr }}</p>
              <h3 class="mt-1 text-xl font-black text-slate-950">تحكم مباشر في بيانات التاجر</h3>
              <p class="mt-1 text-[12px] font-bold text-slate-500">{{ selectedFeature.subtitleAr }}</p>
            </div>

            <button
              type="button"
              (click)="saveSelectedFeature()"
              [disabled]="selectedFeature.isSaving"
              class="rounded-full bg-[#127c8c] px-5 py-2.5 text-[12px] font-black text-white shadow-sm transition hover:bg-[#0f6976] disabled:cursor-wait disabled:opacity-60">
              {{ selectedFeature.isSaving ? 'جاري الحفظ...' : 'حفظ ومزامنة مع Vendor Panel' }}
            </button>
          </div>

          <div *ngIf="selectedFeature.error" class="mx-4 mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-[12px] font-bold text-rose-700">
            {{ selectedFeature.error }}
          </div>

          <div class="grid gap-3 p-4 lg:grid-cols-[1fr_0.8fr]">
            <div class="rounded-2xl border border-slate-200 bg-slate-950 p-3">
              <div class="mb-2 flex items-center justify-between text-[11px] font-black text-slate-300">
                <span>JSON Live Payload</span>
                <span>{{ selectedFeature.draft.length }} chars</span>
              </div>
              <textarea
                [(ngModel)]="selectedFeature.draft"
                class="h-[520px] w-full resize-none rounded-xl border border-slate-800 bg-slate-900 p-3 font-mono text-[12px] leading-relaxed text-emerald-100 outline-none focus:border-[#127c8c]"></textarea>
            </div>

            <div class="space-y-3">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p class="text-[12px] font-black text-slate-900">معاينة مختصرة</p>
                <div class="mt-3 space-y-2">
                  <div *ngFor="let item of getPreviewItems(selectedFeature)" class="rounded-xl border border-slate-100 bg-white p-3">
                    <p class="text-[12px] font-black text-slate-900">{{ item.title }}</p>
                    <p class="mt-1 text-[11px] font-bold text-slate-500">{{ item.description }}</p>
                  </div>
                  <div *ngIf="!getPreviewItems(selectedFeature).length" class="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-center text-[12px] font-bold text-slate-400">
                    لا توجد عناصر محفوظة بعد. أي بيانات ينشئها التاجر ستظهر هنا.
                  </div>
                </div>
              </div>

              <div class="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                <p class="text-[12px] font-black text-amber-900">تنبيه تشغيلي</p>
                <p class="mt-1 text-[11px] font-bold leading-relaxed text-amber-700">
                  هذه نافذة تحكم مباشرة. أي JSON غير صالح لن يتم حفظه. أي تعديل صحيح هنا سيظهر داخل Vendor Panel عند التحديث.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  `
})
export class VendorWorkspaceComponent implements OnInit {
  vendorId = '';
  isLoading = false;
  selectedFeatureId: WorkspaceFeatureId = 'offers';

  features: WorkspaceFeature[] = [
    {
      id: 'offers',
      titleAr: 'العروض والحملات',
      titleEn: 'Offers',
      subtitleAr: 'كوبونات، حملات أقسام، وعروض تصفية تظهر في Vendor Panel.',
      subtitleEn: 'Coupons, category campaigns, and clearance offers.',
      icon: 'sell',
      tone: 'bg-orange-50 text-orange-600',
      data: {},
      draft: '{}',
      isSaving: false,
      error: ''
    },
    {
      id: 'staff',
      titleAr: 'الفروع والموظفون',
      titleEn: 'Staff',
      subtitleAr: 'الفروع، الموظفون، الدعوات، والصلاحيات التشغيلية.',
      subtitleEn: 'Branches, employees, invitations, and permissions.',
      icon: 'groups',
      tone: 'bg-sky-50 text-sky-600',
      data: {},
      draft: '{}',
      isSaving: false,
      error: ''
    },
    {
      id: 'support',
      titleAr: 'الدعم والتذاكر',
      titleEn: 'Support',
      subtitleAr: 'تذاكر الدعم ورسائل التاجر مع فريق التشغيل.',
      subtitleEn: 'Support tickets and messages.',
      icon: 'support_agent',
      tone: 'bg-emerald-50 text-emerald-600',
      data: {},
      draft: '{}',
      isSaving: false,
      error: ''
    }
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly vendorApiService: VendorService
  ) {}

  ngOnInit(): void {
    this.vendorId = this.route.parent?.snapshot.paramMap.get('id') ?? this.route.snapshot.paramMap.get('id') ?? '';
    this.loadWorkspace();
  }

  get selectedFeature(): WorkspaceFeature | undefined {
    return this.features.find((feature) => feature.id === this.selectedFeatureId);
  }

  selectFeature(featureId: WorkspaceFeatureId): void {
    this.selectedFeatureId = featureId;
  }

  loadWorkspace(): void {
    if (!this.vendorId) {
      return;
    }

    this.isLoading = true;
    forkJoin({
      offers: this.vendorApiService.getVendorWorkspaceState<unknown>(this.vendorId, 'offers'),
      staff: this.vendorApiService.getVendorWorkspaceState<unknown>(this.vendorId, 'staff'),
      support: this.vendorApiService.getVendorWorkspaceState<unknown>(this.vendorId, 'support')
    }).subscribe({
      next: (state) => {
        this.applyFeatureData('offers', state.offers);
        this.applyFeatureData('staff', state.staff);
        this.applyFeatureData('support', state.support);
        this.isLoading = false;
      },
      error: () => {
        this.features.forEach((feature) => {
          feature.error = 'تعذر تحميل هذا الجزء من الباك.';
        });
        this.isLoading = false;
      }
    });
  }

  saveSelectedFeature(): void {
    const feature = this.selectedFeature;
    if (!feature || !this.vendorId) {
      return;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(feature.draft || '{}');
    } catch {
      feature.error = 'صيغة JSON غير صحيحة. راجع الأقواس والفواصل.';
      return;
    }

    feature.isSaving = true;
    feature.error = '';
    this.vendorApiService.saveVendorWorkspaceState(this.vendorId, feature.id, payload).subscribe({
      next: () => {
        feature.data = payload;
        feature.savedAt = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        feature.isSaving = false;
      },
      error: () => {
        feature.error = 'تعذر الحفظ الآن. تحقق من الاتصال أو صلاحيات الأدمن.';
        feature.isSaving = false;
      }
    });
  }

  getFeatureCount(feature: WorkspaceFeature): number {
    const data = feature.data as Record<string, unknown> | unknown[];
    if (Array.isArray(data)) {
      return data.length;
    }

    if (!data || typeof data !== 'object') {
      return 0;
    }

    return Object.values(data).reduce<number>((total, value) => {
      if (Array.isArray(value)) {
        return total + value.length;
      }

      return total;
    }, 0);
  }

  getPreviewItems(feature: WorkspaceFeature): Array<{ title: string; description: string }> {
    const data = feature.data as Record<string, unknown> | unknown[];
    const source = Array.isArray(data)
      ? data
      : Object.values(data || {}).find((value) => Array.isArray(value)) as unknown[] | undefined;

    return (source || []).slice(0, 6).map((item, index) => {
      const row = item as Record<string, unknown>;
      return {
        title: String(row['code'] ?? row['name'] ?? row['fullName'] ?? row['reference'] ?? row['targetName'] ?? `عنصر ${index + 1}`),
        description: String(row['noteAr'] ?? row['summary'] ?? row['contact'] ?? row['status'] ?? row['category'] ?? 'بيانات تشغيلية محفوظة')
      };
    });
  }

  private applyFeatureData(featureId: WorkspaceFeatureId, data: unknown): void {
    const feature = this.features.find((item) => item.id === featureId);
    if (!feature) {
      return;
    }

    feature.data = data ?? {};
    feature.draft = JSON.stringify(feature.data, null, 2);
    feature.error = '';
  }
}
