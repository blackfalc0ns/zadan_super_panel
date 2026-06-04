import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { Brand, CatalogUnit, Category } from '@catalog/models/catalog.domain.models';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { BulkMasterProductsModalComponent } from '../../components/bulk-master-products-modal/bulk-master-products-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-bulk-master-products-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule, AppPageHeaderComponent, BulkMasterProductsModalComponent],
  template: `
    <div class="bulk-create-page flex min-h-full flex-col overflow-x-hidden bg-slate-50/60">
      <app-page-header
        [title]="currentLang === 'ar' ? 'إضافة جماعية' : 'Bulk create'"
        [subtitle]="currentLang === 'ar' ? 'مساحة عمل لإدخال ومراجعة وإرسال دفعة منتجات.' : 'Workspace to enter, review, and submit a product batch.'"
        [showBack]="true"
        [backUrl]="['/catalog/products']"
        [showToolbar]="true"
        [breadcrumbs]="[
          { label: 'SIDEBAR.CATALOG', url: '/catalog/categories' },
          { label: 'PRODUCTS.TITLE', url: '/catalog/products' },
          { label: currentLang === 'ar' ? 'إضافة جماعية' : 'Bulk create' }
        ]"
        (backClick)="goBack()">
        <span title-prefix class="material-symbols-outlined text-[26px] text-zadna-primary">post_add</span>
        <div actions class="flex flex-wrap items-center gap-2">
          <a
            routerLink="/catalog/products"
            class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50">
            <span class="material-symbols-outlined text-[18px]">inventory_2</span>
            {{ currentLang === 'ar' ? 'قائمة المنتجات' : 'Product list' }}
          </a>
        </div>
      </app-page-header>

      <div class="mx-auto flex w-full max-w-[120rem] flex-col overflow-x-hidden px-3 py-4 pb-6 md:px-6 md:py-5">
        @if (isLoading) {
          <div class="admin-skeleton-detail">
            <div class="admin-skeleton-detail-hero">
              <div class="space-y-3">
                <span class="admin-skeleton admin-skeleton-line lg w-72"></span>
                <span class="admin-skeleton admin-skeleton-line w-96 max-w-full"></span>
              </div>
              <span class="admin-skeleton admin-skeleton-chip"></span>
            </div>
            <div class="admin-skeleton-form mt-5">
              <div *ngFor="let item of [1,2,3,4,5,6]" class="admin-skeleton-form-field">
                <span class="admin-skeleton admin-skeleton-line sm w-1/3"></span>
                <span class="admin-skeleton admin-skeleton-line lg"></span>
              </div>
            </div>
          </div>
        } @else {
          <app-bulk-master-products-modal
            [categories]="categories"
            [brands]="brands"
            [units]="units"
            [currentLang]="currentLang"
            [embedded]="false"
            (close)="goBack()"
            (completed)="handleCompleted()">
          </app-bulk-master-products-modal>
        }
      </div>
    </div>
  `
})
export class BulkMasterProductsPageComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  categories: Category[] = [];
  brands: Brand[] = [];
  units: CatalogUnit[] = [];
  isLoading = true;

  constructor(
    private readonly catalogService: CatalogService,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) {}

  get currentLang(): string {
    return this.translate.currentLang || 'ar';
  }

  ngOnInit(): void {
    this.loadDependencies();
  }

  goBack(): void {
    this.router.navigate(['/catalog/products']);
  }

  handleCompleted(): void {
    this.router.navigate(['/catalog/products']);
  }

  private loadDependencies(): void {
    let pending = 3;

    const finish = () => {
      pending -= 1;
      if (pending <= 0) {
        this.isLoading = false;
      }
    };

    this.catalogService.getCategories(undefined, false, false).subscribe({
      next: (res) => {
        this.cdr.markForCheck();
        this.categories = Array.isArray(res) ? res : [];
        finish();
      },
      error: () => {
        this.cdr.markForCheck();
        this.categories = [];
        finish();
      }
    });

    this.catalogService.getBrands(true, false).subscribe({
      next: (res) => {
        this.cdr.markForCheck();
        this.brands = Array.isArray(res) ? res : [];
        finish();
      },
      error: () => {
        this.cdr.markForCheck();
        this.brands = [];
        finish();
      }
    });

    this.catalogService.getUnits().subscribe({
      next: (res) => {
        this.cdr.markForCheck();
        this.units = Array.isArray(res) ? res : [];
        finish();
      },
      error: () => {
        this.cdr.markForCheck();
        this.units = [];
        finish();
      }
    });
  }
}
