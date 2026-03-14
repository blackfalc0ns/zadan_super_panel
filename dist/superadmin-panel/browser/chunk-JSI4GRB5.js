import {
  AppCardComponent
} from "./chunk-J7OIUMD3.js";
import {
  AppInputComponent
} from "./chunk-E66AVT3J.js";
import {
  CheckboxControlValueAccessor,
  FormBuilder,
  FormControlName,
  FormGroupDirective,
  FormsModule,
  NgControlStatus,
  NgControlStatusGroup,
  ReactiveFormsModule,
  Validators,
  ɵNgNoValidate
} from "./chunk-33QDSRRV.js";
import {
  CatalogService
} from "./chunk-TE3TZJ3N.js";
import "./chunk-PL22K63I.js";
import {
  AppButtonComponent
} from "./chunk-NRL7A6JT.js";
import "./chunk-6L7JDGMK.js";
import {
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
  EventEmitter,
  NgForOf,
  NgIf,
  Subject,
  debounceTime,
  distinctUntilChanged,
  ɵsetClassDebugInfo,
  ɵɵNgOnChangesFeature,
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
  ɵɵpureFunction1,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-IPPBI3AG.js";

// src/app/features/catalog/shared/brand-form-modal/brand-form-modal.component.ts
function BrandFormModalComponent_div_0_img_26_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 42);
  }
  if (rf & 2) {
    let tmp_2_0;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275property("src", (tmp_2_0 = ctx_r1.form.get("logoUrl")) == null ? null : tmp_2_0.value, \u0275\u0275sanitizeUrl);
  }
}
function BrandFormModalComponent_div_0_div_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 43);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(1, "svg", 44);
    \u0275\u0275element(2, "path", 45);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(3, "span", 46);
    \u0275\u0275text(4);
    \u0275\u0275pipe(5, "translate");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(5, 1, "COMMON.UPLOAD"));
  }
}
function BrandFormModalComponent_div_0_div_33_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 47);
    \u0275\u0275element(1, "div", 48);
    \u0275\u0275elementEnd();
  }
}
function BrandFormModalComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 1)(1, "div", 2);
    \u0275\u0275listener("click", function BrandFormModalComponent_div_0_Template_div_click_1_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onClose());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "app-card", 3)(3, "div", 4)(4, "div", 5)(5, "div", 6);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(6, "svg", 7);
    \u0275\u0275element(7, "path", 8);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(8, "div")(9, "h2", 9);
    \u0275\u0275text(10);
    \u0275\u0275pipe(11, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "p", 10);
    \u0275\u0275text(13);
    \u0275\u0275pipe(14, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(15, "app-button", 11);
    \u0275\u0275listener("btnClick", function BrandFormModalComponent_div_0_Template_app_button_btnClick_15_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onClose());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(16, "svg", 12);
    \u0275\u0275element(17, "path", 13);
    \u0275\u0275elementEnd()()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(18, "div", 14)(19, "form", 15);
    \u0275\u0275listener("ngSubmit", function BrandFormModalComponent_div_0_Template_form_ngSubmit_19_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onSubmit());
    });
    \u0275\u0275elementStart(20, "div", 16)(21, "label", 17);
    \u0275\u0275text(22);
    \u0275\u0275pipe(23, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "div", 18)(25, "div", 19);
    \u0275\u0275template(26, BrandFormModalComponent_div_0_img_26_Template, 1, 1, "img", 20)(27, BrandFormModalComponent_div_0_div_27_Template, 6, 3, "div", 21);
    \u0275\u0275elementStart(28, "label", 22)(29, "span", 23);
    \u0275\u0275text(30);
    \u0275\u0275pipe(31, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(32, "input", 24);
    \u0275\u0275listener("change", function BrandFormModalComponent_div_0_Template_input_change_32_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onFileSelected($event));
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(33, BrandFormModalComponent_div_0_div_33_Template, 2, 0, "div", 25);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(34, "div", 26);
    \u0275\u0275element(35, "app-input", 27);
    \u0275\u0275pipe(36, "translate");
    \u0275\u0275element(37, "app-input", 28);
    \u0275\u0275pipe(38, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(39, "div", 29)(40, "div", 5)(41, "div", 30);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(42, "svg", 12);
    \u0275\u0275element(43, "path", 31);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(44, "div")(45, "p", 32);
    \u0275\u0275text(46);
    \u0275\u0275pipe(47, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(48, "p", 33);
    \u0275\u0275text(49);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(50, "label", 34);
    \u0275\u0275element(51, "input", 35)(52, "div", 36);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(53, "div", 37)(54, "app-button", 38);
    \u0275\u0275listener("btnClick", function BrandFormModalComponent_div_0_Template_app_button_btnClick_54_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onClose());
    });
    \u0275\u0275text(55);
    \u0275\u0275pipe(56, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(57, "app-button", 39);
    \u0275\u0275listener("btnClick", function BrandFormModalComponent_div_0_Template_app_button_btnClick_57_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onSubmit());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(58, "svg", 40);
    \u0275\u0275element(59, "path", 41);
    \u0275\u0275elementEnd();
    \u0275\u0275text(60);
    \u0275\u0275pipe(61, "translate");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    let tmp_5_0;
    let tmp_6_0;
    let tmp_12_0;
    let tmp_13_0;
    let tmp_17_0;
    let tmp_18_0;
    let tmp_19_0;
    let tmp_20_0;
    let tmp_22_0;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(11, 27, ctx_r1.mode === "create" ? "BRANDS.MODAL.ADD_TITLE" : "BRANDS.MODAL.EDIT_TITLE"), " ");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(14, 29, "BRANDS.MODAL.SUBTITLE"));
    \u0275\u0275advance(6);
    \u0275\u0275property("formGroup", ctx_r1.form);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(23, 31, "BRANDS.MODAL.LOGO"));
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", (tmp_5_0 = ctx_r1.form.get("logoUrl")) == null ? null : tmp_5_0.value);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !((tmp_6_0 = ctx_r1.form.get("logoUrl")) == null ? null : tmp_6_0.value));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(31, 33, "COMMON.CHANGE"));
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", ctx_r1.isUploading);
    \u0275\u0275advance(2);
    \u0275\u0275property("label", "CATEGORIES.MODAL.NAME_AR")("placeholder", "CATEGORIES.MODAL.NAME_AR_PLACEHOLDER")("isRequired", true)("isTouched", ((tmp_12_0 = ctx_r1.form.get("nameAr")) == null ? null : tmp_12_0.touched) || false)("error", ((tmp_13_0 = ctx_r1.form.get("nameAr")) == null ? null : tmp_13_0.invalid) && ((tmp_13_0 = ctx_r1.form.get("nameAr")) == null ? null : tmp_13_0.touched) ? \u0275\u0275pipeBind1(36, 35, "VALIDATION.REQUIRED") : "");
    \u0275\u0275advance(2);
    \u0275\u0275property("label", "CATEGORIES.MODAL.NAME_EN")("placeholder", "CATEGORIES.MODAL.NAME_EN_PLACEHOLDER")("isRequired", true)("isTouched", ((tmp_17_0 = ctx_r1.form.get("nameEn")) == null ? null : tmp_17_0.touched) || false)("error", ((tmp_18_0 = ctx_r1.form.get("nameEn")) == null ? null : tmp_18_0.invalid) && ((tmp_18_0 = ctx_r1.form.get("nameEn")) == null ? null : tmp_18_0.touched) ? \u0275\u0275pipeBind1(38, 37, "VALIDATION.REQUIRED") : "");
    \u0275\u0275advance(4);
    \u0275\u0275classProp("text-emerald-500", (tmp_19_0 = ctx_r1.form.get("isActive")) == null ? null : tmp_19_0.value)("bg-emerald-50", (tmp_20_0 = ctx_r1.form.get("isActive")) == null ? null : tmp_20_0.value);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(47, 39, "COMMON.ACTIVE_STATUS"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(((tmp_22_0 = ctx_r1.form.get("isActive")) == null ? null : tmp_22_0.value) ? "Visible to customers" : "Hidden from customers");
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(56, 41, "COMMON.CANCEL"), " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("isLoading", ctx_r1.isSaving);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(61, 43, ctx_r1.mode === "create" ? "COMMON.CREATE" : "COMMON.SAVE"), " ");
  }
}
var BrandFormModalComponent = class _BrandFormModalComponent {
  fb;
  catalogService;
  translate;
  isOpen = false;
  mode = "create";
  brand = null;
  close = new EventEmitter();
  saved = new EventEmitter();
  form;
  isSaving = false;
  isUploading = false;
  activeInputLang = "ar";
  constructor(fb, catalogService, translate) {
    this.fb = fb;
    this.catalogService = catalogService;
    this.translate = translate;
    this.initForm();
  }
  ngOnInit() {
  }
  ngOnChanges(changes) {
    if (changes["brand"]) {
      if (this.mode === "edit" && this.brand) {
        this.form.patchValue(this.brand);
      } else {
        this.form.reset({ isActive: true });
      }
    }
  }
  initForm() {
    this.form = this.fb.group({
      id: [null],
      nameAr: ["", [Validators.required, Validators.maxLength(100)]],
      nameEn: ["", [Validators.required, Validators.maxLength(100)]],
      logoUrl: [""],
      isActive: [true]
    });
  }
  setLang(lang) {
    this.activeInputLang = lang;
  }
  onFileSelected(event) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.catalogService.uploadFile(file, "brands").subscribe({
        next: (res) => {
          this.form.patchValue({ logoUrl: res.url });
          this.isUploading = false;
        },
        error: (err) => {
          console.error("Upload failed", err);
          this.isUploading = false;
        }
      });
    }
  }
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    const payload = this.form.value;
    const request = this.mode === "create" ? this.catalogService.createBrand(payload) : this.catalogService.updateBrand(payload.id, payload);
    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.saved.emit();
        this.onClose();
      },
      error: (err) => {
        console.error("Save failed", err);
        this.isSaving = false;
      }
    });
  }
  onClose() {
    this.form.reset({ isActive: true });
    this.close.emit();
  }
  static \u0275fac = function BrandFormModalComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrandFormModalComponent)(\u0275\u0275directiveInject(FormBuilder), \u0275\u0275directiveInject(CatalogService), \u0275\u0275directiveInject(TranslateService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _BrandFormModalComponent, selectors: [["app-brand-form-modal"]], inputs: { isOpen: "isOpen", mode: "mode", brand: "brand" }, outputs: { close: "close", saved: "saved" }, standalone: true, features: [\u0275\u0275NgOnChangesFeature, \u0275\u0275StandaloneFeature], decls: 1, vars: 1, consts: [["class", "fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden", 4, "ngIf"], [1, "fixed", "inset-0", "z-[100]", "flex", "items-center", "justify-center", "p-4", "sm:p-6", "overflow-hidden"], [1, "absolute", "inset-0", "bg-zadna-bgDark/40", "backdrop-blur-md", "animate-in", "fade-in", "duration-300", 3, "click"], ["variant", "default", "padding", "none", "customClass", "relative w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-bottom duration-500"], [1, "px-8", "py-6", "border-b", "border-slate-50", "flex", "items-center", "justify-between", "bg-white", "sticky", "top-0", "z-20"], [1, "flex", "items-center", "gap-4"], [1, "w-12", "h-12", "rounded-2xl", "bg-zadna-primary/10", "flex", "items-center", "justify-center", "text-zadna-primary"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-6", "h-6"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"], [1, "text-xl", "font-black", "text-slate-900", "tracking-tight"], [1, "text-[10px]", "font-bold", "text-slate-400", "uppercase", "tracking-widest"], ["variant", "ghost", "size", "sm", 3, "btnClick"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M6 18L18 6M6 6l12 12"], [1, "flex-1", "overflow-y-auto", "px-8", "py-8", "custom-scrollbar", "bg-slate-50/50"], [1, "space-y-8", 3, "ngSubmit", "formGroup"], [1, "flex", "flex-col", "items-center"], [1, "form-label-base", "mb-4", "self-start"], [1, "relative", "group"], [1, "w-32", "h-32", "rounded-[2.5rem]", "bg-white", "border-2", "border-dashed", "border-slate-200", "flex", "items-center", "justify-center", "overflow-hidden", "transition-all", "group-hover:border-zadna-primary", "group-hover:shadow-xl", "group-hover:shadow-zadna-primary/5", "shadow-inner"], ["class", "w-full h-full object-contain p-4 transition-transform group-hover:scale-110", 3, "src", 4, "ngIf"], ["class", "flex flex-col items-center text-slate-300", 4, "ngIf"], [1, "absolute", "inset-0", "cursor-pointer", "opacity-0", "group-hover:opacity-100", "bg-zadna-primary/10", "transition-opacity", "flex", "items-center", "justify-center"], [1, "bg-white", "px-3", "py-1.5", "rounded-full", "text-[8px]", "font-black", "text-zadna-primary", "shadow-sm", "border", "border-zadna-primary/20"], ["type", "file", "accept", "image/*", 1, "hidden", 3, "change"], ["class", "absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[2.5rem] flex items-center justify-center z-10", 4, "ngIf"], [1, "grid", "grid-cols-1", "md:grid-cols-2", "gap-6"], ["formControlName", "nameAr", "dir", "rtl", 3, "label", "placeholder", "isRequired", "isTouched", "error"], ["formControlName", "nameEn", "dir", "ltr", 3, "label", "placeholder", "isRequired", "isTouched", "error"], [1, "flex", "items-center", "justify-between", "p-5", "bg-white", "rounded-2xl", "border", "border-slate-100", "shadow-sm", "transition-all", "hover:border-zadna-primary/20"], [1, "w-10", "h-10", "rounded-xl", "bg-slate-50", "flex", "items-center", "justify-center", "text-slate-400", "transition-colors"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M13 10V3L4 14h7v7l9-11h-7z"], [1, "text-xs", "font-black", "text-slate-800", "tracking-tight"], [1, "text-[9px]", "font-bold", "text-slate-400", "uppercase", "tracking-widest"], [1, "relative", "inline-flex", "items-center", "cursor-pointer"], ["type", "checkbox", "formControlName", "isActive", 1, "sr-only", "peer"], [1, "w-12", "h-6", "bg-slate-200", "peer-focus:outline-none", "rounded-full", "peer", "peer-checked:after:translate-x-full", "ltr:peer-checked:after:translate-x-full", "rtl:peer-checked:after:-translate-x-full", "peer-checked:after:border-white", "after:content-['']", "after:absolute", "after:top-[2px]", "ltr:after:left-[2px]", "rtl:after:right-[2px]", "after:bg-white", "after:border-gray-300", "after:border", "after:rounded-full", "after:h-5", "after:w-5", "after:transition-all", "peer-checked:bg-zadna-primary"], [1, "px-8", "py-6", "border-t", "border-slate-50", "flex", "items-center", "justify-end", "gap-4", "bg-white", "sticky", "bottom-0", "z-20"], ["variant", "ghost", 3, "btnClick"], ["variant", "primary", 3, "btnClick", "isLoading"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M5 13l4 4L19 7"], [1, "w-full", "h-full", "object-contain", "p-4", "transition-transform", "group-hover:scale-110", 3, "src"], [1, "flex", "flex-col", "items-center", "text-slate-300"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-10", "h-10", "mb-2"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"], [1, "text-[8px]", "font-black", "uppercase", "tracking-widest"], [1, "absolute", "inset-0", "bg-white/80", "backdrop-blur-sm", "rounded-[2.5rem]", "flex", "items-center", "justify-center", "z-10"], [1, "w-6", "h-6", "border-2", "border-zadna-primary", "border-t-transparent", "animate-spin", "rounded-full"]], template: function BrandFormModalComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275template(0, BrandFormModalComponent_div_0_Template, 62, 45, "div", 0);
    }
    if (rf & 2) {
      \u0275\u0275property("ngIf", ctx.isOpen);
    }
  }, dependencies: [
    CommonModule,
    NgIf,
    ReactiveFormsModule,
    \u0275NgNoValidate,
    CheckboxControlValueAccessor,
    NgControlStatus,
    NgControlStatusGroup,
    FormGroupDirective,
    FormControlName,
    TranslateModule,
    TranslatePipe,
    AppButtonComponent,
    AppInputComponent,
    AppCardComponent
  ], styles: ["\n\n.custom-scrollbar[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 4px;\n}\n.custom-scrollbar[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: transparent;\n}\n.custom-scrollbar[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: #f1f5f9;\n  border-radius: 20px;\n}\n.custom-scrollbar[_ngcontent-%COMP%]:hover::-webkit-scrollbar-thumb {\n  background: #e2e8f0;\n}\n.animate-puzzle-up[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_puzzle-up 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;\n}\n@keyframes _ngcontent-%COMP%_puzzle-up {\n  0% {\n    opacity: 0;\n    transform: translateY(30px) scale(0.95);\n  }\n  100% {\n    opacity: 1;\n    transform: translateY(0) scale(1);\n  }\n}\n/*# sourceMappingURL=brand-form-modal.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(BrandFormModalComponent, { className: "BrandFormModalComponent", filePath: "src\\app\\features\\catalog\\shared\\brand-form-modal\\brand-form-modal.component.ts", lineNumber: 25 });
})();

// src/app/features/catalog/brands/brand-list.component.ts
var _c0 = (a0) => ["/catalog/brands/view", a0];
function BrandListComponent_div_32_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 25)(1, "div", 26);
    \u0275\u0275element(2, "div", 27)(3, "div", 28);
    \u0275\u0275elementEnd()();
  }
}
function BrandListComponent_div_33_tr_17_img_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 71);
  }
  if (rf & 2) {
    const brand_r2 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("src", brand_r2.logoUrl, \u0275\u0275sanitizeUrl)("alt", brand_r2.nameEn);
  }
}
function BrandListComponent_div_33_tr_17_div_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 72);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(1, "svg", 73);
    \u0275\u0275element(2, "path", 74);
    \u0275\u0275elementEnd()();
  }
}
function BrandListComponent_div_33_tr_17_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr", 39)(1, "td", 40)(2, "span", 41);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "td", 42)(5, "div", 43)(6, "div", 44);
    \u0275\u0275template(7, BrandListComponent_div_33_tr_17_img_7_Template, 1, 2, "img", 45)(8, BrandListComponent_div_33_tr_17_div_8_Template, 3, 0, "div", 46);
    \u0275\u0275element(9, "div", 47);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "div", 48)(11, "span", 49);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "span", 50);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(15, "td", 51)(16, "div", 52)(17, "span", 53);
    \u0275\u0275text(18);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "span", 54);
    \u0275\u0275text(20);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(21, "td", 55)(22, "span", 56);
    \u0275\u0275text(23, "\u0627\u0644\u0643\u0648\u062F");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "code", 57);
    \u0275\u0275text(25);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(26, "td", 55)(27, "span", 56);
    \u0275\u0275text(28, "\u0627\u0644\u062D\u0627\u0644\u0629");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "div", 58);
    \u0275\u0275element(30, "span", 59);
    \u0275\u0275elementStart(31, "span", 60);
    \u0275\u0275text(32);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(33, "td", 61)(34, "div", 62)(35, "button", 63);
    \u0275\u0275listener("click", function BrandListComponent_div_33_tr_17_Template_button_click_35_listener($event) {
      const brand_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.editBrand(brand_r2);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(36, "svg", 64);
    \u0275\u0275element(37, "path", 65);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(38, "button", 66);
    \u0275\u0275listener("click", function BrandListComponent_div_33_tr_17_Template_button_click_38_listener($event) {
      \u0275\u0275restoreView(_r1);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(39, "svg", 64);
    \u0275\u0275element(40, "path", 67)(41, "path", 68);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(42, "button", 69);
    \u0275\u0275listener("click", function BrandListComponent_div_33_tr_17_Template_button_click_42_listener($event) {
      const brand_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.deleteBrand(brand_r2);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(43, "svg", 64);
    \u0275\u0275element(44, "path", 70);
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const brand_r2 = ctx.$implicit;
    const i_r4 = ctx.index;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(19, _c0, brand_r2.id));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(i_r4 + 1);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", brand_r2.logoUrl);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !brand_r2.logoUrl);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", ctx_r2.activeLang === "ar" ? brand_r2.nameAr : brand_r2.nameEn, " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r2.activeLang === "ar" ? brand_r2.nameEn : brand_r2.nameAr, " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", ctx_r2.activeLang === "ar" ? brand_r2.nameAr : brand_r2.nameEn, " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r2.activeLang === "ar" ? brand_r2.nameEn : brand_r2.nameAr, " ");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", brand_r2.id.toString().substring(0, 8), " ");
    \u0275\u0275advance(4);
    \u0275\u0275classProp("text-emerald-500", brand_r2.isActive)("text-slate-400", !brand_r2.isActive);
    \u0275\u0275advance();
    \u0275\u0275classProp("bg-emerald-500", brand_r2.isActive)("bg-slate-300", !brand_r2.isActive);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", brand_r2.isActive ? "\u0646\u0634\u0637" : "\u0645\u0639\u0637\u0644", " ");
    \u0275\u0275advance(6);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(21, _c0, brand_r2.id));
  }
}
function BrandListComponent_div_33_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 29)(1, "table", 30)(2, "thead", 31)(3, "tr", 32)(4, "th", 33);
    \u0275\u0275text(5, "#");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "th", 34);
    \u0275\u0275text(7, "\u0627\u0644\u0644\u0648\u062C\u0648");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "th", 35);
    \u0275\u0275text(9, "\u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "th", 36);
    \u0275\u0275text(11, "\u0627\u0644\u0643\u0648\u062F");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "th", 36);
    \u0275\u0275text(13, "\u0627\u0644\u062D\u0627\u0644\u0629");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "th", 36);
    \u0275\u0275text(15, "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(16, "tbody", 37);
    \u0275\u0275template(17, BrandListComponent_div_33_tr_17_Template, 45, 23, "tr", 38);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(17);
    \u0275\u0275property("ngForOf", ctx_r2.brands);
  }
}
function BrandListComponent_div_34_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 75)(1, "div", 76)(2, "div", 77);
    \u0275\u0275element(3, "div", 78);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(4, "svg", 79);
    \u0275\u0275element(5, "path", 80);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(6, "h3", 81);
    \u0275\u0275text(7);
    \u0275\u0275pipe(8, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "p", 82);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "div", 83)(12, "app-button", 84);
    \u0275\u0275listener("btnClick", function BrandListComponent_div_34_Template_app_button_btnClick_12_listener() {
      \u0275\u0275restoreView(_r5);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.openAddBrand());
    });
    \u0275\u0275elementStart(13, "div", 85);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(14, "svg", 86);
    \u0275\u0275element(15, "path", 87);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(16, "span");
    \u0275\u0275text(17);
    \u0275\u0275pipe(18, "translate");
    \u0275\u0275elementEnd()()()()()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(8, 3, "COMMON.NO_RESULTS"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r2.translate.currentLang === "ar" ? "\u0644\u0627 \u064A\u0648\u062C\u062F \u0646\u062A\u0627\u0626\u062C \u0644\u0644\u0628\u062D\u062B \u062D\u0627\u0644\u064A\u0627\u064B" : "We searched all corners but couldn't find matches.");
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(18, 5, "COMMON.ADD"), " \u0645\u0627\u0631\u0643\u0629");
  }
}
var BrandListComponent = class _BrandListComponent {
  catalogService;
  translate;
  isLoading = false;
  brands = [];
  // Modal State
  isModalOpen = false;
  modalMode = "create";
  selectedBrand = null;
  // Filtering
  searchTerm = "";
  searchSubject = new Subject();
  showInactive = false;
  viewMode = "grid";
  get activeLang() {
    return this.translate.currentLang || "ar";
  }
  constructor(catalogService, translate) {
    this.catalogService = catalogService;
    this.translate = translate;
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe((term) => {
      this.searchTerm = term;
      this.loadBrands();
    });
  }
  ngOnInit() {
    this.loadBrands();
  }
  loadBrands() {
    this.isLoading = true;
    this.catalogService.getBrands(this.showInactive).subscribe({
      next: (data) => {
        this.brands = data;
        this.isLoading = false;
        if (this.brands.length === 0 && !this.searchTerm) {
          this.brands = [
            { id: "b1", nameAr: "\u0627\u0644\u0645\u0631\u0627\u0639\u064A", nameEn: "Almarai", logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Almarai_Logo.svg/1200px-Almarai_Logo.svg.png", isActive: true },
            { id: "b2", nameAr: "\u062C\u0647\u064A\u0646\u0629", nameEn: "Juhayna", logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Juhayna_Logo.svg/1200px-Juhayna_Logo.svg.png", isActive: true },
            { id: "b3", nameAr: "\u0646\u0633\u062A\u0644\u0647", nameEn: "Nestle", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Nestle_text_logo.svg/2560px-Nestle_text_logo.svg.png", isActive: true },
            { id: "b4", nameAr: "\u0643\u0648\u0643\u0627 \u0643\u0648\u0644\u0627", nameEn: "Coca Cola", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/2560px-Coca-Cola_logo.svg.png", isActive: false }
          ];
        }
      },
      error: (err) => {
        console.error("Failed to load brands", err);
        this.isLoading = false;
      }
    });
  }
  onSearch(event) {
    this.searchSubject.next(event.target.value);
  }
  toggleInactive() {
    this.showInactive = !this.showInactive;
    this.loadBrands();
  }
  openAddBrand() {
    this.modalMode = "create";
    this.selectedBrand = null;
    this.isModalOpen = true;
  }
  editBrand(brand) {
    this.modalMode = "edit";
    this.selectedBrand = brand;
    this.isModalOpen = true;
  }
  deleteBrand(brand) {
    console.log("Delete brand requested:", brand.id);
  }
  static \u0275fac = function BrandListComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrandListComponent)(\u0275\u0275directiveInject(CatalogService), \u0275\u0275directiveInject(TranslateService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _BrandListComponent, selectors: [["app-brand-list"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 36, vars: 25, consts: [[1, "h-full", "flex", "flex-col", "bg-slate-50/50", "font-sans"], [1, "px-4", "md:px-10", "pt-8", "pb-4", "flex", "flex-col", "sm:flex-row", "items-start", "sm:items-end", "justify-between", "gap-6"], [1, "text-start", "w-full", "sm:w-auto", "space-y-1", "animate-in", "slide-in-from-right-10", "duration-700"], [1, "flex", "justify-start", "items-center", "gap-2", "text-[10px]", "sm:text-[11px]", "font-bold", "text-zadna-primary/80", "uppercase", "tracking-widest", "mb-1.5"], [1, "w-1", "h-1", "rounded-full", "bg-zadna-primary/20"], [1, "text-zadna-primary"], [1, "text-xl", "sm:text-2xl", "font-black", "text-slate-900", "tracking-tight", "leading-tight"], [1, "text-[10px]", "sm:text-[12px]", "font-medium", "text-slate-400", "max-w-md"], [1, "flex", "items-center", "gap-4", "animate-in", "slide-in-from-left-10", "duration-700"], ["variant", "primary", "customClass", "rounded-[1.5rem] shadow-2xl shadow-zadna-primary/20 hover:scale-105 transition-all transform px-8 py-3.5 group", 3, "btnClick"], [1, "flex", "items-center", "gap-3"], [1, "w-8", "h-8", "rounded-xl", "bg-white/20", "flex", "items-center", "justify-center", "group-hover:rotate-90", "transition-transform", "duration-500"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "text-white"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "3", "d", "M12 4v16m8-8H4"], [1, "font-black", "uppercase", "tracking-[0.1em]", "text-xs", "sm:text-sm"], [1, "flex-1", "min-h-0", "px-4", "md:px-10", "py-6", "max-w-[120rem]", "mx-auto", "w-full", "space-y-6"], [1, "flex", "flex-col", "sm:flex-row", "items-center", "gap-4"], [1, "flex-1", "w-full", "max-w-md"], [3, "input", "placeholder", "dir", "inputClass", "customClass", "hasIcon"], ["icon", "", "fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "text-zadna-primary/60"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"], ["class", "flex flex-col items-center justify-center py-40 animate-pulse", 4, "ngIf"], ["class", "extraordinary-table-container w-full p-0 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-1000", 4, "ngIf"], ["class", "relative p-20 text-center animate-in zoom-in duration-700", 4, "ngIf"], [3, "close", "saved", "isOpen", "mode", "brand"], [1, "flex", "flex-col", "items-center", "justify-center", "py-40", "animate-pulse"], [1, "relative", "w-24", "h-24"], [1, "absolute", "inset-0", "rounded-full", "border-[6px]", "border-zadna-primary/10"], [1, "absolute", "inset-0", "rounded-full", "border-[6px]", "border-t-zadna-primary", "animate-spin"], [1, "extraordinary-table-container", "w-full", "p-0", "overflow-hidden", "animate-in", "fade-in", "slide-in-from-bottom-10", "duration-1000"], [1, "w-full", "block", "sm:table", "sm:table-fixed", "border-separate", "border-spacing-y-0", "px-2"], [1, "hidden", "sm:table-header-group", "border-b", "border-slate-100/50"], [1, "sm:table-row"], [1, "text-center", "w-[5%]", "py-5", "text-[10px]", "font-black", "uppercase", "text-slate-400/70", "tracking-tighter"], [1, "text-center", "w-[10%]", "py-5", "text-[10px]", "font-black", "uppercase", "text-slate-400/70", "tracking-tighter"], [1, "text-start", "w-[25%]", "py-5", "text-[10px]", "font-black", "uppercase", "text-slate-400/70", "tracking-tighter", "px-2"], [1, "text-center", "w-[20%]", "py-5", "text-[10px]", "font-black", "uppercase", "text-slate-400/70", "tracking-tighter"], [1, "block", "sm:table-row-group", "stagger-rows", "w-full"], ["class", "table-row-object group flex flex-col sm:table-row bg-white/70 backdrop-blur-md sm:bg-white/50 rounded-[2rem] shadow-sm sm:shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-5 sm:p-0 mb-4 border border-white/80 sm:border-slate-100/60 relative w-full hover:bg-white transition-all duration-500 cursor-pointer", 3, "routerLink", 4, "ngFor", "ngForOf"], [1, "table-row-object", "group", "flex", "flex-col", "sm:table-row", "bg-white/70", "backdrop-blur-md", "sm:bg-white/50", "rounded-[2rem]", "shadow-sm", "sm:shadow-[0_8px_30px_rgb(0,0,0,0.02)]", "p-5", "sm:p-0", "mb-4", "border", "border-white/80", "sm:border-slate-100/60", "relative", "w-full", "hover:bg-white", "transition-all", "duration-500", "cursor-pointer", 3, "routerLink"], [1, "hidden", "sm:table-cell", "text-center", "align-middle", "sm:w-[5%]"], [1, "text-[10px]", "sm:text-[11px]", "font-black", "text-slate-300", "transition-colors"], [1, "block", "sm:table-cell", "py-0", "sm:py-4", "align-middle", "sm:w-[10%]", "mb-4", "sm:mb-0"], [1, "flex", "flex-row", "sm:flex-col", "items-center", "gap-4", "sm:gap-0", "sm:justify-center"], [1, "relative", "w-14", "h-14", "sm:w-12", "sm:h-12", "shrink-0", "bg-[#f0f9fa]/80", "rounded-[1.2rem]", "border", "border-[#e0f2f4]", "flex", "items-center", "justify-center", "transition-all", "group-hover:scale-105", "group-hover:rotate-2", "shadow-sm"], ["class", "w-3/4 h-3/4 object-contain transition-transform duration-500 group-hover:scale-110", 3, "src", "alt", 4, "ngIf"], ["class", "text-zadna-primary/40", 4, "ngIf"], [1, "absolute", "-top-1", "-right-1", "w-2.5", "h-2.5", "bg-white", "border-2", "border-[#e0f2f4]", "rounded-full", "shadow-sm"], [1, "flex", "flex-col", "text-start", "sm:hidden", "px-0"], [1, "text-[15px]", "font-black", "text-slate-900", "leading-tight", "mb-0.5"], [1, "text-[10px]", "font-bold", "text-slate-400/80", "uppercase", "tracking-widest", "leading-none"], [1, "hidden", "sm:table-cell", "border-b", "border-dashed", "border-slate-100", "sm:border-none", "align-middle", "sm:w-[25%]", "px-2"], [1, "flex", "flex-col", "text-start"], [1, "text-[13px]", "sm:text-[14px]", "font-black", "text-slate-900", "group-hover:text-zadna-primary", "transition-colors", "leading-snug"], [1, "text-[9px]", "font-bold", "text-slate-400/80", "uppercase", "tracking-widest", "mt-0.5"], [1, "flex", "sm:table-cell", "justify-between", "items-center", "sm:text-center", "py-3.5", "sm:py-0", "border-b", "border-dashed", "border-slate-100", "sm:border-none", "align-middle", "sm:w-[20%]"], [1, "sm:hidden", "text-[11px]", "font-black", "uppercase", "text-slate-400/80", "tracking-widest"], [1, "text-[10px]", "font-bold", "text-indigo-500", "bg-indigo-50/50", "px-3", "py-1", "rounded-xl", "border", "border-indigo-100/50", "uppercase", "tracking-wider"], [1, "inline-flex", "items-center", "gap-2", "px-3", "py-1.5", "rounded-full", "border", "border-slate-50", "bg-white", "shadow-sm"], [1, "w-1.5", "h-1.5", "rounded-full", "animate-pulse"], [1, "text-[10px]", "font-black", "tracking-tight", "uppercase"], [1, "flex", "sm:table-cell", "justify-center", "items-center", "pt-4", "sm:pt-0", "mt-2", "sm:mt-0", "align-middle", "sm:w-[20%]"], [1, "flex", "flex-row-reverse", "items-center", "justify-center", "gap-3", "sm:gap-1.5", "w-full", "sm:w-auto"], [1, "w-9", "h-9", "sm:w-8", "sm:h-8", "rounded-xl", "bg-slate-50", "text-slate-400", "flex", "items-center", "justify-center", "hover:bg-zadna-primary", "hover:text-white", "transition-all", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4.5", "h-4.5", "sm:w-4", "sm:h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"], [1, "w-9", "h-9", "sm:w-8", "sm:h-8", "rounded-xl", "bg-slate-50", "text-slate-400", "flex", "items-center", "justify-center", "hover:bg-blue-500", "hover:text-white", "transition-all", 3, "click", "routerLink"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15 12a3 3 0 11-6 0 3 3 0 016 0z"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"], [1, "w-9", "h-9", "sm:w-8", "sm:h-8", "rounded-xl", "bg-red-50", "text-red-500", "flex", "items-center", "justify-center", "hover:bg-red-500", "hover:text-white", "transition-all", 3, "click"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"], [1, "w-3/4", "h-3/4", "object-contain", "transition-transform", "duration-500", "group-hover:scale-110", 3, "src", "alt"], [1, "text-zadna-primary/40"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-6", "h-6", "sm:w-5", "sm:h-5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.8", "d", "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"], [1, "relative", "p-20", "text-center", "animate-in", "zoom-in", "duration-700"], [1, "max-w-md", "mx-auto", "space-y-6"], [1, "w-32", "h-32", "bg-white", "rounded-[3rem]", "shadow-2xl", "flex", "items-center", "justify-center", "mx-auto", "text-slate-100", "relative", "group"], [1, "absolute", "inset-0", "bg-zadna-primary/5", "rounded-[3rem]", "group-hover:scale-110", "transition-transform", "duration-500"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-16", "h-16", "relative", "z-10"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"], [1, "text-3xl", "font-black", "text-slate-900", "tracking-tight"], [1, "text-sm", "font-bold", "text-slate-400", "leading-relaxed"], [1, "pt-6"], ["variant", "primary", 3, "btnClick"], [1, "flex", "items-center", "gap-2"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M12 4v16m8-8H4"]], template: function BrandListComponent_Template(rf, ctx) {
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
      \u0275\u0275text(15, " \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0648\u062A\u062A\u0628\u0639 \u0627\u0646\u062A\u0634\u0627\u0631 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0633\u062C\u0644\u0629 \u0641\u064A \u0627\u0644\u0646\u0638\u0627\u0645 ");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(16, "div", 8)(17, "app-button", 9);
      \u0275\u0275listener("btnClick", function BrandListComponent_Template_app_button_btnClick_17_listener() {
        return ctx.openAddBrand();
      });
      \u0275\u0275elementStart(18, "div", 10)(19, "div", 11);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(20, "svg", 12);
      \u0275\u0275element(21, "path", 13);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(22, "span", 14);
      \u0275\u0275text(23);
      \u0275\u0275pipe(24, "translate");
      \u0275\u0275elementEnd()()()()();
      \u0275\u0275elementStart(25, "div", 15)(26, "div", 16)(27, "div", 17)(28, "app-input", 18);
      \u0275\u0275pipe(29, "translate");
      \u0275\u0275listener("input", function BrandListComponent_Template_app_input_input_28_listener($event) {
        return ctx.onSearch($event);
      });
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(30, "svg", 19);
      \u0275\u0275element(31, "path", 20);
      \u0275\u0275elementEnd()()()();
      \u0275\u0275template(32, BrandListComponent_div_32_Template, 4, 0, "div", 21)(33, BrandListComponent_div_33_Template, 18, 1, "div", 22)(34, BrandListComponent_div_34_Template, 19, 7, "div", 23);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(35, "app-brand-form-modal", 24);
      \u0275\u0275listener("close", function BrandListComponent_Template_app_brand_form_modal_close_35_listener() {
        return ctx.isModalOpen = false;
      })("saved", function BrandListComponent_Template_app_brand_form_modal_saved_35_listener() {
        return ctx.loadBrands();
      });
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 15, "SIDEBAR.CATALOG"));
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(10, 17, "SIDEBAR.BRANDS"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(13, 19, "SIDEBAR.BRANDS"), " \u0648\u0627\u0644\u0645\u0627\u0631\u0643\u0627\u062A ");
      \u0275\u0275advance(11);
      \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(24, 21, "COMMON.ADD"), " \u0645\u0627\u0631\u0643\u0629");
      \u0275\u0275advance(5);
      \u0275\u0275property("placeholder", \u0275\u0275pipeBind1(29, 23, "BRANDS.SEARCH_PLACEHOLDER"))("dir", ctx.translate.currentLang === "ar" ? "rtl" : "ltr")("inputClass", "!bg-transparent !border-0 !ring-0 !text-zadna-primary !placeholder-zadna-primary/40")("customClass", "bg-white/70 backdrop-blur-xl border border-slate-200/60 focus-within:bg-white focus-within:border-zadna-primary/50 focus-within:shadow-[0_8px_30px_-5px_rgba(18,124,140,0.15)] hover:bg-white/80 transition-all shadow-sm rounded-[1.5rem] overflow-hidden")("hasIcon", true);
      \u0275\u0275advance(4);
      \u0275\u0275property("ngIf", ctx.isLoading);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.isLoading && ctx.brands.length > 0);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.isLoading && ctx.brands.length === 0);
      \u0275\u0275advance();
      \u0275\u0275property("isOpen", ctx.isModalOpen)("mode", ctx.modalMode)("brand", ctx.selectedBrand);
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
    BrandFormModalComponent,
    AppButtonComponent,
    AppInputComponent
  ], styles: ["\n\n.stagger-item[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_puzzle-up 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;\n}\n@keyframes _ngcontent-%COMP%_puzzle-up {\n  0% {\n    opacity: 0;\n    transform: translateY(20px) scale(0.98);\n  }\n  100% {\n    opacity: 1;\n    transform: translateY(0) scale(1);\n  }\n}\n.custom-scrollbar[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 4px;\n}\n.custom-scrollbar[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: transparent;\n}\n.custom-scrollbar[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: #e2e8f0;\n  border-radius: 20px;\n}\n.custom-scrollbar[_ngcontent-%COMP%]:hover::-webkit-scrollbar-thumb {\n  background: #cbd5e1;\n}\n/*# sourceMappingURL=brand-list.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(BrandListComponent, { className: "BrandListComponent", filePath: "src\\app\\features\\catalog\\brands\\brand-list.component.ts", lineNumber: 32 });
})();
export {
  BrandListComponent
};
//# sourceMappingURL=chunk-JSI4GRB5.js.map
