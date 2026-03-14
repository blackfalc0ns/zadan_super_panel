import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { Category } from '../../../core/models/catalog.model';
import { CategoryFormModalComponent } from '../shared/category-form-modal/category-form-modal.component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';

import { AppButtonComponent } from '../../../shared/components/ui/button/button.component';
import { AppBadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import { AppPaginationComponent } from '../../../shared/components/ui/pagination/pagination.component';
import { AppPageHeaderComponent } from '../../../shared/components/ui/page-header/page-header.component';
import { AppInputComponent } from '../../../shared/components/ui/form-controls/input.component';

@Component({
  selector: 'app-categories-manager',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TranslateModule, 
    CategoryFormModalComponent, 
    DeleteConfirmationModalComponent,
    AppButtonComponent,
    AppBadgeComponent,
    AppPaginationComponent,
    AppPageHeaderComponent,
    AppInputComponent
  ],
  templateUrl: './categories-manager.component.html',
  styleUrl: './categories-manager.component.scss'
})
export class CategoriesManagerComponent implements OnInit {
  isLoading = true;
  industries: Category[] = [];

  // Navigation & Pagination State
  breadcrumbs: Category[] = [];
  currentItems: Category[] = [];
  searchTerm = '';
  
  currentPage = 1;
  pageSize = 10;
  
  get totalPages(): number {
    return Math.ceil(this.currentItems.length / this.pageSize);
  }

  get paginatedItems(): Category[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.currentItems.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
    }
  }

  // Modal State
  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  modalLevelKey = '';
  isSaving = false;
  categoryForm: Partial<Category> | null = null;

  // Deletion State
  isDeleteModalOpen = false;
  isDeleting = false;
  itemToDelete: Category | null = null;

  // Context State
  parentCategoryForModal: { id: string | null, nameAr: string, nameEn: string } | null = null;

  // Tree Table State
  expandedRows = new Set<string>();

  // Expose Math to template
  Math = Math;

  constructor(
    private catalogService: CatalogService,
    public translate: TranslateService,
    private router: Router
  ) { }

  get activeLang(): string {
    return this.translate.currentLang || 'ar';
  }

  getDynamicBreadcrumbs(): any[] {
    return [
      { label: 'SIDEBAR.CATALOG', url: '/catalog/categories' },
      { label: 'CATEGORIES.INDUSTRY', url: '' }
    ];
  }

  ngOnInit() {
    this.loadHierarchy();
  }

  loadHierarchy() {
    this.isLoading = true;
    this.catalogService.getCategories(undefined, true).subscribe({
      next: (data: Category[]) => {
        this.industries = data || [];
        this.refreshCurrentItems();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  getLevelNameKey(): string {
    return 'CATEGORIES.INDUSTRY';
  }

  toggleRow(categoryId: string, event?: Event) {
    if (event) event.stopPropagation();
    if (this.expandedRows.has(categoryId)) {
      this.expandedRows.delete(categoryId);
    } else {
      this.expandedRows.add(categoryId);
    }
  }

  isExpanded(categoryId: string): boolean {
    return this.expandedRows.has(categoryId);
  }

  getFlattenedHierarchy(): any[] {
    const flatList: any[] = [];
    
    const process = (items: Category[], level: number, parentVisible: boolean) => {
      for (const item of items) {
        flatList.push({
          ...item,
          level,
          isExpanded: this.isExpanded(item.id),
          hasChildren: !!(item.subCategories && item.subCategories.length > 0)
        });

        if (this.isExpanded(item.id) && item.subCategories) {
          process(item.subCategories, level + 1, true);
        }
      }
    };

    process(this.industries, 0, true);
    return flatList;
  }

  getCurrentParentId(): string | null {
    if (this.breadcrumbs.length === 0) return null;
    return this.breadcrumbs[this.breadcrumbs.length - 1].id;
  }

  refreshCurrentItems() {
    let items = [...this.industries];
    
    if (this.searchTerm && this.searchTerm.trim() !== '') {
        const term = this.searchTerm.toLowerCase().trim();
        items = items.filter(i => 
            (i.nameAr && i.nameAr.toLowerCase().includes(term)) ||
            (i.nameEn && i.nameEn.toLowerCase().includes(term))
        );
    }
    
    this.currentItems = items;
    this.currentPage = 1;
  }

  onSearch(event?: any) {
    this.refreshCurrentItems();
  }

  selectItem(item: Category) {
    // Navigate to details page for the activity
    this.router.navigate(['/catalog/categories', item.id]);
  }

  goToLevel(index: number) {
    if (index === 0) {
      this.breadcrumbs = [];
    } else {
      this.breadcrumbs = this.breadcrumbs.slice(0, index);
    }
    this.refreshCurrentItems();
  }

  openCreateModal(parent?: any) {
    this.modalMode = 'create';
    const activeParent = parent || (this.breadcrumbs.length > 0 ? this.breadcrumbs[this.breadcrumbs.length - 1] : null);
    
    this.modalLevelKey = this.getLevelNameKey();

    this.parentCategoryForModal = activeParent ? {
        id: activeParent.id,
        nameAr: activeParent.nameAr,
        nameEn: activeParent.nameEn
    } : null;

    this.isModalOpen = true;
  }

  openEditModal(category: any, event: Event) {
    event.stopPropagation();
    this.modalMode = 'edit';
    this.modalLevelKey = this.getLevelNameKey();
    this.categoryForm = { ...category };
    this.isModalOpen = true;
  }

  closeCategoryModal() {
    this.isModalOpen = false;
    this.categoryForm = null;
  }

  handleSaved() {
    this.loadHierarchy(); // Full refresh
  }

  onCreateProduct(category: Category) {
    this.router.navigate(['/catalog/products/create'], { queryParams: { categoryId: category.id } });
  }

  viewDetails(category: Category, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/catalog/categories', category.id]);
  }

  openDeleteModal(category: Category, event: Event) {
    event.stopPropagation();
    this.itemToDelete = category;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.itemToDelete = null;
  }

  confirmDelete() {
    if (!this.itemToDelete) return;

    this.isDeleting = true;
    this.catalogService.deleteCategory(this.itemToDelete.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.closeDeleteModal();
        this.loadHierarchy();
      },
      error: (err: any) => {
        console.error('Deletion failed:', err);
        this.isDeleting = false;
      }
    });
  }
}
