import {
  CommonModule,
  EventEmitter,
  NgIf,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵclassMap,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵlistener,
  ɵɵnamespaceSVG,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵtemplate
} from "./chunk-IPPBI3AG.js";

// src/app/shared/components/ui/button/button.component.ts
var _c0 = ["*"];
function AppButtonComponent__svg_svg_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 4);
    \u0275\u0275element(1, "circle", 5)(2, "path", 6);
    \u0275\u0275elementEnd();
  }
}
var AppButtonComponent = class _AppButtonComponent {
  variant = "primary";
  size = "md";
  type = "button";
  disabled = false;
  isLoading = false;
  customClass = "";
  btnClick = new EventEmitter();
  get buttonClasses() {
    const baseClasses = "btn-base";
    const variantClasses = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      accent: "btn-accent",
      outline: "btn-outline",
      danger: "btn-danger",
      ghost: "btn-ghost",
      "danger-ghost": "btn-danger-ghost"
    }[this.variant];
    const sizeClasses = {
      xs: "h-8 px-2 text-[10px]",
      sm: "h-9 px-4 text-[10px]",
      md: "h-12 px-8 text-xs",
      lg: "h-14 px-10 text-sm"
    }[this.size];
    return `${baseClasses} ${variantClasses} ${sizeClasses} ${this.customClass}`;
  }
  handleClick(event) {
    if (!this.disabled && !this.isLoading) {
      this.btnClick.emit(event);
    }
  }
  static \u0275fac = function AppButtonComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AppButtonComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AppButtonComponent, selectors: [["app-button"]], inputs: { variant: "variant", size: "size", type: "type", disabled: "disabled", isLoading: "isLoading", customClass: "customClass" }, outputs: { btnClick: "btnClick" }, standalone: true, features: [\u0275\u0275StandaloneFeature], ngContentSelectors: _c0, decls: 5, vars: 7, consts: [[1, "relative", "overflow-hidden", "group", 3, "click", "type", "disabled"], ["class", "w-4 h-4 animate-spin shrink-0", "fill", "none", "viewBox", "0 0 24 24", 4, "ngIf"], [1, "flex", "items-center", "gap-2", "transition-opacity", "duration-200"], [1, "absolute", "inset-0", "bg-white/10", "translate-x-[-101%]", "group-hover:animate-[shimmer_1.5s_infinite]", "pointer-events-none"], ["fill", "none", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "animate-spin", "shrink-0"], ["cx", "12", "cy", "12", "r", "10", "stroke", "currentColor", "stroke-width", "4", 1, "opacity-25"], ["fill", "currentColor", "d", "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z", 1, "opacity-75"]], template: function AppButtonComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275projectionDef();
      \u0275\u0275elementStart(0, "button", 0);
      \u0275\u0275listener("click", function AppButtonComponent_Template_button_click_0_listener($event) {
        return ctx.handleClick($event);
      });
      \u0275\u0275template(1, AppButtonComponent__svg_svg_1_Template, 3, 0, "svg", 1);
      \u0275\u0275elementStart(2, "span", 2);
      \u0275\u0275projection(3);
      \u0275\u0275elementEnd();
      \u0275\u0275element(4, "div", 3);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275classMap(ctx.buttonClasses);
      \u0275\u0275property("type", ctx.type)("disabled", ctx.disabled || ctx.isLoading);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.isLoading);
      \u0275\u0275advance();
      \u0275\u0275classProp("opacity-0", ctx.isLoading);
    }
  }, dependencies: [CommonModule, NgIf], styles: ["\n\n[_nghost-%COMP%] {\n  display: inline-block;\n}\nbutton[_ngcontent-%COMP%] {\n  -webkit-user-select: none;\n  user-select: none;\n  cursor: pointer;\n}\nbutton[_ngcontent-%COMP%]:disabled {\n  cursor: not-allowed;\n}\n/*# sourceMappingURL=button.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AppButtonComponent, { className: "AppButtonComponent", filePath: "src\\app\\shared\\components\\ui\\button\\button.component.ts", lineNumber: 11 });
})();

export {
  AppButtonComponent
};
//# sourceMappingURL=chunk-NRL7A6JT.js.map
