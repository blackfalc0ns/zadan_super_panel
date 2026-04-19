import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { Brand, CatalogUnit, Category } from '@catalog/models/catalog.domain.models';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { BulkMasterProductsModalComponent } from '../../components/bulk-master-products-modal/bulk-master-products-modal.component';

@Component({
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
          <div class="flex min-h-[60vh] items-center justify-center rounded-[28px] border border-slate-200/70 bg-white">
            <div class="flex flex-col items-center gap-4 text-slate-400">
              <div class="h-14 w-14 animate-spin rounded-full border-4 border-zadna-primary/15 border-t-zadna-primary"></div>
              <span class="text-sm font-black">{{ currentLang === 'ar' ? 'جارٍ تحميل البيانات...' : 'Loading data...' }}</span>
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
        this.categories = Array.isArray(res) ? res : [];
        finish();
      },
      error: () => {
        this.categories = [];
        finish();
      }
    });

    this.catalogService.getBrands(true, false).subscribe({
      next: (res) => {
        this.brands = Array.isArray(res) ? res : [];
        finish();
      },
      error: () => {
        this.brands = [];
        finish();
      }
    });

    this.catalogService.getUnits().subscribe({
      next: (res) => {
        this.units = Array.isArray(res) ? res : [];
        finish();
      },
      error: () => {
        this.units = [];
        finish();
      }
    });
  }
}
