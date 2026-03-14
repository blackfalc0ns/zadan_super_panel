import {
  RouterLink,
  RouterModule
} from "./chunk-TIVATNVT.js";
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
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-IPPBI3AG.js";

// src/app/shared/components/ui/page-header/page-header.component.ts
var _c0 = [[["", "title-extra", ""]], [["", "search", ""]], [["", "filters", ""]], [["", "view-switcher", ""]], [["", "actions", ""]]];
var _c1 = ["[title-extra]", "[search]", "[filters]", "[view-switcher]", "[actions]"];
function AppPageHeaderComponent_button_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 11);
    \u0275\u0275listener("click", function AppPageHeaderComponent_button_3_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onBack());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(1, "svg", 12);
    \u0275\u0275element(2, "path", 13);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("routerLink", ctx_r1.backUrl);
  }
}
function AppPageHeaderComponent_h1_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "h1", 14);
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "translate");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(2, 1, ctx_r1.title), " ");
  }
}
function AppPageHeaderComponent_p_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 15);
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "translate");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(2, 1, ctx_r1.subtitle));
  }
}
var AppPageHeaderComponent = class _AppPageHeaderComponent {
  title = "";
  subtitle = "";
  showBack = false;
  showToolbar = false;
  backUrl = "..";
  breadcrumbs = [];
  backClick = new EventEmitter();
  onBack() {
    this.backClick.emit();
  }
  static \u0275fac = function AppPageHeaderComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AppPageHeaderComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AppPageHeaderComponent, selectors: [["app-page-header"]], inputs: { title: "title", subtitle: "subtitle", showBack: "showBack", showToolbar: "showToolbar", backUrl: "backUrl", breadcrumbs: "breadcrumbs" }, outputs: { backClick: "backClick" }, standalone: true, features: [\u0275\u0275StandaloneFeature], ngContentSelectors: _c1, decls: 18, vars: 3, consts: [[1, "bg-white/80", "backdrop-blur-xl", "border-b", "border-white", "shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)]", "px-4", "md:px-8", "py-4", "sm:py-5", "flex", "flex-col", "lg:flex-row", "items-center", "gap-4", "transition-all", "relative", "z-10", "w-full", "overflow-hidden"], [1, "absolute", "inset-0", "bg-gradient-to-r", "from-slate-50/50", "via-transparent", "to-slate-50/50", "pointer-events-none"], [1, "flex", "items-center", "gap-3", "relative", "z-10", "w-full", "lg:w-auto", "shrink-0"], ["type", "button", "class", "w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-[1.25rem] bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-zadna-primary hover:border-zadna-primary/20 hover:shadow-lg hover:shadow-zadna-primary/5 transition-all cursor-pointer active:scale-95 group", "title", "Go Back", 3, "routerLink", "click", 4, "ngIf"], [1, "min-w-0"], [1, "flex", "items-center", "gap-2"], ["class", "text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-none whitespace-nowrap", 4, "ngIf"], ["class", "text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1", 4, "ngIf"], [1, "flex", "flex-1", "flex-wrap", "lg:flex-nowrap", "items-center", "gap-3", "w-full", "lg:w-auto", "relative", "z-10"], [1, "flex-1", "min-w-[180px]"], [1, "shrink-0"], ["type", "button", "title", "Go Back", 1, "w-10", "h-10", "sm:w-12", "sm:h-12", "shrink-0", "rounded-[1.25rem]", "bg-white", "border", "border-slate-100", "flex", "items-center", "justify-center", "text-slate-400", "hover:text-zadna-primary", "hover:border-zadna-primary/20", "hover:shadow-lg", "hover:shadow-zadna-primary/5", "transition-all", "cursor-pointer", "active:scale-95", "group", 3, "click", "routerLink"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "sm:w-5", "sm:h-5", "rtl:rotate-180", "group-hover:-translate-x-0.5", "transition-transform"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M10 19l-7-7m0 0l7-7m-7 7h18"], [1, "text-lg", "sm:text-xl", "font-black", "tracking-tight", "text-slate-900", "leading-none", "whitespace-nowrap"], [1, "text-[10px]", "font-bold", "text-slate-400", "uppercase", "tracking-widest", "mt-1"]], template: function AppPageHeaderComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275projectionDef(_c0);
      \u0275\u0275elementStart(0, "header", 0);
      \u0275\u0275element(1, "div", 1);
      \u0275\u0275elementStart(2, "div", 2);
      \u0275\u0275template(3, AppPageHeaderComponent_button_3_Template, 3, 1, "button", 3);
      \u0275\u0275elementStart(4, "div", 4)(5, "div", 5);
      \u0275\u0275template(6, AppPageHeaderComponent_h1_6_Template, 3, 3, "h1", 6);
      \u0275\u0275projection(7);
      \u0275\u0275elementEnd();
      \u0275\u0275template(8, AppPageHeaderComponent_p_8_Template, 3, 3, "p", 7);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(9, "div", 8)(10, "div", 9);
      \u0275\u0275projection(11, 1);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(12, "div", 10);
      \u0275\u0275projection(13, 2);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "div", 10);
      \u0275\u0275projection(15, 3);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(16, "div", 10);
      \u0275\u0275projection(17, 4);
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(3);
      \u0275\u0275property("ngIf", ctx.showBack);
      \u0275\u0275advance(3);
      \u0275\u0275property("ngIf", ctx.title);
      \u0275\u0275advance(2);
      \u0275\u0275property("ngIf", ctx.subtitle);
    }
  }, dependencies: [CommonModule, NgIf, RouterModule, RouterLink, TranslateModule, TranslatePipe], styles: ["\n\n[_nghost-%COMP%] {\n  display: block;\n  width: 100%;\n}\n/*# sourceMappingURL=page-header.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AppPageHeaderComponent, { className: "AppPageHeaderComponent", filePath: "src\\app\\shared\\components\\ui\\page-header\\page-header.component.ts", lineNumber: 13 });
})();
//# sourceMappingURL=chunk-H5RLU432.js.map
