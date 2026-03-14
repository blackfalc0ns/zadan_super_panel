import {
  CategoryFormModalComponent,
  DeleteConfirmationModalComponent
} from "./chunk-FEV6Q277.js";
import {
  AppPaginationComponent
} from "./chunk-LI5G6AB4.js";
import "./chunk-J7OIUMD3.js";
import "./chunk-QQC6B7P6.js";
import "./chunk-H5RLU432.js";
import "./chunk-E66AVT3J.js";
import "./chunk-33QDSRRV.js";
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
  DatePipe,
  Location,
  NgForOf,
  NgIf,
  Subject,
  takeUntil,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵclassMap,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
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
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵpropertyInterpolate,
  ɵɵpureFunction3,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtextInterpolate3
} from "./chunk-IPPBI3AG.js";

// src/app/features/catalog/categories-manager/category-details/category-details.component.ts
var _c0 = (a0, a1, a2) => ({ id: a0, nameAr: a1, nameEn: a2 });
function CategoryDetailsComponent_app_detail_header_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-detail-header", 8);
    \u0275\u0275pipe(1, "translate");
    \u0275\u0275listener("backClick", function CategoryDetailsComponent_app_detail_header_1_Template_app_detail_header_backClick_0_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onBack());
    })("actionClick", function CategoryDetailsComponent_app_detail_header_1_Template_app_detail_header_actionClick_0_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onEdit());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275propertyInterpolate("actionButtonLabel", \u0275\u0275pipeBind1(1, 2, "COMMON.EDIT"));
    \u0275\u0275property("breadcrumbs", ctx_r1.breadcrumbs);
  }
}
function CategoryDetailsComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 9)(1, "div", 10);
    \u0275\u0275element(2, "div", 11);
    \u0275\u0275elementStart(3, "div", 12);
    \u0275\u0275element(4, "div", 13);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "p", 14);
    \u0275\u0275text(6);
    \u0275\u0275pipe(7, "translate");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(7, 1, "CATEGORIES.DETAILS.SYNCING"));
  }
}
function CategoryDetailsComponent_div_4_img_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 97);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275property("src", ctx_r1.category.imageUrl, \u0275\u0275sanitizeUrl)("alt", ctx_r1.category.nameEn);
  }
}
function CategoryDetailsComponent_div_4_div_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 98);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(1, "svg", 99);
    \u0275\u0275element(2, "path", 100);
    \u0275\u0275elementEnd()();
  }
}
function CategoryDetailsComponent_div_4_ng_container_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275element(1, "div", 101);
    \u0275\u0275elementStart(2, "div", 102);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(3, "svg", 103);
    \u0275\u0275element(4, "path", 104);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(5, "span", 50);
    \u0275\u0275text(6);
    \u0275\u0275pipe(7, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate2("", \u0275\u0275pipeBind1(7, 2, "CATEGORIES.DETAILS.LEVEL"), " ", ctx_r1.category.level, "");
  }
}
function CategoryDetailsComponent_div_4_div_83_tr_17_img_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 132);
  }
  if (rf & 2) {
    const sub_r5 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("src", sub_r5.imageUrl, \u0275\u0275sanitizeUrl);
  }
}
function CategoryDetailsComponent_div_4_div_83_tr_17__svg_svg_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 133);
    \u0275\u0275element(1, "path", 134);
    \u0275\u0275elementEnd();
  }
}
function CategoryDetailsComponent_div_4_div_83_tr_17_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr", 113);
    \u0275\u0275listener("click", function CategoryDetailsComponent_div_4_div_83_tr_17_Template_tr_click_0_listener() {
      const sub_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.onSubNavigate(sub_r5.id));
    });
    \u0275\u0275elementStart(1, "td", 114)(2, "div", 56)(3, "div", 115)(4, "div", 116);
    \u0275\u0275template(5, CategoryDetailsComponent_div_4_div_83_tr_17_img_5_Template, 1, 1, "img", 117)(6, CategoryDetailsComponent_div_4_div_83_tr_17__svg_svg_6_Template, 2, 0, "svg", 118);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "div", 119)(8, "span", 120);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "span", 121);
    \u0275\u0275text(11);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(12, "td", 122)(13, "span", 123);
    \u0275\u0275text(14);
    \u0275\u0275pipe(15, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "span", 124);
    \u0275\u0275text(17);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(18, "td", 125)(19, "span", 123);
    \u0275\u0275text(20);
    \u0275\u0275pipe(21, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "app-badge", 126);
    \u0275\u0275text(23);
    \u0275\u0275pipe(24, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(25, "td", 127)(26, "div", 128)(27, "app-button", 129);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(28, "svg", 130);
    \u0275\u0275element(29, "path", 131);
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const sub_r5 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(5);
    \u0275\u0275property("ngIf", sub_r5.imageUrl);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !sub_r5.imageUrl);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", ctx_r1.activeLang === "ar" ? sub_r5.nameAr : sub_r5.nameEn, " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r1.activeLang === "ar" ? sub_r5.nameEn : sub_r5.nameAr, " ");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(15, 10, "COMMON.ORDER"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("#", sub_r5.displayOrder, "");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(21, 12, "PRODUCTS.TABLE.STATUS"));
    \u0275\u0275advance(2);
    \u0275\u0275property("variant", sub_r5.isActive ? "success" : "neutral")("showDot", true);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(24, 14, sub_r5.isActive ? "COMMON.ACTIVE" : "COMMON.INACTIVE"), " ");
  }
}
function CategoryDetailsComponent_div_4_div_83_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 105)(1, "table", 106)(2, "thead", 107)(3, "tr", 108)(4, "th", 109);
    \u0275\u0275text(5);
    \u0275\u0275pipe(6, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "th", 109);
    \u0275\u0275text(8);
    \u0275\u0275pipe(9, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "th", 109);
    \u0275\u0275text(11);
    \u0275\u0275pipe(12, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "th", 110);
    \u0275\u0275text(14);
    \u0275\u0275pipe(15, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(16, "tbody", 111);
    \u0275\u0275template(17, CategoryDetailsComponent_div_4_div_83_tr_17_Template, 30, 16, "tr", 112);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 5, "CATEGORIES.NAME"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(9, 7, "COMMON.ORDER"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(12, 9, "PRODUCTS.TABLE.STATUS"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(15, 11, "COMMON.ACTIONS"));
    \u0275\u0275advance(3);
    \u0275\u0275property("ngForOf", ctx_r1.paginatedSubCategories);
  }
}
function CategoryDetailsComponent_div_4_div_84_div_1_img_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 152);
  }
  if (rf & 2) {
    const sub_r7 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("src", sub_r7.imageUrl, \u0275\u0275sanitizeUrl);
  }
}
function CategoryDetailsComponent_div_4_div_84_div_1__svg_svg_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 153);
    \u0275\u0275element(1, "path", 154);
    \u0275\u0275elementEnd();
  }
}
function CategoryDetailsComponent_div_4_div_84_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 137);
    \u0275\u0275listener("click", function CategoryDetailsComponent_div_4_div_84_div_1_Template_div_click_0_listener() {
      const sub_r7 = \u0275\u0275restoreView(_r6).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.onSubNavigate(sub_r7.id));
    });
    \u0275\u0275element(1, "div", 138);
    \u0275\u0275elementStart(2, "div", 139)(3, "div", 140);
    \u0275\u0275template(4, CategoryDetailsComponent_div_4_div_84_div_1_img_4_Template, 1, 1, "img", 141)(5, CategoryDetailsComponent_div_4_div_84_div_1__svg_svg_5_Template, 2, 0, "svg", 142);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 143)(7, "div", 144)(8, "app-badge", 126);
    \u0275\u0275text(9);
    \u0275\u0275pipe(10, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "span", 145);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "div")(14, "h4", 146);
    \u0275\u0275text(15);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "p", 147);
    \u0275\u0275text(17);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(18, "div", 148)(19, "div", 149)(20, "span", 45);
    \u0275\u0275text(21);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(22, "div", 150)(23, "span", 38);
    \u0275\u0275text(24);
    \u0275\u0275pipe(25, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(26, "svg", 151);
    \u0275\u0275element(27, "path", 131);
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const sub_r7 = ctx.$implicit;
    const i_r8 = ctx.index;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngIf", sub_r7.imageUrl);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !sub_r7.imageUrl);
    \u0275\u0275advance(3);
    \u0275\u0275property("variant", sub_r7.isActive ? "success" : "neutral")("showDot", true);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(10, 10, sub_r7.isActive ? "COMMON.ACTIVE" : "COMMON.INACTIVE"), " ");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("#", i_r8 + 101, "");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", ctx_r1.activeLang === "ar" ? sub_r7.nameAr : sub_r7.nameEn, "");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.activeLang === "ar" ? sub_r7.nameEn : sub_r7.nameAr);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("ID: ", sub_r7.id.substring(0, 5), "");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(25, 12, "CATEGORIES.DETAILS.OPEN"));
  }
}
function CategoryDetailsComponent_div_4_div_84_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 135);
    \u0275\u0275template(1, CategoryDetailsComponent_div_4_div_84_div_1_Template, 28, 14, "div", 136);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r1.paginatedSubCategories);
  }
}
function CategoryDetailsComponent_div_4_div_85_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 155)(1, "app-pagination", 156);
    \u0275\u0275listener("pageChange", function CategoryDetailsComponent_div_4_div_85_Template_app_pagination_pageChange_1_listener($event) {
      \u0275\u0275restoreView(_r9);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onPageChange($event));
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275property("currentPage", ctx_r1.pageNumber)("pageSize", ctx_r1.pageSize)("totalItems", ctx_r1.totalSubCategories);
  }
}
function CategoryDetailsComponent_div_4_div_86__svg_svg_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 164);
    \u0275\u0275element(1, "path", 165);
    \u0275\u0275elementEnd();
  }
}
function CategoryDetailsComponent_div_4_div_86__svg_svg_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 164);
    \u0275\u0275element(1, "path", 166);
    \u0275\u0275elementEnd();
  }
}
function CategoryDetailsComponent_div_4_div_86_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 157)(1, "div", 158)(2, "div", 159);
    \u0275\u0275template(3, CategoryDetailsComponent_div_4_div_86__svg_svg_3_Template, 2, 0, "svg", 160)(4, CategoryDetailsComponent_div_4_div_86__svg_svg_4_Template, 2, 0, "svg", 160);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "h4", 161);
    \u0275\u0275text(6);
    \u0275\u0275pipe(7, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "p", 162);
    \u0275\u0275text(9);
    \u0275\u0275pipe(10, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "app-button", 163);
    \u0275\u0275listener("btnClick", function CategoryDetailsComponent_div_4_div_86_Template_app_button_btnClick_11_listener() {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.category.level === 3 ? ctx_r1.onCreateProduct() : ctx_r1.openCreateModal());
    });
    \u0275\u0275text(12);
    \u0275\u0275pipe(13, "translate");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", ctx_r1.category.level < 3);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.category.level >= 3);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(7, 5, ctx_r1.category.level === 3 ? "PRODUCTS.TITLE" : "CATEGORIES.DETAILS.NO_SUB_MODULES"), " ");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(10, 7, ctx_r1.category.level === 3 ? "PRODUCTS.NO_PRODUCTS" : "CATEGORIES.DETAILS.NO_ITEMS_FOUND"), " ");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(13, 9, ctx_r1.category.level === 3 ? "CATEGORIES.CREATE_PRODUCT" : "CATEGORIES.DETAILS.ADD_CHILD"), " ");
  }
}
function CategoryDetailsComponent_div_4_div_99_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 167);
    \u0275\u0275listener("click", function CategoryDetailsComponent_div_4_div_99_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r11);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onSubNavigate(ctx_r1.category.parentCategoryId));
    });
    \u0275\u0275elementStart(1, "div", 168);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(2, "svg", 80);
    \u0275\u0275element(3, "path", 169);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(4, "div", 170)(5, "p", 171);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "p", 172);
    \u0275\u0275text(8);
    \u0275\u0275pipe(9, "translate");
    \u0275\u0275pipe(10, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(11, "svg", 173);
    \u0275\u0275element(12, "path", 131);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(ctx_r1.activeLang === "ar" ? ctx_r1.category.parentNameAr : ctx_r1.category.parentNameEn);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate3("", \u0275\u0275pipeBind1(9, 4, "CATEGORIES.DETAILS.LEVEL"), " ", ctx_r1.category.level - 1, " ", \u0275\u0275pipeBind1(10, 6, "CATEGORIES.DETAILS.NODES"), "");
  }
}
function CategoryDetailsComponent_div_4_div_100_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 174)(1, "span", 175);
    \u0275\u0275text(2);
    \u0275\u0275pipe(3, "translate");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(3, 1, "CATEGORIES.DETAILS.ROOT_ENTRY"));
  }
}
function CategoryDetailsComponent_div_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 15)(1, "div", 16)(2, "div", 17);
    \u0275\u0275element(3, "div", 18);
    \u0275\u0275elementStart(4, "div", 19)(5, "div", 20)(6, "div", 21)(7, "div", 22);
    \u0275\u0275template(8, CategoryDetailsComponent_div_4_img_8_Template, 1, 2, "img", 23)(9, CategoryDetailsComponent_div_4_div_9_Template, 3, 0, "div", 24);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "div", 25)(11, "span", 26);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(13, "div", 27)(14, "div", 28)(15, "div", 29)(16, "app-badge", 30);
    \u0275\u0275text(17);
    \u0275\u0275pipe(18, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275template(19, CategoryDetailsComponent_div_4_ng_container_19_Template, 8, 4, "ng-container", 31);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "div", 32)(21, "h2", 33);
    \u0275\u0275text(22);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "h3", 34);
    \u0275\u0275text(24);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(25, "div", 35)(26, "div", 36);
    \u0275\u0275element(27, "span", 37);
    \u0275\u0275elementStart(28, "span", 38);
    \u0275\u0275text(29);
    \u0275\u0275pipe(30, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(31, "div", 39);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(32, "svg", 40);
    \u0275\u0275element(33, "path", 41);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(34, "span", 38);
    \u0275\u0275text(35);
    \u0275\u0275pipe(36, "translate");
    \u0275\u0275elementEnd()()()()()();
    \u0275\u0275elementStart(37, "div", 42)(38, "div", 43)(39, "div", 44)(40, "span", 45);
    \u0275\u0275text(41);
    \u0275\u0275pipe(42, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(43, "span", 46);
    \u0275\u0275text(44);
    \u0275\u0275elementEnd()();
    \u0275\u0275element(45, "div", 47);
    \u0275\u0275elementStart(46, "div", 44);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(47, "svg", 48);
    \u0275\u0275element(48, "path", 49);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(49, "span", 50);
    \u0275\u0275text(50);
    \u0275\u0275pipe(51, "date");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(52, "div", 51)(53, "span", 52);
    \u0275\u0275text(54);
    \u0275\u0275pipe(55, "translate");
    \u0275\u0275elementEnd()()()()();
    \u0275\u0275elementStart(56, "div", 53)(57, "div", 54)(58, "div", 55)(59, "div", 56)(60, "div", 57);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(61, "svg", 58);
    \u0275\u0275element(62, "path", 59);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(63, "div")(64, "h2", 60);
    \u0275\u0275text(65);
    \u0275\u0275pipe(66, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(67, "p", 61);
    \u0275\u0275text(68);
    \u0275\u0275pipe(69, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(70, "div", 62)(71, "button", 63);
    \u0275\u0275listener("click", function CategoryDetailsComponent_div_4_Template_button_click_71_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.viewMode = "grid");
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(72, "svg", 64);
    \u0275\u0275element(73, "path", 65);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(74, "button", 63);
    \u0275\u0275listener("click", function CategoryDetailsComponent_div_4_Template_button_click_74_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.viewMode = "table");
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(75, "svg", 64);
    \u0275\u0275element(76, "path", 66);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275element(77, "div", 67);
    \u0275\u0275elementStart(78, "app-button", 68);
    \u0275\u0275listener("btnClick", function CategoryDetailsComponent_div_4_Template_app_button_btnClick_78_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.openCreateModal());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(79, "svg", 69);
    \u0275\u0275element(80, "path", 70);
    \u0275\u0275elementEnd();
    \u0275\u0275text(81);
    \u0275\u0275pipe(82, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(83, CategoryDetailsComponent_div_4_div_83_Template, 18, 13, "div", 71)(84, CategoryDetailsComponent_div_4_div_84_Template, 2, 1, "div", 72)(85, CategoryDetailsComponent_div_4_div_85_Template, 2, 3, "div", 73)(86, CategoryDetailsComponent_div_4_div_86_Template, 14, 11, "div", 74);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(87, "aside", 75)(88, "div", 76);
    \u0275\u0275element(89, "div", 77);
    \u0275\u0275elementStart(90, "div", 78)(91, "div", 56)(92, "div", 79);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(93, "svg", 80);
    \u0275\u0275element(94, "path", 81);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(95, "h4", 82);
    \u0275\u0275text(96);
    \u0275\u0275pipe(97, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(98, "div", 83);
    \u0275\u0275template(99, CategoryDetailsComponent_div_4_div_99_Template, 13, 8, "div", 84)(100, CategoryDetailsComponent_div_4_div_100_Template, 4, 3, "div", 85);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(101, "div", 86)(102, "div", 87);
    \u0275\u0275element(103, "div", 88);
    \u0275\u0275elementStart(104, "h4", 89);
    \u0275\u0275text(105);
    \u0275\u0275pipe(106, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(107, "div", 90)(108, "div", 91)(109, "span", 92);
    \u0275\u0275text(110);
    \u0275\u0275pipe(111, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(112, "span", 93);
    \u0275\u0275text(113);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(114, "div", 94);
    \u0275\u0275element(115, "div", 95);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(116, "p", 96);
    \u0275\u0275text(117);
    \u0275\u0275pipe(118, "translate");
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(8);
    \u0275\u0275property("ngIf", ctx_r1.category.imageUrl);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.category.imageUrl);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("#", ctx_r1.category.displayOrder, "");
    \u0275\u0275advance(4);
    \u0275\u0275property("variant", ctx_r1.category.parentCategoryId ? "neutral" : "success");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(18, 36, ctx_r1.getLevelNameKey(ctx_r1.category.level || 0)), " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", ctx_r1.category.level);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.category.nameAr);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.category.nameEn);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(30, 38, ctx_r1.category.isActive ? "COMMON.ACTIVE" : "COMMON.INACTIVE"));
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate2("", ctx_r1.category.masterProductsCount || 0, " ", \u0275\u0275pipeBind1(36, 40, "SIDEBAR.CATALOG_PRODUCTS"), "");
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(42, 42, "COMMON.ID"), ":");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", ctx_r1.category.id.substring(0, 13), "...");
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind2(51, 44, ctx_r1.category.createdAtUtc, "shortDate"));
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(55, 47, "CATEGORIES.DETAILS.SECURE_NODE"));
    \u0275\u0275advance(11);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(66, 49, "CATEGORIES.DETAILS.SUB_ITEMS"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate2("", (ctx_r1.category.subCategories == null ? null : ctx_r1.category.subCategories.length) || 0, " ", \u0275\u0275pipeBind1(69, 51, "CATEGORIES.DETAILS.BRANCH_NODES"), "");
    \u0275\u0275advance(3);
    \u0275\u0275classMap(ctx_r1.viewMode === "grid" ? "bg-zadna-primary text-white" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50");
    \u0275\u0275advance(3);
    \u0275\u0275classMap(ctx_r1.viewMode === "table" ? "bg-zadna-primary text-white" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50");
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(82, 53, "CATEGORIES.DETAILS.ADD_CHILD"), " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", (ctx_r1.category.subCategories == null ? null : ctx_r1.category.subCategories.length) && ctx_r1.viewMode === "table");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", (ctx_r1.category.subCategories == null ? null : ctx_r1.category.subCategories.length) && ctx_r1.viewMode === "grid");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.totalSubCategories > ctx_r1.pageSize);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !(ctx_r1.category.subCategories == null ? null : ctx_r1.category.subCategories.length));
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(97, 55, "CATEGORIES.DETAILS.CONTEXTUAL_PATH"));
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", ctx_r1.category.parentCategoryId);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !ctx_r1.category.parentCategoryId);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(106, 57, "CATEGORIES.DETAILS.LIVE_FLOW"));
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(111, 59, "CATEGORIES.DETAILS.PEERS"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate((ctx_r1.category.subCategories == null ? null : ctx_r1.category.subCategories.length) || 0);
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("width", ((ctx_r1.category.subCategories == null ? null : ctx_r1.category.subCategories.length) || 0) * 10 + "%");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(118, 61, "CATEGORIES.DETAILS.SYNC_ACTIVE"));
  }
}
function CategoryDetailsComponent_app_category_form_modal_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-category-form-modal", 176);
    \u0275\u0275listener("close", function CategoryDetailsComponent_app_category_form_modal_5_Template_app_category_form_modal_close_0_listener() {
      \u0275\u0275restoreView(_r12);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.isEditModalOpen = false);
    })("saved", function CategoryDetailsComponent_app_category_form_modal_5_Template_app_category_form_modal_saved_0_listener() {
      \u0275\u0275restoreView(_r12);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.handleSaved());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("isOpen", ctx_r1.isEditModalOpen)("mode", "edit")("levelNameKey", ctx_r1.getLevelNameKey(ctx_r1.category.level || 0))("initialData", ctx_r1.category);
  }
}
function CategoryDetailsComponent_app_category_form_modal_6_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-category-form-modal", 177);
    \u0275\u0275listener("close", function CategoryDetailsComponent_app_category_form_modal_6_Template_app_category_form_modal_close_0_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.isCreateModalOpen = false);
    })("saved", function CategoryDetailsComponent_app_category_form_modal_6_Template_app_category_form_modal_saved_0_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.handleSaved());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("isOpen", ctx_r1.isCreateModalOpen)("mode", "create")("levelNameKey", ctx_r1.getLevelNameKey((ctx_r1.category.level !== void 0 ? ctx_r1.category.level : 0) + 1))("parentCategory", \u0275\u0275pureFunction3(4, _c0, ctx_r1.category.id, ctx_r1.category.nameAr, ctx_r1.category.nameEn));
  }
}
var CategoryDetailsComponent = class _CategoryDetailsComponent {
  route;
  router;
  catalogService;
  translate;
  location;
  category = null;
  isLoading = true;
  activeLang = "ar";
  isEditModalOpen = false;
  isCreateModalOpen = false;
  isDeleteModalOpen = false;
  isDeleting = false;
  viewMode = "table";
  breadcrumbs = [];
  // Pagination
  pageNumber = 1;
  pageSize = 6;
  destroy$ = new Subject();
  constructor(route, router, catalogService, translate, location) {
    this.route = route;
    this.router = router;
    this.catalogService = catalogService;
    this.translate = translate;
    this.location = location;
    this.activeLang = this.translate.currentLang || "ar";
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      this.activeLang = event.lang;
    });
  }
  ngOnInit() {
    this.setupBreadcrumbs();
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params["id"];
      if (id) {
        this.loadCategory(id);
      }
    });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  setupBreadcrumbs() {
    this.breadcrumbs = [
      { label: this.translate.instant("SIDEBAR.CATALOG"), action: () => this.onBack() },
      { label: this.translate.instant("CATEGORIES.MENU.CATEGORIES"), action: () => this.onBack() },
      { label: this.translate.instant("COMMON.DETAILS") }
    ];
  }
  getBreadcrumbs() {
    return [
      { label: "SIDEBAR.CATALOG", url: "/catalog" },
      { label: "CATEGORIES.MENU.CATEGORIES", url: "/catalog/categories" },
      { label: "COMMON.DETAILS" }
    ];
  }
  getLevelNameKey(depth) {
    if (depth === 0)
      return "CATEGORIES.INDUSTRY";
    if (depth === 1)
      return "CATEGORIES.SUB_INDUSTRY";
    if (depth === 2)
      return "CATEGORIES.CATEGORY";
    if (depth === 3)
      return "CATEGORIES.SUB_CATEGORY";
    return "CATEGORIES.ITEM";
  }
  loadCategory(id) {
    this.isLoading = true;
    this.catalogService.getCategoryById(id).subscribe({
      next: (data) => {
        this.category = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Failed to load category:", err);
        this.isLoading = false;
      }
    });
  }
  getNextLevelNameKey() {
    const depth = this.category?.level || 0;
    return this.getLevelNameKey(depth + 1);
  }
  getNextLevelCount() {
    return this.category?.subCategories?.length || 0;
  }
  get paginatedSubCategories() {
    if (!this.category?.subCategories)
      return [];
    const start = (this.pageNumber - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.category.subCategories.slice(start, end);
  }
  get totalSubCategories() {
    return this.category?.subCategories?.length || 0;
  }
  onPageChange(page) {
    this.pageNumber = page;
  }
  onBack() {
    this.location.back();
  }
  onEdit() {
    this.isEditModalOpen = true;
  }
  onDelete() {
    this.isDeleteModalOpen = true;
  }
  confirmDelete() {
    if (!this.category)
      return;
    this.isDeleting = true;
    this.catalogService.deleteCategory(this.category.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.isDeleteModalOpen = false;
        this.onBack();
      },
      error: (err) => {
        console.error("Delete failed:", err);
        this.isDeleting = false;
      }
    });
  }
  closeDeleteModal() {
    this.isDeleteModalOpen = false;
  }
  handleSaved() {
    if (this.category) {
      this.loadCategory(this.category.id);
    }
  }
  onSubNavigate(id) {
    this.router.navigate(["/catalog/categories", id]);
  }
  openCreateModal() {
    this.isCreateModalOpen = true;
  }
  onCreateProduct() {
    if (this.category) {
      this.router.navigate(["/catalog/products/create"], { queryParams: { categoryId: this.category.id } });
    }
  }
  static \u0275fac = function CategoryDetailsComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CategoryDetailsComponent)(\u0275\u0275directiveInject(ActivatedRoute), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(CatalogService), \u0275\u0275directiveInject(TranslateService), \u0275\u0275directiveInject(Location));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _CategoryDetailsComponent, selectors: [["app-category-details"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 8, vars: 7, consts: [[1, "min-h-screen", "bg-[#f8fafc]", "font-sans", "pb-12", "animate-in", "fade-in", "duration-700"], ["actionButtonIcon", "edit", 3, "breadcrumbs", "actionButtonLabel", "backClick", "actionClick", 4, "ngIf"], [1, "max-w-[1400px]", "mx-auto", "px-4", "sm:px-6", "lg:px-8", "py-6", "sm:py-8"], ["class", "h-[60vh] flex flex-col items-center justify-center space-y-6", 4, "ngIf"], ["class", "grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10", 4, "ngIf"], [3, "isOpen", "mode", "levelNameKey", "initialData", "close", "saved", 4, "ngIf"], [3, "isOpen", "mode", "levelNameKey", "parentCategory", "close", "saved", 4, "ngIf"], [3, "confirm", "close", "isOpen", "isLoading"], ["actionButtonIcon", "edit", 3, "backClick", "actionClick", "breadcrumbs", "actionButtonLabel"], [1, "h-[60vh]", "flex", "flex-col", "items-center", "justify-center", "space-y-6"], [1, "relative"], [1, "w-16", "h-16", "rounded-full", "border-4", "border-slate-100", "border-t-zadna-primary", "animate-spin"], [1, "absolute", "inset-0", "flex", "items-center", "justify-center"], [1, "w-8", "h-8", "rounded-full", "bg-zadna-primary/10", "animate-pulse"], [1, "text-[12px]", "font-black", "text-slate-400", "uppercase", "tracking-[0.3em]", "animate-pulse"], [1, "grid", "grid-cols-1", "lg:grid-cols-12", "gap-6", "lg:gap-8", "xl:gap-10"], [1, "lg:col-span-8", "order-1"], [1, "bg-white", "rounded-[1.5rem]", "border", "border-slate-100", "shadow-[0_10px_30px_rgba(0,0,0,0.02)]", "relative", "overflow-hidden", "group", "animate-in", "fade-in", "slide-in-from-bottom-6", "duration-700"], [1, "absolute", "-top-16", "-right-16", "w-48", "h-48", "bg-zadna-primary/5", "rounded-full", "blur-[80px]", "opacity-0", "group-hover:opacity-100", "transition-opacity", "duration-1000"], [1, "p-5", "sm:p-7", "xl:p-10", "pb-5", "sm:pb-6", "relative", "z-10", "transition-all", "duration-300"], [1, "flex", "flex-row", "items-start", "lg:items-center", "gap-5", "sm:gap-6", "xl:gap-8"], [1, "relative", "shrink-0"], [1, "w-20", "h-20", "sm:w-24", "sm:h-24", "md:w-28", "md:h-28", "xl:w-32", "xl:h-32", "rounded-[1.25rem]", "sm:rounded-2xl", "xl:rounded-[2rem]", "bg-slate-50", "flex", "items-center", "justify-center", "p-3", "sm:p-4", "xl:p-5", "shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]", "border", "border-slate-100/60", "group-hover:scale-105", "group-hover:-rotate-3", "transition-all", "duration-500"], ["class", "max-w-full max-h-full object-contain filter drop-shadow-xl", 3, "src", "alt", 4, "ngIf"], ["class", "text-slate-200", 4, "ngIf"], [1, "absolute", "-bottom-2", "-right-2", "sm:-bottom-3", "sm:-right-3", "w-10", "h-10", "sm:w-12", "sm:h-12", "rounded-xl", "sm:rounded-2xl", "bg-white", "border-2", "border-slate-50", "flex", "items-center", "justify-center", "shadow-lg", "transform", "group-hover:-translate-y-1", "transition-transform", "duration-500"], [1, "text-xs", "sm:text-sm", "xl:text-base", "font-black", "text-zadna-primary", "leading-none"], [1, "flex-1", "min-w-0", "ltr:text-left", "rtl:text-right", "space-y-3", "sm:space-y-4", "pt-1", "sm:pt-2"], [1, "space-y-1.5"], [1, "flex", "items-center", "ltr:justify-start", "rtl:justify-start", "gap-2", "flex-wrap"], ["size", "sm", 1, "px-2.5", "font-black", "text-[12px]", 3, "variant"], [4, "ngIf"], [1, "space-y-1", "sm:space-y-1.5"], [1, "text-xl", "sm:text-2xl", "lg:text-3xl", "font-black", "text-slate-900", "tracking-tight", "leading-none", "drop-shadow-sm"], [1, "text-[11px]", "sm:text-xs", "font-bold", "text-slate-400", "tracking-[0.2em]", "uppercase"], [1, "flex", "flex-wrap", "items-center", "ltr:justify-start", "rtl:justify-start", "gap-2.5", "sm:gap-3", "xl:gap-4", "pt-3", "sm:pt-4", "border-t", "border-slate-100/60", "mt-2", "sm:mt-3"], [1, "bg-emerald-50", "text-emerald-600", "px-3", "py-1.5", "rounded-xl", "border", "border-emerald-100/50", "flex", "items-center", "gap-2"], [1, "w-1.5", "h-1.5", "rounded-full", "bg-emerald-500"], [1, "text-[12px]", "font-black", "uppercase", "tracking-widest"], [1, "bg-indigo-50", "text-indigo-600", "px-3", "py-1.5", "rounded-xl", "border", "border-indigo-100/50", "flex", "items-center", "gap-2"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3", "h-3", "text-indigo-400"], ["stroke-width", "2.5", "d", "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"], [1, "bg-slate-50/50", "backdrop-blur-sm", "border-t", "border-slate-100", "px-4", "sm:px-6", "py-3", "flex", "flex-wrap", "items-center", "justify-between", "gap-2", "sm:gap-3"], [1, "flex", "items-center", "gap-2", "sm:gap-4", "flex-wrap"], [1, "flex", "items-center", "gap-1.5", "sm:gap-2"], [1, "text-[12px]", "font-black", "text-slate-400", "uppercase", "tracking-widest"], [1, "font-mono", "text-[12px]", "font-bold", "text-slate-500", "bg-white", "border", "border-slate-200", "px-1.5", "sm:px-2", "py-0.5", "rounded", "shadow-sm", "truncate", "max-w-[120px]", "sm:max-w-none"], [1, "h-3", "w-px", "bg-slate-200", "hidden", "sm:block"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3", "h-3", "text-slate-400"], ["stroke-width", "2.5", "d", "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"], [1, "text-[12px]", "font-black", "text-slate-500", "uppercase", "tracking-widest"], [1, "flex", "items-center", "gap-2", "opacity-60", "hidden", "sm:flex"], [1, "text-[12px]", "font-black", "text-slate-400", "uppercase", "tracking-widest", "italic"], [1, "lg:col-span-8", "order-3", "space-y-5", "lg:space-y-6"], [1, "space-y-5", "lg:space-y-6", "animate-in", "fade-in", "slide-in-from-bottom-6", "duration-700"], [1, "flex", "flex-col", "xs:flex-row", "xs:items-center", "justify-between", "gap-4", "sm:gap-5"], [1, "flex", "items-center", "gap-3", "sm:gap-4"], [1, "w-10", "h-10", "sm:w-12", "sm:h-12", "rounded-xl", "sm:rounded-2xl", "bg-zadna-primary", "text-white", "flex", "items-center", "justify-center", "shadow-md", "shadow-zadna-primary/20", "shrink-0"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "sm:w-6", "sm:h-6"], ["stroke-width", "2.5", "d", "M4 6h16M4 12h16m-7 6h7"], [1, "text-lg", "sm:text-xl", "font-black", "text-slate-900", "tracking-tight"], [1, "text-[12px]", "sm:text-xs", "font-bold", "text-slate-400", "uppercase", "tracking-[0.1em]", "mt-0.5"], [1, "flex", "items-center", "gap-2", "bg-white", "border", "border-slate-100", "p-1", "sm:p-1.5", "rounded-xl", "shadow-sm", "self-start", "xs:self-auto"], [1, "w-8", "h-8", "flex", "items-center", "justify-center", "rounded-lg", "transition-all", "duration-300", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-width", "2", "d", "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"], ["stroke-width", "2", "d", "M4 6h16M4 10h16M4 14h16M4 18h16"], [1, "w-px", "h-5", "bg-slate-100", "mx-2"], ["variant", "primary", "size", "sm", "customClass", "rounded-lg px-4 h-8 text-[12px]", 3, "btnClick"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3.5", "h-3.5", "mr-1.5"], ["stroke-width", "2.5", "d", "M12 4v16m8-8H4"], ["class", "extraordinary-table-container w-full p-4 sm:p-0 animate-in fade-in slide-in-from-bottom-5 duration-500", 4, "ngIf"], ["class", "grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-5 xl:gap-6 animate-in fade-in zoom-in-95 duration-500", 4, "ngIf"], ["class", "pt-4 border-t border-slate-50", 4, "ngIf"], ["class", "bg-white rounded-[1.5rem] border border-slate-100 p-12 flex flex-col items-center justify-center group shadow-sm", 4, "ngIf"], [1, "lg:col-span-4", "space-y-5", "lg:space-y-6", "animate-in", "fade-in", "slide-in-from-right-6", "duration-700", "delay-300", "order-2", "lg:row-span-2"], [1, "bg-[#e48215]", "rounded-[1.25rem]", "sm:rounded-[1.5rem]", "p-5", "sm:p-6", "xl:p-8", "shadow-xl", "shadow-[#e48215]/20", "relative", "overflow-hidden", "group", "border", "border-white/10", "transition-all", "duration-300"], [1, "absolute", "-bottom-8", "-left-8", "w-32", "h-32", "bg-white/20", "rounded-full", "blur-[40px]"], [1, "relative", "z-10", "space-y-4", "sm:space-y-5", "xl:space-y-6"], [1, "w-8", "h-8", "sm:w-10", "sm:h-10", "xl:w-12", "xl:h-12", "rounded-xl", "bg-slate-900/10", "flex", "items-center", "justify-center", "text-slate-900"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "sm:w-5", "sm:h-5"], ["stroke-width", "2.5", "d", "M9 20l-5.447-2.724A2 2 0 013 15.483V8.517a2 2 0 011.553-1.793L9 5m0 15l10-5m-10 5l-1-10m11-1V8.517a2 2 0 00-1.553-1.793L13 5m6 3l-6-3m6 3l-10 5m10-5l-1 10m-9-10l1 10"], [1, "text-[12px]", "sm:text-xs", "xl:text-sm", "font-black", "text-slate-900/60", "uppercase", "tracking-[0.2em]", "xl:tracking-[0.25em]"], [1, "space-y-3", "sm:space-y-4"], ["class", "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/40 hover:bg-white/60 border border-white/20 rounded-2xl cursor-pointer transition-all duration-300 group/item", 3, "click", 4, "ngIf"], ["class", "p-3 bg-white/20 border border-dashed border-white/40 rounded-2xl text-center", 4, "ngIf"], [1, "bg-white", "rounded-[1.25rem]", "sm:rounded-[1.5rem]", "border", "border-slate-100", "p-5", "sm:p-6", "shadow-sm", "transition-all", "duration-300"], [1, "flex", "items-center", "gap-2", "mb-5", "sm:mb-6"], [1, "w-1.5", "h-1.5", "sm:w-2", "sm:h-2", "rounded-full", "bg-indigo-500", "animate-ping"], [1, "text-[12px]", "sm:text-xs", "xl:text-sm", "font-black", "text-slate-400", "uppercase", "tracking-[0.2em]"], [1, "space-y-4", "sm:space-y-5"], [1, "flex", "items-center", "justify-between", "text-[12px]", "sm:text-xs", "xl:text-sm", "font-black"], [1, "text-slate-400", "uppercase"], [1, "text-slate-900", "text-sm", "sm:text-base"], [1, "w-full", "h-1.5", "sm:h-2", "bg-slate-50", "rounded-full", "overflow-hidden"], [1, "h-full", "bg-zadna-primary", "transition-all", "duration-1000"], [1, "text-[11px]", "sm:text-[12px]", "font-bold", "text-slate-300", "italic"], [1, "max-w-full", "max-h-full", "object-contain", "filter", "drop-shadow-xl", 3, "src", "alt"], [1, "text-slate-200"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-10", "h-10"], ["stroke-width", "1.5", "d", "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"], [1, "h-1", "w-1", "rounded-full", "bg-slate-200"], [1, "flex", "items-center", "gap-1.5", "bg-slate-50/50", "px-2", "py-0.5", "rounded-full", "border", "border-slate-100"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3", "h-3", "text-zadna-primary"], ["stroke-width", "2.5", "d", "M4 7V4a2 2 0 012-2h4a2 2 0 012 2v3m-6 3h6m-6 3h6m-6 3h6M4 20h16"], [1, "extraordinary-table-container", "w-full", "p-4", "sm:p-0", "animate-in", "fade-in", "slide-in-from-bottom-5", "duration-500"], [1, "w-full", "block", "sm:table"], [1, "hidden", "sm:table-header-group"], [1, "sm:table-row"], [1, "ltr:text-left", "rtl:text-right", "py-3"], [1, "text-center", "py-3"], [1, "block", "sm:table-row-group", "stagger-rows", "w-full"], ["class", "table-row-object group cursor-pointer flex flex-col sm:table-row bg-white sm:bg-transparent rounded-[2rem] sm:rounded-none shadow-sm sm:shadow-none p-4 sm:p-0 mb-4 sm:mb-0 border border-slate-100 sm:border-none relative w-full", 3, "click", 4, "ngFor", "ngForOf"], [1, "table-row-object", "group", "cursor-pointer", "flex", "flex-col", "sm:table-row", "bg-white", "sm:bg-transparent", "rounded-[2rem]", "sm:rounded-none", "shadow-sm", "sm:shadow-none", "p-4", "sm:p-0", "mb-4", "sm:mb-0", "border", "border-slate-100", "sm:border-none", "relative", "w-full", 3, "click"], [1, "block", "sm:table-cell", "py-3", "sm:py-2", "border-b", "border-dashed", "border-slate-100", "sm:border-none"], [1, "relative", "w-12", "h-12", "sm:w-16", "sm:h-16", "shrink-0"], [1, "table-image-preview", "bg-slate-50", "p-2", "flex", "items-center", "justify-center", "border-slate-100", "w-full", "h-full", "rounded-xl"], ["class", "max-w-full max-h-full object-contain", 3, "src", 4, "ngIf"], ["class", "w-5 h-5 text-slate-200", "fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 4, "ngIf"], [1, "flex", "flex-col"], [1, "text-sm", "font-black", "text-slate-900", "group-hover:text-zadna-primary", "transition-colors", "ltr:text-left", "rtl:text-right", "sm:text-start"], [1, "text-[10px]", "font-bold", "text-slate-400", "uppercase", "tracking-widest", "mt-1", "ltr:text-left", "rtl:text-right", "sm:text-start"], [1, "flex", "sm:table-cell", "justify-between", "items-center", "py-3", "sm:py-2", "border-b", "border-dashed", "border-slate-100", "sm:border-none"], [1, "sm:hidden", "text-[10px]", "font-black", "uppercase", "text-slate-400", "tracking-widest"], [1, "text-[12px]", "font-black", "text-slate-600"], [1, "flex", "sm:table-cell", "justify-between", "items-center", "py-3", "sm:py-2"], ["size", "xs", 3, "variant", "showDot"], [1, "flex", "sm:table-cell", "justify-center", "items-center", "pt-3", "sm:pt-2", "mt-1", "sm:mt-0", "border-t", "border-slate-100", "sm:border-none"], [1, "flex", "items-center", "justify-center"], ["variant", "ghost", "size", "sm", "customClass", "rounded-lg w-8 h-8 p-0 hover:bg-zadna-primary/5 hover:text-zadna-primary"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3.5", "h-3.5", "rtl:rotate-180"], ["stroke-width", "3", "d", "M9 5l7 7-7 7"], [1, "max-w-full", "max-h-full", "object-contain", 3, "src"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "text-slate-200"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M4 16l4.586-4.586a2 2 0 012.828 0"], [1, "grid", "grid-cols-1", "md:grid-cols-2", "2xl:grid-cols-3", "gap-4", "sm:gap-5", "xl:gap-6", "animate-in", "fade-in", "zoom-in-95", "duration-500"], ["class", "group relative bg-white rounded-[1.25rem] sm:rounded-[1.5rem] border border-slate-100/80 p-4 sm:p-5 xl:p-6 hover:shadow-2xl hover:shadow-zadna-primary/10 hover:-translate-y-1 hover:border-zadna-primary/30 transition-all duration-300 cursor-pointer overflow-hidden", 3, "click", 4, "ngFor", "ngForOf"], [1, "group", "relative", "bg-white", "rounded-[1.25rem]", "sm:rounded-[1.5rem]", "border", "border-slate-100/80", "p-4", "sm:p-5", "xl:p-6", "hover:shadow-2xl", "hover:shadow-zadna-primary/10", "hover:-translate-y-1", "hover:border-zadna-primary/30", "transition-all", "duration-300", "cursor-pointer", "overflow-hidden", 3, "click"], [1, "absolute", "-top-10", "-right-10", "w-24", "h-24", "bg-zadna-primary/5", "rounded-full", "blur-2xl", "group-hover:bg-zadna-primary/10", "transition-colors", "duration-500"], [1, "flex", "items-start", "gap-3", "sm:gap-4", "relative", "z-10"], [1, "w-12", "h-12", "sm:w-14", "sm:h-14", "xl:w-16", "xl:h-16", "rounded-[1rem]", "sm:rounded-[1.2rem]", "bg-slate-50", "border", "border-slate-100", "p-2", "sm:p-3", "flex", "items-center", "justify-center", "shrink-0", "group-hover:scale-110", "group-hover:-rotate-3", "transition-transform", "duration-500"], ["class", "max-w-full max-h-full object-contain filter group-hover:drop-shadow-md transition-all", 3, "src", 4, "ngIf"], ["class", "w-5 h-5 sm:w-6 sm:h-6 text-slate-200", "fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 4, "ngIf"], [1, "flex-1", "min-w-0", "space-y-1.5"], [1, "flex", "items-center", "justify-between"], [1, "text-[12px]", "font-black", "text-slate-300", "uppercase"], [1, "text-[12px]", "sm:text-[13px]", "xl:text-sm", "font-black", "text-slate-900", "group-hover:text-zadna-primary", "transition-colors", "truncate"], [1, "text-[10px]", "sm:text-[11px]", "xl:text-[12px]", "font-bold", "text-slate-400", "uppercase", "tracking-widest", "truncate"], [1, "mt-3", "pt-3", "border-t", "border-slate-50", "flex", "items-center", "justify-between"], [1, "flex", "items-center", "gap-2"], [1, "flex", "items-center", "gap-1", "text-zadna-primary", "opacity-0", "group-hover:opacity-100", "transition-opacity"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3", "h-3"], [1, "max-w-full", "max-h-full", "object-contain", "filter", "group-hover:drop-shadow-md", "transition-all", 3, "src"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "sm:w-6", "sm:h-6", "text-slate-200"], ["stroke-width", "1.5", "d", "M4 16l4.586-4.586a2 2 0 012.828 0"], [1, "pt-4", "border-t", "border-slate-50"], [3, "pageChange", "currentPage", "pageSize", "totalItems"], [1, "bg-white", "rounded-[1.5rem]", "border", "border-slate-100", "p-12", "flex", "flex-col", "items-center", "justify-center", "group", "shadow-sm"], [1, "mb-4"], [1, "w-16", "h-16", "rounded-2xl", "bg-slate-50", "flex", "items-center", "justify-center", "text-slate-200", "border", "border-slate-100"], ["class", "w-8 h-8", "fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 4, "ngIf"], [1, "text-lg", "font-black", "text-slate-900", "mb-1"], [1, "text-slate-400", "text-[12px]", "font-bold", "uppercase", "tracking-widest", "mb-6"], ["variant", "primary", "size", "sm", "customClass", "rounded-xl px-8 h-10", 3, "btnClick"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-8", "h-8"], ["stroke-width", "2", "d", "M12 4v16m8-8H4"], ["stroke-width", "2", "d", "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"], [1, "flex", "items-center", "gap-3", "sm:gap-4", "p-3", "sm:p-4", "bg-white/40", "hover:bg-white/60", "border", "border-white/20", "rounded-2xl", "cursor-pointer", "transition-all", "duration-300", "group/item", 3, "click"], [1, "w-8", "h-8", "sm:w-10", "sm:h-10", "rounded-lg", "sm:rounded-xl", "bg-slate-900/10", "flex", "items-center", "justify-center", "text-slate-900", "group-hover/item:bg-slate-900", "group-hover/item:text-amber-400", "transition-colors"], ["stroke-width", "2.5", "d", "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"], [1, "flex-1", "min-w-0"], [1, "font-black", "text-slate-900", "text-xs", "sm:text-sm", "xl:text-base", "truncate"], [1, "text-[11px]", "sm:text-[12px]", "font-extrabold", "text-slate-900/50", "uppercase", "mt-0.5", "sm:mt-1"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3", "h-3", "sm:w-4", "sm:h-4", "text-slate-900/20", "rtl:rotate-180"], [1, "p-3", "bg-white/20", "border", "border-dashed", "border-white/40", "rounded-2xl", "text-center"], [1, "text-[12px]", "font-black", "text-slate-900/40", "uppercase", "tracking-widest", "italic"], [3, "close", "saved", "isOpen", "mode", "levelNameKey", "initialData"], [3, "close", "saved", "isOpen", "mode", "levelNameKey", "parentCategory"]], template: function CategoryDetailsComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0);
      \u0275\u0275template(1, CategoryDetailsComponent_app_detail_header_1_Template, 2, 4, "app-detail-header", 1);
      \u0275\u0275elementStart(2, "div", 2);
      \u0275\u0275template(3, CategoryDetailsComponent_div_3_Template, 8, 3, "div", 3)(4, CategoryDetailsComponent_div_4_Template, 119, 63, "div", 4);
      \u0275\u0275elementEnd();
      \u0275\u0275template(5, CategoryDetailsComponent_app_category_form_modal_5_Template, 1, 4, "app-category-form-modal", 5)(6, CategoryDetailsComponent_app_category_form_modal_6_Template, 1, 8, "app-category-form-modal", 6);
      \u0275\u0275elementStart(7, "app-delete-confirmation-modal", 7);
      \u0275\u0275listener("confirm", function CategoryDetailsComponent_Template_app_delete_confirmation_modal_confirm_7_listener() {
        return ctx.confirmDelete();
      })("close", function CategoryDetailsComponent_Template_app_delete_confirmation_modal_close_7_listener() {
        return ctx.closeDeleteModal();
      });
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.category);
      \u0275\u0275advance(2);
      \u0275\u0275property("ngIf", ctx.isLoading);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.category && !ctx.isLoading);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.category);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.category);
      \u0275\u0275advance();
      \u0275\u0275property("isOpen", ctx.isDeleteModalOpen)("isLoading", ctx.isDeleting);
    }
  }, dependencies: [
    CommonModule,
    NgForOf,
    NgIf,
    DatePipe,
    RouterModule,
    TranslateModule,
    TranslatePipe,
    CategoryFormModalComponent,
    DeleteConfirmationModalComponent,
    AppButtonComponent,
    AppBadgeComponent,
    AppPaginationComponent,
    DetailHeaderComponent
  ], styles: ['\n\n[_nghost-%COMP%] {\n  display: block;\n}\n.glass-card[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.75);\n  backdrop-filter: blur(20px) saturate(180%);\n  -webkit-backdrop-filter: blur(20px) saturate(180%);\n  border: 1px solid rgba(255, 255, 255, 0.5);\n  border-radius: 1rem;\n  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.04), inset 0 0 0 1px rgba(255, 255, 255, 0.6);\n  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);\n}\n.glass-card[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.85);\n  border-color: rgba(18, 124, 140, 0.15);\n  box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.08);\n  transform: translateY(-2px);\n}\n.glass-card-sm[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.55);\n  backdrop-filter: blur(12px) saturate(150%);\n  -webkit-backdrop-filter: blur(12px) saturate(150%);\n  border: 1px solid rgba(255, 255, 255, 0.4);\n  border-radius: 0.75rem;\n  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.02), inset 0 0 0 1px rgba(255, 255, 255, 0.5);\n}\n.status-pill[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.375rem;\n  padding: 0.125rem 0.625rem;\n  border-radius: 0.5rem;\n  font-size: 0.625rem;\n  font-weight: 900;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  border-width: 1px;\n  transition-property: all;\n  transition-duration: 500ms;\n}\n.status-pill.active[_ngcontent-%COMP%] {\n  background-color: rgba(16, 185, 129, 0.05);\n  color: rgb(5, 150, 105);\n  border-color: rgba(16, 185, 129, 0.1);\n  box-shadow: 0 1px 2px 0 rgba(16, 185, 129, 0.05);\n}\n.status-pill.active[_ngcontent-%COMP%]   .dot[_ngcontent-%COMP%] {\n  width: 0.375rem;\n  height: 0.375rem;\n  border-radius: 9999px;\n  background-color: rgb(16, 185, 129);\n  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4), 0 4px 6px -4px rgba(16, 185, 129, 0.4);\n  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;\n}\n.status-pill.active[_ngcontent-%COMP%]:hover {\n  background-color: rgb(16, 185, 129);\n  color: white;\n  border-color: rgb(16, 185, 129);\n}\n.status-pill.active[_ngcontent-%COMP%]:hover   .dot[_ngcontent-%COMP%] {\n  background-color: white;\n  box-shadow: none;\n}\n.status-pill.inactive[_ngcontent-%COMP%] {\n  background-color: rgba(244, 63, 94, 0.05);\n  color: rgb(225, 29, 72);\n  border-color: rgba(244, 63, 94, 0.1);\n  box-shadow: 0 1px 2px 0 rgba(244, 63, 94, 0.05);\n}\n.status-pill.inactive[_ngcontent-%COMP%]   .dot[_ngcontent-%COMP%] {\n  width: 0.375rem;\n  height: 0.375rem;\n  border-radius: 9999px;\n  background-color: rgb(244, 63, 94);\n}\n.status-pill.inactive[_ngcontent-%COMP%]:hover {\n  background-color: rgb(244, 63, 94);\n  color: white;\n  border-color: rgb(244, 63, 94);\n}\n.status-pill.inactive[_ngcontent-%COMP%]:hover   .dot[_ngcontent-%COMP%] {\n  background-color: white;\n}\n.empty-state-card[_ngcontent-%COMP%] {\n  position: relative;\n  overflow: hidden;\n  background-color: rgba(255, 255, 255, 0.4);\n  border: 1.5px dashed rgba(226, 232, 240, 0.6);\n  border-radius: 1.5rem;\n  padding: 1.25rem;\n  text-align: center;\n  transition-property: all;\n  transition-duration: 700ms;\n  backdrop-filter: blur(8px);\n}\n.empty-state-card[_ngcontent-%COMP%]::after {\n  content: "";\n  position: absolute;\n  inset: 0px;\n  background-image:\n    linear-gradient(\n      to top right,\n      rgba(18, 124, 140, 0.05),\n      transparent);\n  opacity: 0;\n  transition-property: opacity;\n  transition-duration: 700ms;\n}\n.empty-state-card[_ngcontent-%COMP%]:hover {\n  border-color: rgba(18, 124, 140, 0.3);\n  background-color: rgba(255, 255, 255, 0.8);\n  transform: translateY(-0.25rem);\n  box-shadow: 0 25px 50px -12px rgba(18, 124, 140, 0.05);\n}\n.empty-state-card[_ngcontent-%COMP%]:hover::after {\n  opacity: 1;\n}\n.metadata-item[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding-top: 0.375rem;\n  padding-bottom: 0.375rem;\n  border-bottom-width: 1px;\n  border-color: rgba(241, 245, 249, 0.4);\n  transition-property: all;\n  transition-duration: 300ms;\n}\n.metadata-item[_ngcontent-%COMP%]:last-child {\n  border-bottom-width: 0px;\n}\n.metadata-item[_ngcontent-%COMP%]:hover {\n  background-color: rgba(248, 250, 252, 0.3);\n  padding-left: 0.5rem;\n  padding-right: 0.5rem;\n  border-radius: 0.5rem;\n  border-color: transparent;\n}\n.metadata-item[_ngcontent-%COMP%]   .label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 900;\n  color: rgb(148, 163, 184);\n  text-transform: uppercase;\n  letter-spacing: 0.025em;\n}\n.metadata-item[_ngcontent-%COMP%]   .value[_ngcontent-%COMP%] {\n  font-weight: 900;\n  color: rgb(30, 41, 59);\n}\n.truncate[_ngcontent-%COMP%] {\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n@keyframes _ngcontent-%COMP%_puzzle-up {\n  from {\n    opacity: 0;\n    transform: translateY(30px) scale(0.95);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0) scale(1);\n  }\n}\n@keyframes _ngcontent-%COMP%_puzzle-left {\n  from {\n    opacity: 0;\n    transform: translateX(-25px);\n  }\n  to {\n    opacity: 1;\n    transform: translateX(0);\n  }\n}\n@keyframes _ngcontent-%COMP%_puzzle-right {\n  from {\n    opacity: 0;\n    transform: translateX(25px);\n  }\n  to {\n    opacity: 1;\n    transform: translateX(0);\n  }\n}\n.animate-puzzle-up[_ngcontent-%COMP%] {\n  opacity: 0;\n  animation: _ngcontent-%COMP%_puzzle-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;\n}\n.animate-puzzle-left[_ngcontent-%COMP%] {\n  opacity: 0;\n  animation: _ngcontent-%COMP%_puzzle-left 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;\n}\n.animate-puzzle-right[_ngcontent-%COMP%] {\n  opacity: 0;\n  animation: _ngcontent-%COMP%_puzzle-right 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;\n}\n[dir=rtl][_ngcontent-%COMP%]   .rtl\\:rotate-180[_ngcontent-%COMP%] {\n  transform: rotate(180deg);\n}\n/*# sourceMappingURL=category-details.component.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(CategoryDetailsComponent, { className: "CategoryDetailsComponent", filePath: "src\\app\\features\\catalog\\categories-manager\\category-details\\category-details.component.ts", lineNumber: 37 });
})();
export {
  CategoryDetailsComponent
};
//# sourceMappingURL=chunk-L4V73GVB.js.map
