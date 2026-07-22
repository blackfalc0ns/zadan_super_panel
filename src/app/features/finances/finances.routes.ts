import { Routes } from '@angular/router';
import { FinancesShellComponent } from './pages/shell/finances-shell/finances-shell.component';
import { HasPermissionGuard } from '../../core/guards/has-permission.guard';

export const FINANCES_ROUTES: Routes = [
  {
    path: '',
    component: FinancesShellComponent,
    canActivate: [HasPermissionGuard],
    data: { permission: 'finances.view' },
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        canActivate: [HasPermissionGuard],
        data: { permission: 'finances.view' },
        loadComponent: () => import('./pages/finance-dashboard/finance-dashboard.component').then(m => m.FinanceDashboardComponent)
      },
      {
        path: 'pricing',
        canActivate: [HasPermissionGuard],
        data: { permission: 'finances.manage_settings' },
        loadComponent: () => import('./pages/platform-pricing/platform-pricing.component').then(m => m.PlatformPricingComponent)
      },
      {
        path: 'ledger',
        canActivate: [HasPermissionGuard],
        data: { permission: 'finances.view' },
        loadComponent: () => import('./pages/financial-ledger/financial-ledger.component').then(m => m.FinancialLedgerComponent)
      },
      {
        path: 'settlements',
        canActivate: [HasPermissionGuard],
        data: { permission: 'finances.view' },
        loadComponent: () => import('./pages/settlements/settlements.component').then(m => m.SettlementsComponent)
      },
      {
        path: 'payout-reconciliation',
        canActivate: [HasPermissionGuard],
        data: { permission: 'finances.view' },
        loadComponent: () => import('./pages/payout-reconciliation/payout-reconciliation.component').then(m => m.PayoutReconciliationComponent)
      },
      {
        path: 'refunds',
        canActivate: [HasPermissionGuard],
        data: { permission: 'finances.view' },
        loadComponent: () => import('./pages/financial-refunds/financial-refunds.component').then(m => m.FinancialRefundsComponent)
      },
      {
        path: 'cod',
        canActivate: [HasPermissionGuard],
        data: { permission: 'finances.view' },
        loadComponent: () => import('./pages/cod-reconciliation/cod-reconciliation.component').then(m => m.CodReconciliationComponent)
      },
      {
        path: 'adjustments',
        canActivate: [HasPermissionGuard],
        data: { permission: 'finances.edit' },
        loadComponent: () => import('./pages/financial-adjustments/financial-adjustments.component').then(m => m.FinancialAdjustmentsComponent)
      },
      {
        path: 'audit',
        canActivate: [HasPermissionGuard],
        data: { permission: 'finances.view' },
        loadComponent: () => import('./pages/audit-log/audit-log.component').then(m => m.AuditLogComponent)
      },
      {
        path: 'wallets',
        canActivate: [HasPermissionGuard],
        data: { permission: 'wallets.view' },
        loadComponent: () => import('./pages/wallets-list/wallets-list.component').then(m => m.WalletsListComponent)
      },
      {
        path: 'wallets/:id',
        canActivate: [HasPermissionGuard],
        data: { permission: 'wallets.view' },
        loadComponent: () => import('./pages/wallet-details/wallet-details.component').then(m => m.WalletDetailsComponent)
      },
      {
        path: 'withdrawals',
        canActivate: [HasPermissionGuard],
        data: { permission: 'wallets.approve' },
        loadComponent: () => import('./pages/withdrawals-queue/withdrawals-queue.component').then(m => m.WithdrawalsQueueComponent)
      },
      {
        path: 'platform-account',
        canActivate: [HasPermissionGuard],
        data: { permission: 'finances.manage_settings' },
        loadComponent: () => import('./pages/platform-account/platform-account.component').then(m => m.PlatformAccountComponent)
      }
    ]
  }
];
