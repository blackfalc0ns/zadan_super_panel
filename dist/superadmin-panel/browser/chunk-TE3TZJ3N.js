import {
  AuthService
} from "./chunk-PL22K63I.js";
import {
  environment
} from "./chunk-6L7JDGMK.js";
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  ɵɵdefineInjectable,
  ɵɵinject
} from "./chunk-IPPBI3AG.js";

// src/app/core/services/catalog.service.ts
var CatalogService = class _CatalogService {
  http;
  authService;
  apiUrl = `${environment.apiUrl}/admin/catalog`;
  filesUrl = `${environment.apiUrl}/files`;
  constructor(http, authService) {
    this.http = http;
    this.authService = authService;
  }
  getHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders({
      "Authorization": `Bearer ${token}`
    });
  }
  // --- Categories (Industry -> Sub-Category Tree) ---
  getCategories(parentId, includeInactive = false) {
    let params = new HttpParams().set("includeInactive", includeInactive.toString());
    if (parentId) {
      params = params.set("parentId", parentId);
    }
    return this.http.get(`${this.apiUrl}/categories`, {
      headers: this.getHeaders(),
      params
    });
  }
  createCategory(payload) {
    return this.http.post(`${this.apiUrl}/categories`, payload, { headers: this.getHeaders() });
  }
  updateCategory(id, payload) {
    return this.http.put(`${this.apiUrl}/categories/${id}`, payload, { headers: this.getHeaders() });
  }
  getCategoryById(id) {
    return this.http.get(`${this.apiUrl}/categories/${id}`, { headers: this.getHeaders() });
  }
  deleteCategory(id) {
    return this.http.delete(`${this.apiUrl}/categories/${id}`, { headers: this.getHeaders() });
  }
  // --- Master Products ---
  getProducts(page = 1, pageSize = 10, searchTerm, categoryId, brandId) {
    let params = new HttpParams().set("pageNumber", page.toString()).set("pageSize", pageSize.toString());
    if (searchTerm) {
      params = params.set("searchTerm", searchTerm);
    }
    if (categoryId) {
      params = params.set("categoryId", categoryId);
    }
    if (brandId) {
      params = params.set("brandId", brandId);
    }
    return this.http.get(`${this.apiUrl}/products`, { headers: this.getHeaders(), params });
  }
  createProduct(payload) {
    return this.http.post(`${this.apiUrl}/products`, payload, { headers: this.getHeaders() });
  }
  getProductById(id) {
    return this.http.get(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() });
  }
  updateProduct(id, payload) {
    return this.http.put(`${this.apiUrl}/products/${id}`, payload, { headers: this.getHeaders() });
  }
  // --- Brands ---
  getBrands(includeInactive = false) {
    const params = new HttpParams().set("includeInactive", includeInactive.toString());
    return this.http.get(`${this.apiUrl}/brands`, { headers: this.getHeaders(), params });
  }
  createBrand(payload) {
    return this.http.post(`${this.apiUrl}/brands`, payload, { headers: this.getHeaders() });
  }
  updateBrand(id, payload) {
    return this.http.put(`${this.apiUrl}/brands/${id}`, payload, { headers: this.getHeaders() });
  }
  deleteBrand(id) {
    return this.http.delete(`${this.apiUrl}/brands/${id}`, { headers: this.getHeaders() });
  }
  // --- Units ---
  getUnits() {
    return this.http.get(`${this.apiUrl}/units`, { headers: this.getHeaders() });
  }
  // --- File Upload ---
  uploadFile(file, directory = "catalog") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("directory", directory);
    return this.http.post(`${this.filesUrl}/upload`, formData, {
      headers: this.getHeaders()
    });
  }
  static \u0275fac = function CatalogService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CatalogService)(\u0275\u0275inject(HttpClient), \u0275\u0275inject(AuthService));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _CatalogService, factory: _CatalogService.\u0275fac, providedIn: "root" });
};

export {
  CatalogService
};
//# sourceMappingURL=chunk-TE3TZJ3N.js.map
