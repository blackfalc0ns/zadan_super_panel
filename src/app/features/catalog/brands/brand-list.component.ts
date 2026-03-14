import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogService } from '../../../core/services/catalog.service';
import { Brand } from '../../../core/models/catalog.model';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { RouterModule } from '@angular/router';
import { BrandFormModalComponent } from '../shared/brand-form-modal/brand-form-modal.component';
import { AppButtonComponent } from '../../../shared/components/ui/button/button.component';
import { AppBadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import { AppCardComponent } from '../../../shared/components/ui/card/card.component';
import { AppPageHeaderComponent } from '../../../shared/components/ui/page-header/page-header.component';
import { AppInputComponent } from '../../../shared/components/ui/form-controls/input.component';

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
    AppInputComponent
  ],
  templateUrl: './brand-list.component.html',
  styleUrl: './brand-list.component.scss'
})
export class BrandListComponent implements OnInit {
  isLoading = false;
  brands: Brand[] = [];
  
  // Modal State
  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedBrand: Brand | null = null;
  
  // Filtering
  searchTerm = '';
  searchSubject = new Subject<string>();
  showInactive = false;
  viewMode: 'grid' | 'table' = 'grid';


  get activeLang(): string {
    return this.translate.currentLang || 'ar';
  }

  constructor(
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
    this.loadBrands();
  }

  loadBrands(): void {
    this.isLoading = true;
    this.catalogService.getBrands(this.showInactive).subscribe({
      next: (data) => {
        this.brands = data;
        this.isLoading = false;
        
        // Mock data for visual verification if empty
        if (this.brands.length === 0 && !this.searchTerm) {
          this.brands = [
            { id: 'b1', nameAr: 'المراعي', nameEn: 'Almarai', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Almarai_Logo.svg/1200px-Almarai_Logo.svg.png', isActive: true },
            { id: 'b2', nameAr: 'جهينة', nameEn: 'Juhayna', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Juhayna_Logo.svg/1200px-Juhayna_Logo.svg.png', isActive: true },
            { id: 'b3', nameAr: 'نستله', nameEn: 'Nestle', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Nestle_text_logo.svg/2560px-Nestle_text_logo.svg.png', isActive: true },
            { id: 'b4', nameAr: 'كوكا كولا', nameEn: 'Coca Cola', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/2560px-Coca-Cola_logo.svg.png', isActive: false }
          ];
        }
      },
      error: (err) => {
        console.error('Failed to load brands', err);
        this.isLoading = false;
      }
    });
  }

  onSearch(event: any): void {
    this.searchSubject.next(event.target.value);
  }

  toggleInactive(): void {
    this.showInactive = !this.showInactive;
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
    // Add logic to show confirmation modal and call delete service
    console.log('Delete brand requested:', brand.id);
  }
}
