import {
  AuthService
} from "./chunk-PL22K63I.js";
import "./chunk-6L7JDGMK.js";
import {
  TranslateModule,
  TranslatePipe
} from "./chunk-FETH6UU2.js";
import {
  CommonModule,
  DatePipe,
  NgForOf,
  NgIf,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵclassMap,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵlistener,
  ɵɵnamespaceHTML,
  ɵɵnamespaceSVG,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵpureFunction1,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-IPPBI3AG.js";

// src/app/features/dashboard/dashboard.component.ts
var _c0 = (a0) => ({ name: a0 });
function DashboardComponent_div_19__svg_svg_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 67);
    \u0275\u0275element(1, "path", 68);
    \u0275\u0275elementEnd();
  }
}
function DashboardComponent_div_19__svg_svg_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 69);
    \u0275\u0275element(1, "path", 68);
    \u0275\u0275elementEnd();
  }
}
function DashboardComponent_div_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 54);
    \u0275\u0275element(1, "div", 55);
    \u0275\u0275elementStart(2, "div", 56)(3, "div", 57)(4, "p", 58);
    \u0275\u0275text(5);
    \u0275\u0275pipe(6, "translate");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "h3", 59);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "div", 60);
    \u0275\u0275template(10, DashboardComponent_div_19__svg_svg_10_Template, 2, 0, "svg", 61)(11, DashboardComponent_div_19__svg_svg_11_Template, 2, 0, "svg", 62);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "div", 63)(14, "div", 64);
    \u0275\u0275element(15, "div", 65);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "span", 66);
    \u0275\u0275text(17);
    \u0275\u0275pipe(18, "translate");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const m_r1 = ctx.$implicit;
    const i_r2 = ctx.index;
    \u0275\u0275styleProp("animation-delay", i_r2 * 100 + 400 + "ms");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(6, 12, m_r1.label), " ");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", m_r1.value, " ");
    \u0275\u0275advance();
    \u0275\u0275classMap(m_r1.trendUp ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-500 border-red-100");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", m_r1.trendUp);
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", !m_r1.trendUp);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", m_r1.trend, " ");
    \u0275\u0275advance(3);
    \u0275\u0275styleProp("width", m_r1.trendUp ? 75 : 45, "%");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(18, 14, m_r1.sub));
  }
}
function DashboardComponent_div_39_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 70)(1, "div", 71);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const h_r3 = ctx.$implicit;
    \u0275\u0275styleProp("height", h_r3, "%");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", h_r3 * 124, " Sessions ");
  }
}
function DashboardComponent_div_86__svg_svg_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 78);
    \u0275\u0275element(1, "path", 79);
    \u0275\u0275elementEnd();
  }
}
function DashboardComponent_div_86__svg_svg_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 78);
    \u0275\u0275element(1, "path", 80);
    \u0275\u0275elementEnd();
  }
}
function DashboardComponent_div_86__svg_svg_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 78);
    \u0275\u0275element(1, "path", 81);
    \u0275\u0275elementEnd();
  }
}
function DashboardComponent_div_86_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 72)(1, "div", 73)(2, "div", 74);
    \u0275\u0275template(3, DashboardComponent_div_86__svg_svg_3_Template, 2, 0, "svg", 75)(4, DashboardComponent_div_86__svg_svg_4_Template, 2, 0, "svg", 75)(5, DashboardComponent_div_86__svg_svg_5_Template, 2, 0, "svg", 75);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 76);
    \u0275\u0275text(7);
    \u0275\u0275pipe(8, "translate");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "span", 77);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const stat_r4 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275property("ngIf", stat_r4.icon === "cube");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", stat_r4.icon === "folder");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", stat_r4.icon === "exclamation");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(8, 5, stat_r4.label));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(stat_r4.value);
  }
}
function DashboardComponent_div_94_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 82);
    \u0275\u0275element(1, "div", 83);
    \u0275\u0275elementStart(2, "div", 84);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 85)(5, "div", 86)(6, "h4", 87);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "span", 88);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "p", 89);
    \u0275\u0275text(11);
    \u0275\u0275pipe(12, "translate");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const activity_r5 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275classMap(activity_r5.color);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", activity_r5.avatar, " ");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(activity_r5.user);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", activity_r5.time, "m ago");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(12, 6, activity_r5.action));
  }
}
var DashboardComponent = class _DashboardComponent {
  authService;
  userName = "Admin";
  activeTab = "week";
  today = /* @__PURE__ */ new Date();
  metrics = [
    { label: "DASHBOARD.METRICS.TRAFFIC", value: "12.4k", trend: "+14%", trendUp: true, sub: "DASHBOARD.SUB.UNIQUE_VISITORS" },
    { label: "DASHBOARD.METRICS.CONVERSION", value: "3.8%", trend: "+0.4%", trendUp: true, sub: "DASHBOARD.SUB.CHECKOUT_RATE" },
    { label: "DASHBOARD.METRICS.UPTIME", value: "99.9%", trend: "Stable", trendUp: true, sub: "DASHBOARD.SUB.SYSTEM_HEALTH" },
    { label: "DASHBOARD.METRICS.AVG_LOAD", value: "1.2s", trend: "-0.2s", trendUp: true, sub: "DASHBOARD.SUB.PERFORMANCE" }
  ];
  activities = [
    { user: "Ahmed Ali", action: "DASHBOARD.LOG.CATEGORY_CREATED", avatar: "AA", time: "5", color: "bg-zadna-primary/10 text-zadna-primary" },
    { user: "Sara John", action: "DASHBOARD.LOG.PRODUCT_UPDATED", avatar: "SJ", time: "12", color: "bg-zadna-accent/10 text-zadna-accent" },
    { user: "System Bot", action: "DASHBOARD.LOG.BACKUP_COMPLETED", avatar: "SB", time: "45", color: "bg-green-50 text-green-600" },
    { user: "John Doe", action: "DASHBOARD.LOG.ADMIN_LOGIN", avatar: "JD", time: "60", color: "bg-blue-50 text-blue-600" }
  ];
  catalogStats = [
    { label: "DASHBOARD.STATS.TOTAL_PRODUCTS", value: "1,234", icon: "cube" },
    { label: "DASHBOARD.STATS.ACTIVE_CATEGORIES", value: "42", icon: "folder" },
    { label: "DASHBOARD.STATS.OUT_OF_STOCK", value: "12", icon: "exclamation" }
  ];
  trafficData = [40, 65, 45, 80, 55, 90, 70, 100, 85, 95, 75, 85];
  constructor(authService) {
    this.authService = authService;
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.userName = user.fullName || "Admin";
      }
    });
  }
  static \u0275fac = function DashboardComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DashboardComponent)(\u0275\u0275directiveInject(AuthService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _DashboardComponent, selectors: [["app-dashboard"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 98, vars: 51, consts: [[1, "grid", "grid-cols-12", "gap-8", "font-sans", "text-zadna-bgDark", "pb-32"], [1, "col-span-12", "lg:col-span-8", "space-y-10"], [1, "ltr:animate-puzzle-right", "rtl:animate-puzzle-left", "stagger-1"], [1, "text-3xl", "md:text-5xl", "font-black", "text-zadna-bgDark", "tracking-tighter", "mb-3"], [1, "flex", "flex-wrap", "items-center", "gap-4"], [1, "flex", "items-center", "gap-2", "px-3", "py-1.5", "bg-zadna-primary/10", "rounded-full", "border", "border-zadna-primary/20"], [1, "w-2", "h-2", "rounded-full", "bg-zadna-primary", "animate-pulse", "shadow-[0_0_10px_rgba(18,124,140,0.5)]"], [1, "text-[10px]", "font-black", "uppercase", "tracking-widest", "text-zadna-primary"], [1, "text-zadna-bgDark/30", "font-bold", "text-sm", "tracking-wide"], [1, "text-zadna-bgDark/60"], [1, "grid", "grid-cols-1", "md:grid-cols-2", "gap-6", "stagger-2"], ["class", "premium-glass p-8 rounded-[3rem] border border-white shadow-xl hover:shadow-2xl hover:shadow-zadna-primary/5 transition-all group relative overflow-hidden animate-puzzle-up", 3, "animation-delay", 4, "ngFor", "ngForOf"], [1, "premium-glass", "p-10", "rounded-[4rem]", "border", "border-white", "shadow-2xl", "relative", "overflow-hidden", "animate-puzzle-up", "stagger-4", "h-[440px]", "flex", "flex-col"], [1, "flex", "justify-between", "items-start", "mb-auto", "relative", "z-10"], [1, "text-2xl", "font-black", "text-zadna-bgDark", "tracking-tighter", "mb-1"], [1, "text-[10px]", "font-black", "text-zadna-bgDark/30", "uppercase", "tracking-[0.3em]"], [1, "flex", "gap-2"], [1, "px-4", "py-2", "rounded-xl", "bg-white", "border", "border-gray-100", "text-[10px]", "font-black", "text-zadna-bgDark", "hover:border-zadna-primary/20", "transition-all", "shadow-sm", "uppercase", "tracking-widest"], [1, "bg-zadna-bgLight/50", "p-1", "rounded-xl", "flex", "gap-1", "border", "border-white"], [1, "px-4", "py-1.5", "rounded-lg", "text-[9px]", "font-black", "transition-all", 3, "click"], [1, "absolute", "inset-x-0", "bottom-0", "h-64", "flex", "items-end", "gap-1.5", "px-12", "pb-24", "group"], ["class", "flex-1 bg-gradient-to-t from-zadna-primary/40 to-zadna-primary/5 rounded-t-2xl transition-all duration-700 hover:from-zadna-primary hover:to-zadna-primary/20 cursor-crosshair relative group/bar", 3, "height", 4, "ngFor", "ngForOf"], [1, "flex", "justify-between", "items-center", "relative", "z-10", "pt-10", "border-t", "border-gray-100/50"], [1, "flex", "gap-8", "text-[10px]", "font-black", "text-zadna-bgDark/20", "uppercase", "tracking-[0.4em]"], [1, "text-zadna-primary", "font-black"], [1, "flex", "items-center", "gap-3"], [1, "w-1.5", "h-1.5", "rounded-full", "bg-zadna-primary", "animate-ping"], [1, "text-[10px]", "font-black", "text-zadna-primary", "uppercase", "tracking-widest"], [1, "col-span-12", "lg:col-span-4", "space-y-10"], [1, "bg-zadna-accent", "p-8", "rounded-[4rem]", "text-white", "shadow-2xl", "shadow-zadna-accent/20", "relative", "overflow-hidden", "group", "ltr:animate-puzzle-left", "rtl:animate-puzzle-right", "stagger-3"], [1, "absolute", "-top-10", "-right-10", "w-48", "h-48", "bg-white/10", "rounded-full", "blur-3xl", "transition-transform", "duration-1000", "group-hover:scale-150"], [1, "relative", "z-10"], [1, "w-14", "h-14", "rounded-2xl", "bg-white/20", "backdrop-blur-md", "border", "border-white/20", "flex", "items-center", "justify-center", "mb-8", "shadow-xl"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-7", "h-7"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2.5", "d", "M13 10V3L4 14h7v7l9-11h-7z"], [1, "text-2xl", "font-black", "tracking-tighter", "mb-2"], [1, "text-white/60", "text-xs", "font-black", "uppercase", "tracking-widest", "mb-10", "leading-relaxed"], [1, "w-full", "py-5", "bg-white", "text-zadna-accent", "rounded-2xl", "md:rounded-[2rem]", "font-black", "text-xs", "uppercase", "tracking-[0.3em]", "hover:bg-zadna-bgDark", "hover:text-white", "transition-all", "shadow-xl", "active:scale-95", 3, "click"], [1, "premium-glass", "p-10", "rounded-[4rem]", "border", "border-white", "shadow-xl", "ltr:animate-puzzle-left", "rtl:animate-puzzle-right", "stagger-5", "space-y-8"], [1, "flex", "items-center", "justify-between"], [1, "text-xl", "font-black", "text-zadna-bgDark", "tracking-tighter", "flex", "items-center", "gap-3"], [1, "w-1.5", "h-6", "bg-zadna-primary", "rounded-full"], [1, "w-8", "h-8", "rounded-full", "bg-zadna-bgLight", "flex", "items-center", "justify-center", "border", "border-white", "text-zadna-bgDark/20", "hover:text-zadna-primary", "transition-colors"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-width", "2.5", "d", "M12 4v16m8-8H4"], [1, "grid", "grid-cols-1", "gap-6"], ["class", "flex items-center justify-between p-4 bg-white/50 rounded-3xl border border-white/50 hover:bg-white hover:border-zadna-primary/20 transition-all group cursor-pointer", 4, "ngFor", "ngForOf"], [1, "premium-glass", "p-10", "rounded-[4rem]", "border", "border-white", "shadow-xl", "ltr:animate-puzzle-left", "rtl:animate-puzzle-right", "stagger-6", "overflow-hidden", "flex", "flex-col", "h-[400px]"], [1, "flex", "items-center", "justify-between", "mb-8"], [1, "text-xl", "font-black", "text-zadna-bgDark", "tracking-tighter"], [1, "w-2", "h-2", "rounded-full", "bg-green-500", "shadow-[0_0_8px_rgba(34,197,94,0.5)]"], [1, "flex-1", "overflow-y-auto", "space-y-8", "custom-scrollbar", "pr-4"], ["class", "flex gap-5 relative group", 4, "ngFor", "ngForOf"], [1, "mt-8", "w-full", "py-4", "bg-zadna-bgLight/30", "rounded-2xl", "text-[9px]", "font-black", "uppercase", "tracking-[0.3em]", "text-zadna-bgDark/30", "hover:bg-white", "hover:text-zadna-primary", "transition-all", "border", "border-transparent", "hover:border-zadna-primary/10"], [1, "premium-glass", "p-8", "rounded-[3rem]", "border", "border-white", "shadow-xl", "hover:shadow-2xl", "hover:shadow-zadna-primary/5", "transition-all", "group", "relative", "overflow-hidden", "animate-puzzle-up"], [1, "absolute", "-top-10", "-right-10", "w-32", "h-32", "bg-zadna-primary/5", "rounded-full", "blur-3xl", "group-hover:bg-zadna-primary/10", "transition-colors"], [1, "flex", "justify-between", "items-start", "relative", "z-10"], [1, "space-y-4"], [1, "text-[10px]", "font-black", "text-zadna-bgDark/20", "uppercase", "tracking-[0.3em]", "font-sans", "group-hover:text-zadna-primary", "transition-colors"], [1, "text-5xl", "font-black", "text-zadna-bgDark", "tracking-tighter", "leading-none"], [1, "px-3", "py-1.5", "rounded-xl", "text-[10px]", "font-black", "border", "shadow-sm", "flex", "items-center", "gap-1.5"], ["class", "w-3 h-3", "fill", "currentColor", "viewBox", "0 0 20 20", 4, "ngIf"], ["class", "w-3 h-3 rotate-180", "fill", "currentColor", "viewBox", "0 0 20 20", 4, "ngIf"], [1, "mt-8", "flex", "items-center", "gap-2", "relative", "z-10"], [1, "h-1", "flex-1", "bg-gray-100", "rounded-full", "overflow-hidden"], [1, "h-full", "bg-zadna-primary", "rounded-full", "transition-all", "duration-1000"], [1, "text-[9px]", "font-black", "text-zadna-bgDark/30", "uppercase", "tracking-widest"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-3", "h-3"], ["d", "M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-3", "h-3", "rotate-180"], [1, "flex-1", "bg-gradient-to-t", "from-zadna-primary/40", "to-zadna-primary/5", "rounded-t-2xl", "transition-all", "duration-700", "hover:from-zadna-primary", "hover:to-zadna-primary/20", "cursor-crosshair", "relative", "group/bar"], [1, "absolute", "-top-10", "left-1/2", "-translate-x-1/2", "bg-zadna-bgDark", "text-white", "px-2", "py-1", "rounded-lg", "text-[8px]", "font-black", "opacity-0", "group-hover/bar:opacity-100", "transition-opacity", "whitespace-nowrap", "z-20"], [1, "flex", "items-center", "justify-between", "p-4", "bg-white/50", "rounded-3xl", "border", "border-white/50", "hover:bg-white", "hover:border-zadna-primary/20", "transition-all", "group", "cursor-pointer"], [1, "flex", "items-center", "gap-4"], [1, "w-12", "h-12", "rounded-2xl", "bg-zadna-bgLight", "flex", "items-center", "justify-center", "text-zadna-bgDark/20", "group-hover:bg-zadna-primary/10", "group-hover:text-zadna-primary", "transition-all"], ["class", "w-6 h-6", "fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 4, "ngIf"], [1, "text-xs", "font-black", "text-zadna-bgDark/30", "uppercase", "tracking-widest", "group-hover:text-zadna-bgDark/60"], [1, "text-2xl", "font-black", "text-zadna-bgDark", "group-hover:text-zadna-primary", "transition-colors"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-6", "h-6"], ["stroke-width", "2", "d", "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"], ["stroke-width", "2", "d", "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"], ["stroke-width", "2", "d", "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"], [1, "flex", "gap-5", "relative", "group"], [1, "absolute", "top-12", "left-6", "bottom-0", "w-0.5", "bg-gray-50", "group-last:hidden"], [1, "w-12", "h-12", "rounded-2xl", "flex", "items-center", "justify-center", "text-[10px]", "font-black", "shrink-0", "shadow-sm", "transition-transform", "group-hover:scale-110"], [1, "flex-1", "pb-8", "border-b", "border-gray-50", "group-last:border-0", "group-last:pb-0"], [1, "flex", "justify-between", "items-start", "mb-1"], [1, "text-xs", "font-black", "text-zadna-bgDark"], [1, "text-[8px]", "font-black", "text-zadna-bgDark/20", "uppercase", "tracking-widest"], [1, "text-[10px]", "font-bold", "text-zadna-bgDark/40", "leading-relaxed"]], template: function DashboardComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "h1", 3);
      \u0275\u0275text(4);
      \u0275\u0275pipe(5, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(6, "div", 4)(7, "div", 5);
      \u0275\u0275element(8, "span", 6);
      \u0275\u0275elementStart(9, "span", 7);
      \u0275\u0275text(10);
      \u0275\u0275pipe(11, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(12, "p", 8);
      \u0275\u0275text(13);
      \u0275\u0275pipe(14, "translate");
      \u0275\u0275elementStart(15, "span", 9);
      \u0275\u0275text(16);
      \u0275\u0275pipe(17, "date");
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(18, "div", 10);
      \u0275\u0275template(19, DashboardComponent_div_19_Template, 19, 16, "div", 11);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(20, "div", 12)(21, "div", 13)(22, "div")(23, "h2", 14);
      \u0275\u0275text(24);
      \u0275\u0275pipe(25, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(26, "p", 15);
      \u0275\u0275text(27);
      \u0275\u0275pipe(28, "translate");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(29, "div", 16)(30, "button", 17);
      \u0275\u0275text(31);
      \u0275\u0275pipe(32, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(33, "div", 18)(34, "button", 19);
      \u0275\u0275listener("click", function DashboardComponent_Template_button_click_34_listener() {
        return ctx.activeTab = "week";
      });
      \u0275\u0275text(35, "7D");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(36, "button", 19);
      \u0275\u0275listener("click", function DashboardComponent_Template_button_click_36_listener() {
        return ctx.activeTab = "month";
      });
      \u0275\u0275text(37, "30D");
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(38, "div", 20);
      \u0275\u0275template(39, DashboardComponent_div_39_Template, 3, 3, "div", 21);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(40, "div", 22)(41, "div", 23)(42, "span");
      \u0275\u0275text(43, "Mon");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(44, "span");
      \u0275\u0275text(45, "Tue");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(46, "span");
      \u0275\u0275text(47, "Wed");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(48, "span", 24);
      \u0275\u0275text(49, "Thu");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(50, "span");
      \u0275\u0275text(51, "Fri");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(52, "span");
      \u0275\u0275text(53, "Sat");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(54, "span");
      \u0275\u0275text(55, "Sun");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(56, "div", 25);
      \u0275\u0275element(57, "div", 26);
      \u0275\u0275elementStart(58, "span", 27);
      \u0275\u0275text(59, "Real-time Data Streaming");
      \u0275\u0275elementEnd()()()()();
      \u0275\u0275elementStart(60, "div", 28)(61, "div", 29);
      \u0275\u0275element(62, "div", 30);
      \u0275\u0275elementStart(63, "div", 31)(64, "div", 32);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(65, "svg", 33);
      \u0275\u0275element(66, "path", 34);
      \u0275\u0275elementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(67, "h3", 35);
      \u0275\u0275text(68);
      \u0275\u0275pipe(69, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(70, "p", 36);
      \u0275\u0275text(71);
      \u0275\u0275pipe(72, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(73, "button", 37);
      \u0275\u0275listener("click", function DashboardComponent_Template_button_click_73_listener() {
        return ctx.activeTab = "advisor";
      });
      \u0275\u0275text(74);
      \u0275\u0275pipe(75, "translate");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(76, "div", 38)(77, "div", 39)(78, "h3", 40);
      \u0275\u0275element(79, "span", 41);
      \u0275\u0275text(80);
      \u0275\u0275pipe(81, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(82, "button", 42);
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(83, "svg", 43);
      \u0275\u0275element(84, "path", 44);
      \u0275\u0275elementEnd()()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(85, "div", 45);
      \u0275\u0275template(86, DashboardComponent_div_86_Template, 11, 7, "div", 46);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(87, "div", 47)(88, "div", 48)(89, "h3", 49);
      \u0275\u0275text(90);
      \u0275\u0275pipe(91, "translate");
      \u0275\u0275elementEnd();
      \u0275\u0275element(92, "span", 50);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(93, "div", 51);
      \u0275\u0275template(94, DashboardComponent_div_94_Template, 13, 8, "div", 52);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(95, "button", 53);
      \u0275\u0275text(96);
      \u0275\u0275pipe(97, "translate");
      \u0275\u0275elementEnd()()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind2(5, 21, "DASHBOARD.GREETING", \u0275\u0275pureFunction1(49, _c0, ctx.userName)), " ");
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(11, 24, "DASHBOARD.SYSTEM_LIVE"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(14, 26, "DASHBOARD.HUB_DESC"), " \u2022 ");
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind2(17, 28, ctx.today, "EEEE, MMMM d"));
      \u0275\u0275advance(3);
      \u0275\u0275property("ngForOf", ctx.metrics);
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(25, 31, "DASHBOARD.TRAFFIC_MOMENTUM"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(28, 33, "DASHBOARD.TRAFFIC_DESC"));
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(32, 35, "DASHBOARD.EXPORT_CHART"), " ");
      \u0275\u0275advance(3);
      \u0275\u0275classProp("bg-white", ctx.activeTab === "week");
      \u0275\u0275advance(2);
      \u0275\u0275classProp("bg-white", ctx.activeTab === "month");
      \u0275\u0275advance(3);
      \u0275\u0275property("ngForOf", ctx.trafficData);
      \u0275\u0275advance(29);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(69, 37, "DASHBOARD.ADVISOR_TITLE"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(72, 39, "DASHBOARD.ADVISOR_DESC"));
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(75, 41, "DASHBOARD.RUN_DIAGNOSTICS"), " ");
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(81, 43, "DASHBOARD.CATALOG_PULSE"), " ");
      \u0275\u0275advance(6);
      \u0275\u0275property("ngForOf", ctx.catalogStats);
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(\u0275\u0275pipeBind1(91, 45, "DASHBOARD.AUDIT_LOG"));
      \u0275\u0275advance(4);
      \u0275\u0275property("ngForOf", ctx.activities);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind1(97, 47, "DASHBOARD.FULL_SYSTEM_AUDIT"), " ");
    }
  }, dependencies: [CommonModule, NgForOf, NgIf, DatePipe, TranslateModule, TranslatePipe] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(DashboardComponent, { className: "DashboardComponent", filePath: "src\\app\\features\\dashboard\\dashboard.component.ts", lineNumber: 13 });
})();
export {
  DashboardComponent
};
//# sourceMappingURL=chunk-X5KEXEFP.js.map
