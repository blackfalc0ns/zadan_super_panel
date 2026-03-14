import {
  CommonModule,
  NgIf,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵclassMap,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵnextContext,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵtemplate
} from "./chunk-IPPBI3AG.js";

// src/app/shared/components/ui/badge/badge.component.ts
var _c0 = ["*"];
function AppBadgeComponent_span_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "span", 1);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275classMap(ctx_r0.dotClasses);
  }
}
var AppBadgeComponent = class _AppBadgeComponent {
  variant = "neutral";
  showDot = false;
  customClass = "";
  get badgeClasses() {
    const base = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all";
    const variants = {
      success: "bg-emerald-50 text-emerald-600 border-emerald-100",
      warning: "bg-zadna-accent/10 text-zadna-accent border-zadna-accent/20",
      danger: "bg-red-50 text-red-600 border-red-100",
      info: "bg-blue-50 text-blue-600 border-blue-100",
      neutral: "bg-slate-50 text-slate-500 border-slate-100"
    }[this.variant];
    return `${base} ${variants} ${this.customClass}`;
  }
  get dotClasses() {
    return {
      success: "bg-emerald-500",
      warning: "bg-zadna-accent",
      danger: "bg-red-500",
      info: "bg-blue-500",
      neutral: "bg-slate-400"
    }[this.variant];
  }
  static \u0275fac = function AppBadgeComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AppBadgeComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AppBadgeComponent, selectors: [["app-badge"]], inputs: { variant: "variant", showDot: "showDot", customClass: "customClass" }, standalone: true, features: [\u0275\u0275StandaloneFeature], ngContentSelectors: _c0, decls: 3, vars: 3, consts: [["class", "w-1.5 h-1.5 rounded-full animate-pulse", 3, "class", 4, "ngIf"], [1, "w-1.5", "h-1.5", "rounded-full", "animate-pulse"]], template: function AppBadgeComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275projectionDef();
      \u0275\u0275elementStart(0, "span");
      \u0275\u0275template(1, AppBadgeComponent_span_1_Template, 1, 2, "span", 0);
      \u0275\u0275projection(2);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275classMap(ctx.badgeClasses);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.showDot);
    }
  }, dependencies: [CommonModule, NgIf], styles: ["\n\n[_nghost-%COMP%] {\n  display: inline-flex;\n}\n/*# sourceMappingURL=badge.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AppBadgeComponent, { className: "AppBadgeComponent", filePath: "src\\app\\shared\\components\\ui\\badge\\badge.component.ts", lineNumber: 11 });
})();

export {
  AppBadgeComponent
};
//# sourceMappingURL=chunk-ERDI6WJP.js.map
