import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import {
  OrderActivity,
  DriverAssignmentForm,
  OrderCancellationForm,
  OrderDetail,
  OrderDisputeForm,
  OrderIssueFlagForm,
  OrderListItem,
  OrderListQuery,
  OrderOperationalCase,
  OrderPaymentStatus,
  OrderRefundForm,
  OrderStatusUpdateForm,
  OrdersSummary,
  PaginatedOrdersResponse
} from '../../features/orders/models/orders.models';
import {
  cloneOrder,
  createMockOrders,
  getOrderStatusLabel,
  getRouteTeamLabel,
  getPaymentStatusLabel,
  refreshOrderTimeline,
  refreshOrderWorkflow
} from '../../features/orders/data/orders.mock';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly latencyMs = 220;
  private orders = createMockOrders();

  getOrders(query: OrderListQuery): Observable<PaginatedOrdersResponse> {
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.max(1, query.pageSize || 10);

    let filtered = [...this.orders];
    const searchTerm = query.searchTerm?.trim().toLowerCase();

    if (searchTerm) {
      filtered = filtered.filter((order) =>
        order.displayId.toLowerCase().includes(searchTerm) ||
        order.customerName.toLowerCase().includes(searchTerm) ||
        order.customerPhone.toLowerCase().includes(searchTerm) ||
        order.merchantName.toLowerCase().includes(searchTerm)
      );
    }

    if (query.status && query.status !== 'ALL') {
      filtered = filtered.filter((order) => order.status === query.status);
    }

    if (query.paymentStatus && query.paymentStatus !== 'ALL') {
      filtered = filtered.filter((order) => order.paymentStatus === query.paymentStatus);
    }

    if (query.fulfillmentStatus && query.fulfillmentStatus !== 'ALL') {
      filtered = filtered.filter((order) => order.fulfillmentStatus === query.fulfillmentStatus);
    }

    filtered = this.applyQueueView(filtered, query.queueView);

    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const items = filtered
      .slice(startIndex, startIndex + pageSize)
      .map((order) => this.toListItem(order));

    return of({
      items,
      pageNumber: safePage,
      pageSize,
      totalCount,
      totalPages,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages,
      summary: this.buildSummary(filtered)
    }).pipe(delay(this.latencyMs));
  }

  getOrderById(id: string): Observable<OrderDetail> {
    const order = this.findOrder(id);

    if (!order) {
      return throwError(() => new Error('تعذر العثور على الطلب المطلوب.'));
    }

    return of(cloneOrder(order)).pipe(delay(this.latencyMs));
  }

  getOrdersSnapshot(): OrderDetail[] {
    return this.orders.map((order) => cloneOrder(order));
  }

  getOrderSnapshotById(id: string): OrderDetail | undefined {
    const order = this.findOrder(id);
    return order ? cloneOrder(order) : undefined;
  }

  updateOrderStatus(id: string, form: OrderStatusUpdateForm): Observable<OrderDetail> {
    const order = this.findMutableOrder(id);

    if (!order) {
      return throwError(() => new Error('تعذر تحديث حالة الطلب.'));
    }

    order.status = form.newStatus;
    order.lastUpdatedAt = this.timeNow();
    order.expectedDeliveryWindow = form.expectedDeliveryTime ? this.formatExpectedWindow(form.expectedDeliveryTime) : order.expectedDeliveryWindow;

    if (form.newStatus === 'OUT_FOR_DELIVERY') {
      order.fulfillmentStatus = 'ON_ROUTE';
      order.hasActiveIssue = false;
      order.alertLabel = 'التسليم بدأ فعليًا';
    }

    if (form.newStatus === 'DELIVERED' || form.newStatus === 'COMPLETED') {
      order.fulfillmentStatus = 'DELIVERED';
      order.hasActiveIssue = false;
      order.alertLabel = 'بانتظار الإغلاق النهائي';
    }

    if (form.newStatus === 'CANCELLED') {
      order.fulfillmentStatus = 'CANCELLED';
      order.alertLabel = 'ملغي ويحتاج متابعة مالية إذا وُجد refund';
    }

    this.prependActivity(
      order,
      `تم تحديث حالة الطلب إلى ${getOrderStatusLabel(order.status)}`,
      `مكتب العمليات${form.adminNotes ? ` - ${form.adminNotes}` : ''}`,
      'status'
    );

    this.refreshOrder(order);
    return of(cloneOrder(order)).pipe(delay(this.latencyMs));
  }

  assignDriver(id: string, form: DriverAssignmentForm): Observable<OrderDetail> {
    const order = this.findMutableOrder(id);

    if (!order) {
      return throwError(() => new Error('تعذر تعيين السائق.'));
    }

    const selectedDriver = order.driverCandidates.find((driver) => driver.id === form.selectedDriverId);

    if (!selectedDriver) {
      return throwError(() => new Error('لم يتم العثور على السائق المحدد.'));
    }

    order.driverName = selectedDriver.name;
    order.driverPhone = selectedDriver.phone;
    order.driverVehicleLabel = 'مركبة مخصصة للتوصيل';
    order.driverPlateNumber = 'تحديث يدوي';
    order.fulfillmentStatus = 'DRIVER_ASSIGNED';
    order.status = order.status === 'PENDING' ? 'IN_PROGRESS' : order.status;
    order.lastUpdatedAt = this.timeNow();
    order.alertLabel = 'تم إسناد سائق جديد للطلب';
    order.hasActiveIssue = false;

    this.prependActivity(
      order,
      `تم تعيين السائق ${selectedDriver.name}`,
      `العمليات${form.internalNotes ? ` - ${form.internalNotes}` : ''}`,
      'status'
    );

    this.refreshOrder(order);
    return of(cloneOrder(order)).pipe(delay(this.latencyMs));
  }

  cancelOrder(id: string, form: OrderCancellationForm): Observable<OrderDetail> {
    const order = this.findMutableOrder(id);

    if (!order) {
      return throwError(() => new Error('تعذر إلغاء الطلب.'));
    }

    order.status = 'CANCELLED';
    order.fulfillmentStatus = 'CANCELLED';
    order.paymentStatus = form.refundType === 'none'
      ? order.paymentStatus
      : form.refundType === 'partial'
        ? 'PARTIALLY_REFUNDED'
        : 'REFUNDED';
    order.cancellationReason = this.mapCancellationReason(form.reason);
    order.cancellationSummary = {
      reasonLabel: this.mapCancellationReason(form.reason),
      details: form.details || 'تم الإلغاء من لوحة العمليات.',
      refundType: form.refundType,
      costBearer: form.refundType === 'none' ? 'platform' : form.costBearer,
      cancelledAt: this.timeNow(),
      cancelledBy: 'مكتب العمليات',
      customerMessage: form.customerMessage || 'تم تحديث حالة الطلب إلى ملغي.'
    };
    order.operationalCase = form.refundType === 'none'
      ? order.operationalCase
      : {
          type: 'REFUND',
          status: 'OPEN',
          title: 'استرداد بعد إلغاء الطلب',
          queueLabel: 'المالية',
          openedAt: this.timeNow(),
          lastUpdatedAt: this.timeNow()
        };
    order.lastUpdatedAt = this.timeNow();
    order.hasActiveIssue = form.refundType !== 'none';
    order.alertLabel = 'الطلب ملغي وتم حفظ سبب الإلغاء';

    this.prependActivity(
      order,
      `تم إلغاء الطلب بسبب: ${order.cancellationReason}`,
      `مكتب العمليات${form.internalNote ? ` - ${form.internalNote}` : ''}`,
      'issue'
    );

    this.refreshOrder(order);
    return of(cloneOrder(order)).pipe(delay(this.latencyMs));
  }

  createRefund(id: string, form: OrderRefundForm): Observable<OrderDetail> {
    const order = this.findMutableOrder(id);

    if (!order) {
      return throwError(() => new Error('تعذر فتح الاسترداد.'));
    }

    order.paymentStatus = form.refundType === 'partial' ? 'PARTIALLY_REFUNDED' : 'REFUNDED';
    order.lastUpdatedAt = this.timeNow();
    order.hasActiveIssue = true;
    order.operationalCase = {
      type: 'REFUND',
      status: 'OPEN',
      title: form.refundType === 'partial' ? 'استرداد جزئي' : 'استرداد كامل',
      queueLabel: 'المالية',
      openedAt: this.timeNow(),
      lastUpdatedAt: this.timeNow()
    };
    order.alertLabel = `تم فتح ${form.refundType === 'partial' ? 'استرداد جزئي' : 'استرداد كامل'} على الطلب`;
    order.paymentStatusNote = `تم تسجيل ${form.refundType === 'partial' ? 'استرداد جزئي' : 'استرداد كامل'} بقيمة ${form.refundAmount} ريال.`;

    this.prependActivity(
      order,
      `تم فتح طلب استرداد - ${getPaymentStatusLabel(order.paymentStatus)}`,
      `المالية${form.internalNotes ? ` - ${form.internalNotes}` : ''}`,
      'payment'
    );

    this.refreshOrder(order);
    return of(cloneOrder(order)).pipe(delay(this.latencyMs));
  }

  openDispute(id: string, form: OrderDisputeForm): Observable<OrderDetail> {
    const order = this.findMutableOrder(id);

    if (!order) {
      return throwError(() => new Error('تعذر تصعيد النزاع.'));
    }

    order.hasActiveIssue = true;
    order.lastUpdatedAt = this.timeNow();
    order.operationalCase = {
      type: 'DISPUTE',
      status: 'OPEN',
      title: this.mapDisputeType(form.disputeType),
      queueLabel: getRouteTeamLabel(form.routeTo),
      openedAt: this.timeNow(),
      lastUpdatedAt: this.timeNow()
    };
    order.alertLabel = `تم فتح نزاع وتحويله إلى ${getRouteTeamLabel(form.routeTo)}`;
    order.supportSummary = 'يوجد نزاع مفتوح يحتاج معالجة end-to-end.';

    this.prependActivity(
      order,
      `تم فتح نزاع بسبب ${this.mapDisputeType(form.disputeType)}`,
      `${getRouteTeamLabel(form.routeTo)}${form.internalNotes ? ` - ${form.internalNotes}` : ''}`,
      'issue'
    );

    this.refreshOrder(order);
    return of(cloneOrder(order)).pipe(delay(this.latencyMs));
  }

  flagIssue(id: string, form: OrderIssueFlagForm): Observable<OrderDetail> {
    const order = this.findMutableOrder(id);

    if (!order) {
      return throwError(() => new Error('تعذر تسجيل التنبيه.'));
    }

    order.hasActiveIssue = true;
    order.lastUpdatedAt = this.timeNow();
    order.operationalCase = {
      type: 'ISSUE',
      status: 'OPEN',
      title: this.mapIssueType(form.issueType),
      queueLabel: getRouteTeamLabel(form.assignedTeam),
      openedAt: this.timeNow(),
      lastUpdatedAt: this.timeNow()
    };
    order.alertLabel = `تم رفع تنبيه ${this.mapIssueType(form.issueType)}`;

    this.prependActivity(
      order,
      `تم رفع تنبيه: ${this.mapIssueType(form.issueType)}`,
      `${getRouteTeamLabel(form.assignedTeam)}${form.requiredAction ? ` - ${form.requiredAction}` : ''}`,
      'issue'
    );

    this.refreshOrder(order);
    return of(cloneOrder(order)).pipe(delay(this.latencyMs));
  }

  resolveOperationalCase(id: string): Observable<OrderDetail> {
    const order = this.findMutableOrder(id);

    if (!order || !order.operationalCase) {
      return throwError(() => new Error('لا توجد حالة تشغيلية مفتوحة ليتم حلها.'));
    }

    order.operationalCase = this.updateOperationalCase(order.operationalCase, {
      status: 'RESOLVED',
      lastUpdatedAt: this.timeNow()
    });
    order.hasActiveIssue = false;
    order.lastUpdatedAt = this.timeNow();
    order.alertLabel = `تم حل ${order.operationalCase.title}`;
    order.supportSummary = 'تم حل الحالة وبانتظار الإغلاق النهائي.';

    this.prependActivity(
      order,
      `تم حل ${order.operationalCase.title}`,
      order.operationalCase.queueLabel,
      'issue'
    );

    this.refreshOrder(order);
    return of(cloneOrder(order)).pipe(delay(this.latencyMs));
  }

  closeOperationalCase(id: string): Observable<OrderDetail> {
    const order = this.findMutableOrder(id);

    if (!order || !order.operationalCase) {
      return throwError(() => new Error('لا توجد حالة تشغيلية ليتم إغلاقها.'));
    }

    const caseTitle = order.operationalCase.title;
    const caseQueue = order.operationalCase.queueLabel;

    order.operationalCase = this.updateOperationalCase(order.operationalCase, {
      status: 'CLOSED',
      lastUpdatedAt: this.timeNow()
    });
    order.hasActiveIssue = false;
    order.lastUpdatedAt = this.timeNow();
    order.alertLabel = `تم إغلاق ${caseTitle}`;
    order.supportSummary = 'لا توجد حالة تشغيلية مفتوحة على الطلب.';

    this.prependActivity(
      order,
      `تم إغلاق ${caseTitle}`,
      caseQueue,
      'note'
    );

    this.refreshOrder(order);
    return of(cloneOrder(order)).pipe(delay(this.latencyMs));
  }

  reopenOperationalCase(id: string): Observable<OrderDetail> {
    const order = this.findMutableOrder(id);

    if (!order || !order.operationalCase) {
      return throwError(() => new Error('لا توجد حالة تشغيلية سابقة ليتم إعادة فتحها.'));
    }

    order.operationalCase = this.updateOperationalCase(order.operationalCase, {
      status: 'OPEN',
      lastUpdatedAt: this.timeNow()
    });
    order.hasActiveIssue = true;
    order.lastUpdatedAt = this.timeNow();
    order.alertLabel = `تمت إعادة فتح ${order.operationalCase.title}`;
    order.supportSummary = 'أعيد فتح الحالة وباتت تحتاج تدخلاً جديدًا.';

    this.prependActivity(
      order,
      `تمت إعادة فتح ${order.operationalCase.title}`,
      order.operationalCase.queueLabel,
      'issue'
    );

    this.refreshOrder(order);
    return of(cloneOrder(order)).pipe(delay(this.latencyMs));
  }

  private applyQueueView(items: OrderDetail[], queueView?: OrderListQuery['queueView']): OrderDetail[] {
    switch (queueView) {
      case 'ACTIVE':
        return items.filter((order) => order.status !== 'CANCELLED' && order.status !== 'COMPLETED');
      case 'LATE':
        return items.filter((order) => order.isLate);
      case 'PAYMENT_ISSUES':
        return items.filter((order) => order.paymentStatus === 'FAILED' || order.paymentStatus === 'PENDING');
      case 'REFUNDS':
        return items.filter((order) => order.paymentStatus === 'REFUNDED' || order.paymentStatus === 'PARTIALLY_REFUNDED');
      default:
        return items;
    }
  }

  private buildSummary(items: OrderDetail[]): OrdersSummary {
    return {
      total: items.length,
      active: items.filter((order) => order.status !== 'CANCELLED' && order.status !== 'COMPLETED').length,
      late: items.filter((order) => order.isLate).length,
      paymentIssues: items.filter((order) => order.paymentStatus === 'FAILED' || order.paymentStatus === 'PENDING').length,
      refunds: items.filter((order) => order.paymentStatus === 'REFUNDED' || order.paymentStatus === 'PARTIALLY_REFUNDED').length
    };
  }

  private toListItem(order: OrderDetail): OrderListItem {
    return {
      id: order.id,
      displayId: order.displayId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      merchantName: order.merchantName,
      merchantBranch: order.merchantBranch,
      date: order.date,
      time: order.time,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      paymentMethodLabel: order.paymentMethodLabel,
      workflowStage: order.workflowStage,
      nextActionLabel: order.nextActionLabel,
      resolutionState: order.resolutionState,
      operationalCase: order.operationalCase,
      lastUpdatedAt: order.lastUpdatedAt,
      total: order.total,
      isLate: order.isLate,
      hasActiveIssue: order.hasActiveIssue,
      cancellationReason: order.cancellationReason
    };
  }

  private findOrder(id: string): OrderDetail | undefined {
    return this.orders.find((order) => order.id === this.normalizeOrderId(id));
  }

  private findMutableOrder(id: string): OrderDetail | undefined {
    return this.findOrder(id);
  }

  private normalizeOrderId(id: string): string {
    return id.replace('#', '').trim();
  }

  private prependActivity(order: OrderDetail, title: string, actor: string, tone: OrderActivity['tone']): void {
    order.activities = [
      {
        title,
        actor,
        time: this.timeNow(),
        tone
      },
      ...order.activities
    ];
  }

  private refreshOrder(order: OrderDetail): void {
    refreshOrderWorkflow(order);
    order.timeline = refreshOrderTimeline(order);
  }

  private updateOperationalCase(operationalCase: OrderOperationalCase, patch: Partial<OrderOperationalCase>): OrderOperationalCase {
    return {
      ...operationalCase,
      ...patch
    };
  }

  private mapCancellationReason(reason: OrderCancellationForm['reason']): string {
    const reasons: Record<OrderCancellationForm['reason'], string> = {
      customer_request: 'طلب من العميل',
      merchant_rejected: 'رفض من المتجر',
      out_of_stock: 'نفاد مخزون',
      payment_issue: 'مشكلة دفع',
      delivery_failed: 'فشل في التنفيذ',
      operational_issue: 'مشكلة تشغيلية',
      fraud_suspected: 'اشتباه احتيال',
      other: 'سبب آخر'
    };

    return reasons[reason];
  }

  private mapDisputeType(type: OrderDisputeForm['disputeType']): string {
    const labels: Record<OrderDisputeForm['disputeType'], string> = {
      payment_issue: 'مشكلة دفع',
      quality_issue: 'مشكلة جودة',
      not_received: 'الطلب لم يصل',
      missing_item: 'عنصر مفقود',
      customer_rejected: 'رفض العميل الاستلام',
      delivery_failure: 'فشل التوصيل',
      fraud: 'اشتباه احتيال',
      other: 'سبب آخر'
    };

    return labels[type];
  }

  private mapIssueType(type: OrderIssueFlagForm['issueType']): string {
    const labels: Record<OrderIssueFlagForm['issueType'], string> = {
      prep_delay: 'تأخير تجهيز',
      delivery_delay: 'تأخير توصيل',
      payment_issue: 'مشكلة دفع',
      communication_issue: 'مشكلة تواصل',
      driver_unavailable: 'عدم توفر سائق',
      address_issue: 'مشكلة عنوان',
      fraud_suspicion: 'اشتباه احتيال',
      other: 'تنبيه آخر'
    };

    return labels[type];
  }

  private timeNow(): string {
    return new Intl.DateTimeFormat('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date());
  }

  private formatExpectedWindow(value: string): string {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return 'بانتظار التحديث';
    }

    return new Intl.DateTimeFormat('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(parsed);
  }
}
