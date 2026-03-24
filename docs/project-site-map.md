# Super Admin Panel Site Map

## 1. Current App Shell

- `/login`
  - `LoginComponent`
- `/`
  - `LayoutComponent`
  - redirects to `/dashboard`

## 2. Implemented Route Map

### Dashboard

- `/dashboard`
  - `DashboardComponent`
  - executive overview
  - live system status
  - traffic momentum
  - catalog pulse
  - audit log

### Vendors Module

- `/vendors`
  - `VendorsListComponent`
  - KPI summary row
  - advanced filters
  - vendors table
  - mobile vendor cards
  - quick preview drawer

- `/vendors/:id`
  - `VendorDetailComponent`
  - `VendorDetailHeaderComponent`
  - tab composition:
    - `overview`
      - `VendorOverviewComponent`
      - store info
      - essential documents
      - recent orders
      - alerts and admin actions
    - `analytics`
      - `VendorAnalyticsComponent`
      - metrics grid
      - chart blocks
      - best sellers
      - customer opinions
      - operational quality
    - `data`
      - embedded in `VendorDetailComponent`
      - store data
      - profile data
      - legal data
      - banking data
    - `products`
      - `VendorProductsComponent`
      - inventory summary
      - search + filters
      - vendor products table
    - `orders`
      - `VendorOrdersComponent`
      - KPI summary
      - search + filters
      - vendor orders table
      - operations summary
      - alerts rail
    - `finance`
      - `VendorFinanceComponent`
      - finance KPIs
      - financial summary
      - transfer info
      - settlements
      - financial actions
      - finance alerts
    - `compliance`
      - `VendorComplianceComponent`
      - verification matrix
      - risk indicators
      - reviewer notes
      - reviewer actions
      - blocking items summary
    - `logs`
      - `VendorActivityLogComponent`
      - internal notes
      - audit log table
      - collaboration summary
      - timeline
    - `settings`
      - `VendorSettingsComponent`
      - account settings
      - operational settings
      - permissions and access
      - API configuration
      - notifications and control actions

### Catalog Module

- `/catalog/categories`
  - `CategoriesManagerComponent`
  - category KPIs
  - search and filters
  - categories table
  - create/edit/delete flows

- `/catalog/categories/:id`
  - `CategoryDetailsComponent`
  - category hero
  - child categories
  - status and sync blocks
  - table and grid child views

- `/catalog/products`
  - `MasterProductsComponent`
  - products header
  - filters
  - products table
  - mobile product cards

- `/catalog/products/create`
  - `MasterProductFormComponent`
  - product creation workflow
  - shared detail header
  - sectioned authoring form
  - publishing status block

- `/catalog/products/edit/:id`
  - `MasterProductFormComponent`
  - product edit workflow
  - shared detail header
  - sectioned authoring form
  - publishing status block

- `/catalog/products/view/:id`
  - `ProductDetailComponent`
  - product summary
  - product metadata grid
  - vendor distribution table

- `/catalog/brands`
  - `BrandListComponent`
  - brands table
  - brand create/edit modal

- `/catalog/brands/view/:id`
  - `BrandDetailComponent`
  - brand summary
  - related products table

- `/catalog/image-bank`
  - redirects to `/catalog/products`

### Orders Module

- `/orders`
  - `OrdersListComponent`
  - KPI summary row
  - search and filters
  - orders table
  - quick view drawer

- `/orders/:id`
  - `OrderDetailsComponent`
  - order summary
  - timeline
  - payment details
  - delivery details
  - support and admin actions
  - connected workflow modals:
    - `OrderStatusUpdateModalComponent`
    - `OrderDriverAssignmentModalComponent`
    - `OrderCancellationModalComponent`
    - `OrderRefundModalComponent`
    - `OrderDisputeModalComponent`
    - `OrderIssueFlagModalComponent`

### Disputes Module

- `/disputes`
  - `DisputesDashboardComponent`
  - disputes KPIs
  - search and filters
  - disputes table
  - case drawer
  - decision modals:
    - `DisputeApprovalModalComponent`
    - `DisputeEscalationModalComponent`
    - `DisputeRejectionModalComponent`
    - `DisputeRequestInfoModalComponent`

### Customers Module

- `/customers`
  - `CustomersListComponent`
  - KPI summary row
  - compact high-density filters
  - customers table
  - quick preview drawer

## 3. Navigation Placeholders Present in Sidebar

These entries exist in navigation design, but no routed page is implemented yet in `app.routes.ts`.

- `/analytics`
- `/drivers`
- `/finances`
- `/marketing`
- `/settings`

## 4. Feature Folders Reserved but Currently Empty

These modules exist as folders but do not yet contain routed feature pages.

- `features/payments`
- `features/reports`
- `features/settings`
- `features/settlements`
- `features/users`
- `features/wallets`

## 5. Route-Level Patterns

- list pages
  - dashboard, vendors, categories, products, brands, orders, disputes
- detail pages
  - vendor detail, category detail, brand detail, product detail, order detail
- workflow pages
  - product create/edit
- modal-driven admin flows
  - orders workflows standardized with `ModalShellComponent`
  - disputes workflows standardized with `ModalShellComponent`
  - catalog create/edit form modals standardized with `ModalShellComponent`
  - vendor finance and vendor data utility modals remain specialized legacy flows
