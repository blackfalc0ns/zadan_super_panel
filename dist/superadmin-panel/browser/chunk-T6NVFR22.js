import {
  CheckboxControlValueAccessor,
  DefaultValueAccessor,
  FormsModule,
  NgControlStatus,
  NgModel,
  NgSelectOption,
  SelectControlValueAccessor,
  ɵNgSelectMultipleOption
} from "./chunk-33QDSRRV.js";
import {
  ActivatedRoute,
  Router
} from "./chunk-TIVATNVT.js";
import {
  TranslateModule,
  TranslatePipe,
  TranslateService
} from "./chunk-FETH6UU2.js";
import {
  CommonModule,
  EventEmitter,
  NgClass,
  NgForOf,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵattribute,
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
  ɵɵpureFunction1,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-IPPBI3AG.js";

// src/app/shared/components/ui/vendor-detail-header/vendor-detail-header.component.ts
function VendorDetailHeaderComponent_button_35_span_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 24);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const tab_r2 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("(", tab_r2.count, ")");
  }
}
function VendorDetailHeaderComponent_button_35_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 22);
    \u0275\u0275listener("click", function VendorDetailHeaderComponent_button_35_Template_button_click_0_listener() {
      const tab_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.onTabClick(tab_r2.id));
    });
    \u0275\u0275elementStart(1, "span", 13)(2, "span");
    \u0275\u0275text(3);
    \u0275\u0275pipe(4, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275template(5, VendorDetailHeaderComponent_button_35_span_5_Template, 2, 1, "span", 23);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const tab_r2 = ctx.$implicit;
    \u0275\u0275classMap(tab_r2.active ? "px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg" : "px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(4, 4, tab_r2.labelKey));
    \u0275\u0275advance(2);
    \u0275\u0275property("ngIf", tab_r2.count);
  }
}
var VendorDetailHeaderComponent = class _VendorDetailHeaderComponent {
  translate;
  tabChanged = new EventEmitter();
  currentLang = "ar";
  isRTL = true;
  title = "\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062A\u0627\u062C\u0631 - \u0645\u062A\u062C\u0631 \u0627\u0644\u062A\u0642\u0646\u064A\u0629 \u0627\u0644\u062D\u062F\u064A\u062B\u0629";
  vendorId = "VND-9928";
  registrationDate = "\u0645\u0633\u062C\u0644 \u0645\u0646\u0630 3 \u0641\u0628\u0631\u0627\u064A\u0631 2022";
  category = "\u0627\u0644\u0643\u0648\u064A\u062A\u060C \u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0643\u0648\u064A\u062A";
  tabs = [
    { id: "overview", labelKey: "VENDOR_DETAIL.TAB_OVERVIEW", active: true },
    { id: "data", labelKey: "VENDOR_DETAIL.TAB_BASIC_DATA", active: false },
    { id: "products", labelKey: "VENDOR_DETAIL.TAB_PRODUCTS", count: 42, active: false },
    { id: "finance", labelKey: "VENDOR_DETAIL.TAB_FINANCE", active: false },
    { id: "compliance", labelKey: "VENDOR_DETAIL.TAB_COMPLIANCE", active: false },
    { id: "logs", labelKey: "VENDOR_DETAIL.TAB_LOGS", active: false }
  ];
  constructor(translate) {
    this.translate = translate;
    this.currentLang = this.translate.currentLang || "ar";
    this.isRTL = this.currentLang === "ar";
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.isRTL = event.lang === "ar";
    });
  }
  onTabClick(tabId) {
    this.tabs.forEach((tab) => tab.active = tab.id === tabId);
    this.tabChanged.emit(tabId);
  }
  static \u0275fac = function VendorDetailHeaderComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _VendorDetailHeaderComponent)(\u0275\u0275directiveInject(TranslateService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _VendorDetailHeaderComponent, selectors: [["app-vendor-detail-header"]], outputs: { tabChanged: "tabChanged" }, standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 36, vars: 12, consts: [[1, "bg-gray-50", "p-4"], [1, "bg-white", "rounded-2xl", "shadow-sm", "border", "border-gray-100", "px-6", "py-4"], [1, "flex", "flex-col", "md:flex-row", "items-center", "justify-between", "gap-6"], [1, "flex", "items-center", "gap-4"], [1, "w-10", "h-10", "bg-teal-500", "rounded-xl", "flex", "items-center", "justify-center", "cursor-pointer", "hover:bg-teal-600", "transition-colors"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "text-white"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"], [1, "flex", "flex-col", "gap-2", "items-start"], [1, "flex", "items-center", "gap-2"], [1, "text-base", "font-semibold", "text-gray-900"], [1, "bg-green-100", "text-green-700", "px-3", "py-1", "rounded-md", "text-xs", "font-medium"], [1, "bg-blue-100", "text-blue-700", "px-3", "py-1", "rounded-md", "text-xs", "font-medium"], [1, "flex", "items-center", "gap-4", "text-xs", "text-gray-500"], [1, "flex", "items-center", "gap-1"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3.5", "h-3.5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15 11a3 3 0 11-6 0 3 3 0 016 0z"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"], ["dir", "ltr", 1, "flex", "items-center", "gap-1"], [1, "text-gray-400"], [1, "font-medium", "text-gray-700"], [3, "class", "click", 4, "ngFor", "ngForOf"], [3, "click"], ["dir", "ltr", 4, "ngIf"], ["dir", "ltr"]], template: function VendorDetailHeaderComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "div", 4);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(5, "svg", 5);
      \u0275\u0275element(6, "path", 6);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(7, "div", 7)(8, "div", 8)(9, "h1", 9);
      \u0275\u0275text(10);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(11, "span", 10);
      \u0275\u0275text(12);
      \u0275\u0275pipe(13, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "span", 11);
      \u0275\u0275text(15);
      \u0275\u0275pipe(16, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(17, "div", 12)(18, "div", 13);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(19, "svg", 14);
      \u0275\u0275element(20, "path", 15)(21, "path", 16);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(22, "span");
      \u0275\u0275text(23);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(24, "div", 13);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(25, "svg", 14);
      \u0275\u0275element(26, "path", 17);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(27, "span");
      \u0275\u0275text(28);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(29, "div", 18)(30, "span", 19);
      \u0275\u0275text(31, "#");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(32, "span", 20);
      \u0275\u0275text(33);
      \u0275\u0275elementEnd()()()()();
      \u0275\u0275elementStart(34, "div", 13);
      \u0275\u0275template(35, VendorDetailHeaderComponent_button_35_Template, 6, 6, "button", 21);
      \u0275\u0275elementEnd()()()();
    }
    if (rf & 2) {
      \u0275\u0275attribute("dir", ctx.isRTL ? "rtl" : "ltr");
      \u0275\u0275advance(10);
      \u0275\u0275textInterpolate(ctx.title);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(13, 8, "VENDOR_DETAIL.STATUS_ACTIVE"), " ");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(16, 10, "VENDOR_DETAIL.STATUS_VERIFIED"), " ");
      \u0275\u0275advance(8);
      \u0275\u0275textInterpolate(ctx.category);
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(ctx.registrationDate);
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(ctx.vendorId);
      \u0275\u0275advance(2);
      \u0275\u0275property("ngForOf", ctx.tabs);
    }
  }, dependencies: [CommonModule, NgForOf, NgIf, TranslateModule, TranslatePipe], encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(VendorDetailHeaderComponent, { className: "VendorDetailHeaderComponent", filePath: "src\\app\\shared\\components\\ui\\vendor-detail-header\\vendor-detail-header.component.ts", lineNumber: 18 });
})();

// src/app/features/vendors/vendor-compliance/vendor-compliance.component.ts
function VendorComplianceComponent_div_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 65)(1, "div", 66)(2, "div", 67);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(3, "svg", 47);
    \u0275\u0275element(4, "path", 7);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(5, "div")(6, "p", 68);
    \u0275\u0275text(7);
    \u0275\u0275pipe(8, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "p", 8);
    \u0275\u0275text(10);
    \u0275\u0275pipe(11, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(12, "span", 69);
    \u0275\u0275text(13);
    \u0275\u0275pipe(14, "translate");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const item_r1 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275property("ngClass", item_r1.iconBgClass);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(8, 5, item_r1.titleKey));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(11, 7, item_r1.descriptionKey));
    \u0275\u0275advance(2);
    \u0275\u0275property("ngClass", item_r1.statusBgClass);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(14, 9, item_r1.statusLabelKey), " ");
  }
}
function VendorComplianceComponent_div_81_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 37)(1, "div", 70);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 71)(4, "div", 72)(5, "span", 68);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "span", 8);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "p", 73);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const note_r2 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", note_r2.avatarClass);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", note_r2.authorInitials, " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate2("", note_r2.author, " (", note_r2.role, ")");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(note_r2.timestamp);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", note_r2.message, " ");
  }
}
var VendorComplianceComponent = class _VendorComplianceComponent {
  translate;
  route;
  vendorId = "VND-9928";
  currentLang = "ar";
  isRTL = true;
  verificationItems = [
    {
      id: "identity",
      titleKey: "COMPLIANCE.VERIFICATION.IDENTITY",
      descriptionKey: "COMPLIANCE.VERIFICATION.IDENTITY_DESC",
      icon: "badge",
      status: "completed",
      statusLabelKey: "COMPLIANCE.STATUS.COMPLETED",
      iconBgClass: "bg-teal-50 text-teal-500",
      statusBgClass: "bg-teal-50 text-teal-600"
    },
    {
      id: "commercial",
      titleKey: "COMPLIANCE.VERIFICATION.COMMERCIAL_REG",
      descriptionKey: "COMPLIANCE.VERIFICATION.COMMERCIAL_DESC",
      icon: "storefront",
      status: "completed",
      statusLabelKey: "COMPLIANCE.STATUS.COMPLETED",
      iconBgClass: "bg-teal-50 text-teal-500",
      statusBgClass: "bg-teal-50 text-teal-600"
    },
    {
      id: "tax",
      titleKey: "COMPLIANCE.VERIFICATION.TAX_CERT",
      descriptionKey: "COMPLIANCE.VERIFICATION.TAX_DESC",
      icon: "receipt_long",
      status: "pending",
      statusLabelKey: "COMPLIANCE.STATUS.UNDER_REVIEW",
      iconBgClass: "bg-orange-50 text-orange-500",
      statusBgClass: "bg-orange-50 text-orange-600"
    },
    {
      id: "bank",
      titleKey: "COMPLIANCE.VERIFICATION.BANK_ACCOUNT",
      descriptionKey: "COMPLIANCE.VERIFICATION.BANK_DESC",
      icon: "account_balance",
      status: "completed",
      statusLabelKey: "COMPLIANCE.STATUS.COMPLETED",
      iconBgClass: "bg-teal-50 text-teal-500",
      statusBgClass: "bg-teal-50 text-teal-600"
    },
    {
      id: "license",
      titleKey: "COMPLIANCE.VERIFICATION.MUNICIPAL_LICENSE",
      descriptionKey: "COMPLIANCE.VERIFICATION.LICENSE_DESC",
      icon: "verified",
      status: "missing",
      statusLabelKey: "COMPLIANCE.STATUS.MISSING",
      iconBgClass: "bg-slate-100 text-slate-500",
      statusBgClass: "bg-slate-100 text-slate-600"
    }
  ];
  riskIndicators = [
    {
      id: "cancellation",
      titleKey: "COMPLIANCE.RISK.HIGH_CANCELLATION",
      descriptionKey: "COMPLIANCE.RISK.HIGH_CANCELLATION_DESC",
      severity: "high",
      severityLabelKey: "COMPLIANCE.SEVERITY.HIGH",
      icon: "error",
      borderClass: "border-red-100",
      bgClass: "bg-red-50/50",
      iconClass: "text-red-500",
      badgeClass: "bg-red-100 text-red-700"
    },
    {
      id: "address",
      titleKey: "COMPLIANCE.RISK.ADDRESS_MISMATCH",
      descriptionKey: "COMPLIANCE.RISK.ADDRESS_MISMATCH_DESC",
      severity: "medium",
      severityLabelKey: "COMPLIANCE.SEVERITY.MEDIUM",
      icon: "report_problem",
      borderClass: "border-orange-100",
      bgClass: "bg-orange-50/50",
      iconClass: "text-orange-500",
      badgeClass: "bg-orange-100 text-orange-700"
    },
    {
      id: "iban",
      titleKey: "COMPLIANCE.RISK.IBAN_CHANGES",
      descriptionKey: "COMPLIANCE.RISK.IBAN_CHANGES_DESC",
      severity: "low",
      severityLabelKey: "COMPLIANCE.SEVERITY.LOW",
      icon: "info",
      borderClass: "border-slate-200",
      bgClass: "bg-slate-50",
      iconClass: "text-slate-500",
      badgeClass: "bg-slate-200 text-slate-700"
    }
  ];
  complianceNotes = [
    {
      id: "1",
      author: "\u0639\u0628\u062F\u0627\u0644\u0644\u0647 \u0645\u062D\u0645\u062F",
      authorInitials: "\u0639.\u0645",
      role: "\u0641\u0631\u064A\u0642 \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629",
      timestamp: "\u0627\u0644\u064A\u0648\u0645\u060C \u0661\u0660:\u0663\u0660 \u0635",
      message: "\u0627\u0644\u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u0636\u0631\u064A\u0628\u064A\u0629 \u0627\u0644\u0645\u0631\u0641\u0642\u0629 \u063A\u064A\u0631 \u0648\u0627\u0636\u062D\u0629 \u0627\u0644\u0645\u0639\u0627\u0644\u0645\u060C \u0623\u0631\u062C\u0648 \u0637\u0644\u0628 \u0625\u0639\u0627\u062F\u0629 \u0631\u0641\u0639\u0647\u0627 \u0628\u062C\u0648\u062F\u0629 \u0623\u0639\u0644\u0649 \u0644\u064A\u062A\u0645 \u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0636\u0631\u064A\u0628\u064A \u0645\u0639 \u0627\u0644\u0633\u062C\u0644.",
      avatarClass: "bg-primary/20 text-primary"
    },
    {
      id: "2",
      author: "\u0633\u0627\u0631\u0629 \u0641\u0647\u062F",
      authorInitials: "\u0633.\u0641",
      role: "\u0641\u0631\u064A\u0642 \u0627\u0644\u0645\u062E\u0627\u0637\u0631",
      timestamp: "\u0623\u0645\u0633\u060C \u0660\u0662:\u0661\u0665 \u0645",
      message: "\u062A\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u062A\u0627\u062C\u0631 \u0628\u062E\u0635\u0648\u0635 \u0627\u0631\u062A\u0641\u0627\u0639 \u0645\u0639\u062F\u0644 \u0627\u0644\u0625\u0644\u063A\u0627\u0621\u060C \u0648\u0623\u0641\u0627\u062F \u0628\u0648\u062C\u0648\u062F \u0645\u0634\u0643\u0644\u0629 \u062A\u0642\u0646\u064A\u0629 \u0641\u064A \u0631\u0628\u0637 \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u062A\u0645 \u062D\u0644\u0647\u0627.",
      avatarClass: "bg-slate-200 text-slate-600"
    }
  ];
  newNote = "";
  constructor(translate, route) {
    this.translate = translate;
    this.route = route;
    this.currentLang = this.translate.currentLang || "ar";
    this.isRTL = this.currentLang === "ar";
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.isRTL = event.lang === "ar";
    });
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.vendorId = params["id"];
      }
    });
  }
  onApproveVendor() {
    console.log("Approve vendor:", this.vendorId);
  }
  onRequestDocuments() {
    console.log("Request documents from vendor:", this.vendorId);
  }
  onSuspendAccount() {
    console.log("Suspend vendor account:", this.vendorId);
  }
  onRejectVendor() {
    console.log("Reject vendor:", this.vendorId);
  }
  onAddNote() {
    if (this.newNote.trim()) {
      console.log("Add note:", this.newNote);
      this.newNote = "";
    }
  }
  static \u0275fac = function VendorComplianceComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _VendorComplianceComponent)(\u0275\u0275directiveInject(TranslateService), \u0275\u0275directiveInject(ActivatedRoute));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _VendorComplianceComponent, selectors: [["app-vendor-compliance"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 166, vars: 98, consts: [[1, "flex", "flex-col", "gap-6"], [1, "grid", "grid-cols-1", "lg:grid-cols-12", "gap-6", "items-start"], [1, "lg:col-span-4", "flex", "flex-col", "gap-6"], [1, "bg-white", "rounded-xl", "border", "border-gray-200", "shadow-sm", "overflow-hidden"], [1, "px-5", "py-4", "border-b", "border-gray-100", "bg-gray-50", "flex", "items-center", "justify-between"], [1, "font-bold", "text-gray-900", "flex", "items-center", "gap-2"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "text-gray-500"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"], [1, "text-xs", "text-gray-500"], [1, "divide-y", "divide-gray-100"], ["class", "p-4 flex items-center justify-between hover:bg-gray-50 transition-colors", 4, "ngFor", "ngForOf"], [1, "lg:col-span-5", "flex", "flex-col", "gap-6"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"], [1, "p-5", "flex", "flex-col", "gap-3"], [1, "flex", "items-center", "justify-between", "gap-3", "p-4", "rounded-lg", "border", "border-slate-200", "bg-slate-50"], [1, "flex", "items-center", "gap-3", "flex-1"], [1, "w-10", "h-10", "rounded-full", "bg-slate-500", "flex", "items-center", "justify-center", "shrink-0"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-5", "h-5", "text-white"], ["fill-rule", "evenodd", "d", "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", "clip-rule", "evenodd"], [1, "flex-1"], [1, "text-base", "font-bold", "text-gray-900"], [1, "text-sm", "text-gray-600"], [1, "text-sm", "font-bold", "px-3", "py-1.5", "rounded-md", "bg-slate-200", "text-slate-700", "shrink-0"], [1, "flex", "items-center", "justify-between", "gap-3", "p-4", "rounded-lg", "border", "border-orange-100", "bg-orange-50/50"], [1, "w-10", "h-10", "rounded-full", "bg-orange-500", "flex", "items-center", "justify-center", "shrink-0"], ["fill-rule", "evenodd", "d", "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", "clip-rule", "evenodd"], [1, "text-sm", "font-bold", "px-3", "py-1.5", "rounded-md", "bg-orange-100", "text-orange-700", "shrink-0"], [1, "flex", "items-center", "justify-between", "gap-3", "p-4", "rounded-lg", "border", "border-red-100", "bg-red-50/50"], [1, "w-10", "h-10", "rounded-full", "bg-red-500", "flex", "items-center", "justify-center", "shrink-0"], ["fill-rule", "evenodd", "d", "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z", "clip-rule", "evenodd"], [1, "text-sm", "font-bold", "px-3", "py-1.5", "rounded-md", "bg-red-100", "text-red-700", "shrink-0"], [1, "bg-white", "rounded-xl", "border", "border-gray-200", "shadow-sm", "overflow-hidden", "flex-1", "flex", "flex-col"], [1, "px-5", "py-4", "border-b", "border-gray-100", "bg-gray-50"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"], [1, "p-5", "flex-1", "overflow-y-auto", "flex", "flex-col", "gap-4", "max-h-96"], ["class", "flex gap-3", 4, "ngFor", "ngForOf"], [1, "p-5", "border-t", "border-gray-100", "bg-white"], [1, "flex", "gap-3"], ["type", "text", 1, "flex-1", "border-gray-200", "rounded-xl", "text-sm", "px-4", "py-3", "focus:ring-primary", "focus:border-primary", 3, "ngModelChange", "ngModel", "placeholder", "dir"], [1, "bg-primary", "text-gray-900", "px-6", "py-3", "rounded-xl", "font-bold", "text-sm", "hover:bg-primary/90", "flex", "items-center", "gap-2", "shrink-0", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M14 5l7 7m0 0l-7 7m7-7H3"], [1, "lg:col-span-3", "flex", "flex-col", "gap-6"], [1, "bg-white", "rounded-xl", "border-2", "border-primary/20", "shadow-sm", "overflow-hidden"], [1, "px-5", "py-4", "border-b", "border-gray-100", "bg-primary/5", "flex", "items-center", "justify-between"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "text-primary"], [1, "w-full", "bg-teal-500", "hover:bg-teal-600", "text-white", "py-3", "px-4", "rounded-lg", "font-bold", "text-sm", "transition-colors", "flex", "items-center", "justify-center", "gap-2", "shadow-sm", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5"], [1, "w-full", "bg-orange-500", "hover:bg-orange-600", "text-white", "py-3", "px-4", "rounded-lg", "font-bold", "text-sm", "transition-colors", "flex", "items-center", "justify-center", "gap-2", "shadow-sm", 3, "click"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"], [1, "h-px", "bg-gray-100", "my-1"], [1, "w-full", "bg-slate-100", "hover:bg-slate-200", "text-slate-700", "py-2.5", "px-4", "rounded-lg", "font-bold", "text-sm", "transition-colors", "flex", "items-center", "justify-center", "gap-2", 3, "click"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"], [1, "w-full", "bg-white", "hover:bg-red-50", "text-red-600", "border", "border-red-200", "py-2.5", "px-4", "rounded-lg", "font-bold", "text-sm", "transition-colors", "flex", "items-center", "justify-center", "gap-2", 3, "click"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"], [1, "p-5", "flex", "flex-col", "gap-4"], [1, "text-xs", "text-gray-500", "block", "mb-1"], [1, "font-bold", "text-sm", "text-gray-900"], [1, "flex", "items-center", "gap-2"], [1, "w-6", "h-6", "rounded-full", "bg-slate-200", "text-slate-600", "flex", "items-center", "justify-center", "text-[10px]", "font-bold"], [1, "text-sm", "font-medium", "text-slate-800"], [1, "bg-orange-50", "p-3", "rounded-lg", "border", "border-orange-100"], [1, "text-xs", "font-bold", "text-orange-800", "block", "mb-1"], [1, "text-xs", "text-orange-700", "space-y-1", "list-disc", "list-inside"], [1, "p-4", "flex", "items-center", "justify-between", "hover:bg-gray-50", "transition-colors"], [1, "flex", "items-center", "gap-3"], [1, "w-10", "h-10", "rounded-lg", "flex", "items-center", "justify-center", "shrink-0", 3, "ngClass"], [1, "text-sm", "font-bold", "text-gray-900"], [1, "px-2.5", "py-1", "rounded", "text-xs", "font-bold", 3, "ngClass"], [1, "w-12", "h-12", "rounded-full", "flex", "items-center", "justify-center", "shrink-0", "text-base", "font-bold", 3, "ngClass"], [1, "flex-1", "bg-gray-50", "p-4", "rounded-xl", "border", "border-gray-100", "rounded-tr-none"], [1, "flex", "items-center", "justify-between", "mb-2"], [1, "text-sm", "text-gray-700", "leading-relaxed"]], template: function VendorComplianceComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "div", 4)(5, "h3", 5);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(6, "svg", 6);
      \u0275\u0275element(7, "path", 7);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(8, "span");
      \u0275\u0275text(9);
      \u0275\u0275pipe(10, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(11, "span", 8);
      \u0275\u0275text(12);
      \u0275\u0275pipe(13, "translate");
      \u0275\u0275pipe(14, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(15, "div", 9);
      \u0275\u0275template(16, VendorComplianceComponent_div_16_Template, 15, 11, "div", 10);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(17, "div", 11)(18, "div", 3)(19, "div", 4)(20, "h3", 5);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(21, "svg", 6);
      \u0275\u0275element(22, "path", 12);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(23, "span");
      \u0275\u0275text(24);
      \u0275\u0275pipe(25, "translate");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(26, "div", 13)(27, "div", 14)(28, "div", 15)(29, "div", 16);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(30, "svg", 17);
      \u0275\u0275element(31, "path", 18);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(32, "div", 19)(33, "h4", 20);
      \u0275\u0275text(34);
      \u0275\u0275pipe(35, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(36, "p", 21);
      \u0275\u0275text(37);
      \u0275\u0275pipe(38, "translate");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(39, "span", 22);
      \u0275\u0275text(40);
      \u0275\u0275pipe(41, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(42, "div", 23)(43, "div", 15)(44, "div", 24);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(45, "svg", 17);
      \u0275\u0275element(46, "path", 25);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(47, "div", 19)(48, "h4", 20);
      \u0275\u0275text(49);
      \u0275\u0275pipe(50, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(51, "p", 21);
      \u0275\u0275text(52);
      \u0275\u0275pipe(53, "translate");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(54, "span", 26);
      \u0275\u0275text(55);
      \u0275\u0275pipe(56, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(57, "div", 27)(58, "div", 15)(59, "div", 28);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(60, "svg", 17);
      \u0275\u0275element(61, "path", 29);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(62, "div", 19)(63, "h4", 20);
      \u0275\u0275text(64);
      \u0275\u0275pipe(65, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(66, "p", 21);
      \u0275\u0275text(67);
      \u0275\u0275pipe(68, "translate");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(69, "span", 30);
      \u0275\u0275text(70);
      \u0275\u0275pipe(71, "translate");
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(72, "div", 31)(73, "div", 32)(74, "h3", 5);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(75, "svg", 6);
      \u0275\u0275element(76, "path", 33);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(77, "span");
      \u0275\u0275text(78);
      \u0275\u0275pipe(79, "translate");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(80, "div", 34);
      \u0275\u0275template(81, VendorComplianceComponent_div_81_Template, 11, 6, "div", 35);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(82, "div", 36)(83, "div", 37)(84, "input", 38);
      \u0275\u0275pipe(85, "translate");
      \u0275\u0275twoWayListener("ngModelChange", function VendorComplianceComponent_Template_input_ngModelChange_84_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newNote, $event) || (ctx.newNote = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(86, "button", 39);
      \u0275\u0275listener("click", function VendorComplianceComponent_Template_button_click_86_listener() {
        return ctx.onAddNote();
      });
      \u0275\u0275elementStart(87, "span");
      \u0275\u0275text(88);
      \u0275\u0275pipe(89, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(90, "svg", 40);
      \u0275\u0275element(91, "path", 41);
      \u0275\u0275elementEnd()()()()()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(92, "div", 42)(93, "div", 43)(94, "div", 44)(95, "h3", 5);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(96, "svg", 45);
      \u0275\u0275element(97, "path", 7);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(98, "span");
      \u0275\u0275text(99);
      \u0275\u0275pipe(100, "translate");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(101, "div", 13)(102, "button", 46);
      \u0275\u0275listener("click", function VendorComplianceComponent_Template_button_click_102_listener() {
        return ctx.onApproveVendor();
      });
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(103, "svg", 47);
      \u0275\u0275element(104, "path", 7);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(105, "span");
      \u0275\u0275text(106);
      \u0275\u0275pipe(107, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(108, "button", 48);
      \u0275\u0275listener("click", function VendorComplianceComponent_Template_button_click_108_listener() {
        return ctx.onRequestDocuments();
      });
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(109, "svg", 47);
      \u0275\u0275element(110, "path", 49);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(111, "span");
      \u0275\u0275text(112);
      \u0275\u0275pipe(113, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275element(114, "div", 50);
      \u0275\u0275elementStart(115, "button", 51);
      \u0275\u0275listener("click", function VendorComplianceComponent_Template_button_click_115_listener() {
        return ctx.onSuspendAccount();
      });
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(116, "svg", 47);
      \u0275\u0275element(117, "path", 52);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(118, "span");
      \u0275\u0275text(119);
      \u0275\u0275pipe(120, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(121, "button", 53);
      \u0275\u0275listener("click", function VendorComplianceComponent_Template_button_click_121_listener() {
        return ctx.onRejectVendor();
      });
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(122, "svg", 47);
      \u0275\u0275element(123, "path", 54);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(124, "span");
      \u0275\u0275text(125);
      \u0275\u0275pipe(126, "translate");
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(127, "div", 3)(128, "div", 32)(129, "h3", 5);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(130, "svg", 6);
      \u0275\u0275element(131, "path", 55);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(132, "span");
      \u0275\u0275text(133);
      \u0275\u0275pipe(134, "translate");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(135, "div", 56)(136, "div")(137, "span", 57);
      \u0275\u0275text(138);
      \u0275\u0275pipe(139, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(140, "span", 58);
      \u0275\u0275text(141);
      \u0275\u0275pipe(142, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(143, "div")(144, "span", 57);
      \u0275\u0275text(145);
      \u0275\u0275pipe(146, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(147, "div", 59)(148, "span", 60);
      \u0275\u0275text(149, "\u0645.\u0623");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(150, "span", 61);
      \u0275\u0275text(151);
      \u0275\u0275pipe(152, "translate");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(153, "div", 62)(154, "span", 63);
      \u0275\u0275text(155);
      \u0275\u0275pipe(156, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(157, "ul", 64)(158, "li");
      \u0275\u0275text(159);
      \u0275\u0275pipe(160, "translate");
      \u0275\u0275pipe(161, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(162, "li");
      \u0275\u0275text(163);
      \u0275\u0275pipe(164, "translate");
      \u0275\u0275pipe(165, "translate");
      \u0275\u0275elementEnd()()()()()()()();
    }
    if (rf & 2) {
      \u0275\u0275attribute("dir", ctx.isRTL ? "rtl" : "ltr");
      \u0275\u0275advance(9);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(10, 36, "COMPLIANCE.VERIFICATION_MATRIX"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate2("\u0663 ", \u0275\u0275pipeBind1(13, 38, "COMMON.OF"), " \u0665 ", \u0275\u0275pipeBind1(14, 40, "COMPLIANCE.COMPLETED"), "");
      \u0275\u0275advance(4);
      \u0275\u0275property("ngForOf", ctx.verificationItems);
      \u0275\u0275advance(8);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(25, 42, "COMPLIANCE.RISK_INDICATORS"));
      \u0275\u0275advance(10);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(35, 44, "COMPLIANCE.RISK.IBAN_CHANGES"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(38, 46, "COMPLIANCE.RISK.IBAN_CHANGES_DESC"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(41, 48, "COMPLIANCE.SEVERITY.LOW"), " ");
      \u0275\u0275advance(9);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(50, 50, "COMPLIANCE.RISK.ADDRESS_MISMATCH"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(53, 52, "COMPLIANCE.RISK.ADDRESS_MISMATCH_DESC"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(56, 54, "COMPLIANCE.SEVERITY.MEDIUM"), " ");
      \u0275\u0275advance(9);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(65, 56, "COMPLIANCE.RISK.HIGH_CANCELLATION"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(68, 58, "COMPLIANCE.RISK.HIGH_CANCELLATION_DESC"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(71, 60, "COMPLIANCE.SEVERITY.HIGH"), " ");
      \u0275\u0275advance(8);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(79, 62, "COMPLIANCE.COMPLIANCE_NOTES"));
      \u0275\u0275advance(3);
      \u0275\u0275property("ngForOf", ctx.complianceNotes);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.newNote);
      \u0275\u0275property("placeholder", \u0275\u0275pipeBind1(85, 64, "COMPLIANCE.ADD_NOTE_PLACEHOLDER"))("dir", ctx.isRTL ? "rtl" : "ltr");
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(89, 66, "COMPLIANCE.ADD"));
      \u0275\u0275advance(11);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(100, 68, "COMPLIANCE.REVIEWER_ACTIONS"));
      \u0275\u0275advance(7);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(107, 70, "COMPLIANCE.ACTIONS.APPROVE_VENDOR"));
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(113, 72, "COMPLIANCE.ACTIONS.REQUEST_DOCUMENTS"));
      \u0275\u0275advance(7);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(120, 74, "COMPLIANCE.ACTIONS.SUSPEND_ACCOUNT"));
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(126, 76, "COMPLIANCE.ACTIONS.REJECT_VENDOR"));
      \u0275\u0275advance(8);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(134, 78, "COMPLIANCE.DECISION_SUMMARY"));
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(139, 80, "COMPLIANCE.CURRENT_REVIEW_STATUS"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(142, 82, "COMPLIANCE.AWAITING_ACTION"));
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(146, 84, "COMPLIANCE.LAST_REVIEWER"));
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(152, 86, "COMPLIANCE.INITIAL_REVIEW"));
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(156, 88, "COMPLIANCE.BLOCKING_ITEMS"), ":");
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate2("", \u0275\u0275pipeBind1(160, 90, "COMPLIANCE.VERIFICATION.TAX_CERT"), " (", \u0275\u0275pipeBind1(161, 92, "COMPLIANCE.STATUS.UNDER_REVIEW"), ")");
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate2("", \u0275\u0275pipeBind1(164, 94, "COMPLIANCE.VERIFICATION.MUNICIPAL_LICENSE"), " (", \u0275\u0275pipeBind1(165, 96, "COMPLIANCE.STATUS.MISSING"), ")");
    }
  }, dependencies: [CommonModule, NgClass, NgForOf, FormsModule, DefaultValueAccessor, NgControlStatus, NgModel, TranslateModule, TranslatePipe], encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(VendorComplianceComponent, { className: "VendorComplianceComponent", filePath: "src\\app\\features\\vendors\\vendor-compliance\\vendor-compliance.component.ts", lineNumber: 47 });
})();

// src/app/features/vendors/vendor-activity-log/vendor-activity-log.component.ts
function VendorActivityLogComponent_div_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 44)(1, "div", 45)(2, "span", 46);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 47)(5, "div", 48);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "div")(8, "p", 49);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "span", 50);
    \u0275\u0275text(11);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(12, "p", 51);
    \u0275\u0275text(13);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const note_r1 = ctx.$implicit;
    \u0275\u0275property("ngClass", note_r1.borderColor);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(note_r1.timestamp);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngClass", note_r1.avatarClass);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", note_r1.authorInitials, " ");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(note_r1.author);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", note_r1.departmentColor);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", note_r1.department, " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", note_r1.message, " ");
  }
}
function VendorActivityLogComponent_tr_53_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr", 52)(1, "td", 53)(2, "div", 47)(3, "span", 54);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 55);
    \u0275\u0275text(6);
    \u0275\u0275pipe(7, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(8, "td", 56);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "td", 57);
    \u0275\u0275text(11);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "td", 58);
    \u0275\u0275text(13);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const entry_r2 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275property("ngClass", entry_r2.iconColor);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(entry_r2.actionIcon);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(7, 7, entry_r2.actionKey));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(entry_r2.executor);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(entry_r2.timestamp);
    \u0275\u0275advance();
    \u0275\u0275attribute("title", entry_r2.description);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", entry_r2.description, " ");
  }
}
function VendorActivityLogComponent_div_113_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 67);
  }
}
function VendorActivityLogComponent_div_113_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 59);
    \u0275\u0275template(1, VendorActivityLogComponent_div_113_div_1_Template, 1, 0, "div", 60);
    \u0275\u0275elementStart(2, "div", 61)(3, "span", 62);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "div", 63)(6, "h3", 64);
    \u0275\u0275text(7);
    \u0275\u0275pipe(8, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "p", 65);
    \u0275\u0275text(10);
    \u0275\u0275pipe(11, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "span", 66);
    \u0275\u0275text(13);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const event_r3 = ctx.$implicit;
    const last_r4 = ctx.last;
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !last_r4);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", event_r3.bgColor);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(event_r3.icon);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(8, 6, event_r3.titleKey));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(11, 8, event_r3.descriptionKey));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(event_r3.date);
  }
}
var VendorActivityLogComponent = class _VendorActivityLogComponent {
  translate;
  route;
  vendorId = "VND-9928";
  currentLang = "ar";
  isRTL = true;
  // Stats
  lastInteraction = "\u0627\u0644\u064A\u0648\u0645, 10:45";
  openNotes = 2;
  weeklyActivity = 14;
  weeklyGrowth = "+12%";
  internalNotes = [
    {
      id: "1",
      author: "\u0623\u062D\u0645\u062F \u0645\u062D\u0645\u0648\u062F",
      authorInitials: "\u0623.\u0645",
      department: "\u0627\u0644\u0642\u0633\u0645 \u0627\u0644\u0645\u0627\u0644\u064A",
      departmentColor: "bg-blue-100 text-blue-700",
      timestamp: "\u0645\u0646\u0630 \u0633\u0627\u0639\u062A\u064A\u0646",
      message: "\u062A\u0645 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0648\u062B\u0627\u0626\u0642 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0628\u0646\u0643\u064A\u060C \u0643\u0644 \u0634\u064A\u0621 \u0633\u0644\u064A\u0645 \u0648\u0645\u0637\u0627\u0628\u0642 \u0644\u0644\u0634\u0631\u0648\u0637. \u0646\u0646\u062A\u0638\u0631 \u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644 \u0627\u0644\u0646\u0647\u0627\u0626\u064A.",
      avatarClass: "bg-blue-200 text-blue-700",
      borderColor: "border-l-primary"
    },
    {
      id: "2",
      author: "\u0633\u0627\u0631\u0629 \u062E\u0627\u0644\u062F",
      authorInitials: "\u0633.\u062E",
      department: "\u0642\u0633\u0645 \u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644",
      departmentColor: "bg-orange-100 text-orange-700",
      timestamp: "\u0623\u0645\u0633 \u0661\u0664:\u0663\u0660",
      message: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0645\u0646 \u0627\u0644\u062A\u0627\u062C\u0631 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u062D\u064A\u062B \u0623\u0646\u0647 \u064A\u0642\u062A\u0631\u0628 \u0645\u0646 \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621 (\u0645\u062A\u0628\u0642\u064A \u0623\u0642\u0644 \u0645\u0646 \u0634\u0647\u0631\u064A\u0646).",
      avatarClass: "bg-orange-200 text-orange-700",
      borderColor: "border-l-orange-500"
    },
    {
      id: "3",
      author: "\u0639\u0645\u0631 \u0641\u0627\u0631\u0648\u0642",
      authorInitials: "\u0639.\u0641",
      department: "\u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A",
      departmentColor: "bg-purple-100 text-purple-700",
      timestamp: "\u0662\u0665 \u0623\u0643\u062A\u0648\u0628\u0631",
      message: "\u062A\u0645 \u062D\u0644 \u0645\u0634\u0643\u0644\u0629 \u0627\u0644\u0631\u0628\u0637 \u0645\u0639 \u0648\u0627\u062C\u0647\u0629 \u0628\u0631\u0645\u062C\u0629 \u0627\u0644\u062A\u0637\u0628\u064A\u0642\u0627\u062A (API) \u0644\u0644\u062A\u0627\u062C\u0631. \u0627\u0644\u0646\u0638\u0627\u0645 \u064A\u0639\u0645\u0644 \u0628\u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0622\u0646.",
      avatarClass: "bg-purple-200 text-purple-700",
      borderColor: "border-l-slate-400"
    }
  ];
  activityLog = [
    {
      id: "1",
      actionKey: "ACTIVITY_LOG.ACTION.FINANCIAL_APPROVAL",
      actionIcon: "check_circle",
      iconColor: "text-green-500",
      executor: "\u0623\u062D\u0645\u062F \u0645\u062D\u0645\u0648\u062F (\u0625\u062F\u0627\u0631\u0629)",
      timestamp: "2023-10-28 10:45",
      description: "\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0628\u0646\u0643\u064A \u0627\u0644\u062C\u062F\u064A\u062F"
    },
    {
      id: "2",
      actionKey: "ACTIVITY_LOG.ACTION.BANK_DATA_EDIT",
      actionIcon: "edit_document",
      iconColor: "text-blue-500",
      executor: "\u0627\u0644\u062A\u0627\u062C\u0631 (\u0646\u0638\u0627\u0645)",
      timestamp: "2023-10-27 15:20",
      description: "\u062A\u062D\u062F\u064A\u062B \u0631\u0642\u0645 \u0627\u0644\u0622\u064A\u0628\u0627\u0646"
    },
    {
      id: "3",
      actionKey: "ACTIVITY_LOG.ACTION.COMPLIANCE_WARNING",
      actionIcon: "warning",
      iconColor: "text-orange-500",
      executor: "\u0633\u0627\u0631\u0629 \u062E\u0627\u0644\u062F (\u0625\u062F\u0627\u0631\u0629)",
      timestamp: "2023-10-26 14:30",
      description: "\u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0642\u0631\u0628 \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0633\u062C\u0644"
    },
    {
      id: "4",
      actionKey: "ACTIVITY_LOG.ACTION.API_UPDATE",
      actionIcon: "build",
      iconColor: "text-purple-500",
      executor: "\u0639\u0645\u0631 \u0641\u0627\u0631\u0648\u0642 (\u0625\u062F\u0627\u0631\u0629)",
      timestamp: "2023-10-25 09:15",
      description: "\u0625\u0639\u0627\u062F\u0629 \u0636\u0628\u0637 \u0645\u0641\u0627\u062A\u064A\u062D \u0627\u0644\u0631\u0628\u0637"
    },
    {
      id: "5",
      actionKey: "ACTIVITY_LOG.ACTION.LOGIN",
      actionIcon: "login",
      iconColor: "text-slate-500",
      executor: "\u0627\u0644\u062A\u0627\u062C\u0631",
      timestamp: "2023-10-25 08:00",
      description: "\u062A\u0633\u062C\u064A\u0644 \u062F\u062E\u0648\u0644 \u0646\u0627\u062C\u062D (Riyadh, SA)"
    },
    {
      id: "6",
      actionKey: "ACTIVITY_LOG.ACTION.PRODUCT_UPLOAD",
      actionIcon: "upload_file",
      iconColor: "text-slate-500",
      executor: "\u0627\u0644\u062A\u0627\u062C\u0631",
      timestamp: "2023-10-20 11:30",
      description: "\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0645\u0644\u0641 CSV (50 \u0645\u0646\u062A\u062C)"
    },
    {
      id: "7",
      actionKey: "ACTIVITY_LOG.ACTION.STORE_ACTIVATION",
      actionIcon: "storefront",
      iconColor: "text-primary",
      executor: "\u0646\u0638\u0627\u0645 \u0627\u0644\u0622\u062F\u0645\u0646",
      timestamp: "2023-05-02 10:00",
      description: "\u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u062D\u0627\u0644\u0629 \u0625\u0644\u0649 \u0646\u0634\u0637"
    }
  ];
  timeline = [
    {
      id: "1",
      titleKey: "ACTIVITY_LOG.TIMELINE.COMPLIANCE_APPROVAL",
      descriptionKey: "ACTIVITY_LOG.TIMELINE.COMPLIANCE_APPROVAL_DESC",
      date: "\u0660\u0662 \u0645\u0627\u064A\u0648 \u0662\u0660\u0662\u0663",
      icon: "verified",
      bgColor: "bg-primary"
    },
    {
      id: "2",
      titleKey: "ACTIVITY_LOG.TIMELINE.DOCUMENTS_UPLOAD",
      descriptionKey: "ACTIVITY_LOG.TIMELINE.DOCUMENTS_UPLOAD_DESC",
      date: "\u0663\u0660 \u0623\u0628\u0631\u064A\u0644 \u0662\u0660\u0662\u0663",
      icon: "folder_open",
      bgColor: "bg-blue-500"
    },
    {
      id: "3",
      titleKey: "ACTIVITY_LOG.TIMELINE.ACCOUNT_CREATION",
      descriptionKey: "ACTIVITY_LOG.TIMELINE.ACCOUNT_CREATION_DESC",
      date: "\u0662\u0668 \u0623\u0628\u0631\u064A\u0644 \u0662\u0660\u0662\u0663",
      icon: "person_add",
      bgColor: "bg-slate-300"
    }
  ];
  constructor(translate, route) {
    this.translate = translate;
    this.route = route;
    this.currentLang = this.translate.currentLang || "ar";
    this.isRTL = this.currentLang === "ar";
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.isRTL = event.lang === "ar";
    });
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.vendorId = params["id"];
      }
    });
  }
  onAddNote() {
    console.log("Add new internal note");
  }
  onFilterLog() {
    console.log("Filter activity log");
  }
  onExportLog() {
    console.log("Export activity log");
  }
  static \u0275fac = function VendorActivityLogComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _VendorActivityLogComponent)(\u0275\u0275directiveInject(TranslateService), \u0275\u0275directiveInject(ActivatedRoute));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _VendorActivityLogComponent, selectors: [["app-vendor-activity-log"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 114, vars: 54, consts: [[1, "flex", "flex-col", "gap-6"], [1, "grid", "grid-cols-1", "lg:grid-cols-12", "gap-6", "items-start"], [1, "lg:col-span-3", "flex", "flex-col", "gap-4"], [1, "flex", "items-center", "justify-between", "mb-2"], [1, "bg-primary/10", "text-primary", "text-xs", "font-bold", "px-2", "py-1", "rounded-full"], [1, "text-lg", "font-bold", "text-gray-900", "flex", "items-center", "gap-2"], [1, "material-symbols-outlined", "text-primary"], [1, "w-full", "flex", "items-center", "justify-center", "gap-2", "rounded-lg", "h-10", "px-4", "bg-primary", "text-white", "text-sm", "font-bold", "shadow-sm", "hover:bg-primary/90", "transition-colors", 3, "click"], [1, "material-symbols-outlined", "text-[20px]"], [1, "space-y-4", "overflow-y-auto", "max-h-[600px]", "pe-1"], ["class", "bg-white/65 backdrop-blur-sm p-4 rounded-xl relative border shadow-sm border-r-4", 3, "ngClass", 4, "ngFor", "ngForOf"], [1, "lg:col-span-6", "flex", "flex-col", "gap-4"], [1, "flex", "gap-2"], [1, "p-1.5", "rounded", "bg-white", "border", "border-gray-200", "text-gray-600", "hover:text-primary", "transition-colors", 3, "click"], [1, "material-symbols-outlined", "text-sm"], [1, "bg-white/65", "backdrop-blur-sm", "rounded-xl", "overflow-hidden", "border", "border-gray-200", "flex-1", "shadow-sm"], [1, "overflow-x-auto"], [1, "w-full", "text-sm"], [1, "bg-gray-50/80", "border-b", "border-gray-200", "text-gray-600"], [1, "px-4", "py-3", "font-semibold", "w-1/4"], [1, "divide-y", "divide-gray-100"], ["class", "hover:bg-white/50 transition-colors", 4, "ngFor", "ngForOf"], [1, "border-t", "border-gray-200", "p-3", "flex", "justify-between", "items-center", "bg-gray-50/50"], [1, "flex", "gap-1"], [1, "px-2", "py-1", "text-xs", "border", "border-gray-200", "rounded", "text-gray-400", "cursor-not-allowed"], [1, "px-2", "py-1", "text-xs", "border", "border-primary", "bg-primary/10", "rounded", "text-primary", "font-medium"], [1, "px-2", "py-1", "text-xs", "border", "border-gray-200", "rounded", "text-gray-600", "hover:bg-gray-100"], [1, "text-xs", "text-gray-500"], [1, "lg:col-span-3", "flex", "flex-col", "gap-6"], [1, "text-lg", "font-bold", "text-gray-900", "mb-2", "flex", "items-center", "gap-2"], [1, "bg-white/65", "backdrop-blur-sm", "p-4", "rounded-xl", "grid", "grid-cols-2", "gap-4", "border", "border-gray-200", "shadow-sm"], [1, "flex", "flex-col", "items-end"], [1, "text-gray-500", "text-xs", "mb-1"], ["dir", "ltr", 1, "text-gray-900", "font-bold", "text-sm"], [1, "text-orange-500", "font-bold", "text-xl"], [1, "flex", "flex-col", "col-span-2", "pt-2", "border-t", "border-gray-200/60", "items-end"], [1, "flex", "items-end", "gap-2"], [1, "text-primary", "font-bold", "text-2xl"], [1, "text-green-500", "text-xs", "font-bold", "flex", "items-center", "mb-1"], [1, "material-symbols-outlined", "text-[12px]"], [1, "flex-1", "flex", "flex-col"], [1, "bg-white/65", "backdrop-blur-sm", "p-5", "rounded-xl", "flex-1", "relative", "border", "border-gray-200", "shadow-sm"], [1, "relative", "ps-2"], ["class", "relative pb-6 timeline-item ps-6", 4, "ngFor", "ngForOf"], [1, "bg-white/65", "backdrop-blur-sm", "p-4", "rounded-xl", "relative", "border", "shadow-sm", "border-r-4", 3, "ngClass"], [1, "flex", "justify-between", "items-start", "mb-2"], [1, "text-gray-500", "text-xs"], [1, "flex", "items-center", "gap-2"], [1, "w-8", "h-8", "rounded-full", "flex", "items-center", "justify-center", "text-xs", "font-bold", 3, "ngClass"], [1, "text-gray-900", "text-sm", "font-bold"], [1, "text-[10px]", "font-semibold", "px-1.5", "py-0.5", "rounded", 3, "ngClass"], [1, "text-gray-700", "text-sm", "leading-relaxed", "mt-2"], [1, "hover:bg-white/50", "transition-colors"], [1, "px-4", "py-3"], [1, "material-symbols-outlined", "text-[16px]", 3, "ngClass"], [1, "font-medium", "text-gray-900"], [1, "px-4", "py-3", "text-gray-600"], ["dir", "ltr", 1, "px-4", "py-3", "text-gray-500", "text-xs"], [1, "px-4", "py-3", "text-gray-600", "truncate", "max-w-[150px]"], [1, "relative", "pb-6", "timeline-item", "ps-6"], ["class", "absolute top-0 w-0.5 bg-gray-200 z-0 inset-inline-start-4 h-full", "style", "top: 32px; bottom: -24px;", 4, "ngIf"], [1, "absolute", "top-0", "w-8", "h-8", "rounded-full", "flex", "items-center", "justify-center", "border-4", "border-white", "shadow-sm", "z-10", "inset-inline-start-0", 3, "ngClass"], [1, "material-symbols-outlined", "text-white", "text-[16px]"], [1, "pt-1", "pe-10"], [1, "text-sm", "font-bold", "text-gray-900"], [1, "text-xs", "text-gray-500", "mt-1"], [1, "text-[10px]", "text-gray-400", "mt-1", "block"], [1, "absolute", "top-0", "w-0.5", "bg-gray-200", "z-0", "inset-inline-start-4", "h-full", 2, "top", "32px", "bottom", "-24px"]], template: function VendorActivityLogComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "span", 4);
      \u0275\u0275text(5);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(6, "h2", 5)(7, "span", 6);
      \u0275\u0275text(8, "speaker_notes");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "span");
      \u0275\u0275text(10);
      \u0275\u0275pipe(11, "translate");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(12, "button", 7);
      \u0275\u0275listener("click", function VendorActivityLogComponent_Template_button_click_12_listener() {
        return ctx.onAddNote();
      });
      \u0275\u0275elementStart(13, "span", 8);
      \u0275\u0275text(14, "add");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(15, "span");
      \u0275\u0275text(16);
      \u0275\u0275pipe(17, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(18, "div", 9);
      \u0275\u0275template(19, VendorActivityLogComponent_div_19_Template, 14, 8, "div", 10);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(20, "div", 11)(21, "div", 3)(22, "div", 12)(23, "button", 13);
      \u0275\u0275listener("click", function VendorActivityLogComponent_Template_button_click_23_listener() {
        return ctx.onFilterLog();
      });
      \u0275\u0275elementStart(24, "span", 14);
      \u0275\u0275text(25, "filter_list");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(26, "button", 13);
      \u0275\u0275listener("click", function VendorActivityLogComponent_Template_button_click_26_listener() {
        return ctx.onExportLog();
      });
      \u0275\u0275elementStart(27, "span", 14);
      \u0275\u0275text(28, "download");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(29, "h2", 5)(30, "span", 6);
      \u0275\u0275text(31, "history");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(32, "span");
      \u0275\u0275text(33);
      \u0275\u0275pipe(34, "translate");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(35, "div", 15)(36, "div", 16)(37, "table", 17)(38, "thead", 18)(39, "tr")(40, "th", 19);
      \u0275\u0275text(41);
      \u0275\u0275pipe(42, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(43, "th", 19);
      \u0275\u0275text(44);
      \u0275\u0275pipe(45, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(46, "th", 19);
      \u0275\u0275text(47);
      \u0275\u0275pipe(48, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(49, "th", 19);
      \u0275\u0275text(50);
      \u0275\u0275pipe(51, "translate");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(52, "tbody", 20);
      \u0275\u0275template(53, VendorActivityLogComponent_tr_53_Template, 14, 9, "tr", 21);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(54, "div", 22)(55, "div", 23)(56, "button", 24);
      \u0275\u0275text(57);
      \u0275\u0275pipe(58, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(59, "button", 25);
      \u0275\u0275text(60, "1");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(61, "button", 26);
      \u0275\u0275text(62, "2");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(63, "button", 26);
      \u0275\u0275text(64, "3");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(65, "button", 26);
      \u0275\u0275text(66);
      \u0275\u0275pipe(67, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(68, "span", 27);
      \u0275\u0275text(69);
      \u0275\u0275pipe(70, "translate");
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(71, "div", 28)(72, "div")(73, "h2", 29)(74, "span", 6);
      \u0275\u0275text(75, "insights");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(76, "span");
      \u0275\u0275text(77);
      \u0275\u0275pipe(78, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(79, "div", 30)(80, "div", 31)(81, "span", 32);
      \u0275\u0275text(82);
      \u0275\u0275pipe(83, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(84, "span", 33);
      \u0275\u0275text(85);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(86, "div", 31)(87, "span", 32);
      \u0275\u0275text(88);
      \u0275\u0275pipe(89, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(90, "span", 34);
      \u0275\u0275text(91);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(92, "div", 35)(93, "span", 32);
      \u0275\u0275text(94);
      \u0275\u0275pipe(95, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(96, "div", 36)(97, "span", 37);
      \u0275\u0275text(98);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(99, "span", 38)(100, "span", 39);
      \u0275\u0275text(101, "trending_up");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(102, "span");
      \u0275\u0275text(103);
      \u0275\u0275elementEnd()()()()()();
      \u0275\u0275elementStart(104, "div", 40)(105, "h2", 29)(106, "span", 6);
      \u0275\u0275text(107, "timeline");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(108, "span");
      \u0275\u0275text(109);
      \u0275\u0275pipe(110, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(111, "div", 41)(112, "div", 42);
      \u0275\u0275template(113, VendorActivityLogComponent_div_113_Template, 14, 10, "div", 43);
      \u0275\u0275elementEnd()()()()()();
    }
    if (rf & 2) {
      \u0275\u0275attribute("dir", ctx.isRTL ? "rtl" : "ltr");
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(ctx.openNotes);
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(11, 24, "ACTIVITY_LOG.INTERNAL_NOTES"));
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(17, 26, "ACTIVITY_LOG.ADD_NEW_NOTE"));
      \u0275\u0275advance(3);
      \u0275\u0275property("ngForOf", ctx.internalNotes);
      \u0275\u0275advance(14);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(34, 28, "ACTIVITY_LOG.ACTIVITY_LOG"));
      \u0275\u0275advance(8);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(42, 30, "ACTIVITY_LOG.COL_ACTION"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(45, 32, "ACTIVITY_LOG.COL_EXECUTOR"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(48, 34, "ACTIVITY_LOG.COL_DATETIME"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(51, 36, "ACTIVITY_LOG.COL_DESCRIPTION"));
      \u0275\u0275advance(3);
      \u0275\u0275property("ngForOf", ctx.activityLog);
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(58, 38, "ACTIVITY_LOG.PREVIOUS"), " ");
      \u0275\u0275advance(9);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(67, 40, "ACTIVITY_LOG.NEXT"), " ");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(70, 42, "ACTIVITY_LOG.SHOWING_ENTRIES"));
      \u0275\u0275advance(8);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(78, 44, "ACTIVITY_LOG.COLLABORATION_SUMMARY"));
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(83, 46, "ACTIVITY_LOG.LAST_INTERACTION"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.lastInteraction);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(89, 48, "ACTIVITY_LOG.OPEN_NOTES"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.openNotes);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(95, 50, "ACTIVITY_LOG.WEEKLY_ACTIVITY"));
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(ctx.weeklyActivity);
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(ctx.weeklyGrowth);
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(110, 52, "ACTIVITY_LOG.TIMELINE"));
      \u0275\u0275advance(4);
      \u0275\u0275property("ngForOf", ctx.timeline);
    }
  }, dependencies: [CommonModule, NgClass, NgForOf, NgIf, FormsModule, TranslateModule, TranslatePipe], encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(VendorActivityLogComponent, { className: "VendorActivityLogComponent", filePath: "src\\app\\features\\vendors\\vendor-activity-log\\vendor-activity-log.component.ts", lineNumber: 44 });
})();

// src/app/features/vendors/vendor-overview/vendor-overview.component.ts
function VendorOverviewComponent_div_2_span_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 47);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const kpi_r1 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(kpi_r1.unit);
  }
}
function VendorOverviewComponent_div_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 37)(1, "div", 38)(2, "div", 39)(3, "span", 40);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 41);
    \u0275\u0275text(6);
    \u0275\u0275pipe(7, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "p", 42)(9, "span");
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "span", 43);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "span", 44);
    \u0275\u0275text(14);
    \u0275\u0275pipe(15, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(16, "p", 45);
    \u0275\u0275template(17, VendorOverviewComponent_div_2_span_17_Template, 2, 1, "span", 46);
    \u0275\u0275text(18);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const kpi_r1 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275property("ngClass", kpi_r1.iconBgClass);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(kpi_r1.icon);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(7, 9, kpi_r1.titleKey));
    \u0275\u0275advance(2);
    \u0275\u0275property("ngClass", kpi_r1.trendClass);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(kpi_r1.trend);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(kpi_r1.trendIcon);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(15, 11, kpi_r1.trendKey));
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", kpi_r1.unit);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", kpi_r1.value, " ");
  }
}
function VendorOverviewComponent_div_49_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 48)(1, "div")(2, "p", 49);
    \u0275\u0275text(3);
    \u0275\u0275pipe(4, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p", 50);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "span", 51);
    \u0275\u0275text(8);
    \u0275\u0275pipe(9, "translate");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const doc_r2 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(4, 4, doc_r2.titleKey));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(doc_r2.number);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", doc_r2.statusClass);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(9, 6, doc_r2.statusKey), " ");
  }
}
function VendorOverviewComponent_tr_80_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr", 52)(1, "td", 53);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "td", 54);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "td", 55);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "td", 56)(8, "span", 57);
    \u0275\u0275text(9);
    \u0275\u0275pipe(10, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "td", 58)(12, "button", 59);
    \u0275\u0275listener("click", function VendorOverviewComponent_tr_80_Template_button_click_12_listener() {
      const order_r4 = \u0275\u0275restoreView(_r3).$implicit;
      const ctx_r4 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r4.onViewOrderDetails(order_r4.id));
    });
    \u0275\u0275elementStart(13, "span", 19);
    \u0275\u0275text(14, "chevron_left");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const order_r4 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(order_r4.orderNumber);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(order_r4.customer);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(order_r4.amount);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngClass", order_r4.statusClass);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(10, 5, order_r4.statusKey), " ");
  }
}
function VendorOverviewComponent_div_94_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 60)(1, "span", 61);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 62)(4, "p", 63);
    \u0275\u0275text(5);
    \u0275\u0275pipe(6, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "p", 64);
    \u0275\u0275text(8);
    \u0275\u0275pipe(9, "translate");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const alert_r6 = ctx.$implicit;
    \u0275\u0275property("ngClass", alert_r6.borderClass);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", alert_r6.iconClass);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", alert_r6.icon, " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngClass", alert_r6.titleClass);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(6, 7, alert_r6.titleKey), " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngClass", alert_r6.descClass);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(9, 9, alert_r6.descriptionKey), " ");
  }
}
var VendorOverviewComponent = class _VendorOverviewComponent {
  translate;
  route;
  router;
  tabChange = new EventEmitter();
  vendorId = "VND-9928";
  vendorName = "\u0645\u062A\u062C\u0631 \u0627\u0644\u062A\u0642\u0646\u064A\u0629 \u0627\u0644\u062D\u062F\u064A\u062B\u0629";
  vendorLocation = "\u0627\u0644\u0631\u064A\u0627\u0636\u060C \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629";
  currentLang = "ar";
  isRTL = true;
  kpis = [
    {
      id: "sales",
      titleKey: "VENDOR_OVERVIEW.KPI.TOTAL_SALES",
      value: "45,000",
      unit: "SAR",
      icon: "payments",
      iconBgClass: "bg-primary/10 text-primary",
      trend: "+12%",
      trendKey: "VENDOR_OVERVIEW.KPI.FROM_LAST_MONTH",
      trendIcon: "trending_up",
      trendClass: "text-green-600"
    },
    {
      id: "orders",
      titleKey: "VENDOR_OVERVIEW.KPI.TOTAL_ORDERS",
      value: "1,250",
      icon: "shopping_cart",
      iconBgClass: "bg-blue-50 text-blue-600",
      trend: "+5%",
      trendKey: "VENDOR_OVERVIEW.KPI.FROM_LAST_MONTH",
      trendIcon: "trending_up",
      trendClass: "text-green-600"
    },
    {
      id: "returns",
      titleKey: "VENDOR_OVERVIEW.KPI.RETURN_RATE",
      value: "2.4%",
      icon: "assignment_return",
      iconBgClass: "bg-orange-50 text-orange-600",
      trend: "-0.5%",
      trendKey: "VENDOR_OVERVIEW.KPI.IMPROVEMENT",
      trendIcon: "trending_down",
      trendClass: "text-red-500"
    },
    {
      id: "products",
      titleKey: "VENDOR_OVERVIEW.KPI.ACTIVE_PRODUCTS",
      value: "340",
      icon: "inventory_2",
      iconBgClass: "bg-purple-50 text-purple-600",
      trend: "+10",
      trendKey: "VENDOR_OVERVIEW.KPI.NEW_PRODUCTS",
      trendIcon: "trending_up",
      trendClass: "text-green-600"
    }
  ];
  storeInfo = {
    category: "\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A \u0648\u062A\u0642\u0646\u064A\u0629",
    registrationDate: "15 May 2023",
    phone: "+966 50 123 4567",
    email: "contact@moderntech.sa"
  };
  documents = [
    {
      id: "cr",
      titleKey: "VENDOR_OVERVIEW.DOCS.COMMERCIAL_REG",
      number: "CR-1010123456",
      statusKey: "VENDOR_OVERVIEW.STATUS.VERIFIED",
      statusClass: "bg-green-50 text-green-700"
    },
    {
      id: "tax",
      titleKey: "VENDOR_OVERVIEW.DOCS.TAX_CERT",
      number: "VAT-3001234567",
      statusKey: "VENDOR_OVERVIEW.STATUS.VERIFIED",
      statusClass: "bg-green-50 text-green-700"
    },
    {
      id: "id",
      titleKey: "VENDOR_OVERVIEW.DOCS.OWNER_ID",
      number: "ID-10*******34",
      statusKey: "VENDOR_OVERVIEW.STATUS.UNDER_REVIEW",
      statusClass: "bg-yellow-50 text-yellow-700"
    }
  ];
  recentOrders = [
    {
      id: "1",
      orderNumber: "#ORD-8821",
      customer: "\u0623\u062D\u0645\u062F \u0639\u0628\u062F\u0627\u0644\u0644\u0647",
      amount: "1,250 SAR",
      statusKey: "VENDOR_OVERVIEW.ORDER_STATUS.PROCESSING",
      statusClass: "bg-blue-50 text-blue-700"
    },
    {
      id: "2",
      orderNumber: "#ORD-8820",
      customer: "\u0633\u0627\u0631\u0629 \u0645\u062D\u0645\u062F",
      amount: "450 SAR",
      statusKey: "VENDOR_OVERVIEW.ORDER_STATUS.COMPLETED",
      statusClass: "bg-green-50 text-green-700"
    },
    {
      id: "3",
      orderNumber: "#ORD-8819",
      customer: "\u062E\u0627\u0644\u062F \u0627\u0644\u062F\u0648\u0633\u0631\u064A",
      amount: "3,800 SAR",
      statusKey: "VENDOR_OVERVIEW.ORDER_STATUS.PENDING_PAYMENT",
      statusClass: "bg-orange-50 text-orange-700"
    },
    {
      id: "4",
      orderNumber: "#ORD-8818",
      customer: "\u0641\u0647\u062F \u0627\u0644\u0639\u0646\u0632\u064A",
      amount: "120 SAR",
      statusKey: "VENDOR_OVERVIEW.ORDER_STATUS.CANCELLED",
      statusClass: "bg-gray-100 text-gray-700"
    },
    {
      id: "5",
      orderNumber: "#ORD-8817",
      customer: "\u0646\u0648\u0631\u0629 \u0627\u0644\u0633\u0627\u0644\u0645",
      amount: "890 SAR",
      statusKey: "VENDOR_OVERVIEW.ORDER_STATUS.COMPLETED",
      statusClass: "bg-green-50 text-green-700"
    }
  ];
  alerts = [
    {
      id: "1",
      titleKey: "VENDOR_OVERVIEW.ALERTS.BANK_NOT_VERIFIED",
      descriptionKey: "VENDOR_OVERVIEW.ALERTS.BANK_NOT_VERIFIED_DESC",
      icon: "error",
      bgClass: "bg-red-50",
      borderClass: "border-red-100",
      iconClass: "text-red-500",
      titleClass: "text-red-800",
      descClass: "text-red-600"
    },
    {
      id: "2",
      titleKey: "VENDOR_OVERVIEW.ALERTS.OWNER_ID_UPDATE",
      descriptionKey: "VENDOR_OVERVIEW.ALERTS.OWNER_ID_UPDATE_DESC",
      icon: "info",
      bgClass: "bg-yellow-50",
      borderClass: "border-yellow-100",
      iconClass: "text-yellow-600",
      titleClass: "text-yellow-800",
      descClass: "text-yellow-700"
    }
  ];
  constructor(translate, route, router) {
    this.translate = translate;
    this.route = route;
    this.router = router;
    this.currentLang = this.translate.currentLang || "ar";
    this.isRTL = this.currentLang === "ar";
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.isRTL = event.lang === "ar";
    });
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.vendorId = params["id"];
      }
    });
  }
  onApproveVendor() {
    console.log("Approve vendor:", this.vendorId);
  }
  onRequestDocuments() {
    console.log("Request additional documents");
  }
  onSuspendVendor() {
    console.log("Suspend vendor temporarily");
  }
  onViewAllOrders() {
    this.tabChange.emit("orders");
  }
  onViewAllDocuments() {
    console.log("View all documents");
  }
  onFilterOrders() {
    console.log("Filter orders");
  }
  onViewOrderDetails(orderId) {
    this.tabChange.emit("orders");
  }
  onNavigateToDetails() {
    this.router.navigate(["/vendors", this.vendorId]);
  }
  static \u0275fac = function VendorOverviewComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _VendorOverviewComponent)(\u0275\u0275directiveInject(TranslateService), \u0275\u0275directiveInject(ActivatedRoute), \u0275\u0275directiveInject(Router));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _VendorOverviewComponent, selectors: [["app-vendor-overview"]], outputs: { tabChange: "tabChange" }, standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 121, vars: 63, consts: [[1, "flex", "flex-col", "gap-6"], [1, "grid", "grid-cols-1", "md:grid-cols-2", "lg:grid-cols-4", "gap-4"], ["class", "bg-white rounded-xl p-5 border border-gray-200 shadow-sm", 4, "ngFor", "ngForOf"], [1, "grid", "grid-cols-1", "lg:grid-cols-12", "gap-6"], [1, "lg:col-span-3", "flex", "flex-col", "gap-6"], [1, "bg-white", "rounded-xl", "border", "border-gray-200", "shadow-sm", "p-5"], [1, "text-gray-900", "font-bold", "mb-4", "flex", "items-center", "gap-2"], [1, "material-symbols-outlined", "text-primary"], [1, "flex", "flex-col", "gap-3"], [1, "text-gray-500", "text-xs", "mb-1"], [1, "text-gray-900", "text-sm", "font-medium"], [1, "flex", "justify-between", "items-center", "mb-4"], [1, "text-gray-900", "font-bold", "flex", "items-center", "gap-2"], [1, "text-primary", "text-xs", "font-medium", "hover:underline", 3, "click"], ["class", "flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100", 4, "ngFor", "ngForOf"], [1, "lg:col-span-6", "flex", "flex-col", "gap-6"], [1, "bg-white", "rounded-xl", "border", "border-gray-200", "shadow-sm", "overflow-hidden", "flex", "flex-col"], [1, "p-5", "border-b", "border-gray-200", "flex", "justify-between", "items-center"], [1, "text-gray-500", "hover:text-primary", "transition-colors", 3, "click"], [1, "material-symbols-outlined", "text-sm"], [1, "overflow-x-auto"], [1, "w-full", "border-collapse"], [1, "bg-gray-50", "border-b", "border-gray-200"], [1, "px-5", "py-3", "text-gray-500", "text-xs", "font-semibold", "text-start"], [1, "px-5", "py-3", "text-gray-500", "text-xs", "font-semibold", "text-center"], [1, "px-5", "py-3", "text-gray-500", "text-xs", "font-semibold", "text-end", "w-10"], [1, "text-sm"], ["class", "border-b border-gray-100 hover:bg-gray-50 transition-colors", 4, "ngFor", "ngForOf"], [1, "px-5", "py-3", "border-t", "border-gray-200", "text-center"], [1, "text-xs", "font-semibold", "text-primary", "hover:underline", 3, "click"], [1, "bg-red-50", "rounded-xl", "border", "border-red-200", "p-5"], [1, "text-red-700", "font-bold", "mb-3", "flex", "items-center", "gap-2", "text-sm"], [1, "material-symbols-outlined"], ["class", "bg-white/60 p-3 rounded border flex gap-3 items-start", 3, "ngClass", 4, "ngFor", "ngForOf"], [1, "w-full", "flex", "items-center", "justify-center", "gap-2", "bg-primary", "hover:bg-primary/90", "text-gray-900", "font-bold", "py-2.5", "px-4", "rounded-lg", "transition-colors", "text-sm", 3, "click"], [1, "material-symbols-outlined", "text-[18px]"], [1, "w-full", "flex", "items-center", "justify-center", "gap-2", "bg-gray-100", "hover:bg-gray-200", "text-gray-800", "font-medium", "py-2.5", "px-4", "rounded-lg", "border", "border-gray-200", "transition-colors", "text-sm", 3, "click"], [1, "bg-white", "rounded-xl", "p-5", "border", "border-gray-200", "shadow-sm"], [1, "flex", "justify-between", "items-start", "mb-3"], [1, "flex", "items-center", "gap-2"], [1, "material-symbols-outlined", "text-2xl", 3, "ngClass"], [1, "text-gray-500", "text-xs", "font-semibold"], [1, "text-xs", "font-medium", "flex", "items-center", "gap-1", 3, "ngClass"], [1, "material-symbols-outlined", "text-[14px]"], [1, "text-gray-400", "font-normal"], [1, "text-2xl", "font-bold", "text-gray-900", "mb-2"], ["class", "text-sm font-normal text-gray-500 ms-1", 4, "ngIf"], [1, "text-sm", "font-normal", "text-gray-500", "ms-1"], [1, "flex", "justify-between", "items-center", "p-3", "rounded-lg", "bg-gray-50", "border", "border-gray-100"], [1, "text-gray-900", "text-xs", "font-semibold"], [1, "text-gray-500", "text-[10px]"], [1, "inline-flex", "items-center", "px-2", "py-0.5", "rounded", "text-[11px]", "font-medium", "border", 3, "ngClass"], [1, "border-b", "border-gray-100", "hover:bg-gray-50", "transition-colors"], [1, "px-5", "py-3", "text-primary", "font-medium", "text-start"], [1, "px-5", "py-3", "text-gray-900", "text-start"], [1, "px-5", "py-3", "text-gray-900", "font-medium", "text-start"], [1, "px-5", "py-3", "text-center"], [1, "inline-flex", "items-center", "px-2.5", "py-1", "rounded", "text-[11px]", "font-medium", "border", 3, "ngClass"], [1, "px-5", "py-3", "text-end"], [1, "text-gray-600", "hover:text-primary", 3, "click"], [1, "bg-white/60", "p-3", "rounded", "border", "flex", "gap-3", "items-start", 3, "ngClass"], [1, "material-symbols-outlined", "text-[18px]", "mt-0.5", 3, "ngClass"], [1, "flex-1"], [1, "text-xs", "font-bold", 3, "ngClass"], [1, "text-[11px]", "mt-1", 3, "ngClass"]], template: function VendorOverviewComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1);
      \u0275\u0275template(2, VendorOverviewComponent_div_2_Template, 19, 13, "div", 2);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(3, "div", 3)(4, "div", 4)(5, "div", 5)(6, "h3", 6)(7, "span", 7);
      \u0275\u0275text(8, "store");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "span");
      \u0275\u0275text(10);
      \u0275\u0275pipe(11, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(12, "div", 8)(13, "div")(14, "p", 9);
      \u0275\u0275text(15);
      \u0275\u0275pipe(16, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(17, "p", 10);
      \u0275\u0275text(18);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(19, "div")(20, "p", 9);
      \u0275\u0275text(21);
      \u0275\u0275pipe(22, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(23, "p", 10);
      \u0275\u0275text(24);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(25, "div")(26, "p", 9);
      \u0275\u0275text(27);
      \u0275\u0275pipe(28, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(29, "p", 10);
      \u0275\u0275text(30);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(31, "div")(32, "p", 9);
      \u0275\u0275text(33);
      \u0275\u0275pipe(34, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(35, "p", 10);
      \u0275\u0275text(36);
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(37, "div", 5)(38, "div", 11)(39, "h3", 12)(40, "span", 7);
      \u0275\u0275text(41, "description");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(42, "span");
      \u0275\u0275text(43);
      \u0275\u0275pipe(44, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(45, "button", 13);
      \u0275\u0275listener("click", function VendorOverviewComponent_Template_button_click_45_listener() {
        return ctx.onViewAllDocuments();
      });
      \u0275\u0275text(46);
      \u0275\u0275pipe(47, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(48, "div", 8);
      \u0275\u0275template(49, VendorOverviewComponent_div_49_Template, 10, 8, "div", 14);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(50, "div", 15)(51, "div", 16)(52, "div", 17)(53, "h3", 12)(54, "span", 7);
      \u0275\u0275text(55, "receipt_long");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(56, "span");
      \u0275\u0275text(57);
      \u0275\u0275pipe(58, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(59, "button", 18);
      \u0275\u0275listener("click", function VendorOverviewComponent_Template_button_click_59_listener() {
        return ctx.onFilterOrders();
      });
      \u0275\u0275elementStart(60, "span", 19);
      \u0275\u0275text(61, "filter_list");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(62, "div", 20)(63, "table", 21)(64, "thead")(65, "tr", 22)(66, "th", 23);
      \u0275\u0275text(67);
      \u0275\u0275pipe(68, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(69, "th", 23);
      \u0275\u0275text(70);
      \u0275\u0275pipe(71, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(72, "th", 23);
      \u0275\u0275text(73);
      \u0275\u0275pipe(74, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(75, "th", 24);
      \u0275\u0275text(76);
      \u0275\u0275pipe(77, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275element(78, "th", 25);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(79, "tbody", 26);
      \u0275\u0275template(80, VendorOverviewComponent_tr_80_Template, 15, 7, "tr", 27);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(81, "div", 28)(82, "button", 29);
      \u0275\u0275listener("click", function VendorOverviewComponent_Template_button_click_82_listener() {
        return ctx.onViewAllOrders();
      });
      \u0275\u0275text(83);
      \u0275\u0275pipe(84, "translate");
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(85, "div", 4)(86, "div", 30)(87, "h3", 31)(88, "span", 32);
      \u0275\u0275text(89, "warning");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(90, "span");
      \u0275\u0275text(91);
      \u0275\u0275pipe(92, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(93, "div", 8);
      \u0275\u0275template(94, VendorOverviewComponent_div_94_Template, 10, 11, "div", 33);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(95, "div", 5)(96, "h3", 6)(97, "span", 7);
      \u0275\u0275text(98, "admin_panel_settings");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(99, "span");
      \u0275\u0275text(100);
      \u0275\u0275pipe(101, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(102, "div", 8)(103, "button", 34);
      \u0275\u0275listener("click", function VendorOverviewComponent_Template_button_click_103_listener() {
        return ctx.onApproveVendor();
      });
      \u0275\u0275elementStart(104, "span", 35);
      \u0275\u0275text(105, "check_circle");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(106, "span");
      \u0275\u0275text(107);
      \u0275\u0275pipe(108, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(109, "button", 36);
      \u0275\u0275listener("click", function VendorOverviewComponent_Template_button_click_109_listener() {
        return ctx.onRequestDocuments();
      });
      \u0275\u0275elementStart(110, "span", 35);
      \u0275\u0275text(111, "description");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(112, "span");
      \u0275\u0275text(113);
      \u0275\u0275pipe(114, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(115, "button", 36);
      \u0275\u0275listener("click", function VendorOverviewComponent_Template_button_click_115_listener() {
        return ctx.onSuspendVendor();
      });
      \u0275\u0275elementStart(116, "span", 35);
      \u0275\u0275text(117, "pause_circle");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(118, "span");
      \u0275\u0275text(119);
      \u0275\u0275pipe(120, "translate");
      \u0275\u0275elementEnd()()()()()()();
    }
    if (rf & 2) {
      \u0275\u0275attribute("dir", ctx.isRTL ? "rtl" : "ltr");
      \u0275\u0275advance(2);
      \u0275\u0275property("ngForOf", ctx.kpis);
      \u0275\u0275advance(8);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(11, 27, "VENDOR_OVERVIEW.STORE_INFO"));
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(16, 29, "VENDOR_OVERVIEW.CATEGORY"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.storeInfo.category);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(22, 31, "VENDOR_OVERVIEW.REGISTRATION_DATE"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.storeInfo.registrationDate);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(28, 33, "VENDOR_OVERVIEW.PHONE"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.storeInfo.phone);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(34, 35, "VENDOR_OVERVIEW.EMAIL"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.storeInfo.email);
      \u0275\u0275advance(7);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(44, 37, "VENDOR_OVERVIEW.ESSENTIAL_DOCS"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(47, 39, "VENDOR_OVERVIEW.VIEW_ALL"), " ");
      \u0275\u0275advance(3);
      \u0275\u0275property("ngForOf", ctx.documents);
      \u0275\u0275advance(8);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(58, 41, "VENDOR_OVERVIEW.RECENT_ORDERS"));
      \u0275\u0275advance(10);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(68, 43, "VENDOR_OVERVIEW.TABLE.ORDER_NUMBER"), " ");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(71, 45, "VENDOR_OVERVIEW.TABLE.CUSTOMER"), " ");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(74, 47, "VENDOR_OVERVIEW.TABLE.AMOUNT"), " ");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(77, 49, "VENDOR_OVERVIEW.TABLE.STATUS"), " ");
      \u0275\u0275advance(4);
      \u0275\u0275property("ngForOf", ctx.recentOrders);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(84, 51, "VENDOR_OVERVIEW.VIEW_ALL_ORDERS"), " ");
      \u0275\u0275advance(8);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(92, 53, "VENDOR_OVERVIEW.ALERTS_TITLE"));
      \u0275\u0275advance(3);
      \u0275\u0275property("ngForOf", ctx.alerts);
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(101, 55, "VENDOR_OVERVIEW.ADMIN_ACTIONS"));
      \u0275\u0275advance(7);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(108, 57, "VENDOR_OVERVIEW.ACTIONS.APPROVE"));
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(114, 59, "VENDOR_OVERVIEW.ACTIONS.REQUEST_DOCS"));
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(120, 61, "VENDOR_OVERVIEW.ACTIONS.SUSPEND"));
    }
  }, dependencies: [CommonModule, NgClass, NgForOf, NgIf, TranslateModule, TranslatePipe], encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(VendorOverviewComponent, { className: "VendorOverviewComponent", filePath: "src\\app\\features\\vendors\\vendor-overview\\vendor-overview.component.ts", lineNumber: 54 });
})();

// src/app/features/vendors/vendor-products/vendor-products.component.ts
var _c0 = (a0) => ({ "bg-red-50/30": a0 });
var _c1 = (a0) => ({ "grayscale": a0 });
function VendorProductsComponent_tr_85_span_25_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 74);
    \u0275\u0275text(1, " \u0645\u0646\u062E\u0641\u0636 ");
    \u0275\u0275elementEnd();
  }
}
function VendorProductsComponent_tr_85_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr", 49)(1, "td", 50)(2, "input", 36);
    \u0275\u0275twoWayListener("ngModelChange", function VendorProductsComponent_tr_85_Template_input_ngModelChange_2_listener($event) {
      const product_r2 = \u0275\u0275restoreView(_r1).$implicit;
      \u0275\u0275twoWayBindingSet(product_r2.selected, $event) || (product_r2.selected = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("change", function VendorProductsComponent_tr_85_Template_input_change_2_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.onProductSelect());
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(3, "td", 51)(4, "div", 52)(5, "div", 53)(6, "div", 54)(7, "span", 55);
    \u0275\u0275text(8, "image");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(9, "div", 56)(10, "span", 57);
    \u0275\u0275text(11);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "span", 58);
    \u0275\u0275text(13);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(14, "td", 59);
    \u0275\u0275text(15);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "td", 60);
    \u0275\u0275text(17);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "td", 61);
    \u0275\u0275text(19);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "td", 51)(21, "div", 62)(22, "div", 63)(23, "span", 64);
    \u0275\u0275text(24);
    \u0275\u0275elementEnd();
    \u0275\u0275template(25, VendorProductsComponent_tr_85_span_25_Template, 2, 0, "span", 65);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(26, "div", 66);
    \u0275\u0275element(27, "div", 67);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(28, "td", 50)(29, "span", 68);
    \u0275\u0275text(30);
    \u0275\u0275pipe(31, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(32, "td", 51)(33, "div", 69)(34, "button", 70);
    \u0275\u0275listener("click", function VendorProductsComponent_tr_85_Template_button_click_34_listener() {
      const product_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.onViewProduct(product_r2.id));
    });
    \u0275\u0275elementStart(35, "span", 71);
    \u0275\u0275text(36, "visibility");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(37, "button", 72);
    \u0275\u0275listener("click", function VendorProductsComponent_tr_85_Template_button_click_37_listener() {
      const product_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.onEditProduct(product_r2.id));
    });
    \u0275\u0275elementStart(38, "span", 71);
    \u0275\u0275text(39, "edit");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(40, "button", 73);
    \u0275\u0275listener("click", function VendorProductsComponent_tr_85_Template_button_click_40_listener() {
      const product_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.onDeleteProduct(product_r2.id));
    });
    \u0275\u0275elementStart(41, "span", 71);
    \u0275\u0275text(42, "delete");
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const product_r2 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275property("ngClass", \u0275\u0275pureFunction1(19, _c0, product_r2.status === "out_of_stock"));
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", product_r2.selected);
    \u0275\u0275advance(3);
    \u0275\u0275property("ngClass", \u0275\u0275pureFunction1(21, _c1, product_r2.status === "out_of_stock"));
    \u0275\u0275advance(5);
    \u0275\u0275attribute("title", product_r2.nameAr);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", product_r2.nameAr, " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(product_r2.variant);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(product_r2.sku);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(product_r2.category);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("SAR ", product_r2.price, "");
    \u0275\u0275advance(4);
    \u0275\u0275property("ngClass", ctx_r2.getStockColorClass(product_r2.stockStatus));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", product_r2.stock, " \u0642\u0637\u0639\u0629 ");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", product_r2.stockStatus === "low");
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("width", product_r2.stockPercentage, "%");
    \u0275\u0275property("ngClass", ctx_r2.getStockBarClass(product_r2.stockStatus));
    \u0275\u0275advance(2);
    \u0275\u0275property("ngClass", product_r2.statusClass);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(31, 17, product_r2.statusKey), " ");
  }
}
var VendorProductsComponent = class _VendorProductsComponent {
  translate;
  route;
  vendorId = "VND-9928";
  currentLang = "ar";
  isRTL = true;
  // Summary stats
  totalProducts = 1245;
  outOfStock = 23;
  underReview = 5;
  totalInventoryValue = "342,500";
  // Filters
  searchQuery = "";
  selectedCategory = "";
  selectedStatus = "";
  selectAll = false;
  products = [
    {
      id: "1",
      nameAr: "\u0633\u0627\u0639\u0629 \u0630\u0643\u064A\u0629 \u0627\u0628\u0644 \u0648\u0627\u062A\u0634 \u0633\u064A\u0631\u064A\u0632 8",
      nameEn: "Apple Watch Series 8",
      variant: "\u0623\u0633\u0648\u062F, 45mm",
      sku: "AW-S8-45-BLK",
      category: "\u0633\u0627\u0639\u0627\u062A \u0630\u0643\u064A\u0629",
      price: "1,599",
      stock: 45,
      stockPercentage: 75,
      stockStatus: "high",
      status: "active",
      statusKey: "VENDOR_PRODUCTS.STATUS.ACTIVE",
      statusClass: "bg-green-50 text-green-700 border-green-200",
      imageUrl: "https://via.placeholder.com/40",
      selected: false
    },
    {
      id: "2",
      nameAr: "\u0633\u0645\u0627\u0639\u0627\u062A \u0631\u0623\u0633 \u0644\u0627\u0633\u0644\u0643\u064A\u0629 \u0633\u0648\u0646\u064A",
      nameEn: "Sony WH-1000XM4",
      variant: "\u0641\u0636\u064A, \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0636\u0648\u0636\u0627\u0621",
      sku: "SN-WHXM4-SLV",
      category: "\u0635\u0648\u062A\u064A\u0627\u062A",
      price: "1,249",
      stock: 3,
      stockPercentage: 10,
      stockStatus: "low",
      status: "active",
      statusKey: "VENDOR_PRODUCTS.STATUS.ACTIVE",
      statusClass: "bg-green-50 text-green-700 border-green-200",
      imageUrl: "https://via.placeholder.com/40",
      selected: false
    },
    {
      id: "3",
      nameAr: "\u0639\u062F\u0633\u0629 \u0643\u0627\u0646\u0648\u0646 50mm",
      nameEn: "Canon 50mm f/1.8",
      variant: "\u0623\u0633\u0648\u062F, STM",
      sku: "CN-50F18-STM",
      category: "\u062A\u0635\u0648\u064A\u0631",
      price: "499",
      stock: 0,
      stockPercentage: 0,
      stockStatus: "out",
      status: "out_of_stock",
      statusKey: "VENDOR_PRODUCTS.STATUS.OUT_OF_STOCK",
      statusClass: "bg-red-50 text-red-700 border-red-200",
      imageUrl: "https://via.placeholder.com/40",
      selected: false
    },
    {
      id: "4",
      nameAr: "\u0646\u0638\u0627\u0631\u0629 \u0648\u0627\u0642\u0639 \u0627\u0641\u062A\u0631\u0627\u0636\u064A Quest 2",
      nameEn: "Meta Quest 2",
      variant: "\u0623\u0628\u064A\u0636, 128GB",
      sku: "MQ-2-128-WHT",
      category: "\u0623\u0644\u0639\u0627\u0628",
      price: "1,899",
      stock: 12,
      stockPercentage: 30,
      stockStatus: "high",
      status: "under_review",
      statusKey: "VENDOR_PRODUCTS.STATUS.UNDER_REVIEW",
      statusClass: "bg-yellow-50 text-yellow-700 border-yellow-200",
      imageUrl: "https://via.placeholder.com/40",
      selected: false
    }
  ];
  constructor(translate, route) {
    this.translate = translate;
    this.route = route;
    this.currentLang = this.translate.currentLang || "ar";
    this.isRTL = this.currentLang === "ar";
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.isRTL = event.lang === "ar";
    });
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.vendorId = params["id"];
      }
    });
  }
  onSelectAll() {
    this.products.forEach((p) => p.selected = this.selectAll);
  }
  onProductSelect() {
    this.selectAll = this.products.every((p) => p.selected);
  }
  onAddProduct() {
    console.log("Add new product");
  }
  onEditVendorData() {
    console.log("Edit vendor data");
  }
  onViewProduct(productId) {
    console.log("View product:", productId);
  }
  onEditProduct(productId) {
    console.log("Edit product:", productId);
  }
  onDeleteProduct(productId) {
    console.log("Delete product:", productId);
  }
  onFilterProducts() {
    console.log("Filter products");
  }
  getStockColorClass(status) {
    switch (status) {
      case "high":
        return "text-gray-600";
      case "low":
        return "text-orange-600";
      case "out":
        return "text-red-500";
      default:
        return "text-gray-600";
    }
  }
  getStockBarClass(status) {
    switch (status) {
      case "high":
        return "bg-primary";
      case "low":
        return "bg-orange-500";
      case "out":
        return "bg-red-500";
      default:
        return "bg-primary";
    }
  }
  static \u0275fac = function VendorProductsComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _VendorProductsComponent)(\u0275\u0275directiveInject(TranslateService), \u0275\u0275directiveInject(ActivatedRoute));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _VendorProductsComponent, selectors: [["app-vendor-products"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 102, vars: 6, consts: [[1, "flex", "flex-col", "gap-6"], [1, "flex", "flex-col", "lg:flex-row", "gap-6"], [1, "w-full", "lg:w-64", "flex-shrink-0", "flex", "flex-col", "gap-6"], [1, "bg-white", "rounded-xl", "p-5", "flex", "flex-col", "gap-4", "border", "border-gray-200", "shadow-sm"], [1, "text-sm", "font-bold", "text-gray-800", "border-b", "border-gray-200", "pb-2", "flex", "items-center", "gap-2"], [1, "material-symbols-outlined", "text-primary", "text-base"], [1, "flex", "flex-col", "gap-3"], [1, "flex", "justify-between", "items-center", "p-3", "rounded-lg", "bg-primary/5", "border", "border-primary/10"], [1, "text-xs", "text-gray-600", "flex", "items-center", "gap-2"], [1, "text-sm", "font-bold", "text-gray-900"], [1, "flex", "justify-between", "items-center", "p-3", "rounded-lg", "bg-orange-50", "border", "border-orange-100"], [1, "material-symbols-outlined", "text-orange-600", "text-base"], [1, "flex", "justify-between", "items-center", "p-3", "rounded-lg", "bg-gray-50", "border", "border-gray-200"], [1, "material-symbols-outlined", "text-gray-500", "text-base"], [1, "mt-2", "pt-4", "border-t", "border-gray-200"], [1, "text-xs", "text-gray-500", "block", "mb-1"], [1, "text-lg", "font-bold", "text-primary"], [1, "flex-1", "flex", "flex-col", "gap-4"], [1, "bg-white", "rounded-xl", "p-4", "flex", "flex-col", "sm:flex-row", "gap-3", "items-center", "justify-between", "border", "border-gray-200", "shadow-sm"], [1, "w-full", "sm:flex-1", "relative"], [1, "material-symbols-outlined", "absolute", "top-1/2", "-translate-y-1/2", "inset-inline-start-3", "text-gray-400", "text-sm"], ["placeholder", "\u0627\u0644\u0628\u062D\u062B \u0628\u0631\u0642\u0645 SKU \u0623\u0648 \u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u062A\u062C...", "type", "text", 1, "w-full", "bg-white", "border", "border-gray-200", "rounded-lg", "py-2", "ps-9", "pe-3", "text-sm", "focus:ring-1", "focus:ring-primary", "focus:border-primary", "transition-all", 3, "ngModelChange", "ngModel"], [1, "flex", "flex-wrap", "gap-2", "w-full", "sm:w-auto"], [1, "bg-white", "border", "border-gray-200", "rounded-lg", "px-3", "py-2", "text-xs", "font-medium", "text-gray-700", "appearance-none", "relative", "bg-no-repeat", "bg-[length:1.2em_1.2em]", "pe-8", "ps-3", "bg-[position:right_0.5rem_center]", 2, "background-image", "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')", 3, "ngModelChange", "ngModel"], ["value", ""], ["value", "electronics"], ["value", "accessories"], ["value", "active"], ["value", "out_of_stock"], [1, "px-3", "py-2", "border", "border-gray-200", "rounded-lg", "bg-gray-50", "text-gray-600", "hover:bg-gray-100", "transition-colors", "flex", "items-center", "justify-center", 3, "click"], [1, "material-symbols-outlined", "text-sm"], [1, "bg-white", "rounded-xl", "overflow-hidden", "shadow-sm", "border", "border-gray-200"], [1, "overflow-x-auto"], [1, "w-full", "border-collapse"], [1, "bg-gray-50", "border-b", "border-gray-200"], [1, "p-3", "text-xs", "font-semibold", "text-gray-500", "w-10", "text-center"], ["type", "checkbox", 1, "rounded", "border-gray-300", "text-primary", "focus:ring-primary", "size-3.5", 3, "ngModelChange", "change", "ngModel"], [1, "p-3", "text-xs", "font-semibold", "text-gray-500", "text-start"], [1, "p-3", "text-xs", "font-semibold", "text-gray-500", "w-32", "text-start"], [1, "p-3", "text-xs", "font-semibold", "text-gray-500", "text-center"], [1, "p-3", "text-xs", "font-semibold", "text-gray-500", "w-24", "text-start"], [1, "divide-y", "divide-gray-200"], ["class", "hover:bg-gray-50 transition-colors group", 3, "ngClass", 4, "ngFor", "ngForOf"], [1, "flex", "items-center", "justify-between", "p-4", "border-t", "border-gray-200", "bg-gray-50", "text-xs", "text-gray-500"], [1, "flex", "gap-1"], ["disabled", "", 1, "px-2", "py-1", "rounded", "border", "border-gray-200", "bg-white", "disabled:opacity-50"], [1, "px-2", "py-1", "rounded", "border", "border-primary", "bg-primary", "text-white"], [1, "px-2", "py-1", "rounded", "border", "border-gray-200", "bg-white", "hover:bg-gray-50"], [1, "px-2", "py-1"], [1, "hover:bg-gray-50", "transition-colors", "group", 3, "ngClass"], [1, "p-3", "text-center"], [1, "p-3"], [1, "flex", "items-center", "gap-3"], [1, "size-10", "rounded", "border", "border-gray-200", "bg-gray-100", "shrink-0", "overflow-hidden", 3, "ngClass"], [1, "w-full", "h-full", "bg-gray-200", "flex", "items-center", "justify-center"], [1, "material-symbols-outlined", "text-gray-400", "text-lg"], [1, "flex", "flex-col", "max-w-[200px]"], [1, "text-sm", "font-medium", "text-gray-900", "truncate"], [1, "text-xs", "text-gray-500", "truncate"], [1, "p-3", "text-sm", "font-mono", "text-gray-600"], [1, "p-3", "text-sm", "text-gray-600"], [1, "p-3", "text-sm", "font-semibold", "text-gray-900"], [1, "flex", "flex-col", "gap-1"], [1, "flex", "justify-between", "text-xs"], [1, "font-medium", 3, "ngClass"], ["class", "text-gray-400 text-[10px]", 4, "ngIf"], [1, "w-full", "bg-gray-200", "rounded-full", "h-1.5", "overflow-hidden"], [1, "h-1.5", "rounded-full", 3, "ngClass"], [1, "inline-flex", "items-center", "px-2", "py-0.5", "rounded", "text-[11px]", "font-medium", "border", 3, "ngClass"], [1, "flex", "items-center", "gap-1", "opacity-0", "group-hover:opacity-100", "transition-opacity", "justify-start"], ["title", "\u0639\u0631\u0636", 1, "p-1.5", "text-gray-400", "hover:text-primary", "hover:bg-primary/10", "rounded", "transition-colors", 3, "click"], [1, "material-symbols-outlined", "text-[18px]"], ["title", "\u062A\u0639\u062F\u064A\u0644", 1, "p-1.5", "text-gray-400", "hover:text-primary", "hover:bg-primary/10", "rounded", "transition-colors", 3, "click"], ["title", "\u062D\u0630\u0641", 1, "p-1.5", "text-gray-400", "hover:text-red-500", "hover:bg-red-50", "rounded", "transition-colors", 3, "click"], [1, "text-gray-400", "text-[10px]"]], template: function VendorProductsComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "h3", 4)(5, "span", 5);
      \u0275\u0275text(6, "summarize");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(7, "span");
      \u0275\u0275text(8, "\u0645\u0644\u062E\u0635 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(9, "div", 6)(10, "div", 7)(11, "span", 8)(12, "span", 5);
      \u0275\u0275text(13, "inventory_2");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "span");
      \u0275\u0275text(15, "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(16, "span", 9);
      \u0275\u0275text(17, "1,245");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(18, "div", 10)(19, "span", 8)(20, "span", 11);
      \u0275\u0275text(21, "warning");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(22, "span");
      \u0275\u0275text(23, "\u0646\u0627\u0641\u0630 \u0645\u0646 \u0627\u0644\u0645\u062E\u0632\u0648\u0646");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(24, "span", 9);
      \u0275\u0275text(25, "23");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(26, "div", 12)(27, "span", 8)(28, "span", 13);
      \u0275\u0275text(29, "pending_actions");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(30, "span");
      \u0275\u0275text(31, "\u0642\u064A\u062F \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(32, "span", 9);
      \u0275\u0275text(33, "5");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(34, "div", 14)(35, "span", 15);
      \u0275\u0275text(36, "\u0625\u062C\u0645\u0627\u0644\u064A \u0642\u064A\u0645\u0629 \u0627\u0644\u0645\u062E\u0632\u0648\u0646");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(37, "span", 16);
      \u0275\u0275text(38, "SAR 342,500");
      \u0275\u0275elementEnd()()()()();
      \u0275\u0275elementStart(39, "div", 17)(40, "div", 18)(41, "div", 19)(42, "span", 20);
      \u0275\u0275text(43, "search");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(44, "input", 21);
      \u0275\u0275twoWayListener("ngModelChange", function VendorProductsComponent_Template_input_ngModelChange_44_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.searchQuery, $event) || (ctx.searchQuery = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(45, "div", 22)(46, "select", 23);
      \u0275\u0275twoWayListener("ngModelChange", function VendorProductsComponent_Template_select_ngModelChange_46_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.selectedCategory, $event) || (ctx.selectedCategory = $event);
        return $event;
      });
      \u0275\u0275elementStart(47, "option", 24);
      \u0275\u0275text(48, "\u0643\u0644 \u0627\u0644\u062A\u0635\u0646\u064A\u0641\u0627\u062A");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(49, "option", 25);
      \u0275\u0275text(50, "\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(51, "option", 26);
      \u0275\u0275text(52, "\u0627\u0643\u0633\u0633\u0648\u0627\u0631\u0627\u062A");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(53, "select", 23);
      \u0275\u0275twoWayListener("ngModelChange", function VendorProductsComponent_Template_select_ngModelChange_53_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.selectedStatus, $event) || (ctx.selectedStatus = $event);
        return $event;
      });
      \u0275\u0275elementStart(54, "option", 24);
      \u0275\u0275text(55, "\u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u0646\u062A\u062C");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(56, "option", 27);
      \u0275\u0275text(57, "\u0646\u0634\u0637");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(58, "option", 28);
      \u0275\u0275text(59, "\u0646\u0627\u0641\u0630");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(60, "button", 29);
      \u0275\u0275listener("click", function VendorProductsComponent_Template_button_click_60_listener() {
        return ctx.onFilterProducts();
      });
      \u0275\u0275elementStart(61, "span", 30);
      \u0275\u0275text(62, "filter_list");
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(63, "div", 31)(64, "div", 32)(65, "table", 33)(66, "thead")(67, "tr", 34)(68, "th", 35)(69, "input", 36);
      \u0275\u0275twoWayListener("ngModelChange", function VendorProductsComponent_Template_input_ngModelChange_69_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.selectAll, $event) || (ctx.selectAll = $event);
        return $event;
      });
      \u0275\u0275listener("change", function VendorProductsComponent_Template_input_change_69_listener() {
        return ctx.onSelectAll();
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(70, "th", 37);
      \u0275\u0275text(71, "\u0627\u0644\u0645\u0646\u062A\u062C");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(72, "th", 37);
      \u0275\u0275text(73, "SKU");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(74, "th", 37);
      \u0275\u0275text(75, "\u0627\u0644\u062A\u0635\u0646\u064A\u0641");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(76, "th", 37);
      \u0275\u0275text(77, "\u0627\u0644\u0633\u0639\u0631");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(78, "th", 38);
      \u0275\u0275text(79, "\u0627\u0644\u0645\u062E\u0632\u0648\u0646");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(80, "th", 39);
      \u0275\u0275text(81, "\u0627\u0644\u062D\u0627\u0644\u0629");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(82, "th", 40);
      \u0275\u0275text(83, " \u0625\u062C\u0631\u0627\u0621\u0627\u062A ");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(84, "tbody", 41);
      \u0275\u0275template(85, VendorProductsComponent_tr_85_Template, 43, 23, "tr", 42);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(86, "div", 43)(87, "span");
      \u0275\u0275text(88, "\u0639\u0631\u0636 1 \u0625\u0644\u0649 4 \u0645\u0646 1,245 \u0645\u0646\u062A\u062C");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(89, "div", 44)(90, "button", 45);
      \u0275\u0275text(91, " \u0627\u0644\u0633\u0627\u0628\u0642 ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(92, "button", 46);
      \u0275\u0275text(93, "1");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(94, "button", 47);
      \u0275\u0275text(95, "2");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(96, "button", 47);
      \u0275\u0275text(97, "3");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(98, "span", 48);
      \u0275\u0275text(99, "...");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(100, "button", 47);
      \u0275\u0275text(101, " \u0627\u0644\u062A\u0627\u0644\u064A ");
      \u0275\u0275elementEnd()()()()()()();
    }
    if (rf & 2) {
      \u0275\u0275attribute("dir", ctx.isRTL ? "rtl" : "ltr");
      \u0275\u0275advance(44);
      \u0275\u0275twoWayProperty("ngModel", ctx.searchQuery);
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.selectedCategory);
      \u0275\u0275advance(7);
      \u0275\u0275twoWayProperty("ngModel", ctx.selectedStatus);
      \u0275\u0275advance(16);
      \u0275\u0275twoWayProperty("ngModel", ctx.selectAll);
      \u0275\u0275advance(16);
      \u0275\u0275property("ngForOf", ctx.products);
    }
  }, dependencies: [CommonModule, NgClass, NgForOf, NgIf, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, CheckboxControlValueAccessor, SelectControlValueAccessor, NgControlStatus, NgModel, TranslateModule, TranslatePipe], encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(VendorProductsComponent, { className: "VendorProductsComponent", filePath: "src\\app\\features\\vendors\\vendor-products\\vendor-products.component.ts", lineNumber: 31 });
})();

// src/app/features/vendors/vendor-orders/vendor-orders.component.ts
function VendorOrdersComponent_div_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 48)(1, "div", 49)(2, "div", 50)(3, "span", 51);
    \u0275\u0275text(4);
    \u0275\u0275pipe(5, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 52);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 53)(9, "span");
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "span", 11);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(13, "div")(14, "p", 54);
    \u0275\u0275text(15);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const kpi_r1 = ctx.$implicit;
    \u0275\u0275property("ngClass", kpi_r1.borderColor);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(5, 7, kpi_r1.titleKey));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(kpi_r1.icon);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", kpi_r1.trendClass);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(kpi_r1.trend);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(kpi_r1.trendIcon);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(kpi_r1.value);
  }
}
function VendorOrdersComponent_tr_53_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr", 55)(1, "td", 56)(2, "span", 57);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "td", 56)(5, "div", 58)(6, "span", 59);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "span", 60)(9, "span", 61);
    \u0275\u0275text(10, "location_on");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "span");
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(13, "td", 56)(14, "div", 58)(15, "span", 62);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "span", 51);
    \u0275\u0275text(18);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(19, "td", 56)(20, "span", 63);
    \u0275\u0275text(21);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(22, "td", 64)(23, "span", 65);
    \u0275\u0275text(24);
    \u0275\u0275pipe(25, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(26, "td", 64)(27, "span", 65);
    \u0275\u0275text(28);
    \u0275\u0275pipe(29, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(30, "td", 64)(31, "span", 65);
    \u0275\u0275text(32);
    \u0275\u0275pipe(33, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(34, "td", 56)(35, "div", 66)(36, "button", 67);
    \u0275\u0275listener("click", function VendorOrdersComponent_tr_53_Template_button_click_36_listener() {
      const order_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onViewOrder(order_r3.id));
    });
    \u0275\u0275elementStart(37, "span", 68);
    \u0275\u0275text(38, "visibility");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(39, "button", 69);
    \u0275\u0275listener("click", function VendorOrdersComponent_tr_53_Template_button_click_39_listener() {
      const order_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onEditOrder(order_r3.id));
    });
    \u0275\u0275elementStart(40, "span", 68);
    \u0275\u0275text(41, "edit");
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const order_r3 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(order_r3.orderNumber);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(order_r3.customer);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(order_r3.customerLocation);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(order_r3.date);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(order_r3.time);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", order_r3.amount, " \u0631.\u0633");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngClass", order_r3.paymentStatusClass);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(25, 12, order_r3.paymentStatusKey), " ");
    \u0275\u0275advance(3);
    \u0275\u0275property("ngClass", order_r3.shippingStatusClass);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(29, 14, order_r3.shippingStatusKey), " ");
    \u0275\u0275advance(3);
    \u0275\u0275property("ngClass", order_r3.generalStatusClass);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(33, 16, order_r3.generalStatusKey), " ");
  }
}
function VendorOrdersComponent_div_117_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 70)(1, "span", 71);
    \u0275\u0275text(2, "error");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "p", 72);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const alert_r5 = ctx.$implicit;
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", alert_r5, " ");
  }
}
var VendorOrdersComponent = class _VendorOrdersComponent {
  translate;
  route;
  vendorId = "VND-9928";
  currentLang = "ar";
  isRTL = true;
  searchQuery = "";
  // KPIs
  kpis = [
    {
      id: "total",
      titleKey: "VENDOR_ORDERS.KPI.TOTAL_ORDERS",
      value: "15,420",
      trend: "5%",
      trendKey: "VENDOR_ORDERS.KPI.INCREASE",
      icon: "receipt_long",
      borderColor: "border-l-primary",
      trendClass: "text-green-600",
      trendIcon: "arrow_upward"
    },
    {
      id: "open",
      titleKey: "VENDOR_ORDERS.KPI.OPEN_ORDERS",
      value: "1,230",
      trend: "2%",
      trendKey: "VENDOR_ORDERS.KPI.INCREASE",
      icon: "pending_actions",
      borderColor: "border-l-blue-500",
      trendClass: "text-green-600",
      trendIcon: "arrow_upward"
    },
    {
      id: "completed",
      titleKey: "VENDOR_ORDERS.KPI.COMPLETED_ORDERS",
      value: "13,850",
      trend: "1%",
      trendKey: "VENDOR_ORDERS.KPI.INCREASE",
      icon: "check_circle",
      borderColor: "border-l-green-500",
      trendClass: "text-green-600",
      trendIcon: "arrow_upward"
    },
    {
      id: "cancelled",
      titleKey: "VENDOR_ORDERS.KPI.CANCELLED_ORDERS",
      value: "240",
      trend: "1%",
      trendKey: "VENDOR_ORDERS.KPI.DECREASE",
      icon: "cancel",
      borderColor: "border-l-red-500",
      trendClass: "text-red-600",
      trendIcon: "arrow_downward"
    },
    {
      id: "returned",
      titleKey: "VENDOR_ORDERS.KPI.RETURNED_ORDERS",
      value: "100",
      trend: "0.5%",
      trendKey: "VENDOR_ORDERS.KPI.DECREASE",
      icon: "keyboard_return",
      borderColor: "border-l-orange-500",
      trendClass: "text-red-600",
      trendIcon: "arrow_downward"
    },
    {
      id: "average",
      titleKey: "VENDOR_ORDERS.KPI.AVERAGE_ORDER",
      value: "250 \u0631.\u0633",
      trend: "10%",
      trendKey: "VENDOR_ORDERS.KPI.INCREASE",
      icon: "payments",
      borderColor: "border-l-purple-500",
      trendClass: "text-green-600",
      trendIcon: "arrow_upward"
    }
  ];
  // Summary stats
  totalSales = "3,850,000";
  delayedOrders = 45;
  openDisputes = 12;
  cancellationRate = "1.5%";
  // Orders
  orders = [
    {
      id: "1",
      orderNumber: "ORD-1001",
      customer: "\u0623\u062D\u0645\u062F \u0645\u062D\u0645\u0648\u062F",
      customerLocation: "\u0627\u0644\u0631\u064A\u0627\u0636",
      date: "2023-10-25",
      time: "14:30",
      amount: "500",
      paymentStatusKey: "VENDOR_ORDERS.PAYMENT_STATUS.PAID",
      paymentStatusClass: "bg-green-100 text-green-700",
      shippingStatusKey: "VENDOR_ORDERS.SHIPPING_STATUS.PENDING",
      shippingStatusClass: "bg-yellow-100 text-yellow-700",
      generalStatusKey: "VENDOR_ORDERS.GENERAL_STATUS.NEW",
      generalStatusClass: "bg-blue-100 text-blue-700"
    },
    {
      id: "2",
      orderNumber: "ORD-1002",
      customer: "\u0641\u0627\u0637\u0645\u0629 \u0639\u0644\u064A",
      customerLocation: "\u062C\u062F\u0629",
      date: "2023-10-24",
      time: "09:15",
      amount: "1200",
      paymentStatusKey: "VENDOR_ORDERS.PAYMENT_STATUS.PENDING",
      paymentStatusClass: "bg-yellow-100 text-yellow-700",
      shippingStatusKey: "VENDOR_ORDERS.SHIPPING_STATUS.IN_PROGRESS",
      shippingStatusClass: "bg-blue-100 text-blue-700",
      generalStatusKey: "VENDOR_ORDERS.GENERAL_STATUS.IN_PROGRESS",
      generalStatusClass: "bg-blue-100 text-blue-700"
    },
    {
      id: "3",
      orderNumber: "ORD-1003",
      customer: "\u0645\u062D\u0645\u062F \u062E\u0627\u0644\u062F",
      customerLocation: "\u0627\u0644\u062F\u0645\u0627\u0645",
      date: "2023-10-23",
      time: "18:45",
      amount: "350",
      paymentStatusKey: "VENDOR_ORDERS.PAYMENT_STATUS.PAID",
      paymentStatusClass: "bg-green-100 text-green-700",
      shippingStatusKey: "VENDOR_ORDERS.SHIPPING_STATUS.COMPLETED",
      shippingStatusClass: "bg-green-100 text-green-700",
      generalStatusKey: "VENDOR_ORDERS.GENERAL_STATUS.COMPLETED",
      generalStatusClass: "bg-green-100 text-green-700"
    },
    {
      id: "4",
      orderNumber: "ORD-1004",
      customer: "\u0633\u0627\u0631\u0629 \u0639\u0628\u062F \u0627\u0644\u0644\u0647",
      customerLocation: "\u0645\u0643\u0629",
      date: "2023-10-22",
      time: "11:20",
      amount: "800",
      paymentStatusKey: "VENDOR_ORDERS.PAYMENT_STATUS.REFUNDED",
      paymentStatusClass: "bg-orange-100 text-orange-700",
      shippingStatusKey: "VENDOR_ORDERS.SHIPPING_STATUS.CANCELLED",
      shippingStatusClass: "bg-red-100 text-red-700",
      generalStatusKey: "VENDOR_ORDERS.GENERAL_STATUS.CANCELLED",
      generalStatusClass: "bg-red-100 text-red-700"
    }
  ];
  // Alerts
  alerts = [
    "3 \u0637\u0644\u0628\u0627\u062A \u062A\u062C\u0627\u0648\u0632\u062A \u0648\u0642\u062A \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0645\u062D\u062F\u062F (48 \u0633\u0627\u0639\u0629).",
    "\u0645\u062E\u0632\u0648\u0646 \u0645\u0646\u062E\u0641\u0636 \u0644\u0640 5 \u0645\u0646\u062A\u062C\u0627\u062A \u0645\u0628\u064A\u0639\u0629 \u0628\u0643\u062B\u0631\u0629.",
    "\u0646\u0632\u0627\u0639 \u062C\u062F\u064A\u062F \u064A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0645\u0631\u0627\u062C\u0639\u0629 \u0644\u0644\u0637\u0644\u0628 ORD-0988."
  ];
  constructor(translate, route) {
    this.translate = translate;
    this.route = route;
    this.currentLang = this.translate.currentLang || "ar";
    this.isRTL = this.currentLang === "ar";
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.isRTL = event.lang === "ar";
    });
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.vendorId = params["id"];
      }
    });
  }
  onSearch() {
    console.log("Search:", this.searchQuery);
  }
  onFilter() {
    console.log("Open filters");
  }
  onDateRange() {
    console.log("Open date range picker");
  }
  onBulkActions() {
    console.log("Open bulk actions");
  }
  onExport() {
    console.log("Export orders");
  }
  onViewOrder(orderId) {
    console.log("View order:", orderId);
  }
  onEditOrder(orderId) {
    console.log("Edit order:", orderId);
  }
  static \u0275fac = function VendorOrdersComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _VendorOrdersComponent)(\u0275\u0275directiveInject(TranslateService), \u0275\u0275directiveInject(ActivatedRoute));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _VendorOrdersComponent, selectors: [["app-vendor-orders"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 118, vars: 9, consts: [[1, "flex", "flex-col", "gap-6"], [1, "grid", "grid-cols-2", "md:grid-cols-3", "lg:grid-cols-6", "gap-4"], ["class", "bg-white rounded-xl p-4 shadow-sm border border-gray-200 border-l-4", 3, "ngClass", 4, "ngFor", "ngForOf"], [1, "flex", "flex-col", "lg:flex-row", "gap-6"], [1, "flex-1", "flex", "flex-col", "gap-4"], [1, "bg-white", "rounded-xl", "p-4", "flex", "flex-col", "sm:flex-row", "gap-3", "items-center", "justify-between", "border", "border-gray-200", "shadow-sm"], [1, "w-full", "sm:flex-1", "relative"], [1, "material-symbols-outlined", "absolute", "top-1/2", "-translate-y-1/2", "text-gray-400", "text-sm", "inset-inline-start-2"], ["placeholder", "\u0627\u0644\u0628\u062D\u062B \u0628\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628 \u0623\u0648 \u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064A\u0644...", "type", "text", 1, "w-full", "bg-white", "border", "border-gray-200", "rounded-lg", "py-2", "text-sm", "focus:ring-1", "focus:ring-primary", "focus:border-primary", "transition-all", "ps-8", "pe-3", 3, "ngModelChange", "keyup.enter", "ngModel"], [1, "flex", "flex-wrap", "gap-2", "w-full", "sm:w-auto"], [1, "px-3", "py-2", "border", "border-gray-200", "rounded-lg", "bg-white", "text-gray-600", "hover:bg-gray-50", "transition-colors", "flex", "items-center", "gap-2", "text-xs", "font-medium", 3, "click"], [1, "material-symbols-outlined", "text-sm"], [1, "px-3", "py-2", "border", "border-primary", "rounded-lg", "bg-primary", "text-white", "hover:bg-primary/90", "transition-colors", "flex", "items-center", "gap-2", "text-xs", "font-medium", 3, "click"], [1, "bg-white", "rounded-xl", "overflow-hidden", "shadow-sm", "border", "border-gray-200"], [1, "overflow-x-auto"], [1, "w-full", "border-collapse"], [1, "bg-gray-50", "border-b", "border-gray-200"], [1, "p-3", "text-xs", "font-semibold", "text-gray-500"], [1, "p-3", "text-xs", "font-semibold", "text-gray-500", "text-center"], [1, "p-3", "text-xs", "font-semibold", "text-gray-500", "w-24", "text-start"], [1, "divide-y", "divide-gray-200"], ["class", "hover:bg-gray-50 transition-colors group", 4, "ngFor", "ngForOf"], [1, "flex", "items-center", "justify-between", "p-4", "border-t", "border-gray-200", "bg-gray-50", "text-xs", "text-gray-500"], [1, "flex", "gap-1"], ["disabled", "", 1, "px-2", "py-1", "rounded", "border", "border-gray-200", "bg-white", "disabled:opacity-50"], [1, "px-2", "py-1", "rounded", "border", "border-primary", "bg-primary", "text-white"], [1, "px-2", "py-1", "rounded", "border", "border-gray-200", "bg-white", "hover:bg-gray-50"], [1, "px-2", "py-1"], [1, "w-full", "lg:w-80", "flex-shrink-0", "flex", "flex-col", "gap-6"], [1, "bg-white", "rounded-xl", "p-5", "flex", "flex-col", "gap-4", "border", "border-gray-200", "shadow-sm"], [1, "text-sm", "font-bold", "text-gray-800", "border-b", "border-gray-200", "pb-2", "flex", "items-center", "gap-2"], [1, "material-symbols-outlined", "text-primary", "text-lg"], [1, "flex", "flex-col", "gap-3"], [1, "flex", "justify-between", "items-center", "p-3", "rounded-lg", "bg-green-50", "border", "border-green-100"], [1, "text-xs", "text-gray-600", "flex", "items-center", "gap-2"], [1, "material-symbols-outlined", "text-green-600", "text-base"], [1, "text-sm", "font-bold", "text-gray-900"], [1, "flex", "justify-between", "items-center", "p-3", "rounded-lg", "bg-orange-50", "border", "border-orange-100"], [1, "material-symbols-outlined", "text-orange-600", "text-base"], [1, "flex", "justify-between", "items-center", "p-3", "rounded-lg", "bg-red-50", "border", "border-red-100"], [1, "material-symbols-outlined", "text-red-600", "text-base"], [1, "flex", "justify-between", "items-center", "p-3", "rounded-lg", "bg-gray-50", "border", "border-gray-200"], [1, "material-symbols-outlined", "text-gray-500", "text-base"], [1, "bg-white", "rounded-xl", "p-5", "flex", "flex-col", "gap-4", "border-2", "border-red-200", "shadow-sm"], [1, "flex", "items-center", "gap-2", "border-b", "border-gray-200", "pb-2"], [1, "material-symbols-outlined", "text-red-600", "text-lg"], [1, "text-sm", "font-bold", "text-gray-800"], ["class", "flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100", 4, "ngFor", "ngForOf"], [1, "bg-white", "rounded-xl", "p-4", "shadow-sm", "border", "border-gray-200", "border-l-4", 3, "ngClass"], [1, "flex", "items-center", "justify-between", "mb-3"], [1, "flex", "items-center", "gap-2"], [1, "text-xs", "text-gray-500"], [1, "material-symbols-outlined", "text-2xl", "text-gray-400"], [1, "flex", "items-center", "gap-1", "text-xs", 3, "ngClass"], [1, "text-xl", "font-bold", "text-gray-900"], [1, "hover:bg-gray-50", "transition-colors", "group"], [1, "p-3"], [1, "text-sm", "font-mono", "font-medium", "text-primary"], [1, "flex", "flex-col"], [1, "text-sm", "font-medium", "text-gray-900"], [1, "text-xs", "text-gray-500", "flex", "items-center", "gap-1"], [1, "material-symbols-outlined", "text-[14px]"], [1, "text-sm", "text-gray-900"], [1, "text-sm", "font-semibold", "text-gray-900"], [1, "p-3", "text-center"], [1, "inline-flex", "items-center", "px-2", "py-0.5", "rounded", "text-[11px]", "font-medium", "border", 3, "ngClass"], [1, "flex", "items-center", "gap-1", "opacity-0", "group-hover:opacity-100", "transition-opacity", "justify-start"], ["title", "\u0639\u0631\u0636", 1, "p-1.5", "text-gray-400", "hover:text-primary", "hover:bg-primary/10", "rounded", "transition-colors", 3, "click"], [1, "material-symbols-outlined", "text-[18px]"], ["title", "\u062A\u0639\u062F\u064A\u0644", 1, "p-1.5", "text-gray-400", "hover:text-primary", "hover:bg-primary/10", "rounded", "transition-colors", 3, "click"], [1, "flex", "items-start", "gap-2", "p-3", "rounded-lg", "bg-red-50", "border", "border-red-100"], [1, "material-symbols-outlined", "text-red-500", "text-base", "flex-shrink-0"], [1, "text-xs", "text-gray-700"]], template: function VendorOrdersComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1);
      \u0275\u0275template(2, VendorOrdersComponent_div_2_Template, 16, 9, "div", 2);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(3, "div", 3)(4, "div", 4)(5, "div", 5)(6, "div", 6)(7, "span", 7);
      \u0275\u0275text(8, "search");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "input", 8);
      \u0275\u0275twoWayListener("ngModelChange", function VendorOrdersComponent_Template_input_ngModelChange_9_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.searchQuery, $event) || (ctx.searchQuery = $event);
        return $event;
      });
      \u0275\u0275listener("keyup.enter", function VendorOrdersComponent_Template_input_keyup_enter_9_listener() {
        return ctx.onSearch();
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(10, "div", 9)(11, "button", 10);
      \u0275\u0275listener("click", function VendorOrdersComponent_Template_button_click_11_listener() {
        return ctx.onFilter();
      });
      \u0275\u0275elementStart(12, "span", 11);
      \u0275\u0275text(13, "filter_list");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "span");
      \u0275\u0275text(15, "\u0641\u0644\u062A\u0631\u0629");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(16, "button", 10);
      \u0275\u0275listener("click", function VendorOrdersComponent_Template_button_click_16_listener() {
        return ctx.onDateRange();
      });
      \u0275\u0275elementStart(17, "span", 11);
      \u0275\u0275text(18, "calendar_today");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(19, "span");
      \u0275\u0275text(20, "\u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0632\u0645\u0646\u064A");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(21, "button", 10);
      \u0275\u0275listener("click", function VendorOrdersComponent_Template_button_click_21_listener() {
        return ctx.onBulkActions();
      });
      \u0275\u0275elementStart(22, "span", 11);
      \u0275\u0275text(23, "checklist");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(24, "span");
      \u0275\u0275text(25, "\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u062C\u0645\u0627\u0639\u064A\u0629");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(26, "button", 12);
      \u0275\u0275listener("click", function VendorOrdersComponent_Template_button_click_26_listener() {
        return ctx.onExport();
      });
      \u0275\u0275elementStart(27, "span", 11);
      \u0275\u0275text(28, "download");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(29, "span");
      \u0275\u0275text(30, "\u062A\u0635\u062F\u064A\u0631");
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(31, "div", 13)(32, "div", 14)(33, "table", 15)(34, "thead")(35, "tr", 16)(36, "th", 17);
      \u0275\u0275text(37, "\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(38, "th", 17);
      \u0275\u0275text(39, "\u0627\u0644\u0639\u0645\u064A\u0644");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(40, "th", 17);
      \u0275\u0275text(41, "\u0627\u0644\u062A\u0627\u0631\u064A\u062E");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(42, "th", 17);
      \u0275\u0275text(43, "\u0627\u0644\u0645\u0628\u0644\u063A");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(44, "th", 18);
      \u0275\u0275text(45, "\u062D\u0627\u0644\u0629 \u0627\u0644\u062F\u0641\u0639");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(46, "th", 18);
      \u0275\u0275text(47, "\u062D\u0627\u0644\u0629 \u0627\u0644\u0634\u062D\u0646");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(48, "th", 18);
      \u0275\u0275text(49, "\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u0639\u0627\u0645\u0629");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(50, "th", 19);
      \u0275\u0275text(51, " \u0625\u062C\u0631\u0627\u0621\u0627\u062A ");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(52, "tbody", 20);
      \u0275\u0275template(53, VendorOrdersComponent_tr_53_Template, 42, 18, "tr", 21);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(54, "div", 22)(55, "span");
      \u0275\u0275text(56, "\u0639\u0631\u0636 1 \u0625\u0644\u0649 4 \u0645\u0646 15,420 \u0637\u0644\u0628");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(57, "div", 23)(58, "button", 24);
      \u0275\u0275text(59, " \u0627\u0644\u0633\u0627\u0628\u0642 ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(60, "button", 25);
      \u0275\u0275text(61, "1");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(62, "button", 26);
      \u0275\u0275text(63, "2");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(64, "button", 26);
      \u0275\u0275text(65, "3");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(66, "span", 27);
      \u0275\u0275text(67, "...");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(68, "button", 26);
      \u0275\u0275text(69, " \u0627\u0644\u062A\u0627\u0644\u064A ");
      \u0275\u0275elementEnd()()()()();
      \u0275\u0275elementStart(70, "div", 28)(71, "div", 29)(72, "h3", 30)(73, "span", 31);
      \u0275\u0275text(74, "summarize");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(75, "span");
      \u0275\u0275text(76, "\u0645\u0644\u062E\u0635 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(77, "div", 32)(78, "div", 33)(79, "span", 34)(80, "span", 35);
      \u0275\u0275text(81, "payments");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(82, "span");
      \u0275\u0275text(83, "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(84, "span", 36);
      \u0275\u0275text(85);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(86, "div", 37)(87, "span", 34)(88, "span", 38);
      \u0275\u0275text(89, "schedule");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(90, "span");
      \u0275\u0275text(91, "\u0637\u0644\u0628\u0627\u062A \u0645\u062A\u0623\u062E\u0631\u0629");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(92, "span", 36);
      \u0275\u0275text(93);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(94, "div", 39)(95, "span", 34)(96, "span", 40);
      \u0275\u0275text(97, "report_problem");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(98, "span");
      \u0275\u0275text(99, "\u0646\u0632\u0627\u0639\u0627\u062A \u0645\u0641\u062A\u0648\u062D\u0629");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(100, "span", 36);
      \u0275\u0275text(101);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(102, "div", 41)(103, "span", 34)(104, "span", 42);
      \u0275\u0275text(105, "cancel");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(106, "span");
      \u0275\u0275text(107, "\u0645\u0639\u062F\u0644 \u0627\u0644\u0625\u0644\u063A\u0627\u0621");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(108, "span", 36);
      \u0275\u0275text(109);
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(110, "div", 43)(111, "div", 44)(112, "span", 45);
      \u0275\u0275text(113, "warning");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(114, "h3", 46);
      \u0275\u0275text(115, "\u062A\u0646\u0628\u064A\u0647\u0627\u062A");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(116, "div", 32);
      \u0275\u0275template(117, VendorOrdersComponent_div_117_Template, 5, 1, "div", 47);
      \u0275\u0275elementEnd()()()()();
    }
    if (rf & 2) {
      \u0275\u0275attribute("dir", ctx.isRTL ? "rtl" : "ltr");
      \u0275\u0275advance(2);
      \u0275\u0275property("ngForOf", ctx.kpis);
      \u0275\u0275advance(7);
      \u0275\u0275twoWayProperty("ngModel", ctx.searchQuery);
      \u0275\u0275advance(44);
      \u0275\u0275property("ngForOf", ctx.orders);
      \u0275\u0275advance(32);
      \u0275\u0275textInterpolate1("", ctx.totalSales, " \u0631.\u0633");
      \u0275\u0275advance(8);
      \u0275\u0275textInterpolate(ctx.delayedOrders);
      \u0275\u0275advance(8);
      \u0275\u0275textInterpolate(ctx.openDisputes);
      \u0275\u0275advance(8);
      \u0275\u0275textInterpolate(ctx.cancellationRate);
      \u0275\u0275advance(8);
      \u0275\u0275property("ngForOf", ctx.alerts);
    }
  }, dependencies: [CommonModule, NgClass, NgForOf, FormsModule, DefaultValueAccessor, NgControlStatus, NgModel, TranslateModule, TranslatePipe], encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(VendorOrdersComponent, { className: "VendorOrdersComponent", filePath: "src\\app\\features\\vendors\\vendor-orders\\vendor-orders.component.ts", lineNumber: 41 });
})();

// src/app/features/vendors/vendor-finance/vendor-finance.component.ts
function VendorFinanceComponent_div_2_span_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 54);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const kpi_r1 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(kpi_r1.trendIcon);
  }
}
function VendorFinanceComponent_div_2_span_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const kpi_r1 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(kpi_r1.trend);
  }
}
function VendorFinanceComponent_div_2_span_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 55);
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "translate");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const kpi_r1 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(2, 1, kpi_r1.trendKey));
  }
}
function VendorFinanceComponent_div_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 44)(1, "div", 45)(2, "span", 46);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p", 47);
    \u0275\u0275text(5);
    \u0275\u0275pipe(6, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "p", 48);
    \u0275\u0275text(8);
    \u0275\u0275elementStart(9, "span", 49);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "p", 50);
    \u0275\u0275template(12, VendorFinanceComponent_div_2_span_12_Template, 2, 1, "span", 51)(13, VendorFinanceComponent_div_2_span_13_Template, 2, 1, "span", 52)(14, VendorFinanceComponent_div_2_span_14_Template, 3, 3, "span", 53);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const kpi_r1 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275property("ngClass", kpi_r1.iconBgClass);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(kpi_r1.icon);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 10, kpi_r1.titleKey));
    \u0275\u0275advance(2);
    \u0275\u0275property("ngClass", kpi_r1.id === "available" ? "text-green-600" : "text-gray-900");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", kpi_r1.value, " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(kpi_r1.unit);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", kpi_r1.trendClass);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", kpi_r1.trendIcon);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", kpi_r1.trend);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", kpi_r1.trendKey);
  }
}
function VendorFinanceComponent_tr_108_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr", 56)(1, "td", 57);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "td", 58);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "td", 59);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "td", 57);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "td", 60)(10, "span", 61);
    \u0275\u0275text(11);
    \u0275\u0275pipe(12, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "td", 62);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const settlement_r2 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(settlement_r2.settlementId);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(settlement_r2.period);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", settlement_r2.total, " SAR");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", settlement_r2.net, " SAR");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngClass", settlement_r2.statusClass);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(12, 7, settlement_r2.statusKey), " ");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(settlement_r2.date);
  }
}
function VendorFinanceComponent_div_148_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 63)(1, "span", 64);
    \u0275\u0275text(2, "error");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div")(4, "p", 65);
    \u0275\u0275text(5);
    \u0275\u0275pipe(6, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "p", 66);
    \u0275\u0275text(8);
    \u0275\u0275pipe(9, "translate");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const alert_r3 = ctx.$implicit;
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate2(" ", \u0275\u0275pipeBind1(6, 3, alert_r3.titleKey), " - ", alert_r3.settlementId, " ");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(9, 5, alert_r3.descriptionKey), " ");
  }
}
var VendorFinanceComponent = class _VendorFinanceComponent {
  translate;
  route;
  tabChange = new EventEmitter();
  vendorId = "VND-9928";
  currentLang = "ar";
  isRTL = true;
  kpis = [
    {
      id: "total_sales",
      titleKey: "VENDOR_FINANCE.KPI.TOTAL_SALES",
      value: "15,000",
      unit: "SAR",
      icon: "point_of_sale",
      iconBgClass: "bg-primary/10 text-primary",
      trend: "+5%",
      trendKey: "VENDOR_FINANCE.KPI.FROM_LAST_MONTH",
      trendIcon: "trending_up",
      trendClass: "text-green-600"
    },
    {
      id: "net_sales",
      titleKey: "VENDOR_FINANCE.KPI.NET_SALES",
      value: "14,250",
      unit: "SAR",
      icon: "account_balance_wallet",
      iconBgClass: "bg-primary/10 text-primary",
      trend: "+3%",
      trendKey: "VENDOR_FINANCE.KPI.INCREASE",
      trendIcon: "trending_up",
      trendClass: "text-green-600"
    },
    {
      id: "commissions",
      titleKey: "VENDOR_FINANCE.KPI.TOTAL_COMMISSIONS",
      value: "750",
      unit: "SAR",
      icon: "percent",
      iconBgClass: "bg-orange-50 text-orange-500",
      trend: "-2%",
      trendKey: "VENDOR_FINANCE.KPI.DECREASE",
      trendIcon: "trending_down",
      trendClass: "text-red-600"
    },
    {
      id: "available",
      titleKey: "VENDOR_FINANCE.KPI.AVAILABLE_BALANCE",
      value: "5,000",
      unit: "SAR",
      icon: "payments",
      iconBgClass: "bg-green-50 text-green-500",
      trend: "+10%",
      trendKey: "VENDOR_FINANCE.KPI.INCREASE",
      trendIcon: "trending_up",
      trendClass: "text-green-600"
    },
    {
      id: "pending",
      titleKey: "VENDOR_FINANCE.KPI.PENDING_BALANCE",
      value: "2,000",
      unit: "SAR",
      icon: "pending_actions",
      iconBgClass: "bg-amber-50 text-amber-500",
      trend: "-1%",
      trendKey: "VENDOR_FINANCE.KPI.DECREASE",
      trendIcon: "trending_down",
      trendClass: "text-red-600"
    },
    {
      id: "last_payment",
      titleKey: "VENDOR_FINANCE.KPI.LAST_PAYMENT",
      value: "1,000",
      unit: "SAR",
      icon: "history",
      iconBgClass: "bg-primary/10 text-primary",
      trend: "12 \u0645\u0627\u064A\u0648 2024",
      trendKey: "",
      trendIcon: "",
      trendClass: "text-gray-500"
    }
  ];
  financialSummary = {
    sales: "20,000",
    returns: "-1,000",
    discounts: "-500",
    commissions: "-1,000",
    netTotal: "17,500"
  };
  bankInfo = {
    bankName: "Al Rajhi Bank",
    iban: "SA** **** **** 1234",
    paymentCycle: "\u0623\u0633\u0628\u0648\u0639\u064A\u0629"
  };
  settlements = [
    {
      id: "1",
      settlementId: "SET-001",
      period: "Jan 2024",
      total: "5,000",
      net: "4,750",
      statusKey: "VENDOR_FINANCE.STATUS.COMPLETED",
      statusClass: "bg-green-100 text-green-800 border-green-200",
      date: "2024-01-31"
    },
    {
      id: "2",
      settlementId: "SET-002",
      period: "Feb 2024",
      total: "6,000",
      net: "5,700",
      statusKey: "VENDOR_FINANCE.STATUS.COMPLETED",
      statusClass: "bg-green-100 text-green-800 border-green-200",
      date: "2024-02-28"
    },
    {
      id: "3",
      settlementId: "SET-003",
      period: "Mar 2024",
      total: "4,000",
      net: "3,800",
      statusKey: "VENDOR_FINANCE.STATUS.PENDING",
      statusClass: "bg-amber-100 text-amber-800 border-amber-200",
      date: "2024-03-31"
    },
    {
      id: "4",
      settlementId: "SET-004",
      period: "Apr 2024",
      total: "7,000",
      net: "6,650",
      statusKey: "VENDOR_FINANCE.STATUS.PENDING",
      statusClass: "bg-amber-100 text-amber-800 border-amber-200",
      date: "2024-04-30"
    }
  ];
  invoices = [
    {
      id: "1",
      invoiceNumber: "INV-293",
      date: "10 \u0645\u0627\u064A\u0648",
      amount: "1,200",
      statusKey: "VENDOR_FINANCE.INVOICE_STATUS.PAID",
      statusClass: "bg-green-100 text-green-700"
    },
    {
      id: "2",
      invoiceNumber: "INV-294",
      date: "12 \u0645\u0627\u064A\u0648",
      amount: "850",
      statusKey: "VENDOR_FINANCE.INVOICE_STATUS.PENDING",
      statusClass: "bg-amber-100 text-amber-700"
    }
  ];
  alerts = [
    {
      id: "1",
      titleKey: "VENDOR_FINANCE.ALERTS.PENDING_PAYMENT",
      descriptionKey: "VENDOR_FINANCE.ALERTS.PENDING_PAYMENT_DESC",
      settlementId: "SET-003"
    }
  ];
  constructor(translate, route) {
    this.translate = translate;
    this.route = route;
    this.currentLang = this.translate.currentLang || "ar";
    this.isRTL = this.currentLang === "ar";
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.isRTL = event.lang === "ar";
    });
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.vendorId = params["id"];
      }
    });
  }
  onCreateSettlement() {
    console.log("Create settlement");
  }
  onDownloadStatement() {
    console.log("Download financial statement");
  }
  onReviewPayments() {
    console.log("Review payments");
  }
  onViewMoreSettlements() {
    console.log("View more settlements");
  }
  onViewAllInvoices() {
    console.log("View all invoices");
  }
  onFilterSettlements() {
    console.log("Filter settlements");
  }
  onSettlementOptions() {
    console.log("Settlement options");
  }
  static \u0275fac = function VendorFinanceComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _VendorFinanceComponent)(\u0275\u0275directiveInject(TranslateService), \u0275\u0275directiveInject(ActivatedRoute));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _VendorFinanceComponent, selectors: [["app-vendor-finance"]], outputs: { tabChange: "tabChange" }, standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 149, vars: 81, consts: [[1, "flex", "flex-col", "gap-6"], [1, "grid", "grid-cols-2", "md:grid-cols-3", "lg:grid-cols-6", "gap-4"], ["class", "flex flex-col gap-3 rounded-xl p-5 border border-gray-200 bg-white shadow-sm hover:border-primary/30 transition-colors", 4, "ngFor", "ngForOf"], [1, "grid", "grid-cols-1", "lg:grid-cols-12", "gap-6"], [1, "lg:col-span-3", "flex", "flex-col", "gap-6"], [1, "bg-white", "rounded-xl", "border", "border-gray-200", "shadow-sm", "p-5"], [1, "text-gray-900", "font-bold", "mb-4", "flex", "items-center", "gap-2"], [1, "material-symbols-outlined", "text-primary"], [1, "flex", "flex-col", "gap-3"], [1, "flex", "justify-between", "items-center", "py-2", "border-b", "border-gray-100", "last:border-0"], [1, "text-gray-500", "text-xs"], [1, "text-gray-900", "text-sm", "font-medium"], [1, "text-red-600", "text-sm", "font-medium"], [1, "text-orange-500", "text-sm", "font-medium"], [1, "flex", "justify-between", "items-center", "pt-2", "mt-1"], [1, "text-gray-700", "text-sm", "font-bold"], [1, "text-base", "font-bold", "text-primary"], [1, "flex", "flex-col", "gap-4"], [1, "text-gray-500", "text-xs", "mb-1"], ["dir", "ltr", 1, "text-gray-900", "text-sm", "font-medium", "font-mono"], [1, "inline-block", "bg-primary/10", "text-primary", "text-xs", "px-2", "py-1", "rounded", "font-medium"], [1, "lg:col-span-6", "flex", "flex-col", "gap-6"], [1, "bg-white", "rounded-xl", "border", "border-gray-200", "shadow-sm", "overflow-hidden", "flex", "flex-col"], [1, "p-5", "border-b", "border-gray-200", "flex", "justify-between", "items-center"], [1, "text-gray-900", "font-bold", "flex", "items-center", "gap-2"], [1, "flex", "gap-2"], [1, "text-gray-500", "hover:text-primary", "transition-colors", 3, "click"], [1, "material-symbols-outlined", "text-sm"], [1, "overflow-x-auto"], [1, "w-full", "border-collapse"], [1, "bg-gray-50", "border-b", "border-gray-200"], [1, "px-4", "py-3", "text-gray-500", "text-xs", "font-semibold"], [1, "text-sm"], ["class", "border-b border-gray-100 hover:bg-gray-50 transition-colors", 4, "ngFor", "ngForOf"], [1, "p-3", "border-t", "border-gray-200", "flex", "justify-center"], [1, "text-primary", "text-sm", "font-medium", "hover:underline", 3, "click"], [1, "w-full", "flex", "items-center", "justify-center", "gap-2", "bg-primary", "hover:bg-primary/90", "text-gray-900", "font-bold", "py-2.5", "px-4", "rounded-lg", "transition-colors", "text-sm", 3, "click"], [1, "material-symbols-outlined", "text-[18px]"], [1, "w-full", "flex", "items-center", "justify-center", "gap-2", "bg-gray-100", "hover:bg-gray-200", "text-gray-800", "font-medium", "py-2.5", "px-4", "rounded-lg", "border", "border-gray-200", "transition-colors", "text-sm", 3, "click"], [1, "bg-red-50", "rounded-xl", "border", "border-red-200", "p-5"], [1, "text-red-700", "font-bold", "mb-3", "flex", "items-center", "gap-2", "text-sm"], [1, "material-symbols-outlined"], [1, "flex", "flex-col", "gap-2"], ["class", "bg-white/60 p-3 rounded border border-red-100 flex gap-3 items-start", 4, "ngFor", "ngForOf"], [1, "flex", "flex-col", "gap-3", "rounded-xl", "p-5", "border", "border-gray-200", "bg-white", "shadow-sm", "hover:border-primary/30", "transition-colors"], [1, "flex", "items-center", "gap-2"], [1, "material-symbols-outlined", "text-sm", "p-1", "rounded", 3, "ngClass"], [1, "text-gray-500", "text-xs", "font-semibold"], [1, "text-xl", "font-bold", 3, "ngClass"], [1, "text-sm", "font-normal", "text-gray-500"], [1, "text-xs", "font-medium", "flex", "items-center", "gap-1", 3, "ngClass"], ["class", "material-symbols-outlined text-[14px]", 4, "ngIf"], [4, "ngIf"], ["class", "text-gray-400 font-normal", 4, "ngIf"], [1, "material-symbols-outlined", "text-[14px]"], [1, "text-gray-400", "font-normal"], [1, "border-b", "border-gray-100", "hover:bg-gray-50", "transition-colors"], [1, "px-4", "py-3", "text-gray-900", "font-medium"], [1, "px-4", "py-3", "text-gray-600", "text-xs"], [1, "px-4", "py-3", "text-gray-600"], [1, "px-4", "py-3"], [1, "inline-flex", "items-center", "justify-center", "px-2.5", "py-1", "rounded", "text-[11px]", "font-medium", "border", 3, "ngClass"], [1, "px-4", "py-3", "text-gray-500", "text-xs"], [1, "bg-white/60", "p-3", "rounded", "border", "border-red-100", "flex", "gap-3", "items-start"], [1, "material-symbols-outlined", "text-red-500", "text-[18px]", "mt-0.5"], [1, "text-gray-800", "text-xs", "font-bold"], [1, "text-gray-600", "text-[11px]", "mt-1"]], template: function VendorFinanceComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1);
      \u0275\u0275template(2, VendorFinanceComponent_div_2_Template, 15, 12, "div", 2);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(3, "div", 3)(4, "div", 4)(5, "div", 5)(6, "h3", 6)(7, "span", 7);
      \u0275\u0275text(8, "analytics");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "span");
      \u0275\u0275text(10);
      \u0275\u0275pipe(11, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(12, "div", 8)(13, "div", 9)(14, "span", 10);
      \u0275\u0275text(15);
      \u0275\u0275pipe(16, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(17, "span", 11);
      \u0275\u0275text(18);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(19, "div", 9)(20, "span", 10);
      \u0275\u0275text(21);
      \u0275\u0275pipe(22, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(23, "span", 12);
      \u0275\u0275text(24);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(25, "div", 9)(26, "span", 10);
      \u0275\u0275text(27);
      \u0275\u0275pipe(28, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(29, "span", 13);
      \u0275\u0275text(30);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(31, "div", 9)(32, "span", 10);
      \u0275\u0275text(33);
      \u0275\u0275pipe(34, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(35, "span", 12);
      \u0275\u0275text(36);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(37, "div", 14)(38, "span", 15);
      \u0275\u0275text(39);
      \u0275\u0275pipe(40, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(41, "span", 16);
      \u0275\u0275text(42);
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(43, "div", 5)(44, "h3", 6)(45, "span", 7);
      \u0275\u0275text(46, "account_balance");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(47, "span");
      \u0275\u0275text(48);
      \u0275\u0275pipe(49, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(50, "div", 17)(51, "div")(52, "p", 18);
      \u0275\u0275text(53);
      \u0275\u0275pipe(54, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(55, "p", 11);
      \u0275\u0275text(56);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(57, "div")(58, "p", 18);
      \u0275\u0275text(59);
      \u0275\u0275pipe(60, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(61, "p", 19);
      \u0275\u0275text(62);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(63, "div")(64, "p", 18);
      \u0275\u0275text(65);
      \u0275\u0275pipe(66, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(67, "span", 20);
      \u0275\u0275text(68);
      \u0275\u0275elementEnd()()()()();
      \u0275\u0275elementStart(69, "div", 21)(70, "div", 22)(71, "div", 23)(72, "h3", 24)(73, "span", 7);
      \u0275\u0275text(74, "list_alt");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(75, "span");
      \u0275\u0275text(76);
      \u0275\u0275pipe(77, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(78, "div", 25)(79, "button", 26);
      \u0275\u0275listener("click", function VendorFinanceComponent_Template_button_click_79_listener() {
        return ctx.onFilterSettlements();
      });
      \u0275\u0275elementStart(80, "span", 27);
      \u0275\u0275text(81, "filter_list");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(82, "button", 26);
      \u0275\u0275listener("click", function VendorFinanceComponent_Template_button_click_82_listener() {
        return ctx.onSettlementOptions();
      });
      \u0275\u0275elementStart(83, "span", 27);
      \u0275\u0275text(84, "more_vert");
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(85, "div", 28)(86, "table", 29)(87, "thead")(88, "tr", 30)(89, "th", 31);
      \u0275\u0275text(90);
      \u0275\u0275pipe(91, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(92, "th", 31);
      \u0275\u0275text(93);
      \u0275\u0275pipe(94, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(95, "th", 31);
      \u0275\u0275text(96);
      \u0275\u0275pipe(97, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(98, "th", 31);
      \u0275\u0275text(99);
      \u0275\u0275pipe(100, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(101, "th", 31);
      \u0275\u0275text(102);
      \u0275\u0275pipe(103, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(104, "th", 31);
      \u0275\u0275text(105);
      \u0275\u0275pipe(106, "translate");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(107, "tbody", 32);
      \u0275\u0275template(108, VendorFinanceComponent_tr_108_Template, 15, 9, "tr", 33);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(109, "div", 34)(110, "button", 35);
      \u0275\u0275listener("click", function VendorFinanceComponent_Template_button_click_110_listener() {
        return ctx.onViewMoreSettlements();
      });
      \u0275\u0275text(111);
      \u0275\u0275pipe(112, "translate");
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(113, "div", 4)(114, "div", 5)(115, "h3", 6)(116, "span", 7);
      \u0275\u0275text(117, "touch_app");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(118, "span");
      \u0275\u0275text(119);
      \u0275\u0275pipe(120, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(121, "div", 8)(122, "button", 36);
      \u0275\u0275listener("click", function VendorFinanceComponent_Template_button_click_122_listener() {
        return ctx.onCreateSettlement();
      });
      \u0275\u0275elementStart(123, "span", 37);
      \u0275\u0275text(124, "add_circle");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(125, "span");
      \u0275\u0275text(126);
      \u0275\u0275pipe(127, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(128, "button", 38);
      \u0275\u0275listener("click", function VendorFinanceComponent_Template_button_click_128_listener() {
        return ctx.onDownloadStatement();
      });
      \u0275\u0275elementStart(129, "span", 37);
      \u0275\u0275text(130, "download");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(131, "span");
      \u0275\u0275text(132);
      \u0275\u0275pipe(133, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(134, "button", 38);
      \u0275\u0275listener("click", function VendorFinanceComponent_Template_button_click_134_listener() {
        return ctx.onReviewPayments();
      });
      \u0275\u0275elementStart(135, "span", 37);
      \u0275\u0275text(136, "fact_check");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(137, "span");
      \u0275\u0275text(138);
      \u0275\u0275pipe(139, "translate");
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(140, "div", 39)(141, "h3", 40)(142, "span", 41);
      \u0275\u0275text(143, "warning");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(144, "span");
      \u0275\u0275text(145);
      \u0275\u0275pipe(146, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(147, "div", 42);
      \u0275\u0275template(148, VendorFinanceComponent_div_148_Template, 10, 7, "div", 43);
      \u0275\u0275elementEnd()()()()();
    }
    if (rf & 2) {
      \u0275\u0275attribute("dir", ctx.isRTL ? "rtl" : "ltr");
      \u0275\u0275advance(2);
      \u0275\u0275property("ngForOf", ctx.kpis);
      \u0275\u0275advance(8);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(11, 35, "VENDOR_FINANCE.FINANCIAL_SUMMARY"));
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(16, 37, "VENDOR_FINANCE.SALES"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1("", ctx.financialSummary.sales, " SAR");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(22, 39, "VENDOR_FINANCE.RETURNS"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1("", ctx.financialSummary.returns, " SAR");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(28, 41, "VENDOR_FINANCE.DISCOUNTS"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1("", ctx.financialSummary.discounts, " SAR");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(34, 43, "VENDOR_FINANCE.PLATFORM_COMMISSIONS"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1("", ctx.financialSummary.commissions, " SAR");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(40, 45, "VENDOR_FINANCE.NET_TOTAL"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1("", ctx.financialSummary.netTotal, " SAR");
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(49, 47, "VENDOR_FINANCE.TRANSFER_INFO"));
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(54, 49, "VENDOR_FINANCE.BANK"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.bankInfo.bankName);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(60, 51, "VENDOR_FINANCE.IBAN"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.bankInfo.iban);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(66, 53, "VENDOR_FINANCE.PAYMENT_CYCLE"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", ctx.bankInfo.paymentCycle, " ");
      \u0275\u0275advance(8);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(77, 55, "VENDOR_FINANCE.SETTLEMENTS"));
      \u0275\u0275advance(14);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(91, 57, "VENDOR_FINANCE.TABLE.SETTLEMENT_ID"), " ");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(94, 59, "VENDOR_FINANCE.TABLE.PERIOD"), " ");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(97, 61, "VENDOR_FINANCE.TABLE.TOTAL"), " ");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(100, 63, "VENDOR_FINANCE.TABLE.NET"), " ");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(103, 65, "VENDOR_FINANCE.TABLE.STATUS"), " ");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(106, 67, "VENDOR_FINANCE.TABLE.DATE"), " ");
      \u0275\u0275advance(3);
      \u0275\u0275property("ngForOf", ctx.settlements);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(112, 69, "VENDOR_FINANCE.VIEW_MORE"), " ");
      \u0275\u0275advance(8);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(120, 71, "VENDOR_FINANCE.FINANCIAL_ACTIONS"));
      \u0275\u0275advance(7);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(127, 73, "VENDOR_FINANCE.ACTIONS.CREATE_SETTLEMENT"));
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(133, 75, "VENDOR_FINANCE.ACTIONS.DOWNLOAD_STATEMENT"));
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(139, 77, "VENDOR_FINANCE.ACTIONS.REVIEW_PAYMENTS"));
      \u0275\u0275advance(7);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(146, 79, "VENDOR_FINANCE.FINANCIAL_ALERTS"));
      \u0275\u0275advance(3);
      \u0275\u0275property("ngForOf", ctx.alerts);
    }
  }, dependencies: [CommonModule, NgClass, NgForOf, NgIf, FormsModule, TranslateModule, TranslatePipe], encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(VendorFinanceComponent, { className: "VendorFinanceComponent", filePath: "src\\app\\features\\vendors\\vendor-finance\\vendor-finance.component.ts", lineNumber: 46 });
})();

// src/app/features/vendors/vendor-detail/vendor-detail.component.ts
function VendorDetailComponent_div_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div")(1, "app-vendor-overview", 5);
    \u0275\u0275listener("tabChange", function VendorDetailComponent_div_4_Template_app_vendor_overview_tabChange_1_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onTabChange($event));
    });
    \u0275\u0275elementEnd()();
  }
}
function VendorDetailComponent_div_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div")(1, "div", 2)(2, "div", 6)(3, "div", 7)(4, "div", 8)(5, "div", 9)(6, "div", 10);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(7, "svg", 11);
    \u0275\u0275element(8, "path", 12);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(9, "h3", 13);
    \u0275\u0275text(10);
    \u0275\u0275pipe(11, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(12, "div", 14)(13, "div", 15);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(14, "svg", 16);
    \u0275\u0275element(15, "circle", 17)(16, "circle", 18);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(17, "div", 19)(18, "span", 20);
    \u0275\u0275text(19);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(20, "p", 21);
    \u0275\u0275text(21);
    \u0275\u0275pipe(22, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(23, "div", 22)(24, "div", 23)(25, "span", 21);
    \u0275\u0275text(26);
    \u0275\u0275pipe(27, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "div", 24);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(29, "svg", 25);
    \u0275\u0275element(30, "path", 26);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(31, "span", 27);
    \u0275\u0275text(32);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(33, "div", 23)(34, "span", 21);
    \u0275\u0275text(35);
    \u0275\u0275pipe(36, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(37, "div", 24);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(38, "svg", 25);
    \u0275\u0275element(39, "path", 28);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(40, "span", 27);
    \u0275\u0275text(41, "\u0623\u062D\u0645\u062F \u0645\u062D\u0645\u062F (Admin 1)");
    \u0275\u0275elementEnd()()()()();
    \u0275\u0275elementStart(42, "div", 29)(43, "div", 30)(44, "div", 9)(45, "div", 31);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(46, "svg", 32);
    \u0275\u0275element(47, "path", 33);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(48, "h3", 34);
    \u0275\u0275text(49);
    \u0275\u0275pipe(50, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(51, "button", 35);
    \u0275\u0275listener("click", function VendorDetailComponent_div_5_Template_button_click_51_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onEditClick("data"));
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(52, "svg", 36);
    \u0275\u0275element(53, "path", 37);
    \u0275\u0275elementEnd()()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(54, "div", 38)(55, "div")(56, "div", 39);
    \u0275\u0275text(57);
    \u0275\u0275pipe(58, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(59, "div", 40);
    \u0275\u0275text(60, "\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u062A\u0642\u0646\u064A\u0629 \u0627\u0644\u062D\u062F\u064A\u062B\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(61, "div", 41)(62, "div")(63, "div", 39);
    \u0275\u0275text(64);
    \u0275\u0275pipe(65, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(66, "div", 42);
    \u0275\u0275text(67, "\u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(68, "div")(69, "div", 39);
    \u0275\u0275text(70);
    \u0275\u0275pipe(71, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(72, "div", 42);
    \u0275\u0275text(73, "\u0627\u0644\u0631\u064A\u0627\u0636");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(74, "div")(75, "div", 39);
    \u0275\u0275text(76);
    \u0275\u0275pipe(77, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(78, "div", 42);
    \u0275\u0275text(79, "7233 \u0637\u0631\u064A\u0642 \u0627\u0644\u0645\u0644\u0643 \u0641\u0647\u062F \u0628\u0646 \u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632\u060C \u0627\u0644\u0631\u064A\u0627\u0636 13525");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(80, "div", 41)(81, "div")(82, "div", 39);
    \u0275\u0275text(83);
    \u0275\u0275pipe(84, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(85, "div", 42);
    \u0275\u0275text(86);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(87, "div")(88, "div", 39);
    \u0275\u0275text(89);
    \u0275\u0275pipe(90, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(91, "div", 42);
    \u0275\u0275text(92);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(93, "div", 43)(94, "button", 44);
    \u0275\u0275listener("click", function VendorDetailComponent_div_5_Template_button_click_94_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onViewDetailsClick());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(95, "svg", 45);
    \u0275\u0275element(96, "path", 46);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(97, "span");
    \u0275\u0275text(98);
    \u0275\u0275pipe(99, "translate");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(100, "div", 29)(101, "div", 30)(102, "div", 9)(103, "div", 47);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(104, "svg", 48);
    \u0275\u0275element(105, "path", 28);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(106, "h3", 34);
    \u0275\u0275text(107);
    \u0275\u0275pipe(108, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(109, "button", 35);
    \u0275\u0275listener("click", function VendorDetailComponent_div_5_Template_button_click_109_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onEditClick("store"));
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(110, "svg", 36);
    \u0275\u0275element(111, "path", 37);
    \u0275\u0275elementEnd()()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(112, "div", 38)(113, "div")(114, "div", 39);
    \u0275\u0275text(115);
    \u0275\u0275pipe(116, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(117, "div", 40);
    \u0275\u0275text(118, "\u0639\u0628\u062F\u0627\u0644\u0644\u0647 \u0628\u0646 \u062E\u0627\u0644\u062F \u0628\u0646 \u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(119, "div", 41)(120, "div")(121, "div", 39);
    \u0275\u0275text(122);
    \u0275\u0275pipe(123, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(124, "div", 42);
    \u0275\u0275text(125, "\u0633\u0639\u0648\u062F\u064A");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(126, "div")(127, "div", 39);
    \u0275\u0275text(128);
    \u0275\u0275pipe(129, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(130, "div", 42);
    \u0275\u0275text(131, "10***4321");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(132, "div")(133, "div", 39);
    \u0275\u0275text(134);
    \u0275\u0275pipe(135, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(136, "div", 42);
    \u0275\u0275text(137);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(138, "div")(139, "div", 39);
    \u0275\u0275text(140);
    \u0275\u0275pipe(141, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(142, "div", 42);
    \u0275\u0275text(143);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(144, "div")(145, "div", 39);
    \u0275\u0275text(146);
    \u0275\u0275pipe(147, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(148, "div", 42);
    \u0275\u0275text(149);
    \u0275\u0275elementEnd()()()()();
    \u0275\u0275elementStart(150, "div", 49)(151, "div", 7)(152, "div", 8)(153, "div", 9)(154, "div", 50);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(155, "svg", 51);
    \u0275\u0275element(156, "path", 52);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(157, "h3", 13);
    \u0275\u0275text(158);
    \u0275\u0275pipe(159, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(160, "button", 53);
    \u0275\u0275listener("click", function VendorDetailComponent_div_5_Template_button_click_160_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onGenerateReportClick());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(161, "svg", 36);
    \u0275\u0275element(162, "path", 52);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(163, "span");
    \u0275\u0275text(164);
    \u0275\u0275pipe(165, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(166, "div", 7)(167, "div", 8)(168, "div", 9)(169, "div", 47);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(170, "svg", 54);
    \u0275\u0275element(171, "path", 52);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(172, "h3", 13);
    \u0275\u0275text(173);
    \u0275\u0275pipe(174, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(175, "span", 55);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(176, "svg", 56);
    \u0275\u0275element(177, "path", 57);
    \u0275\u0275elementEnd();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(178, "span");
    \u0275\u0275text(179);
    \u0275\u0275pipe(180, "translate");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(181, "div", 58)(182, "div", 59)(183, "div")(184, "div", 60);
    \u0275\u0275text(185);
    \u0275\u0275pipe(186, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(187, "div", 61);
    \u0275\u0275text(188);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(189, "div")(190, "div", 60);
    \u0275\u0275text(191);
    \u0275\u0275pipe(192, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(193, "div", 61);
    \u0275\u0275text(194);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(195, "div")(196, "div", 60);
    \u0275\u0275text(197);
    \u0275\u0275pipe(198, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(199, "div", 61);
    \u0275\u0275text(200);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(201, "div")(202, "div", 60);
    \u0275\u0275text(203);
    \u0275\u0275pipe(204, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(205, "div", 61);
    \u0275\u0275text(206);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(207, "div", 62)(208, "div", 60);
    \u0275\u0275text(209);
    \u0275\u0275pipe(210, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(211, "div", 61);
    \u0275\u0275text(212);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(213, "div", 7)(214, "div", 8)(215, "div", 9)(216, "div", 47);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(217, "svg", 54);
    \u0275\u0275element(218, "path", 63);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(219, "h3", 13);
    \u0275\u0275text(220);
    \u0275\u0275pipe(221, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(222, "button", 35);
    \u0275\u0275listener("click", function VendorDetailComponent_div_5_Template_button_click_222_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onEditClick("banking"));
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(223, "svg", 36);
    \u0275\u0275element(224, "path", 37);
    \u0275\u0275elementEnd()()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(225, "div", 58)(226, "div", 64)(227, "div")(228, "div", 60);
    \u0275\u0275text(229);
    \u0275\u0275pipe(230, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(231, "div", 61);
    \u0275\u0275text(232);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(233, "div")(234, "div", 60);
    \u0275\u0275text(235);
    \u0275\u0275pipe(236, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(237, "div", 61);
    \u0275\u0275text(238);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(239, "div")(240, "div", 60);
    \u0275\u0275text(241);
    \u0275\u0275pipe(242, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(243, "div", 61);
    \u0275\u0275text(244);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(245, "div")(246, "div", 60);
    \u0275\u0275text(247, "IBAN");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(248, "div", 61);
    \u0275\u0275text(249);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(250, "div", 65);
    \u0275\u0275element(251, "div", 66)(252, "div", 67);
    \u0275\u0275elementStart(253, "div", 68)(254, "div", 69)(255, "div", 70);
    \u0275\u0275text(256);
    \u0275\u0275pipe(257, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(258, "div", 71)(259, "span");
    \u0275\u0275text(260, "\u2022\u2022\u2022\u2022");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(261, "span");
    \u0275\u0275text(262, "\u2022\u2022\u2022\u2022");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(263, "span");
    \u0275\u0275text(264, "\u2022\u2022\u2022\u2022");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(265, "span");
    \u0275\u0275text(266, "5890");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(267, "div", 72)(268, "div")(269, "div", 73);
    \u0275\u0275text(270);
    \u0275\u0275pipe(271, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(272, "div", 74);
    \u0275\u0275text(273);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(274, "div")(275, "div", 73);
    \u0275\u0275text(276);
    \u0275\u0275pipe(277, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(278, "div", 74);
    \u0275\u0275text(279);
    \u0275\u0275elementEnd()()()()()()()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(10);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(11, 54, "VENDOR_DETAIL.DATA_MANAGEMENT_SUMMARY"));
    \u0275\u0275advance(6);
    \u0275\u0275attribute("stroke-dashoffset", 314 - 314 * ctx_r1.progressPercentage / 100);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", ctx_r1.progressPercentage, "%");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(22, 56, "VENDOR_DETAIL.COMPLETION_RATE"));
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(27, 58, "VENDOR_DETAIL.LAST_UPDATE"));
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(ctx_r1.storeData.lastUpdate);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(36, 60, "VENDOR_DETAIL.BY"));
    \u0275\u0275advance(14);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(50, 62, "VENDOR_DETAIL.STORE_DATA"));
    \u0275\u0275advance(8);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(58, 64, "VENDOR_DETAIL.STORE_NAME"));
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(65, 66, "VENDOR_DETAIL.STATUS"));
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(71, 68, "VENDOR_DETAIL.LOCATION_CITY"));
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(77, 70, "VENDOR_DETAIL.ADDRESS"));
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(84, 72, "VENDOR_DETAIL.JOIN_DATE"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.storeData.joinDate);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(90, 74, "VENDOR_DETAIL.COMPLETION"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.storeData.completionRate);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(99, 76, "VENDOR_DETAIL.VIEW_FULL_DETAILS"));
    \u0275\u0275advance(9);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(108, 78, "VENDOR_DETAIL.PROFILE_DATA"));
    \u0275\u0275advance(8);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(116, 80, "VENDOR_DETAIL.OWNER_NAME"));
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(123, 82, "VENDOR_DETAIL.ID_RESIDENCE"));
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(129, 84, "VENDOR_DETAIL.ID_NUMBER"));
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(135, 86, "VENDOR_DETAIL.EMAIL"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.storeData.email);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(141, 88, "VENDOR_DETAIL.MOBILE"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.storeData.phone);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(147, 90, "VENDOR_DETAIL.COMPLETION"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.storeData.completionRate);
    \u0275\u0275advance(9);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(159, 92, "VENDOR_DETAIL.FINANCIAL_REPORTS"));
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(165, 94, "VENDOR_DETAIL.GENERATE_REPORT"));
    \u0275\u0275advance(9);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(174, 96, "VENDOR_DETAIL.LEGAL_DATA"));
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(180, 98, "VENDOR_DETAIL.STATUS_VERIFIED"));
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(186, 100, "VENDOR_DETAIL.COMMERCIAL_REG"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.legalDocuments.commercialRegister);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(192, 102, "VENDOR_DETAIL.TAX_ID"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.legalDocuments.taxNumber);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(198, 104, "VENDOR_DETAIL.LICENSE_NUMBER"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.legalDocuments.licenseNumber);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(204, 106, "VENDOR_DETAIL.LEGAL_ENTITY"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.legalDocuments.establishmentName);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(210, 108, "VENDOR_DETAIL.EXPIRY_DATE"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.bankingData.expiryDate);
    \u0275\u0275advance(8);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(221, 110, "VENDOR_DETAIL.BANKING_DATA"));
    \u0275\u0275advance(9);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(230, 112, "VENDOR_DETAIL.ACCOUNT_HOLDER"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.bankingData.accountHolder);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(236, 114, "VENDOR_DETAIL.ACCOUNT_NUMBER"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.bankingData.accountNumber);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(242, 116, "VENDOR_DETAIL.BANK_NAME"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.bankingData.bankName);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r1.bankingData.iban);
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(257, 118, "VENDOR_DETAIL.CARD_NUMBER"));
    \u0275\u0275advance(14);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(271, 120, "VENDOR_DETAIL.VALID_UNTIL"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.bankingData.expiryDate);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(277, 122, "VENDOR_DETAIL.SWIFT_CODE"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.bankingData.swiftCode);
  }
}
function VendorDetailComponent_div_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div");
    \u0275\u0275element(1, "app-vendor-products");
    \u0275\u0275elementEnd();
  }
}
function VendorDetailComponent_div_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div");
    \u0275\u0275element(1, "app-vendor-orders");
    \u0275\u0275elementEnd();
  }
}
function VendorDetailComponent_div_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div")(1, "app-vendor-finance", 5);
    \u0275\u0275listener("tabChange", function VendorDetailComponent_div_8_Template_app_vendor_finance_tabChange_1_listener($event) {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onTabChange($event));
    });
    \u0275\u0275elementEnd()();
  }
}
function VendorDetailComponent_div_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div");
    \u0275\u0275element(1, "app-vendor-compliance");
    \u0275\u0275elementEnd();
  }
}
function VendorDetailComponent_div_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div");
    \u0275\u0275element(1, "app-vendor-activity-log");
    \u0275\u0275elementEnd();
  }
}
var VendorDetailComponent = class _VendorDetailComponent {
  translate;
  currentTab = "overview";
  currentLang = "ar";
  isRTL = true;
  storeData = {
    name: "\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u062A\u0642\u0646\u064A\u0629 \u0627\u0644\u062D\u062F\u064A\u062B\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629",
    category: "\u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A",
    location: "\u0627\u0644\u0631\u064A\u0627\u0636",
    phone: "+966 50 123 4567",
    email: "info@moderntech.com",
    completionRate: "100%",
    joinDate: "15 Jan 2022",
    lastUpdate: "14.39.2023-18:01"
  };
  bankingData = {
    accountHolder: "\u0645\u062D\u0645\u062F \u0623\u062D\u0645\u062F",
    accountNumber: "3001234567890123",
    bankName: "\u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0623\u0647\u0644\u064A",
    iban: "SA9876543210987654321",
    swiftCode: "RJHI SASR",
    cardNumber: "5409 5000 0000 0000 1234 6789",
    expiryDate: "20 Dec 2026"
  };
  legalDocuments = {
    commercialRegister: "1010123456",
    taxNumber: "300123456789012",
    establishmentName: "\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u062A\u0642\u0646\u064A\u0629",
    licenseNumber: "L-987654"
  };
  progressPercentage = 95;
  constructor(translate) {
    this.translate = translate;
    this.currentLang = this.translate.currentLang || "ar";
    this.isRTL = this.currentLang === "ar";
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.isRTL = event.lang === "ar";
    });
  }
  onTabChange(tabId) {
    this.currentTab = tabId;
  }
  onEditClick(section) {
    console.log("Edit clicked for:", section);
  }
  onViewDetailsClick() {
    console.log("View details clicked");
  }
  onGenerateReportClick() {
    console.log("Generate report clicked");
  }
  static \u0275fac = function VendorDetailComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _VendorDetailComponent)(\u0275\u0275directiveInject(TranslateService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _VendorDetailComponent, selectors: [["app-vendor-detail"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 11, vars: 9, consts: [[3, "tabChanged"], [1, "bg-gray-50", "min-h-screen", "p-6"], [1, "max-w-7xl", "mx-auto"], [3, "ngSwitch"], [4, "ngSwitchCase"], [3, "tabChange"], [1, "grid", "grid-cols-1", "lg:grid-cols-3", "gap-5", "mb-5", "items-start"], [1, "bg-white", "rounded-xl", "shadow-sm", "border", "border-gray-100", "p-4"], [1, "flex", "items-center", "justify-between", "mb-4"], [1, "flex", "items-center", "gap-2"], [1, "w-8", "h-8", "bg-teal-500", "rounded-lg", "flex", "items-center", "justify-center"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "text-white"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"], [1, "text-sm", "font-semibold", "text-gray-700"], [1, "flex", "flex-col", "items-center", "justify-center", "py-3"], [1, "relative", "w-28", "h-28", "mb-3"], ["viewBox", "0 0 120 120", 1, "w-28", "h-28", "transform", "-rotate-90"], ["cx", "60", "cy", "60", "r", "50", "stroke", "#e5e7eb", "stroke-width", "9", "fill", "none"], ["cx", "60", "cy", "60", "r", "50", "stroke", "#14b8a6", "stroke-width", "9", "fill", "none", "stroke-dasharray", "314", "stroke-linecap", "round"], [1, "absolute", "inset-0", "flex", "items-center", "justify-center"], [1, "text-2xl", "font-bold", "text-gray-800"], [1, "text-gray-400", "text-xs"], [1, "space-y-2", "mt-4"], [1, "flex", "items-center", "justify-between"], [1, "flex", "items-center", "gap-1"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3", "h-3", "text-gray-400"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"], [1, "text-gray-700", "text-xs"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"], [1, "bg-white", "rounded-xl", "shadow-sm", "border", "border-gray-100", "p-6"], [1, "flex", "items-start", "justify-between", "mb-6"], [1, "w-8", "h-8", "bg-blue-100", "rounded-lg", "flex", "items-center", "justify-center"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "text-blue-600"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"], [1, "text-base", "font-semibold", "text-gray-900"], [1, "text-gray-400", "hover:text-gray-600", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"], [1, "space-y-3"], [1, "text-xs", "text-gray-500", "mb-1"], [1, "text-sm", "font-medium", "text-gray-900"], [1, "grid", "grid-cols-2", "gap-3"], [1, "text-sm", "text-gray-900"], [1, "mt-4", "pt-4", "border-t", "border-gray-100"], [1, "text-teal-600", "hover:text-teal-700", "text-sm", "flex", "items-center", "gap-1", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "rtl:rotate-0", "ltr:rotate-180"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15 19l-7-7 7-7"], [1, "w-8", "h-8", "bg-green-100", "rounded-lg", "flex", "items-center", "justify-center"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "text-green-600"], [1, "grid", "grid-cols-1", "lg:grid-cols-3", "gap-5", "items-start"], [1, "w-8", "h-8", "bg-orange-50", "rounded-lg", "flex", "items-center", "justify-center"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "text-orange-500"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"], [1, "bg-orange-500", "hover:bg-orange-600", "text-white", "px-4", "py-2.5", "rounded-lg", "font-medium", "transition-colors", "duration-200", "w-full", "flex", "items-center", "justify-center", "gap-2", "text-sm", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "text-green-600"], [1, "bg-green-50", "text-green-700", "px-2.5", "py-1", "rounded-lg", "text-xs", "font-medium", "flex", "items-center", "gap-1"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-3", "h-3"], ["fill-rule", "evenodd", "d", "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", "clip-rule", "evenodd"], [1, "border-t", "border-gray-100", "pt-4"], [1, "grid", "grid-cols-2", "gap-x-6", "gap-y-4"], [1, "text-gray-400", "text-xs", "mb-1"], [1, "text-gray-900", "text-sm", "font-medium"], [1, "mt-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"], [1, "grid", "grid-cols-2", "gap-x-6", "gap-y-4", "mb-4"], [1, "bg-gradient-to-br", "from-gray-700", "via-gray-800", "to-gray-900", "rounded-lg", "p-4", "text-white", "relative", "overflow-hidden"], [1, "absolute", "top-0", "inset-inline-end-0", "w-24", "h-24", "bg-white", "opacity-5", "rounded-full", "-me-12", "-mt-12"], [1, "absolute", "bottom-0", "inset-inline-start-0", "w-20", "h-20", "bg-white", "opacity-5", "rounded-full", "-ms-10", "-mb-10"], [1, "relative", "z-10"], [1, "flex", "justify-between", "items-start", "mb-6"], [1, "text-xs", "opacity-75"], ["dir", "ltr", 1, "text-sm", "font-mono", "tracking-wider", "mb-5", "flex", "gap-2"], [1, "flex", "justify-between", "items-end", "text-xs"], [1, "opacity-75", "mb-1"], [1, "font-medium"]], template: function VendorDetailComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "app-vendor-detail-header", 0);
      \u0275\u0275listener("tabChanged", function VendorDetailComponent_Template_app_vendor_detail_header_tabChanged_0_listener($event) {
        return ctx.onTabChange($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(1, "div", 1)(2, "div", 2)(3, "div", 3);
      \u0275\u0275template(4, VendorDetailComponent_div_4_Template, 2, 0, "div", 4)(5, VendorDetailComponent_div_5_Template, 280, 124, "div", 4)(6, VendorDetailComponent_div_6_Template, 2, 0, "div", 4)(7, VendorDetailComponent_div_7_Template, 2, 0, "div", 4)(8, VendorDetailComponent_div_8_Template, 2, 0, "div", 4)(9, VendorDetailComponent_div_9_Template, 2, 0, "div", 4)(10, VendorDetailComponent_div_10_Template, 2, 0, "div", 4);
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275advance();
      \u0275\u0275attribute("dir", ctx.isRTL ? "rtl" : "ltr");
      \u0275\u0275advance(2);
      \u0275\u0275property("ngSwitch", ctx.currentTab);
      \u0275\u0275advance();
      \u0275\u0275property("ngSwitchCase", "overview");
      \u0275\u0275advance();
      \u0275\u0275property("ngSwitchCase", "data");
      \u0275\u0275advance();
      \u0275\u0275property("ngSwitchCase", "products");
      \u0275\u0275advance();
      \u0275\u0275property("ngSwitchCase", "orders");
      \u0275\u0275advance();
      \u0275\u0275property("ngSwitchCase", "finance");
      \u0275\u0275advance();
      \u0275\u0275property("ngSwitchCase", "compliance");
      \u0275\u0275advance();
      \u0275\u0275property("ngSwitchCase", "logs");
    }
  }, dependencies: [CommonModule, NgSwitch, NgSwitchCase, VendorDetailHeaderComponent, VendorComplianceComponent, VendorActivityLogComponent, VendorOverviewComponent, VendorProductsComponent, VendorOrdersComponent, VendorFinanceComponent, TranslateModule, TranslatePipe], encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(VendorDetailComponent, { className: "VendorDetailComponent", filePath: "src\\app\\features\\vendors\\vendor-detail\\vendor-detail.component.ts", lineNumber: 18 });
})();
export {
  VendorDetailComponent
};
//# sourceMappingURL=chunk-T6NVFR22.js.map
