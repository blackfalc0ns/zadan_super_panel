import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { RouterModule } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { Brand } from '../../../core/models/catalog.model';
import { BrandFormModalComponent } from '../shared/brand-form-modal/brand-form-modal.component';
import { AppButtonComponent } from '../../../shared/components/ui/button/button.component';
import { AppCardComponent } from '../../../shared/components/ui/card/card.component';
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
  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedBrand: Brand | null = null;
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
        const normalized = Array.isArray(data) ? data : [];
        const query = this.searchTerm.trim().toLowerCase();
        this.brands = query
          ? normalized.filter(brand =>
              brand.nameAr.toLowerCase().includes(query) ||
              brand.nameEn.toLowerCase().includes(query))
          : normalized;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load brands', err);
        this.brands = [];
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
    console.log('Delete brand requested:', brand.id);
  }
}
