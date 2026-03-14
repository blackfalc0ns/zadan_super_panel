import {
  RouterModule
} from "./chunk-TIVATNVT.js";
import {
  CommonModule,
  ɵɵdefineInjector,
  ɵɵdefineNgModule
} from "./chunk-IPPBI3AG.js";

// src/app/features/catalog/catalog-routing.module.ts
var routes = [
  { path: "categories", loadComponent: () => import("./chunk-UEDXB3MN.js").then((m) => m.CategoriesManagerComponent) },
  { path: "categories/:id", loadComponent: () => import("./chunk-L4V73GVB.js").then((m) => m.CategoryDetailsComponent) },
  { path: "products/create", loadComponent: () => import("./chunk-M6XESSCC.js").then((m) => m.MasterProductFormComponent) },
  { path: "products/edit/:id", loadComponent: () => import("./chunk-M6XESSCC.js").then((m) => m.MasterProductFormComponent) },
  { path: "products/view/:id", loadComponent: () => import("./chunk-3HYLI4TY.js").then((m) => m.ProductDetailComponent) },
  { path: "products", loadComponent: () => import("./chunk-AD65KAEI.js").then((m) => m.MasterProductsComponent) },
  { path: "brands/view/:id", loadComponent: () => import("./chunk-H4EPE2JE.js").then((m) => m.BrandDetailComponent) },
  { path: "brands", loadComponent: () => import("./chunk-JSI4GRB5.js").then((m) => m.BrandListComponent) },
  { path: "image-bank", redirectTo: "products" },
  { path: "", redirectTo: "categories", pathMatch: "full" }
];
var CatalogRoutingModule = class _CatalogRoutingModule {
  static \u0275fac = function CatalogRoutingModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CatalogRoutingModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _CatalogRoutingModule });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ imports: [RouterModule.forChild(routes), RouterModule] });
};

// src/app/features/catalog/catalog.module.ts
var CatalogModule = class _CatalogModule {
  static \u0275fac = function CatalogModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CatalogModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _CatalogModule });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ imports: [
    CommonModule,
    CatalogRoutingModule
  ] });
};
export {
  CatalogModule
};
//# sourceMappingURL=chunk-OTVG2OPV.js.map
