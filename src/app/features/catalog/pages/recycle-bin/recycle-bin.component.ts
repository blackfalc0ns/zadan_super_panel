import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { CatalogService } from '@catalog/services/catalog.api.service';
import { AppPageHeaderComponent } from '../../../../shared/components/ui/page-header/page-header.component';
import { AppButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { AppCardComponent } from '../../../../shared/components/ui/card/card.component';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import { StatusPillComponent } from '../../../../shared/components/ui/status-pill/status-pill.component';

@Component({
 changeDetection: ChangeDetectionStrategy.OnPush,
 selector: 'app-recycle-bin',
 standalone: true,
 imports: [
 CommonModule,
 FormsModule,
 TranslateModule,
 RouterModule,
 AppPageHeaderComponent,
 AppButtonComponent,
 AppCardComponent,
 AppPaginationComponent,
 StatusPillComponent
 ],
 templateUrl: './recycle-bin.component.html',
 styleUrl: './recycle-bin.component.scss'
})
export class RecycleBinComponent implements OnInit {
 private readonly cdr = inject(ChangeDetectorRef);
 isLoading = false;
 activeTab: 'products' | 'brands' | 'categories' = 'products';
 
 // Data lists
 deletedProducts: any[] = [];
 deletedBrands: any[] = [];
 deletedCategories: any[] = [];
 
 // Pagination
 currentPage = 1;
 pageSize = 10;
 totalItems = 0;
 hasMore = false;

 // Feedback messages
 successMessage: string | null = null;
 errorMessage: string | null = null;

 constructor(
 private readonly catalogService: CatalogService,
 public readonly translate: TranslateService
 ) {}

 ngOnInit(): void {
 this.loadDeletedItems();
 }

 get activeLang(): string {
 return this.translate.currentLang || 'ar';
 }

 switchTab(tab: 'products' | 'brands' | 'categories'): void {
 this.activeTab = tab;
 this.currentPage = 1;
 this.successMessage = null;
 this.errorMessage = null;
 this.loadDeletedItems();
 }

 loadDeletedItems(): void {
 this.isLoading = true;
 this.successMessage = null;
 this.errorMessage = null;

 if (this.activeTab === 'products') {
 this.catalogService.getDeletedProducts(this.currentPage, this.pageSize).subscribe({
 next: (res) => {
 this.cdr.markForCheck();
 this.deletedProducts = res.items || [];
 this.totalItems = res.total || 0;
 this.hasMore = res.hasMore || false;
 this.isLoading = false;
 },
 error: (err) => {
 this.cdr.markForCheck();
 console.error('Failed to load deleted products', err);
 this.deletedProducts = [];
 this.isLoading = false;
 }
 });
 } else if (this.activeTab === 'brands') {
 this.catalogService.getDeletedBrands(this.currentPage, this.pageSize).subscribe({
 next: (res) => {
 this.cdr.markForCheck();
 this.deletedBrands = res.items || [];
 this.totalItems = res.total || 0;
 this.hasMore = res.hasMore || false;
 this.isLoading = false;
 },
 error: (err) => {
 this.cdr.markForCheck();
 console.error('Failed to load deleted brands', err);
 this.deletedBrands = [];
 this.isLoading = false;
 }
 });
 } else if (this.activeTab === 'categories') {
 this.catalogService.getDeletedCategories(this.currentPage, this.pageSize).subscribe({
 next: (res) => {
 this.cdr.markForCheck();
 this.deletedCategories = res.items || [];
 this.totalItems = res.total || 0;
 this.hasMore = res.hasMore || false;
 this.isLoading = false;
 },
 error: (err) => {
 this.cdr.markForCheck();
 console.error('Failed to load deleted categories', err);
 this.deletedCategories = [];
 this.isLoading = false;
 }
 });
 }
 }

 changePage(page: number): void {
 this.currentPage = page;
 this.loadDeletedItems();
 window.scrollTo({ top: 0, behavior: 'smooth' });
 }

 restoreItem(item: any): void {
 this.isLoading = true;
 this.successMessage = null;
 this.errorMessage = null;

 if (this.activeTab === 'products') {
 this.catalogService.restoreProduct(item.id).subscribe({
 next: (res) => {
 this.cdr.markForCheck();
 this.successMessage = this.activeLang === 'ar' ? res.message_ar : res.message_en;
 this.loadDeletedItems();
 },
 error: (err) => {
 this.cdr.markForCheck();
 console.error('Failed to restore product', err);
 this.errorMessage = this.activeLang === 'ar' 
 ? 'ما قدرنا نستعيد المنتج. قد يكون تصنيفه أو علامته التجارية محذوفة أولاً.'
 : 'Could not restore product. Category or Brand might be deleted.';
 this.isLoading = false;
 }
 });
 } else if (this.activeTab === 'brands') {
 this.catalogService.restoreBrand(item.id).subscribe({
 next: (res) => {
 this.cdr.markForCheck();
 this.successMessage = this.activeLang === 'ar' ? res.message_ar : res.message_en;
 this.loadDeletedItems();
 },
 error: (err) => {
 this.cdr.markForCheck();
 console.error('Failed to restore brand', err);
 this.errorMessage = this.activeLang === 'ar' ? 'ما قدرنا نستعيد العلامة التجارية.' : 'Failed to restore brand.';
 this.isLoading = false;
 }
 });
 } else if (this.activeTab === 'categories') {
 this.catalogService.restoreCategory(item.id).subscribe({
 next: (res) => {
 this.cdr.markForCheck();
 this.successMessage = this.activeLang === 'ar' ? res.message_ar : res.message_en;
 this.loadDeletedItems();
 },
 error: (err) => {
 this.cdr.markForCheck();
 console.error('Failed to restore category', err);
 this.errorMessage = this.activeLang === 'ar' 
 ? 'ما قدرنا نستعيد التصنيف. قد يكون التصنيف الأب محذوفاً أولاً.' 
 : 'Could not restore category. Parent category might be deleted.';
 this.isLoading = false;
 }
 });
 }
 }

 get totalPages(): number {
 return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
 }
}
