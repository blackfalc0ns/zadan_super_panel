import {
  AppButtonComponent
} from "./chunk-NRL7A6JT.js";
import {
  TranslateModule,
  TranslatePipe
} from "./chunk-FETH6UU2.js";
import {
  CommonModule,
  EventEmitter,
  NgIf,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵdefineComponent,
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
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate7
} from "./chunk-IPPBI3AG.js";

// src/app/shared/components/ui/pagination/pagination.component.ts
function AppPaginationComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 1)(1, "div", 2)(2, "app-button", 3);
    \u0275\u0275listener("btnClick", function AppPaginationComponent_div_0_Template_app_button_btnClick_2_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.changePage(ctx_r1.currentPage - 1));
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(3, "svg", 4);
    \u0275\u0275element(4, "path", 5);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(5, "div", 6)(6, "span", 7);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275element(8, "div", 8);
    \u0275\u0275elementStart(9, "span", 9);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "app-button", 3);
    \u0275\u0275listener("btnClick", function AppPaginationComponent_div_0_Template_app_button_btnClick_11_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.changePage(ctx_r1.currentPage + 1));
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(12, "svg", 4);
    \u0275\u0275element(13, "path", 10);
    \u0275\u0275elementEnd()()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(14, "p", 11);
    \u0275\u0275text(15);
    \u0275\u0275pipe(16, "translate");
    \u0275\u0275pipe(17, "translate");
    \u0275\u0275pipe(18, "translate");
    \u0275\u0275pipe(19, "translate");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275property("disabled", ctx_r1.currentPage === 1);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r1.currentPage);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.totalPages);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx_r1.currentPage >= ctx_r1.totalPages);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate7(" ", \u0275\u0275pipeBind1(16, 11, "COMMON.SHOWING"), " ", ctx_r1.startItem, " ", \u0275\u0275pipeBind1(17, 13, "COMMON.TO"), " ", ctx_r1.endItem, " ", \u0275\u0275pipeBind1(18, 15, "COMMON.OF"), " ", ctx_r1.totalItems, " ", \u0275\u0275pipeBind1(19, 17, "COMMON.ENTRIES"), " ");
  }
}
var AppPaginationComponent = class _AppPaginationComponent {
  /** Current active page (1-indexed) */
  currentPage = 1;
  /** Number of items per page */
  pageSize = 10;
  /** Total number of items across all pages */
  totalItems = 0;
  /** Emits the new page number when user changes page */
  pageChange = new EventEmitter();
  get totalPages() {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }
  get startItem() {
    return (this.currentPage - 1) * this.pageSize + 1;
  }
  get endItem() {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }
  changePage(page) {
    if (page < 1 || page > this.totalPages)
      return;
    this.pageChange.emit(page);
  }
  static \u0275fac = function AppPaginationComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AppPaginationComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AppPaginationComponent, selectors: [["app-pagination"]], inputs: { currentPage: "currentPage", pageSize: "pageSize", totalItems: "totalItems" }, outputs: { pageChange: "pageChange" }, standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 1, vars: 1, consts: [["class", "flex flex-col items-center gap-4 pt-6 border-t border-slate-100/50", 4, "ngIf"], [1, "flex", "flex-col", "items-center", "gap-4", "pt-6", "border-t", "border-slate-100/50"], [1, "flex", "items-center", "gap-3", "p-2.5", "bg-white", "border", "border-slate-100", "rounded-[2rem]", "shadow-xl"], ["variant", "ghost", "size", "sm", "customClass", "w-12 h-12 rounded-2xl", 3, "btnClick", "disabled"], ["fill", "none", "viewBox", "0 0 24 24", "stroke", "currentColor", 1, "w-4", "h-4", "rtl:rotate-180"], ["stroke-width", "3", "d", "M15 19l-7-7 7-7"], [1, "px-6", "py-3", "bg-slate-50", "rounded-2xl", "border", "border-slate-100", "flex", "items-center", "gap-3", "select-none"], [1, "text-sm", "font-black", "text-slate-900"], [1, "h-4", "w-px", "bg-slate-200"], [1, "text-[10px]", "font-black", "text-slate-400", "uppercase", "tracking-widest"], ["stroke-width", "3", "d", "M9 5l7 7-7 7"], [1, "text-[9px]", "font-black", "text-slate-400", "uppercase", "tracking-[0.3em]", "opacity-50"]], template: function AppPaginationComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275template(0, AppPaginationComponent_div_0_Template, 20, 19, "div", 0);
    }
    if (rf & 2) {
      \u0275\u0275property("ngIf", ctx.totalItems > 0);
    }
  }, dependencies: [CommonModule, NgIf, TranslateModule, TranslatePipe, AppButtonComponent], styles: ["\n\n[_nghost-%COMP%] {\n  display: block;\n}\n/*# sourceMappingURL=pagination.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AppPaginationComponent, { className: "AppPaginationComponent", filePath: "src\\app\\shared\\components\\ui\\pagination\\pagination.component.ts", lineNumber: 13 });
})();

export {
  AppPaginationComponent
};
//# sourceMappingURL=chunk-LI5G6AB4.js.map
