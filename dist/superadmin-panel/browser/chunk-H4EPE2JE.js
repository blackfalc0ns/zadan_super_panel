import {
  DetailHeaderComponent
} from "./chunk-5LH2PCBE.js";
import {
  CatalogService
} from "./chunk-TE3TZJ3N.js";
import "./chunk-PL22K63I.js";
import "./chunk-6L7JDGMK.js";
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterModule
} from "./chunk-TIVATNVT.js";
import {
  TranslateModule,
  TranslateService
} from "./chunk-FETH6UU2.js";
import {
  CommonModule,
  DatePipe,
  NgClass,
  NgForOf,
  NgIf,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnamespaceHTML,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵpureFunction1,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-IPPBI3AG.js";

// src/app/features/catalog/brand-detail/brand-detail.component.ts
var _c0 = (a0) => ["/catalog/products/edit", a0];
function BrandDetailComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 7)(1, "div", 8);
    \u0275\u0275element(2, "div", 9)(3, "div", 10);
    \u0275\u0275elementEnd()();
  }
}
function BrandDetailComponent_div_5_div_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 56);
    \u0275\u0275text(1, "Coca-Cola");
    \u0275\u0275elementEnd();
  }
}
function BrandDetailComponent_div_5_img_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 57);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275property("src", ctx_r0.brand.logoUrl, \u0275\u0275sanitizeUrl)("alt", ctx_r0.brand.nameEn);
  }
}
function BrandDetailComponent_div_5_p_30_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 58);
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "date");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u0622\u062E\u0631 \u062A\u0639\u062F\u064A\u0644: ", \u0275\u0275pipeBind2(2, 1, ctx_r0.brand.updatedAtUtc, "dd/MM/yyyy"), "");
  }
}
function BrandDetailComponent_div_5_tr_59_div_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 76);
    \u0275\u0275element(1, "img", 77);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const product_r2 = \u0275\u0275nextContext().$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275property("src", product_r2.primaryImageUrl || product_r2.images[0].url, \u0275\u0275sanitizeUrl)("alt", ctx_r0.activeLang === "ar" ? product_r2.nameAr : product_r2.nameEn);
  }
}
function BrandDetailComponent_div_5_tr_59_div_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 78);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(1, "svg", 79);
    \u0275\u0275element(2, "path", 80);
    \u0275\u0275elementEnd()();
  }
}
function BrandDetailComponent_div_5_tr_59_span_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 81);
    \u0275\u0275element(1, "span", 82);
    \u0275\u0275text(2, " \u0646\u0634\u0637 ");
    \u0275\u0275elementEnd();
  }
}
function BrandDetailComponent_div_5_tr_59_span_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 83);
    \u0275\u0275element(1, "span", 84);
    \u0275\u0275text(2, " \u0645\u0633\u0648\u062F\u0629 ");
    \u0275\u0275elementEnd();
  }
}
function BrandDetailComponent_div_5_tr_59_span_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 85);
    \u0275\u0275element(1, "span", 86);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const product_r2 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", product_r2.status === "Inactive" ? "\u063A\u064A\u0631 \u0646\u0634\u0637" : "\u0645\u062A\u0648\u0642\u0641", " ");
  }
}
function BrandDetailComponent_div_5_tr_59_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr", 59)(1, "td", 60)(2, "div", 61)(3, "div", 62);
    \u0275\u0275template(4, BrandDetailComponent_div_5_tr_59_div_4_Template, 2, 2, "div", 63)(5, BrandDetailComponent_div_5_tr_59_div_5_Template, 3, 0, "div", 64);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div")(7, "span", 65);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "span", 66);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(11, "td", 67)(12, "span", 68);
    \u0275\u0275text(13);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(14, "td", 67);
    \u0275\u0275template(15, BrandDetailComponent_div_5_tr_59_span_15_Template, 3, 0, "span", 69)(16, BrandDetailComponent_div_5_tr_59_span_16_Template, 3, 0, "span", 70)(17, BrandDetailComponent_div_5_tr_59_span_17_Template, 3, 1, "span", 71);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "td", 67)(19, "button", 72);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(20, "svg", 73);
    \u0275\u0275element(21, "path", 74)(22, "path", 75);
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const product_r2 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", product_r2.primaryImageUrl || product_r2.images && product_r2.images.length > 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !product_r2.primaryImageUrl && (!product_r2.images || product_r2.images.length === 0));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r0.activeLang === "ar" ? product_r2.nameAr : product_r2.nameEn);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.activeLang === "ar" ? product_r2.categoryNameAr : product_r2.categoryNameEn);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(product_r2.sku || product_r2.barcode || "N/A");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", product_r2.status === "Active");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", product_r2.status === "Draft");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", product_r2.status === "Inactive" || product_r2.status === "Discontinued");
    \u0275\u0275advance(2);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(9, _c0, product_r2.id));
  }
}
function BrandDetailComponent_div_5_tr_60_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr")(1, "td", 87)(2, "div", 88);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(3, "svg", 89);
    \u0275\u0275element(4, "path", 90);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(5, "span", 91);
    \u0275\u0275text(6, "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0646\u062A\u062C\u0627\u062A \u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0647\u0630\u0647 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629.");
    \u0275\u0275elementEnd()()()();
  }
}
function BrandDetailComponent_div_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 11)(1, "div", 12)(2, "div", 13)(3, "div", 14);
    \u0275\u0275template(4, BrandDetailComponent_div_5_div_4_Template, 2, 0, "div", 15)(5, BrandDetailComponent_div_5_img_5_Template, 1, 2, "img", 16);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 17)(7, "div", 18);
    \u0275\u0275element(8, "div", 19);
    \u0275\u0275elementStart(9, "div", 20)(10, "div", 21)(11, "p", 22);
    \u0275\u0275text(12, "\u0627\u0633\u0645 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "h2", 23);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "p", 24);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(17, "div", 25)(18, "p", 26);
    \u0275\u0275text(19, "\u0627\u0644\u062D\u0627\u0644\u0629");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "div", 27)(21, "span", 28);
    \u0275\u0275element(22, "span", 29);
    \u0275\u0275text(23);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(24, "div", 25)(25, "p", 26);
    \u0275\u0275text(26, "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0646\u0634\u0627\u0621");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(27, "p", 30);
    \u0275\u0275text(28);
    \u0275\u0275pipe(29, "date");
    \u0275\u0275elementEnd();
    \u0275\u0275template(30, BrandDetailComponent_div_5_p_30_Template, 3, 4, "p", 31);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(31, "div", 32)(32, "p", 33);
    \u0275\u0275text(33, "\u0639\u062F\u062F \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(34, "p", 34);
    \u0275\u0275text(35);
    \u0275\u0275elementEnd()()()()()();
    \u0275\u0275elementStart(36, "div", 35);
    \u0275\u0275element(37, "div", 36)(38, "div", 37);
    \u0275\u0275elementStart(39, "div", 38)(40, "div", 39)(41, "div", 40);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(42, "svg", 41);
    \u0275\u0275element(43, "path", 42);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(44, "h3", 43);
    \u0275\u0275text(45, "\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0631\u062A\u0628\u0637\u0629");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(46, "div", 44)(47, "table", 45)(48, "thead", 46)(49, "tr")(50, "th", 47);
    \u0275\u0275text(51, "\u0627\u0644\u0645\u0646\u062A\u062C");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(52, "th", 48);
    \u0275\u0275text(53, "\u0631\u0645\u0632 \u0627\u0644\u062A\u062E\u0632\u064A\u0646 (SKU)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(54, "th", 48);
    \u0275\u0275text(55, "\u0627\u0644\u0645\u062E\u0632\u0648\u0646");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(56, "th", 48);
    \u0275\u0275text(57, "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(58, "tbody", 49);
    \u0275\u0275template(59, BrandDetailComponent_div_5_tr_59_Template, 23, 11, "tr", 50)(60, BrandDetailComponent_div_5_tr_60_Template, 7, 0, "tr", 51);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(61, "div", 52)(62, "button", 53);
    \u0275\u0275text(63, " \u0639\u0631\u0636 \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A ");
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(64, "svg", 54);
    \u0275\u0275element(65, "path", 55);
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", !ctx_r0.brand.logoUrl);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.brand.logoUrl);
    \u0275\u0275advance(9);
    \u0275\u0275textInterpolate(ctx_r0.brand.nameAr);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.brand.nameEn);
    \u0275\u0275advance(5);
    \u0275\u0275property("ngClass", ctx_r0.brand.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100");
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", ctx_r0.brand.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.brand.isActive ? "\u0646\u0634\u0637" : "\u063A\u064A\u0631 \u0646\u0634\u0637", " ");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.brand.createdAtUtc ? \u0275\u0275pipeBind2(29, 12, ctx_r0.brand.createdAtUtc, "dd/MM/yyyy") : "\u2014");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", ctx_r0.brand.updatedAtUtc);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.brand.masterProductsCount || 0);
    \u0275\u0275advance(24);
    \u0275\u0275property("ngForOf", ctx_r0.products);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.products.length === 0);
  }
}
function BrandDetailComponent_div_6_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 92)(1, "div", 93)(2, "div", 94)(3, "span", 95);
    \u0275\u0275text(4, "warning");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "h3", 96);
    \u0275\u0275text(6, "\u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "p", 97);
    \u0275\u0275text(8, "\u0646\u0639\u062A\u0630\u0631\u060C \u0644\u0645 \u0646\u062A\u0645\u0643\u0646 \u0645\u0646 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "button", 98);
    \u0275\u0275listener("click", function BrandDetailComponent_div_6_Template_button_click_9_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.goBack());
    });
    \u0275\u0275text(10, " \u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 ");
    \u0275\u0275elementEnd()()();
  }
}
var BrandDetailComponent = class _BrandDetailComponent {
  route;
  router;
  catalogService;
  translate;
  brand = null;
  products = [];
  isLoading = true;
  breadcrumbs = [];
  constructor(route, router, catalogService, translate) {
    this.route = route;
    this.router = router;
    this.catalogService = catalogService;
    this.translate = translate;
  }
  get activeLang() {
    return this.translate.currentLang || "ar";
  }
  ngOnInit() {
    this.setupBreadcrumbs();
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.loadBrand(id);
    }
  }
  setupBreadcrumbs() {
    this.breadcrumbs = [
      { label: "\u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C", action: () => this.goBack() },
      { label: "\u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629", action: () => this.goBack() },
      { label: "\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629" }
    ];
  }
  loadBrand(id) {
    this.isLoading = true;
    this.catalogService.getBrands().subscribe({
      next: (brands) => {
        this.brand = brands.find((b) => b.id === id) || null;
        if (this.brand) {
          this.loadBrandProducts(id);
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error("Error loading brand", err);
        this.isLoading = false;
      }
    });
  }
  loadBrandProducts(brandId) {
    this.catalogService.getProducts(1, 100, void 0, void 0, brandId).subscribe({
      next: (res) => {
        this.products = res.data || res.items || res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading products for brand", err);
        this.isLoading = false;
      }
    });
  }
  goBack() {
    this.router.navigate(["/catalog/brands"]);
  }
  editBrand() {
    if (this.brand?.id) {
      this.router.navigate(["/catalog/brands/edit", this.brand.id]);
    }
  }
  static \u0275fac = function BrandDetailComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrandDetailComponent)(\u0275\u0275directiveInject(ActivatedRoute), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(CatalogService), \u0275\u0275directiveInject(TranslateService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _BrandDetailComponent, selectors: [["app-brand-detail"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 7, vars: 4, consts: [[1, "relative", "min-h-screen", "bg-zadna-bgLight", "overflow-hidden", "p-6", "lg:p-10", "font-display"], [1, "absolute", "top-[-10%]", "left-[-10%]", "w-[50vw]", "h-[50vw]", "bg-zadna-primary/10", "rounded-full", "blur-[120px]", "pointer-events-none"], [1, "absolute", "bottom-[-20%]", "right-[-10%]", "w-[60vw]", "h-[60vw]", "bg-zadna-accent/5", "rounded-full", "blur-[120px]", "pointer-events-none"], ["class", "flex items-center justify-center min-h-[400px] relative z-20", 4, "ngIf"], ["actionButtonLabel", "\u062A\u0639\u062F\u064A\u0644", "actionButtonIcon", "edit", 3, "backClick", "actionClick", "breadcrumbs"], ["class", "max-w-7xl mx-auto space-y-8 flex flex-col min-h-[calc(100vh-5rem)] relative z-10 transition-all", 4, "ngIf"], ["class", "max-w-md mx-auto relative z-20 pt-20", 4, "ngIf"], [1, "flex", "items-center", "justify-center", "min-h-[400px]", "relative", "z-20"], [1, "relative", "w-16", "h-16"], [1, "absolute", "inset-0", "rounded-full", "border-4", "border-zadna-primary/20"], [1, "absolute", "inset-0", "rounded-full", "border-4", "border-t-zadna-primary", "animate-spin"], [1, "max-w-7xl", "mx-auto", "space-y-8", "flex", "flex-col", "min-h-[calc(100vh-5rem)]", "relative", "z-10", "transition-all"], [1, "grid", "grid-cols-1", "lg:grid-cols-12", "gap-6", "items-stretch"], [1, "lg:col-span-4"], [1, "bg-white", "rounded-[2rem]", "p-6", "h-full", "flex", "items-center", "justify-center", "min-h-[220px]", "shadow-sm", "relative", "overflow-hidden", "group"], ["class", "text-3xl font-black text-[#F40009] tracking-tighter rotate-[-5deg] drop-shadow-sm group-hover:scale-110 transition-transform", 4, "ngIf"], ["class", "w-full h-full max-w-[180px] aspect-square object-contain relative z-10 group-hover:scale-105 transition-transform", 3, "src", "alt", 4, "ngIf"], [1, "lg:col-span-8"], [1, "bg-white/60", "backdrop-blur-xl", "border", "border-white/40", "rounded-[2rem]", "p-8", "h-full", "flex", "items-center", "shadow-sm", "relative", "overflow-hidden"], [1, "absolute", "top-0", "right-0", "w-32", "h-32", "bg-zadna-primary/5", "rounded-full", "blur-[40px]", "-mr-16", "-mt-16"], [1, "w-full", "grid", "grid-cols-2", "lg:grid-cols-4", "gap-8", "items-center"], [1, "flex", "flex-col"], [1, "text-[10px]", "font-bold", "text-slate-400", "uppercase", "tracking-widest", "mb-1.5"], [1, "text-2xl", "font-black", "text-slate-900", "leading-tight"], [1, "text-[10px]", "font-bold", "text-slate-400", "uppercase", "tracking-tight"], [1, "flex", "flex-col", "border-r", "border-slate-200/50", "pr-8"], [1, "text-[10px]", "font-bold", "text-slate-400", "uppercase", "tracking-widest", "mb-2"], [1, "flex"], [1, "inline-flex", "items-center", "gap-1.5", "px-3", "py-1", "rounded-full", "text-[10px]", "font-black", "uppercase", "tracking-wider", "border", "transition-all", 3, "ngClass"], [1, "w-1.5", "h-1.5", "rounded-full", 3, "ngClass"], [1, "text-sm", "font-bold", "text-slate-700"], ["class", "text-[9px] font-medium text-slate-400 mt-0.5", 4, "ngIf"], [1, "flex", "flex-col", "border-r", "border-slate-200/50", "pr-8", "text-center", "lg:text-right"], [1, "text-[10px]", "font-bold", "text-slate-400", "uppercase", "tracking-widest", "mb-1"], [1, "text-4xl", "font-black", "text-zadna-primary", "leading-none"], [1, "bg-white/60", "backdrop-blur-xl", "border", "border-white/40", "rounded-[2.5rem]", "p-8", "shadow-sm", "flex-grow", "flex", "flex-col", "relative", "overflow-hidden"], [1, "absolute", "top-0", "right-0", "w-8", "h-[2px]", "bg-zadna-primary/40"], [1, "absolute", "bottom-0", "left-0", "w-8", "h-[2px]", "bg-zadna-accent/40"], [1, "flex", "flex-col", "md:flex-row", "justify-between", "items-center", "mb-8", "gap-6"], [1, "flex", "items-center", "gap-3"], [1, "w-10", "h-10", "rounded-xl", "bg-zadna-primary/5", "border", "border-zadna-primary/10", "flex", "items-center", "justify-center", "text-zadna-primary"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"], [1, "text-xl", "font-black", "text-slate-900", "tracking-tight"], [1, "overflow-x-auto", "flex-grow", "rounded-[1.5rem]", "border", "border-white/60", "shadow-inner", "bg-white/20"], [1, "w-full", "text-sm", "text-right"], [1, "text-[10px]", "font-black", "uppercase", "tracking-widest", "text-slate-400", "bg-white/40", "border-b", "border-white/60"], ["scope", "col", 1, "px-8", "py-5", "font-bold"], ["scope", "col", 1, "px-8", "py-5", "font-bold", "text-center"], [1, "divide-y", "divide-white/40"], ["class", "hover:bg-white/60 transition-all group", 4, "ngFor", "ngForOf"], [4, "ngIf"], [1, "mt-8", "flex", "justify-center"], [1, "text-[10px]", "font-black", "uppercase", "tracking-widest", "text-zadna-primary", "hover:text-zadna-primaryDark", "transition-all", "flex", "items-center", "gap-2", "bg-white/60", "backdrop-blur-xl", "px-6", "py-2.5", "rounded-full", "border", "border-zadna-primary/20", "shadow-sm", "active:scale-95", "group"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "group-hover:translate-y-0.5", "transition-transform"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M19 9l-7 7-7-7"], [1, "text-3xl", "font-black", "text-[#F40009]", "tracking-tighter", "rotate-[-5deg]", "drop-shadow-sm", "group-hover:scale-110", "transition-transform"], [1, "w-full", "h-full", "max-w-[180px]", "aspect-square", "object-contain", "relative", "z-10", "group-hover:scale-105", "transition-transform", 3, "src", "alt"], [1, "text-[9px]", "font-medium", "text-slate-400", "mt-0.5"], [1, "hover:bg-white/60", "transition-all", "group"], [1, "px-8", "py-5"], [1, "flex", "items-center", "gap-4"], [1, "w-12", "h-12", "rounded-xl", "bg-white", "shadow-sm", "border", "border-slate-100", "p-1", "group-hover:border-zadna-primary/20", "transition-all", "overflow-hidden", "flex-shrink-0"], ["class", "w-full h-full", 4, "ngIf"], ["class", "w-full h-full bg-slate-50 rounded-lg flex items-center justify-center text-slate-300", 4, "ngIf"], [1, "font-black", "text-slate-900", "block", "group-hover:text-zadna-primary", "transition-all"], [1, "text-[10px]", "font-bold", "text-slate-400", "uppercase"], [1, "px-8", "py-5", "text-center"], [1, "text-[10px]", "font-black", "bg-slate-100", "px-3", "py-1", "rounded-md", "text-slate-600", "tracking-wider", "font-mono"], ["class", "inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/50", 4, "ngIf"], ["class", "inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100/50", 4, "ngIf"], ["class", "inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100/50", 4, "ngIf"], [1, "w-8", "h-8", "rounded-full", "bg-white", "border", "border-slate-100", "shadow-sm", "inline-flex", "items-center", "justify-center", "text-slate-400", "hover:text-zadna-primary", "hover:border-zadna-primary", "transition-all", "active:scale-90", 3, "routerLink"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15 12a3 3 0 11-6 0 3 3 0 016 0z"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"], [1, "w-full", "h-full"], [1, "w-full", "h-full", "object-cover", "rounded-lg", 3, "src", "alt"], [1, "w-full", "h-full", "bg-slate-50", "rounded-lg", "flex", "items-center", "justify-center", "text-slate-300"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-6", "h-6"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"], [1, "inline-flex", "items-center", "gap-1.5", "text-[10px]", "font-black", "uppercase", "tracking-wider", "text-emerald-600", "bg-emerald-50", "px-3", "py-1", "rounded-full", "border", "border-emerald-100/50"], [1, "w-1", "h-1", "rounded-full", "bg-emerald-500"], [1, "inline-flex", "items-center", "gap-1.5", "text-[10px]", "font-black", "uppercase", "tracking-wider", "text-amber-600", "bg-amber-50", "px-3", "py-1", "rounded-full", "border", "border-amber-100/50"], [1, "w-1", "h-1", "rounded-full", "bg-amber-500"], [1, "inline-flex", "items-center", "gap-1.5", "text-[10px]", "font-black", "uppercase", "tracking-wider", "text-rose-600", "bg-rose-50", "px-3", "py-1", "rounded-full", "border", "border-rose-100/50"], [1, "w-1", "h-1", "rounded-full", "bg-rose-500"], ["colspan", "4", 1, "px-8", "py-10", "text-center"], [1, "flex", "flex-col", "items-center", "justify-center", "text-slate-400"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-10", "h-10", "mb-3", "text-slate-300"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"], [1, "text-sm", "font-bold", "uppercase", "tracking-widest"], [1, "max-w-md", "mx-auto", "relative", "z-20", "pt-20"], [1, "bg-white/60", "backdrop-blur-xl", "border", "border-white/40", "rounded-[2rem]", "p-10", "text-center", "shadow-xl"], [1, "w-20", "h-20", "bg-slate-100", "rounded-2xl", "flex", "items-center", "justify-center", "mx-auto", "mb-6", "text-slate-400"], [1, "material-icons", "text-4xl"], [1, "text-xl", "font-black", "text-slate-900", "mb-2"], [1, "text-xs", "font-bold", "text-slate-500", "mb-8", "uppercase", "tracking-wider"], [1, "bg-zadna-primary", "text-white", "px-8", "py-3", "rounded-full", "font-black", "text-[10px]", "uppercase", "tracking-widest", "hover:bg-zadna-primaryDark", "transition-all", "shadow-lg", "shadow-zadna-primary/30", 3, "click"]], template: function BrandDetailComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0);
      \u0275\u0275element(1, "div", 1)(2, "div", 2);
      \u0275\u0275template(3, BrandDetailComponent_div_3_Template, 4, 0, "div", 3);
      \u0275\u0275elementStart(4, "app-detail-header", 4);
      \u0275\u0275listener("backClick", function BrandDetailComponent_Template_app_detail_header_backClick_4_listener() {
        return ctx.goBack();
      })("actionClick", function BrandDetailComponent_Template_app_detail_header_actionClick_4_listener() {
        return ctx.editBrand();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275template(5, BrandDetailComponent_div_5_Template, 66, 15, "div", 5)(6, BrandDetailComponent_div_6_Template, 11, 0, "div", 6);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(3);
      \u0275\u0275property("ngIf", ctx.isLoading);
      \u0275\u0275advance();
      \u0275\u0275property("breadcrumbs", ctx.breadcrumbs);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.isLoading && ctx.brand);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.isLoading && !ctx.brand);
    }
  }, dependencies: [
    CommonModule,
    NgClass,
    NgForOf,
    NgIf,
    DatePipe,
    RouterModule,
    RouterLink,
    TranslateModule,
    DetailHeaderComponent
  ], styles: ["\n\n[_nghost-%COMP%] {\n  display: block;\n  width: 100%;\n}\n/*# sourceMappingURL=brand-detail.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(BrandDetailComponent, { className: "BrandDetailComponent", filePath: "src\\app\\features\\catalog\\brand-detail\\brand-detail.component.ts", lineNumber: 25 });
})();
export {
  BrandDetailComponent
};
//# sourceMappingURL=chunk-H4EPE2JE.js.map
