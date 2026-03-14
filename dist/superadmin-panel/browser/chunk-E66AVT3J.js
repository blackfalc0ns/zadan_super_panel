import {
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from "./chunk-33QDSRRV.js";
import {
  TranslateModule,
  TranslatePipe
} from "./chunk-FETH6UU2.js";
import {
  CommonModule,
  NgClass,
  NgIf,
  NgStyle,
  forwardRef,
  ɵsetClassDebugInfo,
  ɵɵProvidersFeature,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵpureFunction1,
  ɵɵpureFunction2,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-IPPBI3AG.js";

// src/app/shared/components/ui/form-controls/input.component.ts
var _c0 = [[["", "icon", ""]]];
var _c1 = ["[icon]"];
var _c2 = (a0, a1) => [a0, a1];
var _c3 = (a0) => ({ "text-align": a0 });
function AppInputComponent_label_1_span_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 8);
    \u0275\u0275text(1, "*");
    \u0275\u0275elementEnd();
  }
}
function AppInputComponent_label_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "label", 6);
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "translate");
    \u0275\u0275template(3, AppInputComponent_label_1_span_3_Template, 2, 0, "span", 7);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(2, 2, ctx_r0.label), " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", ctx_r0.isRequired);
  }
}
function AppInputComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 9);
    \u0275\u0275projection(1);
    \u0275\u0275elementEnd();
  }
}
function AppInputComponent_div_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 10)(1, "p", 11);
    \u0275\u0275text(2);
    \u0275\u0275pipe(3, "translate");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(3, 1, ctx_r0.error));
  }
}
var AppInputComponent = class _AppInputComponent {
  label = "";
  placeholder = "";
  type = "text";
  dir = "auto";
  error = "";
  isTouched = false;
  isRequired = false;
  hasIcon = false;
  customClass = "";
  inputClass = "";
  value = "";
  disabled = false;
  onChange = () => {
  };
  onTouched = () => {
  };
  writeValue(value) {
    this.value = value;
  }
  registerOnChange(fn) {
    this.onChange = fn;
  }
  registerOnTouched(fn) {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled) {
    this.disabled = isDisabled;
  }
  onInput(event) {
    const val = event.target.value;
    this.value = val;
    this.onChange(val);
  }
  onBlur() {
    this.isTouched = true;
    this.onTouched();
  }
  static \u0275fac = function AppInputComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AppInputComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AppInputComponent, selectors: [["app-input"]], inputs: { label: "label", placeholder: "placeholder", type: "type", dir: "dir", error: "error", isTouched: "isTouched", isRequired: "isRequired", hasIcon: "hasIcon", customClass: "customClass", inputClass: "inputClass" }, standalone: true, features: [\u0275\u0275ProvidersFeature([
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => _AppInputComponent),
      multi: true
    }
  ]), \u0275\u0275StandaloneFeature], ngContentSelectors: _c1, decls: 7, vars: 22, consts: [[1, "space-y-2", "w-full", 3, "ngClass"], ["class", "form-label-base", 4, "ngIf"], [1, "relative", "group"], ["class", "absolute inset-y-0 ltr:left-4 rtl:right-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-zadna-primary transition-colors z-20", 4, "ngIf"], [1, "form-input-base", "w-full", "relative", "z-10", 3, "input", "blur", "type", "value", "disabled", "placeholder", "ngClass", "ngStyle"], ["class", "px-1 stagger-1 animate-in fade-in duration-300", 4, "ngIf"], [1, "form-label-base"], ["class", "text-red-500", 4, "ngIf"], [1, "text-red-500"], [1, "absolute", "inset-y-0", "ltr:left-4", "rtl:right-4", "flex", "items-center", "pointer-events-none", "text-slate-400", "group-focus-within:text-zadna-primary", "transition-colors", "z-20"], [1, "px-1", "stagger-1", "animate-in", "fade-in", "duration-300"], [1, "text-[10px]", "font-bold", "text-red-500", "italic"]], template: function AppInputComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275projectionDef(_c0);
      \u0275\u0275elementStart(0, "div", 0);
      \u0275\u0275template(1, AppInputComponent_label_1_Template, 4, 4, "label", 1);
      \u0275\u0275elementStart(2, "div", 2);
      \u0275\u0275template(3, AppInputComponent_div_3_Template, 2, 0, "div", 3);
      \u0275\u0275elementStart(4, "input", 4);
      \u0275\u0275pipe(5, "translate");
      \u0275\u0275listener("input", function AppInputComponent_Template_input_input_4_listener($event) {
        return ctx.onInput($event);
      })("blur", function AppInputComponent_Template_input_blur_4_listener() {
        return ctx.onBlur();
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275template(6, AppInputComponent_div_6_Template, 4, 3, "div", 5);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275property("ngClass", ctx.customClass);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.label);
      \u0275\u0275advance(2);
      \u0275\u0275property("ngIf", ctx.hasIcon);
      \u0275\u0275advance();
      \u0275\u0275classProp("ring-2", ctx.isTouched && ctx.error)("ring-red-500", ctx.isTouched && ctx.error);
      \u0275\u0275property("type", ctx.type)("value", ctx.value)("disabled", ctx.disabled)("placeholder", \u0275\u0275pipeBind1(5, 15, ctx.placeholder))("ngClass", \u0275\u0275pureFunction2(17, _c2, ctx.inputClass, ctx.hasIcon ? ctx.dir === "rtl" ? "!pr-16 !pl-4" : "!pl-16 !pr-4" : "!px-4"))("ngStyle", \u0275\u0275pureFunction1(20, _c3, ctx.dir === "rtl" ? "right" : "left"));
      \u0275\u0275attribute("dir", ctx.dir);
      \u0275\u0275advance(2);
      \u0275\u0275property("ngIf", ctx.isTouched && ctx.error);
    }
  }, dependencies: [CommonModule, NgClass, NgIf, NgStyle, ReactiveFormsModule, TranslateModule, TranslatePipe], styles: ["\n\n[_nghost-%COMP%] {\n  display: block;\n  width: 100%;\n}\n/*# sourceMappingURL=input.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AppInputComponent, { className: "AppInputComponent", filePath: "src\\app\\shared\\components\\ui\\form-controls\\input.component.ts", lineNumber: 20 });
})();

export {
  AppInputComponent
};
//# sourceMappingURL=chunk-E66AVT3J.js.map
