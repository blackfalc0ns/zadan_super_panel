import { Routes } from '@angular/router';
import { FinancesShellComponent } from './pages/shell/finances-shell/finances-shell.component';

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
      },
      {
        path: 'wallets',
        loadComponent: () => import('./pages/wallets-list/wallets-list.component').then(m => m.WalletsListComponent)
      },
      {
        path: 'wallets/:id',
        loadComponent: () => import('./pages/wallet-details/wallet-details.component').then(m => m.WalletDetailsComponent)
      },
      {
        path: 'withdrawals',
        loadComponent: () => import('./pages/withdrawals-queue/withdrawals-queue.component').then(m => m.WithdrawalsQueueComponent)
      },
      {
        path: 'platform-account',
        loadComponent: () => import('./pages/platform-account/platform-account.component').then(m => m.PlatformAccountComponent)
      }
    ]
  }
];

