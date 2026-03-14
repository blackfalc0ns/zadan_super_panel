import {
  DetailHeaderComponent
} from "./chunk-5LH2PCBE.js";
import {
  CatalogService
} from "./chunk-TE3TZJ3N.js";
import "./chunk-PL22K63I.js";
import "./chunk-ERDI6WJP.js";
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
  NgClass,
  NgForOf,
  NgIf,
  ɵsetClassDebugInfo,
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
  ɵɵpureFunction3,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-IPPBI3AG.js";

// src/app/features/catalog/product-detail/product-detail.component.ts
var _c0 = (a0, a1, a2) => ({ "bg-emerald-50 text-emerald-600": a0, "bg-amber-50 text-amber-600": a1, "bg-red-50 text-red-600": a2 });
var _c1 = (a0, a1, a2) => ({ "bg-emerald-500": a0, "bg-amber-500": a1, "bg-red-500": a2 });
function ProductDetailComponent_div_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 4)(1, "div", 5);
    \u0275\u0275element(2, "div", 6)(3, "div", 7);
    \u0275\u0275elementEnd()();
  }
}
function ProductDetailComponent_div_3_div_7_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 66);
    \u0275\u0275listener("click", function ProductDetailComponent_div_3_div_7_div_1_Template_div_click_0_listener() {
      const i_r2 = \u0275\u0275restoreView(_r1).index;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.selectImage(i_r2));
    });
    \u0275\u0275element(1, "img", 14);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const image_r4 = ctx.$implicit;
    const i_r2 = ctx.index;
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("border-zadna-primary", ctx_r2.selectedImageIndex === i_r2)("border-slate-200", ctx_r2.selectedImageIndex !== i_r2)("opacity-50", ctx_r2.selectedImageIndex !== i_r2);
    \u0275\u0275advance();
    \u0275\u0275property("src", image_r4.url, \u0275\u0275sanitizeUrl)("alt", "\u0635\u0648\u0631\u0629 " + (i_r2 + 1));
  }
}
function ProductDetailComponent_div_3_div_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 64);
    \u0275\u0275template(1, ProductDetailComponent_div_3_div_7_div_1_Template, 2, 8, "div", 65);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r2.product.images);
  }
}
function ProductDetailComponent_div_3_div_22_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 67)(1, "p", 27);
    \u0275\u0275text(2);
    \u0275\u0275pipe(3, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p", 68);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(3, 2, "PRODUCTS.DETAIL.DESCRIPTION"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", ctx_r2.activeLang === "ar" ? ctx_r2.product.descriptionAr : ctx_r2.product.descriptionEn, " ");
  }
}
function ProductDetailComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 8)(1, "div", 9)(2, "div", 10)(3, "div", 11)(4, "div", 12)(5, "div", 13);
    \u0275\u0275element(6, "img", 14);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(7, ProductDetailComponent_div_3_div_7_Template, 2, 1, "div", 15);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 16)(9, "div", 17)(10, "div", 18)(11, "div", 19)(12, "p", 20);
    \u0275\u0275text(13);
    \u0275\u0275pipe(14, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "h2", 21);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(17, "div", 22);
    \u0275\u0275element(18, "span", 23);
    \u0275\u0275elementStart(19, "span");
    \u0275\u0275text(20);
    \u0275\u0275pipe(21, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(22, ProductDetailComponent_div_3_div_22_Template, 6, 4, "div", 24);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "div", 25)(24, "div", 26)(25, "p", 27);
    \u0275\u0275text(26);
    \u0275\u0275pipe(27, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "p", 28);
    \u0275\u0275text(29);
    \u0275\u0275pipe(30, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(31, "div", 26)(32, "p", 27);
    \u0275\u0275text(33);
    \u0275\u0275pipe(34, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(35, "p", 29);
    \u0275\u0275text(36);
    \u0275\u0275pipe(37, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(38, "div", 26)(39, "p", 27);
    \u0275\u0275text(40);
    \u0275\u0275pipe(41, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(42, "p", 29);
    \u0275\u0275text(43);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(44, "div", 26)(45, "p", 27);
    \u0275\u0275text(46);
    \u0275\u0275pipe(47, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(48, "p", 29);
    \u0275\u0275text(49);
    \u0275\u0275pipe(50, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(51, "div", 30)(52, "h3", 31);
    \u0275\u0275text(53);
    \u0275\u0275pipe(54, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(55, "div", 32)(56, "table", 33)(57, "thead")(58, "tr", 34)(59, "th", 35);
    \u0275\u0275text(60);
    \u0275\u0275pipe(61, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(62, "th", 36);
    \u0275\u0275text(63);
    \u0275\u0275pipe(64, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(65, "th", 36);
    \u0275\u0275text(66);
    \u0275\u0275pipe(67, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(68, "th", 36);
    \u0275\u0275text(69);
    \u0275\u0275pipe(70, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(71, "tbody")(72, "tr", 37)(73, "td", 38)(74, "div", 39);
    \u0275\u0275element(75, "div", 40);
    \u0275\u0275elementStart(76, "span", 41);
    \u0275\u0275text(77, "\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u0623\u0645\u064A\u0646 \u0644\u0644\u062A\u062C\u0627\u0631\u0629");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(78, "td", 38)(79, "div", 42)(80, "span", 43);
    \u0275\u0275text(81, "850");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(82, "div", 44);
    \u0275\u0275element(83, "div", 45);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(84, "td", 46)(85, "span", 29);
    \u0275\u0275text(86, "120 \u0631\u064A\u0627\u0644");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(87, "td", 46)(88, "span", 47);
    \u0275\u0275text(89, "\u0645\u0646\u0630 \u0633\u0627\u0639\u062A\u064A\u0646");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(90, "tr", 37)(91, "td", 38)(92, "div", 39);
    \u0275\u0275element(93, "div", 48);
    \u0275\u0275elementStart(94, "span", 41);
    \u0275\u0275text(95, "\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u062C\u0648\u062F \u0627\u0644\u0645\u0631\u064A\u062D");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(96, "td", 38)(97, "div", 42)(98, "span", 43);
    \u0275\u0275text(99, "420");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(100, "div", 44);
    \u0275\u0275element(101, "div", 49);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(102, "td", 46)(103, "span", 29);
    \u0275\u0275text(104, "125 \u0631\u064A\u0627\u0644");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(105, "td", 46)(106, "span", 47);
    \u0275\u0275text(107, "\u0623\u0645\u0633");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(108, "tr", 37)(109, "td", 38)(110, "div", 39);
    \u0275\u0275element(111, "div", 50);
    \u0275\u0275elementStart(112, "span", 41);
    \u0275\u0275text(113, "\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u062C\u0645\u0644\u0629 \u0627\u0644\u062D\u062F\u064A\u062B\u0629");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(114, "td", 38)(115, "div", 42)(116, "span", 43);
    \u0275\u0275text(117, "150");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(118, "div", 44);
    \u0275\u0275element(119, "div", 51);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(120, "td", 46)(121, "span", 29);
    \u0275\u0275text(122, "118 \u0631\u064A\u0627\u0644");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(123, "td", 46)(124, "span", 47);
    \u0275\u0275text(125, "\u0645\u0646\u0630 3 \u0623\u064A\u0627\u0645");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(126, "tr", 37)(127, "td", 38)(128, "div", 39);
    \u0275\u0275element(129, "div", 52);
    \u0275\u0275elementStart(130, "span", 41);
    \u0275\u0275text(131, "\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u0648\u062F\u0627\u062F");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(132, "td", 38)(133, "div", 42)(134, "span", 43);
    \u0275\u0275text(135, "950");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(136, "div", 44);
    \u0275\u0275element(137, "div", 53);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(138, "td", 46)(139, "span", 29);
    \u0275\u0275text(140, "122 \u0631\u064A\u0627\u0644");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(141, "td", 46)(142, "span", 47);
    \u0275\u0275text(143, "\u0627\u0644\u064A\u0648\u0645");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(144, "tr", 54)(145, "td", 38)(146, "div", 39);
    \u0275\u0275element(147, "div", 55);
    \u0275\u0275elementStart(148, "span", 41);
    \u0275\u0275text(149, "\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u062D\u062F\u064A\u062B\u0629");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(150, "td", 38)(151, "div", 42)(152, "span", 43);
    \u0275\u0275text(153, "600");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(154, "div", 44);
    \u0275\u0275element(155, "div", 56);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(156, "td", 46)(157, "span", 29);
    \u0275\u0275text(158, "120 \u0631\u064A\u0627\u0644");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(159, "td", 46)(160, "span", 47);
    \u0275\u0275text(161, "\u0645\u0646\u0630 \u0623\u0633\u0628\u0648\u0639");
    \u0275\u0275elementEnd()()()()()();
    \u0275\u0275elementStart(162, "div", 57)(163, "div", 58)(164, "div", 59)(165, "div", 42);
    \u0275\u0275element(166, "div", 40);
    \u0275\u0275elementStart(167, "span", 41);
    \u0275\u0275text(168, "\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u0623\u0645\u064A\u0646 \u0644\u0644\u062A\u062C\u0627\u0631\u0629");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(169, "span", 47);
    \u0275\u0275text(170, "\u0645\u0646\u0630 \u0633\u0627\u0639\u062A\u064A\u0646");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(171, "div", 60)(172, "div", 61)(173, "span", 47);
    \u0275\u0275text(174);
    \u0275\u0275pipe(175, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(176, "div", 42)(177, "span", 62);
    \u0275\u0275text(178, "850");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(179, "div", 63);
    \u0275\u0275element(180, "div", 45);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(181, "div", 61)(182, "span", 47);
    \u0275\u0275text(183);
    \u0275\u0275pipe(184, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(185, "span", 29);
    \u0275\u0275text(186, "120 \u0631\u064A\u0627\u0644");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(187, "div", 58)(188, "div", 59)(189, "div", 42);
    \u0275\u0275element(190, "div", 48);
    \u0275\u0275elementStart(191, "span", 41);
    \u0275\u0275text(192, "\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u062C\u0648\u062F \u0627\u0644\u0645\u0631\u064A\u062D");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(193, "span", 47);
    \u0275\u0275text(194, "\u0623\u0645\u0633");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(195, "div", 60)(196, "div", 61)(197, "span", 47);
    \u0275\u0275text(198);
    \u0275\u0275pipe(199, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(200, "div", 42)(201, "span", 62);
    \u0275\u0275text(202, "420");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(203, "div", 63);
    \u0275\u0275element(204, "div", 49);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(205, "div", 61)(206, "span", 47);
    \u0275\u0275text(207);
    \u0275\u0275pipe(208, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(209, "span", 29);
    \u0275\u0275text(210, "125 \u0631\u064A\u0627\u0644");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(211, "div", 58)(212, "div", 59)(213, "div", 42);
    \u0275\u0275element(214, "div", 50);
    \u0275\u0275elementStart(215, "span", 41);
    \u0275\u0275text(216, "\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u062C\u0645\u0644\u0629 \u0627\u0644\u062D\u062F\u064A\u062B\u0629");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(217, "span", 47);
    \u0275\u0275text(218, "\u0645\u0646\u0630 3 \u0623\u064A\u0627\u0645");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(219, "div", 60)(220, "div", 61)(221, "span", 47);
    \u0275\u0275text(222);
    \u0275\u0275pipe(223, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(224, "div", 42)(225, "span", 62);
    \u0275\u0275text(226, "150");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(227, "div", 63);
    \u0275\u0275element(228, "div", 51);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(229, "div", 61)(230, "span", 47);
    \u0275\u0275text(231);
    \u0275\u0275pipe(232, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(233, "span", 29);
    \u0275\u0275text(234, "118 \u0631\u064A\u0627\u0644");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(235, "div", 58)(236, "div", 59)(237, "div", 42);
    \u0275\u0275element(238, "div", 52);
    \u0275\u0275elementStart(239, "span", 41);
    \u0275\u0275text(240, "\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u0648\u062F\u0627\u062F");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(241, "span", 47);
    \u0275\u0275text(242, "\u0627\u0644\u064A\u0648\u0645");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(243, "div", 60)(244, "div", 61)(245, "span", 47);
    \u0275\u0275text(246);
    \u0275\u0275pipe(247, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(248, "div", 42)(249, "span", 62);
    \u0275\u0275text(250, "950");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(251, "div", 63);
    \u0275\u0275element(252, "div", 53);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(253, "div", 61)(254, "span", 47);
    \u0275\u0275text(255);
    \u0275\u0275pipe(256, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(257, "span", 29);
    \u0275\u0275text(258, "122 \u0631\u064A\u0627\u0644");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(259, "div", 58)(260, "div", 59)(261, "div", 42);
    \u0275\u0275element(262, "div", 55);
    \u0275\u0275elementStart(263, "span", 41);
    \u0275\u0275text(264, "\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u062D\u062F\u064A\u062B\u0629");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(265, "span", 47);
    \u0275\u0275text(266, "\u0645\u0646\u0630 \u0623\u0633\u0628\u0648\u0639");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(267, "div", 60)(268, "div", 61)(269, "span", 47);
    \u0275\u0275text(270);
    \u0275\u0275pipe(271, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(272, "div", 42)(273, "span", 62);
    \u0275\u0275text(274, "600");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(275, "div", 63);
    \u0275\u0275element(276, "div", 56);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(277, "div", 61)(278, "span", 47);
    \u0275\u0275text(279);
    \u0275\u0275pipe(280, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(281, "span", 29);
    \u0275\u0275text(282, "120 \u0631\u064A\u0627\u0644");
    \u0275\u0275elementEnd()()()()()()()()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(6);
    \u0275\u0275property("src", ctx_r2.getMainImage(), \u0275\u0275sanitizeUrl)("alt", ctx_r2.activeLang === "ar" ? ctx_r2.product.nameAr : ctx_r2.product.nameEn);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r2.product.images && ctx_r2.product.images.length > 1);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(14, 32, "PRODUCTS.DETAIL.PRODUCT_NAME"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", ctx_r2.activeLang === "ar" ? ctx_r2.product.nameAr : ctx_r2.product.nameEn, " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", \u0275\u0275pureFunction3(80, _c0, ctx_r2.product.status === "Active", ctx_r2.product.status === "Draft", ctx_r2.product.status === "Inactive" || ctx_r2.product.status === "Discontinued"));
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", \u0275\u0275pureFunction3(84, _c1, ctx_r2.product.status === "Active", ctx_r2.product.status === "Draft", ctx_r2.product.status === "Inactive" || ctx_r2.product.status === "Discontinued"));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(21, 34, "PRODUCTS.DETAIL.STATUS_" + ctx_r2.product.status.toUpperCase()));
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", ctx_r2.product.descriptionAr || ctx_r2.product.descriptionEn);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(27, 36, "PRODUCTS.DETAIL.BARCODE"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", ctx_r2.product.barcode || \u0275\u0275pipeBind1(30, 38, "PRODUCTS.DETAIL.NOT_SPECIFIED"), " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(34, 40, "PRODUCTS.DETAIL.UNIT"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", ctx_r2.unitName || ctx_r2.product.unitOfMeasureId || \u0275\u0275pipeBind1(37, 42, "PRODUCTS.DETAIL.NOT_SPECIFIED"), " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(41, 44, "PRODUCTS.DETAIL.CATEGORY"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", ctx_r2.categoryName || ctx_r2.product.categoryId, " ");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(47, 46, "PRODUCTS.DETAIL.BRAND"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", ctx_r2.brandName || ctx_r2.product.brandId || \u0275\u0275pipeBind1(50, 48, "PRODUCTS.DETAIL.NOT_SPECIFIED"), " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(54, 50, "PRODUCTS.DETAIL.VENDORS_TABLE"));
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(61, 52, "PRODUCTS.DETAIL.VENDOR_NAME"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(64, 54, "PRODUCTS.DETAIL.AVAILABLE_QTY"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(67, 56, "PRODUCTS.DETAIL.UNIT_PRICE"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(70, 58, "PRODUCTS.DETAIL.LAST_UPDATE"));
    \u0275\u0275advance(105);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(175, 60, "PRODUCTS.DETAIL.AVAILABLE_QTY"));
    \u0275\u0275advance(9);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(184, 62, "PRODUCTS.DETAIL.UNIT_PRICE"));
    \u0275\u0275advance(15);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(199, 64, "PRODUCTS.DETAIL.AVAILABLE_QTY"));
    \u0275\u0275advance(9);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(208, 66, "PRODUCTS.DETAIL.UNIT_PRICE"));
    \u0275\u0275advance(15);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(223, 68, "PRODUCTS.DETAIL.AVAILABLE_QTY"));
    \u0275\u0275advance(9);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(232, 70, "PRODUCTS.DETAIL.UNIT_PRICE"));
    \u0275\u0275advance(15);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(247, 72, "PRODUCTS.DETAIL.AVAILABLE_QTY"));
    \u0275\u0275advance(9);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(256, 74, "PRODUCTS.DETAIL.UNIT_PRICE"));
    \u0275\u0275advance(15);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(271, 76, "PRODUCTS.DETAIL.AVAILABLE_QTY"));
    \u0275\u0275advance(9);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(280, 78, "PRODUCTS.DETAIL.UNIT_PRICE"));
  }
}
function ProductDetailComponent_div_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 4)(1, "div", 69)(2, "div", 70);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(3, "svg", 71);
    \u0275\u0275element(4, "path", 72);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(5, "h3", 73);
    \u0275\u0275text(6);
    \u0275\u0275pipe(7, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "p", 74);
    \u0275\u0275text(9);
    \u0275\u0275pipe(10, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "app-button", 75);
    \u0275\u0275listener("btnClick", function ProductDetailComponent_div_4_Template_app_button_btnClick_11_listener() {
      \u0275\u0275restoreView(_r5);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.goBack());
    });
    \u0275\u0275text(12);
    \u0275\u0275pipe(13, "translate");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(7, 3, "PRODUCTS.DETAIL.NOT_FOUND"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(10, 5, "PRODUCTS.DETAIL.NOT_FOUND_DESC"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(13, 7, "PRODUCTS.DETAIL.BACK_TO_PRODUCTS"), " ");
  }
}
var ProductDetailComponent = class _ProductDetailComponent {
  route;
  router;
  catalogService;
  translate;
  product = null;
  isLoading = true;
  selectedImageIndex = 0;
  categoryName = "";
  brandName = "";
  unitName = "";
  breadcrumbs = [];
  constructor(route, router, catalogService, translate) {
    this.route = route;
    this.router = router;
    this.catalogService = catalogService;
    this.translate = translate;
  }
  get activeLang() {
    return this.translate.currentLang || "ar";
  }
  ngOnInit() {
    this.setupBreadcrumbs();
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.loadProduct(id);
    }
  }
  setupBreadcrumbs() {
    this.breadcrumbs = [
      { label: this.translate.instant("SIDEBAR.CATALOG"), action: () => this.goBack() },
      { label: this.translate.instant("PRODUCTS.TITLE"), action: () => this.goBack() },
      { label: this.translate.instant("PRODUCTS.DETAIL.TITLE") }
    ];
  }
  loadProduct(id) {
    this.isLoading = true;
    this.catalogService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loadCategoryAndBrand();
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading product", err);
        this.isLoading = false;
      }
    });
  }
  loadCategoryAndBrand() {
    if (this.product?.categoryId) {
      this.catalogService.getCategoryById(this.product.categoryId).subscribe({
        next: (category) => {
          this.categoryName = this.activeLang === "ar" ? category.nameAr : category.nameEn;
        },
        error: (err) => console.error("Error loading category", err)
      });
    }
    if (this.product?.brandId) {
      this.catalogService.getBrands().subscribe({
        next: (brands) => {
          const brand = brands.find((b) => b.id === this.product?.brandId);
          if (brand) {
            this.brandName = this.activeLang === "ar" ? brand.nameAr : brand.nameEn;
          }
        },
        error: (err) => console.error("Error loading brands", err)
      });
    }
    if (this.product?.unitOfMeasureId) {
      this.catalogService.getUnits().subscribe({
        next: (units) => {
          const unit = units.find((u) => u.id === this.product?.unitOfMeasureId);
          if (unit) {
            this.unitName = this.activeLang === "ar" ? unit.nameAr : unit.nameEn;
          }
        },
        error: (err) => console.error("Error loading units", err)
      });
    }
  }
  selectImage(index) {
    this.selectedImageIndex = index;
  }
  getMainImage() {
    if (!this.product?.images || this.product.images.length === 0) {
      return "assets/images/placeholder-product.png";
    }
    const selectedImage = this.product.images[this.selectedImageIndex];
    if (selectedImage?.url) {
      return selectedImage.url;
    }
    return this.product.images[0]?.url || "assets/images/placeholder-product.png";
  }
  goBack() {
    this.router.navigate(["/catalog/products"]);
  }
  editProduct() {
    if (this.product?.id) {
      this.router.navigate(["/catalog/products/edit", this.product.id]);
    }
  }
  static \u0275fac = function ProductDetailComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ProductDetailComponent)(\u0275\u0275directiveInject(ActivatedRoute), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(CatalogService), \u0275\u0275directiveInject(TranslateService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ProductDetailComponent, selectors: [["app-product-detail"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 5, vars: 5, consts: [[1, "min-h-screen", "bg-gradient-to-br", "from-slate-50", "to-slate-100/50", "p-4", "md:p-6"], ["actionButtonIcon", "edit", 3, "backClick", "actionClick", "breadcrumbs", "actionButtonLabel"], ["class", "flex items-center justify-center min-h-[400px]", 4, "ngIf"], ["class", "max-w-7xl mx-auto", 4, "ngIf"], [1, "flex", "items-center", "justify-center", "min-h-[400px]"], [1, "relative", "w-16", "h-16"], [1, "absolute", "inset-0", "rounded-full", "border-4", "border-zadna-primary/20"], [1, "absolute", "inset-0", "rounded-full", "border-4", "border-t-zadna-primary", "animate-spin"], [1, "max-w-7xl", "mx-auto"], [1, "grid", "grid-cols-1", "lg:grid-cols-3", "gap-6"], [1, "lg:col-span-1", "lg:order-2"], [1, "bg-white", "rounded-2xl", "shadow-sm", "border", "border-slate-200", "p-6", "sticky", "top-6"], [1, "mb-4"], [1, "aspect-square", "rounded-xl", "overflow-hidden", "bg-slate-50", "border", "border-slate-100"], [1, "w-full", "h-full", "object-cover", 3, "src", "alt"], ["class", "grid grid-cols-4 gap-2", 4, "ngIf"], [1, "lg:col-span-2", "lg:order-1", "space-y-6"], [1, "bg-white", "rounded-2xl", "shadow-sm", "border", "border-slate-200", "p-6"], [1, "flex", "items-start", "justify-between", "mb-4"], [1, "flex-1"], [1, "text-xs", "text-slate-500", "mb-1"], [1, "text-xl", "font-bold", "text-slate-900", "mb-1"], [1, "flex", "items-center", "gap-2", "px-3", "py-1.5", "rounded-full", "text-sm", "font-medium", 3, "ngClass"], [1, "w-1.5", "h-1.5", "rounded-full", 3, "ngClass"], ["class", "mt-4 pt-4 border-t border-slate-100", 4, "ngIf"], [1, "grid", "grid-cols-2", "gap-4"], [1, "bg-white", "rounded-xl", "shadow-sm", "border", "border-slate-200", "p-4"], [1, "text-xs", "text-slate-500", "mb-2"], [1, "text-sm", "font-semibold", "text-slate-900", "font-mono", "bg-slate-50", "px-3", "py-2", "rounded-lg", "inline-block"], [1, "text-sm", "font-semibold", "text-slate-900"], [1, "bg-white", "rounded-xl", "shadow-sm", "border", "border-slate-200", "p-6"], [1, "text-lg", "font-bold", "text-slate-900", "mb-4"], [1, "hidden", "md:block", "overflow-x-auto"], [1, "w-full"], [1, "border-b", "border-slate-200"], [1, "text-right", "text-xs", "font-semibold", "text-slate-600", "pb-3", "px-2"], [1, "text-center", "text-xs", "font-semibold", "text-slate-600", "pb-3", "px-2"], [1, "border-b", "border-slate-100", "hover:bg-slate-50", "transition-colors"], [1, "py-3", "px-2"], [1, "flex", "items-center", "gap-3"], [1, "w-2", "h-2", "rounded-full", "bg-emerald-500"], [1, "text-sm", "font-medium", "text-slate-900"], [1, "flex", "items-center", "gap-2"], [1, "text-sm", "font-bold", "text-slate-700", "w-10", "text-right"], [1, "flex-1", "h-2", "bg-slate-100", "rounded-full", "overflow-hidden"], [1, "h-full", "bg-teal-600", "rounded-full", 2, "width", "85%"], [1, "text-center", "py-3", "px-2"], [1, "text-xs", "text-slate-500"], [1, "w-2", "h-2", "rounded-full", "bg-red-500"], [1, "h-full", "bg-teal-600", "rounded-full", 2, "width", "42%"], [1, "w-2", "h-2", "rounded-full", "bg-blue-500"], [1, "h-full", "bg-teal-600", "rounded-full", 2, "width", "15%"], [1, "w-2", "h-2", "rounded-full", "bg-purple-500"], [1, "h-full", "bg-teal-600", "rounded-full", 2, "width", "95%"], [1, "hover:bg-slate-50", "transition-colors"], [1, "w-2", "h-2", "rounded-full", "bg-pink-500"], [1, "h-full", "bg-teal-600", "rounded-full", 2, "width", "60%"], [1, "md:hidden", "space-y-4"], [1, "bg-slate-50", "rounded-lg", "p-4", "border", "border-slate-100"], [1, "flex", "items-center", "justify-between", "mb-3"], [1, "space-y-2"], [1, "flex", "items-center", "justify-between"], [1, "text-sm", "font-bold", "text-slate-700"], [1, "w-16", "h-2", "bg-slate-200", "rounded-full", "overflow-hidden"], [1, "grid", "grid-cols-4", "gap-2"], ["class", "aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all", 3, "border-zadna-primary", "border-slate-200", "opacity-50", "click", 4, "ngFor", "ngForOf"], [1, "aspect-square", "rounded-lg", "overflow-hidden", "cursor-pointer", "border-2", "transition-all", 3, "click"], [1, "mt-4", "pt-4", "border-t", "border-slate-100"], [1, "text-sm", "text-slate-700", "leading-relaxed"], [1, "text-center"], [1, "w-24", "h-24", "bg-slate-100", "rounded-2xl", "flex", "items-center", "justify-center", "mx-auto", "mb-4"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-12", "h-12", "text-slate-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"], [1, "text-xl", "font-bold", "text-slate-900", "mb-2"], [1, "text-sm", "text-slate-500", "mb-6"], ["variant", "primary", 3, "btnClick"]], template: function ProductDetailComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "app-detail-header", 1);
      \u0275\u0275listener("backClick", function ProductDetailComponent_Template_app_detail_header_backClick_1_listener() {
        return ctx.goBack();
      })("actionClick", function ProductDetailComponent_Template_app_detail_header_actionClick_1_listener() {
        return ctx.editProduct();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275template(2, ProductDetailComponent_div_2_Template, 4, 0, "div", 2)(3, ProductDetailComponent_div_3_Template, 283, 88, "div", 3)(4, ProductDetailComponent_div_4_Template, 14, 9, "div", 2);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance();
      \u0275\u0275property("breadcrumbs", ctx.breadcrumbs)("actionButtonLabel", ctx.translate.instant("PRODUCTS.DETAIL.EDIT"));
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.isLoading);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.isLoading && ctx.product);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.isLoading && !ctx.product);
    }
  }, dependencies: [
    CommonModule,
    NgClass,
    NgForOf,
    NgIf,
    RouterModule,
    TranslateModule,
    TranslatePipe,
    AppButtonComponent,
    DetailHeaderComponent
  ], encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ProductDetailComponent, { className: "ProductDetailComponent", filePath: "src\\app\\features\\catalog\\product-detail\\product-detail.component.ts", lineNumber: 25 });
})();
export {
  ProductDetailComponent
};
//# sourceMappingURL=chunk-3HYLI4TY.js.map
