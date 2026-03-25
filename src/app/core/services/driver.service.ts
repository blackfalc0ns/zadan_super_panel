import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Driver, DriverFilters, DriverKPIs, DriverPerformance, VerificationStatus } from '../models/driver';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private readonly mockDrivers = this.buildMockDrivers(12842);

  getDriverById(id: string): Observable<Driver | undefined> {
    const normalizedId = id.trim();
    const driver = this.mockDrivers.find((item) => item.id === normalizedId || item.driverId === normalizedId);

    return of(driver).pipe(delay(120));
  }

  getDriverSnapshotById(id: string): Driver | undefined {
    const normalizedId = id.trim();
    const driver = this.mockDrivers.find((item) => item.id === normalizedId || item.driverId === normalizedId);

    return driver ? this.cloneDriver(driver) : undefined;
  }

  getDriversSnapshot(): Driver[] {
    return this.mockDrivers.map((driver) => this.cloneDriver(driver));
  }

  findDriverByIdentity(criteria: { driverId?: string | null; phoneNumber?: string | null; fullName?: string | null }): Driver | undefined {
    const normalizedDriverId = criteria.driverId?.trim();
    const normalizedPhone = this.normalizePhone(criteria.phoneNumber);
    const normalizedName = this.normalizeName(criteria.fullName);

    const driver = this.mockDrivers.find((item) =>
      (normalizedDriverId && (item.id === normalizedDriverId || item.driverId === normalizedDriverId))
      || (normalizedPhone && this.normalizePhone(item.phoneNumber) === normalizedPhone)
      || (normalizedName && this.normalizeName(`${item.firstName} ${item.lastName}`) === normalizedName)
    );

    return driver ? this.cloneDriver(driver) : undefined;
  }

  getDrivers(
    page: number,
    pageSize: number,
    searchTerm = '',
    filters: DriverFilters = {}
  ): Observable<{ items: Driver[]; totalCount: number }> {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filteredDrivers = this.mockDrivers.filter((driver) => {
      const matchesSearch = !normalizedSearch || [
        driver.driverId,
        driver.firstName,
        driver.lastName,
        `${driver.firstName} ${driver.lastName}`,
        driver.phoneNumber,
        driver.city
      ].some((value) => value.toLowerCase().includes(normalizedSearch));

      const matchesCity = !filters.city || driver.city === filters.city;
      const matchesStatus = !filters.status || driver.status === filters.status;
      const matchesVerification = !filters.verificationStatus || driver.verificationStatus === filters.verificationStatus;
      const matchesVehicleType = !filters.vehicleType || driver.vehicleType === filters.vehicleType;
      const matchesPerformance = !filters.performance || driver.performance === filters.performance;

      return matchesSearch && matchesCity && matchesStatus && matchesVerification && matchesVehicleType && matchesPerformance;
    });

    const start = (page - 1) * pageSize;
    const items = filteredDrivers.slice(start, start + pageSize);

    return of({
      items,
      totalCount: filteredDrivers.length
    }).pipe(delay(250));
  }

  getDriverKPIs(): Observable<DriverKPIs> {
    return of({
      total: 12842,
      onlineNow: 3105,
      onMission: 2488,
      underReview: 412,
      suspended: 84,
      lowPerformance: 195
    }).pipe(delay(180));
  }

  private buildMockDrivers(totalCount: number): Driver[] {
    const baseDrivers: Omit<Driver, 'id' | 'driverId'>[] = [
      {
        firstName: 'سامي بن',
        lastName: 'خالد',
        phoneNumber: '055-123-4567',
        imageUrl: 'https://i.pravatar.cc/96?img=12',
        city: 'الرياض',
        status: 'Online',
        verificationStatus: VerificationStatus.Verified,
        tasks: { active: 4, completed: 623, subtitle: 'آخر تسليم قبل 10 دقائق' },
        acceptanceRate: 98,
        walletBalance: 1240.5,
        issues: ['clear'],
        collectionPaymentStatus: 'good',
        lastSeenAt: new Date(Date.now() - 10 * 60 * 1000),
        performance: DriverPerformance.Excellent,
        vehicleType: 'سيارة'
      },
      {
        firstName: 'ياسر',
        lastName: 'القحطاني',
        phoneNumber: '055-777-8899',
        imageUrl: 'https://i.pravatar.cc/96?img=23',
        city: 'جدة',
        status: 'OnMission',
        verificationStatus: VerificationStatus.Verified,
        tasks: { active: 1, completed: 132, subtitle: 'توصيل قيد التنفيذ' },
        acceptanceRate: 82,
        walletBalance: 410,
        issues: ['warning'],
        collectionPaymentStatus: 'warning',
        lastSeenAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        performance: DriverPerformance.Good,
        vehicleType: 'سيارة'
      },
      {
        firstName: 'خالد',
        lastName: 'العمودي',
        phoneNumber: '056-444-5556',
        imageUrl: 'https://i.pravatar.cc/96?img=33',
        city: 'الدمام',
        status: 'Suspended',
        verificationStatus: VerificationStatus.UnderReview,
        tasks: { active: 0, completed: 19, subtitle: 'لا يوجد نشاط' },
        acceptanceRate: 45,
        walletBalance: -45.2,
        issues: ['payment', 'legal'],
        collectionPaymentStatus: 'critical',
        lastSeenAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        performance: DriverPerformance.Low,
        vehicleType: 'دراجة',
        alerts: ['بلاغات نشطة (2)']
      },
      {
        firstName: 'نوف',
        lastName: 'الشهري',
        phoneNumber: '054-213-1135',
        imageUrl: 'https://i.pravatar.cc/96?img=47',
        city: 'الخبر',
        status: 'Online',
        verificationStatus: VerificationStatus.Verified,
        tasks: { active: 2, completed: 318, subtitle: 'متاح في المنطقة الشرقية' },
        acceptanceRate: 91,
        walletBalance: 980,
        issues: ['clear'],
        collectionPaymentStatus: 'good',
        lastSeenAt: new Date(Date.now() - 25 * 60 * 1000),
        performance: DriverPerformance.Excellent,
        vehicleType: 'سكوتر'
      },
      {
        firstName: 'عبدالله',
        lastName: 'السلمي',
        phoneNumber: '053-664-2177',
        imageUrl: 'https://i.pravatar.cc/96?img=51',
        city: 'مكة',
        status: 'Offline',
        verificationStatus: VerificationStatus.Unverified,
        tasks: { active: 0, completed: 74, subtitle: 'آخر ظهور منذ 6 ساعات' },
        acceptanceRate: 76,
        walletBalance: 215,
        issues: ['warning'],
        collectionPaymentStatus: 'warning',
        lastSeenAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        performance: DriverPerformance.NeedsImprovement,
        vehicleType: 'سيارة'
      },
      {
        firstName: 'فهد',
        lastName: 'الدوسري',
        phoneNumber: '055-112-1188',
        imageUrl: 'https://i.pravatar.cc/96?img=58',
        city: 'الرياض',
        status: 'OnMission',
        verificationStatus: VerificationStatus.Verified,
        tasks: { active: 3, completed: 487, subtitle: 'يشحن 3 طلبات حالياً' },
        acceptanceRate: 88,
        walletBalance: 760.25,
        issues: ['clear'],
        collectionPaymentStatus: 'good',
        lastSeenAt: new Date(Date.now() - 14 * 60 * 1000),
        performance: DriverPerformance.Good,
        vehicleType: 'فان'
      },
      {
        firstName: 'ريم',
        lastName: 'القحطاني',
        phoneNumber: '056-983-7720',
        imageUrl: 'https://i.pravatar.cc/96?img=32',
        city: 'جدة',
        status: 'Online',
        verificationStatus: VerificationStatus.Verified,
        tasks: { active: 5, completed: 702, subtitle: 'مستوى خدمة ممتاز' },
        acceptanceRate: 97,
        walletBalance: 1680.4,
        issues: ['clear'],
        collectionPaymentStatus: 'good',
        lastSeenAt: new Date(Date.now() - 8 * 60 * 1000),
        performance: DriverPerformance.Excellent,
        vehicleType: 'سيارة'
      },
      {
        firstName: 'مازن',
        lastName: 'الحربي',
        phoneNumber: '054-901-2288',
        imageUrl: 'https://i.pravatar.cc/96?img=64',
        city: 'المدينة',
        status: 'Offline',
        verificationStatus: VerificationStatus.UnderReview,
        tasks: { active: 0, completed: 110, subtitle: 'مستندات قيد المراجعة' },
        acceptanceRate: 64,
        walletBalance: 125,
        issues: ['legal'],
        collectionPaymentStatus: 'warning',
        lastSeenAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        performance: DriverPerformance.NeedsImprovement,
        vehicleType: 'دراجة'
      },
      {
        firstName: 'راشد',
        lastName: 'العتيبي',
        phoneNumber: '059-321-9980',
        imageUrl: 'https://i.pravatar.cc/96?img=16',
        city: 'الدمام',
        status: 'OnMission',
        verificationStatus: VerificationStatus.Verified,
        tasks: { active: 2, completed: 265, subtitle: 'منطقة التسليم الجنوبية' },
        acceptanceRate: 84,
        walletBalance: 530,
        issues: ['payment'],
        collectionPaymentStatus: 'warning',
        lastSeenAt: new Date(Date.now() - 45 * 60 * 1000),
        performance: DriverPerformance.Good,
        vehicleType: 'سيارة'
      },
      {
        firstName: 'تركي',
        lastName: 'الزهراني',
        phoneNumber: '055-650-7781',
        imageUrl: 'https://i.pravatar.cc/96?img=15',
        city: 'الطائف',
        status: 'Online',
        verificationStatus: VerificationStatus.Verified,
        tasks: { active: 1, completed: 189, subtitle: 'جاهز للاستلام القادم' },
        acceptanceRate: 90,
        walletBalance: 320,
        issues: ['clear'],
        collectionPaymentStatus: 'good',
        lastSeenAt: new Date(Date.now() - 20 * 60 * 1000),
        performance: DriverPerformance.Good,
        vehicleType: 'سكوتر'
      },
      {
        firstName: 'سالم',
        lastName: 'الرشيدي',
        phoneNumber: '053-771-0024',
        imageUrl: 'https://i.pravatar.cc/96?img=10',
        city: 'تبوك',
        status: 'Suspended',
        verificationStatus: VerificationStatus.Suspended,
        tasks: { active: 0, completed: 58, subtitle: 'إيقاف لحين التسوية' },
        acceptanceRate: 52,
        walletBalance: -120,
        issues: ['payment', 'legal'],
        collectionPaymentStatus: 'critical',
        lastSeenAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        performance: DriverPerformance.Low,
        vehicleType: 'سيارة',
        alerts: ['تحصيل متعثر']
      },
      {
        firstName: 'هند',
        lastName: 'العنزي',
        phoneNumber: '055-104-0021',
        imageUrl: 'https://i.pravatar.cc/96?img=45',
        city: 'الرياض',
        status: 'Online',
        verificationStatus: VerificationStatus.Verified,
        tasks: { active: 6, completed: 941, subtitle: 'أفضل معدل قبول في المنطقة' },
        acceptanceRate: 99,
        walletBalance: 2450.75,
        issues: ['clear'],
        collectionPaymentStatus: 'good',
        lastSeenAt: new Date(Date.now() - 4 * 60 * 1000),
        performance: DriverPerformance.Excellent,
        vehicleType: 'فان'
      }
    ];

    return Array.from({ length: totalCount }, (_, index) => {
      const template = baseDrivers[index % baseDrivers.length];
      const sequence = index + 1;
      const driverNumber = 44000 + sequence;
      const acceptanceShift = ((index % 7) - 3) * 2;
      const normalizedAcceptance = Math.max(35, Math.min(99, template.acceptanceRate + acceptanceShift));
      const walletShift = (index % 6) * 35.5;

      return {
        ...template,
        id: `${sequence}`,
        driverId: `DRV-#${driverNumber}`,
        phoneNumber: this.formatPhone(sequence),
        imageUrl: `https://i.pravatar.cc/96?img=${(sequence % 70) + 1}`,
        tasks: {
          ...template.tasks,
          completed: template.tasks.completed + (index % 31)
        },
        acceptanceRate: normalizedAcceptance,
        walletBalance: template.walletBalance >= 0
          ? Number((template.walletBalance + walletShift).toFixed(2))
          : Number((template.walletBalance - (walletShift / 3)).toFixed(2)),
        lastSeenAt: new Date(Date.now() - ((index % 120) + 5) * 60 * 1000),
        alerts: sequence % 19 === 0 ? ['بلاغات نشطة (2)'] : template.alerts
      };
    });
  }

  private formatPhone(sequence: number): string {
    const seed = `${500000000 + sequence}`.padStart(9, '0').slice(-9);
    return `05${seed.slice(1, 3)}-${seed.slice(3, 6)}-${seed.slice(6, 9)}`;
  }

  private cloneDriver(driver: Driver): Driver {
    return {
      ...driver,
      tasks: { ...driver.tasks },
      issues: [...driver.issues],
      alerts: driver.alerts ? [...driver.alerts] : undefined,
      lastSeenAt: new Date(driver.lastSeenAt)
    };
  }

  private normalizePhone(value: string | null | undefined): string {
    return (value || '').replace(/\D+/g, '');
  }

  private normalizeName(value: string | null | undefined): string {
    return (value || '')
      .toLowerCase()
      .replace(/[^a-z\u0600-\u06ff0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
