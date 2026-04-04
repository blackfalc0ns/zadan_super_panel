import { Injectable } from '@angular/core';
import { createCustomerDetailRecords, refreshCustomerDetailRecord } from '../data/customers.mock';
import {
  CustomerAccountState,
  CustomerDetailRecord
} from '../models/customers.models';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private readonly customers = createCustomerDetailRecords();

  getCustomers(): CustomerDetailRecord[] {
    return this.customers;
  }

  getCustomerById(id: string | null): CustomerDetailRecord | undefined {
    return this.customers.find((customer) => customer.id === id);
  }

  addInternalNote(id: string, message: string): CustomerDetailRecord | undefined {
    return this.updateCustomer(id, (customer) => {
      customer.internalNotes = [
        {
          author: 'Admin User',
          role: customer.accountTeam,
          createdAt: this.auditTimestamp(),
          message,
          tone: 'info'
        },
        ...customer.internalNotes
      ];
    });
  }

  flagForReview(id: string): CustomerDetailRecord | undefined {
    return this.updateCustomer(id, (customer) => {
      if (customer.reviewState === 'none') {
        customer.reviewState = 'flagged';
      }

      if (customer.accountState === 'active') {
        customer.trustState = 'watch';
      }

      customer.internalNotes = [
        {
          author: 'Operations Desk',
          role: 'Customer Health Desk',
          createdAt: this.auditTimestamp(),
          message: 'تم تعليم الحساب للمراجعة ومتابعة الطلبات القادمة عن قرب.',
          tone: 'warning',
          isSystem: true
        },
        ...customer.internalNotes
      ];
    });
  }

  clearReview(id: string): CustomerDetailRecord | undefined {
    return this.updateCustomer(id, (customer) => {
      customer.reviewState = 'none';

      if (customer.accountState === 'under_review') {
        customer.accountState = customer.activeDays30 === 0 ? 'dormant' : 'active';
      }

      if (customer.trustState !== 'blocked') {
        customer.trustState = customer.risk === 'high' || customer.risk === 'critical' ? 'watch' : 'clear';
      }

      if (customer.paymentState !== 'blocked') {
        customer.paymentState = customer.refundsCount >= 3 || customer.disputesCount >= 2 ? 'monitoring' : 'healthy';
      }

      customer.internalNotes = [
        {
          author: 'Risk & Trust Ops',
          role: 'Risk & Trust Ops',
          createdAt: this.auditTimestamp(),
          message: 'تم إغلاق تعليم المراجعة وإرجاع الحساب إلى المتابعة الروتينية.',
          tone: 'success',
          isSystem: true
        },
        ...customer.internalNotes
      ];
    });
  }

  escalateReview(id: string): CustomerDetailRecord | undefined {
    return this.updateCustomer(id, (customer) => {
      customer.reviewState = 'escalated';
      customer.accountState = 'under_review';
      customer.trustState = 'blocked';
      customer.paymentState = customer.paymentState === 'healthy' ? 'monitoring' : customer.paymentState;
      customer.internalNotes = [
        {
          author: 'Risk & Trust Ops',
          role: 'Risk & Trust Ops',
          createdAt: this.auditTimestamp(),
          message: 'تم تصعيد الحساب إلى مراجعة ثقة ومخاطر مع تقييد التشغيل لحين إقفال الملاحظات.',
          tone: 'danger',
          isSystem: true
        },
        ...customer.internalNotes
      ];
    });
  }

  suspendAccount(id: string): CustomerDetailRecord | undefined {
    return this.updateCustomer(id, (customer) => {
      customer.accountState = 'suspended';
      customer.reviewState = 'escalated';
      customer.trustState = 'blocked';
      customer.paymentState = 'blocked';
      customer.internalNotes = [
        {
          author: 'Risk Committee',
          role: 'Risk & Trust Ops',
          createdAt: this.auditTimestamp(),
          message: 'تم تعليق الحساب مؤقتًا حتى إقفال ملاحظات الثقة والمخاطر والتحقق من الاستردادات المفتوحة.',
          tone: 'danger',
          isSystem: true
        },
        ...customer.internalNotes
      ];
    });
  }

  reactivateAccount(id: string): CustomerDetailRecord | undefined {
    return this.updateCustomer(id, (customer) => {
      customer.accountState = this.getReactivatedAccountState(customer);
      customer.reviewState = customer.risk === 'critical' ? 'flagged' : 'none';
      customer.trustState = customer.risk === 'high' || customer.risk === 'critical' ? 'watch' : 'clear';
      customer.paymentState = customer.refundsCount >= 3 || customer.disputesCount >= 2 ? 'monitoring' : 'healthy';
      customer.internalNotes = [
        {
          author: 'Risk & Trust Ops',
          role: 'Risk & Trust Ops',
          createdAt: this.auditTimestamp(),
          message: 'تمت إعادة تفعيل الحساب مع إبقائه تحت متابعة وقائية على الطلبات القادمة.',
          tone: 'success',
          isSystem: true
        },
        ...customer.internalNotes
      ];
    });
  }

  private updateCustomer(
    id: string,
    mutate: (customer: CustomerDetailRecord) => void
  ): CustomerDetailRecord | undefined {
    const customer = this.getCustomerById(id);

    if (!customer) {
      return undefined;
    }

    mutate(customer);
    return refreshCustomerDetailRecord(customer);
  }

  private getReactivatedAccountState(customer: CustomerDetailRecord): CustomerAccountState {
    if (customer.activeDays30 === 0) {
      return 'dormant';
    }

    if (customer.risk === 'high' || customer.risk === 'critical') {
      return 'under_review';
    }

    return 'active';
  }

  private auditTimestamp(): string {
    const now = new Date();
    const datePart = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    const timePart = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(now);

    return `${datePart} ${timePart}`;
  }
}
