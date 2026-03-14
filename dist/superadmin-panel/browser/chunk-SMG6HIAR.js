import {
  AppPaginationComponent
} from "./chunk-LI5G6AB4.js";
import "./chunk-J7OIUMD3.js";
import "./chunk-H5RLU432.js";
import {
  AppInputComponent
} from "./chunk-E66AVT3J.js";
import {
  FormsModule,
  NgControlStatus,
  NgModel
} from "./chunk-33QDSRRV.js";
import "./chunk-ERDI6WJP.js";
import {
  AppButtonComponent
} from "./chunk-NRL7A6JT.js";
import {
  environment
} from "./chunk-6L7JDGMK.js";
import {
  RouterLink
} from "./chunk-TIVATNVT.js";
import {
  TranslateModule,
  TranslatePipe,
  TranslateService
} from "./chunk-FETH6UU2.js";
import {
  CommonModule,
  HttpClient,
  HttpParams,
  NgForOf,
  NgIf,
  UpperCasePipe,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵinject,
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
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-IPPBI3AG.js";

// src/app/core/models/vendor.ts
var VendorStatus;
(function(VendorStatus2) {
  VendorStatus2["Pending"] = "Pending";
  VendorStatus2["Active"] = "Active";
  VendorStatus2["Rejected"] = "Rejected";
  VendorStatus2["Suspended"] = "Suspended";
})(VendorStatus || (VendorStatus = {}));

// src/app/core/services/vendor.service.ts
var VendorService = class _VendorService {
  http;
  apiUrl = `${environment.apiUrl}/admin/vendors`;
  constructor(http) {
    this.http = http;
  }
  getVendors(pageNumber = 1, pageSize = 10, search, status) {
    let params = new HttpParams().set("pageNumber", pageNumber.toString()).set("pageSize", pageSize.toString());
    if (search) {
      params = params.set("search", search);
    }
    if (status) {
      params = params.set("status", status);
    }
    return this.http.get(this.apiUrl, { params });
  }
  getVendorById(id) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
  updateVendorStatus(id, status, isActive) {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status, isActive });
  }
  static \u0275fac = function VendorService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _VendorService)(\u0275\u0275inject(HttpClient));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _VendorService, factory: _VendorService.\u0275fac, providedIn: "root" });
};

// src/app/features/vendors/vendors-list/vendors-list.component.ts
var _c0 = (a0) => ["/vendors", a0];
function VendorsListComponent_div_32_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 26)(1, "div", 27);
    \u0275\u0275element(2, "div", 28)(3, "div", 29);
    \u0275\u0275elementEnd()();
  }
}
function VendorsListComponent_div_33_tr_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "tr", 38)(1, "td", 39)(2, "span", 40);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "td", 41)(5, "div", 42)(6, "div", 43)(7, "span", 44);
    \u0275\u0275text(8);
    \u0275\u0275pipe(9, "uppercase");
    \u0275\u0275elementEnd();
    \u0275\u0275element(10, "div", 45);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(11, "td", 46)(12, "div", 47)(13, "span", 48);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "span", 49);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(17, "td", 50)(18, "div", 51)(19, "span", 52);
    \u0275\u0275text(20);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "code", 53);
    \u0275\u0275text(22);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(23, "td", 50)(24, "div", 42)(25, "div", 54);
    \u0275\u0275element(26, "span", 55);
    \u0275\u0275elementStart(27, "span", 56);
    \u0275\u0275text(28);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(29, "td", 50)(30, "div", 57)(31, "button", 58);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(32, "svg", 59);
    \u0275\u0275element(33, "path", 60)(34, "path", 61);
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const vendor_r1 = ctx.$implicit;
    const i_r2 = ctx.index;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate((ctx_r2.pageNumber - 1) * ctx_r2.pageSize + i_r2 + 1);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(9, 20, (ctx_r2.activeLang === "ar" ? vendor_r1.businessNameAr : vendor_r1.businessNameEn).charAt(0)));
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate1(" ", ctx_r2.activeLang === "ar" ? vendor_r1.businessNameAr : vendor_r1.businessNameEn, " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r2.activeLang === "ar" ? vendor_r1.businessNameEn : vendor_r1.businessNameAr, " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(vendor_r1.contactEmail);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" \u0639\u0645\u0648\u0644\u0629: ", vendor_r1.commissionRate, "% ");
    \u0275\u0275advance(3);
    \u0275\u0275classProp("text-emerald-500", vendor_r1.status === "Active")("text-amber-500", vendor_r1.status === "Pending")("text-red-500", vendor_r1.status === "Rejected" || vendor_r1.status === "Suspended");
    \u0275\u0275advance();
    \u0275\u0275classProp("bg-emerald-500", vendor_r1.status === "Active")("bg-amber-500", vendor_r1.status === "Pending")("bg-red-500", vendor_r1.status === "Rejected" || vendor_r1.status === "Suspended");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", vendor_r1.status, " ");
    \u0275\u0275advance(3);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(22, _c0, vendor_r1.id));
  }
}
function VendorsListComponent_div_33_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 30)(1, "table", 31)(2, "thead", 32)(3, "tr")(4, "th", 33);
    \u0275\u0275text(5, "#");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "th", 34);
    \u0275\u0275text(7, "\u0627\u0644\u0634\u0639\u0627\u0631");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "th", 35);
    \u0275\u0275text(9, "\u0627\u0644\u0645\u0648\u0631\u062F \u0648\u0627\u0644\u0627\u0633\u0645");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "th", 36);
    \u0275\u0275text(11, "\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0648\u0627\u0644\u0639\u0645\u0648\u0644\u0629");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "th", 36);
    \u0275\u0275text(13, "\u0627\u0644\u062D\u0627\u0644\u0629");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "th", 36);
    \u0275\u0275text(15, "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(16, "tbody");
    \u0275\u0275template(17, VendorsListComponent_div_33_tr_17_Template, 35, 24, "tr", 37);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(17);
    \u0275\u0275property("ngForOf", ctx_r2.vendors);
  }
}
function VendorsListComponent_div_34_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 64)(1, "div", 65)(2, "div", 10)(3, "div", 66)(4, "span", 67);
    \u0275\u0275text(5);
    \u0275\u0275pipe(6, "uppercase");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "div", 68)(8, "h3", 69);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "p", 70);
    \u0275\u0275text(11);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(12, "div", 71);
    \u0275\u0275element(13, "span", 72);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "div", 73)(16, "div", 74)(17, "span", 75);
    \u0275\u0275text(18, "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "span", 76);
    \u0275\u0275text(20);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(21, "div", 74)(22, "span", 75);
    \u0275\u0275text(23, "\u0627\u0644\u0639\u0645\u0648\u0644\u0629");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "code", 77);
    \u0275\u0275text(25);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(26, "div", 78)(27, "button", 79);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(28, "svg", 80);
    \u0275\u0275element(29, "path", 60)(30, "path", 61);
    \u0275\u0275elementEnd();
    \u0275\u0275text(31, " \u0639\u0631\u0636 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 ");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const vendor_r4 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 25, (ctx_r2.activeLang === "ar" ? vendor_r4.businessNameAr : vendor_r4.businessNameEn).charAt(0)));
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", ctx_r2.activeLang === "ar" ? vendor_r4.businessNameAr : vendor_r4.businessNameEn, " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r2.activeLang === "ar" ? vendor_r4.businessNameEn : vendor_r4.businessNameAr, " ");
    \u0275\u0275advance();
    \u0275\u0275classProp("bg-emerald-50", vendor_r4.status === "Active")("text-emerald-600", vendor_r4.status === "Active")("bg-amber-50", vendor_r4.status === "Pending")("text-amber-600", vendor_r4.status === "Pending")("bg-red-50", vendor_r4.status === "Rejected" || vendor_r4.status === "Suspended")("text-red-600", vendor_r4.status === "Rejected" || vendor_r4.status === "Suspended");
    \u0275\u0275advance();
    \u0275\u0275classProp("bg-emerald-500", vendor_r4.status === "Active")("bg-amber-500", vendor_r4.status === "Pending")("bg-red-500", vendor_r4.status === "Rejected" || vendor_r4.status === "Suspended");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", vendor_r4.status, " ");
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate1(" ", vendor_r4.contactEmail, " ");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", vendor_r4.commissionRate, "% ");
    \u0275\u0275advance(2);
    \u0275\u0275property("routerLink", \u0275\u0275pureFunction1(27, _c0, vendor_r4.id));
  }
}
function VendorsListComponent_div_34_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 62);
    \u0275\u0275template(1, VendorsListComponent_div_34_div_1_Template, 32, 29, "div", 63);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r2.vendors);
  }
}
function VendorsListComponent_div_35_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 81)(1, "div", 82)(2, "div", 83);
    \u0275\u0275element(3, "div", 84);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(4, "svg", 85);
    \u0275\u0275element(5, "path", 86);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(6, "h3", 87);
    \u0275\u0275text(7);
    \u0275\u0275pipe(8, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "p", 88);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(8, 2, "COMMON.NO_RESULTS"));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r2.translate.currentLang === "ar" ? "\u0644\u0627 \u064A\u0648\u062C\u062F \u0645\u0648\u0631\u062F\u064A\u0646 \u0645\u0633\u062C\u0644\u064A\u0646 \u062D\u0627\u0644\u064A\u0627\u064B" : "No vendors joined the network yet.");
  }
}
function VendorsListComponent_div_36_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 89)(1, "app-pagination", 90);
    \u0275\u0275listener("pageChange", function VendorsListComponent_div_36_Template_app_pagination_pageChange_1_listener($event) {
      \u0275\u0275restoreView(_r5);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.changePage($event));
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("currentPage", ctx_r2.pageNumber)("pageSize", ctx_r2.pageSize)("totalItems", ctx_r2.totalCount);
  }
}
var VendorsListComponent = class _VendorsListComponent {
  vendorService;
  translate;
  Math = Math;
  // Available in template
  vendors = [];
  isLoading = false;
  // Pagination & Filtering
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasPreviousPage = false;
  hasNextPage = false;
  searchTerm = "";
  statusFilter = "";
  // Dropdown States
  isStatusDropdownOpen = false;
  selectStatus(status) {
    this.statusFilter = status;
    this.isStatusDropdownOpen = false;
    this.onFilterChange();
  }
  constructor(vendorService, translate) {
    this.vendorService = vendorService;
    this.translate = translate;
  }
  get activeLang() {
    return this.translate.currentLang || "ar";
  }
  ngOnInit() {
    this.loadVendors();
  }
  loadVendors() {
    this.isLoading = true;
    const statusParam = this.statusFilter ? this.statusFilter : void 0;
    this.vendorService.getVendors(this.pageNumber, this.pageSize, this.searchTerm, statusParam).subscribe({
      next: (response) => {
        this.vendors = response.items;
        if (this.vendors.length === 0 && !this.searchTerm && !this.statusFilter) {
          this.vendors = [
            {
              id: "1",
              userId: "u1",
              businessNameEn: "Zadana Global Trade",
              businessNameAr: "\u0632\u0627\u062F\u0627\u0646\u0627 \u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629",
              descriptionEn: "Import and export of agricultural goods.",
              descriptionAr: "\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0633\u0644\u0639 \u0627\u0644\u0632\u0631\u0627\u0639\u064A\u0629.",
              contactEmail: "ops@zadana-global.com",
              contactPhone: "+20 123 456 7890",
              commercialRecord: "CR-12345",
              taxNumber: "TX-67890",
              commissionRate: 12.5,
              status: VendorStatus.Active,
              isActive: true
            },
            {
              id: "2",
              userId: "u2",
              businessNameEn: "EcoSupply Logistics",
              businessNameAr: "\u0625\u064A\u0643\u0648 \u0633\u0628\u0644\u0627\u064A \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629",
              descriptionEn: "Sustainable supply chain solutions.",
              descriptionAr: "\u062D\u0644\u0648\u0644 \u0633\u0644\u0627\u0633\u0644 \u0627\u0644\u062A\u0648\u0631\u064A\u062F \u0627\u0644\u0645\u0633\u062A\u062F\u0627\u0645\u0629.",
              contactEmail: "verify@ecosupply.io",
              contactPhone: "+966 50 123 4567",
              commercialRecord: null,
              taxNumber: null,
              commissionRate: 8,
              status: VendorStatus.Pending,
              isActive: false
            },
            {
              id: "3",
              userId: "u3",
              businessNameEn: "Harvest Hub",
              businessNameAr: "\u0645\u0631\u0643\u0632 \u0627\u0644\u062D\u0635\u0627\u062F",
              descriptionEn: "Direct farm-to-table platform.",
              descriptionAr: "\u0645\u0646\u0635\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0645\u0646 \u0627\u0644\u0645\u0632\u0631\u0639\u0629 \u0625\u0644\u0649 \u0627\u0644\u0645\u0627\u0626\u062F\u0629.",
              contactEmail: "admin@harvesthub.net",
              contactPhone: "+971 4 123 4567",
              commercialRecord: "CR-998877",
              taxNumber: "TX-554433",
              commissionRate: 15,
              status: VendorStatus.Suspended,
              isActive: false
            },
            {
              id: "4",
              userId: "u4",
              businessNameEn: "FreshLine Markets",
              businessNameAr: "\u0623\u0633\u0648\u0627\u0642 \u0641\u0631\u064A\u0634 \u0644\u0627\u064A\u0646",
              descriptionEn: "Premium fresh produce retail network.",
              descriptionAr: "\u0634\u0628\u0643\u0629 \u0645\u062D\u0644\u0627\u062A \u0627\u0644\u062A\u062C\u0632\u0626\u0629 \u0644\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0637\u0627\u0632\u062C\u0629 \u0627\u0644\u0645\u0645\u062A\u0627\u0632\u0629.",
              contactEmail: "support@freshline.com",
              contactPhone: "+20 100 987 6543",
              commercialRecord: "CR-443322",
              taxNumber: "TX-112233",
              commissionRate: 10,
              status: VendorStatus.Rejected,
              isActive: false
            }
          ];
          this.totalCount = this.vendors.length;
          this.totalPages = 1;
        } else {
          this.pageNumber = response.pageNumber;
          this.totalPages = response.totalPages;
          this.totalCount = response.totalCount;
          this.hasPreviousPage = response.hasPreviousPage;
          this.hasNextPage = response.hasNextPage;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading vendors", err);
        this.isLoading = false;
      }
    });
  }
  onSearch() {
    this.pageNumber = 1;
    this.loadVendors();
  }
  onFilterChange() {
    this.pageNumber = 1;
    this.loadVendors();
  }
  changePage(newPage) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageNumber = newPage;
      this.loadVendors();
    }
  }
  static \u0275fac = function VendorsListComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _VendorsListComponent)(\u0275\u0275directiveInject(VendorService), \u0275\u0275directiveInject(TranslateService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _VendorsListComponent, selectors: [["app-vendors-list"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 37, vars: 25, consts: [[1, "h-full", "flex", "flex-col", "bg-slate-50/50", "font-sans", "pb-10", "overflow-hidden"], [1, "px-4", "md:px-10", "pt-8", "pb-4", "flex", "flex-col", "sm:flex-row", "items-start", "sm:items-end", "justify-between", "gap-6"], [1, "text-start", "w-full", "sm:w-auto", "space-y-1", "animate-in", "slide-in-from-right-10", "duration-700"], [1, "flex", "justify-start", "items-center", "gap-2", "text-[10px]", "sm:text-[11px]", "font-bold", "text-zadna-primary/80", "uppercase", "tracking-widest", "mb-1.5"], [1, "w-1", "h-1", "rounded-full", "bg-zadna-primary/20"], [1, "text-zadna-primary"], [1, "text-xl", "sm:text-2xl", "font-black", "text-slate-900", "tracking-tight", "leading-tight"], [1, "text-[10px]", "sm:text-[12px]", "font-medium", "text-slate-400", "max-w-md"], [1, "flex", "items-center", "gap-4", "animate-in", "slide-in-from-left-10", "duration-700"], ["variant", "primary", "customClass", "rounded-[1.5rem] shadow-2xl shadow-zadna-primary/20 hover:scale-105 transition-all transform px-8 py-3.5 group"], [1, "flex", "items-center", "gap-3"], [1, "w-8", "h-8", "rounded-xl", "bg-white/20", "flex", "items-center", "justify-center", "group-hover:rotate-90", "transition-transform", "duration-500"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "text-white"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "3", "d", "M12 4v16m8-8H4"], [1, "font-black", "uppercase", "tracking-[0.1em]", "text-xs", "sm:text-sm"], [1, "flex-1", "min-h-0", "px-4", "md:px-10", "py-6", "max-w-[120rem]", "mx-auto", "w-full", "space-y-6"], [1, "flex", "flex-col", "sm:flex-row", "items-center", "gap-4"], [1, "flex-1", "w-full", "max-w-md"], [3, "ngModelChange", "input", "placeholder", "ngModel", "dir", "inputClass", "customClass", "hasIcon"], ["icon", "", "fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "text-zadna-primary/60"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"], ["class", "flex flex-col items-center justify-center py-40 animate-pulse", 4, "ngIf"], ["class", "hidden md:block extraordinary-table-container w-full overflow-x-auto animate-in fade-in slide-in-from-bottom-10 duration-1000", 4, "ngIf"], ["class", "md:hidden space-y-4 animate-in fade-in slide-in-from-bottom-10 duration-1000", 4, "ngIf"], ["class", "relative p-20 text-center animate-in zoom-in duration-700", 4, "ngIf"], ["class", "pt-6 animate-in fade-in duration-1000 slide-in-from-bottom-5", 4, "ngIf"], [1, "flex", "flex-col", "items-center", "justify-center", "py-40", "animate-pulse"], [1, "relative", "w-24", "h-24"], [1, "absolute", "inset-0", "rounded-full", "border-[6px]", "border-zadna-primary/10"], [1, "absolute", "inset-0", "rounded-full", "border-[6px]", "border-t-zadna-primary", "animate-spin"], [1, "hidden", "md:block", "extraordinary-table-container", "w-full", "overflow-x-auto", "animate-in", "fade-in", "slide-in-from-bottom-10", "duration-1000"], [1, "w-full", "table-fixed", "border-separate", "border-spacing-y-0"], [1, "border-b", "border-slate-100/50"], [1, "text-center", "w-[5%]", "py-5", "text-[10px]", "font-black", "uppercase", "text-slate-400/70", "tracking-tighter"], [1, "text-center", "w-[10%]", "py-5", "text-[10px]", "font-black", "uppercase", "text-slate-400/70", "tracking-tighter"], [1, "text-start", "w-[25%]", "py-5", "text-[10px]", "font-black", "uppercase", "text-slate-400/70", "tracking-tighter", "px-2"], [1, "text-center", "w-[20%]", "py-5", "text-[10px]", "font-black", "uppercase", "text-slate-400/70", "tracking-tighter"], ["class", "group bg-white/50 hover:bg-white transition-all duration-500 border-b border-slate-100/60", 4, "ngFor", "ngForOf"], [1, "group", "bg-white/50", "hover:bg-white", "transition-all", "duration-500", "border-b", "border-slate-100/60"], [1, "text-center", "align-middle", "py-4", "w-[5%]"], [1, "text-[10px]", "sm:text-[11px]", "font-black", "text-slate-300"], [1, "text-center", "align-middle", "py-4", "w-[10%]"], [1, "flex", "justify-center"], [1, "relative", "w-12", "h-12", "bg-[#f0f9fa]/80", "rounded-[1.2rem]", "border", "border-[#e0f2f4]", "flex", "items-center", "justify-center", "transition-all", "group-hover:scale-105", "group-hover:rotate-2", "shadow-sm"], [1, "text-2xl", "font-black", "text-zadna-primary"], [1, "absolute", "-top-1", "-right-1", "w-2.5", "h-2.5", "bg-white", "border-2", "border-[#e0f2f4]", "rounded-full", "shadow-sm"], [1, "align-middle", "py-4", "w-[25%]", "px-2"], [1, "flex", "flex-col", "text-start"], [1, "text-[13px]", "sm:text-[14px]", "font-black", "text-slate-900", "group-hover:text-zadna-primary", "transition-colors", "leading-snug", "truncate"], [1, "text-[9px]", "font-bold", "text-slate-400/80", "uppercase", "tracking-widest", "mt-0.5", "truncate"], [1, "text-center", "align-middle", "py-4", "w-[20%]"], [1, "flex", "flex-col", "items-center", "gap-1.5"], [1, "text-[11px]", "font-bold", "text-slate-600", "tracking-tight", "truncate", "max-w-[180px]"], [1, "text-[9px]", "font-bold", "text-zadna-primary", "bg-zadna-primary/5", "px-2", "py-0.5", "rounded-md", "border", "border-zadna-primary/10", "uppercase", "tracking-widest"], [1, "inline-flex", "items-center", "gap-2", "px-3", "py-1.5", "rounded-full", "border", "border-slate-50", "bg-white", "shadow-sm"], [1, "w-1.5", "h-1.5", "rounded-full", "animate-pulse"], [1, "text-[10px]", "font-black", "tracking-tight", "uppercase"], [1, "flex", "justify-center", "gap-1.5"], [1, "w-8", "h-8", "rounded-xl", "bg-slate-50", "text-slate-400", "flex", "items-center", "justify-center", "hover:bg-zadna-primary", "hover:text-white", "transition-all", 3, "routerLink"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15 12a3 3 0 11-6 0 3 3 0 016 0z"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"], [1, "md:hidden", "space-y-4", "animate-in", "fade-in", "slide-in-from-bottom-10", "duration-1000"], ["class", "bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-all", 4, "ngFor", "ngForOf"], [1, "bg-white/80", "backdrop-blur-sm", "rounded-2xl", "border", "border-slate-200/60", "p-4", "shadow-sm", "hover:shadow-md", "transition-all"], [1, "flex", "items-start", "justify-between", "mb-3"], [1, "relative", "w-12", "h-12", "bg-[#f0f9fa]/80", "rounded-xl", "border", "border-[#e0f2f4]", "flex", "items-center", "justify-center"], [1, "text-xl", "font-black", "text-zadna-primary"], [1, "flex-1"], [1, "text-sm", "font-bold", "text-slate-900", "truncate"], [1, "text-xs", "text-slate-500", "truncate"], [1, "inline-flex", "items-center", "gap-1.5", "px-2.5", "py-1", "rounded-full", "text-xs", "font-bold"], [1, "w-1", "h-1", "rounded-full"], [1, "space-y-2", "mb-4"], [1, "flex", "items-center", "justify-between"], [1, "text-xs", "text-slate-500"], [1, "text-xs", "font-medium", "text-slate-700", "truncate", "max-w-[200px]"], [1, "text-xs", "font-bold", "text-zadna-primary", "bg-zadna-primary/5", "px-2", "py-1", "rounded"], [1, "flex", "gap-2", "pt-3", "border-t", "border-slate-100"], [1, "flex-1", "flex", "items-center", "justify-center", "gap-2", "py-2", "px-3", "bg-slate-50", "text-slate-600", "rounded-lg", "text-xs", "font-medium", "hover:bg-blue-500", "hover:text-white", "transition-all", 3, "routerLink"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3.5", "h-3.5"], [1, "relative", "p-20", "text-center", "animate-in", "zoom-in", "duration-700"], [1, "max-w-md", "mx-auto", "space-y-6"], [1, "w-32", "h-32", "bg-white", "rounded-[3rem]", "shadow-2xl", "flex", "items-center", "justify-center", "mx-auto", "text-slate-100", "relative", "group"], [1, "absolute", "inset-0", "bg-zadna-primary/5", "rounded-[3rem]", "group-hover:scale-110", "transition-transform", "duration-500"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-16", "h-16", "relative", "z-10"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"], [1, "text-3xl", "font-black", "text-slate-900", "tracking-tight"], [1, "text-sm", "font-bold", "text-slate-400", "leading-relaxed"], [1, "pt-6", "animate-in", "fade-in", "duration-1000", "slide-in-from-bottom-5"], [3, "pageChange", "currentPage", "pageSize", "totalItems"]], template: function VendorsListComponent_Template(rf, ctx) {
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
      \u0275\u0275text(15, " \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646 \u0648\u0627\u0644\u0634\u0631\u0643\u0627\u0621 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u064A\u0646 \u0648\u062A\u062A\u0628\u0639 \u0627\u0644\u0639\u0645\u0648\u0644\u0627\u062A \u0648\u0627\u0644\u062D\u0627\u0644\u0627\u062A ");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(16, "div", 8)(17, "app-button", 9)(18, "div", 10)(19, "div", 11);
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
      \u0275\u0275twoWayListener("ngModelChange", function VendorsListComponent_Template_app_input_ngModelChange_28_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.searchTerm, $event) || (ctx.searchTerm = $event);
        return $event;
      });
      \u0275\u0275listener("input", function VendorsListComponent_Template_app_input_input_28_listener() {
        return ctx.onSearch();
      });
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(30, "svg", 19);
      \u0275\u0275element(31, "path", 20);
      \u0275\u0275elementEnd()()()();
      \u0275\u0275template(32, VendorsListComponent_div_32_Template, 4, 0, "div", 21)(33, VendorsListComponent_div_33_Template, 18, 1, "div", 22)(34, VendorsListComponent_div_34_Template, 2, 1, "div", 23)(35, VendorsListComponent_div_35_Template, 11, 4, "div", 24)(36, VendorsListComponent_div_36_Template, 2, 3, "div", 25);
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(6, 15, "SIDEBAR.CATALOG"));
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(10, 17, "SIDEBAR.VENDORS.TITLE"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(13, 19, "SIDEBAR.VENDORS.TITLE"), " ");
      \u0275\u0275advance(11);
      \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(24, 21, "COMMON.ADD"), " \u0645\u0648\u0631\u062F");
      \u0275\u0275advance(5);
      \u0275\u0275property("placeholder", \u0275\u0275pipeBind1(29, 23, "SIDEBAR.VENDORS.SEARCH_PLACEHOLDER"));
      \u0275\u0275twoWayProperty("ngModel", ctx.searchTerm);
      \u0275\u0275property("dir", ctx.translate.currentLang === "ar" ? "rtl" : "ltr")("inputClass", "!bg-transparent !border-0 !ring-0 !text-zadna-primary !placeholder-zadna-primary/40")("customClass", "bg-white/70 backdrop-blur-xl border border-slate-200/60 focus-within:bg-white focus-within:border-zadna-primary/50 focus-within:shadow-[0_8px_30px_-5px_rgba(18,124,140,0.15)] hover:bg-white/80 transition-all shadow-sm rounded-[1.5rem] overflow-hidden")("hasIcon", true);
      \u0275\u0275advance(4);
      \u0275\u0275property("ngIf", ctx.isLoading);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.isLoading && ctx.vendors.length > 0);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.isLoading && ctx.vendors.length > 0);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.isLoading && ctx.vendors.length === 0);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.isLoading && ctx.vendors.length > 0);
    }
  }, dependencies: [
    CommonModule,
    NgForOf,
    NgIf,
    UpperCasePipe,
    FormsModule,
    NgControlStatus,
    NgModel,
    RouterLink,
    TranslateModule,
    TranslatePipe,
    AppButtonComponent,
    AppInputComponent,
    AppPaginationComponent
  ], styles: ["\n\ntable[_ngcontent-%COMP%] {\n  border-collapse: separate !important;\n  border-spacing: 0 !important;\n  table-layout: fixed !important;\n}\nthead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  position: sticky;\n  top: 0;\n  background: white;\n  z-index: 10;\n}\ntbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.5);\n}\ntbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover {\n  background: white;\n}\ntd[_ngcontent-%COMP%], \nth[_ngcontent-%COMP%] {\n  vertical-align: middle !important;\n  text-align: center !important;\n}\ntd[_ngcontent-%COMP%]:first-child, \nth[_ngcontent-%COMP%]:first-child {\n  text-align: center !important;\n}\ntd[_ngcontent-%COMP%]:nth-child(3), \nth[_ngcontent-%COMP%]:nth-child(3) {\n  text-align: start !important;\n}\n/*# sourceMappingURL=vendors-list.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(VendorsListComponent, { className: "VendorsListComponent", filePath: "src\\app\\features\\vendors\\vendors-list\\vendors-list.component.ts", lineNumber: 70 });
})();
export {
  VendorsListComponent
};
//# sourceMappingURL=chunk-SMG6HIAR.js.map
