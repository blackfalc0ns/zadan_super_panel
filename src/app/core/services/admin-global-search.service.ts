import { Injectable } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { AdminAccessApiService } from './admin-access-api.service';
import { CustomersService } from '../../features/customers/services/customers.api.service';
import { OrdersService } from '../../features/orders/services/orders.api.service';
import { CatalogService } from '../../features/catalog/services/catalog.api.service';
import { VendorService } from '../../features/vendors/services/vendor.api.service';
import { AdminUserRecord } from '../../features/admin-users/models/admin-users.models';
import { CustomerDetailRecord } from '../../features/customers/models/customers.models';
import { MasterProduct } from '../../features/catalog/models/catalog.domain.models';
import { OrderListItem } from '../../features/orders/models/orders.models';
import { Vendor } from '../../features/vendors/models/vendors.domain.models';

export type AdminGlobalSearchSource = 'navigation' | 'orders' | 'customers' | 'vendors' | 'products' | 'admin_users';

export interface AdminGlobalSearchResult {
  id: string;
  type: AdminGlobalSearchSource;
  title: string;
  subtitle: string;
  route: string;
  badge?: string | null;
  icon: string;
  flatIndex?: number;
}

export interface AdminGlobalSearchGroup {
  source: AdminGlobalSearchSource;
  labelKey: string;
  results: AdminGlobalSearchResult[];
}

interface AdminNavigationSearchEntry {
  id: string;
  route: string;
  icon: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  keywords: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminGlobalSearchService {
  private readonly maxResultsPerSource = 5;
  private readonly navigationEntries: AdminNavigationSearchEntry[] = [
    {
      id: 'dashboard',
      route: '/dashboard',
      icon: 'space_dashboard',
      titleAr: 'لوحة التحكم',
      titleEn: 'Dashboard',
      subtitleAr: 'نظرة عامة على تشغيل المنصة',
      subtitleEn: 'Marketplace command overview',
      keywords: ['dashboard', 'home', 'overview', 'لوحة', 'الرئيسية', 'لوحة التحكم']
    },
    {
      id: 'orders',
      route: '/orders',
      icon: 'receipt_long',
      titleAr: 'الطلبات',
      titleEn: 'Orders',
      subtitleAr: 'إدارة جميع الطلبات وحالات التنفيذ',
      subtitleEn: 'Track and manage order operations',
      keywords: ['orders', 'order', 'طلبات', 'الطلبات', 'طلب', 'اوردر']
    },
    {
      id: 'vendors',
      route: '/vendors',
      icon: 'storefront',
      titleAr: 'التجار',
      titleEn: 'Vendors',
      subtitleAr: 'إدارة التجار والمتاجر',
      subtitleEn: 'Manage vendors and stores',
      keywords: ['vendors', 'vendor', 'merchant', 'merchants', 'التجار', 'تجار', 'تاجر', 'متاجر', 'المتاجر']
    },
    {
      id: 'customers',
      route: '/customers',
      icon: 'groups',
      titleAr: 'العملاء',
      titleEn: 'Customers',
      subtitleAr: 'متابعة حسابات العملاء ونشاطهم',
      subtitleEn: 'Monitor customer accounts and activity',
      keywords: ['customers', 'customer', 'clients', 'العملاء', 'عملاء', 'عميل']
    },
    {
      id: 'drivers',
      route: '/drivers',
      icon: 'local_shipping',
      titleAr: 'السائقون',
      titleEn: 'Drivers',
      subtitleAr: 'إدارة السائقين والتوصيل',
      subtitleEn: 'Manage drivers and delivery flow',
      keywords: ['drivers', 'driver', 'delivery', 'السائقين', 'سائقين', 'سائق', 'توصيل']
    },
    {
      id: 'catalog-products',
      route: '/catalog/products',
      icon: 'inventory_2',
      titleAr: 'بنك المنتجات',
      titleEn: 'Product Bank',
      subtitleAr: 'إدارة المنتجات الأساسية',
      subtitleEn: 'Manage master products',
      keywords: ['catalog', 'products', 'product bank', 'master products', 'كتالوج', 'الكتالوج', 'منتجات', 'المنتجات', 'بنك المنتجات']
    },
    {
      id: 'catalog-categories',
      route: '/catalog/categories',
      icon: 'category',
      titleAr: 'التصنيفات والقطاعات',
      titleEn: 'Categories & Sectors',
      subtitleAr: 'إدارة شجرة التصنيفات',
      subtitleEn: 'Manage category hierarchy',
      keywords: ['categories', 'category', 'sectors', 'التصنيفات', 'تصنيفات', 'القطاعات', 'اقسام', 'أقسام']
    },
    {
      id: 'brands',
      route: '/catalog/brands',
      icon: 'sell',
      titleAr: 'العلامات التجارية',
      titleEn: 'Brands',
      subtitleAr: 'إدارة العلامات التجارية',
      subtitleEn: 'Manage brands',
      keywords: ['brands', 'brand', 'العلامات التجارية', 'علامات', 'براند', 'ماركات']
    },
    {
      id: 'product-requests',
      route: '/catalog/product-requests',
      icon: 'assignment',
      titleAr: 'طلبات المنتجات',
      titleEn: 'Product Requests',
      subtitleAr: 'مراجعة طلبات إضافة المنتجات',
      subtitleEn: 'Review product submission requests',
      keywords: ['product requests', 'requests', 'catalog requests', 'طلبات المنتجات', 'طلب منتج', 'طلبات']
    },
    {
      id: 'disputes',
      route: '/disputes',
      icon: 'gavel',
      titleAr: 'النزاعات',
      titleEn: 'Disputes',
      subtitleAr: 'إدارة الحالات والنزاعات',
      subtitleEn: 'Handle cases and disputes',
      keywords: ['disputes', 'dispute', 'cases', 'النزاعات', 'نزاعات', 'قضايا', 'حالات']
    },
    {
      id: 'finances',
      route: '/finances',
      icon: 'payments',
      titleAr: 'المالية',
      titleEn: 'Finances',
      subtitleAr: 'متابعة التدفقات المالية',
      subtitleEn: 'Monitor financial operations',
      keywords: ['finances', 'finance', 'payments', 'المالية', 'مالية', 'محاسبة']
    },
    {
      id: 'marketing',
      route: '/marketing',
      icon: 'campaign',
      titleAr: 'التسويق',
      titleEn: 'Marketing',
      subtitleAr: 'إدارة الحملات والمحتوى',
      subtitleEn: 'Manage campaigns and placements',
      keywords: ['marketing', 'campaigns', 'promotions', 'التسويق', 'حملات', 'عروض']
    },
    {
      id: 'notifications',
      route: '/notifications',
      icon: 'notifications',
      titleAr: 'الإشعارات',
      titleEn: 'Notifications',
      subtitleAr: 'مركز التنبيهات والإشعارات',
      subtitleEn: 'Notification center',
      keywords: ['notifications', 'notification', 'alerts', 'الإشعارات', 'اشعارات', 'تنبيهات']
    },
    {
      id: 'admin-users',
      route: '/admin-users',
      icon: 'shield_person',
      titleAr: 'دليل الصلاحيات',
      titleEn: 'Access Directory',
      subtitleAr: 'إدارة مديري النظام والصلاحيات',
      subtitleEn: 'Manage admins, roles, and access',
      keywords: ['admin users', 'access', 'roles', 'permissions', 'admins', 'الادمن', 'أدمن', 'مديري النظام', 'الصلاحيات', 'دليل الصلاحيات']
    },
    {
      id: 'email-center',
      route: '/email-center',
      icon: 'mail',
      titleAr: 'مركز البريد',
      titleEn: 'Email Center',
      subtitleAr: 'إدارة الرسائل والقوالب',
      subtitleEn: 'Manage email flows and templates',
      keywords: ['email', 'mail', 'email center', 'مركز البريد', 'بريد', 'ايميل', 'إيميل']
    },
    {
      id: 'profile',
      route: '/profile',
      icon: 'account_circle',
      titleAr: 'الملف الشخصي',
      titleEn: 'Profile',
      subtitleAr: 'بيانات حساب الأدمن الحالي',
      subtitleEn: 'Current admin profile',
      keywords: ['profile', 'account', 'my profile', 'الملف الشخصي', 'بروفايل', 'حسابي']
    }
  ];

  constructor(
    private readonly ordersService: OrdersService,
    private readonly customersService: CustomersService,
    private readonly vendorService: VendorService,
    private readonly catalogService: CatalogService,
    private readonly adminAccessApiService: AdminAccessApiService
  ) {}

  search(query: string, locale: 'ar' | 'en' = 'ar'): Observable<AdminGlobalSearchGroup[]> {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      return of([]);
    }

    const navigationResults = this.searchNavigation(normalizedQuery, locale);

    return forkJoin({
      orders: this.ordersService.getOrders({
        page: 1,
        pageSize: this.maxResultsPerSource,
        searchTerm: normalizedQuery,
        status: 'ALL',
        paymentStatus: 'ALL',
        fulfillmentStatus: 'ALL',
        queueView: 'ALL'
      }).pipe(
        map((response) => response.items),
        catchError(() => of([] as OrderListItem[]))
      ),
      customers: this.customersService.searchCustomers(normalizedQuery, this.maxResultsPerSource).pipe(
        catchError(() => of([] as CustomerDetailRecord[]))
      ),
      vendors: this.vendorService.getVendors(1, this.maxResultsPerSource, normalizedQuery).pipe(
        map((response) => response.items),
        catchError(() => of([] as Vendor[]))
      ),
      products: this.catalogService.getProducts(1, this.maxResultsPerSource, normalizedQuery).pipe(
        map((response) => response.items),
        catchError(() => of([] as MasterProduct[]))
      ),
      adminUsers: this.adminAccessApiService.getUsersPage({
        pageNumber: 1,
        pageSize: this.maxResultsPerSource,
        search: normalizedQuery
      }).pipe(
        map((response) => response.items),
        catchError(() => of([] as AdminUserRecord[]))
      )
    }).pipe(
      map((result) => this.buildGroups(result, navigationResults, locale))
    );
  }

  private buildGroups(
    payload: {
      orders: OrderListItem[];
      customers: CustomerDetailRecord[];
      vendors: Vendor[];
      products: MasterProduct[];
      adminUsers: AdminUserRecord[];
    },
    navigationResults: AdminGlobalSearchResult[],
    locale: 'ar' | 'en'
  ): AdminGlobalSearchGroup[] {
    const groups: AdminGlobalSearchGroup[] = [
      {
        source: 'navigation',
        labelKey: 'HEADER_SEARCH.GROUPS.NAVIGATION',
        results: navigationResults
      },
      {
        source: 'orders',
        labelKey: 'HEADER_SEARCH.GROUPS.ORDERS',
        results: payload.orders.map((item) => ({
          id: item.id,
          type: 'orders',
          title: item.displayId || item.id,
          subtitle: this.joinParts([item.customerName, item.merchantName, item.customerPhone]),
          route: `/orders/${item.id}`,
          badge: item.status,
          icon: 'receipt_long'
        }))
      },
      {
        source: 'customers',
        labelKey: 'HEADER_SEARCH.GROUPS.CUSTOMERS',
        results: payload.customers.map((item) => ({
          id: item.id,
          type: 'customers',
          title: item.name,
          subtitle: this.joinParts([item.email, item.phone, item.city]),
          route: `/customers/${item.id}`,
          badge: item.status,
          icon: 'person'
        }))
      },
      {
        source: 'vendors',
        labelKey: 'HEADER_SEARCH.GROUPS.VENDORS',
        results: payload.vendors.map((item) => ({
          id: item.id,
          type: 'vendors',
          title: this.pickLocalized(item.businessNameAr, item.businessNameEn, locale),
          subtitle: this.joinParts([item.ownerName, item.contactEmail, item.contactPhone]),
          route: `/vendors/${item.id}/overview`,
          badge: item.status,
          icon: 'storefront'
        }))
      },
      {
        source: 'products',
        labelKey: 'HEADER_SEARCH.GROUPS.PRODUCTS',
        results: payload.products.map((item) => ({
          id: item.id,
          type: 'products',
          title: this.pickLocalized(item.nameAr, item.nameEn, locale),
          subtitle: this.joinParts([
            this.pickLocalized(item.brandNameAr, item.brandNameEn, locale),
            this.pickLocalized(item.categoryNameAr, item.categoryNameEn, locale),
            this.pickLocalized(item.displaySizeAr, item.displaySizeEn, locale)
          ]),
          route: `/catalog/products/view/${item.id}`,
          badge: item.status,
          icon: 'inventory_2'
        }))
      },
      {
        source: 'admin_users',
        labelKey: 'HEADER_SEARCH.GROUPS.ADMIN_USERS',
        results: payload.adminUsers.map((item) => ({
          id: item.id,
          type: 'admin_users',
          title: item.fullName,
          subtitle: this.joinParts([item.roleName, item.email, item.phone]),
          route: `/admin-users/${item.id}`,
          badge: item.status,
          icon: 'admin_panel_settings'
        }))
      }
    ];

    return groups.filter((group) => group.results.length > 0);
  }

  private searchNavigation(query: string, locale: 'ar' | 'en'): AdminGlobalSearchResult[] {
    const normalizedQuery = this.normalizeText(query);

    return this.navigationEntries
      .map((entry) => {
        const searchableText = [
          entry.titleAr,
          entry.titleEn,
          entry.subtitleAr,
          entry.subtitleEn,
          ...entry.keywords
        ]
          .map((value) => this.normalizeText(value))
          .join(' ');

        return {
          entry,
          score: this.computeNavigationScore(entry, searchableText, normalizedQuery, locale)
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.maxResultsPerSource)
      .map(({ entry }) => ({
        id: entry.id,
        type: 'navigation',
        title: locale === 'ar' ? entry.titleAr : entry.titleEn,
        subtitle: locale === 'ar' ? entry.subtitleAr : entry.subtitleEn,
        route: entry.route,
        icon: entry.icon
      }));
  }

  private computeNavigationScore(
    entry: AdminNavigationSearchEntry,
    searchableText: string,
    normalizedQuery: string,
    locale: 'ar' | 'en'
  ): number {
    const title = this.normalizeText(locale === 'ar' ? entry.titleAr : entry.titleEn);
    const altTitle = this.normalizeText(locale === 'ar' ? entry.titleEn : entry.titleAr);

    if (title === normalizedQuery) return 200;
    if (title.startsWith(normalizedQuery)) return 150;
    if (entry.keywords.some((keyword) => this.normalizeText(keyword) === normalizedQuery)) return 130;
    if (searchableText.includes(normalizedQuery) && title.includes(normalizedQuery)) return 110;
    if (altTitle.includes(normalizedQuery)) return 90;
    if (searchableText.includes(normalizedQuery)) return 70;

    return 0;
  }

  private pickLocalized(ar?: string | null, en?: string | null, locale: 'ar' | 'en' = 'ar'): string {
    const primary = locale === 'ar' ? ar : en;
    const fallback = locale === 'ar' ? en : ar;
    return (primary || fallback || '').trim();
  }

  private joinParts(parts: Array<string | null | undefined>): string {
    return parts
      .map((part) => (part ?? '').trim())
      .filter((part) => part.length > 0 && part !== '-')
      .join(' • ');
  }

  private normalizeText(value: string): string {
    return value
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
