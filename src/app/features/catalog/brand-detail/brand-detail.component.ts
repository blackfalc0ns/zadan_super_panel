import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DetailHeaderComponent } from '../../../shared/components/ui/detail-header/detail-header.component';
import { CatalogService } from '../../../core/services/catalog.service';
import { Brand } from '../../../core/models/catalog.model';
import { AppButtonComponent } from '../../../shared/components/ui/button/button.component';
import { AppPageHeaderComponent } from '../../../shared/components/ui/page-header/page-header.component';
import { AppCardComponent } from '../../../shared/components/ui/card/card.component';
import { AppBadgeComponent } from '../../../shared/components/ui/badge/badge.component';

@Component({
  selector: 'app-brand-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    DetailHeaderComponent
  ],
  templateUrl: './brand-detail.component.html',
  styleUrl: './brand-detail.component.scss'
})
export class BrandDetailComponent implements OnInit {
  brand: Brand | null = null;
  products: any[] = [];
  isLoading = true;
  breadcrumbs: { label: string; action?: () => void }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogService: CatalogService,
    public translate: TranslateService
  ) {}

  get activeLang(): string {
    return this.translate.currentLang || 'ar';
  }

  ngOnInit(): void {
    this.setupBreadcrumbs();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBrand(id);
    }
  }

  setupBreadcrumbs(): void {
    this.breadcrumbs = [
      { label: 'الكتالوج', action: () => this.goBack() },
      { label: 'العلامات التجارية', action: () => this.goBack() },
      { label: 'تفاصيل العلامة التجارية' }
    ];
  }

  loadBrand(id: string): void {
    this.isLoading = true;
    this.catalogService.getBrands().subscribe({
      next: (brands) => {
        this.brand = brands.find(b => b.id === id) || null;
        if (this.brand) {
          this.loadBrandProducts(id);
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading brand', err);
        this.isLoading = false;
      }
    });
  }

  loadBrandProducts(brandId: string): void {
    // Fetch products filtered by brandId server-side
    this.catalogService.getProducts(1, 100, undefined, undefined, brandId).subscribe({
      next: (res) => {
        // Now res directly contains the products for this brand (paginated)
        this.products = res.data || res.items || res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products for brand', err);
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/catalog/brands']);
  }

  editBrand(): void {
    if (this.brand?.id) {
      this.router.navigate(['/catalog/brands/edit', this.brand.id]);
    }
  }
}
