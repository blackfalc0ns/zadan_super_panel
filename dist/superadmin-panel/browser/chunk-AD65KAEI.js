import {
  AppPaginationComponent
} from "./chunk-LI5G6AB4.js";
import "./chunk-J7OIUMD3.js";
import {
  AppInputComponent
} from "./chunk-E66AVT3J.js";
import {
  FormsModule
} from "./chunk-33QDSRRV.js";
import {
  CatalogService
} from "./chunk-TE3TZJ3N.js";
import "./chunk-PL22K63I.js";
import "./chunk-ERDI6WJP.js";
import {
  AppButtonComponent
} from "./chunk-NRL7A6JT.js";
import "./chunk-6L7JDGMK.js";
import {
  ActivatedRoute,
  RouterLink,
  RouterModule
} from "./chunk-TIVATNVT.js";
import {
  TranslateModule,
  TranslatePipe,
  TranslateService
} from "./chunk-FETH6UU2.js";
import {
  CommonModule,
  NgForOf,
  NgIf,
  Subject,
  debounceTime,
  distinctUntilChanged,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnamespaceHTML,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
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

// src/app/features/catalog/master-products/master-products.component.ts
var _c0 = (a0) => ["/catalog/products/view", a0];
var _c1 = (a0) => ["/catalog/products/edit", a0];
function MasterProductsComponent_ng_container_20_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "translate");
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(2, 1, "SIDEBAR.VENDORS.FILTER_ALL"));
  }
}
function MasterProductsComponent_ng_container_21_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275text(1);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.getCategoryName(ctx_r0.categoryId));
  }
}
function MasterProductsComponent_div_24_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 35);
    \u0275\u0275listener("click", function MasterProductsComponent_div_24_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.isCategoryDropdownOpen = false);
    });
    \u0275\u0275elementEnd();
  }
}
function MasterProductsComponent_div_25__svg_svg_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 43);
    \u0275\u0275element(1, "path", 44);
    \u0275\u0275elementEnd();
  }
}
function MasterProductsComponent_div_25_button_8__svg_svg_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 43);
    \u0275\u0275element(1, "path", 44);
    \u0275\u0275elementEnd();
  }
}
function MasterProductsComponent_div_25_button_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 37);
    \u0275\u0275listener("click", function MasterProductsComponent_div_25_button_8_Template_button_click_0_listener() {
      const cat_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r0 = \u0275\u0275nextContext(2);
      ctx_r0.filterByCategory(cat_r5.id);
      return \u0275\u0275resetView(ctx_r0.isCategoryDropdownOpen = false);
    });
    \u0275\u0275elementStart(1, "span", 45);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275template(3, MasterProductsComponent_div_25_button_8__svg_svg_3_Template, 2, 0, "svg", 39);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cat_r5 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r0.translate.currentLang === "ar" ? cat_r5.nameAr : cat_r5.nameEn, " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.categoryId === cat_r5.id);
  }
}
function MasterProductsComponent_div_25_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 36)(1, "button", 37);
    \u0275\u0275listener("click", function MasterProductsComponent_div_25_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r0 = \u0275\u0275nextContext();
      ctx_r0.filterByCategory(null);
      return \u0275\u0275resetView(ctx_r0.isCategoryDropdownOpen = false);
    });
    \u0275\u0275elementStart(2, "span", 38);
    \u0275\u0275text(3);
    \u0275\u0275pipe(4, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275template(5, MasterProductsComponent_div_25__svg_svg_5_Template, 2, 0, "svg", 39);
    \u0275\u0275elementEnd();
    \u0275\u0275element(6, "div", 40);
    \u0275\u0275elementStart(7, "div", 41);
    \u0275\u0275template(8, MasterProductsComponent_div_25_button_8_Template, 4, 2, "button", 42);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(4, 3, "SIDEBAR.VENDORS.FILTER_ALL"));
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", !ctx_r0.categoryId);
    \u0275\u0275advance(3);
    \u0275\u0275property("ngForOf", ctx_r0.categories);
  }
}
function MasterProductsComponent_div_41_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 46)(1, "div", 47);
    \u0275\u0275element(2, "div", 48)(3, "div", 49);
    \u0275\u0275elementEnd()();
  }
}
function MasterProductsComponent_div_42_tr_17_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr", 59)(1, "td", 60)(2, "span", 61);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "td", 62)(5, "div", 63)(6, "div", 64);
    \u0275\u0275element(7, "img", 65)(8, "div", 66);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(9, "td", 67)(10, "div", 68)(11, "span", 69);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "span", 70);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(15, "td", 71)(16, "div", 72)(17, "code", 73);
    \u0275\u0275text(18);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "span", 74);
    \u0275\u0275text(20);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(21, "td", 75)(22, "div", 63)(23, "div", 76);
    \u0275\u0275element(24, "span", 77);
    \u0275\u0275elementStart(25, "span", 78);
    \u0275\u0275text(26);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(27, "td", 75)(28, "div", 79)(29, "button", 80);
    \u0275\u0275listener("click", function MasterProductsComponent_div_42_tr_17_Template_button_click_29_listener($event) {
      \u0275\u0275restoreView(_r6);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(30, "svg", 81);
    \u0275\u0275element(31, "path", 82);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(32, "button", 83);
    \u0275\u0275listener("click", function MasterProductsComponent_div_42_tr_17_Template_button_click_32_listener($event) {
      \u0275\u0275restoreView(_r6);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(33, "svg", 81);
    \u0275\u0275element(34, "path", 84)(35, "path", 85);
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const product_r7 = ctx.$implicit;
    const i_r8 = ctx.index;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(22, _c0, product_r7.id));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate((ctx_r0.page - 1) * ctx_r0.pageSize + i_r8 + 1);
    \u0275\u0275advance(4);
    \u0275\u0275property("src", ctx_r0.getPrimaryImage(product_r7), \u0275\u0275sanitizeUrl);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", ctx_r0.translate.currentLang === "ar" ? product_r7.nameAr : product_r7.nameEn, " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r0.translate.currentLang === "ar" ? product_r7.nameEn : product_r7.nameAr, " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", product_r7.barcode || "SEC-TRK-77X", " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r0.getCategoryName(product_r7.categoryId), " ");
    \u0275\u0275advance(3);
    \u0275\u0275classProp("text-emerald-500", product_r7.status === "Active")("text-amber-500", product_r7.status === "Draft")("text-red-500", product_r7.status === "Inactive" || product_r7.status === "Discontinued");
    \u0275\u0275advance();
    \u0275\u0275classProp("bg-emerald-500", product_r7.status === "Active")("bg-amber-500", product_r7.status === "Draft")("bg-red-500", product_r7.status === "Inactive" || product_r7.status === "Discontinued");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", product_r7.status, " ");
    \u0275\u0275advance(3);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(24, _c1, product_r7.id));
    \u0275\u0275advance(3);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(26, _c0, product_r7.id));
  }
}
function MasterProductsComponent_div_42_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 50)(1, "table", 51)(2, "thead", 52)(3, "tr")(4, "th", 53);
    \u0275\u0275text(5, "#");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "th", 54);
    \u0275\u0275text(7, "\u0627\u0644\u0635\u0648\u0631\u0629");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "th", 55);
    \u0275\u0275text(9, "\u0627\u0644\u0645\u0646\u062A\u062C");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "th", 56);
    \u0275\u0275text(11, "\u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062F \u0648\u0627\u0644\u062A\u0635\u0646\u064A\u0641");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "th", 57);
    \u0275\u0275text(13, "\u0627\u0644\u062D\u0627\u0644\u0629");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "th", 57);
    \u0275\u0275text(15, "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(16, "tbody");
    \u0275\u0275template(17, MasterProductsComponent_div_42_tr_17_Template, 36, 28, "tr", 58);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(17);
    \u0275\u0275property("ngForOf", ctx_r0.products);
  }
}
function MasterProductsComponent_div_43_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 88)(1, "div", 89)(2, "div", 18)(3, "div", 90);
    \u0275\u0275element(4, "img", 91);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div", 92)(6, "h3", 93);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "p", 94);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(10, "div", 95);
    \u0275\u0275element(11, "span", 96);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "div", 97)(14, "div", 98)(15, "span", 99);
    \u0275\u0275text(16, "\u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062F");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "code", 100);
    \u0275\u0275text(18);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(19, "div", 98)(20, "span", 99);
    \u0275\u0275text(21, "\u0627\u0644\u062A\u0635\u0646\u064A\u0641");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "span", 101);
    \u0275\u0275text(23);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(24, "div", 102)(25, "button", 103);
    \u0275\u0275listener("click", function MasterProductsComponent_div_43_div_1_Template_button_click_25_listener($event) {
      \u0275\u0275restoreView(_r9);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(26, "svg", 104);
    \u0275\u0275element(27, "path", 82);
    \u0275\u0275elementEnd();
    \u0275\u0275text(28, " \u062A\u0639\u062F\u064A\u0644 ");
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(29, "button", 105);
    \u0275\u0275listener("click", function MasterProductsComponent_div_43_div_1_Template_button_click_29_listener($event) {
      \u0275\u0275restoreView(_r9);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(30, "svg", 104);
    \u0275\u0275element(31, "path", 84)(32, "path", 85);
    \u0275\u0275elementEnd();
    \u0275\u0275text(33, " \u0639\u0631\u0636 ");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const product_r10 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(27, _c0, product_r10.id));
    \u0275\u0275advance(4);
    \u0275\u0275property("src", ctx_r0.getPrimaryImage(product_r10), \u0275\u0275sanitizeUrl);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", ctx_r0.translate.currentLang === "ar" ? product_r10.nameAr : product_r10.nameEn, " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r0.translate.currentLang === "ar" ? product_r10.nameEn : product_r10.nameAr, " ");
    \u0275\u0275advance();
    \u0275\u0275classProp("bg-emerald-50", product_r10.status === "Active")("text-emerald-600", product_r10.status === "Active")("bg-amber-50", product_r10.status === "Draft")("text-amber-600", product_r10.status === "Draft")("bg-red-50", product_r10.status === "Inactive" || product_r10.status === "Discontinued")("text-red-600", product_r10.status === "Inactive" || product_r10.status === "Discontinued");
    \u0275\u0275advance();
    \u0275\u0275classProp("bg-emerald-500", product_r10.status === "Active")("bg-amber-500", product_r10.status === "Draft")("bg-red-500", product_r10.status === "Inactive" || product_r10.status === "Discontinued");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", product_r10.status, " ");
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate1(" ", product_r10.barcode || "SEC-TRK-77X", " ");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", ctx_r0.getCategoryName(product_r10.categoryId), " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(29, _c1, product_r10.id));
    \u0275\u0275advance(4);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(31, _c0, product_r10.id));
  }
}
function MasterProductsComponent_div_43_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 86);
    \u0275\u0275template(1, MasterProductsComponent_div_43_div_1_Template, 34, 33, "div", 87);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r0.products);
  }
}
function MasterProductsComponent_app_pagination_45_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-pagination", 106);
    \u0275\u0275listener("pageChange", function MasterProductsComponent_app_pagination_45_Template_app_pagination_pageChange_0_listener($event) {
      \u0275\u0275restoreView(_r11);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.changePage($event));
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275property("currentPage", ctx_r0.page)("pageSize", ctx_r0.pageSize)("totalItems", ctx_r0.totalItems);
  }
}
function MasterProductsComponent_div_46_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 107)(1, "div", 108)(2, "div", 109);
    \u0275\u0275element(3, "div", 110);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(4, "svg", 111);
    \u0275\u0275element(5, "path", 112);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(6, "h3", 113);
    \u0275\u0275text(7);
    \u0275\u0275pipe(8, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "p", 114);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "div", 115)(12, "app-button", 116);
    \u0275\u0275listener("btnClick", function MasterProductsComponent_div_46_Template_app_button_btnClick_12_listener() {
      \u0275\u0275restoreView(_r12);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.filterByCategory(null));
    });
    \u0275\u0275text(13, "Reset All Filters");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(8, 2, "PRODUCTS.NO_PRODUCTS"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r0.translate.currentLang === "ar" ? "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0646\u062A\u062C\u0627\u062A \u062D\u0627\u0644\u064A\u0627\u064B \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u062A\u0635\u0641\u064A\u062A\u0643" : "The product bank is currently quiet. Try refining your filters or create a new masterpiece to begin.");
  }
}
var MasterProductsComponent = class _MasterProductsComponent {
  route;
  catalogService;
  translate;
  isLoading = false;
  products = [];
  // Pagination & Filtering
  page = 1;
  pageSize = 8;
  totalItems = 0;
  searchTerm = "";
  searchSubject = new Subject();
  categoryId = null;
  categories = [];
  // Dropdown States
  isCategoryDropdownOpen = false;
  // View Mode
  viewMode = "bento";
  constructor(route, catalogService, translate) {
    this.route = route;
    this.catalogService = catalogService;
    this.translate = translate;
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe((term) => {
      this.searchTerm = term;
      this.page = 1;
      this.loadProducts();
    });
  }
  ngOnInit() {
    this.loadCategories();
    this.route.queryParams.subscribe((params) => {
      this.categoryId = params["categoryId"] || null;
      this.loadProducts();
    });
  }
  loadCategories() {
    this.catalogService.getCategories().subscribe({
      next: (res) => {
        const items = res.items || res || [];
        if (items.length === 0) {
          this.categories = [
            { id: "cat-food", nameEn: "Food & Beverage", nameAr: "\u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629", parentCategoryId: null, displayOrder: 1, isActive: true },
            { id: "cat-oil", nameEn: "Oils & Fats", nameAr: "\u0627\u0644\u0632\u064A\u0648\u062A \u0648\u0627\u0644\u062F\u0647\u0648\u0646", parentCategoryId: "cat-food", parentNameEn: "Food & Beverage", displayOrder: 1, isActive: true },
            { id: "cat-grains", nameEn: "Grains & Pulses", nameAr: "\u0627\u0644\u062D\u0628\u0648\u0628 \u0648\u0627\u0644\u0628\u0642\u0648\u0644\u064A\u0627\u062A", parentCategoryId: "cat-food", parentNameEn: "Food & Beverage", displayOrder: 2, isActive: true },
            { id: "cat-sweets", nameEn: "Sweets & Honey", nameAr: "\u0627\u0644\u062D\u0644\u0648\u064A\u0627\u062A \u0648\u0627\u0644\u0639\u0633\u0644", parentCategoryId: "cat-food", parentNameEn: "Food & Beverage", displayOrder: 3, isActive: true },
            { id: "cat-fashion", nameEn: "Fashion", nameAr: "\u0627\u0644\u0623\u0632\u064A\u0627\u0621", parentCategoryId: null, displayOrder: 2, isActive: true },
            { id: "cat-men", nameEn: "Men Wear", nameAr: "\u0645\u0644\u0627\u0628\u0633 \u0631\u062C\u0627\u0644\u064A", parentCategoryId: "cat-fashion", parentNameEn: "Fashion", displayOrder: 1, isActive: true }
          ];
        } else {
          this.categories = items;
        }
      }
    });
  }
  loadProducts() {
    this.isLoading = true;
    this.catalogService.getProducts(this.page, this.pageSize, this.searchTerm, this.categoryId || void 0).subscribe({
      next: (res) => {
        const items = res.items || [];
        if (items.length === 0 && !this.searchTerm) {
          const allMock = [
            { id: "p1", nameEn: "Premium Organic Olive Oil", nameAr: "\u0632\u064A\u062A \u0632\u064A\u062A\u0648\u0646 \u0639\u0636\u0648\u064A \u0641\u0627\u062E\u0631", barcode: "6221234567890", categoryId: "cat-oil", status: "Active", images: [{ masterProductId: "p1", imageBankId: "im1", displayOrder: 1, isPrimary: true, url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=800" }] },
            { id: "p2", nameEn: "Egyptian Long Grain Rice", nameAr: "\u0623\u0631\u0632 \u0645\u0635\u0631\u064A \u0637\u0648\u064A\u0644 \u0627\u0644\u062D\u0628\u0629", barcode: "6229876543210", categoryId: "cat-grains", status: "Active", images: [{ masterProductId: "p2", imageBankId: "im3", displayOrder: 1, isPrimary: true, url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=800" }] },
            { id: "p3", nameEn: "Natural Pure Honey", nameAr: "\u0639\u0633\u0644 \u0646\u062D\u0644 \u0637\u0628\u064A\u0639\u064A \u0646\u0642\u064A", barcode: "6225544332211", categoryId: "cat-sweets", status: "Draft", images: [{ masterProductId: "p3", imageBankId: "im4", displayOrder: 1, isPrimary: true, url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800" }] },
            { id: "p4", nameEn: "Handmade Pasta Rigatoni", nameAr: "\u0628\u0627\u0633\u062A\u0627 \u0631\u064A\u062C\u0627\u062A\u0648\u0646\u064A \u064A\u062F\u0648\u064A\u0629", barcode: "6220011223344", categoryId: "cat-grains", status: "Active", images: [{ masterProductId: "p6", imageBankId: "im7", displayOrder: 1, isPrimary: true, url: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800" }] },
            { id: "p5", nameEn: "Premium Cotton T-Shirt", nameAr: "\u062A\u064A\u0634\u064A\u0631\u062A \u0642\u0637\u0646 \u0641\u0627\u062E\u0631", barcode: "TS-9988-X", categoryId: "cat-men", status: "Active", images: [{ masterProductId: "p5", imageBankId: "im8", displayOrder: 1, isPrimary: true, url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800" }] },
            { id: "p6", nameEn: "Organic Dried Figs", nameAr: "\u062A\u064A\u0646 \u0645\u062C\u0641\u0641 \u0639\u0636\u0648\u064A", barcode: "6226677889900", categoryId: "cat-sweets", status: "Active", images: [{ masterProductId: "p6", imageBankId: "im9", displayOrder: 1, isPrimary: true, url: "https://images.unsplash.com/photo-1596461404969-9ae70685763a?q=80&w=800" }] },
            { id: "p7", nameEn: "Cold Pressed Sunflower Oil", nameAr: "\u0632\u064A\u062A \u0639\u0628\u0627\u062F \u0634\u0645\u0633 \u0645\u0639\u0635\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0628\u0627\u0631\u062F", barcode: "SUN-7722", categoryId: "cat-oil", status: "Inactive", images: [{ masterProductId: "p7", imageBankId: "im10", displayOrder: 1, isPrimary: true, url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=800" }] },
            { id: "p8", nameEn: "Artisanal Sourdough Crackers", nameAr: "\u0645\u0642\u0631\u0645\u0634\u0627\u062A \u0627\u0644\u0639\u062C\u064A\u0646 \u0627\u0644\u0645\u062E\u0645\u0631 \u0627\u0644\u062D\u0631\u0641\u064A\u0629", barcode: "622883311", categoryId: "cat-grains", status: "Active", images: [{ masterProductId: "p8", imageBankId: "im11", displayOrder: 1, isPrimary: true, url: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?q=80&w=800" }] },
            { id: "p9", nameEn: "Fresh Organic Milk", nameAr: "\u062D\u0644\u064A\u0628 \u0639\u0636\u0648\u064A \u0637\u0627\u0632\u062C", barcode: "62211223344", categoryId: "cat-food", status: "Active", images: [{ masterProductId: "p9", imageBankId: "im12", displayOrder: 1, isPrimary: true, url: "https://images.unsplash.com/photo-1550583724-125581976703?q=80&w=800" }] },
            { id: "p10", nameEn: "Whole Grain Bread", nameAr: "\u062E\u0628\u0632 \u0627\u0644\u062D\u0628\u0648\u0628 \u0627\u0644\u0643\u0627\u0645\u0644\u0629", barcode: "62255667788", categoryId: "cat-food", status: "Active", images: [{ masterProductId: "p10", imageBankId: "im13", displayOrder: 1, isPrimary: true, url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800" }] },
            { id: "p11", nameEn: "Natural Fruit Mix", nameAr: "\u0645\u0632\u064A\u062C \u0641\u0648\u0627\u0643\u0647 \u0637\u0628\u064A\u0639\u064A", barcode: "62299887766", categoryId: "cat-sweets", status: "Active", images: [{ masterProductId: "p11", imageBankId: "im14", displayOrder: 1, isPrimary: true, url: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?q=80&w=800" }] },
            { id: "p12", nameEn: "Premium Coffee Beans", nameAr: "\u062D\u0628\u0648\u0628 \u0628\u0646 \u0641\u0627\u062E\u0631\u0629", barcode: "62200998877", categoryId: "cat-food", status: "Active", images: [{ masterProductId: "p12", imageBankId: "im15", displayOrder: 1, isPrimary: true, url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800" }] }
          ];
          this.totalItems = allMock.length;
          const start = (this.page - 1) * this.pageSize;
          this.products = allMock.slice(start, start + this.pageSize);
        } else {
          this.products = items;
          this.totalItems = res.totalCount || 0;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }
  getCategoryName(categoryId) {
    if (!categoryId)
      return "";
    const cat = this.categories.find((c) => c.id === categoryId);
    if (!cat)
      return "";
    const name = this.translate.currentLang === "ar" ? cat.nameAr : cat.nameEn;
    return name || cat.nameEn || cat.nameAr || "";
  }
  getParentCategoryName(categoryId) {
    if (!categoryId)
      return "";
    const cat = this.categories.find((c) => c.id === categoryId);
    if (!cat)
      return "";
    if (cat.parentCategoryId) {
      const parent = this.categories.find((c) => c.id === cat.parentCategoryId);
      if (parent) {
        const pName = this.translate.currentLang === "ar" ? parent.nameAr : parent.nameEn;
        return pName || parent.nameEn || parent.nameAr || "";
      }
    }
    const fallbackName = this.translate.currentLang === "ar" ? cat.parentNameAr : cat.parentNameEn;
    return fallbackName || cat.parentNameEn || cat.parentNameAr || "";
  }
  getPrimaryImage(product) {
    return product.images?.find((i) => i.isPrimary)?.url || "assets/images/placeholder-product.png";
  }
  onSearch(event) {
    this.searchSubject.next(event.target.value);
  }
  changePage(newPage) {
    if (newPage < 1 || newPage > this.totalPages)
      return;
    this.page = newPage;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  filterByCategory(id) {
    this.categoryId = id;
    this.page = 1;
    this.loadProducts();
  }
  get totalPages() {
    return Math.ceil(this.totalItems / this.pageSize);
  }
  setViewMode(mode) {
    const view = mode;
    this.viewMode = view;
    this.pageSize = view === "bento" ? 8 : 10;
    this.page = 1;
    this.loadProducts();
  }
  static \u0275fac = function MasterProductsComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MasterProductsComponent)(\u0275\u0275directiveInject(ActivatedRoute), \u0275\u0275directiveInject(CatalogService), \u0275\u0275directiveInject(TranslateService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _MasterProductsComponent, selectors: [["app-master-products"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 47, vars: 30, consts: [[1, "h-full", "flex", "flex-col", "bg-slate-50/50", "font-sans", "pb-10", "overflow-hidden"], [1, "px-4", "md:px-10", "pt-8", "pb-4", "flex", "flex-col", "sm:flex-row", "items-start", "sm:items-end", "justify-between", "gap-6"], [1, "text-start", "w-full", "sm:w-auto", "space-y-1", "animate-in", "slide-in-from-right-10", "duration-700"], [1, "flex", "justify-start", "items-center", "gap-2", "text-[10px]", "sm:text-[11px]", "font-bold", "text-zadna-primary/80", "uppercase", "tracking-widest", "mb-1.5"], [1, "w-1", "h-1", "rounded-full", "bg-zadna-primary/20"], [1, "text-zadna-primary"], [1, "text-xl", "sm:text-2xl", "font-black", "text-slate-900", "tracking-tight", "leading-tight"], [1, "text-[10px]", "sm:text-[12px]", "font-medium", "text-slate-400", "max-w-md"], [1, "flex", "items-center", "gap-4", "animate-in", "slide-in-from-left-10", "duration-700"], [1, "relative"], [1, "flex", "items-center", "justify-between", "gap-3", "bg-white/70", "backdrop-blur-xl", "border", "border-slate-200/60", "rounded-xl", "px-4", "py-2.5", "min-w-[140px]", "text-[10px]", "font-black", "uppercase", "tracking-widest", "text-slate-500", "focus:ring-2", "focus:ring-zadna-primary/20", "outline-none", "transition-all", "shadow-sm", "cursor-pointer", "hover:border-zadna-primary/30", "hover:bg-white/90", 3, "click"], [1, "truncate", "max-w-[150px]"], [4, "ngIf"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "text-slate-400", "transition-transform", "duration-300"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M19 9l-7 7-7-7"], ["class", "fixed inset-0 z-40", 3, "click", 4, "ngIf"], ["class", "absolute top-12 ltr:right-0 rtl:left-0 z-50 w-56 bg-white/90 backdrop-blur-3xl border border-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200", 4, "ngIf"], ["routerLink", "/catalog/products/create", "variant", "primary", "customClass", "rounded-[1.5rem] shadow-2xl shadow-zadna-primary/20 hover:scale-105 transition-all transform px-8 py-3.5 group"], [1, "flex", "items-center", "gap-3"], [1, "w-8", "h-8", "rounded-xl", "bg-white/20", "flex", "items-center", "justify-center", "group-hover:rotate-90", "transition-transform", "duration-500"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "text-white"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "3", "d", "M12 4v16m8-8H4"], [1, "font-black", "uppercase", "tracking-[0.1em]", "text-xs", "sm:text-sm"], [1, "flex-1", "min-h-0", "px-4", "md:px-10", "py-6", "max-w-[120rem]", "mx-auto", "w-full", "space-y-6"], [1, "flex", "flex-col", "sm:flex-row", "items-center", "gap-4"], [1, "flex-1", "w-full", "max-w-md"], [3, "input", "placeholder", "dir", "inputClass", "customClass", "hasIcon"], ["icon", "", "fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "text-zadna-primary/60"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"], ["class", "flex flex-col items-center justify-center py-40 animate-pulse", 4, "ngIf"], ["class", "hidden md:block extraordinary-table-container w-full overflow-x-auto animate-in fade-in slide-in-from-bottom-10 duration-1000", 4, "ngIf"], ["class", "md:hidden space-y-4 animate-in fade-in slide-in-from-bottom-10 duration-1000", 4, "ngIf"], [1, "pt-6", "animate-in", "fade-in", "duration-1000", "slide-in-from-bottom-5"], [3, "currentPage", "pageSize", "totalItems", "pageChange", 4, "ngIf"], ["class", "relative p-20 text-center animate-in zoom-in duration-700", 4, "ngIf"], [1, "fixed", "inset-0", "z-40", 3, "click"], [1, "absolute", "top-12", "ltr:right-0", "rtl:left-0", "z-50", "w-56", "bg-white/90", "backdrop-blur-3xl", "border", "border-slate-100", "rounded-2xl", "shadow-2xl", "flex", "flex-col", "overflow-hidden", "animate-in", "fade-in", "slide-in-from-top-2", "duration-200"], [1, "flex", "items-center", "justify-between", "w-full", "px-4", "py-3", "text-start", "hover:bg-slate-50", "transition-colors", "group", 3, "click"], [1, "text-[10px]", "font-black", "uppercase", "tracking-widest", "text-slate-600", "group-hover:text-zadna-primary"], ["class", "w-4 h-4 text-emerald-500", "fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 4, "ngIf"], [1, "h-px", "bg-slate-100", "w-full", "mx-auto"], [1, "max-h-64", "overflow-y-auto", "custom-scrollbar"], ["class", "flex items-center justify-between w-full px-4 py-3 text-start hover:bg-slate-50 transition-colors group", 3, "click", 4, "ngFor", "ngForOf"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "text-emerald-500"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "3", "d", "M5 13l4 4L19 7"], [1, "text-[10px]", "font-black", "text-slate-600", "truncate", "group-hover:text-zadna-primary"], [1, "flex", "flex-col", "items-center", "justify-center", "py-40", "animate-pulse"], [1, "relative", "w-24", "h-24"], [1, "absolute", "inset-0", "rounded-full", "border-[6px]", "border-zadna-primary/10"], [1, "absolute", "inset-0", "rounded-full", "border-[6px]", "border-t-zadna-primary", "animate-spin"], [1, "hidden", "md:block", "extraordinary-table-container", "w-full", "overflow-x-auto", "animate-in", "fade-in", "slide-in-from-bottom-10", "duration-1000"], [1, "w-full", "table-fixed", "border-separate", "border-spacing-y-0"], [1, "border-b", "border-slate-100/50"], [1, "text-center", "w-[5%]", "py-5", "text-[10px]", "font-black", "uppercase", "text-slate-400/70", "tracking-tighter"], [1, "text-center", "w-[8%]", "py-5", "text-[10px]", "font-black", "uppercase", "text-slate-400/70", "tracking-tighter"], [1, "text-start", "w-[27%]", "py-5", "text-[10px]", "font-black", "uppercase", "text-slate-400/70", "tracking-tighter", "px-2"], [1, "text-center", "w-[20%]", "py-5", "text-[10px]", "font-black", "uppercase", "text-slate-400/70", "tracking-tighter"], [1, "text-center", "w-[15%]", "py-5", "text-[10px]", "font-black", "uppercase", "text-slate-400/70", "tracking-tighter"], ["class", "group bg-white/50 hover:bg-white transition-all duration-500 border-b border-slate-100/60 cursor-pointer", 3, "routerLink", 4, "ngFor", "ngForOf"], [1, "group", "bg-white/50", "hover:bg-white", "transition-all", "duration-500", "border-b", "border-slate-100/60", "cursor-pointer", 3, "routerLink"], [1, "text-center", "align-middle", "py-4", "w-[5%]"], [1, "text-[10px]", "sm:text-[11px]", "font-black", "text-slate-300"], [1, "text-center", "align-middle", "py-4", "w-[8%]"], [1, "flex", "justify-center"], [1, "relative", "w-12", "h-12", "bg-[#f0f9fa]/80", "rounded-[1.2rem]", "border", "border-[#e0f2f4]", "flex", "items-center", "justify-center", "transition-all", "group-hover:scale-105", "group-hover:rotate-2", "shadow-sm", "overflow-hidden"], [1, "w-full", "h-full", "object-cover", "transition-transform", "duration-500", "group-hover:scale-110", 3, "src"], [1, "absolute", "-top-1", "-right-1", "w-2.5", "h-2.5", "bg-white", "border-2", "border-[#e0f2f4]", "rounded-full", "shadow-sm"], [1, "align-middle", "py-4", "w-[27%]", "px-2"], [1, "flex", "flex-col", "text-start"], [1, "text-[13px]", "sm:text-[14px]", "font-black", "text-slate-900", "group-hover:text-zadna-primary", "transition-colors", "leading-snug", "truncate"], [1, "text-[9px]", "font-bold", "text-slate-400/80", "uppercase", "tracking-widest", "mt-0.5", "truncate"], [1, "text-center", "align-middle", "py-4", "w-[20%]"], [1, "flex", "flex-col", "items-center", "gap-1.5"], [1, "text-[10px]", "font-bold", "text-indigo-500", "bg-indigo-50/50", "px-3", "py-1", "rounded-xl", "border", "border-indigo-100/50", "uppercase", "tracking-wider"], [1, "text-[9px]", "font-black", "text-zadna-primary", "uppercase", "px-1.5", "py-0.5", "rounded-md", "bg-zadna-primary/5", "border", "border-zadna-primary/10"], [1, "text-center", "align-middle", "py-4", "w-[15%]"], [1, "inline-flex", "items-center", "gap-2", "px-3", "py-1.5", "rounded-full", "border", "border-slate-50", "bg-white", "shadow-sm"], [1, "w-1.5", "h-1.5", "rounded-full", "animate-pulse"], [1, "text-[10px]", "font-black", "tracking-tight", "uppercase"], [1, "flex", "justify-center", "gap-1.5"], [1, "w-8", "h-8", "rounded-xl", "bg-slate-50", "text-slate-400", "flex", "items-center", "justify-center", "hover:bg-zadna-primary", "hover:text-white", "transition-all", 3, "click", "routerLink"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"], [1, "w-8", "h-8", "rounded-xl", "bg-slate-50", "text-slate-400", "flex", "items-center", "justify-center", "hover:bg-blue-500", "hover:text-white", "transition-all", 3, "click", "routerLink"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15 12a3 3 0 11-6 0 3 3 0 016 0z"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"], [1, "md:hidden", "space-y-4", "animate-in", "fade-in", "slide-in-from-bottom-10", "duration-1000"], ["class", "bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer", 3, "routerLink", 4, "ngFor", "ngForOf"], [1, "bg-white/80", "backdrop-blur-sm", "rounded-2xl", "border", "border-slate-200/60", "p-4", "shadow-sm", "hover:shadow-md", "transition-all", "cursor-pointer", 3, "routerLink"], [1, "flex", "items-start", "justify-between", "mb-3"], [1, "relative", "w-12", "h-12", "bg-[#f0f9fa]/80", "rounded-xl", "border", "border-[#e0f2f4]", "flex", "items-center", "justify-center", "overflow-hidden"], [1, "w-full", "h-full", "object-cover", 3, "src"], [1, "flex-1"], [1, "text-sm", "font-bold", "text-slate-900", "truncate"], [1, "text-xs", "text-slate-500", "truncate"], [1, "inline-flex", "items-center", "gap-1.5", "px-2.5", "py-1", "rounded-full", "text-xs", "font-bold"], [1, "w-1", "h-1", "rounded-full"], [1, "space-y-2", "mb-4"], [1, "flex", "items-center", "justify-between"], [1, "text-xs", "text-slate-500"], [1, "text-xs", "font-bold", "text-indigo-600", "bg-indigo-50", "px-2", "py-1", "rounded"], [1, "text-xs", "font-bold", "text-zadna-primary"], [1, "flex", "gap-2", "pt-3", "border-t", "border-slate-100"], [1, "flex-1", "flex", "items-center", "justify-center", "gap-2", "py-2", "px-3", "bg-slate-50", "text-slate-600", "rounded-lg", "text-xs", "font-medium", "hover:bg-zadna-primary", "hover:text-white", "transition-all", 3, "click", "routerLink"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3.5", "h-3.5"], [1, "flex-1", "flex", "items-center", "justify-center", "gap-2", "py-2", "px-3", "bg-slate-50", "text-slate-600", "rounded-lg", "text-xs", "font-medium", "hover:bg-blue-500", "hover:text-white", "transition-all", 3, "click", "routerLink"], [3, "pageChange", "currentPage", "pageSize", "totalItems"], [1, "relative", "p-20", "text-center", "animate-in", "zoom-in", "duration-700"], [1, "max-w-md", "mx-auto", "space-y-6"], [1, "w-32", "h-32", "bg-white", "rounded-[3rem]", "shadow-2xl", "flex", "items-center", "justify-center", "mx-auto", "text-slate-100", "relative", "group"], [1, "absolute", "inset-0", "bg-zadna-primary/5", "rounded-[3rem]", "group-hover:scale-110", "transition-transform", "duration-500"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-16", "h-16", "relative", "z-10"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"], [1, "text-3xl", "font-black", "text-slate-900", "tracking-tight"], [1, "text-sm", "font-bold", "text-slate-400", "leading-relaxed"], [1, "pt-6"], ["variant", "ghost", "customClass", "bg-slate-50 border border-slate-100 rounded-2xl px-8", 3, "btnClick"]], template: function MasterProductsComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "nav", 3)(4, "span");
      \u0275\u0275text(5);
      \u0275\u0275pipe(6, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275element(7, "span", 4);
      \u0275\u0275elementStart(8, "span", 5);
      \u0275\u0275text(9);
      \u0275\u0275pipe(10, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(11, "h1", 6);
      \u0275\u0275text(12);
      \u0275\u0275pipe(13, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "p", 7);
      \u0275\u0275text(15, " \u0625\u062F\u0627\u0631\u0629 \u062F\u0644\u064A\u0644 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0648\u062A\u0635\u0646\u064A\u0641\u0627\u062A \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0648\u062A\u062A\u0628\u0639 \u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062F \u0648\u0627\u0644\u062D\u0627\u0644\u0627\u062A ");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(16, "div", 8)(17, "div", 9)(18, "button", 10);
      \u0275\u0275listener("click", function MasterProductsComponent_Template_button_click_18_listener() {
        return ctx.isCategoryDropdownOpen = !ctx.isCategoryDropdownOpen;
      });
      \u0275\u0275elementStart(19, "span", 11);
      \u0275\u0275template(20, MasterProductsComponent_ng_container_20_Template, 3, 3, "ng-container", 12)(21, MasterProductsComponent_ng_container_21_Template, 2, 1, "ng-container", 12);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(22, "svg", 13);
      \u0275\u0275element(23, "path", 14);
      \u0275\u0275elementEnd()();
      \u0275\u0275template(24, MasterProductsComponent_div_24_Template, 1, 0, "div", 15)(25, MasterProductsComponent_div_25_Template, 9, 5, "div", 16);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(26, "app-button", 17)(27, "div", 18)(28, "div", 19);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(29, "svg", 20);
      \u0275\u0275element(30, "path", 21);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(31, "span", 22);
      \u0275\u0275text(32);
      \u0275\u0275pipe(33, "translate");
      \u0275\u0275elementEnd()()()()();
      \u0275\u0275elementStart(34, "div", 23)(35, "div", 24)(36, "div", 25)(37, "app-input", 26);
      \u0275\u0275pipe(38, "translate");
      \u0275\u0275listener("input", function MasterProductsComponent_Template_app_input_input_37_listener($event) {
        return ctx.onSearch($event);
      });
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(39, "svg", 27);
      \u0275\u0275element(40, "path", 28);
      \u0275\u0275elementEnd()()()();
      \u0275\u0275template(41, MasterProductsComponent_div_41_Template, 4, 0, "div", 29)(42, MasterProductsComponent_div_42_Template, 18, 1, "div", 30)(43, MasterProductsComponent_div_43_Template, 2, 1, "div", 31);
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(44, "div", 32);
      \u0275\u0275template(45, MasterProductsComponent_app_pagination_45_Template, 1, 3, "app-pagination", 33);
      \u0275\u0275elementEnd();
      \u0275\u0275template(46, MasterProductsComponent_div_46_Template, 14, 4, "div", 34);
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 20, "SIDEBAR.CATALOG"));
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(10, 22, "PRODUCTS.TITLE"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(13, 24, "PRODUCTS.TITLE"), " \u0648\u0627\u0644\u0633\u0644\u0639 ");
      \u0275\u0275advance(8);
      \u0275\u0275property("ngIf", !ctx.categoryId);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.categoryId);
      \u0275\u0275advance();
      \u0275\u0275classProp("rotate-180", ctx.isCategoryDropdownOpen);
      \u0275\u0275advance(2);
      \u0275\u0275property("ngIf", ctx.isCategoryDropdownOpen);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.isCategoryDropdownOpen);
      \u0275\u0275advance(7);
      \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(33, 26, "PRODUCTS.ADD"), " \u0645\u0646\u062A\u062C");
      \u0275\u0275advance(5);
      \u0275\u0275property("placeholder", \u0275\u0275pipeBind1(38, 28, "PRODUCTS.SEARCH_PLACEHOLDER"))("dir", ctx.translate.currentLang === "ar" ? "rtl" : "ltr")("inputClass", "!bg-transparent !border-0 !ring-0 !text-zadna-primary !placeholder-zadna-primary/40")("customClass", "bg-white/70 backdrop-blur-xl border border-slate-200/60 focus-within:bg-white focus-within:border-zadna-primary/50 focus-within:shadow-[0_8px_30px_-5px_rgba(18,124,140,0.15)] hover:bg-white/80 transition-all shadow-sm rounded-[1.5rem] overflow-hidden")("hasIcon", true);
      \u0275\u0275advance(4);
      \u0275\u0275property("ngIf", ctx.isLoading);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.isLoading && ctx.products.length > 0);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.isLoading && ctx.products.length > 0);
      \u0275\u0275advance(2);
      \u0275\u0275property("ngIf", !ctx.isLoading && ctx.products.length > 0);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.isLoading && ctx.products.length === 0);
    }
  }, dependencies: [
    CommonModule,
    NgForOf,
    NgIf,
    FormsModule,
    TranslateModule,
    TranslatePipe,
    RouterModule,
    RouterLink,
    AppButtonComponent,
    AppInputComponent,
    AppPaginationComponent
  ], styles: ['\n\n[_nghost-%COMP%] {\n  display: block;\n  perspective: 2000px;\n}\n.filter-pill[_ngcontent-%COMP%] {\n  padding: 10px 24px;\n  border-radius: 9999px;\n  font-size: 11px;\n  font-weight: 900;\n  text-transform: uppercase;\n  letter-spacing: 0.15em;\n  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);\n  background: white;\n  border: 1px solid rgba(0, 0, 0, 0.05);\n  color: #64748b;\n  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);\n}\n.filter-pill[_ngcontent-%COMP%]:hover {\n  border-color: rgba(18, 124, 140, 0.2);\n  color: #127c8c;\n  transform: translateY(-1px);\n}\n.filter-pill.active[_ngcontent-%COMP%] {\n  background: #127c8c;\n  color: white;\n  border-color: #127c8c;\n  box-shadow: 0 10px 20px rgba(18, 124, 140, 0.2);\n}\n@keyframes _ngcontent-%COMP%_scale-in {\n  from {\n    opacity: 0;\n    transform: scale(0.95);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1);\n  }\n}\n.animate-scale-in[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_scale-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;\n}\n.stagger-items[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%] {\n  opacity: 0;\n}\n.stagger-items[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%]:nth-child(1) {\n  animation: _ngcontent-%COMP%_scale-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0s forwards;\n}\n.stagger-items[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%]:nth-child(2) {\n  animation: _ngcontent-%COMP%_scale-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.08s forwards;\n}\n.stagger-items[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%]:nth-child(3) {\n  animation: _ngcontent-%COMP%_scale-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.16s forwards;\n}\n.stagger-items[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%]:nth-child(4) {\n  animation: _ngcontent-%COMP%_scale-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.24s forwards;\n}\n.extraordinary-table-container[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.4);\n  backdrop-filter: blur(20px);\n  border-radius: 2.5rem;\n  border: 1px solid rgba(255, 255, 255, 0.5);\n  overflow: hidden;\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.03);\n}\n.extraordinary-table-container[_ngcontent-%COMP%]   table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: separate;\n  border-spacing: 0;\n}\n.extraordinary-table-container[_ngcontent-%COMP%]   table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  padding: 24px 32px;\n  font-size: 10px;\n  font-weight: 900;\n  text-transform: uppercase;\n  letter-spacing: 0.2em;\n  color: #94a3b8;\n  border-bottom: 1px solid rgba(0, 0, 0, 0.03);\n  text-align: start;\n}\n.extraordinary-table-container[_ngcontent-%COMP%]   table[_ngcontent-%COMP%]   tr.table-row-object[_ngcontent-%COMP%] {\n  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);\n  position: relative;\n}\n.extraordinary-table-container[_ngcontent-%COMP%]   table[_ngcontent-%COMP%]   tr.table-row-object[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 20px 32px;\n  background: transparent;\n  border-bottom: 1px solid rgba(0, 0, 0, 0.02);\n  vertical-align: middle;\n}\n.extraordinary-table-container[_ngcontent-%COMP%]   table[_ngcontent-%COMP%]   tr.table-row-object[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.8);\n  transform: scale(1.005);\n  box-shadow: 0 10px 30px rgba(18, 124, 140, 0.05);\n  z-index: 10;\n}\n.extraordinary-table-container[_ngcontent-%COMP%]   table[_ngcontent-%COMP%]   tr.table-row-object[_ngcontent-%COMP%]:hover   .table-image-preview[_ngcontent-%COMP%] {\n  transform: scale(1.1);\n  filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.1));\n}\n.extraordinary-table-container[_ngcontent-%COMP%]   table[_ngcontent-%COMP%]   tr.table-row-object[_ngcontent-%COMP%]:last-child   td[_ngcontent-%COMP%] {\n  border-bottom: none;\n}\n.table-image-preview[_ngcontent-%COMP%] {\n  width: 64px;\n  height: 64px;\n  border-radius: 1rem;\n  background: white;\n  padding: 8px;\n  object-fit: contain;\n  transition: transform 0.4s ease;\n  border: 1px solid rgba(0, 0, 0, 0.03);\n}\n.stagger-rows[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%] {\n  opacity: 0;\n}\n.stagger-rows[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:nth-child(1) {\n  animation: _ngcontent-%COMP%_scale-in 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0s forwards;\n}\n.stagger-rows[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:nth-child(2) {\n  animation: _ngcontent-%COMP%_scale-in 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.05s forwards;\n}\n.stagger-rows[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:nth-child(3) {\n  animation: _ngcontent-%COMP%_scale-in 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.1s forwards;\n}\n.stagger-rows[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:nth-child(4) {\n  animation: _ngcontent-%COMP%_scale-in 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.15s forwards;\n}\n.stagger-rows[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:nth-child(5) {\n  animation: _ngcontent-%COMP%_scale-in 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.2s forwards;\n}\n.stagger-rows[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:nth-child(6) {\n  animation: _ngcontent-%COMP%_scale-in 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.25s forwards;\n}\n.stagger-rows[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:nth-child(7) {\n  animation: _ngcontent-%COMP%_scale-in 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.3s forwards;\n}\n.stagger-rows[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:nth-child(8) {\n  animation: _ngcontent-%COMP%_scale-in 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.35s forwards;\n}\n.extraordinary-bento-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n  gap: 1.5rem;\n  perspective: 2000px;\n}\n@media (min-width: 640px) {\n  .extraordinary-bento-grid[_ngcontent-%COMP%] {\n    gap: 2.5rem;\n  }\n}\n.extraordinary-bento-grid[_ngcontent-%COMP%]   .quantum-card[_ngcontent-%COMP%] {\n  position: relative;\n  background: rgba(255, 255, 255, 0.7);\n  backdrop-filter: blur(30px) saturate(180%);\n  border-radius: 3rem;\n  border: 1px solid rgba(255, 255, 255, 0.4);\n  padding: 1.5rem;\n  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);\n  cursor: pointer;\n  transform-style: preserve-3d;\n  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02), inset 0 0 0 1px rgba(255, 255, 255, 0.5);\n}\n.extraordinary-bento-grid[_ngcontent-%COMP%]   .quantum-card[_ngcontent-%COMP%]::before {\n  content: "";\n  position: absolute;\n  inset: 0;\n  background:\n    radial-gradient(\n      circle at var(--mouse-x, 50%) var(--mouse-y, 50%),\n      rgba(18, 124, 140, 0.1),\n      transparent 70%);\n  opacity: 0;\n  transition: opacity 0.5s ease;\n  pointer-events: none;\n  border-radius: inherit;\n  z-index: 10;\n}\n.extraordinary-bento-grid[_ngcontent-%COMP%]   .quantum-card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-15px) rotateX(4deg) scale(1.02);\n  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(18, 124, 140, 0.1);\n  background: white;\n}\n.extraordinary-bento-grid[_ngcontent-%COMP%]   .quantum-card[_ngcontent-%COMP%]:hover::before {\n  opacity: 1;\n}\n.extraordinary-bento-grid[_ngcontent-%COMP%]   .quantum-card[_ngcontent-%COMP%]:hover   .quantum-image-chamber[_ngcontent-%COMP%] {\n  transform: translateZ(40px);\n  background: white;\n  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);\n}\n.extraordinary-bento-grid[_ngcontent-%COMP%]   .quantum-card[_ngcontent-%COMP%]:hover   .quantum-image-chamber[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  transform: scale(1.1) rotate(2deg);\n}\n.extraordinary-bento-grid[_ngcontent-%COMP%]   .quantum-card[_ngcontent-%COMP%]:hover   .quantum-image-chamber[_ngcontent-%COMP%]   .tech-badge[_ngcontent-%COMP%] {\n  opacity: 1;\n  transform: translateZ(20px);\n}\n.extraordinary-bento-grid[_ngcontent-%COMP%]   .quantum-card[_ngcontent-%COMP%]:hover   .quantum-info-slab[_ngcontent-%COMP%] {\n  transform: translateZ(20px);\n}\n.quantum-image-chamber[_ngcontent-%COMP%] {\n  width: 100%;\n  aspect-ratio: 1.2;\n  background: #fcfdfe;\n  border-radius: 2.5rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 3rem;\n  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);\n  position: relative;\n  overflow: hidden;\n  transform: translateZ(0);\n}\n.quantum-image-chamber[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  max-width: 90%;\n  max-height: 90%;\n  object-fit: contain;\n  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);\n  filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.1));\n}\n.quantum-image-chamber[_ngcontent-%COMP%]   .tech-badge[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 1.5rem;\n  left: 1.5rem;\n  opacity: 0.8;\n  transition: all 0.4s ease;\n  z-index: 20;\n}\n.quantum-info-slab[_ngcontent-%COMP%] {\n  padding: 2rem 1rem 0.5rem;\n  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);\n  transform: translateZ(0);\n}\n.quantum-info-slab[_ngcontent-%COMP%]   .stamp-id[_ngcontent-%COMP%] {\n  font-family:\n    "JetBrains Mono",\n    "Roboto Mono",\n    monospace;\n  font-size: 9px;\n  font-weight: 900;\n  color: #94a3b8;\n  letter-spacing: 0.3em;\n  margin-bottom: 0.5rem;\n  display: block;\n}\n.quantum-info-slab[_ngcontent-%COMP%]   .quantum-title[_ngcontent-%COMP%] {\n  font-size: 1.25rem;\n  font-weight: 950;\n  color: #0f172a;\n  line-height: 1.2;\n  margin-bottom: 1rem;\n  letter-spacing: -0.02em;\n}\n.action-nexus[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding-top: 1.5rem;\n  border-top: 1px solid rgba(0, 0, 0, 0.03);\n  margin-top: 0.5rem;\n}\n.action-nexus[_ngcontent-%COMP%]   .nexus-stats[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n.action-nexus[_ngcontent-%COMP%]   .nexus-stats[_ngcontent-%COMP%]   .stat-label[_ngcontent-%COMP%] {\n  font-size: 8px;\n  font-weight: 900;\n  color: #cbd5e1;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n}\n.action-nexus[_ngcontent-%COMP%]   .nexus-stats[_ngcontent-%COMP%]   .stat-value[_ngcontent-%COMP%] {\n  font-size: 11px;\n  font-weight: 700;\n  color: #64748b;\n}\n.quantum-card[_ngcontent-%COMP%] {\n  opacity: 0;\n}\n.quantum-card[_ngcontent-%COMP%]:nth-child(1) {\n  animation: _ngcontent-%COMP%_scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0s forwards;\n}\n.quantum-card[_ngcontent-%COMP%]:nth-child(2) {\n  animation: _ngcontent-%COMP%_scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;\n}\n.quantum-card[_ngcontent-%COMP%]:nth-child(3) {\n  animation: _ngcontent-%COMP%_scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;\n}\n.quantum-card[_ngcontent-%COMP%]:nth-child(4) {\n  animation: _ngcontent-%COMP%_scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;\n}\n.quantum-card[_ngcontent-%COMP%]:nth-child(5) {\n  animation: _ngcontent-%COMP%_scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;\n}\n.quantum-card[_ngcontent-%COMP%]:nth-child(6) {\n  animation: _ngcontent-%COMP%_scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards;\n}\n.quantum-card[_ngcontent-%COMP%]:nth-child(7) {\n  animation: _ngcontent-%COMP%_scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;\n}\n.quantum-card[_ngcontent-%COMP%]:nth-child(8) {\n  animation: _ngcontent-%COMP%_scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards;\n}\n.quantum-card[_ngcontent-%COMP%]:nth-child(9) {\n  animation: _ngcontent-%COMP%_scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.8s forwards;\n}\n.quantum-card[_ngcontent-%COMP%]:nth-child(10) {\n  animation: _ngcontent-%COMP%_scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.9s forwards;\n}\n.quantum-card[_ngcontent-%COMP%]:nth-child(11) {\n  animation: _ngcontent-%COMP%_scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1s forwards;\n}\n.quantum-card[_ngcontent-%COMP%]:nth-child(12) {\n  animation: _ngcontent-%COMP%_scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.1s forwards;\n}\n/*# sourceMappingURL=master-products.component.css.map */', "\n\ntable[_ngcontent-%COMP%] {\n  border-collapse: separate !important;\n  border-spacing: 0 !important;\n  table-layout: fixed !important;\n}\nthead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  position: sticky;\n  top: 0;\n  background: white;\n  z-index: 10;\n}\ntbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.5);\n}\ntbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover {\n  background: white;\n}\ntd[_ngcontent-%COMP%], \nth[_ngcontent-%COMP%] {\n  vertical-align: middle !important;\n  text-align: center !important;\n}\ntd[_ngcontent-%COMP%]:first-child, \nth[_ngcontent-%COMP%]:first-child {\n  text-align: center !important;\n}\ntd[_ngcontent-%COMP%]:nth-child(3), \nth[_ngcontent-%COMP%]:nth-child(3) {\n  text-align: start !important;\n}\n/*# sourceMappingURL=master-products.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(MasterProductsComponent, { className: "MasterProductsComponent", filePath: "src\\app\\features\\catalog\\master-products\\master-products.component.ts", lineNumber: 68 });
})();
export {
  MasterProductsComponent
};
//# sourceMappingURL=chunk-AD65KAEI.js.map
