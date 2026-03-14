import {
  DefaultValueAccessor,
  FormBuilder,
  FormControlName,
  FormGroupDirective,
  NgControlStatus,
  NgControlStatusGroup,
  ReactiveFormsModule,
  RequiredValidator,
  Validators,
  ɵNgNoValidate
} from "./chunk-33QDSRRV.js";
import {
  AuthService
} from "./chunk-PL22K63I.js";
import "./chunk-6L7JDGMK.js";
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
  RouterOutlet,
  bootstrapApplication,
  provideRouter
} from "./chunk-TIVATNVT.js";
import {
  TranslateLoader,
  TranslateModule,
  TranslatePipe,
  TranslateService,
  provideTranslateService
} from "./chunk-FETH6UU2.js";
import {
  CommonModule,
  DOCUMENT,
  EventEmitter,
  HttpBackend,
  HttpClient,
  Injectable,
  InjectionToken,
  NgClass,
  NgIf,
  Renderer2,
  __spreadValues,
  catchError,
  inject,
  provideHttpClient,
  provideZoneChangeDetection,
  setClassMetadata,
  throwError,
  withInterceptors,
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
  ɵɵlistener,
  ɵɵnamespaceHTML,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵpureFunction0,
  ɵɵpureFunction2,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-IPPBI3AG.js";

// node_modules/@ngx-translate/http-loader/fesm2022/ngx-translate-http-loader.mjs
var TRANSLATE_HTTP_LOADER_CONFIG = new InjectionToken("TRANSLATE_HTTP_LOADER_CONFIG");
var TranslateHttpLoader = class _TranslateHttpLoader {
  http;
  config;
  constructor() {
    this.config = __spreadValues({
      prefix: "/assets/i18n/",
      suffix: ".json",
      enforceLoading: false,
      useHttpBackend: false
    }, inject(TRANSLATE_HTTP_LOADER_CONFIG));
    this.http = this.config.useHttpBackend ? new HttpClient(inject(HttpBackend)) : inject(HttpClient);
  }
  /**
   * Gets the translations from the server
   */
  getTranslation(lang) {
    const cacheBuster = this.config.enforceLoading ? `?enforceLoading=${Date.now()}` : "";
    return this.http.get(`${this.config.prefix}${lang}${this.config.suffix}${cacheBuster}`);
  }
  static \u0275fac = function TranslateHttpLoader_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _TranslateHttpLoader)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _TranslateHttpLoader,
    factory: _TranslateHttpLoader.\u0275fac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TranslateHttpLoader, [{
    type: Injectable
  }], () => [], null);
})();
function provideTranslateHttpLoader(config = {}) {
  const useBackend = config.useHttpBackend ?? false;
  return [{
    provide: TRANSLATE_HTTP_LOADER_CONFIG,
    useValue: config
  }, {
    provide: TranslateLoader,
    useClass: TranslateHttpLoader,
    deps: [useBackend ? HttpBackend : HttpClient, TRANSLATE_HTTP_LOADER_CONFIG]
  }];
}

// src/app/core/interceptors/jwt.interceptor.ts
var jwtInterceptor = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const isApiUrl = req.url.includes("/api/admin") || req.url.includes("/api/");
  if (token && isApiUrl) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req).pipe(catchError((error) => {
    if (error.status === 401 || error.status === 403) {
      authService.logout();
      router.navigate(["/login"], { queryParams: { returnUrl: router.routerState.snapshot.url } });
    }
    return throwError(() => error);
  }));
};

// src/app/features/auth/login/login.component.ts
var _c0 = (a0, a1) => ({ "bg-white text-zadna-primaryDark shadow-lg scale-105": a0, "text-gray-500 hover:text-zadna-primary hover:bg-white/40": a1 });
var _c1 = (a0, a1) => [a0, a1];
function LoginComponent_div_73_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 76)(1, "div", 77);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(2, "svg", 78);
    \u0275\u0275element(3, "path", 79);
    \u0275\u0275elementEnd()();
    \u0275\u0275namespaceHTML();
    \u0275\u0275elementStart(4, "p", 80);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r0.errorMessage);
  }
}
function LoginComponent_div_85_span_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 83);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(1, "svg", 84);
    \u0275\u0275element(2, "path", 85);
    \u0275\u0275elementEnd();
    \u0275\u0275text(3);
    \u0275\u0275pipe(4, "translate");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(4, 1, "LOGIN.ERR_EMAIL_REQUIRED"), " ");
  }
}
function LoginComponent_div_85_span_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 83);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(1, "svg", 84);
    \u0275\u0275element(2, "path", 85);
    \u0275\u0275elementEnd();
    \u0275\u0275text(3);
    \u0275\u0275pipe(4, "translate");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(4, 1, "LOGIN.ERR_EMAIL_INVALID"), " ");
  }
}
function LoginComponent_div_85_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 81);
    \u0275\u0275template(1, LoginComponent_div_85_span_1_Template, 5, 3, "span", 82)(2, LoginComponent_div_85_span_2_Template, 5, 3, "span", 82);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    let tmp_1_0;
    let tmp_2_0;
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", (tmp_1_0 = ctx_r0.loginForm.get("identifier")) == null ? null : tmp_1_0.errors == null ? null : tmp_1_0.errors["required"]);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", (tmp_2_0 = ctx_r0.loginForm.get("identifier")) == null ? null : tmp_2_0.errors == null ? null : tmp_2_0.errors["email"]);
  }
}
function LoginComponent__svg_svg_98_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 57);
    \u0275\u0275element(1, "path", 86)(2, "path", 87);
    \u0275\u0275elementEnd();
  }
}
function LoginComponent__svg_svg_99_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 57);
    \u0275\u0275element(1, "path", 88);
    \u0275\u0275elementEnd();
  }
}
function LoginComponent_div_100_span_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 83);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(1, "svg", 84);
    \u0275\u0275element(2, "path", 85);
    \u0275\u0275elementEnd();
    \u0275\u0275text(3);
    \u0275\u0275pipe(4, "translate");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(4, 1, "LOGIN.ERR_PASSWORD_REQUIRED"), " ");
  }
}
function LoginComponent_div_100_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 81);
    \u0275\u0275template(1, LoginComponent_div_100_span_1_Template, 5, 3, "span", 82);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    let tmp_1_0;
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", (tmp_1_0 = ctx_r0.loginForm.get("password")) == null ? null : tmp_1_0.errors == null ? null : tmp_1_0.errors["required"]);
  }
}
function LoginComponent_span_104_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 89);
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(1, "svg", 90);
    \u0275\u0275element(2, "circle", 91)(3, "path", 92);
    \u0275\u0275elementEnd()();
  }
}
function LoginComponent_span_105_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 93);
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "translate");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(2, 1, "LOGIN.SIGNING_IN"));
  }
}
function LoginComponent_span_106__svg_path_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "path", 98);
  }
}
function LoginComponent_span_106__svg_path_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "path", 99);
  }
}
function LoginComponent_span_106_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 94);
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "translate");
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(3, "svg", 95);
    \u0275\u0275template(4, LoginComponent_span_106__svg_path_4_Template, 1, 0, "path", 96)(5, LoginComponent_span_106__svg_path_5_Template, 1, 0, "path", 97);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(2, 4, "LOGIN.SIGN_IN"), " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngClass", ctx_r0.translate.currentLang === "ar" ? "mr-3 group-hover:-translate-x-2" : "ml-3 group-hover:translate-x-2");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.translate.currentLang !== "ar");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r0.translate.currentLang === "ar");
  }
}
var LoginComponent = class _LoginComponent {
  formBuilder;
  route;
  router;
  authService;
  translate;
  loginForm;
  isLoading = false;
  errorMessage = "";
  returnUrl = "/";
  showPassword = false;
  submitted = false;
  constructor(formBuilder, route, router, authService, translate) {
    this.formBuilder = formBuilder;
    this.route = route;
    this.router = router;
    this.authService = authService;
    this.translate = translate;
    this.loginForm = this.formBuilder.group({
      identifier: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required]
    });
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";
  }
  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid)
      return;
    this.isLoading = true;
    this.errorMessage = "";
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || this.translate.instant("LOGIN.ERR_LOGIN_FAILED");
      }
    });
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  switchLanguage(lang) {
    this.translate.use(lang);
  }
  static \u0275fac = function LoginComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _LoginComponent)(\u0275\u0275directiveInject(FormBuilder), \u0275\u0275directiveInject(ActivatedRoute), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(TranslateService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _LoginComponent, selectors: [["app-login"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 111, vars: 73, consts: [[1, "min-h-screen", "py-24", "lg:py-12", "relative", "font-sans", "flex", "items-center", "justify-center", "bg-zadna-bgLight", "overflow-hidden", "selection:bg-zadna-primary", "selection:text-white"], [1, "absolute", "inset-0", "z-0", "pointer-events-none", "overflow-hidden"], [1, "absolute", "top-[-20%]", "right-[-10%]", "w-[70vw]", "h-[70vw]", "rounded-full", "bg-gradient-to-bl", "from-zadna-primaryLight/20", "to-zadna-primary/5", "blur-[120px]", "animate-slow-float"], [1, "absolute", "bottom-[-20%]", "left-[-10%]", "w-[60vw]", "h-[60vw]", "rounded-full", "bg-gradient-to-tr", "from-zadna-accentLight/10", "to-zadna-accent/5", "blur-[100px]", "animate-slow-float", 2, "animation-delay", "-5s"], [1, "absolute", "inset-0", "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTU5LjUgMGguNXY2MGgtLjV6TTBvNTloNjB2LjVIMHoiIGZpbGw9IiNlN2U1ZTRcIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')]", "opacity-60"], [1, "absolute", "top-6", "sm:top-8", "end-6", "sm:end-12", "xl:end-16", "z-50", "flex", "items-center", "animate-puzzle-down", "stagger-1"], [1, "flex", "items-center", "bg-white/60", "backdrop-blur-2xl", "border", "border-white/80", "p-1.5", "rounded-full", "shadow-[0_12px_24px_rgba(18,124,140,0.15)]", "dir-ltr", 2, "direction", "ltr"], [1, "px-6", "py-2.5", "rounded-full", "text-sm", "font-black", "tracking-widest", "uppercase", "transition-all", "duration-300", 3, "click", "ngClass"], [1, "relative", "z-10", "w-full", "max-w-[1700px]", "mx-auto", "px-6", "md:px-12", "xl:px-20", "flex", "flex-col", "xl:flex-row", "items-center", "justify-center", "xl:justify-between", "gap-16", "xl:gap-24"], [1, "hidden", "xl:flex", "w-full", "xl:w-[55%]", "flex-col", "justify-center", "xl:pr-10", "rtl:xl:pl-10", "rtl:xl:pr-0", "animate-puzzle-left", "stagger-2"], [1, "inline-flex", "items-center", "gap-2", "px-5", "py-2.5", "rounded-full", "bg-white/60", "border", "border-white/80", "shadow-[0_4px_12px_rgba(18,124,140,0.08)]", "backdrop-blur-md", "w-max", "mb-10", "transform", "hover:scale-105", "transition-transform", "cursor-default", "animate-puzzle-up", "stagger-3"], [1, "relative", "flex", "h-3", "w-3"], [1, "animate-ping", "absolute", "inline-flex", "h-full", "w-full", "rounded-full", "bg-zadna-accent", "opacity-75"], [1, "relative", "inline-flex", "rounded-full", "h-3", "w-3", "bg-zadna-accent"], [1, "text-xs", "font-black", "tracking-widest", "text-zadna-primaryDark", "uppercase"], [1, "text-[2.5rem]", "md:text-[3.5rem]", "lg:text-[3.5rem]", "xl:text-[4rem]", "font-black", "text-zadna-bgDark", "leading-[1.2]", "tracking-tight", "mb-8", "animate-puzzle-up", "stagger-4"], [1, "mb-2", "md:mb-4"], [1, "relative", "inline-block", "mt-2", "md:mt-4"], [1, "relative", "z-10", "text-transparent", "bg-clip-text", "bg-gradient-to-r", "from-zadna-primary", "to-zadna-primaryLight"], ["viewBox", "0 0 100 20", "preserveAspectRatio", "none", 1, "absolute", "w-full", "h-4", "md:h-6", "-bottom-1", "left-0", "z-0", "text-zadna-accent/20"], ["d", "M0 10 Q 50 20 100 10", "stroke", "currentColor", "stroke-width", "8", "fill", "none", "stroke-linecap", "round"], [1, "text-lg", "text-gray-500", "font-medium", "leading-relaxed", "max-w-2xl", "mb-12", "opacity-90", "tracking-wide", "animate-puzzle-up", "stagger-5"], [1, "flex", "gap-6", "p-6", "bg-white/40", "backdrop-blur-xl", "border", "border-white/60", "rounded-3xl", "shadow-[0_20px_40px_-15px_rgba(18,124,140,0.1)]", "animate-puzzle-up", "stagger-6"], [1, "flex-1", "bg-white", "rounded-2xl", "p-6", "shadow-sm", "border", "border-gray-50", "hover:shadow-md", "transition-shadow", "animate-puzzle-up", "stagger-7"], [1, "flex", "items-center", "gap-4", "mb-4"], [1, "w-12", "h-12", "rounded-full", "bg-zadna-primary/10", "flex", "items-center", "justify-center", "text-zadna-primary"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-6", "h-6"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"], [1, "text-sm", "font-bold", "text-gray-400", "uppercase", "tracking-wider"], [1, "text-3xl", "font-black", "text-gray-800"], [1, "flex-1", "bg-gradient-to-br", "from-zadna-primary", "to-[#0A5460]", "rounded-2xl", "p-6", "shadow-lg", "relative", "overflow-hidden", "text-white", "group", "animate-puzzle-up", "stagger-8"], [1, "absolute", "top-0", "right-0", "w-32", "h-32", "bg-white/5", "rounded-full", "-mr-16", "-mt-16", "transition-transform", "group-hover:scale-150", "duration-700"], [1, "flex", "items-center", "gap-4", "mb-4", "relative", "z-10"], [1, "w-12", "h-12", "rounded-full", "bg-white/20", "flex", "items-center", "justify-center", "backdrop-blur-sm"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"], [1, "text-sm", "font-bold", "text-white/70", "uppercase", "tracking-wider"], [1, "text-3xl", "font-black", "relative", "z-10"], [1, "w-full", "max-w-[560px]", "xl:w-[45%]", "shrink-0", "relative", "flex", "justify-center", "xl:justify-end", "animate-puzzle-right", "stagger-2"], [1, "w-full", "max-w-[560px]", "relative"], [1, "absolute", "-top-10", "-right-10", "w-40", "h-40", "bg-zadna-accent/20", "rounded-full", "blur-2xl"], [1, "absolute", "-bottom-10", "-left-10", "w-40", "h-40", "bg-zadna-primary/20", "rounded-full", "blur-2xl"], [1, "bg-white/80", "backdrop-blur-2xl", "border", "border-white", "rounded-[2rem]", "p-10", "md:p-12", "shadow-[0_30px_60px_-15px_rgba(18,124,140,0.15)]", "relative", "overflow-hidden"], [1, "absolute", "top-0", "left-0", "right-0", "h-1.5", "bg-gradient-to-r", "from-zadna-primary", "via-zadna-accent", "to-zadna-primary"], [1, "flex", "flex-col", "items-center", "mb-12", "text-center", "animate-puzzle-scale-rotate", "stagger-4"], [1, "w-full", "h-28", "relative", "flex", "items-center", "justify-center", "group", "cursor-default"], [1, "absolute", "inset-0", "bg-zadna-primary/10", "rounded-full", "blur-2xl", "scale-75", "group-hover:scale-110", "transition-transform", "duration-700"], ["src", "assets/images/\u0634\u0639\u0627\u0631 2-20260305T104717Z-3-001/\u0634\u0639\u0627\u0631 2/\u0634\u0641\u0627\u0641 (1).png", "alt", "Zadana Logo", "onerror", "this.style.display='none'; this.nextElementSibling.style.display='flex';", 1, "w-full", "h-full", "object-contain", "filter", "drop-shadow-[0_8px_16px_rgba(18,124,140,0.2)]", "z-10", "transition-transform", "duration-500", "hover:scale-110"], [1, "absolute", "inset-0", "hidden", "items-center", "justify-center", "text-zadna-primary", 2, "display", "none"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-12", "h-12"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"], [1, "text-3xl", "font-black", "text-gray-900", "tracking-tight", "mt-6", "animate-puzzle-up", "stagger-5"], ["class", "rounded-2xl bg-red-50/40 backdrop-blur-md border border-red-100/50 p-5 mb-10 flex items-center gap-4 shadow-[0_10px_20px_-10px_rgba(239,68,68,0.2)] animate-puzzle-up", 4, "ngIf"], [1, "space-y-6", 3, "ngSubmit", "formGroup"], [1, "space-y-2", "animate-puzzle-up", "stagger-6"], ["for", "email", 1, "text-xs", "font-black", "text-gray-400", "uppercase", "tracking-widest", "block", 3, "ngClass"], [1, "relative", "group"], [1, "absolute", "inset-y-0", "flex", "items-center", "pointer-events-none", "text-gray-300", "group-focus-within:text-zadna-primary", "transition-colors", 3, "ngClass"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"], ["id", "email", "formControlName", "identifier", "type", "text", "autocomplete", "email", "required", "", 1, "block", "w-full", "py-4", "bg-gray-50/50", "border-2", "focus:border-zadna-primary/30", "focus:bg-white", "text-gray-900", "rounded-2xl", "placeholder-gray-300", "focus:outline-none", "focus:ring-4", "focus:ring-zadna-primary/10", "transition-all", "font-bold", "text-base", "shadow-sm", "hover:shadow-md", 3, "placeholder", "ngClass"], ["class", "px-1 animate-puzzle-up", 4, "ngIf"], [1, "space-y-2", "animate-puzzle-up", "stagger-7"], [1, "flex", "items-center", "justify-between", "mx-1"], ["for", "password", 1, "text-xs", "font-black", "text-gray-400", "uppercase", "tracking-widest"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"], ["id", "password", "formControlName", "password", "autocomplete", "current-password", "required", "", 1, "block", "w-full", "py-4", "bg-gray-50/50", "border-2", "focus:border-zadna-primary/30", "focus:bg-white", "text-gray-900", "rounded-2xl", "placeholder-gray-300", "focus:outline-none", "focus:ring-4", "focus:ring-zadna-primary/10", "transition-all", "font-bold", "text-lg", "tracking-[0.2em]", "shadow-sm", "hover:shadow-md", 3, "type", "placeholder", "ngClass"], ["type", "button", 1, "absolute", "inset-y-0", "flex", "items-center", "text-gray-300", "hover:text-zadna-primary", "transition-colors", "focus:outline-none", "cursor-pointer", 3, "click", "ngClass"], ["class", "w-5 h-5", "fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 4, "ngIf"], [1, "pt-6", "animate-puzzle-up", "stagger-8"], ["type", "submit", 1, "group", "relative", "w-full", "flex", "justify-center", "items-center", "py-4", "px-4", "overflow-hidden", "rounded-2xl", "shadow-[0_8px_20px_rgba(18,124,140,0.3)]", "font-black", "text-white", "bg-zadna-primary", "focus:outline-none", "disabled:opacity-50", "disabled:cursor-not-allowed", "transition-transform", "active:scale-[0.98]", 3, "disabled"], [1, "absolute", "inset-0", "bg-gradient-to-r", "from-zadna-primaryDark", "via-zadna-primary", "to-zadna-primaryDark", "opacity-0", "group-hover:opacity-100", "transition-opacity", "duration-500"], ["class", "mr-3 relative z-10", 4, "ngIf"], ["class", "relative z-10 tracking-widest uppercase", 4, "ngIf"], ["class", "flex items-center relative z-10 tracking-widest uppercase", 4, "ngIf"], [1, "mt-8", "flex", "items-center", "justify-center", "text-xs", "font-bold", "text-gray-400"], ["href", "#", 1, "hover:text-zadna-primary", "transition-colors", "hover:underline", "underline-offset-4", "decoration-2"], [1, "rounded-2xl", "bg-red-50/40", "backdrop-blur-md", "border", "border-red-100/50", "p-5", "mb-10", "flex", "items-center", "gap-4", "shadow-[0_10px_20px_-10px_rgba(239,68,68,0.2)]", "animate-puzzle-up"], [1, "flex-shrink-0", "w-12", "h-12", "rounded-full", "bg-red-500/10", "flex", "items-center", "justify-center"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-6", "h-6", "text-red-500"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"], [1, "text-[13px]", "font-bold", "text-red-900", "leading-relaxed"], [1, "px-1", "animate-puzzle-up"], ["class", "text-[10px] sm:text-xs font-bold text-red-500 flex items-center gap-1", 4, "ngIf"], [1, "text-[10px]", "sm:text-xs", "font-bold", "text-red-500", "flex", "items-center", "gap-1"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-3", "h-3"], ["fill-rule", "evenodd", "d", "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", "clip-rule", "evenodd"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15 12a3 3 0 11-6 0 3 3 0 016 0z"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"], [1, "mr-3", "relative", "z-10"], ["fill", "none", "viewBox", "0 0 24 24", 1, "animate-spin", "h-5", "w-5", "text-white"], ["cx", "12", "cy", "12", "r", "10", "stroke", "currentColor", "stroke-width", "4", 1, "opacity-25"], ["fill", "currentColor", "d", "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z", 1, "opacity-75"], [1, "relative", "z-10", "tracking-widest", "uppercase"], [1, "flex", "items-center", "relative", "z-10", "tracking-widest", "uppercase"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "transition-transform", "duration-300", 3, "ngClass"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M14 5l7 7m0 0l-7 7m7-7H3", 4, "ngIf"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M10 19l-7-7m0 0l7-7m-7 7h18", 4, "ngIf"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M14 5l7 7m0 0l-7 7m7-7H3"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M10 19l-7-7m0 0l7-7m-7 7h18"]], template: function LoginComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1);
      \u0275\u0275element(2, "div", 2)(3, "div", 3)(4, "div", 4);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "div", 5)(6, "div", 6)(7, "button", 7);
      \u0275\u0275listener("click", function LoginComponent_Template_button_click_7_listener() {
        return ctx.switchLanguage("en");
      });
      \u0275\u0275text(8, " EN ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "button", 7);
      \u0275\u0275listener("click", function LoginComponent_Template_button_click_9_listener() {
        return ctx.switchLanguage("ar");
      });
      \u0275\u0275text(10, " \u0639\u0631\u0628\u064A ");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(11, "div", 8)(12, "div", 9)(13, "div", 10)(14, "span", 11);
      \u0275\u0275element(15, "span", 12)(16, "span", 13);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(17, "span", 14);
      \u0275\u0275text(18);
      \u0275\u0275pipe(19, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(20, "h1", 15)(21, "div", 16);
      \u0275\u0275text(22);
      \u0275\u0275pipe(23, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(24, "span", 17)(25, "span", 18);
      \u0275\u0275text(26);
      \u0275\u0275pipe(27, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(28, "svg", 19);
      \u0275\u0275element(29, "path", 20);
      \u0275\u0275elementEnd()()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(30, "p", 21);
      \u0275\u0275text(31);
      \u0275\u0275pipe(32, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(33, "div", 22)(34, "div", 23)(35, "div", 24)(36, "div", 25);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(37, "svg", 26);
      \u0275\u0275element(38, "path", 27);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(39, "span", 28);
      \u0275\u0275text(40);
      \u0275\u0275pipe(41, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(42, "p", 29);
      \u0275\u0275text(43);
      \u0275\u0275pipe(44, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(45, "div", 30);
      \u0275\u0275element(46, "div", 31);
      \u0275\u0275elementStart(47, "div", 32)(48, "div", 33);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(49, "svg", 26);
      \u0275\u0275element(50, "path", 34);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(51, "span", 35);
      \u0275\u0275text(52);
      \u0275\u0275pipe(53, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(54, "p", 36);
      \u0275\u0275text(55);
      \u0275\u0275pipe(56, "translate");
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(57, "div", 37)(58, "div", 38);
      \u0275\u0275element(59, "div", 39)(60, "div", 40);
      \u0275\u0275elementStart(61, "div", 41);
      \u0275\u0275element(62, "div", 42);
      \u0275\u0275elementStart(63, "div", 43)(64, "div", 44);
      \u0275\u0275element(65, "div", 45)(66, "img", 46);
      \u0275\u0275elementStart(67, "div", 47);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(68, "svg", 48);
      \u0275\u0275element(69, "path", 49);
      \u0275\u0275elementEnd()()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(70, "h2", 50);
      \u0275\u0275text(71);
      \u0275\u0275pipe(72, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275template(73, LoginComponent_div_73_Template, 6, 1, "div", 51);
      \u0275\u0275elementStart(74, "form", 52);
      \u0275\u0275listener("ngSubmit", function LoginComponent_Template_form_ngSubmit_74_listener() {
        return ctx.onSubmit();
      });
      \u0275\u0275elementStart(75, "div", 53)(76, "label", 54);
      \u0275\u0275text(77);
      \u0275\u0275pipe(78, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(79, "div", 55)(80, "div", 56);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(81, "svg", 57);
      \u0275\u0275element(82, "path", 58);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275element(83, "input", 59);
      \u0275\u0275pipe(84, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275template(85, LoginComponent_div_85_Template, 3, 2, "div", 60);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(86, "div", 61)(87, "div", 62)(88, "label", 63);
      \u0275\u0275text(89);
      \u0275\u0275pipe(90, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(91, "div", 55)(92, "div", 56);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(93, "svg", 57);
      \u0275\u0275element(94, "path", 64);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275element(95, "input", 65);
      \u0275\u0275pipe(96, "translate");
      \u0275\u0275elementStart(97, "button", 66);
      \u0275\u0275listener("click", function LoginComponent_Template_button_click_97_listener() {
        return ctx.togglePassword();
      });
      \u0275\u0275template(98, LoginComponent__svg_svg_98_Template, 3, 0, "svg", 67)(99, LoginComponent__svg_svg_99_Template, 2, 0, "svg", 67);
      \u0275\u0275elementEnd()();
      \u0275\u0275template(100, LoginComponent_div_100_Template, 2, 1, "div", 60);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(101, "div", 68)(102, "button", 69);
      \u0275\u0275element(103, "div", 70);
      \u0275\u0275template(104, LoginComponent_span_104_Template, 4, 0, "span", 71)(105, LoginComponent_span_105_Template, 3, 3, "span", 72)(106, LoginComponent_span_106_Template, 6, 6, "span", 73);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(107, "div", 74)(108, "a", 75);
      \u0275\u0275text(109);
      \u0275\u0275pipe(110, "translate");
      \u0275\u0275elementEnd()()()()()()();
    }
    if (rf & 2) {
      let tmp_17_0;
      let tmp_18_0;
      let tmp_23_0;
      let tmp_27_0;
      \u0275\u0275advance(7);
      \u0275\u0275property("ngClass", \u0275\u0275pureFunction2(61, _c0, ctx.translate.currentLang === "en", ctx.translate.currentLang !== "en"));
      \u0275\u0275advance(2);
      \u0275\u0275property("ngClass", \u0275\u0275pureFunction2(64, _c0, ctx.translate.currentLang === "ar", ctx.translate.currentLang !== "ar"));
      \u0275\u0275advance(9);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(19, 33, "LOGIN.ADMIN_PORTAL"));
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(23, 35, "LOGIN.MANAGE_MARKETPLACE"));
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(27, 37, "LOGIN.MARKETPLACE_HIGHLIGHT"));
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(32, 39, "LOGIN.MARKETPLACE_DESC"), " ");
      \u0275\u0275advance(9);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(41, 41, "LOGIN.SYSTEM_UPTIME"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(44, 43, "LOGIN.UPTIME_VALUE"));
      \u0275\u0275advance(9);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(53, 45, "LOGIN.ACTIVE_MONITOR"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(56, 47, "LOGIN.MONITOR_VALUE"));
      \u0275\u0275advance(16);
      \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(72, 49, "LOGIN.WELCOME"), " ");
      \u0275\u0275advance(2);
      \u0275\u0275property("ngIf", ctx.errorMessage);
      \u0275\u0275advance();
      \u0275\u0275property("formGroup", ctx.loginForm);
      \u0275\u0275advance(2);
      \u0275\u0275property("ngClass", ctx.translate.currentLang === "ar" ? "mr-1" : "ml-1");
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(78, 51, "LOGIN.EMAIL"), " ");
      \u0275\u0275advance(3);
      \u0275\u0275property("ngClass", ctx.translate.currentLang === "ar" ? "right-0 pr-4" : "left-0 pl-4");
      \u0275\u0275advance(3);
      \u0275\u0275property("placeholder", \u0275\u0275pipeBind1(84, 53, "LOGIN.EMAIL_PLACEHOLDER"))("ngClass", \u0275\u0275pureFunction2(67, _c1, ctx.translate.currentLang === "ar" ? "pr-12 pl-4" : "pl-12 pr-4", (((tmp_17_0 = ctx.loginForm.get("identifier")) == null ? null : tmp_17_0.touched) || ctx.submitted) && ((tmp_17_0 = ctx.loginForm.get("identifier")) == null ? null : tmp_17_0.invalid) ? "border-red-400 bg-red-50/20" : "border-transparent"));
      \u0275\u0275advance(2);
      \u0275\u0275property("ngIf", (((tmp_18_0 = ctx.loginForm.get("identifier")) == null ? null : tmp_18_0.touched) || ctx.submitted) && ((tmp_18_0 = ctx.loginForm.get("identifier")) == null ? null : tmp_18_0.invalid));
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(90, 55, "LOGIN.PASSWORD"), " ");
      \u0275\u0275advance(3);
      \u0275\u0275property("ngClass", ctx.translate.currentLang === "ar" ? "right-0 pr-4" : "left-0 pl-4");
      \u0275\u0275advance(3);
      \u0275\u0275property("type", ctx.showPassword ? "text" : "password")("placeholder", \u0275\u0275pipeBind1(96, 57, "LOGIN.PASSWORD_PLACEHOLDER"))("ngClass", \u0275\u0275pureFunction2(70, _c1, ctx.translate.currentLang === "ar" ? "pr-12 pl-12" : "pl-12 pr-12", (((tmp_23_0 = ctx.loginForm.get("password")) == null ? null : tmp_23_0.touched) || ctx.submitted) && ((tmp_23_0 = ctx.loginForm.get("password")) == null ? null : tmp_23_0.invalid) ? "border-red-400 bg-red-50/20" : "border-transparent"));
      \u0275\u0275advance(2);
      \u0275\u0275property("ngClass", ctx.translate.currentLang === "ar" ? "left-0 pl-4" : "right-0 pr-4");
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.showPassword);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.showPassword);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", (((tmp_27_0 = ctx.loginForm.get("password")) == null ? null : tmp_27_0.touched) || ctx.submitted) && ((tmp_27_0 = ctx.loginForm.get("password")) == null ? null : tmp_27_0.invalid));
      \u0275\u0275advance(2);
      \u0275\u0275property("disabled", ctx.isLoading);
      \u0275\u0275advance(2);
      \u0275\u0275property("ngIf", ctx.isLoading);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.isLoading);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.isLoading);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(110, 59, "LOGIN.FORGOT_PASSWORD"), " ");
    }
  }, dependencies: [CommonModule, NgClass, NgIf, ReactiveFormsModule, \u0275NgNoValidate, DefaultValueAccessor, NgControlStatus, NgControlStatusGroup, RequiredValidator, FormGroupDirective, FormControlName, TranslateModule, TranslatePipe], encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(LoginComponent, { className: "LoginComponent", filePath: "src\\app\\features\\auth\\login\\login.component.ts", lineNumber: 14 });
})();

// src/app/core/layout/components/sidebar/sidebar.component.ts
var _c02 = ["*"];
var _c12 = () => ({ exact: true });
var SidebarComponent = class _SidebarComponent {
  currentLang = "ar";
  static \u0275fac = function SidebarComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SidebarComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SidebarComponent, selectors: [["app-sidebar"]], inputs: { currentLang: "currentLang" }, standalone: true, features: [\u0275\u0275StandaloneFeature], ngContentSelectors: _c02, decls: 108, vars: 41, consts: [[1, "h-full", "w-[280px]", "bg-white/70", "backdrop-blur-3xl", "border-e", "lg:border-y-0", "lg:border-s-0", "lg:border-e", "border-slate-200/60", "shadow-[20px_0_50px_rgba(0,0,0,0.03)]", "flex", "flex-col", "z-40", "ltr:animate-puzzle-left", "rtl:animate-puzzle-right", "group/sidebar", "overflow-hidden", "lg:m-0"], [1, "p-6", "flex", "items-center", "justify-center", "group/brand", "relative"], [1, "absolute", "inset-x-0", "-top-10", "h-40", "bg-zadna-primary/5", "blur-3xl", "rounded-full", "opacity-60"], [1, "relative", "flex", "flex-col", "items-center", "gap-2"], [1, "absolute", "inset-0", "bg-gradient-to-br", "from-zadna-primary/10", "to-transparent", "blur-2xl", "animate-pulse", "opacity-30"], [1, "w-24", "relative", "z-10", "animate-puzzle-scale-rotate", "transform-gpu", "hover:scale-105", "transition-all", "duration-700"], ["src", "assets/images/\u0634\u0639\u0627\u0631 2-20260305T104717Z-3-001/\u0634\u0639\u0627\u0631 2/\u0634\u0641\u0627\u0641 (1).png", "alt", "Zadana", 1, "w-full", "h-auto", "object-contain", "filter", "drop-shadow-2xl", "select-none"], [1, "relative", "z-10", "text-center", "animate-puzzle-up"], [1, "text-xl", "font-black", "tracking-tight", "text-zadna-bgDark", "bg-clip-text", "text-transparent", "bg-gradient-to-r", "from-zadna-bgDark", "via-slate-600", "to-zadna-bgDark"], [1, "flex", "items-center", "justify-center", "gap-1.5", "mt-1.5", "opacity-60"], [1, "w-1.5", "h-1.5", "rounded-full", "bg-zadna-primary", "animate-ping"], [1, "text-[9px]", "font-black", "text-zadna-primary", "uppercase", "tracking-[0.25em]"], [1, "flex-1", "px-4", "space-y-8", "overflow-y-auto", "pb-8", "custom-scrollbar", "scroll-smooth"], [1, "space-y-2"], [1, "px-5", "text-[10px]", "font-black", "text-zadna-bgDark/20", "uppercase", "tracking-[0.3em]", "flex", "items-center", "justify-between"], [1, "w-8", "h-[1px]", "bg-zadna-bgDark/5"], [1, "space-y-1.5"], ["routerLink", "/dashboard", "routerLinkActive", "active-link", 1, "nav-item", "group", "stagger-2", 3, "routerLinkActiveOptions"], [1, "nav-icon-box"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"], [1, "flex-1", "flex", "items-center", "justify-between"], [1, "font-black", "tracking-tight", "text-xs"], [1, "w-1.5", "h-1.5", "rounded-full", "bg-zadna-primary", "opacity-0", "group-[.active-link]:opacity-100", "shadow-[0_0_10px_#127C8C]"], ["routerLink", "/vendors", "routerLinkActive", "active-link", 1, "nav-item", "group", "stagger-3"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"], ["routerLink", "/catalog/categories", "routerLinkActive", "active-link", 1, "nav-item", "group", "stagger-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"], ["routerLink", "/catalog/products", "routerLinkActive", "active-link", 1, "nav-item", "group", "stagger-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"], ["routerLink", "/catalog/brands", "routerLinkActive", "active-link", 1, "nav-item", "group", "stagger-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"], ["routerLink", "/settings", "routerLinkActive", "active-link", 1, "nav-item", "group", "stagger-5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "1.5", "d", "M15 12a3 3 0 11-6 0 3 3 0 016 0z"], [1, "px-4", "py-6"], [1, "p-4", "bg-zadna-primary/5", "rounded-[1.2rem]", "border", "border-zadna-primary/10", "group/health", "hover:bg-zadna-primary/10", "transition-all", "stagger-6"], [1, "flex", "items-center", "justify-between", "mb-3"], [1, "text-[8px]", "font-black", "text-zadna-primary", "uppercase", "tracking-[0.2em]"], [1, "flex", "h-2", "w-2", "relative"], [1, "animate-ping", "absolute", "inline-flex", "h-full", "w-full", "rounded-full", "bg-zadna-primary", "opacity-75"], [1, "relative", "inline-flex", "rounded-full", "h-2", "w-2", "bg-zadna-primary"], [1, "text-[10px]", "font-black", "text-zadna-bgDark", "mb-1"], [1, "text-[8px]", "font-black", "text-zadna-bgDark/30", "uppercase", "tracking-tighter"]], template: function SidebarComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275projectionDef();
      \u0275\u0275elementStart(0, "aside", 0)(1, "div", 1);
      \u0275\u0275element(2, "div", 2);
      \u0275\u0275elementStart(3, "div", 3);
      \u0275\u0275element(4, "div", 4);
      \u0275\u0275elementStart(5, "div", 5);
      \u0275\u0275element(6, "img", 6);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(7, "div", 7)(8, "span", 8);
      \u0275\u0275text(9);
      \u0275\u0275pipe(10, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(11, "div", 9);
      \u0275\u0275element(12, "span", 10);
      \u0275\u0275elementStart(13, "span", 11);
      \u0275\u0275text(14, "Operational");
      \u0275\u0275elementEnd()()()()();
      \u0275\u0275elementStart(15, "nav", 12)(16, "div", 13)(17, "p", 14)(18, "span");
      \u0275\u0275text(19);
      \u0275\u0275pipe(20, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275element(21, "span", 15);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(22, "div", 16)(23, "a", 17)(24, "div", 18);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(25, "svg", 19);
      \u0275\u0275element(26, "path", 20);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(27, "div", 21)(28, "span", 22);
      \u0275\u0275text(29);
      \u0275\u0275pipe(30, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275element(31, "span", 23);
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(32, "div", 13)(33, "p", 14)(34, "span");
      \u0275\u0275text(35);
      \u0275\u0275pipe(36, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275element(37, "span", 15);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(38, "div", 16)(39, "a", 24)(40, "div", 18);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(41, "svg", 19);
      \u0275\u0275element(42, "path", 25);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(43, "div", 21)(44, "span", 22);
      \u0275\u0275text(45);
      \u0275\u0275pipe(46, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275element(47, "span", 23);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(48, "a", 26)(49, "div", 18);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(50, "svg", 19);
      \u0275\u0275element(51, "path", 27);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(52, "div", 21)(53, "span", 22);
      \u0275\u0275text(54);
      \u0275\u0275pipe(55, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275element(56, "span", 23);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(57, "a", 28)(58, "div", 18);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(59, "svg", 19);
      \u0275\u0275element(60, "path", 29);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(61, "div", 21)(62, "span", 22);
      \u0275\u0275text(63);
      \u0275\u0275pipe(64, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275element(65, "span", 23);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(66, "a", 30)(67, "div", 18);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(68, "svg", 19);
      \u0275\u0275element(69, "path", 31);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(70, "div", 21)(71, "span", 22);
      \u0275\u0275text(72);
      \u0275\u0275pipe(73, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275element(74, "span", 23);
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(75, "div", 13)(76, "p", 14)(77, "span");
      \u0275\u0275text(78);
      \u0275\u0275pipe(79, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275element(80, "span", 15);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(81, "div", 16)(82, "a", 32)(83, "div", 18);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(84, "svg", 19);
      \u0275\u0275element(85, "path", 33)(86, "path", 34);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(87, "div", 21)(88, "span", 22);
      \u0275\u0275text(89);
      \u0275\u0275pipe(90, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275element(91, "span", 23);
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(92, "div", 35)(93, "div", 36)(94, "div", 37)(95, "span", 38);
      \u0275\u0275text(96);
      \u0275\u0275pipe(97, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(98, "span", 39);
      \u0275\u0275element(99, "span", 40)(100, "span", 41);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(101, "p", 42);
      \u0275\u0275text(102);
      \u0275\u0275pipe(103, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(104, "p", 43);
      \u0275\u0275text(105);
      \u0275\u0275pipe(106, "translate");
      \u0275\u0275elementEnd()()();
      \u0275\u0275projection(107);
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275advance(9);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(10, 14, "SIDEBAR_EXTRA.WELCOME_USER"), " ");
      \u0275\u0275advance(10);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(20, 16, "SIDEBAR_EXTRA.HQ_CORE"));
      \u0275\u0275advance(4);
      \u0275\u0275property("routerLinkActiveOptions", \u0275\u0275pureFunction0(40, _c12));
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(30, 18, "SIDEBAR.HOME"));
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(36, 20, "SIDEBAR_EXTRA.ECOSYSTEM"));
      \u0275\u0275advance(10);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(46, 22, "SIDEBAR.VENDORS.TITLE"));
      \u0275\u0275advance(9);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(55, 24, "SIDEBAR.CATALOG_HIERARCHY"));
      \u0275\u0275advance(9);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(64, 26, "SIDEBAR.CATALOG_PRODUCTS"));
      \u0275\u0275advance(9);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(73, 28, "SIDEBAR.BRANDS"));
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(79, 30, "SIDEBAR_EXTRA.CONFIG"));
      \u0275\u0275advance(11);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(90, 32, "SIDEBAR.SETTINGS"));
      \u0275\u0275advance(7);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(97, 34, "SIDEBAR_EXTRA.NETWORK_HEALTH"));
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind1(103, 36, "SIDEBAR_EXTRA.UPTIME_STAT"), " ");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(106, 38, "SIDEBAR_EXTRA.CLOUD_SERVICES"));
    }
  }, dependencies: [CommonModule, RouterModule, RouterLink, RouterLinkActive, TranslateModule, TranslatePipe] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SidebarComponent, { className: "SidebarComponent", filePath: "src\\app\\core\\layout\\components\\sidebar\\sidebar.component.ts", lineNumber: 13 });
})();

// src/app/core/layout/components/header/header.component.ts
function HeaderComponent__svg_svg_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 31);
    \u0275\u0275element(1, "path", 32);
    \u0275\u0275elementEnd();
  }
}
function HeaderComponent__svg_svg_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 31);
    \u0275\u0275element(1, "path", 33);
    \u0275\u0275elementEnd();
  }
}
var HeaderComponent = class _HeaderComponent {
  currentLang = "ar";
  isSidebarOpen = false;
  languageSwitch = new EventEmitter();
  toggleSidebar = new EventEmitter();
  onLanguageSwitch() {
    this.languageSwitch.emit();
  }
  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
  reload() {
    window.location.reload();
  }
  static \u0275fac = function HeaderComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _HeaderComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _HeaderComponent, selectors: [["app-header"]], inputs: { currentLang: "currentLang", isSidebarOpen: "isSidebarOpen" }, outputs: { languageSwitch: "languageSwitch", toggleSidebar: "toggleSidebar" }, standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 39, vars: 9, consts: [[1, "sticky", "top-4", "sm:top-5", "lg:top-3", "z-30", "mb-5", "sm:mb-6", "lg:mb-4", "animate-puzzle-down"], [1, "premium-glass-light", "rounded-2xl", "sm:rounded-[2.5rem]", "p-3", "sm:p-4", "lg:p-2.5", "flex", "items-center", "justify-between", "shadow-[0_15px_40px_rgba(0,0,0,0.035)]"], [1, "flex", "items-center", "gap-2", "sm:gap-4", "flex-1"], [1, "lg:hidden", "w-10", "h-10", "rounded-xl", "bg-zadna-primary", "text-white", "flex", "items-center", "justify-center", "active:scale-90", "transition-all", "shadow-lg", "shadow-zadna-primary/20", 3, "click"], ["class", "w-5 h-5", "fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 4, "ngIf"], [1, "relative", "group", "hidden", "sm:block", "max-w-[200px]", "sm:max-w-md", "w-full"], [1, "absolute", "inset-y-0", "start-4", "flex", "items-center", "pointer-events-none"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "text-zadna-bgDark/20", "group-focus-within:text-zadna-primary", "transition-colors"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"], ["type", "text", 1, "w-full", "ps-10", "sm:ps-11", "pe-4", "sm:pe-6", "py-2", "sm:py-2.5", "bg-zadna-bgLight/30", "rounded-xl", "sm:rounded-[1.2rem]", "text-[10px]", "sm:text-xs", "font-bold", "outline-none", "placeholder-zadna-bgDark/20", "text-zadna-bgDark", "border-2", "border-transparent", "focus:border-zadna-primary/10", "focus:bg-white", "transition-all", 3, "placeholder"], [1, "absolute", "end-4", "top-1/2", "-translate-y-1/2", "hidden", "md:flex", "gap-1", "pointer-events-none", "opacity-0", "group-hover:opacity-100", "transition-opacity"], [1, "px-1.5", "py-0.5", "bg-white", "border", "rounded", "text-[8px]", "font-black", "text-zadna-bgDark/40"], [1, "flex", "items-center", "gap-1.5", "sm:gap-3"], [1, "hidden", "sm:flex", "w-9", "h-9", "sm:w-10", "sm:h-10", "rounded-full", "bg-white", "border", "border-zadna-bgLight", "items-center", "justify-center", "text-zadna-bgDark/30", "hover:text-zadna-primary", "hover:border-zadna-primary/20", "transition-all", "active:scale-90", "group/sync", "shadow-sm", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "group-hover/sync:rotate-180", "transition-transform", "duration-700"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"], [1, "flex", "items-center", "gap-2", "px-3.5", "h-10", "bg-white", "border", "border-zadna-bgLight", "rounded-full", "hover:border-zadna-primary/20", "transition-all", "active:scale-95", "group/lang", "shadow-sm", 3, "click"], [1, "w-5", "h-5", "rounded-full", "bg-zadna-primary/5", "flex", "items-center", "justify-center", "text-zadna-primary"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3.5", "h-3.5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"], [1, "text-[9px]", "font-black", "uppercase", "tracking-[0.2em]", "text-zadna-bgDark"], [1, "w-11", "h-11", "rounded-full", "bg-zadna-primary/5", "hover:bg-zadna-primary/10", "text-zadna-primary", "flex", "items-center", "justify-center", "transition-all", "active:scale-95", "group/btn", "border", "border-zadna-primary/5"], [1, "relative"], [1, "absolute", "top-0", "end-0", "w-2", "h-2", "bg-zadna-accent", "border-2", "border-white", "rounded-full"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5", "group-hover/btn:rotate-12", "transition-transform"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"], [1, "hidden", "md:flex", "items-center", "gap-2", "ps-1.5", "pe-4", "py-1.5", "bg-zadna-primary", "rounded-full", "text-white", "shadow-xl", "shadow-zadna-primary/20", "hover:brightness-110", "hover:-translate-y-0.5", "transition-all", "active:scale-95", "group/live", "whitespace-nowrap"], [1, "w-8", "h-8", "rounded-full", "bg-white/10", "flex", "items-center", "justify-center", "group-hover/live:bg-zadna-primary", "transition-colors"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4", "rtl:-scale-x-100"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"], [1, "text-[10px]", "font-black", "tracking-[0.2em]", "uppercase"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M4 6h16M4 12h16M4 18h16"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M6 18L18 6M6 6l12 12"]], template: function HeaderComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "header", 0)(1, "div", 1)(2, "div", 2)(3, "button", 3);
      \u0275\u0275listener("click", function HeaderComponent_Template_button_click_3_listener() {
        return ctx.onToggleSidebar();
      });
      \u0275\u0275template(4, HeaderComponent__svg_svg_4_Template, 2, 0, "svg", 4)(5, HeaderComponent__svg_svg_5_Template, 2, 0, "svg", 4);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(6, "div", 5)(7, "div", 6);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(8, "svg", 7);
      \u0275\u0275element(9, "path", 8);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275element(10, "input", 9);
      \u0275\u0275pipe(11, "translate");
      \u0275\u0275elementStart(12, "div", 10)(13, "span", 11);
      \u0275\u0275text(14, "\u2318");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(15, "span", 11);
      \u0275\u0275text(16, "K");
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(17, "div", 12)(18, "button", 13);
      \u0275\u0275listener("click", function HeaderComponent_Template_button_click_18_listener() {
        return ctx.reload();
      });
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(19, "svg", 14);
      \u0275\u0275element(20, "path", 15);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(21, "button", 16);
      \u0275\u0275listener("click", function HeaderComponent_Template_button_click_21_listener() {
        return ctx.onLanguageSwitch();
      });
      \u0275\u0275elementStart(22, "div", 17);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(23, "svg", 18);
      \u0275\u0275element(24, "path", 19);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(25, "span", 20);
      \u0275\u0275text(26);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(27, "button", 21)(28, "div", 22);
      \u0275\u0275element(29, "span", 23);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(30, "svg", 24);
      \u0275\u0275element(31, "path", 25);
      \u0275\u0275elementEnd()()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(32, "button", 26)(33, "div", 27);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(34, "svg", 28);
      \u0275\u0275element(35, "path", 29);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(36, "span", 30);
      \u0275\u0275text(37);
      \u0275\u0275pipe(38, "translate");
      \u0275\u0275elementEnd()()()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(4);
      \u0275\u0275property("ngIf", !ctx.isSidebarOpen);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.isSidebarOpen);
      \u0275\u0275advance(5);
      \u0275\u0275property("placeholder", \u0275\u0275pipeBind1(11, 5, "SIDEBAR.SEARCH"));
      \u0275\u0275advance(16);
      \u0275\u0275textInterpolate(ctx.currentLang === "ar" ? "EN" : "AR");
      \u0275\u0275advance(11);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(38, 7, "SIDEBAR_EXTRA.LIVE_OPS"));
    }
  }, dependencies: [CommonModule, NgIf, TranslateModule, TranslatePipe] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(HeaderComponent, { className: "HeaderComponent", filePath: "src\\app\\core\\layout\\components\\header\\header.component.ts", lineNumber: 12 });
})();

// src/app/core/layout/components/user-profile/user-profile.component.ts
var UserProfileComponent = class _UserProfileComponent {
  userName = "Admin";
  logout = new EventEmitter();
  onLogout() {
    this.logout.emit();
  }
  static \u0275fac = function UserProfileComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _UserProfileComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _UserProfileComponent, selectors: [["app-user-profile"]], inputs: { userName: "userName" }, outputs: { logout: "logout" }, standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 24, vars: 7, consts: [[1, "p-4", "stagger-7"], [1, "p-4", "bg-white", "shadow-2xl", "shadow-zadna-bgDark/5", "rounded-[1.5rem]", "border", "border-zadna-bgLight", "relative", "group/profile", "overflow-hidden"], [1, "absolute", "inset-0", "bg-gradient-to-br", "from-zadna-primary/5", "to-zadna-accent/5", "opacity-0", "group-hover/profile:opacity-100", "transition-opacity", "duration-500"], [1, "flex", "items-center", "gap-4", "mb-5", "relative", "z-10"], [1, "relative"], [1, "w-14", "h-14", "rounded-2xl", "bg-white/50", "backdrop-blur-sm", "p-2", "shadow-sm", "transition-transform", "group-hover/profile:rotate-3", "overflow-hidden", "border", "border-white/50"], [1, "w-full", "h-full", "flex", "items-center", "justify-center", "overflow-hidden"], ["src", "assets/images/\u0634\u0639\u0627\u0631 2-20260305T104717Z-3-001/\u0634\u0639\u0627\u0631 2/\u0634\u0641\u0627\u0641 (1).png", 1, "w-full", "h-full", "object-contain", "filter", "drop-shadow-sm"], [1, "absolute", "-bottom-0.5", "-end-0.5", "w-4", "h-4", "bg-emerald-500", "border-2", "border-white", "rounded-full"], [1, "flex-1", "min-w-0"], [1, "text-[11px]", "font-black", "text-zadna-bgDark", "tracking-tighter", "truncate", "leading-none", "mb-1.5"], [1, "text-[9px]", "font-black", "text-zadna-primary", "uppercase", "tracking-[0.1em]", "opacity-60"], [1, "flex", "gap-2", "relative", "z-10"], [1, "flex-1", "flex", "items-center", "justify-center", "gap-2", "py-2.5", "bg-red-50", "text-red-500", "rounded-xl", "text-[9px]", "font-black", "hover:bg-red-500", "hover:text-white", "transition-all", "active:scale-95", "group/logout", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3.5", "h-3.5", "group-hover/logout:-translate-x-1", "ltr:group-hover/logout:-translate-x-1", "rtl:group-hover/logout:translate-x-1", "rtl:rotate-180", "transition-transform"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M17 16l4-4m0 0l-4-4m4 4H7"], [1, "w-14", "flex", "items-center", "justify-center", "bg-zadna-bgLight/80", "text-zadna-bgDark/40", "rounded-2xl", "hover:bg-zadna-bgDark", "hover:text-white", "transition-all", "active:scale-95"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"]], template: function UserProfileComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1);
      \u0275\u0275element(2, "div", 2);
      \u0275\u0275elementStart(3, "div", 3)(4, "div", 4)(5, "div", 5)(6, "div", 6);
      \u0275\u0275element(7, "img", 7);
      \u0275\u0275elementEnd()();
      \u0275\u0275element(8, "span", 8);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "div", 9)(10, "p", 10);
      \u0275\u0275text(11);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(12, "p", 11);
      \u0275\u0275text(13);
      \u0275\u0275pipe(14, "translate");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(15, "div", 12)(16, "button", 13);
      \u0275\u0275listener("click", function UserProfileComponent_Template_button_click_16_listener() {
        return ctx.onLogout();
      });
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(17, "svg", 14);
      \u0275\u0275element(18, "path", 15);
      \u0275\u0275elementEnd();
      \u0275\u0275text(19);
      \u0275\u0275pipe(20, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(21, "button", 16);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(22, "svg", 17);
      \u0275\u0275element(23, "path", 18);
      \u0275\u0275elementEnd()()()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(11);
      \u0275\u0275textInterpolate1(" ", ctx.userName, "");
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(14, 3, "SIDEBAR_EXTRA.USER_ROLE_ID"), "");
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(20, 5, "SIDEBAR.LOGOUT"), " ");
    }
  }, dependencies: [CommonModule, TranslateModule, TranslatePipe] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(UserProfileComponent, { className: "UserProfileComponent", filePath: "src\\app\\core\\layout\\components\\user-profile\\user-profile.component.ts", lineNumber: 12 });
})();

// src/app/core/layout/layout.component.ts
var LayoutComponent = class _LayoutComponent {
  authService;
  router;
  translate;
  userName = "Admin";
  currentLang = "ar";
  isSidebarOpen = false;
  constructor(authService, router, translate) {
    this.authService = authService;
    this.router = router;
    this.translate = translate;
    this.currentLang = this.translate.currentLang || "ar";
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.userName = user.fullName || "Admin";
      }
    });
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
    });
    this.router.events.subscribe(() => {
      this.isSidebarOpen = false;
    });
  }
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
  switchLanguage() {
    const nextLang = this.currentLang === "ar" ? "en" : "ar";
    this.translate.use(nextLang);
  }
  logout() {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
  static \u0275fac = function LayoutComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _LayoutComponent)(\u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(TranslateService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _LayoutComponent, selectors: [["app-layout"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 16, vars: 18, consts: [[1, "min-h-screen", "bg-slate-50/50", "relative", "overflow-x-hidden", "selection:bg-zadna-primary/10", "selection:text-zadna-primary", "flex"], [1, "fixed", "inset-0", "pointer-events-none", "overflow-hidden", "z-0"], [1, "absolute", "-top-[20%]", "-start-[10%]", "w-[60%]", "h-[60%]", "bg-[radial-gradient(circle_at_center,_rgba(18,124,140,0.08)_0%,_transparent_70%)]", "blur-[100px]", "animate-pulse-slow"], [1, "absolute", "-bottom-[10%]", "-end-[5%]", "w-[50%]", "h-[50%]", "bg-[radial-gradient(circle_at_center,_rgba(228,130,21,0.04)_0%,_transparent_70%)]", "blur-[80px]", "animate-pulse-slow", "delay-700"], [1, "fixed", "inset-0", "bg-zadna-bgDark/20", "backdrop-blur-sm", "z-40", "transition-opacity", "duration-500", "lg:hidden", 3, "click"], [1, "fixed", "inset-y-0", "start-0", "z-50", "transform", "transition-transform", "duration-500", "lg:translate-x-0", 3, "currentLang"], [3, "logout", "userName"], [1, "flex-1", "flex", "flex-col", "min-h-screen", "px-4", "sm:px-6", "ltr:lg:pl-[288px]", "rtl:lg:pr-[288px]", "ltr:lg:pr-4", "rtl:lg:pl-4", "py-4", "sm:py-5", "lg:py-3.5", "transition-all", "duration-700", "relative", "z-10", "w-full", "overflow-x-hidden"], [3, "languageSwitch", "toggleSidebar", "currentLang", "isSidebarOpen"], [1, "flex-1", "w-full", "max-w-[100vw]"], [1, "fixed", "bottom-6", "end-6", "sm:bottom-10", "sm:end-10", "w-14", "h-14", "sm:w-20", "sm:h-20", "bg-zadna-bgDark", "text-white", "rounded-2xl", "sm:rounded-[1.5rem]", "shadow-2xl", "flex", "items-center", "justify-center", "hover:scale-110", "active:scale-95", "transition-all", "z-40", "group", "border-2", "sm:border-4", "border-white/50", "backdrop-blur-xl"], ["fill", "currentColor", "viewBox", "0 0 24 24", 1, "w-6", "h-6", "sm:w-8", "sm:h-8", "group-hover:rotate-12", "transition-transform"], ["d", "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"], [1, "absolute", "-top-1", "end-1", "w-5", "h-5", "sm:w-6", "sm:h-6", "bg-zadna-accent", "rounded-full", "border-2", "border-white", "flex", "items-center", "justify-center", "text-[8px]", "sm:text-[10px]", "font-black", "animate-bounce", "shadow-lg"]], template: function LayoutComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1);
      \u0275\u0275element(2, "div", 2)(3, "div", 3);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "div", 4);
      \u0275\u0275listener("click", function LayoutComponent_Template_div_click_4_listener() {
        return ctx.isSidebarOpen = false;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "app-sidebar", 5)(6, "app-user-profile", 6);
      \u0275\u0275listener("logout", function LayoutComponent_Template_app_user_profile_logout_6_listener() {
        return ctx.logout();
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(7, "main", 7)(8, "app-header", 8);
      \u0275\u0275listener("languageSwitch", function LayoutComponent_Template_app_header_languageSwitch_8_listener() {
        return ctx.switchLanguage();
      })("toggleSidebar", function LayoutComponent_Template_app_header_toggleSidebar_8_listener() {
        return ctx.toggleSidebar();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "section", 9);
      \u0275\u0275element(10, "router-outlet");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(11, "button", 10);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(12, "svg", 11);
      \u0275\u0275element(13, "path", 12);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(14, "span", 13);
      \u0275\u0275text(15, "!");
      \u0275\u0275elementEnd()()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(4);
      \u0275\u0275classProp("opacity-100", ctx.isSidebarOpen)("pointer-events-auto", ctx.isSidebarOpen)("opacity-0", !ctx.isSidebarOpen)("pointer-events-none", !ctx.isSidebarOpen);
      \u0275\u0275advance();
      \u0275\u0275classProp("translate-x-0", ctx.isSidebarOpen)("-translate-x-full", !ctx.isSidebarOpen && ctx.currentLang === "en")("translate-x-full", !ctx.isSidebarOpen && ctx.currentLang === "ar");
      \u0275\u0275property("currentLang", ctx.currentLang);
      \u0275\u0275advance();
      \u0275\u0275property("userName", ctx.userName);
      \u0275\u0275advance(2);
      \u0275\u0275property("currentLang", ctx.currentLang)("isSidebarOpen", ctx.isSidebarOpen);
    }
  }, dependencies: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    TranslateModule,
    SidebarComponent,
    HeaderComponent,
    UserProfileComponent
  ], encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(LayoutComponent, { className: "LayoutComponent", filePath: "src\\app\\core\\layout\\layout.component.ts", lineNumber: 25 });
})();

// src/app/core/guards/auth.guard.ts
var authGuard = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  if (authService.isAuthenticated) {
    return true;
  }
  return router.createUrlTree(["/login"], { queryParams: { returnUrl: state.url } });
};

// src/app/core/guards/guest.guard.ts
var guestGuard = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  if (authService.isAuthenticated) {
    return router.createUrlTree(["/dashboard"]);
  }
  return true;
};

// src/app/app.routes.ts
var routes = [
  { path: "login", component: LoginComponent, canActivate: [guestGuard] },
  {
    path: "",
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      { path: "dashboard", loadComponent: () => import("./chunk-X5KEXEFP.js").then((m) => m.DashboardComponent) },
      { path: "vendors", loadComponent: () => import("./chunk-SMG6HIAR.js").then((m) => m.VendorsListComponent) },
      { path: "vendors/:id", loadComponent: () => import("./chunk-T6NVFR22.js").then((m) => m.VendorDetailComponent) },
      { path: "catalog", loadChildren: () => import("./chunk-OTVG2OPV.js").then((m) => m.CatalogModule) }
    ]
  },
  { path: "**", redirectTo: "" }
];

// src/app/app.config.ts
var appConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateHttpLoader
      }
    }),
    provideTranslateHttpLoader({
      prefix: "assets/i18n/",
      suffix: ".json"
    })
  ]
};

// src/app/app.component.ts
var AppComponent = class _AppComponent {
  translate;
  document;
  renderer;
  title = "superadmin-panel";
  constructor(translate, document, renderer) {
    this.translate = translate;
    this.document = document;
    this.renderer = renderer;
    const savedLang = localStorage.getItem("lang") || "ar";
    this.translate.addLangs(["en", "ar"]);
    this.translate.setDefaultLang("ar");
    this.translate.use(savedLang);
    this.setDocumentDirection(savedLang);
    this.translate.onLangChange.subscribe((event) => {
      this.setDocumentDirection(event.lang);
      localStorage.setItem("lang", event.lang);
    });
  }
  setDocumentDirection(lang) {
    const htmlTag = this.document.getElementsByTagName("html")[0];
    if (lang === "ar") {
      this.renderer.setAttribute(htmlTag, "dir", "rtl");
      this.renderer.setAttribute(htmlTag, "lang", "ar");
    } else {
      this.renderer.setAttribute(htmlTag, "dir", "ltr");
      this.renderer.setAttribute(htmlTag, "lang", "en");
    }
  }
  static \u0275fac = function AppComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AppComponent)(\u0275\u0275directiveInject(TranslateService), \u0275\u0275directiveInject(DOCUMENT), \u0275\u0275directiveInject(Renderer2));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AppComponent, selectors: [["app-root"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 1, vars: 0, template: function AppComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275element(0, "router-outlet");
    }
  }, dependencies: [RouterOutlet] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AppComponent, { className: "AppComponent", filePath: "src\\app\\app.component.ts", lineNumber: 13 });
})();

// src/main.ts
bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
//# sourceMappingURL=main.js.map
