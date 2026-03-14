import {
  CategoryFormModalComponent,
  DeleteConfirmationModalComponent
} from "./chunk-FEV6Q277.js";
import {
  AppPaginationComponent
} from "./chunk-LI5G6AB4.js";
import "./chunk-J7OIUMD3.js";
import "./chunk-QQC6B7P6.js";
import "./chunk-H5RLU432.js";
import "./chunk-E66AVT3J.js";
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
  Router
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
  __spreadProps,
  __spreadValues,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵclassProp,
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
  ɵɵpipeBind1,
  ɵɵproperty,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-IPPBI3AG.js";

// src/app/features/catalog/categories-manager/categories-manager.component.ts
function CategoriesManagerComponent_div_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 22)(1, "div", 23);
    \u0275\u0275element(2, "div", 24)(3, "div", 25);
    \u0275\u0275elementEnd()();
  }
}
function CategoriesManagerComponent_div_24_tr_17_img_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 68);
  }
  if (rf & 2) {
    const item_r2 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("src", item_r2.imageUrl, \u0275\u0275sanitizeUrl)("alt", item_r2.nameEn);
  }
}
function CategoriesManagerComponent_div_24_tr_17_div_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 69);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(1, "svg", 70);
    \u0275\u0275element(2, "path", 71);
    \u0275\u0275elementEnd()();
  }
}
function CategoriesManagerComponent_div_24_tr_17_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr", 36);
    \u0275\u0275listener("click", function CategoriesManagerComponent_div_24_tr_17_Template_tr_click_0_listener() {
      const item_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.selectItem(item_r2));
    });
    \u0275\u0275elementStart(1, "td", 37)(2, "span", 38);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "td", 39)(5, "div", 40)(6, "div", 41);
    \u0275\u0275template(7, CategoriesManagerComponent_div_24_tr_17_img_7_Template, 1, 2, "img", 42)(8, CategoriesManagerComponent_div_24_tr_17_div_8_Template, 3, 0, "div", 43);
    \u0275\u0275element(9, "div", 44);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "div", 45)(11, "span", 46);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "span", 47);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(15, "td", 48)(16, "div", 49)(17, "span", 50);
    \u0275\u0275text(18);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "span", 51);
    \u0275\u0275text(20);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(21, "td", 52)(22, "span", 53);
    \u0275\u0275text(23, "\u0639\u062F\u062F \u0627\u0644\u0639\u0646\u0627\u0635\u0631");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "div", 54)(25, "span", 55);
    \u0275\u0275text(26);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(27, "td", 52)(28, "span", 53);
    \u0275\u0275text(29, "\u0627\u0644\u062D\u0627\u0644\u0629");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(30, "div", 56);
    \u0275\u0275element(31, "span", 57);
    \u0275\u0275elementStart(32, "span", 58);
    \u0275\u0275text(33);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(34, "td", 59)(35, "div", 60)(36, "button", 61);
    \u0275\u0275listener("click", function CategoriesManagerComponent_div_24_tr_17_Template_button_click_36_listener($event) {
      const item_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.viewDetails(item_r2, $event));
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(37, "svg", 62);
    \u0275\u0275element(38, "path", 63)(39, "path", 64);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(40, "button", 61);
    \u0275\u0275listener("click", function CategoriesManagerComponent_div_24_tr_17_Template_button_click_40_listener($event) {
      const item_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.openEditModal(item_r2, $event));
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(41, "svg", 62);
    \u0275\u0275element(42, "path", 65);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(43, "button", 66);
    \u0275\u0275listener("click", function CategoriesManagerComponent_div_24_tr_17_Template_button_click_43_listener($event) {
      const item_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.openDeleteModal(item_r2, $event));
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(44, "svg", 62);
    \u0275\u0275element(45, "path", 67);
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const item_r2 = ctx.$implicit;
    const i_r4 = ctx.index;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate((ctx_r2.currentPage - 1) * ctx_r2.pageSize + i_r4 + 1);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", item_r2.imageUrl);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !item_r2.imageUrl);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", ctx_r2.activeLang === "ar" ? item_r2.nameAr : item_r2.nameEn, " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r2.activeLang === "ar" ? item_r2.nameEn : item_r2.nameAr, " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", ctx_r2.activeLang === "ar" ? item_r2.nameAr : item_r2.nameEn, " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r2.activeLang === "ar" ? item_r2.nameEn : item_r2.nameAr, " ");
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate1("", (item_r2.subCategories == null ? null : item_r2.subCategories.length) || 0, " \u0645\u0646\u062A\u062C");
    \u0275\u0275advance(4);
    \u0275\u0275classProp("text-emerald-500", item_r2.isActive)("text-slate-400", !item_r2.isActive);
    \u0275\u0275advance();
    \u0275\u0275classProp("bg-emerald-500", item_r2.isActive)("bg-slate-300", !item_r2.isActive);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", item_r2.isActive ? "\u0646\u0634\u0637" : "\u0645\u0639\u0637\u0644", " ");
  }
}
function CategoriesManagerComponent_div_24_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 26)(1, "table", 27)(2, "thead", 28)(3, "tr", 29)(4, "th", 30);
    \u0275\u0275text(5, "#");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "th", 31);
    \u0275\u0275text(7, "\u0627\u0644\u0635\u0648\u0631\u0629");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "th", 32);
    \u0275\u0275text(9, "\u0627\u0644\u0627\u0633\u0645");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "th", 33);
    \u0275\u0275text(11, "\u0639\u062F\u062F \u0627\u0644\u0639\u0646\u0627\u0635\u0631");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "th", 33);
    \u0275\u0275text(13, "\u0627\u0644\u062D\u0627\u0644\u0629");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "th", 33);
    \u0275\u0275text(15, "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(16, "tbody", 34);
    \u0275\u0275template(17, CategoriesManagerComponent_div_24_tr_17_Template, 46, 17, "tr", 35);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(17);
    \u0275\u0275property("ngForOf", ctx_r2.paginatedItems);
  }
}
function CategoriesManagerComponent_div_25_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 72)(1, "div", 73)(2, "div", 74);
    \u0275\u0275element(3, "div", 75);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(4, "svg", 76);
    \u0275\u0275element(5, "path", 77);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(6, "h3", 78);
    \u0275\u0275text(7);
    \u0275\u0275pipe(8, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "p", 79);
    \u0275\u0275text(10);
    \u0275\u0275pipe(11, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "div", 80)(13, "app-button", 81);
    \u0275\u0275listener("btnClick", function CategoriesManagerComponent_div_25_Template_app_button_btnClick_13_listener() {
      \u0275\u0275restoreView(_r5);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.openCreateModal());
    });
    \u0275\u0275elementStart(14, "div", 82);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(15, "svg", 83);
    \u0275\u0275element(16, "path", 84);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(17, "span");
    \u0275\u0275text(18);
    \u0275\u0275pipe(19, "translate");
    \u0275\u0275elementEnd()()()()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(8, 3, "CATEGORIES.NO_ITEMS_FOUND"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(11, 5, "CATEGORIES.NO_ITEMS_DESC_ROOT"));
    \u0275\u0275advance(8);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(19, 7, "CATEGORIES.CREATE_FIRST"));
  }
}
function CategoriesManagerComponent_app_pagination_26_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-pagination", 85);
    \u0275\u0275listener("pageChange", function CategoriesManagerComponent_app_pagination_26_Template_app_pagination_pageChange_0_listener($event) {
      \u0275\u0275restoreView(_r6);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.changePage($event));
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275property("currentPage", ctx_r2.currentPage)("pageSize", ctx_r2.pageSize)("totalItems", ctx_r2.currentItems.length);
  }
}
var CategoriesManagerComponent = class _CategoriesManagerComponent {
  catalogService;
  translate;
  router;
  isLoading = true;
  industries = [];
  // Navigation & Pagination State
  breadcrumbs = [];
  currentItems = [];
  searchTerm = "";
  currentPage = 1;
  pageSize = 10;
  get totalPages() {
    return Math.ceil(this.currentItems.length / this.pageSize);
  }
  get paginatedItems() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.currentItems.slice(startIndex, startIndex + this.pageSize);
  }
  changePage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  // Modal State
  isModalOpen = false;
  modalMode = "create";
  modalLevelKey = "";
  isSaving = false;
  categoryForm = null;
  // Deletion State
  isDeleteModalOpen = false;
  isDeleting = false;
  itemToDelete = null;
  // Context State
  parentCategoryForModal = null;
  // Tree Table State
  expandedRows = /* @__PURE__ */ new Set();
  // Expose Math to template
  Math = Math;
  constructor(catalogService, translate, router) {
    this.catalogService = catalogService;
    this.translate = translate;
    this.router = router;
  }
  get activeLang() {
    return this.translate.currentLang || "ar";
  }
  getDynamicBreadcrumbs() {
    return [
      { label: "SIDEBAR.CATALOG", url: "/catalog/categories" },
      { label: "CATEGORIES.INDUSTRY", url: "" }
    ];
  }
  ngOnInit() {
    this.loadHierarchy();
  }
  loadHierarchy() {
    this.isLoading = true;
    this.catalogService.getCategories(void 0, true).subscribe({
      next: (data) => {
        this.industries = data || [];
        this.refreshCurrentItems();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }
  getLevelNameKey() {
    return "CATEGORIES.INDUSTRY";
  }
  toggleRow(categoryId, event) {
    if (event)
      event.stopPropagation();
    if (this.expandedRows.has(categoryId)) {
      this.expandedRows.delete(categoryId);
    } else {
      this.expandedRows.add(categoryId);
    }
  }
  isExpanded(categoryId) {
    return this.expandedRows.has(categoryId);
  }
  getFlattenedHierarchy() {
    const flatList = [];
    const process = (items, level, parentVisible) => {
      for (const item of items) {
        flatList.push(__spreadProps(__spreadValues({}, item), {
          level,
          isExpanded: this.isExpanded(item.id),
          hasChildren: !!(item.subCategories && item.subCategories.length > 0)
        }));
        if (this.isExpanded(item.id) && item.subCategories) {
          process(item.subCategories, level + 1, true);
        }
      }
    };
    process(this.industries, 0, true);
    return flatList;
  }
  getCurrentParentId() {
    if (this.breadcrumbs.length === 0)
      return null;
    return this.breadcrumbs[this.breadcrumbs.length - 1].id;
  }
  refreshCurrentItems() {
    let items = [...this.industries];
    if (this.searchTerm && this.searchTerm.trim() !== "") {
      const term = this.searchTerm.toLowerCase().trim();
      items = items.filter((i) => i.nameAr && i.nameAr.toLowerCase().includes(term) || i.nameEn && i.nameEn.toLowerCase().includes(term));
    }
    this.currentItems = items;
    this.currentPage = 1;
  }
  onSearch(event) {
    this.refreshCurrentItems();
  }
  selectItem(item) {
    this.router.navigate(["/catalog/categories", item.id]);
  }
  goToLevel(index) {
    if (index === 0) {
      this.breadcrumbs = [];
    } else {
      this.breadcrumbs = this.breadcrumbs.slice(0, index);
    }
    this.refreshCurrentItems();
  }
  openCreateModal(parent) {
    this.modalMode = "create";
    const activeParent = parent || (this.breadcrumbs.length > 0 ? this.breadcrumbs[this.breadcrumbs.length - 1] : null);
    this.modalLevelKey = this.getLevelNameKey();
    this.parentCategoryForModal = activeParent ? {
      id: activeParent.id,
      nameAr: activeParent.nameAr,
      nameEn: activeParent.nameEn
    } : null;
    this.isModalOpen = true;
  }
  openEditModal(category, event) {
    event.stopPropagation();
    this.modalMode = "edit";
    this.modalLevelKey = this.getLevelNameKey();
    this.categoryForm = __spreadValues({}, category);
    this.isModalOpen = true;
  }
  closeCategoryModal() {
    this.isModalOpen = false;
    this.categoryForm = null;
  }
  handleSaved() {
    this.loadHierarchy();
  }
  onCreateProduct(category) {
    this.router.navigate(["/catalog/products/create"], { queryParams: { categoryId: category.id } });
  }
  viewDetails(category, event) {
    event.stopPropagation();
    this.router.navigate(["/catalog/categories", category.id]);
  }
  openDeleteModal(category, event) {
    event.stopPropagation();
    this.itemToDelete = category;
    this.isDeleteModalOpen = true;
  }
  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.itemToDelete = null;
  }
  confirmDelete() {
    if (!this.itemToDelete)
      return;
    this.isDeleting = true;
    this.catalogService.deleteCategory(this.itemToDelete.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.closeDeleteModal();
        this.loadHierarchy();
      },
      error: (err) => {
        console.error("Deletion failed:", err);
        this.isDeleting = false;
      }
    });
  }
  static \u0275fac = function CategoriesManagerComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CategoriesManagerComponent)(\u0275\u0275directiveInject(CatalogService), \u0275\u0275directiveInject(TranslateService), \u0275\u0275directiveInject(Router));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _CategoriesManagerComponent, selectors: [["app-categories-manager"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 29, vars: 14, consts: [[1, "h-full", "flex", "flex-col", "bg-slate-50/50", "font-sans"], [1, "px-4", "md:px-10", "pt-8", "pb-4", "flex", "flex-col", "sm:flex-row", "items-start", "sm:items-end", "justify-between", "gap-6"], [1, "text-start", "w-full", "sm:w-auto", "space-y-1", "animate-in", "slide-in-from-right-10", "duration-700"], [1, "flex", "justify-start", "items-center", "gap-2", "text-[10px]", "sm:text-[11px]", "font-bold", "text-zadna-primary/80", "uppercase", "tracking-widest", "mb-1.5"], [1, "w-1", "h-1", "rounded-full", "bg-zadna-primary/20"], [1, "text-zadna-primary"], [1, "text-xl", "sm:text-2xl", "font-black", "text-slate-900", "tracking-tight", "leading-tight"], [1, "text-[10px]", "sm:text-[12px]", "font-medium", "text-slate-400", "max-w-md"], [1, "flex", "items-center", "gap-4", "animate-in", "slide-in-from-left-10", "duration-700"], ["variant", "primary", "customClass", "rounded-[1.5rem] shadow-2xl shadow-zadna-primary/20 hover:scale-105 transition-all transform px-8 py-3.5 group", 3, "btnClick"], [1, "flex", "items-center", "gap-3"], [1, "w-8", "h-8", "rounded-xl", "bg-white/20", "flex", "items-center", "justify-center", "group-hover:rotate-90", "transition-transform", "duration-500"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "text-white"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "3", "d", "M12 4v16m8-8H4"], [1, "font-black", "uppercase", "tracking-[0.1em]", "text-xs", "sm:text-sm"], [1, "flex-1", "min-h-0", "px-4", "md:px-10", "py-6", "max-w-[120rem]", "mx-auto", "w-full", "space-y-6"], ["class", "flex flex-col items-center justify-center py-40 animate-pulse", 4, "ngIf"], ["class", "extraordinary-table-container w-full p-0 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-1000", 4, "ngIf"], ["class", "relative p-20 text-center animate-in zoom-in duration-700", 4, "ngIf"], [3, "currentPage", "pageSize", "totalItems", "pageChange", 4, "ngIf"], [3, "close", "saved", "isOpen", "mode", "levelNameKey", "parentCategory", "initialData"], [3, "confirm", "close", "isOpen", "isLoading"], [1, "flex", "flex-col", "items-center", "justify-center", "py-40", "animate-pulse"], [1, "relative", "w-24", "h-24"], [1, "absolute", "inset-0", "rounded-full", "border-[6px]", "border-zadna-primary/10"], [1, "absolute", "inset-0", "rounded-full", "border-[6px]", "border-t-zadna-primary", "animate-spin"], [1, "extraordinary-table-container", "w-full", "p-0", "overflow-hidden", "animate-in", "fade-in", "slide-in-from-bottom-10", "duration-1000"], [1, "w-full", "block", "sm:table", "sm:table-fixed", "border-separate", "border-spacing-y-0", "px-2"], [1, "hidden", "sm:table-header-group", "border-b", "border-slate-100/50"], [1, "sm:table-row"], [1, "text-center", "w-[5%]", "py-5", "text-[10px]", "font-black", "uppercase", "text-slate-400/70", "tracking-tighter"], [1, "text-center", "w-[10%]", "py-5", "text-[10px]", "font-black", "uppercase", "text-slate-400/70", "tracking-tighter"], [1, "text-start", "w-[25%]", "py-5", "text-[10px]", "font-black", "uppercase", "text-slate-400/70", "tracking-tighter", "px-2"], [1, "text-center", "w-[20%]", "py-5", "text-[10px]", "font-black", "uppercase", "text-slate-400/70", "tracking-tighter"], [1, "block", "sm:table-row-group", "stagger-rows", "w-full"], ["class", "table-row-object group flex flex-col sm:table-row bg-white/70 backdrop-blur-md sm:bg-white/50 rounded-[2rem] shadow-sm sm:shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-5 sm:p-0 mb-4 border border-white/80 sm:border-slate-100/60 relative w-full hover:bg-white transition-all duration-500", 3, "click", 4, "ngFor", "ngForOf"], [1, "table-row-object", "group", "flex", "flex-col", "sm:table-row", "bg-white/70", "backdrop-blur-md", "sm:bg-white/50", "rounded-[2rem]", "shadow-sm", "sm:shadow-[0_8px_30px_rgb(0,0,0,0.02)]", "p-5", "sm:p-0", "mb-4", "border", "border-white/80", "sm:border-slate-100/60", "relative", "w-full", "hover:bg-white", "transition-all", "duration-500", 3, "click"], [1, "hidden", "sm:table-cell", "text-center", "align-middle", "sm:w-[5%]"], [1, "text-[10px]", "sm:text-[11px]", "font-black", "text-slate-300", "transition-colors"], [1, "block", "sm:table-cell", "py-0", "sm:py-4", "align-middle", "sm:w-[10%]", "mb-4", "sm:mb-0"], [1, "flex", "flex-row", "sm:flex-col", "items-center", "gap-4", "sm:gap-0", "sm:justify-center"], [1, "relative", "w-14", "h-14", "sm:w-12", "sm:h-12", "shrink-0", "bg-[#f0f9fa]/80", "rounded-[1.2rem]", "border", "border-[#e0f2f4]", "flex", "items-center", "justify-center", "transition-all", "group-hover:scale-105", "group-hover:rotate-2", "shadow-sm"], ["class", "w-3/4 h-3/4 object-contain transition-transform duration-500 group-hover:scale-110", 3, "src", "alt", 4, "ngIf"], ["class", "text-zadna-primary/40", 4, "ngIf"], [1, "absolute", "-top-1", "-right-1", "w-2.5", "h-2.5", "bg-white", "border-2", "border-[#e0f2f4]", "rounded-full", "shadow-sm"], [1, "flex", "flex-col", "text-start", "sm:hidden", "px-0"], [1, "text-[15px]", "font-black", "text-slate-900", "leading-tight", "mb-0.5"], [1, "text-[10px]", "font-bold", "text-slate-400/80", "uppercase", "tracking-widest", "leading-none"], [1, "hidden", "sm:table-cell", "sm:table-cell", "border-b", "border-dashed", "border-slate-100", "sm:border-none", "align-middle", "sm:w-[25%]", "px-2"], [1, "flex", "flex-col", "text-start"], [1, "text-[13px]", "sm:text-[14px]", "font-black", "text-slate-900", "group-hover:text-zadna-primary", "transition-colors", "leading-snug"], [1, "text-[9px]", "font-bold", "text-slate-400/80", "uppercase", "tracking-widest", "mt-0.5"], [1, "flex", "sm:table-cell", "justify-between", "items-center", "sm:text-center", "py-3.5", "sm:py-0", "border-b", "border-dashed", "border-slate-100", "sm:border-none", "align-middle", "sm:w-[20%]"], [1, "sm:hidden", "text-[11px]", "font-black", "uppercase", "text-slate-400/80", "tracking-widest"], [1, "inline-flex", "items-center", "gap-1.5", "px-3", "py-1.5", "sm:py-1", "bg-slate-50/50", "rounded-xl", "border", "border-slate-100", "group-hover:border-zadna-primary/10", "transition-all"], [1, "text-[11px]", "sm:text-[10px]", "font-bold", "text-slate-500"], [1, "inline-flex", "items-center", "gap-2", "px-3", "py-1.5", "rounded-full", "border", "border-slate-50", "bg-white", "shadow-sm"], [1, "w-1.5", "h-1.5", "rounded-full", "animate-pulse"], [1, "text-[10px]", "font-black", "tracking-tight", "uppercase"], [1, "flex", "sm:table-cell", "justify-center", "items-center", "pt-4", "sm:pt-0", "mt-2", "sm:mt-0", "align-middle", "sm:w-[20%]"], [1, "flex", "flex-row-reverse", "items-center", "justify-center", "gap-3", "sm:gap-1.5", "w-full", "sm:w-auto"], [1, "w-9", "h-9", "sm:w-8", "sm:h-8", "rounded-xl", "bg-slate-50", "text-slate-400", "flex", "items-center", "justify-center", "hover:bg-zadna-primary", "hover:text-white", "transition-all", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4.5", "h-4.5", "sm:w-4", "sm:h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15 12a3 3 0 11-6 0 3 3 0 016 0z"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"], [1, "w-9", "h-9", "sm:w-8", "sm:h-8", "rounded-xl", "bg-red-50", "text-red-500", "flex", "items-center", "justify-center", "hover:bg-red-500", "hover:text-white", "transition-all", 3, "click"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"], [1, "w-3/4", "h-3/4", "object-contain", "transition-transform", "duration-500", "group-hover:scale-110", 3, "src", "alt"], [1, "text-zadna-primary/40"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-6", "h-6", "sm:w-5", "sm:h-5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.8", "d", "M4 6h16M4 12h16m-7 6h7"], [1, "relative", "p-20", "text-center", "animate-in", "zoom-in", "duration-700"], [1, "max-w-md", "mx-auto", "space-y-6"], [1, "w-32", "h-32", "bg-white", "rounded-[3rem]", "shadow-2xl", "flex", "items-center", "justify-center", "mx-auto", "text-slate-100", "relative", "group"], [1, "absolute", "inset-0", "bg-zadna-primary/5", "rounded-[3rem]", "group-hover:scale-110", "transition-transform", "duration-500"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-16", "h-16", "relative", "z-10"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"], [1, "text-3xl", "font-black", "text-slate-900", "tracking-tight"], [1, "text-sm", "font-bold", "text-slate-400", "leading-relaxed"], [1, "pt-6"], ["variant", "primary", 3, "btnClick"], [1, "flex", "items-center", "gap-2"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M12 4v16m8-8H4"], [3, "pageChange", "currentPage", "pageSize", "totalItems"]], template: function CategoriesManagerComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "nav", 3)(4, "span");
      \u0275\u0275text(5);
      \u0275\u0275pipe(6, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275element(7, "span", 4);
      \u0275\u0275elementStart(8, "span", 5);
      \u0275\u0275text(9, "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u062D\u062A\u0648\u0649");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(10, "h1", 6);
      \u0275\u0275text(11, " \u0627\u0644\u062A\u0635\u0646\u064A\u0641\u0627\u062A \u0648\u0627\u0644\u0646\u0634\u0627\u0637 ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(12, "p", 7);
      \u0275\u0275text(13, " \u062A\u062A\u0628\u0639 \u0648\u0625\u062F\u0627\u0631\u0629 \u0647\u064A\u0643\u0644\u0629 \u0627\u0644\u062A\u0635\u0646\u064A\u0641\u0627\u062A \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0641\u064A \u0627\u0644\u0646\u0638\u0627\u0645 \u0628\u062F\u0642\u0629 \u0648\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 ");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(14, "div", 8)(15, "app-button", 9);
      \u0275\u0275listener("btnClick", function CategoriesManagerComponent_Template_app_button_btnClick_15_listener() {
        return ctx.openCreateModal();
      });
      \u0275\u0275elementStart(16, "div", 10)(17, "div", 11);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(18, "svg", 12);
      \u0275\u0275element(19, "path", 13);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(20, "span", 14);
      \u0275\u0275text(21, "\u0625\u0636\u0627\u0641\u0629 \u062A\u0635\u0646\u064A\u0641 \u062C\u062F\u064A\u062F");
      \u0275\u0275elementEnd()()()()();
      \u0275\u0275elementStart(22, "div", 15);
      \u0275\u0275template(23, CategoriesManagerComponent_div_23_Template, 4, 0, "div", 16)(24, CategoriesManagerComponent_div_24_Template, 18, 1, "div", 17)(25, CategoriesManagerComponent_div_25_Template, 20, 9, "div", 18)(26, CategoriesManagerComponent_app_pagination_26_Template, 1, 3, "app-pagination", 19);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(27, "app-category-form-modal", 20);
      \u0275\u0275listener("close", function CategoriesManagerComponent_Template_app_category_form_modal_close_27_listener() {
        return ctx.closeCategoryModal();
      })("saved", function CategoriesManagerComponent_Template_app_category_form_modal_saved_27_listener() {
        return ctx.handleSaved();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(28, "app-delete-confirmation-modal", 21);
      \u0275\u0275listener("confirm", function CategoriesManagerComponent_Template_app_delete_confirmation_modal_confirm_28_listener() {
        return ctx.confirmDelete();
      })("close", function CategoriesManagerComponent_Template_app_delete_confirmation_modal_close_28_listener() {
        return ctx.closeDeleteModal();
      });
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 12, "SIDEBAR.CATALOG"));
      \u0275\u0275advance(18);
      \u0275\u0275property("ngIf", ctx.isLoading);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.isLoading && ctx.paginatedItems.length > 0);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.isLoading && ctx.currentItems.length === 0);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.isLoading);
      \u0275\u0275advance();
      \u0275\u0275property("isOpen", ctx.isModalOpen)("mode", ctx.modalMode)("levelNameKey", ctx.modalLevelKey)("parentCategory", ctx.parentCategoryForModal)("initialData", ctx.categoryForm);
      \u0275\u0275advance();
      \u0275\u0275property("isOpen", ctx.isDeleteModalOpen)("isLoading", ctx.isDeleting);
    }
  }, dependencies: [
    CommonModule,
    NgForOf,
    NgIf,
    FormsModule,
    TranslateModule,
    TranslatePipe,
    CategoryFormModalComponent,
    DeleteConfirmationModalComponent,
    AppButtonComponent,
    AppPaginationComponent
  ], styles: ["\n\n.custom-scrollbar[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 5px;\n  height: 5px;\n}\n.custom-scrollbar[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: transparent;\n}\n.custom-scrollbar[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: #e2e8f0;\n  border-radius: 9999px;\n}\n.custom-scrollbar[_ngcontent-%COMP%]::-webkit-scrollbar-thumb:hover {\n  background: #cbd5e1;\n}\n@keyframes _ngcontent-%COMP%_scale-in {\n  from {\n    opacity: 0;\n    transform: scale(0.95);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1);\n  }\n}\n.animate-scale-in[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_scale-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;\n}\n@keyframes _ngcontent-%COMP%_rowEntrance {\n  from {\n    opacity: 0;\n    transform: translateY(4px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n.animate-row[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_rowEntrance 0.3s ease-out forwards;\n}\n/*# sourceMappingURL=categories-manager.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(CategoriesManagerComponent, { className: "CategoriesManagerComponent", filePath: "src\\app\\features\\catalog\\categories-manager\\categories-manager.component.ts", lineNumber: 35 });
})();
export {
  CategoriesManagerComponent
};
//# sourceMappingURL=chunk-UEDXB3MN.js.map
