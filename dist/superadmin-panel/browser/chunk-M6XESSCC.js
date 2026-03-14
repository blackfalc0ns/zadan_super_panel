import {
  AppTextareaComponent
} from "./chunk-QQC6B7P6.js";
import "./chunk-H5RLU432.js";
import {
  AppInputComponent
} from "./chunk-E66AVT3J.js";
import {
  DefaultValueAccessor,
  FormBuilder,
  FormControlName,
  FormGroupDirective,
  NgControlStatus,
  NgControlStatusGroup,
  NgSelectOption,
  ReactiveFormsModule,
  SelectControlValueAccessor,
  Validators,
  ɵNgNoValidate,
  ɵNgSelectMultipleOption
} from "./chunk-33QDSRRV.js";
import {
  DetailHeaderComponent
} from "./chunk-5LH2PCBE.js";
import {
  CatalogService
} from "./chunk-TE3TZJ3N.js";
import "./chunk-PL22K63I.js";
import {
  AppBadgeComponent
} from "./chunk-ERDI6WJP.js";
import {
  AppButtonComponent
} from "./chunk-NRL7A6JT.js";
import "./chunk-6L7JDGMK.js";
import {
  ActivatedRoute,
  Router,
  RouterModule
} from "./chunk-TIVATNVT.js";
import {
  TranslateModule,
  TranslatePipe,
  TranslateService
} from "./chunk-FETH6UU2.js";
import {
  CommonModule,
  Location,
  NgForOf,
  NgIf,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵclassMap,
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
  ɵɵreference,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-IPPBI3AG.js";

// src/app/features/catalog/master-products/master-product-form/master-product-form.component.ts
function MasterProductFormComponent_div_2_div_57_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 86)(1, "p", 87);
    \u0275\u0275text(2);
    \u0275\u0275pipe(3, "translate");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(3, 1, "COMMON.REQUIRED_FIELD"));
  }
}
function MasterProductFormComponent_div_2_div_77_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 95);
    \u0275\u0275element(1, "div", 96);
    \u0275\u0275elementEnd();
  }
}
function MasterProductFormComponent_div_2_div_77_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 88);
    \u0275\u0275listener("click", function MasterProductFormComponent_div_2_div_77_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r3);
      \u0275\u0275nextContext();
      const fileInput_r4 = \u0275\u0275reference(76);
      return \u0275\u0275resetView(fileInput_r4.click());
    });
    \u0275\u0275template(1, MasterProductFormComponent_div_2_div_77_div_1_Template, 2, 0, "div", 89);
    \u0275\u0275elementStart(2, "div", 90);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(3, "svg", 11);
    \u0275\u0275element(4, "path", 91);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(5, "h3", 92);
    \u0275\u0275text(6);
    \u0275\u0275pipe(7, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "p", 93);
    \u0275\u0275text(9);
    \u0275\u0275pipe(10, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "app-button", 94);
    \u0275\u0275text(12);
    \u0275\u0275pipe(13, "translate");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.isUploading);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(7, 4, "MASTER_PRODUCTS.UPLOAD_IMAGES"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(10, 6, "MASTER_PRODUCTS.UPLOAD_HINT"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(13, 8, "COMMON.BROWSE_FILES"), " ");
  }
}
function MasterProductFormComponent_div_2_div_78_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 97);
    \u0275\u0275element(1, "img", 98);
    \u0275\u0275elementStart(2, "div", 99)(3, "button", 100);
    \u0275\u0275listener("click", function MasterProductFormComponent_div_2_div_78_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.removeImage());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(4, "svg", 11);
    \u0275\u0275element(5, "path", 101);
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    let tmp_3_0;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275property("src", (tmp_3_0 = ctx_r1.productForm.get("primaryImageUrl")) == null ? null : tmp_3_0.value, \u0275\u0275sanitizeUrl);
  }
}
function MasterProductFormComponent_div_2_option_103_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 102);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cat_r6 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275property("value", cat_r6.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.activeLang === "ar" ? cat_r6.displayNameAr : cat_r6.displayNameEn, " ");
  }
}
function MasterProductFormComponent_div_2_option_116_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 102);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const brand_r7 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275property("value", brand_r7.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.activeLang === "ar" ? brand_r7.nameAr : brand_r7.nameEn, " ");
  }
}
function MasterProductFormComponent_div_2_option_129_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 102);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const unit_r8 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275property("value", unit_r8.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.activeLang === "ar" ? unit_r8.nameAr : unit_r8.nameEn, " ");
  }
}
function MasterProductFormComponent_div_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 4)(1, "form", 5);
    \u0275\u0275listener("ngSubmit", function MasterProductFormComponent_div_2_Template_form_ngSubmit_1_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onSubmit());
    });
    \u0275\u0275elementStart(2, "div", 6)(3, "div", 7);
    \u0275\u0275element(4, "div", 8);
    \u0275\u0275elementStart(5, "div", 9)(6, "div", 10);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(7, "svg", 11);
    \u0275\u0275element(8, "path", 12);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(9, "div")(10, "h2", 13);
    \u0275\u0275text(11);
    \u0275\u0275pipe(12, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "p", 14);
    \u0275\u0275text(14);
    \u0275\u0275pipe(15, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(16, "div", 15)(17, "div", 16)(18, "div", 17);
    \u0275\u0275text(19);
    \u0275\u0275pipe(20, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "div", 18);
    \u0275\u0275element(22, "app-input", 19);
    \u0275\u0275pipe(23, "translate");
    \u0275\u0275pipe(24, "translate");
    \u0275\u0275pipe(25, "translate");
    \u0275\u0275element(26, "app-textarea", 20);
    \u0275\u0275pipe(27, "translate");
    \u0275\u0275pipe(28, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(29, "div", 16)(30, "div", 21);
    \u0275\u0275text(31);
    \u0275\u0275pipe(32, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(33, "div", 22);
    \u0275\u0275element(34, "app-input", 23);
    \u0275\u0275pipe(35, "translate");
    \u0275\u0275pipe(36, "translate");
    \u0275\u0275pipe(37, "translate");
    \u0275\u0275element(38, "app-textarea", 24);
    \u0275\u0275pipe(39, "translate");
    \u0275\u0275pipe(40, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(41, "div", 25)(42, "div", 26);
    \u0275\u0275element(43, "div", 27);
    \u0275\u0275elementStart(44, "span", 28);
    \u0275\u0275text(45);
    \u0275\u0275pipe(46, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(47, "div", 29)(48, "div", 30);
    \u0275\u0275element(49, "div", 27);
    \u0275\u0275elementEnd();
    \u0275\u0275element(50, "input", 31);
    \u0275\u0275pipe(51, "translate");
    \u0275\u0275elementStart(52, "button", 32);
    \u0275\u0275listener("click", function MasterProductFormComponent_div_2_Template_button_click_52_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.generateSlug(true));
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(53, "svg", 33);
    \u0275\u0275element(54, "path", 34);
    \u0275\u0275elementEnd();
    \u0275\u0275text(55);
    \u0275\u0275pipe(56, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275template(57, MasterProductFormComponent_div_2_div_57_Template, 4, 3, "div", 35);
    \u0275\u0275elementEnd()()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(58, "div", 7);
    \u0275\u0275element(59, "div", 36);
    \u0275\u0275elementStart(60, "div", 37)(61, "div", 38)(62, "div", 39);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(63, "svg", 11);
    \u0275\u0275element(64, "path", 40);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(65, "div")(66, "h2", 13);
    \u0275\u0275text(67);
    \u0275\u0275pipe(68, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(69, "p", 14);
    \u0275\u0275text(70);
    \u0275\u0275pipe(71, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(72, "app-badge", 41);
    \u0275\u0275text(73);
    \u0275\u0275pipe(74, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(75, "input", 42, 0);
    \u0275\u0275listener("change", function MasterProductFormComponent_div_2_Template_input_change_75_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onFileSelected($event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275template(77, MasterProductFormComponent_div_2_div_77_Template, 14, 10, "div", 43)(78, MasterProductFormComponent_div_2_div_78_Template, 6, 1, "div", 44);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(79, "div", 45)(80, "div", 46);
    \u0275\u0275element(81, "div", 47);
    \u0275\u0275elementStart(82, "div", 9)(83, "div", 48);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(84, "svg", 11);
    \u0275\u0275element(85, "path", 49);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(86, "div")(87, "h2", 50);
    \u0275\u0275text(88);
    \u0275\u0275pipe(89, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(90, "p", 14);
    \u0275\u0275text(91);
    \u0275\u0275pipe(92, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(93, "div", 51)(94, "div", 52)(95, "label", 53);
    \u0275\u0275text(96);
    \u0275\u0275pipe(97, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(98, "div", 54)(99, "select", 55)(100, "option", 56);
    \u0275\u0275text(101);
    \u0275\u0275pipe(102, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275template(103, MasterProductFormComponent_div_2_option_103_Template, 2, 2, "option", 57);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(104, "div", 58);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(105, "svg", 59);
    \u0275\u0275element(106, "path", 60);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(107, "div", 52)(108, "label", 53);
    \u0275\u0275text(109);
    \u0275\u0275pipe(110, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(111, "div", 54)(112, "select", 61)(113, "option", 62);
    \u0275\u0275text(114);
    \u0275\u0275pipe(115, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275template(116, MasterProductFormComponent_div_2_option_116_Template, 2, 2, "option", 57);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(117, "div", 58);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(118, "svg", 59);
    \u0275\u0275element(119, "path", 60);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(120, "div", 52)(121, "label", 53);
    \u0275\u0275text(122);
    \u0275\u0275pipe(123, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(124, "div", 54)(125, "select", 63)(126, "option", 62);
    \u0275\u0275text(127);
    \u0275\u0275pipe(128, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275template(129, MasterProductFormComponent_div_2_option_129_Template, 2, 2, "option", 57);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(130, "div", 58);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(131, "svg", 59);
    \u0275\u0275element(132, "path", 60);
    \u0275\u0275elementEnd()()()()()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(133, "div", 46);
    \u0275\u0275element(134, "div", 64);
    \u0275\u0275elementStart(135, "div", 9)(136, "div", 65);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(137, "svg", 11);
    \u0275\u0275element(138, "path", 66);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(139, "div")(140, "h2", 50);
    \u0275\u0275text(141);
    \u0275\u0275pipe(142, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(143, "p", 14);
    \u0275\u0275text(144);
    \u0275\u0275pipe(145, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(146, "div", 67)(147, "label", 68);
    \u0275\u0275text(148);
    \u0275\u0275pipe(149, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(150, "div", 29)(151, "div", 30);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(152, "svg", 69);
    \u0275\u0275element(153, "path", 66);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275element(154, "input", 70);
    \u0275\u0275pipe(155, "translate");
    \u0275\u0275elementStart(156, "button", 32);
    \u0275\u0275listener("click", function MasterProductFormComponent_div_2_Template_button_click_156_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.generateQRCode());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(157, "svg", 33);
    \u0275\u0275element(158, "path", 34);
    \u0275\u0275elementEnd();
    \u0275\u0275text(159);
    \u0275\u0275pipe(160, "translate");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(161, "div", 71);
    \u0275\u0275element(162, "div", 72);
    \u0275\u0275elementStart(163, "div", 73)(164, "div", 74)(165, "div", 75);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(166, "svg", 59);
    \u0275\u0275element(167, "path", 76);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(168, "h4", 77);
    \u0275\u0275text(169);
    \u0275\u0275pipe(170, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(171, "div", 78)(172, "div", 79)(173, "span", 80);
    \u0275\u0275text(174);
    \u0275\u0275pipe(175, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(176, "div", 81);
    \u0275\u0275element(177, "div", 82);
    \u0275\u0275elementStart(178, "span", 83);
    \u0275\u0275text(179);
    \u0275\u0275pipe(180, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(181, "div", 84)(182, "button", 85);
    \u0275\u0275listener("click", function MasterProductFormComponent_div_2_Template_button_click_182_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.setStatus("Draft"));
    });
    \u0275\u0275text(183);
    \u0275\u0275pipe(184, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(185, "button", 85);
    \u0275\u0275listener("click", function MasterProductFormComponent_div_2_Template_button_click_185_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.setStatus("Active"));
    });
    \u0275\u0275text(186);
    \u0275\u0275pipe(187, "translate");
    \u0275\u0275elementEnd()()()()()()()();
  }
  if (rf & 2) {
    let tmp_9_0;
    let tmp_10_0;
    let tmp_18_0;
    let tmp_19_0;
    let tmp_26_0;
    let tmp_30_0;
    let tmp_31_0;
    let tmp_52_0;
    let tmp_53_0;
    let tmp_55_0;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("formGroup", ctx_r1.productForm);
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(12, 57, "MASTER_PRODUCTS.BASIC_INFO"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(15, 59, "MASTER_PRODUCTS.BASIC_INFO_DESC"));
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(20, 61, "MASTER_PRODUCTS.AR_SHORT"));
    \u0275\u0275advance(3);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(23, 63, "MASTER_PRODUCTS.NAME_AR_LABEL"))("placeholder", \u0275\u0275pipeBind1(24, 65, "MASTER_PRODUCTS.NAME_AR_PLACEHOLDER"))("isRequired", true)("isTouched", ((tmp_9_0 = ctx_r1.productForm.get("nameAr")) == null ? null : tmp_9_0.touched) || false)("error", ((tmp_10_0 = ctx_r1.productForm.get("nameAr")) == null ? null : tmp_10_0.invalid) && ((tmp_10_0 = ctx_r1.productForm.get("nameAr")) == null ? null : tmp_10_0.touched) ? \u0275\u0275pipeBind1(25, 67, "COMMON.REQUIRED_FIELD") : "");
    \u0275\u0275advance(4);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(27, 69, "MASTER_PRODUCTS.DESC_AR_LABEL"))("placeholder", \u0275\u0275pipeBind1(28, 71, "MASTER_PRODUCTS.DESC_AR_PLACEHOLDER"))("rows", 4);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(32, 73, "MASTER_PRODUCTS.EN_SHORT"));
    \u0275\u0275advance(3);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(35, 75, "MASTER_PRODUCTS.NAME_EN_LABEL"))("placeholder", \u0275\u0275pipeBind1(36, 77, "MASTER_PRODUCTS.NAME_EN_PLACEHOLDER"))("isRequired", true)("isTouched", ((tmp_18_0 = ctx_r1.productForm.get("nameEn")) == null ? null : tmp_18_0.touched) || false)("error", ((tmp_19_0 = ctx_r1.productForm.get("nameEn")) == null ? null : tmp_19_0.invalid) && ((tmp_19_0 = ctx_r1.productForm.get("nameEn")) == null ? null : tmp_19_0.touched) ? \u0275\u0275pipeBind1(37, 79, "COMMON.REQUIRED_FIELD") : "");
    \u0275\u0275advance(4);
    \u0275\u0275property("label", \u0275\u0275pipeBind1(39, 81, "MASTER_PRODUCTS.DESC_EN_LABEL"))("placeholder", \u0275\u0275pipeBind1(40, 83, "MASTER_PRODUCTS.DESC_EN_PLACEHOLDER"))("rows", 4);
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(46, 85, "MASTER_PRODUCTS.SYSTEM_IDENTIFIER"));
    \u0275\u0275advance(5);
    \u0275\u0275property("placeholder", \u0275\u0275pipeBind1(51, 87, "MASTER_PRODUCTS.SLUG_PLACEHOLDER"));
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(56, 89, "MASTER_PRODUCTS.GENERATE"), " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", ((tmp_26_0 = ctx_r1.productForm.get("slug")) == null ? null : tmp_26_0.invalid) && ((tmp_26_0 = ctx_r1.productForm.get("slug")) == null ? null : tmp_26_0.touched));
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(68, 91, "MASTER_PRODUCTS.MEDIA_ASSETS"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(71, 93, "MASTER_PRODUCTS.MEDIA_ASSETS_DESC"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(74, 95, "MASTER_PRODUCTS.OPTIONAL"));
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", !((tmp_30_0 = ctx_r1.productForm.get("primaryImageUrl")) == null ? null : tmp_30_0.value));
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", (tmp_31_0 = ctx_r1.productForm.get("primaryImageUrl")) == null ? null : tmp_31_0.value);
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(89, 97, "MASTER_PRODUCTS.CLASSIFICATION"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(92, 99, "MASTER_PRODUCTS.CLASSIFICATION_DESC"));
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(97, 101, "MASTER_PRODUCTS.MASTER_CATEGORY_LABEL"));
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(102, 103, "MASTER_PRODUCTS.SELECT_CATEGORY_PLACEHOLDER"));
    \u0275\u0275advance(2);
    \u0275\u0275property("ngForOf", ctx_r1.availableCategories);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(110, 105, "MASTER_PRODUCTS.ASSIGNED_BRAND_LABEL"));
    \u0275\u0275advance(4);
    \u0275\u0275property("value", null);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(115, 107, "MASTER_PRODUCTS.GENERIC_WHITE_LABEL"));
    \u0275\u0275advance(2);
    \u0275\u0275property("ngForOf", ctx_r1.availableBrands);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(123, 109, "MASTER_PRODUCTS.UNIT_LABEL"));
    \u0275\u0275advance(4);
    \u0275\u0275property("value", null);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(128, 111, "MASTER_PRODUCTS.STANDARD_UNIT"));
    \u0275\u0275advance(2);
    \u0275\u0275property("ngForOf", ctx_r1.availableUnits);
    \u0275\u0275advance(12);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(142, 113, "MASTER_PRODUCTS.INVENTORY_TRACKING"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(145, 115, "MASTER_PRODUCTS.INVENTORY_DESC"));
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(149, 117, "MASTER_PRODUCTS.UNIVERSAL_BARCODE_LABEL"));
    \u0275\u0275advance(6);
    \u0275\u0275property("placeholder", \u0275\u0275pipeBind1(155, 119, "MASTER_PRODUCTS.SCAN_AUTO_HINT"));
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(160, 121, "MASTER_PRODUCTS.GENERATE"), " ");
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(170, 123, "MASTER_PRODUCTS.PUBLISHING_STATUS"));
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(175, 125, "MASTER_PRODUCTS.VISIBILITY_PHASE"));
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(180, 127, ((tmp_52_0 = ctx_r1.productForm.get("status")) == null ? null : tmp_52_0.value) === "Draft" ? "MASTER_PRODUCTS.STAGING_HIDDEN" : "MASTER_PRODUCTS.LIVE_STORE"), " ");
    \u0275\u0275advance(3);
    \u0275\u0275classMap(((tmp_53_0 = ctx_r1.productForm.get("status")) == null ? null : tmp_53_0.value) === "Draft" ? "flex-1 py-3 bg-white text-zadna-accent shadow-2xl rounded-lg font-black text-[9px] uppercase tracking-widest transition-all duration-500 transform active:scale-95" : "flex-1 py-3 text-white/60 hover:text-white/90 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all duration-500");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(184, 129, "MASTER_PRODUCTS.STATUS_DRAFT"), " ");
    \u0275\u0275advance(2);
    \u0275\u0275classMap(((tmp_55_0 = ctx_r1.productForm.get("status")) == null ? null : tmp_55_0.value) === "Active" ? "flex-1 py-3 bg-zadna-bgDark text-white shadow-2xl rounded-lg font-black text-[9px] uppercase tracking-widest transition-all duration-500 transform active:scale-95" : "flex-1 py-3 text-white/60 hover:text-white/90 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all duration-500");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(187, 131, "MASTER_PRODUCTS.STATUS_ACTIVE"), " ");
  }
}
var MasterProductFormComponent = class _MasterProductFormComponent {
  fb;
  catalogService;
  route;
  router;
  location;
  translate;
  productForm;
  isLoading = false;
  isUploading = false;
  activeLang = "ar";
  availableCategories = [];
  availableBrands = [];
  availableUnits = [];
  breadcrumbs = [];
  langSub;
  constructor(fb, catalogService, route, router, location, translate) {
    this.fb = fb;
    this.catalogService = catalogService;
    this.route = route;
    this.router = router;
    this.location = location;
    this.translate = translate;
    this.activeLang = this.translate.currentLang || "ar";
    this.langSub = this.translate.onLangChange.subscribe((event) => {
      this.activeLang = event.lang;
    });
    this.initForm();
  }
  ngOnInit() {
    this.setupBreadcrumbs();
    this.loadCategories();
    this.loadBrands();
    this.loadUnits();
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.loadProduct(id);
    }
    const catId = this.route.snapshot.queryParamMap.get("categoryId");
    if (catId && !id) {
      this.productForm.patchValue({ categoryId: catId });
    }
  }
  setupBreadcrumbs() {
    const isEdit = !!this.route.snapshot.paramMap.get("id");
    this.breadcrumbs = [
      { label: this.translate.instant("SIDEBAR.CATALOG"), action: () => this.onCancel() },
      { label: this.translate.instant("SIDEBAR.MASTER_PRODUCTS"), action: () => this.onCancel() },
      { label: isEdit ? "\u062A\u0639\u062F\u064A\u0644 \u0645\u0646\u062A\u062C" : "\u0625\u0636\u0627\u0641\u0629 \u0645\u0646\u062A\u062C" }
    ];
  }
  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }
  initForm() {
    this.productForm = this.fb.group({
      id: [null],
      nameAr: ["", [Validators.required]],
      nameEn: ["", [Validators.required]],
      slug: ["", [Validators.required]],
      descriptionAr: [""],
      descriptionEn: [""],
      barcode: [""],
      categoryId: ["", [Validators.required]],
      brandId: [null],
      unitId: [null],
      primaryImageUrl: [null],
      status: ["Draft"]
      // Status is visual, backend defaults to Draft initially
    });
    const updateSlug = () => {
      const slugControl = this.productForm.get("slug");
      if (!slugControl?.dirty) {
        const nameEn = this.productForm.get("nameEn")?.value;
        const nameAr = this.productForm.get("nameAr")?.value;
        let sourceStr = "";
        if (nameEn && typeof nameEn === "string" && nameEn.trim() !== "") {
          sourceStr = nameEn;
        } else if (nameAr && typeof nameAr === "string" && nameAr.trim() !== "") {
          sourceStr = nameAr;
        }
        if (sourceStr) {
          const generatedSlug = sourceStr.toLowerCase().trim().replace(/[^\u0600-\u06FFa-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
          slugControl?.setValue(generatedSlug, { emitEvent: false });
        } else {
          slugControl?.setValue("", { emitEvent: false });
        }
      }
    };
    this.productForm.get("nameEn")?.valueChanges.subscribe(() => updateSlug());
    this.productForm.get("nameAr")?.valueChanges.subscribe(() => updateSlug());
  }
  generateSlug(force = false) {
    const slugControl = this.productForm.get("slug");
    if (!force && slugControl?.dirty && slugControl?.value)
      return;
    const nameEn = this.productForm.get("nameEn")?.value;
    const nameAr = this.productForm.get("nameAr")?.value;
    let sourceStr = "";
    if (nameEn && typeof nameEn === "string" && nameEn.trim() !== "") {
      sourceStr = nameEn;
    } else if (nameAr && typeof nameAr === "string" && nameAr.trim() !== "") {
      sourceStr = nameAr;
    }
    if (sourceStr) {
      const generatedSlug = sourceStr.toLowerCase().trim().replace(/[^\u0600-\u06FFa-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      slugControl?.setValue(generatedSlug);
      slugControl?.markAsDirty();
    }
  }
  loadProduct(id) {
    this.isLoading = true;
    this.catalogService.getProductById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          id: product.id,
          nameAr: product.nameAr || "",
          nameEn: product.nameEn || "",
          slug: product.slug || "",
          descriptionAr: product.descriptionAr || "",
          descriptionEn: product.descriptionEn || "",
          barcode: product.barcode || "",
          categoryId: product.categoryId,
          brandId: product.brandId,
          unitId: product.unitOfMeasureId,
          status: product.status,
          primaryImageUrl: product.images?.find((img) => img.isPrimary)?.url
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Failed to load product", err);
        this.isLoading = false;
      }
    });
  }
  onFileSelected(event) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.catalogService.uploadFile(file, "products").subscribe({
        next: (res) => {
          this.productForm.patchValue({ primaryImageUrl: res.url });
          this.isUploading = false;
        },
        error: (err) => {
          console.error("Upload failed", err);
          this.isUploading = false;
        }
      });
    }
  }
  removeImage() {
    this.productForm.patchValue({ primaryImageUrl: null });
  }
  loadCategories() {
    this.catalogService.getCategories(void 0, true).subscribe({
      next: (cats) => {
        this.availableCategories = this.flattenCategories(cats);
        const catId = this.route.snapshot.queryParamMap.get("categoryId");
        if (catId && this.availableCategories.some((c) => c.id === catId)) {
          this.productForm.patchValue({ categoryId: catId });
        }
      },
      error: (err) => {
        console.error("Failed to load categories", err);
        this.availableCategories = [];
      }
    });
  }
  flattenCategories(categories, pathAr = "", pathEn = "", level = 0) {
    let result = [];
    categories.forEach((cat) => {
      const separator = " \xBB ";
      const currentPathAr = pathAr ? `${pathAr}${separator}${cat.nameAr}` : cat.nameAr;
      const currentPathEn = pathEn ? `${pathEn}${separator}${cat.nameEn}` : cat.nameEn;
      const isTargetLevel = level === 3;
      if (isTargetLevel) {
        result.push({
          id: cat.id,
          nameAr: cat.nameAr,
          nameEn: cat.nameEn,
          displayNameAr: currentPathAr,
          displayNameEn: currentPathEn,
          level
        });
      }
      if (cat.subCategories && cat.subCategories.length > 0) {
        result = result.concat(this.flattenCategories(cat.subCategories, currentPathAr, currentPathEn, level + 1));
      }
    });
    return result;
  }
  loadBrands() {
    this.catalogService.getBrands().subscribe((brands) => {
      this.availableBrands = brands;
    });
  }
  loadUnits() {
    this.catalogService.getUnits().subscribe({
      next: (units) => this.availableUnits = units,
      error: () => this.availableUnits = []
      // Ignore if endpoint not yet deployed
    });
  }
  setStatus(status) {
    this.productForm.patchValue({ status });
  }
  onCancel() {
    this.location.back();
  }
  generateQRCode() {
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    this.productForm.patchValue({ barcode: "ZD-" + random });
  }
  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const val = this.productForm.value;
    const payload = {
      id: val.id,
      nameAr: val.nameAr,
      nameEn: val.nameEn,
      slug: val.slug,
      descriptionAr: val.descriptionAr,
      descriptionEn: val.descriptionEn,
      barcode: val.barcode,
      categoryId: val.categoryId,
      brandId: val.brandId,
      unitId: val.unitId,
      images: val.primaryImageUrl ? [{ url: val.primaryImageUrl, isPrimary: true, displayOrder: 1 }] : []
    };
    if (val.id) {
      this.catalogService.updateProduct(val.id, payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(["/catalog/products"]);
        },
        error: (err) => {
          console.error("Update failed", err);
          this.isLoading = false;
        }
      });
    } else {
      this.catalogService.createProduct(payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(["/catalog/products"]);
        },
        error: (err) => {
          console.error("Save failed", err);
          this.isLoading = false;
        }
      });
    }
  }
  static \u0275fac = function MasterProductFormComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MasterProductFormComponent)(\u0275\u0275directiveInject(FormBuilder), \u0275\u0275directiveInject(CatalogService), \u0275\u0275directiveInject(ActivatedRoute), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(Location), \u0275\u0275directiveInject(TranslateService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _MasterProductFormComponent, selectors: [["app-master-product-form"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 3, vars: 5, consts: [["fileInput", ""], [1, "min-h-screen", "bg-gradient-to-br", "from-slate-50", "to-slate-100/50", "pb-6", "sm:pb-12", "overflow-x-hidden"], ["actionButtonIcon", "save", 3, "backClick", "actionClick", "title", "breadcrumbs", "actionButtonLabel", "isActionDisabled"], ["class", "max-w-[1300px] mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-in fade-in slide-in-from-bottom-6 duration-700", 4, "ngIf"], [1, "max-w-[1300px]", "mx-auto", "px-4", "sm:px-6", "py-6", "sm:py-8", "animate-in", "fade-in", "slide-in-from-bottom-6", "duration-700"], [1, "grid", "grid-cols-1", "lg:grid-cols-12", "gap-6", "sm:gap-8", 3, "ngSubmit", "formGroup"], [1, "lg:col-span-8", "space-y-12"], [1, "glass-card", "p-5", "sm:p-6", "lg:p-8", "relative", "overflow-hidden", "group"], [1, "absolute", "-top-12", "-right-12", "w-32", "h-32", "bg-blue-50/50", "rounded-full", "blur-3xl", "opacity-0", "group-hover:opacity-100", "transition-opacity", "duration-1000"], [1, "flex", "items-center", "gap-4", "mb-8", "relative", "z-10"], [1, "w-10", "h-10", "rounded-xl", "flex", "items-center", "justify-center", "bg-blue-50", "text-blue-600", "shadow-sm", "border", "border-blue-100/50"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M13 16h-1v-4h-1m1-4h.01M21 12a9 11 0 11-18 0 9 9 0 0118 0z"], [1, "text-lg", "font-black", "text-slate-900", "tracking-tight"], [1, "text-[8px]", "font-bold", "text-slate-400", "uppercase", "tracking-widest", "mt-0.5"], [1, "grid", "grid-cols-1", "xl:grid-cols-2", "gap-6", "relative", "z-10"], [1, "space-y-6", "bg-slate-50/40", "p-5", "rounded-2xl", "border", "border-slate-100/50", "relative", "overflow-hidden"], [1, "absolute", "top-4", "left-4", "bg-emerald-100/90", "text-emerald-700", "px-3", "py-1", "rounded-xl", "text-[10px]", "font-black", "uppercase", "tracking-widest", "shadow-sm", "border", "border-emerald-200/50"], ["dir", "rtl", 1, "space-y-8", "rtl", "pt-2"], ["formControlName", "nameAr", "customClass", "bg-white border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-bold", 3, "label", "placeholder", "isRequired", "isTouched", "error"], ["formControlName", "descriptionAr", "customClass", "bg-white border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-bold", 3, "label", "placeholder", "rows"], [1, "absolute", "top-4", "right-4", "bg-blue-100/90", "text-blue-700", "px-3", "py-1", "rounded-xl", "text-[10px]", "font-black", "uppercase", "tracking-widest", "shadow-sm", "border", "border-blue-200/50"], ["dir", "ltr", 1, "space-y-8", "pt-2"], ["formControlName", "nameEn", "customClass", "bg-white border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-bold", 3, "label", "placeholder", "isRequired", "isTouched", "error"], ["formControlName", "descriptionEn", "customClass", "bg-white border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-bold", 3, "label", "placeholder", "rows"], [1, "mt-8", "pt-6", "border-t", "border-slate-100", "flex", "flex-col", "gap-4", "relative", "z-10"], [1, "flex", "items-center", "gap-2", "mb-2"], [1, "w-1", "h-3.5", "bg-blue-500", "rounded-full"], [1, "text-[9px]", "font-black", "text-slate-400", "uppercase", "tracking-[0.2em]"], [1, "relative", "group/input"], [1, "absolute", "inset-y-0", "left-0", "pl-6", "flex", "items-center", "pointer-events-none"], ["formControlName", "slug", 1, "w-full", "pl-14", "pr-32", "py-5", "bg-slate-50", "border", "border-slate-100", "rounded-2xl", "text-sm", "font-black", "tracking-widest", "text-slate-800", "outline-none", "transition-all", "duration-300", "focus:bg-white", "focus:border-zadna-primary", "focus:ring-4", "focus:ring-zadna-primary/5", "font-mono", 3, "placeholder"], ["type", "button", 1, "absolute", "inset-y-2", "right-2", "px-5", "bg-white", "border", "border-slate-100", "hover:bg-zadna-primary/5", "hover:text-zadna-primary", "hover:border-zadna-primary/20", "text-slate-500", "font-black", "text-[10px]", "uppercase", "tracking-widest", "rounded-xl", "transition-all", "flex", "items-center", "gap-2", "focus:outline-none", "shadow-sm", "active:scale-95", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3.5", "h-3.5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "3", "d", "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"], ["class", "px-1 mt-1", 4, "ngIf"], [1, "absolute", "-top-12", "-right-12", "w-32", "h-32", "bg-fuchsia-50/50", "rounded-full", "blur-3xl", "opacity-0", "group-hover:opacity-100", "transition-opacity", "duration-1000"], [1, "flex", "items-center", "justify-between", "mb-8", "relative", "z-10"], [1, "flex", "items-center", "gap-4"], [1, "w-10", "h-10", "rounded-xl", "flex", "items-center", "justify-center", "bg-fuchsia-50", "text-fuchsia-600", "shadow-sm", "border", "border-fuchsia-100/50"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"], ["variant", "neutral", "size", "sm", 1, "px-2", "py-0.5", "font-black", "uppercase", "tracking-widest", "text-[8px]"], ["type", "file", "hidden", "", "accept", "image/*", 3, "change"], ["class", "w-full border-2 border-dashed border-slate-100 hover:border-zadna-primary/30 rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-zadna-primary/5 transition-all duration-500 cursor-pointer group/upload relative", 3, "click", 4, "ngIf"], ["class", "relative group/preview rounded-2xl overflow-hidden border border-slate-100 shadow-sm w-full h-48 sm:h-64 bg-slate-50", 4, "ngIf"], [1, "lg:col-span-4", "space-y-8"], [1, "glass-card", "p-5", "sm:p-6", "relative", "overflow-hidden", "group"], [1, "absolute", "-top-12", "-right-12", "w-32", "h-32", "bg-zadna-accent/5", "rounded-full", "blur-3xl", "opacity-0", "group-hover:opacity-100", "transition-opacity", "duration-1000"], [1, "w-10", "h-10", "rounded-xl", "flex", "items-center", "justify-center", "bg-zadna-accent/10", "text-zadna-accent", "shadow-sm", "border", "border-zadna-accent/10"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"], [1, "text-base", "font-black", "text-slate-900", "tracking-tight"], [1, "space-y-8", "relative", "z-10"], [1, "flex", "flex-col"], [1, "text-[10px]", "font-black", "text-slate-400", "uppercase", "tracking-[0.2em]", "mb-3", "ml-2"], [1, "relative", "group/select"], ["formControlName", "categoryId", 1, "w-full", "bg-slate-50", "border", "border-slate-100", "rounded-2xl", "px-6", "py-4", "text-sm", "font-bold", "text-slate-700", "outline-none", "transition-all", "duration-300", "focus:bg-white", "focus:border-zadna-primary", "focus:ring-4", "focus:ring-zadna-primary/5", "appearance-none"], ["value", "", "disabled", ""], ["class", "py-2", 3, "value", 4, "ngFor", "ngForOf"], [1, "absolute", "right-6", "top-1/2", "-translate-y-1/2", "pointer-events-none", "text-slate-300", "group-hover/select:text-zadna-primary", "transition-colors"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "3", "d", "M19 9l-7 7-7-7"], ["formControlName", "brandId", 1, "w-full", "bg-slate-50", "border", "border-slate-100", "rounded-2xl", "px-6", "py-4", "text-sm", "font-bold", "text-slate-700", "outline-none", "transition-all", "duration-300", "focus:bg-white", "focus:border-zadna-primary", "focus:ring-4", "focus:ring-zadna-primary/5", "appearance-none"], [3, "value"], ["formControlName", "unitId", 1, "w-full", "bg-slate-50", "border", "border-slate-100", "rounded-2xl", "px-6", "py-4", "text-sm", "font-bold", "text-slate-700", "outline-none", "transition-all", "duration-300", "focus:bg-white", "focus:border-zadna-primary", "focus:ring-4", "focus:ring-zadna-primary/5", "appearance-none"], [1, "absolute", "-top-12", "-right-12", "w-32", "h-32", "bg-indigo-50/50", "rounded-full", "blur-3xl", "opacity-0", "group-hover:opacity-100", "transition-opacity", "duration-1000"], [1, "w-10", "h-10", "rounded-xl", "flex", "items-center", "justify-center", "bg-indigo-50", "text-indigo-600", "shadow-sm", "border", "border-indigo-100/50"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 17h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"], [1, "flex", "flex-col", "relative", "z-10"], [1, "text-[10px]", "font-black", "text-slate-400", "uppercase", "tracking-[0.2em]", "mb-4", "ml-2"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "text-slate-300", "group-focus-within/input:text-zadna-primary", "transition-colors"], ["formControlName", "barcode", 1, "w-full", "pl-14", "pr-32", "py-5", "bg-slate-50", "border", "border-slate-100", "rounded-2xl", "text-sm", "font-black", "tracking-widest", "text-slate-800", "outline-none", "transition-all", "duration-300", "focus:bg-white", "focus:border-zadna-primary", "focus:ring-4", "focus:ring-zadna-primary/5", 3, "placeholder"], [1, "shadow-2xl", "bg-zadna-accent", "rounded-[2rem]", "p-1.5", "border-none", "relative", "overflow-hidden", "group"], [1, "absolute", "-top-12", "-right-12", "w-32", "h-32", "bg-white/20", "rounded-full", "blur-[80px]", "group-hover:bg-white/30", "transition-all", "duration-1000"], [1, "p-5", "sm:p-6", "space-y-5", "relative", "z-10"], [1, "flex", "items-center", "gap-3"], [1, "w-8", "h-8", "rounded-xl", "bg-white/20", "backdrop-blur-md", "flex", "items-center", "justify-center", "text-white"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M9 12l2 2 4-4m6 2a9 11 0 11-18 0 9 9 0 0118 0z"], [1, "text-[10px]", "font-black", "text-white/90", "uppercase", "tracking-[0.2em]"], [1, "space-y-5"], [1, "flex", "flex-col", "gap-1.5"], [1, "text-[8px]", "font-black", "uppercase", "tracking-[0.3em]", "text-white/60"], [1, "flex", "items-center", "gap-2.5"], [1, "w-2", "h-2", "rounded-full", "animate-pulse", "shadow-[0_0_12px_rgba(255,255,255,0.4)]", "bg-white"], [1, "text-base", "font-black", "text-white", "tracking-tight"], [1, "flex", "p-1", "bg-black/10", "rounded-xl", "w-full", "border", "border-white/20", "shadow-inner"], ["type", "button", 3, "click"], [1, "px-1", "mt-1"], [1, "text-[10px]", "font-bold", "text-red-500", "italic"], [1, "w-full", "border-2", "border-dashed", "border-slate-100", "hover:border-zadna-primary/30", "rounded-2xl", "p-6", "sm:p-10", "flex", "flex-col", "items-center", "justify-center", "bg-slate-50/50", "hover:bg-zadna-primary/5", "transition-all", "duration-500", "cursor-pointer", "group/upload", "relative", 3, "click"], ["class", "absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl", 4, "ngIf"], [1, "w-12", "h-12", "rounded-xl", "bg-white", "shadow-premium", "flex", "items-center", "justify-center", "mb-4", "text-slate-300", "group-hover/upload:text-zadna-primary", "group-hover/upload:scale-110", "group-hover/upload:rotate-6", "transition-all", "duration-500", "border", "border-slate-100"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M12 6v6m0 0v6m0-6h6m-6 0H6"], [1, "text-sm", "font-black", "text-slate-900", "mb-1"], [1, "text-[8px]", "font-bold", "text-slate-400", "uppercase", "tracking-widest", "text-center", "max-w-xs", "mb-6", "opacity-70"], ["variant", "ghost", "size", "sm", "customClass", "bg-white shadow-sm border border-slate-200 rounded-lg px-6 py-2 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-zadna-primary/5 hover:text-zadna-primary transition-all"], [1, "absolute", "inset-0", "bg-white/80", "backdrop-blur-sm", "flex", "items-center", "justify-center", "z-10", "rounded-2xl"], [1, "w-8", "h-8", "rounded-full", "border-[3px]", "border-slate-200", "border-t-zadna-primary", "animate-spin"], [1, "relative", "group/preview", "rounded-2xl", "overflow-hidden", "border", "border-slate-100", "shadow-sm", "w-full", "h-48", "sm:h-64", "bg-slate-50"], [1, "w-full", "h-full", "object-contain", 3, "src"], [1, "absolute", "inset-0", "bg-slate-900/40", "opacity-0", "group-hover/preview:opacity-100", "transition-all", "duration-300", "flex", "items-center", "justify-center", "backdrop-blur-[2px]"], ["type", "button", 1, "w-10", "h-10", "bg-white/20", "hover:bg-red-500", "text-white", "rounded-xl", "shadow-lg", "border", "border-white/30", "hover:border-red-400", "flex", "items-center", "justify-center", "backdrop-blur-md", "transition-all", "duration-300", "hover:scale-110", 3, "click"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"], [1, "py-2", 3, "value"]], template: function MasterProductFormComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 1)(1, "app-detail-header", 2);
      \u0275\u0275listener("backClick", function MasterProductFormComponent_Template_app_detail_header_backClick_1_listener() {
        return ctx.onCancel();
      })("actionClick", function MasterProductFormComponent_Template_app_detail_header_actionClick_1_listener() {
        return ctx.onSubmit();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275template(2, MasterProductFormComponent_div_2_Template, 188, 133, "div", 3);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      let tmp_0_0;
      let tmp_2_0;
      \u0275\u0275advance();
      \u0275\u0275property("title", ((tmp_0_0 = ctx.productForm.get("id")) == null ? null : tmp_0_0.value) ? ctx.translate.instant("MASTER_PRODUCTS.EDIT_TITLE") : ctx.translate.instant("MASTER_PRODUCTS.ADD_TITLE"))("breadcrumbs", ctx.breadcrumbs)("actionButtonLabel", ((tmp_2_0 = ctx.productForm.get("id")) == null ? null : tmp_2_0.value) ? "\u062D\u0641\u0638 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A" : "\u062D\u0641\u0638")("isActionDisabled", ctx.isLoading);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.productForm);
    }
  }, dependencies: [
    CommonModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    \u0275NgNoValidate,
    NgSelectOption,
    \u0275NgSelectMultipleOption,
    DefaultValueAccessor,
    SelectControlValueAccessor,
    NgControlStatus,
    NgControlStatusGroup,
    FormGroupDirective,
    FormControlName,
    TranslateModule,
    TranslatePipe,
    RouterModule,
    AppButtonComponent,
    AppInputComponent,
    AppTextareaComponent,
    AppBadgeComponent,
    DetailHeaderComponent
  ], styles: ["\n\n[_nghost-%COMP%] {\n  display: block;\n  perspective: 2000px;\n}\n/*# sourceMappingURL=master-product-form.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(MasterProductFormComponent, { className: "MasterProductFormComponent", filePath: "src\\app\\features\\catalog\\master-products\\master-product-form\\master-product-form.component.ts", lineNumber: 35 });
})();
export {
  MasterProductFormComponent
};
//# sourceMappingURL=chunk-M6XESSCC.js.map
