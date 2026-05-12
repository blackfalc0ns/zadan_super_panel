import {
  CustomerDetailRecord,
  CustomerRecord
} from '../models/customers.models';

export const CUSTOMER_RECORDS: CustomerRecord[] = [];
export const CUSTOMER_DETAIL_RECORDS: CustomerDetailRecord[] = [];

export function refreshCustomerDetailRecord(customer: CustomerDetailRecord): CustomerDetailRecord {
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
