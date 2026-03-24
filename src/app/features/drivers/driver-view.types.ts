export type DriverLifecycleTabId =
  | 'overview'
  | 'operations'
  | 'performance'
  | 'support'
  | 'compliance'
  | 'finance'
  | 'verification';

export type DriverPreviewType = 'task' | 'incident';

export interface DriverLifecycleTabDefinition {
  id: DriverLifecycleTabId;
  label: string;
  icon: string;
  count?: string | number;
  attention?: boolean;
}
