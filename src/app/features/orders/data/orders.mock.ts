import {
  OrderDetail,
  OrderFulfillmentStatus,
  OrderOperationalCaseStatus,
  OrderOperationalCaseType,
  OrderPaymentStatus,
  OrderResolutionState,
  OrderStatus,
  OrderTimelineItem,
  OrderWorkflowStage
} from '../models/orders.models';

export function getRouteTeamLabel(team: string): string {
  return team || '-';
}

export function getOperationalCaseTypeLabel(type: OrderOperationalCaseType): string {
  return getOperationalCaseTypeKey(type);
}

export function getOperationalCaseTypeKey(type: OrderOperationalCaseType): string {
  return `ORDERS.OPERATIONAL_CASE.TYPE.${String(type).toUpperCase()}`;
}

export function getOperationalCaseStatusLabel(status: OrderOperationalCaseStatus): string {
  return getOperationalCaseStatusKey(status);
}

export function getOperationalCaseStatusKey(status: OrderOperationalCaseStatus): string {
  return `ORDERS.OPERATIONAL_CASE.STATUS.${String(status).toUpperCase()}`;
}

export function getWorkflowStageLabel(stage: OrderWorkflowStage): string {
  return getWorkflowStageKey(stage);
}

export function getWorkflowStageKey(stage: OrderWorkflowStage): string {
  return `ORDERS.WORKFLOW.STAGES.${String(stage).toUpperCase()}`;
}

export function getResolutionStateLabel(state: OrderResolutionState): string {
  return getResolutionStateKey(state);
}

export function getResolutionStateKey(state: OrderResolutionState): string {
  return `ORDERS.WORKFLOW.RESOLUTION.${String(state).toUpperCase()}`;
}

export function getOrderStatusLabel(status: OrderStatus): string {
  return getOrderStatusKey(status);
}

export function getOrderStatusKey(status: OrderStatus): string {
  return `ORDERS.STATUS.${String(status).toUpperCase()}`;
}

export function getPaymentStatusLabel(status: OrderPaymentStatus): string {
  return getPaymentStatusKey(status);
}

export function getPaymentStatusKey(status: OrderPaymentStatus): string {
  return `ORDERS.PAYMENT_STATUS.${String(status).toUpperCase()}`;
}

export function getFulfillmentStatusLabel(status: OrderFulfillmentStatus): string {
  return getFulfillmentStatusKey(status);
}

export function getFulfillmentStatusKey(status: OrderFulfillmentStatus): string {
  return `ORDERS.FULFILLMENT_STATUS.${String(status).toUpperCase()}`;
}

export function createMockOrders(): OrderDetail[] {
  return [];
}

export function cloneOrder(order: OrderDetail): OrderDetail {
  return JSON.parse(JSON.stringify(order)) as OrderDetail;
}

export function refreshOrderTimeline(order: OrderDetail): OrderTimelineItem[] {
  return order.timeline ?? [];
}

export function refreshOrderWorkflow(order: OrderDetail): OrderDetail {
  return order;
}
