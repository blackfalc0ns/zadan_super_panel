import {
  CustomerDetailRecord,
  CustomerRecord,
  CustomerLifecycleStage,
  CustomerWorkflowAction
} from '../models/customers.models';

export const CUSTOMER_RECORDS: CustomerRecord[] = [];
export const CUSTOMER_DETAIL_RECORDS: CustomerDetailRecord[] = [];

export function refreshCustomerDetailRecord(customer: CustomerDetailRecord): CustomerDetailRecord {
  const workflowState = 
    customer.accountState === 'suspended' ? 'suspended' :
    customer.accountState === 'under_review' ? 'under_review' :
    customer.risk === 'critical' || customer.risk === 'high' ? 'monitoring' :
    customer.status === 'low_activity' ? 'retention' : 'healthy';

  const ownerTeamMap: Record<string, string> = {
    healthy: 'CUSTOMERS.DETAIL.WORKFLOW.OWNERS.SUCCESS',
    monitoring: 'CUSTOMERS.DETAIL.WORKFLOW.OWNERS.MONITORING',
    retention: 'CUSTOMERS.DETAIL.WORKFLOW.OWNERS.RETENTION',
    under_review: 'CUSTOMERS.DETAIL.WORKFLOW.OWNERS.RISK',
    suspended: 'CUSTOMERS.DETAIL.WORKFLOW.OWNERS.RISK'
  };

  const queueMap: Record<string, string> = {
    healthy: 'CUSTOMERS.DETAIL.WORKFLOW.QUEUES.GROWTH',
    monitoring: 'CUSTOMERS.DETAIL.WORKFLOW.QUEUES.MONITORING',
    retention: 'CUSTOMERS.DETAIL.WORKFLOW.QUEUES.RETENTION',
    under_review: 'CUSTOMERS.DETAIL.WORKFLOW.QUEUES.TRUST_REVIEW',
    suspended: 'CUSTOMERS.DETAIL.WORKFLOW.QUEUES.SUSPENSION'
  };

  const summaryMap: Record<string, string> = {
    healthy: 'CUSTOMERS.DETAIL.WORKFLOW.SUMMARY.HEALTHY',
    monitoring: 'CUSTOMERS.DETAIL.WORKFLOW.SUMMARY.MONITORING',
    retention: 'CUSTOMERS.DETAIL.WORKFLOW.SUMMARY.RETENTION',
    under_review: 'CUSTOMERS.DETAIL.WORKFLOW.SUMMARY.UNDER_REVIEW',
    suspended: 'CUSTOMERS.DETAIL.WORKFLOW.SUMMARY.SUSPENDED'
  };

  const nextStepMap: Record<string, string> = {
    healthy: 'CUSTOMERS.DETAIL.WORKFLOW.NEXT_STEP.HEALTHY',
    monitoring: 'CUSTOMERS.DETAIL.WORKFLOW.NEXT_STEP.MONITORING',
    retention: 'CUSTOMERS.DETAIL.WORKFLOW.NEXT_STEP.RETENTION',
    under_review: 'CUSTOMERS.DETAIL.WORKFLOW.NEXT_STEP.UNDER_REVIEW',
    suspended: 'CUSTOMERS.DETAIL.WORKFLOW.NEXT_STEP.SUSPENDED'
  };

  const blockers: string[] = [];
  if (customer.accountState === 'suspended') {
    blockers.push('CUSTOMERS.DETAIL.WORKFLOW.BLOCKERS.ACCOUNT_SUSPENDED');
  }
  if (customer.reviewState === 'escalated') {
    blockers.push('CUSTOMERS.DETAIL.WORKFLOW.BLOCKERS.ESCALATED_REVIEW');
  }
  if (customer.trustState === 'blocked') {
    blockers.push('CUSTOMERS.DETAIL.WORKFLOW.BLOCKERS.TRUST_BLOCK');
  }
  if (customer.paymentState === 'blocked') {
    blockers.push('CUSTOMERS.DETAIL.WORKFLOW.BLOCKERS.PAYMENT_BLOCK');
  }

  const alerts: string[] = [];
  if (customer.status === 'low_activity') {
    alerts.push('CUSTOMERS.DETAIL.WORKFLOW.ALERTS.ACTIVITY_DROP');
  }
  if (customer.refundsCount >= 3) {
    alerts.push('CUSTOMERS.DETAIL.WORKFLOW.ALERTS.PAYMENT_RETRIES');
  }
  if (customer.segment === 'new') {
    alerts.push('CUSTOMERS.DETAIL.WORKFLOW.ALERTS.NEW_CUSTOMER');
  }
  if (customer.segment === 'vip') {
    alerts.push('CUSTOMERS.DETAIL.WORKFLOW.ALERTS.VIP_ATTENTION');
  }

  const actions: CustomerWorkflowAction[] = [
    {
      id: 'open_orders',
      labelKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.OPEN_ORDERS.LABEL',
      helperKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.OPEN_ORDERS.HELPER',
      tone: 'neutral',
      icon: 'shopping_bag'
    },
    {
      id: 'open_support',
      labelKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.OPEN_SUPPORT.LABEL',
      helperKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.OPEN_SUPPORT.HELPER',
      tone: 'neutral',
      icon: 'support_agent'
    }
  ];

  if (customer.reviewState === 'none') {
    actions.push({
      id: 'flag_review',
      labelKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.FLAG_REVIEW.LABEL',
      helperKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.FLAG_REVIEW.HELPER',
      tone: 'warning',
      icon: 'flag'
    });
  } else if (customer.reviewState === 'flagged') {
    actions.push({
      id: 'escalate_review',
      labelKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.ESCALATE_REVIEW.LABEL',
      helperKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.ESCALATE_REVIEW.HELPER',
      tone: 'danger',
      icon: 'gpp_maybe'
    });
    actions.push({
      id: 'clear_review',
      labelKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.CLEAR_REVIEW.LABEL',
      helperKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.CLEAR_REVIEW.HELPER',
      tone: 'success',
      icon: 'task_alt'
    });
  } else if (customer.reviewState === 'escalated') {
    actions.push({
      id: 'clear_review',
      labelKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.CLEAR_REVIEW.LABEL',
      helperKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.CLEAR_REVIEW.HELPER',
      tone: 'success',
      icon: 'task_alt'
    });
  }

  if (customer.accountState === 'suspended') {
    actions.push({
      id: 'reactivate_account',
      labelKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.REACTIVATE_ACCOUNT.LABEL',
      helperKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.REACTIVATE_ACCOUNT.HELPER',
      tone: 'success',
      icon: 'restart_alt'
    });
  } else {
    actions.push({
      id: 'suspend_account',
      labelKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.SUSPEND_ACCOUNT.LABEL',
      helperKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.SUSPEND_ACCOUNT.HELPER',
      tone: 'danger',
      icon: 'block'
    });
  }

  customer.workflow = {
    state: workflowState,
    ownerTeamLabelKey: ownerTeamMap[workflowState],
    queueLabelKey: queueMap[workflowState],
    summaryKey: summaryMap[workflowState],
    nextStepKey: nextStepMap[workflowState],
    blockers,
    alerts,
    actions
  };

  customer.lifecycle = [
    {
      id: 'account',
      labelKey: 'CUSTOMERS.DETAIL.LIFECYCLE.ACCOUNT.LABEL',
      valueKey: `CUSTOMERS.DETAIL.LIFECYCLE.ACCOUNT.VALUE.${customer.accountState.toUpperCase()}`,
      hintKey: 
        customer.accountState === 'active' ? 'CUSTOMERS.DETAIL.LIFECYCLE.ACCOUNT.HINT.SUCCESS' :
        customer.accountState === 'suspended' ? 'CUSTOMERS.DETAIL.LIFECYCLE.ACCOUNT.HINT.DANGER' :
        customer.accountState === 'dormant' ? 'CUSTOMERS.DETAIL.LIFECYCLE.ACCOUNT.HINT.NEUTRAL' :
        'CUSTOMERS.DETAIL.LIFECYCLE.ACCOUNT.HINT.WARNING',
      tone: 
        customer.accountState === 'active' ? 'success' :
        customer.accountState === 'suspended' ? 'danger' :
        customer.accountState === 'dormant' ? 'neutral' :
        'warning'
    },
    {
      id: 'trust',
      labelKey: 'CUSTOMERS.DETAIL.LIFECYCLE.TRUST.LABEL',
      valueKey: `CUSTOMERS.DETAIL.LIFECYCLE.TRUST.VALUE.${customer.trustState.toUpperCase()}`,
      hintKey: 
        customer.trustState === 'clear' ? 'CUSTOMERS.DETAIL.LIFECYCLE.TRUST.HINT.SUCCESS' :
        customer.trustState === 'blocked' ? 'CUSTOMERS.DETAIL.LIFECYCLE.TRUST.HINT.DANGER' :
        'CUSTOMERS.DETAIL.LIFECYCLE.TRUST.HINT.WARNING',
      tone: 
        customer.trustState === 'clear' ? 'success' :
        customer.trustState === 'blocked' ? 'danger' :
        'warning'
    },
    {
      id: 'payments',
      labelKey: 'CUSTOMERS.DETAIL.LIFECYCLE.PAYMENTS.LABEL',
      valueKey: `CUSTOMERS.DETAIL.LIFECYCLE.PAYMENTS.VALUE.${customer.paymentState.toUpperCase()}`,
      hintKey: 
        customer.paymentState === 'healthy' ? 'CUSTOMERS.DETAIL.LIFECYCLE.PAYMENTS.HINT.SUCCESS' :
        customer.paymentState === 'blocked' ? 'CUSTOMERS.DETAIL.LIFECYCLE.PAYMENTS.HINT.DANGER' :
        'CUSTOMERS.DETAIL.LIFECYCLE.PAYMENTS.HINT.WARNING',
      tone: 
        customer.paymentState === 'healthy' ? 'success' :
        customer.paymentState === 'blocked' ? 'danger' :
        'warning'
    },
    {
      id: 'engagement',
      labelKey: 'CUSTOMERS.DETAIL.LIFECYCLE.ENGAGEMENT.LABEL',
      valueKey: `CUSTOMERS.DETAIL.LIFECYCLE.ENGAGEMENT.VALUE.${customer.engagementState.toUpperCase()}`,
      hintKey: 
        customer.engagementState === 'loyal' || customer.engagementState === 'growing' ? 'CUSTOMERS.DETAIL.LIFECYCLE.ENGAGEMENT.HINT.SUCCESS' :
        customer.engagementState === 'at_risk' ? 'CUSTOMERS.DETAIL.LIFECYCLE.ENGAGEMENT.HINT.WARNING' :
        customer.engagementState === 'new' ? 'CUSTOMERS.DETAIL.LIFECYCLE.ENGAGEMENT.HINT.INFO' :
        'CUSTOMERS.DETAIL.LIFECYCLE.ENGAGEMENT.HINT.NEUTRAL',
      tone: 
        customer.engagementState === 'loyal' || customer.engagementState === 'growing' ? 'success' :
        customer.engagementState === 'at_risk' ? 'warning' :
        customer.engagementState === 'new' ? 'info' :
        'neutral'
    }
  ];

  return customer;
}

export function createCustomerDetailRecords(): CustomerDetailRecord[] {
  return [];
}

export function getCustomerById(_id: string | null): CustomerRecord | undefined {
  return undefined;
}

export function getCustomerDetailById(_id: string | null): CustomerDetailRecord | undefined {
  return undefined;
}
