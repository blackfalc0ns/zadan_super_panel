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
  ɵɵproperty,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-IPPBI3AG.js";

// src/app/shared/components/ui/form-controls/textarea.component.ts
function AppTextareaComponent_label_1_span_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 6);
    \u0275\u0275text(1, "*");
    \u0275\u0275elementEnd();
  }
}
function AppTextareaComponent_label_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "label", 4);
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "translate");
    \u0275\u0275template(3, AppTextareaComponent_label_1_span_3_Template, 2, 0, "span", 5);
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
function AppTextareaComponent_div_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 7)(1, "p", 8);
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
var AppTextareaComponent = class _AppTextareaComponent {
  label = "";
  placeholder = "";
  rows = 4;
  dir = "auto";
  error = "";
  isTouched = false;
  isRequired = false;
  customClass = "";
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
  static \u0275fac = function AppTextareaComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AppTextareaComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AppTextareaComponent, selectors: [["app-textarea"]], inputs: { label: "label", placeholder: "placeholder", rows: "rows", dir: "dir", error: "error", isTouched: "isTouched", isRequired: "isRequired", customClass: "customClass" }, standalone: true, features: [\u0275\u0275ProvidersFeature([
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => _AppTextareaComponent),
      multi: true
    }
  ]), \u0275\u0275StandaloneFeature], decls: 5, vars: 14, consts: [[1, "space-y-2", "w-full", 3, "ngClass"], ["class", "form-label-base", 4, "ngIf"], [1, "w-full", "p-4", "rounded-xl", "bg-slate-50", "border-none", "focus:ring-2", "focus:ring-zadna-primary", "text-sm", "font-bold", "transition-shadow", "resize-none", "placeholder:text-slate-300", 3, "input", "blur", "value", "disabled", "rows", "placeholder"], ["class", "px-1 stagger-1 animate-in fade-in duration-300", 4, "ngIf"], [1, "form-label-base"], ["class", "text-red-500", 4, "ngIf"], [1, "text-red-500"], [1, "px-1", "stagger-1", "animate-in", "fade-in", "duration-300"], [1, "text-[10px]", "font-bold", "text-red-500", "italic"]], template: function AppTextareaComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0);
      \u0275\u0275template(1, AppTextareaComponent_label_1_Template, 4, 4, "label", 1);
      \u0275\u0275elementStart(2, "textarea", 2);
      \u0275\u0275pipe(3, "translate");
      \u0275\u0275listener("input", function AppTextareaComponent_Template_textarea_input_2_listener($event) {
        return ctx.onInput($event);
      })("blur", function AppTextareaComponent_Template_textarea_blur_2_listener() {
        return ctx.onBlur();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275template(4, AppTextareaComponent_div_4_Template, 4, 3, "div", 3);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275property("ngClass", ctx.customClass);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.label);
      \u0275\u0275advance();
      \u0275\u0275classProp("ring-2", ctx.isTouched && ctx.error)("ring-red-500", ctx.isTouched && ctx.error);
      \u0275\u0275property("value", ctx.value)("disabled", ctx.disabled)("rows", ctx.rows)("placeholder", \u0275\u0275pipeBind1(3, 12, ctx.placeholder));
      \u0275\u0275attribute("dir", ctx.dir);
      \u0275\u0275advance(2);
      \u0275\u0275property("ngIf", ctx.isTouched && ctx.error);
    }
  }, dependencies: [CommonModule, NgClass, NgIf, ReactiveFormsModule, TranslateModule, TranslatePipe], styles: ["\n\n[_nghost-%COMP%] {\n  display: block;\n  width: 100%;\n}\n/*# sourceMappingURL=textarea.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AppTextareaComponent, { className: "AppTextareaComponent", filePath: "src\\app\\shared\\components\\ui\\form-controls\\textarea.component.ts", lineNumber: 20 });
})();

export {
  AppTextareaComponent
};
//# sourceMappingURL=chunk-QQC6B7P6.js.map
