import { Routes } from '@angular/router';
import { FinancesShellComponent } from './finances-shell/finances-shell.component';

export const FINANCES_ROUTES: Routes = [
  {
    path: '',
    component: FinancesShellComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () => import('./pages/finance-dashboard/finance-dashboard.component').then(m => m.FinanceDashboardComponent)
      },
      {
        path: 'pricing',
        loadComponent: () => import('./pages/platform-pricing/platform-pricing.component').then(m => m.PlatformPricingComponent)
      },
      {
        path: 'ledger',
        loadComponent: () => import('./pages/financial-ledger/financial-ledger.component').then(m => m.FinancialLedgerComponent)
      },
      {
        path: 'settlements',
        loadComponent: () => import('./pages/settlements/settlements.component').then(m => m.SettlementsComponent)
      },
      {
        path: 'refunds',
        loadComponent: () => import('./pages/refunds-disputes/refunds-disputes.component').then(m => m.RefundsDisputesComponent)
      },
      {
        path: 'cod',
        loadComponent: () => import('./pages/cod-reconciliation/cod-reconciliation.component').then(m => m.CodReconciliationComponent)
      },
      {
        path: 'adjustments',
        loadComponent: () => import('./pages/financial-adjustments/financial-adjustments.component').then(m => m.FinancialAdjustmentsComponent)
      },
      {
        path: 'audit',
        loadComponent: () => import('./pages/audit-log/audit-log.component').then(m => m.AuditLogComponent)
      }
    ]
  }
];
