const fs = require('fs');
const file = 'src/app/features/orders/pages/detail/order-details/order-details.component.html';
let content = fs.readFileSync(file, 'utf8');

const newGridContent = `<div class="grid grid-cols-12 gap-6 animate-in slide-in-from-bottom-10 duration-1000">
      <!-- Left Column (Operational & Details) -->
      <div class="col-span-12 xl:col-span-8 space-y-6">
        
        <!-- Location Delivery -->
        <section class="bg-white border border-slate-200/60 rounded-[1.75rem] overflow-hidden flex flex-col md:flex-row shadow-[0_4px_24px_-4px_rgba(15,23,42,0.03)] hover:border-zadna-primary/20 transition-all duration-300 min-h-[300px]">
          <div class="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center border-l border-slate-100">
            <app-section-header class="mb-6" [compact]="true" icon="location_on" title="ORDERS.DETAIL.LOCATION_DELIVERY"></app-section-header>
            <div class="space-y-6">
              <div>
                <label class="text-[10px] font-extrabold text-slate-400 block mb-1">{{ 'ORDERS.DETAIL.DELIVERY_ADDRESS' | translate }}</label>
                <p class="text-[13px] font-semibold text-slate-800 leading-relaxed">{{ currentOrder.customerAddress }}</p>
              </div>
              <app-key-value-grid [items]="deliveryInfoItems" [columns]="2"></app-key-value-grid>
              <app-inline-banner
                variant="warning"
                [shouldTranslate]="false"
                [title]="'ORDERS.DETAIL.SUPPORT_SUMMARY' | translate"
                [message]="currentOrder.supportSummary">
              </app-inline-banner>
            </div>
          </div>

          <div class="w-full md:w-1/2 bg-slate-100 relative group cursor-pointer overflow-hidden min-h-[200px]">
            <div class="absolute inset-0 bg-slate-200 flex items-center justify-center" style="background-image: radial-gradient(circle at center, #cbd5e1 1px, transparent 1px); background-size: 20px 20px;">
              <span class="material-symbols-outlined text-[64px] text-slate-300">map</span>
            </div>
            <div class="absolute inset-0 bg-zadna-primary/10 flex items-center justify-center group-hover:bg-zadna-primary/20 transition-all duration-500">
              <button class="bg-white/95 px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 transform group-hover:-translate-y-1 transition-transform">
                <span class="material-symbols-outlined text-zadna-primary text-[18px]">near_me</span>
                <span class="text-[11px] font-extrabold text-slate-800">{{ 'ORDERS.DETAIL.LIVE_TRACKING' | translate }}</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Timeline -->
        <section class="bg-white border border-slate-200/60 rounded-[1.75rem] p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.03)] hover:border-zadna-primary/20 transition-all duration-300 relative">
          <app-section-header class="mb-8" [compact]="true" icon="timeline" title="ORDERS.DETAIL.TIMELINE"></app-section-header>

          <div class="space-y-6 relative mr-2">
            <div class="absolute right-[11px] top-2 bottom-2 w-0.5 bg-slate-200/50"></div>

            <div *ngFor="let step of currentOrder.timeline" class="relative pr-8" [class.opacity-40]="step.status === 'PENDING'">
              <div *ngIf="step.status === 'COMPLETED'" class="absolute right-0 top-1 w-[22px] h-[22px] rounded-full bg-zadna-primary flex items-center justify-center z-10 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.03)] border-2 border-white">
                <span class="material-symbols-outlined text-white text-[12px] font-extrabold">check</span>
              </div>

              <div *ngIf="step.status === 'IN_PROGRESS'" class="absolute right-0 top-1 w-[22px] h-[22px] rounded-full bg-amber-500 ring-4 ring-amber-500/20 flex items-center justify-center z-10">
                <span class="material-symbols-outlined text-white text-[12px] animate-spin-slow">autorenew</span>
              </div>

              <div *ngIf="step.status === 'PENDING'" class="absolute right-0 top-1 w-[22px] h-[22px] rounded-full bg-slate-200 flex items-center justify-center z-10 border-2 border-white shadow-[0_4px_24px_-4px_rgba(15,23,42,0.03)]">
                <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
              </div>

              <div class="flex justify-between items-start mb-1">
                <h4 class="text-[13px] font-bold"
                    [ngClass]="{
                      'text-slate-800': step.status === 'COMPLETED' || step.status === 'PENDING',
                      'text-amber-500': step.status === 'IN_PROGRESS'
                    }">
                  {{ step.title }}
                </h4>
                <span class="text-[10px] font-mono text-slate-400">{{ step.time }}</span>
              </div>
              <p class="text-[10px] text-slate-400">{{ step.subtitle }}</p>
            </div>
          </div>
        </section>

        <!-- Ordered Items -->
        <section class="bg-white border border-slate-200/60 rounded-[1.75rem] shadow-[0_4px_24px_-4px_rgba(15,23,42,0.03)] hover:border-zadna-primary/20 transition-all duration-300 overflow-hidden">
          <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <app-section-header [compact]="true" icon="shopping_basket" title="ORDERS.DETAIL.ORDERED_ITEMS">
              <span meta class="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {{ currentOrder.items.length }} {{ 'ORDERS.DETAIL.ITEMS_COUNT' | translate }}
              </span>
            </app-section-header>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full table-fixed text-right">
              <thead>
                <tr class="bg-slate-50/50">
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-400">{{ 'ORDERS.DETAIL.ITEM' | translate }}</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-400">{{ 'ORDERS.DETAIL.SKU' | translate }}</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-400 text-center">{{ 'ORDERS.DETAIL.QUANTITY' | translate }}</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-400">{{ 'ORDERS.DETAIL.PRICE' | translate }}</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-slate-400">{{ 'ORDERS.DETAIL.SUBTOTAL' | translate }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100/50">
                <tr *ngFor="let item of currentOrder.items" class="hover:bg-slate-50/50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shadow-[0_4px_24px_-4px_rgba(15,23,42,0.03)]">
                        <span class="material-symbols-outlined text-[20px] text-zadna-primary">{{ item.icon }}</span>
                      </div>
                      <div>
                        <p class="text-[13px] font-bold text-slate-800">{{ item.name }}</p>
                        <p class="text-[10px] text-slate-400">{{ item.brand }} - {{ item.quantity }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-[10px] font-mono text-slate-400">{{ item.sku }}</td>
                  <td class="px-6 py-4 text-[12px] font-bold text-center font-mono text-slate-600">{{ item.quantity }}</td>
                  <td class="px-6 py-4 text-[12px] font-bold font-mono text-slate-600">{{ item.price | number:'1.2-2' }} {{ 'COMMON.CURRENCY_SAR' | translate }}</td>
                  <td class="px-6 py-4 text-[12px] font-bold font-mono text-zadna-primary">{{ item.total | number:'1.2-2' }} {{ 'COMMON.CURRENCY_SAR' | translate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Finances -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section class="bg-white border border-slate-200/60 rounded-[1.75rem] shadow-[0_4px_24px_-4px_rgba(15,23,42,0.03)] hover:border-zadna-primary/20 transition-all duration-300 p-6 flex flex-col">
            <app-section-header class="mb-6" [compact]="true" icon="account_balance_wallet" title="ORDERS.DETAIL.PAYMENT_SUMMARY"></app-section-header>
            <div class="space-y-4 flex-1">
              <app-key-value-grid [items]="paymentInfoItems" [columns]="1"></app-key-value-grid>

              <div class="mt-4 p-4 rounded-xl bg-zadna-primary/5 border border-zadna-primary/10">
                <p class="text-[11px] font-extrabold text-zadna-primary mb-2">{{ 'ORDERS.DETAIL.PAYMENT_NOTE' | translate }}</p>
                <p class="text-sm font-bold text-slate-700">{{ currentOrder.paymentStatusNote }}</p>
              </div>

              <div class="mt-4 p-4 rounded-xl bg-white border border-slate-100">
                <p class="text-[11px] font-extrabold text-slate-500 mb-2">{{ 'ORDERS.DETAIL.FULFILLMENT_NOTE' | translate }}</p>
                <p class="text-sm font-bold text-slate-700">{{ currentOrder.fulfillmentStatusNote }}</p>
              </div>
            </div>
          </section>

          <section *ngIf="financialBreakdown() as finance" class="bg-white border border-slate-200/60 rounded-[1.75rem] shadow-[0_4px_24px_-4px_rgba(15,23,42,0.03)] hover:border-zadna-primary/20 transition-all duration-300 p-6 flex flex-col">
            <div class="flex justify-between items-center mb-4">
              <div>
                <app-section-header [compact]="true" icon="query_stats" title="ORDERS.DETAIL.FINANCE_CARD.TITLE"></app-section-header>
                <p class="mt-1 text-[11px] font-medium text-slate-500">{{ 'ORDERS.DETAIL.FINANCE_CARD.SUBTITLE' | translate }}</p>
              </div>
            </div>

            <div class="space-y-1.5 flex-1">
              <div class="flex justify-between items-center py-2 border-b border-slate-100">
                <span class="text-[11px] font-extrabold text-slate-400">{{ 'ORDERS.DETAIL.FINANCE_CARD.VENDOR_COMMISSION' | translate }}</span>
                <span class="text-[13px] font-extrabold text-slate-800">{{ finance.vendorCommission | number:'1.2-2' }} SAR</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-slate-100">
                <span class="text-[11px] font-extrabold text-slate-400">{{ 'ORDERS.DETAIL.FINANCE_CARD.DRIVER_PAYOUT' | translate }}</span>
                <span class="text-[13px] font-extrabold text-slate-800">{{ finance.driverPayout | number:'1.2-2' }} SAR</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-slate-100">
                <span class="text-[11px] font-extrabold text-slate-400">{{ 'ORDERS.DETAIL.FINANCE_CARD.SERVICE_FEE' | translate }}</span>
                <span class="text-[13px] font-extrabold text-slate-800">{{ finance.serviceFee | number:'1.2-2' }} SAR</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-slate-100">
                <span class="text-[11px] font-extrabold text-slate-400">{{ 'ORDERS.DETAIL.FINANCE_CARD.VAT' | translate }}</span>
                <span class="text-[13px] font-extrabold text-slate-800">{{ finance.vat | number:'1.2-2' }} SAR</span>
              </div>
              <div class="flex justify-between items-center py-3 px-3 mt-4 rounded-xl" [ngClass]="finance.netMargin >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'">
                <span class="text-[11px] font-extrabold">{{ 'ORDERS.DETAIL.FINANCE_CARD.NET_MARGIN' | translate }} ({{ finance.marginPercent | number:'1.1-1' }}%)</span>
                <span class="text-[14px] font-extrabold">{{ finance.netMargin | number:'1.2-2' }} SAR</span>
              </div>
            </div>

            <div class="mt-5 pt-4 flex gap-2 border-t border-slate-100">
              <a [routerLink]="['/finances/ledger']" [queryParams]="{ orderId: currentOrder.id }" class="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-2 text-[11px] font-extrabold text-slate-700 hover:bg-slate-50">
                <span class="material-symbols-outlined text-[16px]">receipt_long</span> Ledger
              </a>
              <a [routerLink]="['/finances/refunds']" [queryParams]="{ orderId: currentOrder.id }" class="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zadna-primary px-2 text-[11px] font-extrabold text-white hover:bg-zadna-primaryDark">
                <span class="material-symbols-outlined text-[16px]">undo</span> Refunds
              </a>
            </div>
          </section>
        </div>
      </div>

      <!-- Right Column (Stakeholders & Support) -->
      <div class="col-span-12 xl:col-span-4 space-y-6">
        
        <!-- Driver Details -->
        <section class="bg-white border-t-4 border-amber-500 border-x border-b border-slate-200/60 rounded-[1.75rem] p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.03)] hover:border-amber-400 transition-all duration-300">
          <app-section-header class="mb-5" [compact]="true" icon="local_shipping" title="ORDERS.DETAIL.DRIVER_DETAILS"></app-section-header>
          <div class="space-y-3 text-[11px] mb-5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div class="flex justify-between items-center">
              <span class="text-slate-500 font-bold">{{ 'ORDERS.DETAIL.DRIVER' | translate }}</span>
              <span class="font-extrabold text-slate-800">{{ currentOrder.driverName }}</span>
            </div>
            <div class="flex justify-between items-center border-t border-slate-100 pt-2">
              <span class="text-slate-500 font-bold">{{ 'ORDERS.DETAIL.PHONE' | translate }}</span>
              <span class="font-extrabold font-mono text-slate-800" dir="ltr">{{ currentOrder.driverPhone }}</span>
            </div>
            <div class="flex justify-between items-center border-t border-slate-100 pt-2">
              <span class="text-slate-500 font-bold">{{ 'ORDERS.DETAIL.VEHICLE' | translate }}</span>
              <span class="font-extrabold text-slate-800">{{ currentOrder.driverVehicleLabel }}</span>
            </div>
            <div class="flex justify-between items-center border-t border-slate-100 pt-2">
              <span class="text-slate-500 font-bold">{{ 'ORDERS.DETAIL.PLATE' | translate }}</span>
              <span class="font-extrabold font-mono text-slate-800" dir="ltr">{{ currentOrder.driverPlateNumber }}</span>
            </div>
          </div>
          <div class="space-y-2">
            <button class="w-full py-2.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-[11px] font-extrabold hover:bg-amber-100 transition-colors" type="button" (click)="openDriverAssignmentModal()">
              {{ 'ORDERS.DETAIL.CHANGE_DRIVER' | translate }}
            </button>
            <button *ngIf="canRecomputeDispatch" class="w-full py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-[11px] font-extrabold hover:bg-slate-50 transition-colors" type="button" (click)="recomputeDispatch()">
              Recompute Dispatch
            </button>
          </div>
        </section>

        <!-- Customer Details -->
        <section class="bg-white border border-slate-200/60 rounded-[1.75rem] p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.03)] hover:border-zadna-primary/20 transition-all duration-300">
          <div class="flex justify-between items-start mb-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200/60">
                <span class="material-symbols-outlined text-zadna-primary text-xl">person</span>
              </div>
              <div>
                <h4 class="text-sm font-extrabold text-slate-800">{{ currentOrder.customerName }}</h4>
                <span class="text-[9px] px-2 py-0.5 mt-1 inline-block bg-slate-100 text-slate-500 border border-slate-200 rounded font-extrabold">{{ currentOrder.city }}</span>
              </div>
            </div>
          </div>
          <div class="space-y-3 pt-2">
            <div class="flex items-center gap-3 text-[13px]">
              <span class="material-symbols-outlined text-slate-400 text-[18px]">call</span>
              <span class="font-mono text-slate-700 font-semibold" dir="ltr">{{ currentOrder.customerPhone }}</span>
            </div>
            <div class="flex items-center gap-3 text-[13px]">
              <span class="material-symbols-outlined text-slate-400 text-[18px]">mail</span>
              <span class="font-mono text-slate-700 font-semibold" dir="ltr">{{ currentOrder.customerEmail }}</span>
            </div>
          </div>
        </section>

        <!-- Merchant Branch -->
        <section class="bg-white border border-slate-200/60 rounded-[1.75rem] p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.03)] hover:border-zadna-primary/20 transition-all duration-300">
          <app-section-header class="mb-5" [compact]="true" icon="storefront" title="ORDERS.DETAIL.MERCHANT_BRANCH"></app-section-header>
          <div class="space-y-3">
            <div>
              <p class="text-sm font-extrabold text-slate-800">{{ currentOrder.merchantName }}</p>
              <p class="text-[10px] font-bold text-slate-400 mt-1">{{ currentOrder.merchantBranch }}</p>
            </div>
            <div class="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p class="text-[10px] font-extrabold text-slate-400 mb-1">{{ 'ORDERS.DETAIL.MERCHANT_LOCATION' | translate }}</p>
              <p class="text-sm font-bold text-slate-700">{{ currentOrder.merchantLocation }}</p>
            </div>
          </div>
        </section>

        <!-- Workflow Section -->
        <section class="bg-white border border-slate-200/60 rounded-[1.75rem] p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.03)] hover:border-zadna-primary/20 transition-all duration-300">
          <app-section-header class="mb-5" [compact]="true" icon="alt_route" title="ORDERS.DETAIL.WORKFLOW_SECTION"></app-section-header>
          <div class="space-y-4">
            <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
              <p class="text-[10px] font-extrabold text-slate-400 mb-2">{{ 'ORDERS.DETAIL.CURRENT_STAGE' | translate }}</p>
              <app-status-pill
                [label]="workflowStageLabel"
                variant="neutral"
                [shouldTranslate]="true"
                size="sm">
              </app-status-pill>
              <p class="text-[10px] font-bold text-slate-500 mt-3">{{ 'ORDERS.DETAIL.NEXT_ACTION' | translate }}</p>
              <p class="text-sm font-extrabold text-slate-800 mt-1">{{ currentOrder.nextActionLabel | translate }}</p>
            </div>
            <div class="rounded-2xl border border-slate-100 bg-white p-4">
              <p class="text-[10px] font-extrabold text-slate-400 mb-2">{{ 'ORDERS.DETAIL.RESOLUTION_STATUS' | translate }}</p>
              <app-status-pill
                [label]="resolutionStateLabel"
                [variant]="getResolutionStateVariant(currentOrder.resolutionState)"
                [shouldTranslate]="true"
                size="sm">
              </app-status-pill>
            </div>

            <div *ngIf="operationalCase as caseItem" class="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
              <div class="flex items-center justify-between gap-2">
                <p class="text-[10px] font-extrabold text-slate-400">{{ 'ORDERS.DETAIL.OPERATIONAL_CASE.TITLE' | translate }}</p>
                <app-status-pill
                  [label]="operationalCaseStatusLabel"
                  [variant]="getOperationalCaseStatusVariant(caseItem.status)"
                  [shouldTranslate]="true"
                  size="sm">
                </app-status-pill>
              </div>
              <p class="text-sm font-extrabold text-slate-800">{{ operationalCaseTypeLabel | translate }}</p>
              <p class="text-[11px] font-bold text-slate-600">{{ caseItem.title }}</p>
              <div class="flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>{{ caseItem.queueLabel }}</span>
                <span>{{ caseItem.lastUpdatedAt }}</span>
              </div>

              <div class="flex flex-wrap gap-2 pt-1">
                <button
                  *ngIf="canResolveOperationalCase"
                  class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-extrabold text-emerald-700 hover:bg-emerald-100 transition-colors"
                  type="button"
                  (click)="resolveOperationalCase()">
                  {{ 'ORDERS.DETAIL.OPERATIONAL_CASE.RESOLVE' | translate }}
                </button>
                <button
                  *ngIf="canCloseOperationalCase"
                  class="rounded-xl border border-zadna-primary/20 bg-zadna-primary/10 px-3 py-2 text-[11px] font-extrabold text-zadna-primary hover:bg-zadna-primary/15 transition-colors"
                  type="button"
                  (click)="closeOperationalCase()">
                  {{ 'ORDERS.DETAIL.OPERATIONAL_CASE.CLOSE' | translate }}
                </button>
                <button
                  *ngIf="canReopenOperationalCase"
                  class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-extrabold text-amber-700 hover:bg-amber-100 transition-colors"
                  type="button"
                  (click)="reopenOperationalCase()">
                  {{ 'ORDERS.DETAIL.OPERATIONAL_CASE.REOPEN' | translate }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Support Disputes -->
        <section class="bg-red-50/30 border border-red-100/70 rounded-[1.75rem] shadow-[0_4px_24px_-4px_rgba(220,38,38,0.05)] hover:border-red-200 transition-all duration-300 p-6">
          <div class="flex items-center justify-between mb-5">
            <app-section-header [compact]="true" tone="danger" icon="report" title="ORDERS.DETAIL.SUPPORT_DISPUTES"></app-section-header>
          </div>
          <div *ngIf="canOpenIssueTools; else activeCaseNotice" class="flex gap-2">
            <button class="flex-1 py-2.5 bg-white rounded-xl text-[11px] font-extrabold border border-red-100 text-slate-700 hover:shadow-md transition-shadow" type="button" (click)="openIssueFlagModal()">{{ 'ORDERS.DETAIL.FLAG_ISSUE' | translate }}</button>
            <button class="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-[11px] font-extrabold hover:bg-red-700 transition-colors" type="button" (click)="openDisputeModal()">{{ 'ORDERS.DETAIL.ESCALATE' | translate }}</button>
          </div>
          <ng-template #activeCaseNotice>
            <div class="rounded-xl border border-red-100 bg-white px-4 py-3 text-[11px] font-bold text-slate-600">
              {{ 'ORDERS.DETAIL.ACTIVE_CASE_NOTICE' | translate }}
            </div>
          </ng-template>
        </section>

        <!-- Activity Log -->
        <section class="bg-white border border-slate-200/60 rounded-[1.75rem] p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.03)] hover:border-zadna-primary/20 transition-all duration-300">
          <app-section-header class="mb-5" [compact]="true" icon="history" title="ORDERS.DETAIL.ACTIVITY_LOG"></app-section-header>
          <div class="space-y-5 relative">
            <div class="absolute right-[3px] top-2 bottom-2 w-[1px] bg-slate-100"></div>

            <div *ngFor="let activity of currentOrder.activities" class="relative flex gap-3 z-10">
              <div class="w-2 h-2 mt-1.5 rounded-full ring-4 ring-white" [ngClass]="getActivityDotClass(activity.tone)"></div>
              <div class="flex-1">
                <p class="text-[11px] font-extrabold text-slate-800">{{ activity.title }}</p>
                <div class="flex items-center justify-between w-full mt-1">
                  <span class="text-[9px] font-bold text-slate-400">{{ activity.actor }}</span>
                  <span class="text-[9px] font-mono text-slate-400 bg-slate-50 px-1.5 rounded">{{ activity.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>`;

const regex = /<div class="grid grid-cols-12 gap-6 animate-in slide-in-from-bottom-10 duration-1000">[\s\S]*?(?=\s*<app-order-status-update-modal)/;
content = content.replace(regex, newGridContent);

fs.writeFileSync(file, content);
console.log('Rearrangement complete');
