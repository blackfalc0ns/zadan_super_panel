import { Routes } from '@angular/router';
import { HasPermissionGuard } from '../../core/guards/has-permission.guard';

export const CATALOG_ROUTES: Routes = [
  {
    path: 'categories',
    canActivate: [HasPermissionGuard],
    data: { permission: 'catalog.view' },
    loadComponent: () => import('./pages/categories-manager/categories-manager.component').then(m => m.CategoriesManagerComponent)
  },
  {
    path: 'categories/:id',
    canActivate: [HasPermissionGuard],
    data: { permission: 'catalog.view' },
    loadComponent: () => import('./pages/categories-manager/category-details/category-details.component').then(m => m.CategoryDetailsComponent)
  },
  {
    path: 'products/create',
    canActivate: [HasPermissionGuard],
    data: { permission: 'catalog.create' },
    loadComponent: () => import('./pages/master-products/master-product-form/master-product-form.component').then(m => m.MasterProductFormComponent)
  },
  {
    path: 'products/edit/:id',
    canActivate: [HasPermissionGuard],
    data: { permission: 'catalog.edit' },
    loadComponent: () => import('./pages/master-products/master-product-form/master-product-form.component').then(m => m.MasterProductFormComponent)
  },
  {
    path: 'products/view/:id',
    canActivate: [HasPermissionGuard],
    data: { permission: 'catalog.view' },
    loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'products/bulk-create',
    canActivate: [HasPermissionGuard],
    data: { permission: 'catalog.create' },
    loadComponent: () => import('./pages/bulk-master-products-page/bulk-master-products-page.component').then(m => m.BulkMasterProductsPageComponent)
  },
  {
    path: 'products',
    canActivate: [HasPermissionGuard],
    data: { permission: 'catalog.view' },
    loadComponent: () => import('./pages/master-products/master-products.component').then(m => m.MasterProductsComponent)
  },
  {
    path: 'brands/view/:id',
    canActivate: [HasPermissionGuard],
    data: { permission: 'catalog.view' },
    loadComponent: () => import('./pages/brand-detail/brand-detail.component').then(m => m.BrandDetailComponent)
  },
  {
    path: 'brands/bulk-create',
    canActivate: [HasPermissionGuard],
    data: { permission: 'catalog.create' },
    loadComponent: () => import('./pages/bulk-brands-page/bulk-brands-page.component').then(m => m.BulkBrandsPageComponent)
  },
  {
    path: 'brands',
    canActivate: [HasPermissionGuard],
    data: { permission: 'catalog.view' },
    loadComponent: () => import('./pages/brands/brand-list/brand-list.component').then(m => m.BrandListComponent)
  },
  {
    path: 'requests',
    canActivate: [HasPermissionGuard],
    data: { permission: 'catalog.approve' },
    loadComponent: () => import('./pages/product-requests/request-list.component').then(m => m.ProductRequestListComponent)
  },
  {
    path: 'requests/view/:id',
    canActivate: [HasPermissionGuard],
    data: { permission: 'catalog.approve' },
    loadComponent: () => import('./pages/product-requests/request-detail.component').then(m => m.ProductRequestDetailComponent)
  },
  {
    path: 'recycle-bin',
    canActivate: [HasPermissionGuard],
    data: { permission: 'catalog.view' },
    loadComponent: () => import('./pages/recycle-bin/recycle-bin.component').then(m => m.RecycleBinComponent)
  },
  { path: 'product-requests', redirectTo: 'requests', pathMatch: 'full' },
  { path: 'product-requests/view/:id', redirectTo: 'requests/view/:id', pathMatch: 'full' },
  { path: 'image-bank', redirectTo: 'products' },
  { path: '', redirectTo: 'categories', pathMatch: 'full' }
];
