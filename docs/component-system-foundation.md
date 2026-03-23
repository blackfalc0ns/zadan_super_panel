# Super Admin Component System Foundation

This document defines the first reusable component-system layer for the Zadana Super Admin Panel.

## A. Global reusable component library

- `AppButton`
- `AppBadge`
- `AppCard`
- `SectionHeader`
- `StatusPill`
- `InlineBanner`
- `KeyValueGrid`
- `DataTable`
- `KpiCards`
- `Pagination`
- `ToastNotification`
- `DeleteConfirmationModal`

## B. Shared layout components

- `AppShell`
- `Sidebar`
- `Header`
- `PageHeader`
- `DetailHeader`
- `QuickPreviewDrawer`
- `ModalShell` pattern
- `StickyBulkActionsBar` pattern in `DataTable`

## C. Reusable data components

- `DataTable` for enterprise lists
- `KpiCards` for summary metrics
- `KeyValueGrid` for metadata and fact rows
- `StatusPill` for semantic status
- `ActivityFeedCard` pattern
- `TimelineCard` pattern
- `FinancialBreakdownCard` pattern

## D. Reusable form and modal components

- `InputComponent`
- `TextareaComponent`
- modal shell pattern used by order and disputes workflows
- shared footer action pattern: primary, secondary, cancel
- checkbox and radio card group patterns inside operational modals

## E. Domain-specific reusable components

- `OrderSummaryCard`
- `VendorSummaryCard`
- `CustomerSummaryCard`
- `DriverSummaryCard`
- `PaymentSummaryCard`
- `RefundCaseSummaryCard`
- `OrderStatusTracker`
- `DeliveryStatusTracker`
- `RiskIndicatorBlock`
- `SlaIndicator`

## F. State system for reusable components

Global states to support consistently:

- `default`
- `loading`
- `empty`
- `no-results`
- `success`
- `warning`
- `error`
- `disabled`
- `high-risk`
- `overdue`
- `read-only`
- `permission-restricted`

## G. Page-by-page composition map

- `VendorsList`: `PageHeader + KpiCards + SearchFiltersHeader + AdvancedFiltersPanel + DataTable + BulkActions`
- `VendorDetails`: `PageHeader + VendorSummaryCard + ComplianceStatusCard + FinancialBreakdownCard + ActivityFeedCard`
- `ProductBank`: `PageHeader + SearchFiltersHeader + DataTable + ProductSummaryRow + BulkActions`
- `Categories`: `PageHeader + MetricCards + DataTable or card grid + ModalShell`
- `Brands`: `PageHeader + SearchFiltersHeader + DataTable + DetailDrawer`
- `OrdersList`: `PageHeader + KpiCards + SearchFiltersHeader + DataTable + StatusPill + SlaIndicator`
- `OrderDetails`: `OrderSummaryCard + StatusPill + SectionHeader + TimelineCard + PaymentSummaryCard + EntitySummaryCards + InlineBanner`
- `OperationsControlTower`: `PageHeader + live MetricCards + IssueQueue + AlertItems + MapPreview + QuickPreviewDrawer`
- `RefundsDisputes`: `PageHeader + KpiCards + CasesTable + EvidencePreview + Review modals + ActivityFeed`
- `CustomersList`: `PageHeader + KpiCards + SearchFiltersHeader + DataTable + CustomerSummaryCard`
- `DriversList`: `PageHeader + KpiCards + DataTable + DriverSummaryCard + Delivery tracker`
- `AlertsCenter`: `PageHeader + tabbed alert lists + filters + AlertItem + linked entity badges`
- `FinanceOverview`: `PageHeader + KpiCards + FinancialBreakdownCard + settlements tables + document preview`

## H. Naming convention

- Use `App*` for shell-level or foundational UI wrappers.
- Use `*Card` for boxed summary or grouped information surfaces.
- Use `*Badge` and `*Pill` for semantic micro-status components.
- Use `*Header` for page or section heading structures.
- Use `*Grid` for labeled fact layouts.
- Use `*Modal` for workflow overlays.
- Use `*Drawer` for side overlays.
- Use domain prefixes when the component is business-specific:
  - `VendorSummaryCard`
  - `OrderStatusTracker`
  - `RefundCaseSummaryCard`

## I. Reuse strategy and best practices

- Start from shared primitives before adding new page-specific UI.
- If a pattern appears in three or more places, extract it.
- Prefer inputs and content projection over cloned templates.
- Keep RTL-first spacing and alignment as default.
- Force `LTR` only for IDs, phone numbers, references, and amounts when needed.
- Reuse semantic states rather than inventing page-specific colors.
- Use the same modal shell, banner, section header, and status system across orders, disputes, drivers, alerts, and finance.
- Avoid one-off cards unless they represent a truly unique workflow.
