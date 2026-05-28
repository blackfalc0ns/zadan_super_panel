import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { Brand, CatalogUnit, Category } from '@catalog/models/catalog.domain.models';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { BulkMasterProductsModalComponent } from '../../components/bulk-master-products-modal/bulk-master-products-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-bulk-master-products-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, AppPageHeaderComponent, BulkMasterProductsModalComponent],
  template: `
    <div class="flex min-h-full flex-col overflow-x-hidden bg-slate-50/50">
      <app-page-header
        [title]="currentLang === 'ar' ? 'إضافة جماعية لبنك المنتجات' : 'Bulk Create Product Bank Items'"
        [subtitle]="currentLang === 'ar' ? 'أنشئ عددًا كبيرًا من منتجات بنك المنتجات من صفحة مستقلة.' : 'Create many product bank items from a dedicated page.'"
        [showToolbar]="true"
        [breadcrumbs]="[
          { label: 'SIDEBAR.CATALOG', url: '/catalog/categories' },
          { label: 'PRODUCTS.TITLE', url: '/catalog/products' },
          { label: currentLang === 'ar' ? 'إضافة جماعية' : 'Bulk Create' }
        ]">
        <span title-prefix class="material-symbols-outlined text-[28px] text-zadna-primary">post_add</span>
      </app-page-header>

      <div class="mx-auto flex w-full max-w-[120rem] flex-col overflow-x-hidden px-4 py-6 pb-8 md:px-8">
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
