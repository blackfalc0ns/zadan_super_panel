# UI Components Rollout Map

## 1. Global Shared Components

- `AppPageHeaderComponent`
  - old approved visual design preserved
  - breadcrumb support
  - title icon slot via `[title-prefix]`
  - toolbar slot for actions, search, filters, toggles

- `DetailHeaderComponent`
  - used in workflow and detail pages

- `VendorDetailHeaderComponent`
  - vendor-specific detail shell with tab navigation

- `StatusPillComponent`
  - canonical status token for list and detail views

- `SectionHeaderComponent`
  - canonical section title + icon + meta + actions

- `InlineBannerComponent`
  - canonical inline warnings, errors, advisories, and notes

- `KeyValueGridComponent`
  - compact metadata layout for detail views

- `ModalShellComponent`
  - canonical workflow modal wrapper
  - shared backdrop, sticky header, scrollable body, and sticky footer

- `KpiCardsComponent`
  - standard KPI row used on list pages

- `DataTableComponent`
  - reusable data table shell

- `AppPaginationComponent`
  - reusable paging footer

## 2. Shared Header Coverage

- `orders-list`
  - `AppPageHeaderComponent`
- `vendors-list`
  - `AppPageHeaderComponent`
- `brand-list`
  - `AppPageHeaderComponent`
- `categories-manager`
  - `AppPageHeaderComponent`
- `master-products`
  - `AppPageHeaderComponent`
- `disputes-dashboard`
  - `AppPageHeaderComponent`
- `brand-detail`
  - `DetailHeaderComponent`
- `category-details`
  - `DetailHeaderComponent`
- `product-detail`
  - `DetailHeaderComponent`
- `master-product-form`
  - `DetailHeaderComponent`
- `vendor-detail`
  - `VendorDetailHeaderComponent`
- `order-details`
  - custom detail hero + shared section components
- `dashboard`
  - custom hero kept intentionally, section blocks standardized underneath

## 3. Shared Status Coverage

- `orders-list`
  - order row status
- `vendors-list`
  - vendor row status
- `brand-list`
  - brand status
- `categories-manager`
  - category status
- `master-products`
  - product status in desktop and mobile views
- `disputes-dashboard`
  - dispute status in desktop and mobile views
- `brand-detail`
  - brand status and related product statuses
- `category-details`
  - hero category status
  - child category statuses in table and grid views
- `product-detail`
  - top product status
- `master-product-form`
  - publishing and workflow status
- `vendor-detail`
  - store status in details tab
- `order-details`
  - order summary status
- `vendor-overview`
  - document statuses and recent order statuses
- `vendor-orders`
  - payment, shipping, and order-level statuses
- `vendor-products`
  - product lifecycle status
- `vendor-finance`
  - settlement statuses and payment cycle token
- `vendor-compliance`
  - verification statuses and severity tokens
- `vendor-settings`
  - account status
  - access scope status

## 4. Shared Section Coverage

- `dashboard`
  - traffic momentum
  - catalog pulse
  - audit log
- `order-details`
  - ordered items
  - timeline
  - payment details
  - location and delivery
  - support and disputes
  - activity log
- `category-details`
  - sub-items section
- `product-detail`
  - details metadata
  - vendor distribution table
- `master-product-form`
  - basic info
  - media assets
  - classification
  - inventory tracking
- `vendor-overview`
  - store info
  - essential documents
  - recent orders
  - alerts
  - admin actions
- `vendor-analytics`
  - sales trend
  - best sellers
  - customer opinions
  - operational quality
- `vendor-products`
  - summary rail
- `vendor-orders`
  - summary rail
  - alerts rail
- `vendor-finance`
  - financial summary
  - transfer info
  - settlements
  - financial actions
  - financial alerts
- `vendor-compliance`
  - verification matrix
  - risk indicators
  - compliance notes
  - reviewer actions
  - decision summary
- `vendor-activity-log`
  - internal notes
  - activity log
  - collaboration summary
  - timeline
- `vendor-settings`
  - account settings
  - operations settings
  - permissions access
  - API settings
  - control actions
  - notifications

## 5. Shared Metadata Coverage

- `product-detail`
  - `KeyValueGridComponent` for barcode, unit, category, and brand
- `order-details`
  - `KeyValueGridComponent` in summary and operational detail areas

## 6. Shared Banner Coverage

- `order-details`
  - risk and system notices
- `vendor-overview`
  - vendor alerts
- `vendor-orders`
  - operations alerts
- `vendor-finance`
  - financial alerts
- `vendor-compliance`
  - blocking items
- `vendor-analytics`
  - smart insight block

## 7. Workflow Modal Coverage

- `orders`
  - `order-status-update-modal`
  - `order-driver-assignment-modal`
  - `order-cancellation-modal`
  - `order-refund-modal`
  - `order-dispute-modal`
  - `order-issue-flag-modal`
- `disputes-dashboard`
  - `dispute-approval-modal`
  - `dispute-escalation-modal`
  - `dispute-rejection-modal`
  - `dispute-request-info-modal`
- `catalog`
  - `category-form-modal`
  - `brand-form-modal`

## 8. Reusable Layout Rules

- page-level list screens should use `AppPageHeaderComponent` unless the page is a dedicated detail or workflow page
- detail and workflow screens should use `DetailHeaderComponent` or `VendorDetailHeaderComponent`
- repeated section titles must use `SectionHeaderComponent`
- repeated semantic statuses must use `StatusPillComponent`
- repeated notices and warnings must use `InlineBannerComponent`
- repeated admin workflows should use `ModalShellComponent`
- data-heavy screens should prefer `KpiCardsComponent + DataTableComponent + AppPaginationComponent`

## 9. Remaining Gaps

- `dashboard`
  - hero remains intentionally custom
- vendor utility modals
  - `cr-viewer-modal`
  - `edit-owner-modal`
  - `edit-legal-bank-modal`
  - `edit-store-modal`
  - `financial-statement-modal`
  - `payouts-review-modal`
  - `create-settlement-modal`
  - `payment-detail-modal`
- remaining placeholder navigation modules
  - `/analytics`
  - `/customers`
  - `/drivers`
  - `/finances`
  - `/marketing`
  - `/settings`

## 10. Rollout Goal

- keep one visual language across the admin
- standardize structure without replacing approved page identity
- reduce duplicated badge and section markup
- preserve the old page header look while making it reusable everywhere
- move pages toward assembly from shared components instead of one-off markup
