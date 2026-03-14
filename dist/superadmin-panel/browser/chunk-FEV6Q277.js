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
  NgControlStatus,
  NgControlStatusGroup,
  ReactiveFormsModule,
  Validators,
  ɵNgNoValidate
} from "./chunk-33QDSRRV.js";
import {
  CatalogService
} from "./chunk-TE3TZJ3N.js";
import {
  AppButtonComponent
} from "./chunk-NRL7A6JT.js";
import {
  TranslateModule,
  TranslatePipe,
  TranslateService
} from "./chunk-FETH6UU2.js";
import {
  CommonModule,
  EventEmitter,
  NgIf,
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
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-IPPBI3AG.js";

// src/app/features/catalog/shared/category-form-modal/category-form-modal.component.ts
function CategoryFormModalComponent_div_0_div_20_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 46)(1, "div", 47);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(2, "svg", 44);
    \u0275\u0275element(3, "path", 48);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(4, "div")(5, "p", 49);
    \u0275\u0275text(6);
    \u0275\u0275pipe(7, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "p", 50);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(7, 2, "CATEGORIES.MODAL.PARENT"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.translate.currentLang === "ar" ? ctx_r1.parentCategory.nameAr : ctx_r1.parentCategory.nameEn);
  }
}
function CategoryFormModalComponent_div_0_img_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 51);
  }
  if (rf & 2) {
    let tmp_2_0;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275property("src", (tmp_2_0 = ctx_r1.form.get("imageUrl")) == null ? null : tmp_2_0.value, \u0275\u0275sanitizeUrl);
  }
}
function CategoryFormModalComponent_div_0_div_28_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 52);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(1, "svg", 53);
    \u0275\u0275element(2, "path", 54);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(3, "span", 55);
    \u0275\u0275text(4);
    \u0275\u0275pipe(5, "translate");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(5, 1, "COMMON.UPLOAD"));
  }
}
function CategoryFormModalComponent_div_0_div_34_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 56);
    \u0275\u0275element(1, "div", 57);
    \u0275\u0275elementEnd();
  }
}
function CategoryFormModalComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 1)(1, "div", 2);
    \u0275\u0275listener("click", function CategoryFormModalComponent_div_0_Template_div_click_1_listener() {
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
    \u0275\u0275listener("btnClick", function CategoryFormModalComponent_div_0_Template_app_button_btnClick_15_listener() {
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
    \u0275\u0275listener("ngSubmit", function CategoryFormModalComponent_div_0_Template_form_ngSubmit_19_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onSubmit());
    });
    \u0275\u0275template(20, CategoryFormModalComponent_div_0_div_20_Template, 10, 4, "div", 16);
    \u0275\u0275elementStart(21, "div", 17)(22, "label", 18);
    \u0275\u0275text(23);
    \u0275\u0275pipe(24, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "div", 19)(26, "div", 20);
    \u0275\u0275template(27, CategoryFormModalComponent_div_0_img_27_Template, 1, 1, "img", 21)(28, CategoryFormModalComponent_div_0_div_28_Template, 6, 3, "div", 22);
    \u0275\u0275elementStart(29, "label", 23)(30, "span", 24);
    \u0275\u0275text(31);
    \u0275\u0275pipe(32, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(33, "input", 25);
    \u0275\u0275listener("change", function CategoryFormModalComponent_div_0_Template_input_change_33_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onFileSelected($event));
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(34, CategoryFormModalComponent_div_0_div_34_Template, 2, 0, "div", 26);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(35, "div", 27);
    \u0275\u0275element(36, "app-input", 28);
    \u0275\u0275pipe(37, "translate");
    \u0275\u0275element(38, "app-input", 29);
    \u0275\u0275pipe(39, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(40, "div", 30)(41, "div", 31)(42, "div", 5)(43, "div", 32);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(44, "svg", 12);
    \u0275\u0275element(45, "path", 33);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(46, "div")(47, "p", 34);
    \u0275\u0275text(48);
    \u0275\u0275pipe(49, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(50, "p", 35);
    \u0275\u0275text(51);
    \u0275\u0275pipe(52, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(53, "label", 36);
    \u0275\u0275element(54, "input", 37)(55, "div", 38);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(56, "div", 39);
    \u0275\u0275element(57, "app-input", 40);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(58, "div", 41)(59, "app-button", 42);
    \u0275\u0275listener("btnClick", function CategoryFormModalComponent_div_0_Template_app_button_btnClick_59_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onClose());
    });
    \u0275\u0275text(60);
    \u0275\u0275pipe(61, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(62, "app-button", 43);
    \u0275\u0275listener("btnClick", function CategoryFormModalComponent_div_0_Template_app_button_btnClick_62_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onSubmit());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(63, "svg", 44);
    \u0275\u0275element(64, "path", 45);
    \u0275\u0275elementEnd();
    \u0275\u0275text(65);
    \u0275\u0275pipe(66, "translate");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    let tmp_6_0;
    let tmp_7_0;
    let tmp_13_0;
    let tmp_14_0;
    let tmp_18_0;
    let tmp_19_0;
    let tmp_20_0;
    let tmp_21_0;
    let tmp_23_0;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(11, 32, ctx_r1.mode === "create" ? "CATEGORIES.MODAL.ADD_TITLE" : "CATEGORIES.MODAL.EDIT_TITLE"), " ");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(14, 34, ctx_r1.levelNameKey));
    \u0275\u0275advance(6);
    \u0275\u0275property("formGroup", ctx_r1.form);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.parentCategory);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(24, 36, "CATEGORIES.MODAL.IMAGE"));
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", (tmp_6_0 = ctx_r1.form.get("imageUrl")) == null ? null : tmp_6_0.value);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !((tmp_7_0 = ctx_r1.form.get("imageUrl")) == null ? null : tmp_7_0.value));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(32, 38, "COMMON.CHANGE"));
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", ctx_r1.isUploading);
    \u0275\u0275advance(2);
    \u0275\u0275property("label", "CATEGORIES.MODAL.NAME_AR")("placeholder", "CATEGORIES.MODAL.NAME_AR_PLACEHOLDER")("isRequired", true)("isTouched", ((tmp_13_0 = ctx_r1.form.get("nameAr")) == null ? null : tmp_13_0.touched) || false)("error", ((tmp_14_0 = ctx_r1.form.get("nameAr")) == null ? null : tmp_14_0.invalid) && ((tmp_14_0 = ctx_r1.form.get("nameAr")) == null ? null : tmp_14_0.touched) ? \u0275\u0275pipeBind1(37, 40, "VALIDATION.REQUIRED") : "");
    \u0275\u0275advance(2);
    \u0275\u0275property("label", "CATEGORIES.MODAL.NAME_EN")("placeholder", "CATEGORIES.MODAL.NAME_EN_PLACEHOLDER")("isRequired", true)("isTouched", ((tmp_18_0 = ctx_r1.form.get("nameEn")) == null ? null : tmp_18_0.touched) || false)("error", ((tmp_19_0 = ctx_r1.form.get("nameEn")) == null ? null : tmp_19_0.invalid) && ((tmp_19_0 = ctx_r1.form.get("nameEn")) == null ? null : tmp_19_0.touched) ? \u0275\u0275pipeBind1(39, 42, "VALIDATION.REQUIRED") : "");
    \u0275\u0275advance(5);
    \u0275\u0275classProp("text-emerald-500", (tmp_20_0 = ctx_r1.form.get("isActive")) == null ? null : tmp_20_0.value)("bg-emerald-50", (tmp_21_0 = ctx_r1.form.get("isActive")) == null ? null : tmp_21_0.value);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(49, 44, "COMMON.ACTIVE_STATUS"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(52, 46, ((tmp_23_0 = ctx_r1.form.get("isActive")) == null ? null : tmp_23_0.value) ? "COMMON.VISIBLE" : "COMMON.HIDDEN"));
    \u0275\u0275advance(6);
    \u0275\u0275property("type", "number")("label", "CATEGORIES.MODAL.ORDER")("placeholder", "0")("isRequired", true);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(61, 48, "COMMON.CANCEL"), " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("isLoading", ctx_r1.isSaving);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(66, 50, ctx_r1.mode === "create" ? "COMMON.CREATE" : "COMMON.SAVE"), " ");
  }
}
var CategoryFormModalComponent = class _CategoryFormModalComponent {
  fb;
  catalogService;
  translate;
  isOpen = false;
  mode = "create";
  levelNameKey = "";
  initialData = null;
  parentCategory = null;
  close = new EventEmitter();
  saved = new EventEmitter();
  form;
  activeInputLang = "ar";
  isUploading = false;
  isSaving = false;
  constructor(fb, catalogService, translate) {
    this.fb = fb;
    this.catalogService = catalogService;
    this.translate = translate;
    this.form = this.fb.group({
      id: [""],
      nameAr: ["", [Validators.required, Validators.minLength(2)]],
      nameEn: ["", [Validators.required, Validators.minLength(2)]],
      imageUrl: [""],
      parentCategoryId: [null],
      displayOrder: [1, [Validators.required, Validators.min(0)]],
      isActive: [true]
    });
  }
  ngOnChanges(changes) {
    if (this.isOpen && (changes["isOpen"] || changes["initialData"] || changes["mode"])) {
      if (this.mode === "edit" && this.initialData) {
        this.form.patchValue(this.initialData);
      } else if (this.mode === "create") {
        this.resetForm();
        if (this.parentCategory) {
          this.form.patchValue({ parentCategoryId: this.parentCategory.id });
        }
        this.autoCalculateOrder();
      }
    }
    if (changes["isOpen"] && !changes["isOpen"].currentValue) {
      this.resetForm();
    }
  }
  resetForm() {
    this.form.reset({
      displayOrder: 1,
      isActive: true,
      parentCategoryId: this.parentCategory ? this.parentCategory.id : null
    });
  }
  autoCalculateOrder() {
    const parentId = this.parentCategory?.id || void 0;
    this.catalogService.getCategories(parentId).subscribe((categories) => {
      if (categories && categories.length > 0) {
        const maxOrder = Math.max(...categories.map((c) => c.displayOrder || 0));
        this.form.patchValue({ displayOrder: maxOrder + 1 });
      } else {
        this.form.patchValue({ displayOrder: 1 });
      }
    });
  }
  onSubmit() {
    if (this.form.valid) {
      this.isSaving = true;
      const data = this.form.value;
      if (this.mode === "create") {
        this.catalogService.createCategory(data).subscribe({
          next: (result) => {
            this.isSaving = false;
            this.saved.emit(result);
            this.onClose();
          },
          error: (err) => {
            console.error("Create failed:", err);
            this.isSaving = false;
          }
        });
      } else {
        this.catalogService.updateCategory(data.id, data).subscribe({
          next: () => {
            this.isSaving = false;
            this.saved.emit(data);
            this.onClose();
          },
          error: (err) => {
            console.error("Update failed:", err);
            this.isSaving = false;
          }
        });
      }
    } else {
      this.form.markAllAsTouched();
      if (this.form.get("nameAr")?.invalid) {
        this.activeInputLang = "ar";
      } else if (this.form.get("nameEn")?.invalid) {
        this.activeInputLang = "en";
      }
    }
  }
  onClose() {
    this.close.emit();
  }
  setLang(lang) {
    this.activeInputLang = lang;
  }
  onFileSelected(event) {
    const file = event.target.files[0];
    if (!file)
      return;
    this.isUploading = true;
    this.catalogService.uploadFile(file, "categories").subscribe({
      next: (res) => {
        this.form.patchValue({ imageUrl: res.url });
        this.isUploading = false;
      },
      error: (err) => {
        console.error("Upload failed:", err);
        this.isUploading = false;
      }
    });
  }
  static \u0275fac = function CategoryFormModalComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CategoryFormModalComponent)(\u0275\u0275directiveInject(FormBuilder), \u0275\u0275directiveInject(CatalogService), \u0275\u0275directiveInject(TranslateService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _CategoryFormModalComponent, selectors: [["app-category-form-modal"]], inputs: { isOpen: "isOpen", mode: "mode", levelNameKey: "levelNameKey", initialData: "initialData", parentCategory: "parentCategory" }, outputs: { close: "close", saved: "saved" }, standalone: true, features: [\u0275\u0275NgOnChangesFeature, \u0275\u0275StandaloneFeature], decls: 1, vars: 1, consts: [["class", "fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden", 4, "ngIf"], [1, "fixed", "inset-0", "z-[100]", "flex", "items-center", "justify-center", "p-4", "sm:p-6", "overflow-hidden"], [1, "absolute", "inset-0", "bg-zadna-bgDark/40", "backdrop-blur-md", "animate-in", "fade-in", "duration-300", 3, "click"], ["variant", "default", "padding", "none", "customClass", "relative w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-bottom duration-500 overflow-hidden"], [1, "px-8", "py-6", "border-b", "border-slate-50", "flex", "items-center", "justify-between", "bg-white", "sticky", "top-0", "z-20"], [1, "flex", "items-center", "gap-4"], [1, "w-12", "h-12", "rounded-2xl", "bg-zadna-primary/10", "flex", "items-center", "justify-center", "text-zadna-primary"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-6", "h-6"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"], [1, "text-xl", "font-black", "text-slate-900", "tracking-tight"], [1, "text-[10px]", "font-bold", "text-slate-400", "uppercase", "tracking-widest"], ["variant", "ghost", "size", "sm", 3, "btnClick"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M6 18L18 6M6 6l12 12"], [1, "flex-1", "overflow-y-auto", "px-8", "py-8", "custom-scrollbar", "bg-slate-50/50"], [1, "space-y-8", 3, "ngSubmit", "formGroup"], ["class", "p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center gap-4 animate-in fade-in slide-in-top duration-500", 4, "ngIf"], [1, "flex", "flex-col", "items-center"], [1, "form-label-base", "mb-4", "self-start"], [1, "relative", "group"], [1, "w-32", "h-32", "rounded-[2.5rem]", "bg-white", "border-2", "border-dashed", "border-slate-200", "flex", "items-center", "justify-center", "overflow-hidden", "transition-all", "group-hover:border-zadna-primary", "group-hover:shadow-xl", "group-hover:shadow-zadna-primary/5", "shadow-inner"], ["class", "w-full h-full object-cover transition-transform group-hover:scale-110", 3, "src", 4, "ngIf"], ["class", "flex flex-col items-center text-slate-300", 4, "ngIf"], [1, "absolute", "inset-0", "cursor-pointer", "opacity-0", "group-hover:opacity-100", "bg-zadna-primary/10", "transition-opacity", "flex", "items-center", "justify-center"], [1, "bg-white", "px-3", "py-1.5", "rounded-full", "text-[8px]", "font-black", "text-zadna-primary", "shadow-sm", "border", "border-zadna-primary/20"], ["type", "file", "accept", "image/*", 1, "hidden", 3, "change"], ["class", "absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[2.5rem] flex items-center justify-center z-10", 4, "ngIf"], [1, "grid", "grid-cols-1", "md:grid-cols-2", "gap-6"], ["formControlName", "nameAr", "dir", "rtl", 3, "label", "placeholder", "isRequired", "isTouched", "error"], ["formControlName", "nameEn", "dir", "ltr", 3, "label", "placeholder", "isRequired", "isTouched", "error"], [1, "flex", "flex-col", "md:flex-row", "gap-6"], [1, "flex-1", "flex", "items-center", "justify-between", "p-5", "bg-white", "rounded-2xl", "border", "border-slate-100", "shadow-sm", "transition-all", "hover:border-zadna-primary/20"], [1, "w-10", "h-10", "rounded-xl", "bg-slate-50", "flex", "items-center", "justify-center", "text-slate-400", "transition-colors"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M13 10V3L4 14h7v7l9-11h-7z"], [1, "text-xs", "font-black", "text-slate-800", "tracking-tight"], [1, "text-[9px]", "font-bold", "text-slate-400", "uppercase", "tracking-widest"], [1, "relative", "inline-flex", "items-center", "cursor-pointer"], ["type", "checkbox", "formControlName", "isActive", 1, "sr-only", "peer"], [1, "w-12", "h-6", "bg-slate-200", "peer-focus:outline-none", "rounded-full", "peer", "peer-checked:after:translate-x-full", "ltr:peer-checked:after:translate-x-full", "rtl:peer-checked:after:-translate-x-full", "peer-checked:after:border-white", "after:content-['']", "after:absolute", "after:top-[2px]", "ltr:after:left-[2px]", "rtl:after:right-[2px]", "after:bg-white", "after:border-gray-300", "after:border", "after:rounded-full", "after:h-5", "after:w-5", "after:transition-all", "peer-checked:bg-zadna-primary"], [1, "w-full", "md:w-32"], ["formControlName", "displayOrder", 3, "type", "label", "placeholder", "isRequired"], [1, "px-8", "py-6", "border-t", "border-slate-50", "flex", "items-center", "justify-end", "gap-4", "bg-white", "sticky", "bottom-0", "z-20"], ["variant", "ghost", 3, "btnClick"], ["variant", "primary", 3, "btnClick", "isLoading"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M5 13l4 4L19 7"], [1, "p-4", "bg-indigo-50/50", "rounded-2xl", "border", "border-indigo-100", "flex", "items-center", "gap-4", "animate-in", "fade-in", "slide-in-top", "duration-500"], [1, "w-8", "h-8", "rounded-lg", "bg-white", "flex", "items-center", "justify-center", "text-indigo-600", "shadow-sm"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"], [1, "text-[8px]", "font-black", "text-indigo-400", "uppercase", "tracking-widest"], [1, "text-xs", "font-bold", "text-indigo-900"], [1, "w-full", "h-full", "object-cover", "transition-transform", "group-hover:scale-110", 3, "src"], [1, "flex", "flex-col", "items-center", "text-slate-300"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-10", "h-10", "mb-2"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"], [1, "text-[8px]", "font-black", "uppercase", "tracking-widest"], [1, "absolute", "inset-0", "bg-white/80", "backdrop-blur-sm", "rounded-[2.5rem]", "flex", "items-center", "justify-center", "z-10"], [1, "w-6", "h-6", "border-2", "border-zadna-primary", "border-t-transparent", "animate-spin", "rounded-full"]], template: function CategoryFormModalComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275template(0, CategoryFormModalComponent_div_0_Template, 67, 52, "div", 0);
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
  ], styles: ['\n\n[_nghost-%COMP%] {\n  display: contents;\n}\n.animate-puzzle-up[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_puzzleUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;\n}\n@keyframes _ngcontent-%COMP%_puzzleUp {\n  from {\n    opacity: 0;\n    transform: translateY(60px) scale(0.92) rotateX(10deg);\n    filter: blur(10px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0) scale(1) rotateX(0);\n    filter: blur(0);\n  }\n}\n.stagger-item[_ngcontent-%COMP%] {\n  opacity: 0;\n  animation: _ngcontent-%COMP%_fadeInSlide 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;\n}\n.stagger-item[_ngcontent-%COMP%]:nth-child(1) {\n  animation-delay: 0.18s;\n}\n.stagger-item[_ngcontent-%COMP%]:nth-child(2) {\n  animation-delay: 0.26s;\n}\n.stagger-item[_ngcontent-%COMP%]:nth-child(3) {\n  animation-delay: 0.34s;\n}\n.stagger-item[_ngcontent-%COMP%]:nth-child(4) {\n  animation-delay: 0.42s;\n}\n.stagger-item[_ngcontent-%COMP%]:nth-child(5) {\n  animation-delay: 0.5s;\n}\n.stagger-item[_ngcontent-%COMP%]:nth-child(6) {\n  animation-delay: 0.58s;\n}\n.stagger-item[_ngcontent-%COMP%]:nth-child(7) {\n  animation-delay: 0.66s;\n}\n.stagger-item[_ngcontent-%COMP%]:nth-child(8) {\n  animation-delay: 0.74s;\n}\n.stagger-item[_ngcontent-%COMP%]:nth-child(9) {\n  animation-delay: 0.82s;\n}\n.stagger-item[_ngcontent-%COMP%]:nth-child(10) {\n  animation-delay: 0.9s;\n}\n@keyframes _ngcontent-%COMP%_fadeInSlide {\n  from {\n    opacity: 0;\n    transform: translateY(20px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n.premium-glass[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.8);\n  backdrop-filter: blur(40px) saturate(200%);\n  border: 1px solid rgba(255, 255, 255, 0.6);\n  box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.2), inset 0 0 100px rgba(255, 255, 255, 0.4);\n}\n.input-glow[_ngcontent-%COMP%]:focus-within {\n  box-shadow: 0 0 0 4px rgba(var(--zadna-primary-rgb), 0.1);\n  border-color: var(--zadna-primary);\n}\n.shimmer-btn[_ngcontent-%COMP%] {\n  position: relative;\n  overflow: hidden;\n}\n.shimmer-btn[_ngcontent-%COMP%]::after {\n  content: "";\n  position: absolute;\n  top: -50%;\n  left: -50%;\n  width: 200%;\n  height: 200%;\n  background:\n    linear-gradient(\n      45deg,\n      transparent,\n      rgba(255, 255, 255, 0.2),\n      transparent);\n  transform: rotate(45deg);\n  animation: _ngcontent-%COMP%_shimmer 4s infinite cubic-bezier(0.16, 1, 0.3, 1);\n}\n@keyframes _ngcontent-%COMP%_shimmer {\n  0% {\n    transform: translate(-100%, -100%) rotate(45deg);\n  }\n  100% {\n    transform: translate(100%, 100%) rotate(45deg);\n  }\n}\n@keyframes _ngcontent-%COMP%_bounceX {\n  0%, 100% {\n    transform: translateX(0);\n  }\n  50% {\n    transform: translateX(5px);\n  }\n}\n.animate-bounce-x[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_bounceX 1s infinite linear;\n}\n[dir=rtl][_ngcontent-%COMP%]   .animate-bounce-x[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_bounceX-rtl 1s infinite linear;\n}\n@keyframes _ngcontent-%COMP%_bounceX-rtl {\n  0%, 100% {\n    transform: translateX(0);\n  }\n  50% {\n    transform: translateX(-5px);\n  }\n}\n.custom-scrollbar[_ngcontent-%COMP%] {\n  scrollbar-width: thin;\n  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;\n}\n.custom-scrollbar[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 5px;\n}\n.custom-scrollbar[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: transparent;\n}\n.custom-scrollbar[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: rgba(0, 0, 0, 0.05);\n  border-radius: 20px;\n  border: 2px solid transparent;\n  background-clip: padding-box;\n}\n.custom-scrollbar[_ngcontent-%COMP%]::-webkit-scrollbar-thumb:hover {\n  background: rgba(0, 0, 0, 0.2);\n}\n/*# sourceMappingURL=category-form-modal.component.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(CategoryFormModalComponent, { className: "CategoryFormModalComponent", filePath: "src\\app\\features\\catalog\\shared\\category-form-modal\\category-form-modal.component.ts", lineNumber: 28 });
})();

// src/app/shared/components/delete-confirmation-modal/delete-confirmation-modal.component.ts
function DeleteConfirmationModalComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 1)(1, "div", 2);
    \u0275\u0275listener("click", function DeleteConfirmationModalComponent_div_0_Template_div_click_1_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onClose());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "app-card", 3)(3, "div", 4)(4, "div", 5);
    \u0275\u0275element(5, "div", 6);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(6, "svg", 7);
    \u0275\u0275element(7, "path", 8);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(8, "h3", 9);
    \u0275\u0275text(9);
    \u0275\u0275pipe(10, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "p", 10);
    \u0275\u0275text(12);
    \u0275\u0275pipe(13, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "div", 11)(15, "app-button", 12);
    \u0275\u0275listener("btnClick", function DeleteConfirmationModalComponent_div_0_Template_app_button_btnClick_15_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onClose());
    });
    \u0275\u0275text(16);
    \u0275\u0275pipe(17, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "app-button", 13);
    \u0275\u0275listener("btnClick", function DeleteConfirmationModalComponent_div_0_Template_app_button_btnClick_18_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onConfirm());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(19, "svg", 14);
    \u0275\u0275element(20, "path", 15);
    \u0275\u0275elementEnd();
    \u0275\u0275text(21);
    \u0275\u0275pipe(22, "translate");
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(9);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(10, 5, ctx_r1.title), " ");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(13, 7, ctx_r1.message), " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(17, 9, "COMMON.CANCEL"), " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("isLoading", ctx_r1.isLoading);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(22, 11, "COMMON.CONFIRM_DELETE"), " ");
  }
}
var DeleteConfirmationModalComponent = class _DeleteConfirmationModalComponent {
  isOpen = false;
  title = "COMMON.DELETE_CONFIRM_TITLE";
  message = "COMMON.DELETE_CONFIRM_MSG";
  isLoading = false;
  confirm = new EventEmitter();
  close = new EventEmitter();
  onConfirm() {
    this.confirm.emit();
  }
  onClose() {
    this.close.emit();
  }
  static \u0275fac = function DeleteConfirmationModalComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DeleteConfirmationModalComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _DeleteConfirmationModalComponent, selectors: [["app-delete-confirmation-modal"]], inputs: { isOpen: "isOpen", title: "title", message: "message", isLoading: "isLoading" }, outputs: { confirm: "confirm", close: "close" }, standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 1, vars: 1, consts: [["class", "fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-hidden", 4, "ngIf"], [1, "fixed", "inset-0", "z-[100]", "flex", "items-center", "justify-center", "p-6", "sm:p-12", "overflow-hidden"], [1, "absolute", "inset-0", "bg-zadna-bgDark/60", "backdrop-blur-md", "animate-in", "fade-in", "duration-700", 3, "click"], ["variant", "default", "padding", "none", "customClass", "w-[450px] max-w-full relative z-10 flex flex-col animate-in slide-in-bottom duration-500 rounded-[3rem] overflow-hidden shadow-2xl"], [1, "p-8", "text-center", "bg-white"], [1, "mx-auto", "w-24", "h-24", "rounded-[2.5rem]", "bg-red-50", "flex", "items-center", "justify-center", "mb-6", "relative", "group", "overflow-hidden", "border", "border-red-100/50"], [1, "absolute", "inset-0", "bg-gradient-to-br", "from-red-500/10", "to-transparent"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-12", "h-12", "text-red-500", "relative", "z-10", "animate-shake"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"], [1, "text-2xl", "font-black", "text-slate-900", "mb-2", "leading-tight"], [1, "text-slate-500", "text-sm", "font-bold", "leading-relaxed", "mb-8"], [1, "flex", "gap-4"], ["variant", "ghost", "customClass", "flex-1", 3, "btnClick"], ["variant", "danger", "customClass", "flex-1", 3, "btnClick", "isLoading"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"]], template: function DeleteConfirmationModalComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275template(0, DeleteConfirmationModalComponent_div_0_Template, 23, 13, "div", 0);
    }
    if (rf & 2) {
      \u0275\u0275property("ngIf", ctx.isOpen);
    }
  }, dependencies: [CommonModule, NgIf, TranslateModule, TranslatePipe, AppButtonComponent, AppCardComponent], styles: ["\n\n@keyframes _ngcontent-%COMP%_puzzle-up {\n  from {\n    opacity: 0;\n    transform: scale(0.9) translateY(40px);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1) translateY(0);\n  }\n}\n.animate-puzzle-up[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_puzzle-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);\n}\n@keyframes _ngcontent-%COMP%_shake {\n  0%, 100% {\n    transform: rotate(0);\n  }\n  20%, 60% {\n    transform: rotate(-10deg);\n  }\n  40%, 80% {\n    transform: rotate(10deg);\n  }\n}\n.animate-shake[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_shake 1s infinite;\n}\n/*# sourceMappingURL=delete-confirmation-modal.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(DeleteConfirmationModalComponent, { className: "DeleteConfirmationModalComponent", filePath: "src\\app\\shared\\components\\delete-confirmation-modal\\delete-confirmation-modal.component.ts", lineNumber: 79 });
})();

export {
  CategoryFormModalComponent,
  DeleteConfirmationModalComponent
};
//# sourceMappingURL=chunk-FEV6Q277.js.map
