import type { DriverCompensationRule } from '@finances/public-api';

export interface Driver {
    id: string;
    driverId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    imageUrl?: string;
    city: string;
    status: 'Online' | 'Offline' | 'OnMission' | 'Suspended';
    verificationStatus: VerificationStatus;
    tasks: {
        active: number;
        completed: number;
        subtitle?: string;
    };
    acceptanceRate: number; // percentage (Performance)
    walletBalance: number;
    issues: string[];
    collectionPaymentStatus: 'good' | 'warning' | 'critical'; // Keeping for backward compatibility if needed
    lastSeenAt: Date; // Keeping for backward compatibility
    performance: DriverPerformance;
    vehicleType?: DriverVehicleType;
    alerts?: string[];
    compensationOverride?: DriverCompensationRule;
}

export type DriverStatus = Driver['status'];

export enum VerificationStatus {
    Verified = 'Verified',
    UnderReview = 'UnderReview',
    Suspended = 'Suspended',
    Unverified = 'Unverified'
}

export enum DriverPerformance {
    Excellent = 'Excellent',
    Good = 'Good',
    NeedsImprovement = 'NeedsImprovement',
    Low = 'Low'
}

export enum DriverVehicleType {
    Car = 'Car',
    Motorcycle = 'Motorcycle',
    Scooter = 'Scooter',
    Van = 'Van',
    Bicycle = 'Bicycle',
    Truck = 'Truck'
}

export interface DriverFilters {
    searchTerm?: string;
    city?: string;
    status?: DriverStatus;
    verificationStatus?: VerificationStatus;
    vehicleType?: DriverVehicleType;
    performance?: DriverPerformance;
}

export interface DriverKPIs {
    total: number;
    onlineNow: number;
    onMission: number;
    underReview: number;
    suspended: number;
    lowPerformance: number;
}
