import { Routes } from '@angular/router';

export const CATALOG_ROUTES: Routes = [
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories-manager/categories-manager.component').then(m => m.CategoriesManagerComponent)
  },
  {
    path: 'categories/:id',
    loadComponent: () => import('./pages/categories-manager/category-details/category-details.component').then(m => m.CategoryDetailsComponent)
  },
  {
    path: 'products/create',
    loadComponent: () => import('./pages/master-products/master-product-form/master-product-form.component').then(m => m.MasterProductFormComponent)
  },
  {
    path: 'products/edit/:id',
    loadComponent: () => import('./pages/master-products/master-product-form/master-product-form.component').then(m => m.MasterProductFormComponent)
  },
  {
    path: 'products/view/:id',
    loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/master-products/master-products.component').then(m => m.MasterProductsComponent)
  },
  {
    path: 'brands/view/:id',
    loadComponent: () => import('./pages/brand-detail/brand-detail.component').then(m => m.BrandDetailComponent)
  },
  {
    path: 'brands',
    loadComponent: () => import('./pages/brands/brand-list/brand-list.component').then(m => m.BrandListComponent)
  },
  {
    path: 'requests',
    loadComponent: () => import('./pages/product-requests/request-list.component').then(m => m.ProductRequestListComponent)
  },
  {
    path: 'requests/view/:id',
    loadComponent: () => import('./pages/product-requests/request-detail.component').then(m => m.ProductRequestDetailComponent)
  },
  { path: 'product-requests', redirectTo: 'requests', pathMatch: 'full' },
  { path: 'product-requests/view/:id', redirectTo: 'requests/view/:id', pathMatch: 'full' },
  { path: 'image-bank', redirectTo: 'products' },
  { path: '', redirectTo: 'categories', pathMatch: 'full' }
];

