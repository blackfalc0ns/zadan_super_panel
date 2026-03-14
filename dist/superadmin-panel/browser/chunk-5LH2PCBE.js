import {
  CommonModule,
  EventEmitter,
  NgForOf,
  NgIf,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵdefineComponent,
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
  ɵɵproperty,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-IPPBI3AG.js";

// src/app/shared/components/ui/detail-header/detail-header.component.ts
function DetailHeaderComponent_div_6_nav_1_ng_container_1_span_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "\u2022");
    \u0275\u0275elementEnd();
  }
}
function DetailHeaderComponent_div_6_nav_1_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275elementStart(1, "span", 13);
    \u0275\u0275listener("click", function DetailHeaderComponent_div_6_nav_1_ng_container_1_Template_span_click_1_listener() {
      const breadcrumb_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.onBreadcrumbClick(breadcrumb_r2));
    });
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275template(3, DetailHeaderComponent_div_6_nav_1_ng_container_1_span_3_Template, 2, 0, "span", 6);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const breadcrumb_r2 = ctx.$implicit;
    const last_r4 = ctx.last;
    \u0275\u0275advance();
    \u0275\u0275classProp("cursor-pointer", breadcrumb_r2.action)("hover:text-zadna-primary", breadcrumb_r2.action)("text-zadna-primary", last_r4);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", breadcrumb_r2.label, " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !last_r4);
  }
}
function DetailHeaderComponent_div_6_nav_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "nav", 11);
    \u0275\u0275template(1, DetailHeaderComponent_div_6_nav_1_ng_container_1_Template, 4, 8, "ng-container", 12);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r2.breadcrumbs);
  }
}
function DetailHeaderComponent_div_6_h1_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "h1", 14);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r2.title);
  }
}
function DetailHeaderComponent_div_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div");
    \u0275\u0275template(1, DetailHeaderComponent_div_6_nav_1_Template, 2, 1, "nav", 9)(2, DetailHeaderComponent_div_6_h1_2_Template, 2, 1, "h1", 10);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r2.breadcrumbs.length > 0);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r2.title);
  }
}
function DetailHeaderComponent__svg_svg_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 15);
    \u0275\u0275element(1, "path", 16);
    \u0275\u0275elementEnd();
  }
}
function DetailHeaderComponent__svg_svg_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 15);
    \u0275\u0275element(1, "path", 16);
    \u0275\u0275elementEnd();
  }
}
var DetailHeaderComponent = class _DetailHeaderComponent {
  title = "";
  breadcrumbs = [];
  actionButtonLabel = "\u062A\u0639\u062F\u064A\u0644";
  actionButtonIcon = "edit";
  isActionDisabled = false;
  backClick = new EventEmitter();
  actionClick = new EventEmitter();
  onBackClick() {
    this.backClick.emit();
  }
  onActionClick() {
    this.actionClick.emit();
  }
  onBreadcrumbClick(breadcrumb) {
    if (breadcrumb.action) {
      breadcrumb.action();
    }
  }
  static \u0275fac = function DetailHeaderComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DetailHeaderComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _DetailHeaderComponent, selectors: [["app-detail-header"]], inputs: { title: "title", breadcrumbs: "breadcrumbs", actionButtonLabel: "actionButtonLabel", actionButtonIcon: "actionButtonIcon", isActionDisabled: "isActionDisabled" }, outputs: { backClick: "backClick", actionClick: "actionClick" }, standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 11, vars: 5, consts: [[1, "max-w-7xl", "mx-auto", "mb-0", "relative", "z-10"], [1, "flex", "justify-between", "items-center", "p-4", "md:p-6"], [1, "flex", "items-center", "gap-4"], [1, "w-10", "h-10", "rounded-full", "bg-white/60", "backdrop-blur-xl", "border", "border-white/40", "shadow-sm", "flex", "items-center", "justify-center", "hover:bg-white", "transition-all", "active:scale-95", "text-slate-500", "hover:text-zadna-primary", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "rtl:rotate-180"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M10 19l-7-7m0 0l7-7m-7 7h18"], [4, "ngIf"], [1, "bg-zadna-primary", "text-white", "px-6", "py-2.5", "rounded-full", "flex", "items-center", "gap-2", "font-medium", "hover:bg-zadna-primaryDark", "transition-all", "active:scale-95", "shadow-lg", "shadow-zadna-primary/30", "disabled:opacity-50", "disabled:cursor-not-allowed", 3, "click", "disabled"], ["class", "w-4 h-4", "fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 4, "ngIf"], ["class", "flex text-xs font-medium text-slate-500 gap-2 mb-1", 4, "ngIf"], ["class", "text-3xl font-bold text-slate-900", 4, "ngIf"], [1, "flex", "text-xs", "font-medium", "text-slate-500", "gap-2", "mb-1"], [4, "ngFor", "ngForOf"], [3, "click"], [1, "text-3xl", "font-bold", "text-slate-900"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"]], template: function DetailHeaderComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "header", 1)(2, "div", 2)(3, "button", 3);
      \u0275\u0275listener("click", function DetailHeaderComponent_Template_button_click_3_listener() {
        return ctx.onBackClick();
      });
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(4, "svg", 4);
      \u0275\u0275element(5, "path", 5);
      \u0275\u0275elementEnd()();
      \u0275\u0275template(6, DetailHeaderComponent_div_6_Template, 3, 2, "div", 6);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(7, "button", 7);
      \u0275\u0275listener("click", function DetailHeaderComponent_Template_button_click_7_listener() {
        return ctx.onActionClick();
      });
      \u0275\u0275template(8, DetailHeaderComponent__svg_svg_8_Template, 2, 0, "svg", 8)(9, DetailHeaderComponent__svg_svg_9_Template, 2, 0, "svg", 8);
      \u0275\u0275text(10);
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(6);
      \u0275\u0275property("ngIf", ctx.title || ctx.breadcrumbs.length > 0);
      \u0275\u0275advance();
      \u0275\u0275property("disabled", ctx.isActionDisabled);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.actionButtonIcon === "edit");
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.actionButtonIcon === "save");
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" ", ctx.actionButtonLabel, " ");
    }
  }, dependencies: [CommonModule, NgForOf, NgIf], encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(DetailHeaderComponent, { className: "DetailHeaderComponent", filePath: "src\\app\\shared\\components\\ui\\detail-header\\detail-header.component.ts", lineNumber: 10 });
})();

export {
  DetailHeaderComponent
};
//# sourceMappingURL=chunk-5LH2PCBE.js.map
