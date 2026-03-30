import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CatalogService } from '../../../../../core/services/catalog.service';
import { Brand } from '../../../../../core/models/catalog.model';
import { BrandFormModalComponent } from '../../../components/brand-form-modal/brand-form-modal.component';
import { AppButtonComponent } from '../../../../../shared/components/ui/button/button.component';
import { AppCardComponent } from '../../../../../shared/components/ui/card/card.component';
import { AppInputComponent } from '../../../../../shared/components/ui/form-controls/input/input.component';
import { AppPaginationComponent } from '../../../../../shared/components/ui/pagination/pagination.component';
import { AppPageHeaderComponent } from '../../../../../shared/components/ui/page-header/page-header.component';
import { StatusPillComponent, StatusPillVariant } from '../../../../../shared/components/ui/status-pill/status-pill.component';

@Component({
  selector: 'app-brand-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterModule,
    BrandFormModalComponent,
    AppButtonComponent,
    AppCardComponent,
    AppInputComponent,
    AppPaginationComponent,
    AppPageHeaderComponent,
    StatusPillComponent
  ],
  templateUrl: './brand-list.component.html',
  styleUrl: './brand-list.component.scss'
})
export class BrandListComponent implements OnInit {
  isLoading = false;
  brands: Brand[] = [];
  allBrands: Brand[] = [];
  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedBrand: Brand | null = null;
  searchTerm = '';
  searchSubject = new Subject<string>();
  showInactive = false;
  viewMode: 'grid' | 'table' = 'grid';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  get activeLang(): string {
    return this.translate.currentLang || 'ar';
  }

  constructor(
    private readonly route: ActivatedRoute,
    private catalogService: CatalogService,
    public translate: TranslateService
  ) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((term: string) => {
      this.searchTerm = term;
      this.loadBrands();
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchTerm = params['search'] || '';
      this.currentPage = 1;
      this.loadBrands();
    });
  }

  loadBrands(): void {
    this.isLoading = true;
    this.catalogService.getBrands(this.showInactive).subscribe({
      next: (data) => {
        const normalized = Array.isArray(data) ? data : [];
        const query = this.searchTerm.trim().toLowerCase();
        this.allBrands = query
          ? normalized.filter(brand =>
              brand.nameAr.toLowerCase().includes(query) ||
              brand.nameEn.toLowerCase().includes(query))
          : normalized;
        
        // Update total items
        this.totalItems = this.allBrands.length;
        
        // Apply pagination
        this.updatePaginatedBrands();
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load brands', err);
        this.allBrands = [];
        this.brands = [];
        this.totalItems = 0;
        this.isLoading = false;
      }
    });
  }

  updatePaginatedBrands(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.brands = this.allBrands.slice(startIndex, endIndex);
  }

  changePage(newPage: number): void {
    this.currentPage = newPage;
    this.updatePaginatedBrands();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(event: any): void {
    this.currentPage = 1; // Reset to first page on search
    this.searchSubject.next(event.target.value);
  }

  onSearchTermChange(term: string): void {
    this.currentPage = 1;
    this.searchSubject.next(term);
  }

  toggleInactive(): void {
    this.showInactive = !this.showInactive;
    this.currentPage = 1; // Reset to first page
    this.loadBrands();
  }

  openAddBrand(): void {
    this.modalMode = 'create';
    this.selectedBrand = null;
    this.isModalOpen = true;
  }

  editBrand(brand: Brand): void {
    this.modalMode = 'edit';
    this.selectedBrand = brand;
    this.isModalOpen = true;
  }

  deleteBrand(brand: Brand): void {
    console.log('Delete brand requested:', brand.id);
  }

  getBrandStatusVariant(isActive: boolean): StatusPillVariant {
    return isActive ? 'success' : 'paused';
  }
}

