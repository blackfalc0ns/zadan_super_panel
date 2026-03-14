import {
  environment
} from "./chunk-6L7JDGMK.js";
import {
  BehaviorSubject,
  HttpClient,
  tap,
  ɵɵdefineInjectable,
  ɵɵinject
} from "./chunk-IPPBI3AG.js";

// src/app/core/services/auth.service.ts
var AuthService = class _AuthService {
  http;
  apiUrl = `${environment.apiUrl}/admin/auth`;
  currentUserSubject = new BehaviorSubject(null);
  currentUser$ = this.currentUserSubject.asObservable();
  constructor(http) {
    this.http = http;
    this.loadUserFromStorage();
  }
  get currentUserValue() {
    return this.currentUserSubject.value;
  }
  get isAuthenticated() {
    const token = this.getToken();
    if (!token)
      return false;
    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }
    return true;
  }
  isTokenExpired(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(atob(base64).split("").map(function(c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(""));
      const payload = JSON.parse(jsonPayload);
      if (payload.exp) {
        return payload.exp * 1e3 <= Date.now();
      }
      return false;
    } catch (e) {
      return true;
    }
  }
  getToken() {
    return localStorage.getItem("admin_token");
  }
  login(credentials) {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(tap((response) => {
      localStorage.setItem("admin_token", response.tokens.accessToken);
      localStorage.setItem("admin_refresh_token", response.tokens.refreshToken);
      localStorage.setItem("admin_user", JSON.stringify(response.user));
      this.currentUserSubject.next(response.user);
    }));
  }
  logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh_token");
    localStorage.removeItem("admin_user");
    this.currentUserSubject.next(null);
  }
  loadUserFromStorage() {
    const userJson = localStorage.getItem("admin_user");
    if (userJson) {
      this.currentUserSubject.next(JSON.parse(userJson));
    }
  }
  static \u0275fac = function AuthService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AuthService)(\u0275\u0275inject(HttpClient));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _AuthService, factory: _AuthService.\u0275fac, providedIn: "root" });
};

export {
  AuthService
};
//# sourceMappingURL=chunk-PL22K63I.js.map
