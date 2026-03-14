import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'categories', loadComponent: () => import('./categories-manager/categories-manager.component').then(m => m.CategoriesManagerComponent) },
  { path: 'categories/:id', loadComponent: () => import('./categories-manager/category-details/category-details.component').then(m => m.CategoryDetailsComponent) },
  { path: 'products/create', loadComponent: () => import('./master-products/master-product-form/master-product-form.component').then(m => m.MasterProductFormComponent) },
  { path: 'products/edit/:id', loadComponent: () => import('./master-products/master-product-form/master-product-form.component').then(m => m.MasterProductFormComponent) },
  { path: 'products/view/:id', loadComponent: () => import('./product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'products', loadComponent: () => import('./master-products/master-products.component').then(m => m.MasterProductsComponent) },
  { path: 'brands/view/:id', loadComponent: () => import('./brand-detail/brand-detail.component').then(m => m.BrandDetailComponent) },
  { path: 'brands', loadComponent: () => import('./brands/brand-list.component').then(m => m.BrandListComponent) },
  { path: 'image-bank', redirectTo: 'products' },
  { path: '', redirectTo: 'categories', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogRoutingModule { }
