import {
  CommonModule,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵclassMap,
  ɵɵdefineComponent,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵprojection,
  ɵɵprojectionDef
} from "./chunk-IPPBI3AG.js";

// src/app/shared/components/ui/card/card.component.ts
var _c0 = ["*"];
var AppCardComponent = class _AppCardComponent {
  variant = "default";
  hover = false;
  padding = "md";
  rounded = "2xl";
  customClass = "";
  get cardClasses() {
    const base = "relative overflow-hidden transition-all duration-500";
    const variants = {
      default: "bg-white border border-slate-100 shadow-sm",
      glass: "premium-glass",
      outline: "bg-transparent border-2 border-slate-100"
    }[this.variant];
    const paddings = {
      none: "p-0",
      sm: "p-4",
      md: "p-6",
      lg: "p-8"
    }[this.padding];
    const radius = {
      xl: "rounded-xl",
      "2xl": "rounded-[2rem]",
      "3xl": "rounded-[2.5rem]",
      "full-pane": "rounded-none"
    }[this.rounded];
    const hoverClass = this.hover ? "premium-card-hover" : "";
    return `${base} ${variants} ${paddings} ${radius} ${hoverClass} ${this.customClass}`;
  }
  static \u0275fac = function AppCardComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AppCardComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AppCardComponent, selectors: [["app-card"]], inputs: { variant: "variant", hover: "hover", padding: "padding", rounded: "rounded", customClass: "customClass" }, standalone: true, features: [\u0275\u0275StandaloneFeature], ngContentSelectors: _c0, decls: 2, vars: 2, template: function AppCardComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275projectionDef();
      \u0275\u0275elementStart(0, "div");
      \u0275\u0275projection(1);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275classMap(ctx.cardClasses);
    }
  }, dependencies: [CommonModule], styles: ["\n\n[_nghost-%COMP%] {\n  display: block;\n}\n/*# sourceMappingURL=card.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AppCardComponent, { className: "AppCardComponent", filePath: "src\\app\\shared\\components\\ui\\card\\card.component.ts", lineNumber: 11 });
})();

export {
  AppCardComponent
};
//# sourceMappingURL=chunk-J7OIUMD3.js.map
