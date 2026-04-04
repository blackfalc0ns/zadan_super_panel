import { Driver, DriverPerformance, VerificationStatus } from '@drivers/models/drivers.domain.models';
import { createMockOrders } from '@orders/public-api';
import {
  DriverComplianceSnapshot,
  DriverDetailRecord,
  DriverDocumentRecord,
  DriverFinanceEntry,
  DriverFollowUp,
  DriverHeatmapRow,
  DriverIncidentRecord,
  DriverInsightGroup,
  DriverInternalNote,
  DriverLifecycleStage,
  DriverWorkflowAction,
  DriverWorkflowSummary,
  DriverOperationsSnapshot,
  DriverPerformanceBenchmark,
  DriverPerformanceMetricCard,
  DriverRecentTrip,
  DriverSupportSnapshot,
  DriverSupportTicket,
  DriverTaskAssignment,
  DriverVerificationChecklistItem,
  DriverVerificationSnapshot,
  DriverWeeklyEfficiencyPoint
} from '../models/drivers.models';

const DOCUMENT_IMAGES = {
  nationalId: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8oOIEAvbL0EPqhChtIb524LCdqQCh_E5PgOEU5RrsD_cCn8JBiGGNT2blqu8OjfHSPhMbHxL-lu5Oluhegv8fay1fwN1g7AGtsSMYJajenvXuQ0dpDi3l-nf9RxeeH4YYhQl661ZXxlvsbBEh_kNqHlRbB1ZHb46zH1CMTl9uX6GWLfrAtM9C_TxL5V5f8ibnDc3kP9Dm7jtCoDBxz6kgg5zrq4NTM8P-W-oGVaEH26z6kRYUo1e6D95GwCfxoze9ZTXlUY0Ksn0',
  license: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjxiZkmStie3ic4puXzMEjMkWDTbmde5YA7Q15Bd-xT77hXfnWMEtqYqRvdqGlirP9DVI-kBB7RnFl7POp4aMl_3KCrr3uOAFeqivOkpRVFgr4lStVYmB9J6B1P8g0RCgNbzNyP1rjR2e6PCwTByCFXgs6yZM8_P-ZRxIB7wu8eu2f8zuZ-lRdo80NMh5Tm_gIU8vCftj6ICSW5YEMMFoJbk5MPz3I69Apei_AIs1whfJN-2OwaaMJD2O9lb9Vb6T_3HQqGeRZxlU',
  map: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnncf_mAh1_ZcZ-xdrVlI2-s9HX47eE4a1n4Moiueue41r-7pnznzH4X2p9tswMrNVZM_G5imnAE28dSYVHMVSA1-kMN4SoFPc1hxNWEmehx4-jmqixMjEqKcZUH5aJR2jq5B6ccf0J2XSjpxu2U_mXf9j3SIG9hJN1JsjpPziZa0lqB89-kQVjboy-6S8NiA5oV1LEfvLiRAEbE7Nn3FX2Kst_v9niv-wun4JQWQW406SoEGc3TdgsR1xdNzmi7EnrCaeP9ScPns',
  vehicle: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC34o6NIMA1rTLVpTRNLFK016XzX9kNAiw0wkHBNuEFMgI1HjrgpOm8-nOgrQKNcDoTe7gV5qIfWtbzgc-qUXRnXFFi7nZ53tglncMMOI4szKKIr9k1bGmDnQ1XIPcpY58CdZVHCD6KBxMpKjSgAHdfWqkMccTV4pGcQYyGEHVpbjS6rHzn4Xr4SJZbd7LoiSB6MJwbckj1g_h4jjvK6nPshXmBNuuG0Q078oL0uWLkVxkDjA8s8Pm7iINYFgsRO6eRHveYopKpEdQ',
  selfie: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTa5Vk7AwJ-GVzNLQUcDRC0CuMJQXi-LAyOx162bshsPb0knaiTixKT3KbUKHaJIULhdxuRLK8d4vCK23oELxqOLlNL8SciXXIUSiDsaEfJmBahxW4PTjxI9GMs7Z2o25KQ-qeOOfHYfD9Wbb_NGlHhphL7WUO0UWCOlY7iRgw28PyAw58nmW3X7ibeCelQdxcTYIOO-l7fmdcvPH_y_KVtOyy1CLwGyiBzZvJn0-rv1qPZyYFMSBYh6L6M-Bk8L5FzzL0MKWirog',
  incidentOne: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB57owpfGeFXuCcANdS8U5Sm9dxB7_xc4bvlddIR2TxRjV7M2mkhU8K1sOq8pefIyTWuTznzPD011RKy39D2kvbbskV7dFSYEw-TwvQ1kQA0K5c-lq2-_6lpGRWZaLxF3a1qtFlvpd_trtPSbkefoC_uPT1LkWD5KZUPwY47FcmZ3sGQWNF3wpS7fOvJKzzfmYdUMaHBY56nw8mnz1NJjjO8KLqvnnNKHLGmVGPXt6X_rknfw2wxlV51vMt9U8LMATUdIpWbXJBz1s',
  incidentTwo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCva8AvmCf07yK2d5ZwCLPiHs68HFMBpjt2TRYigxWAf8uFumPWeTOwFhd-EHfZ4sRMTrdCGALUPh6S534HjnEhlOVKvW_XFYg1pzvXIh3sMDukt58Qai3Jrm66xw97EzesQQ9JLeN2ZBWRINYvlu5tAj9qxJCUh9ST7QZTRBq_yr0WOi2BEeJqFhur3yUqtc1l4hYnq2zDS2OIaKull0BNqg22XzDyEAWIY9Yq2mw3inqh88quJSKniR8Tm0mLLrg93HxEzWYh8K8'
};

const DAY_LABELS = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي'];
const REVIEWERS = ['أحمد السويلم', 'سارة أحمد', 'محمد كمال', 'فهد الرشيد', 'نورة علي'];
const VENDORS = ['مطاعم الرومانسية', 'هرفي - العليا', 'بنده - الملقا', 'ماكدونالدز', 'برغرايززر', 'Barns'];

const ORDER_LINK_POOL = createMockOrders().map((order) => order.id);

function normalizeIssues(issues: string[]): string[] {
  const cleaned = issues.filter((issue) => issue !== 'clear');
  return cleaned.length ? Array.from(new Set(cleaned)) : ['clear'];
}

function getDisplayName(driver: Driver): string {
  return `${driver.firstName} ${driver.lastName}`.trim();
}

function getDriverSequence(driver: Driver): number {
  const parsed = Number(driver.id);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getVehicleLabel(vehicleType?: string): string {
  switch (vehicleType) {
    case 'فان':
      return 'فورد ترانزيت 2023';
    case 'دراجة':
      return 'هوندا ديليفري 2024';
    case 'سكوتر':
      return 'ياماها سكوتر 2024';
    default:
      return 'تويوتا هايلوكس 2023';
  }
}

function getPlateNumber(sequence: number): string {
  const padded = `${1000 + (sequence % 9000)}`;
  const suffixes = ['ABC', 'QTR', 'HLM', 'ZDN', 'KSA'];
  return `${padded} ${suffixes[sequence % suffixes.length]}`;
}

function getEmail(sequence: number): string {
  return `driver.${String(sequence).padStart(4, '0')}@zadana.sa`;
}

function getLiveZone(city: string): string {
  const zones: Record<string, string> = {
    الرياض: 'حي النرجس',
    جدة: 'حي الروضة',
    الدمام: 'حي الشاطئ',
    الخبر: 'حي الراكة',
    مكة: 'النسيم',
    المدينة: 'العزيزية',
    الطائف: 'الردف',
    تبوك: 'المروج'
  };

  return zones[city] ?? 'النطاق المركزي';
}

function getComplianceState(driver: Driver): { label: string; variant: 'success' | 'warning' | 'danger' } {
  if (driver.issues.includes('legal') || driver.status === 'Suspended') {
    return { label: 'يتطلب مراجعة', variant: 'danger' };
  }

  if (driver.verificationStatus === VerificationStatus.UnderReview || driver.issues.includes('payment')) {
    return { label: 'تنبيه تشغيلي', variant: 'warning' };
  }

  return { label: 'سليم', variant: 'success' };
}

function getRiskPoints(driver: Driver): number {
  let points = 2 + (driver.issues.length * 2);

  if (driver.performance === DriverPerformance.Low) {
    points += 4;
  }

  if (driver.verificationStatus !== VerificationStatus.Verified) {
    points += 3;
  }

  return Math.min(points, 15);
}

function buildNotes(driver: Driver, sequence: number): DriverInternalNote[] {
  const primaryMessage = driver.performance === DriverPerformance.Excellent
    ? 'المندوب أظهر التزامًا عاليًا في تسليم الطلبات وتجاوبًا سريعًا مع ضغط المنطقة.'
    : driver.performance === DriverPerformance.Low
      ? 'يوصى بمتابعة أداء المندوب بسبب انخفاض القبول ووجود تنبيهات تشغيلية متكررة.'
      : 'الأداء مستقر خلال آخر دورة تشغيل مع حاجة خفيفة لتحسين توقيت الاستلام.';

  return [
    {
      author: 'سارة أحمد',
      role: 'العمليات',
      createdAt: `2026/03/${String(12 + (sequence % 8)).padStart(2, '0')} 09:15 AM`,
      message: primaryMessage
    },
    {
      author: 'محمد كمال',
      role: 'الامتثال',
      createdAt: `2026/03/${String(10 + (sequence % 6)).padStart(2, '0')} 01:20 PM`,
      message: driver.issues.includes('legal')
        ? 'تم رفع تنبيه للمراجعة بسبب شكوى مرتبطة بالسلوك التشغيلي ويحتاج الملف إلى توثيق إضافي.'
        : 'تمت مراجعة البلاغات الأخيرة ولا يوجد ما يمنع استمرار السائق في الجدول الحالي.'
    }
  ];
}

function buildDocuments(driver: Driver): DriverDocumentRecord[] {
  const licenseStatus = driver.status === 'Suspended'
    ? 'review'
    : driver.verificationStatus === VerificationStatus.Verified
      ? 'valid'
      : 'expiring';
  const selfieStatus = driver.verificationStatus === VerificationStatus.Verified ? 'valid' : 'review';

  return [
    {
      id: `${driver.id}-national-id`,
      title: 'الهوية الوطنية',
      imageUrl: DOCUMENT_IMAGES.nationalId,
      status: 'valid',
      statusLabel: 'صالح',
      expiryDate: '2027/05',
      subtitle: 'آخر تحديث: 2026/03/12'
    },
    {
      id: `${driver.id}-license`,
      title: 'رخصة القيادة',
      imageUrl: DOCUMENT_IMAGES.license,
      status: licenseStatus,
      statusLabel: licenseStatus === 'valid' ? 'صالحة' : licenseStatus === 'expiring' ? 'تنتهي قريبًا' : 'قيد المراجعة',
      expiryDate: '2026/07',
      subtitle: 'تنتهي خلال 120 يوم'
    },
    {
      id: `${driver.id}-vehicle`,
      title: 'صورة المركبة',
      imageUrl: DOCUMENT_IMAGES.vehicle,
      status: 'valid',
      statusLabel: 'مطابقة',
      expiryDate: 'تم الالتقاط مؤخرًا',
      subtitle: getVehicleLabel(driver.vehicleType)
    },
    {
      id: `${driver.id}-selfie`,
      title: 'صورة التحقق الشخصي',
      imageUrl: driver.imageUrl || DOCUMENT_IMAGES.selfie,
      status: selfieStatus,
      statusLabel: selfieStatus === 'valid' ? 'مطابقة' : 'تحتاج تأكيد',
      expiryDate: 'تحقق حيوي',
      subtitle: 'مطابقة الوجه والهوية'
    }
  ];
}

function buildWeeklyEfficiency(driver: Driver, sequence: number): DriverWeeklyEfficiencyPoint[] {
  return DAY_LABELS.map((label, index) => {
    const benchmark = 58 + ((sequence + index) % 22);
    const variance = (driver.acceptanceRate / 2) - 35 + ((index % 3) * 4);
    const driverValue = Math.max(38, Math.min(98, Math.round(benchmark + variance / 4)));

    return {
      label,
      driver: driverValue,
      benchmark
    };
  });
}

function getLinkedOrderId(sequence: number, offset = 0): string {
  const index = (sequence + offset) % ORDER_LINK_POOL.length;
  return ORDER_LINK_POOL[index];
}

function buildTaskAssignments(driver: Driver, sequence: number): DriverTaskAssignment[] {
  const zoneName = getLiveZone(driver.city);
  const waitingStatus = driver.status === 'Suspended' ? 'FAILED' : driver.status === 'Offline' ? 'WAITING_DRIVER' : 'PREPARING';

  return [
    {
      id: `TK-${9818 + sequence}`,
      vendor: VENDORS[sequence % VENDORS.length],
      zone: `${driver.city} - ${zoneName}`,
      status: driver.status === 'OnMission' ? 'IN_PROGRESS' : 'COMPLETED',
      statusLabel: driver.status === 'OnMission' ? 'قيد التنفيذ' : 'مكتمل',
      assignedAt: 'Oct - 12 14:30',
      duration: `${18 + (sequence % 7)}m`,
      delayLabel: driver.performance === DriverPerformance.Low ? '+08m' : '00:00',
      codAmount: Number((85 + (sequence % 20) * 3.5).toFixed(2))
    },
    {
      id: `TK-${8900 + sequence}`,
      vendor: VENDORS[(sequence + 1) % VENDORS.length],
      zone: `${driver.city} - ${zoneName}`,
      status: waitingStatus,
      statusLabel: waitingStatus === 'FAILED' ? 'فشل المهمة' : waitingStatus === 'WAITING_DRIVER' ? 'بانتظار سائق' : 'قيد التجهيز',
      assignedAt: 'Oct - 12 13:45',
      duration: waitingStatus === 'FAILED' ? '--' : `${12 + (sequence % 6)}m`,
      delayLabel: waitingStatus === 'FAILED' ? '+15m' : '+05:12',
      codAmount: waitingStatus === 'FAILED' ? 0 : Number((55 + (sequence % 16) * 2.75).toFixed(2))
    },
    {
      id: `TK-${8700 + sequence}`,
      vendor: VENDORS[(sequence + 2) % VENDORS.length],
      zone: `${driver.city} - ${zoneName}`,
      status: 'COMPLETED',
      statusLabel: 'تم التسليم',
      assignedAt: 'Oct - 12 11:15',
      duration: `${20 + (sequence % 5)}m`,
      delayLabel: '00:00',
      codAmount: Number((120 + (sequence % 24) * 1.85).toFixed(2))
    }
  ];
}

function buildTrips(assignments: DriverTaskAssignment[]): DriverRecentTrip[] {
  return assignments.map((assignment) => ({
    id: assignment.id,
    time: assignment.assignedAt,
    category: `${assignment.vendor} (${assignment.zone})`,
    status: assignment.status === 'FAILED'
      ? 'CANCELLED'
      : assignment.status === 'COMPLETED'
        ? 'COMPLETED'
        : 'IN_PROGRESS',
    duration: assignment.duration,
    codAmount: assignment.codAmount,
    delayText: assignment.delayLabel !== '00:00' && assignment.delayLabel !== '--' ? assignment.delayLabel : undefined
  }));
}

function buildOperations(driver: Driver, sequence: number): DriverOperationsSnapshot {
  const assignments = buildTaskAssignments(driver, sequence);
  const utilizationPercent = Math.min(94, 62 + (sequence % 22));

  return {
    zoneName: `${driver.city} - ${getLiveZone(driver.city)}`,
    zoneCapacityLabel: `${32 + (sequence % 14)} / 50 مهمة`,
    zoneUtilizationPercent: utilizationPercent,
    avgDeliveryTimeLabel: `${22 + (sequence % 6)} دقيقة`,
    activeDriversLabel: `${10 + (sequence % 7)} سائق`,
    stabilityLabel: utilizationPercent > 85 ? 'ضغط مرتفع' : 'مستقر',
    rules: [
      'الحد الأقصى للمهام: 8 مهام لكل سائق',
      'تغطية نصف قطر 5 كم من مركز المنطقة',
      'إعادة التوزيع تلقائيًا عند تجاوز SLA'
    ],
    taskAssignments: assignments
  };
}

function buildPerformanceMetricCards(
  driver: Driver,
  completionRate: number,
  averageDelayMinutes: number,
  rating: number,
  routeScore: number
): DriverPerformanceMetricCard[] {
  return [
    {
      id: 'acceptance',
      title: 'معدل القبول',
      value: `${driver.acceptanceRate}%`,
      helper: 'استجابة السائق للعروض',
      deltaLabel: driver.performance === DriverPerformance.Low ? '-1.2%' : '+2.4%',
      tone: driver.performance === DriverPerformance.Low ? 'warning' : 'primary'
    },
    {
      id: 'completion',
      title: 'معدل الإكمال',
      value: `${completionRate}%`,
      helper: 'النسبة من إجمالي الرحلات',
      deltaLabel: completionRate > 92 ? '+1.1%' : '-0.9%',
      tone: completionRate > 92 ? 'success' : 'warning'
    },
    {
      id: 'pickup',
      title: 'وقت الاستلام',
      value: `${Math.max(10, averageDelayMinutes + 6)}د`,
      helper: 'متوسط سرعة الاستجابة',
      deltaLabel: averageDelayMinutes > 8 ? '-3.2%' : '+1.8%',
      tone: averageDelayMinutes > 8 ? 'danger' : 'primary'
    },
    {
      id: 'delivery',
      title: 'وقت التسليم',
      value: `${22 + averageDelayMinutes}د`,
      helper: 'وقت الرحلة المتوسط',
      deltaLabel: driver.performance === DriverPerformance.Excellent ? '+5.0%' : '-1.4%',
      tone: driver.performance === DriverPerformance.Excellent ? 'success' : 'warning'
    },
    {
      id: 'rating',
      title: 'تقييم العملاء',
      value: `${rating.toFixed(2)}/5`,
      helper: 'تقييمات آخر 30 يوم',
      tone: 'success'
    },
    {
      id: 'route-score',
      title: 'Route Score',
      value: `${routeScore}%`,
      helper: 'الكفاءة مقارنة بالمنطقة',
      tone: routeScore >= 86 ? 'primary' : 'warning'
    }
  ];
}

function buildPerformanceBenchmarks(driver: Driver, sequence: number, routeScore: number): DriverPerformanceBenchmark[] {
  return [
    {
      label: 'الأداء التشغيلي',
      driverValue: routeScore,
      regionValue: 75 + (sequence % 4),
      fleetValue: 82 + (sequence % 3),
      unit: '%',
      insight: 'يتفوق على متوسط المنطقة خلال ساعات الصباح.'
    },
    {
      label: 'سرعة التسليم',
      driverValue: 26 + (sequence % 4),
      regionValue: 29 + (sequence % 3),
      fleetValue: 31 + (sequence % 2),
      unit: 'د',
      insight: 'التراجع يظهر فقط وقت الذروة المسائية.'
    },
    {
      label: 'رضا العملاء',
      driverValue: Number((4.4 + ((sequence % 5) * 0.08)).toFixed(1)),
      regionValue: 4.2,
      fleetValue: 4.0,
      unit: '/5',
      insight: 'التقييمات القوية مرتبطة بثبات التواصل مع العميل.'
    }
  ];
}

function buildInsightGroups(driver: Driver): DriverInsightGroup[] {
  return [
    {
      title: 'نقاط القوة',
      icon: 'check_circle',
      tone: 'success',
      items: [
        'التزام واضح بمواعيد الاستلام في الفترة الصباحية.',
        'معدل رضا مرتفع من العملاء المتكررين.',
        'مرونة جيدة في تغطية ضغط المنطقة.'
      ]
    },
    {
      title: 'نقاط تحتاج متابعة',
      icon: 'trending_down',
      tone: 'warning',
      items: driver.performance === DriverPerformance.Low
        ? [
            'انخفاض القبول في نهاية اليوم.',
            'وجود تأخير متكرر في آخر ميل.',
            'تذبذب في الاستجابة أثناء ضغط الطلبات.'
          ]
        : [
            'هناك فرصة لتحسين توزيع المسارات أثناء الذروة.',
            'بعض الرحلات تتجاوز المستهدف في آخر ميل.',
            'الموازنة بين الاستلام والتسليم تحتاج ضبطًا أدق.'
          ]
    },
    {
      title: 'تحذيرات المخاطر',
      icon: 'report_problem',
      tone: driver.issues.includes('legal') ? 'danger' : 'warning',
      items: driver.issues.includes('legal')
        ? ['يوجد بلاغ تشغيلي مفتوح يحتاج مستندات داعمة.', 'يوصى بعدم رفع الحمل التشغيلي قبل الإغلاق النهائي.']
        : ['لا توجد مخاطر حرجة حاليًا، فقط تنبيهات تحصيل ومتابعة خفيفة.']
    },
    {
      title: 'الإجراءات المقترحة',
      icon: 'lightbulb',
      tone: 'primary',
      items: [
        'إعادة توجيه جزئية لمناطق أقل ازدحامًا في الذروة.',
        'جلسة متابعة قصيرة على SLA وخدمة العملاء.',
        'مراجعة خطة التحصيل والالتزامات الأسبوعية.'
      ]
    }
  ];
}

function buildHeatmapRows(sequence: number): DriverHeatmapRow[] {
  return DAY_LABELS.map((label, rowIndex) => ({
    label,
    cells: Array.from({ length: 8 }, (_, cellIndex) => (sequence + rowIndex + cellIndex) % 5)
  }));
}

function buildSupportTickets(driver: Driver, sequence: number): DriverSupportTicket[] {
  const criticalStatus = driver.issues.includes('legal') ? 'IN_PROGRESS' : 'WAITING';

  return [
    {
      id: `TK-${8820 + sequence}`,
      subject: 'مشكلة في رصيد المحفظة بعد الرحلة',
      status: 'WAITING',
      statusLabel: 'بانتظار رد',
      priority: 'HIGH',
      priorityLabel: 'مرتفعة',
      reviewer: REVIEWERS[sequence % REVIEWERS.length],
      updatedAt: '2026/03/24 10:15',
      linkedOrder: getLinkedOrderId(sequence, 0)
    },
    {
      id: `TK-${8900 + sequence}`,
      subject: 'بلاغ عن سلوك غير لائق',
      status: criticalStatus,
      statusLabel: criticalStatus === 'WAITING' ? 'جديد' : 'قيد المعالجة',
      priority: 'CRITICAL',
      priorityLabel: 'حرجة',
      reviewer: REVIEWERS[(sequence + 2) % REVIEWERS.length],
      updatedAt: 'منذ ساعة',
      linkedOrder: getLinkedOrderId(sequence, 1)
    },
    {
      id: `TK-${8700 + sequence}`,
      subject: 'طلب تحديث رخصة القيادة',
      status: 'RESOLVED',
      statusLabel: 'مكتمل',
      priority: 'NORMAL',
      priorityLabel: 'عادية',
      reviewer: REVIEWERS[(sequence + 1) % REVIEWERS.length],
      updatedAt: '2026/03/22 14:40',
      linkedOrder: getLinkedOrderId(sequence, 2)
    }
  ];
}

function buildSupportSnapshot(driver: Driver, sequence: number, notes: DriverInternalNote[]): DriverSupportSnapshot {
  const tickets = buildSupportTickets(driver, sequence);
  const unresolvedCount = tickets.filter((ticket) => ticket.status !== 'RESOLVED').length;

  return {
    openNotesCount: notes.length,
    ticketsCount: tickets.length,
    pendingFollowUpsCount: driver.issues.includes('payment') ? 3 : 1,
    escalationsCount: driver.issues.includes('legal') ? 2 : 0,
    unresolvedCount,
    lastUpdateLabel: driver.status === 'Online' ? 'منذ 10 د' : 'منذ ساعة',
    reviewerName: REVIEWERS[(sequence + 3) % REVIEWERS.length],
    reviewerRole: 'فريق الدعم الفني - المستوى 2',
    reviewerOnline: true,
    chatMessages: [
      {
        direction: 'driver',
        message: 'السلام عليكم، أحتاج مساعدة في تفعيل المحفظة، الرصيد لا يظهر بشكل صحيح بعد آخر رحلة.',
        time: '11:05 AM'
      },
      {
        direction: 'support',
        message: `وعليكم السلام، جاري مراجعة العملية رقم #${4490 + sequence}. يرجى الانتظار دقيقة واحدة.`,
        time: '11:07 AM'
      }
    ],
    tickets,
    tags: [
      { label: driver.issues.includes('legal') ? 'High Risk' : 'Active Support', tone: driver.issues.includes('legal') ? 'danger' : 'success' },
      { label: driver.issues.includes('payment') ? 'Payment Issue' : 'Stable Wallet', tone: driver.issues.includes('payment') ? 'warning' : 'info' },
      { label: driver.status === 'OnMission' ? 'On Mission' : 'Driver Follow-up', tone: 'info' }
    ],
    followUps: [
      { title: 'مراجعة شكوى العميل', dueLabel: 'اليوم 4:00م', tone: 'primary' },
      { title: 'تحديث وثائق التأمين', dueLabel: driver.verificationStatus === VerificationStatus.Verified ? 'خلال 7 أيام' : 'Expired', tone: driver.verificationStatus === VerificationStatus.Verified ? 'warning' : 'danger' }
    ]
  };
}

function buildIncidents(driver: Driver, sequence: number): DriverIncidentRecord[] {
  const hasCriticalIssue = driver.issues.includes('legal') || driver.status === 'Suspended';

  return [
    {
      id: `INC-${9820 + sequence}`,
      type: 'حادث مروري',
      severity: hasCriticalIssue ? 'CRITICAL' : 'HIGH',
      severityLabel: hasCriticalIssue ? 'حرجة' : 'عالية',
      status: 'REVIEW',
      statusLabel: 'قيد المراجعة',
      reviewer: REVIEWERS[sequence % REVIEWERS.length],
      createdAt: '2026/03/24 14:20',
      linkedOrder: getLinkedOrderId(sequence, 0),
      summary: 'حادث بسيط أثناء التسليم يحتاج استكمال تقرير المرور والصور الميدانية.',
      evidenceImages: [DOCUMENT_IMAGES.incidentOne, DOCUMENT_IMAGES.incidentTwo]
    },
    {
      id: `INC-${9810 + sequence}`,
      type: 'اشتباه احتيال',
      severity: driver.issues.includes('payment') ? 'HIGH' : 'MEDIUM',
      severityLabel: driver.issues.includes('payment') ? 'عالية' : 'متوسطة',
      status: driver.issues.includes('payment') ? 'WAITING_DOCS' : 'NEW',
      statusLabel: driver.issues.includes('payment') ? 'بانتظار مستندات' : 'جديد',
      reviewer: REVIEWERS[(sequence + 2) % REVIEWERS.length],
      createdAt: '2026/03/24 12:45',
      linkedOrder: getLinkedOrderId(sequence, 3),
      summary: 'مطابقة غير مكتملة بين قيمة COD وإثبات التحصيل وتتطلب مراجعة فريق المالية.',
      evidenceImages: [DOCUMENT_IMAGES.incidentTwo]
    },
    {
      id: `INC-${9800 + sequence}`,
      type: 'تأخير متكرر',
      severity: 'MEDIUM',
      severityLabel: 'متوسطة',
      status: 'RESOLVED',
      statusLabel: 'تم الإغلاق',
      reviewer: REVIEWERS[(sequence + 1) % REVIEWERS.length],
      createdAt: '2026/03/22 10:15',
      linkedOrder: getLinkedOrderId(sequence, 4),
      summary: 'تم إغلاق الحالة بعد إعادة توزيع المنطقة وتحسن الأداء خلال 48 ساعة.',
      evidenceImages: []
    }
  ];
}

function buildComplianceSnapshot(driver: Driver, documents: DriverDocumentRecord[], sequence: number): DriverComplianceSnapshot {
  const incidents = buildIncidents(driver, sequence);
  const criticalCases = incidents.filter((incident) => incident.severity === 'CRITICAL').length;

  return {
    openCases: incidents.filter((incident) => incident.status !== 'RESOLVED').length,
    criticalCases,
    safetyAlerts: driver.performance === DriverPerformance.Low ? 3 : 1,
    expiredDocuments: documents.filter((document) => document.status === 'expiring').length,
    suspensions: driver.status === 'Suspended' ? 1 : 0,
    riskLabel: criticalCases > 0 ? 'مرتفع' : driver.issues.includes('payment') ? 'متوسط' : 'منخفض',
    documentHealth: {
      valid: documents.filter((document) => document.status === 'valid').length,
      expiring: documents.filter((document) => document.status === 'expiring').length,
      review: documents.filter((document) => document.status === 'review').length
    },
    incidents
  };
}

function buildFinanceEntries(sequence: number, dueAmount: number): DriverFinanceEntry[] {
  return [
    {
      id: `ST-${9200 + sequence}`,
      reference: `PX-${9280 + sequence}`,
      type: 'تحويل أرباح أسبوعي',
      status: 'SETTLED',
      statusLabel: 'تم الدفع',
      amount: Number((2100 + (sequence % 14) * 25).toFixed(2)),
      fee: 0,
      method: 'STC Pay',
      date: '2026-03-25'
    },
    {
      id: `ST-${9100 + sequence}`,
      reference: `PX-${9100 + sequence}`,
      type: 'تحويل بنكي',
      status: 'PENDING',
      statusLabel: 'قيد التسوية',
      amount: Number((1200 + (sequence % 10) * 32).toFixed(2)),
      fee: 25,
      method: 'Bank Transfer',
      date: '2026-03-23'
    },
    {
      id: `ST-${9000 + sequence}`,
      reference: `PX-${9000 + sequence}`,
      type: 'تسوية COD متأخرة',
      status: dueAmount > 1600 ? 'FAILED' : 'PENDING',
      statusLabel: dueAmount > 1600 ? 'فشل التحويل' : 'بانتظار الاعتماد',
      amount: Number((Math.max(450, dueAmount * 0.55)).toFixed(2)),
      fee: 12,
      method: 'STC Pay',
      date: '2026-03-21'
    }
  ];
}

function buildFinanceSnapshot(
  sequence: number,
  totalEarnings: number,
  currentDueAmount: number,
  codCollectedAmount: number
) {
  const pendingDeductions = Number((Math.max(150, currentDueAmount * 0.1)).toFixed(2));

  return {
    availableBalance: Number((totalEarnings - currentDueAmount - pendingDeductions).toFixed(2)),
    dueAmount: currentDueAmount,
    codCollected: codCollectedAmount,
    pendingDeductions,
    nextPayoutDate: `2026-03-${String(25 + (sequence % 4)).padStart(2, '0')}`,
    payoutMethod: 'تحويل أسبوعي إلى STC Pay',
    statementPeriod: 'Oct · 31 Oct 2023',
    entries: buildFinanceEntries(sequence, currentDueAmount)
  };
}

function buildVerificationChecklist(driver: Driver, documents: DriverDocumentRecord[]): DriverVerificationChecklistItem[] {
  const license = documents.find((document) => document.id.endsWith('license'));
  const selfie = documents.find((document) => document.id.endsWith('selfie'));

  return [
    { label: 'اكتمال البيانات الأساسية', completed: true },
    { label: 'تطابق بيانات المركبة', completed: !!driver.vehicleType },
    { label: 'وضوح صورة الهوية الوطنية', completed: true },
    {
      label: 'سريان صلاحية الرخصة',
      completed: license?.status === 'valid',
      note: license?.status === 'expiring' ? 'تنتهي قريبًا وتحتاج تأكيد' : undefined,
      critical: license?.status !== 'valid'
    },
    { label: 'وضوح صور المركبة', completed: true },
    {
      label: 'تطابق الصورة الشخصية للواقع',
      completed: selfie?.status === 'valid',
      note: selfie?.status === 'review' ? 'يحتاج اعتماد المراجع' : undefined,
      critical: selfie?.status !== 'valid'
    }
  ];
}

function buildVerificationSnapshot(driver: Driver, sequence: number, documents: DriverDocumentRecord[]): DriverVerificationSnapshot {
  const checklist = buildVerificationChecklist(driver, documents);
  const completedItems = checklist.filter((item) => item.completed).length;
  const progressPercentage = Math.round((completedItems / checklist.length) * 100);
  const trustScore = Math.max(58, Math.min(96, 72 + (sequence % 18)));
  const recommendation = driver.verificationStatus === VerificationStatus.Verified
    ? 'قبول التوثيق'
    : progressPercentage >= 75
      ? 'قبول بشروط'
      : 'طلب استكمال';
  const recommendationReason = recommendation === 'قبول التوثيق'
    ? 'المستندات مكتملة والهوية والمركبة متطابقتان مع متطلبات التشغيل.'
    : recommendation === 'قبول بشروط'
      ? 'الملف جاهز تشغيليًا لكن توجد نقاط بسيطة تحتاج متابعة قبل الاعتماد النهائي.'
      : 'لا يزال الملف يحتاج استكمال مستندات أو توضيحات قبل التفعيل.';

  return {
    applicationId: `APP-${92000 + sequence}`,
    submittedAt: `2026-03-${String(2 + (sequence % 8)).padStart(2, '0')}`,
    reviewer: REVIEWERS[(sequence + 4) % REVIEWERS.length],
    trustScore,
    progressPercentage,
    recommendation,
    recommendationReason,
    checklist,
    decisionNote: driver.verificationStatus === VerificationStatus.Verified
      ? 'السائق مستوفٍ للقبول ويمكن الاستمرار في التشغيل.'
      : 'يوصى بمراجعة صلاحية الرخصة والصورة الشخصية قبل اعتماد التوثيق.',
    internalNote: 'هذه الملاحظات داخلية للمشرفين ولن تظهر للسائق.',
    rejectionReasonOptions: [
      'المستندات غير واضحة',
      'انتهاء صلاحية المستندات',
      'عدم تطابق الصور',
      'بيانات المركبة غير صحيحة'
    ]
  };
}

function buildLifecycleStages(driver: Driver, complianceVariant: 'success' | 'warning' | 'danger', verificationProgress: number): DriverLifecycleStage[] {
  const verificationState = driver.verificationStatus === VerificationStatus.Verified
    ? 'completed'
    : driver.verificationStatus === VerificationStatus.Suspended
      ? 'attention'
      : 'current';
  const activationState = driver.verificationStatus === VerificationStatus.Verified ? 'completed' : 'upcoming';
  const operationsState: DriverLifecycleStage['state'] = driver.status === 'Suspended'
    ? 'attention'
    : driver.verificationStatus !== VerificationStatus.Verified
      ? 'upcoming'
      : 'current';
  const financeState: DriverLifecycleStage['state'] = complianceVariant === 'danger'
    ? 'attention'
    : driver.verificationStatus !== VerificationStatus.Verified
      ? 'upcoming'
      : 'current';

  return [
    {
      id: 'application',
      label: 'الانضمام',
      description: 'استلام الطلب وتسجيل الملف',
      state: 'completed',
      metric: 'الملف مستلم'
    },
    {
      id: 'verification',
      label: 'التوثيق',
      description: 'فحص المستندات والهوية',
      state: verificationState,
      metric: `${verificationProgress}%`
    },
    {
      id: 'activation',
      label: 'التفعيل',
      description: 'جاهزية الحساب والمركبة',
      state: activationState,
      metric: driver.verificationStatus === VerificationStatus.Verified ? 'مفعل' : 'بانتظار الاعتماد'
    },
    {
      id: 'operations',
      label: 'التشغيل',
      description: 'المهام اليومية والمناطق',
      state: operationsState,
      metric: driver.status === 'OnMission' ? 'في مهمة' : driver.status === 'Online' ? 'نشط' : driver.status === 'Offline' ? 'متوقف مؤقتًا' : 'متوقف'
    },
    {
      id: 'finance',
      label: 'التحصيل والامتثال',
      description: 'COD والمخاطر والتنبيهات',
      state: financeState,
      metric: complianceVariant === 'danger' ? 'تدخل فوري' : complianceVariant === 'warning' ? 'متابعة' : 'سليم'
    }
  ];
}

function buildWorkflowSummary(
  driver: Driver,
  verification: DriverVerificationSnapshot,
  compliance: DriverComplianceSnapshot,
  finance: DriverDetailRecord['finance'],
  support: DriverSupportSnapshot,
  documents: DriverDocumentRecord[]
): DriverWorkflowSummary {
  const issues = normalizeIssues(driver.issues);
  const hasPaymentHold = issues.includes('payment') || driver.collectionPaymentStatus === 'critical' || finance.dueAmount > 1600;
  const hasComplianceHold = issues.includes('legal') || compliance.criticalCases > 0;
  const hasVerificationBlock = driver.verificationStatus !== VerificationStatus.Verified;
  const hasExpiringDocs = documents.some((document) => document.status === 'expiring');
  const hasReviewDocs = documents.some((document) => document.status === 'review');
  const hasPerformanceAlert = driver.performance === DriverPerformance.Low || driver.performance === DriverPerformance.NeedsImprovement;

  const blockers: string[] = [];
  const alerts: string[] = [];

  if (hasVerificationBlock) {
    blockers.push('الملف لم يحصل على اعتماد التوثيق بعد، ولا يجب فتح السائق للإسناد.');
  }

  if (driver.status === 'Suspended') {
    blockers.push('الحساب موقوف حاليًا ولا يمكن إسناد مهام أو صرف مستحقات جديدة.');
  }

  if (hasPaymentHold) {
    blockers.push('يوجد تعليق مالي أو COD غير مسوى ويحتاج حسم قبل أي صرف جديد.');
  }

  if (hasComplianceHold) {
    blockers.push('هناك حالة امتثال أو بلاغ مفتوح يحتاج قرارًا قبل العودة للتشغيل الطبيعي.');
  }

  if (hasExpiringDocs) {
    alerts.push('بعض المستندات تقترب من الانتهاء وتحتاج متابعة قبل أن تتحول إلى إيقاف.');
  }

  if (hasReviewDocs) {
    alerts.push('يوجد مستند أو صورة هوية تحت المراجعة اليدوية.');
  }

  if (hasPerformanceAlert) {
    alerts.push('أداء السائق يحتاج متابعة قبل زيادة الحمل التشغيلي عليه.');
  }

  if (support.pendingFollowUpsCount > 1) {
    alerts.push(`هناك ${support.pendingFollowUpsCount} متابعات دعم معلقة على هذا السائق.`);
  }

  let state: DriverWorkflowSummary['state'];
  let stateLabel: string;
  let summary: string;
  let nextActionLabel: string;
  let readiness: DriverWorkflowSummary['readiness'];
  let readinessLabel: string;
  let ownerTeamLabel: string;
  let queueLabel: string;
  let actions: DriverWorkflowAction[];

  if (driver.status === 'Suspended') {
    state = 'SUSPENDED';
    stateLabel = 'موقوف تشغيليًا';
    summary = 'السائق خارج التشغيل حاليًا، والقرار المطلوب هو حسم سبب الإيقاف ثم تقرير إعادة التفعيل أو استمرار التعليق.';
    nextActionLabel = 'راجع سبب الإيقاف أولًا ثم قرر إعادة التفعيل أو إبقاء الحساب معلقًا.';
    readiness = 'BLOCKED';
    readinessLabel = 'متوقف بالكامل';
    ownerTeamLabel = 'الامتثال + العمليات';
    queueLabel = 'طابور الإيقاف وإعادة التفعيل';
    actions = [
      { id: 'REVIEW_COMPLIANCE', label: 'مراجعة الامتثال', helper: 'افتح الحالات والبلاغات المرتبطة قبل اتخاذ القرار.', icon: 'gavel', tone: 'warning', targetTab: 'compliance' },
      { id: 'OPEN_FINANCE', label: 'مراجعة المالية', helper: 'تأكد من عدم وجود حجز مالي يمنع إعادة التفعيل.', icon: 'payments', tone: 'secondary', targetTab: 'finance' },
      { id: 'REACTIVATE_DRIVER', label: 'إعادة التفعيل', helper: 'يعيد السائق إلى وضع الاستعداد وليس الإسناد المباشر.', icon: 'restart_alt', tone: 'success', targetTab: 'overview' }
    ];
  } else if (hasVerificationBlock) {
    state = verification.progressPercentage >= 75 ? 'VERIFICATION_REVIEW' : 'PENDING_DOCUMENTS';
    stateLabel = verification.progressPercentage >= 75 ? 'مراجعة توثيق' : 'استكمال مستندات';
    summary = 'السائق ما زال في مسار التوثيق ولا ينبغي اعتباره جاهزًا للتشغيل حتى اكتمال الاعتماد.';
    nextActionLabel = verification.progressPercentage >= 75
      ? 'راجع العناصر الحرجة واعتمد القرار النهائي للتوثيق.'
      : 'اطلب المستندات الناقصة أو غير الواضحة ثم أعد الملف للمراجعة.';
    readiness = 'BLOCKED';
    readinessLabel = 'محجوب حتى الاعتماد';
    ownerTeamLabel = 'فريق التوثيق';
    queueLabel = verification.progressPercentage >= 75 ? 'طابور اعتماد التوثيق' : 'طابور استكمال المستندات';
    actions = [
      { id: 'REQUEST_DOCUMENTS', label: 'طلب مستندات', helper: 'يبقي السائق خارج التشغيل لحين استكمال النواقص.', icon: 'description', tone: 'warning', targetTab: 'verification' },
      { id: 'APPROVE_VERIFICATION', label: 'اعتماد التوثيق', helper: 'يحرك السائق إلى جاهزية التفعيل بدلاً من بقائه معلقًا.', icon: 'verified', tone: 'success', targetTab: 'verification' },
      { id: 'OPEN_SUPPORT', label: 'فتح متابعة دعم', helper: 'للتواصل مع السائق إذا كان الملف متعثرًا بسبب نقص مستندات.', icon: 'support_agent', tone: 'secondary', targetTab: 'support' }
    ];
  } else if (hasComplianceHold) {
    state = 'COMPLIANCE_REVIEW';
    stateLabel = 'مراجعة امتثال';
    summary = 'الملف لديه حالة امتثال أو بلاغ مفتوح، ويجب حسمه قبل توسيع الإسناد أو إعادة التفعيل الكامل.';
    nextActionLabel = 'راجع الحالة المفتوحة وحدد هل تكفي المراقبة أم يلزم تعليق أو تصعيد.';
    readiness = 'BLOCKED';
    readinessLabel = 'محجوب بالامتثال';
    ownerTeamLabel = 'فريق الامتثال';
    queueLabel = 'طابور الحوادث والبلاغات';
    actions = [
      { id: 'REVIEW_COMPLIANCE', label: 'فتح حالات الامتثال', helper: 'راجع الأدلة والحالة المفتوحة من شاشة الامتثال.', icon: 'policy', tone: 'warning', targetTab: 'compliance' },
      { id: 'SUSPEND_DRIVER', label: 'تعليق السائق', helper: 'يُستخدم عند وجود خطر تشغيلي أو امتثالي فعلي.', icon: 'block', tone: 'danger', targetTab: 'overview' },
      { id: 'OPEN_SUPPORT', label: 'مراجعة الدعم', helper: 'تحقق من التذاكر المفتوحة والسياق التشغيلي المرتبط.', icon: 'support_agent', tone: 'secondary', targetTab: 'support' }
    ];
  } else if (hasPaymentHold) {
    state = 'FINANCE_HOLD';
    stateLabel = 'تعليق مالي';
    summary = 'يوجد تعليق مالي أو عدم تسوية في COD، ويجب إنهاؤه قبل صرف جديد أو إعادة الثقة التشغيلية الكاملة.';
    nextActionLabel = 'راجع المالية أولًا ثم أزل التعليق إذا كانت التسوية مكتملة.';
    readiness = 'LIMITED';
    readinessLabel = 'جاهز جزئيًا';
    ownerTeamLabel = 'المالية + العمليات';
    queueLabel = 'طابور COD والتسويات';
    actions = [
      { id: 'OPEN_FINANCE', label: 'فتح المالية', helper: 'راجع الرصيد والمستحقات والسجلات الفاشلة قبل الإجراء.', icon: 'payments', tone: 'warning', targetTab: 'finance' },
      { id: 'CLEAR_FINANCE_HOLD', label: 'إزالة التعليق المالي', helper: 'يصفّر الحجز المحلي ويعيد الملف لوضع أكثر استقرارًا.', icon: 'task_alt', tone: 'success', targetTab: 'finance' },
      { id: 'OPEN_SUPPORT', label: 'فتح الدعم', helper: 'إذا كانت المشكلة مرتبطة بتواصل مع السائق أو اعتراض على التحصيل.', icon: 'support_agent', tone: 'secondary', targetTab: 'support' }
    ];
  } else if (driver.status === 'OnMission') {
    state = 'ACTIVE_DELIVERY';
    stateLabel = 'نشط في مهمة';
    summary = 'السائق داخل مهمة حية الآن، والتركيز الحالي يجب أن يكون على مراقبة التنفيذ وSLA والدعم السريع فقط.';
    nextActionLabel = 'تابع المهمة الحالية وافتح الدعم فقط عند وجود تأخير أو شكوى فعلية.';
    readiness = 'READY';
    readinessLabel = 'يعمل الآن';
    ownerTeamLabel = 'العمليات الحية';
    queueLabel = 'طابور المراقبة المباشرة';
    actions = [
      { id: 'OPEN_OPERATIONS', label: 'فتح المهام الحية', helper: 'يعرض التعيينات الحالية والمنطقة والحمولة.', icon: 'local_shipping', tone: 'primary', targetTab: 'operations' },
      { id: 'OPEN_SUPPORT', label: 'فتح الدعم', helper: 'للتعامل مع أي تصعيد من السائق أو العميل أثناء المهمة.', icon: 'support_agent', tone: 'secondary', targetTab: 'support' },
      { id: 'OPEN_FINANCE', label: 'مراجعة COD', helper: 'تحقق من التحصيل فقط إذا كانت المهمة مرتبطة بمبالغ نقدية.', icon: 'payments', tone: 'secondary', targetTab: 'finance' }
    ];
  } else if (driver.status === 'Online') {
    state = 'READY_FOR_DISPATCH';
    stateLabel = 'جاهز للإسناد';
    summary = 'السائق مفعّل وجاهز حاليًا، ودور المشرف هنا هو المراقبة والتأكد من بقاء الجاهزية بدون عوائق.';
    nextActionLabel = 'لا يوجد إجراء عاجل الآن، راقب المنطقة ووزع المهام عند الحاجة.';
    readiness = 'READY';
    readinessLabel = 'جاهز بالكامل';
    ownerTeamLabel = 'العمليات';
    queueLabel = 'طابور السائقين الجاهزين';
    actions = [
      { id: 'OPEN_OPERATIONS', label: 'فتح التشغيل', helper: 'راجع الحمل الحالي وتوزيع المنطقة قبل إسناد جديد.', icon: 'map', tone: 'primary', targetTab: 'operations' },
      { id: 'OPEN_SUPPORT', label: 'متابعة الدعم', helper: 'تحقق من أي متابعات مفتوحة قد تؤثر على الاستقرار التشغيلي.', icon: 'support_agent', tone: 'secondary', targetTab: 'support' },
      { id: 'SUSPEND_DRIVER', label: 'تعليق السائق', helper: 'استخدمه فقط إذا ظهر سبب تشغيلي أو امتثالي واضح.', icon: 'block', tone: 'danger', targetTab: 'overview' }
    ];
  } else {
    state = 'READY_TO_ACTIVATE';
    stateLabel = 'جاهز لإعادة الإدراج';
    summary = 'السائق موثق لكن خارج الجدول الآن، ويمكن إعادته للتشغيل بعد التحقق من آخر جاهزية تشغيلية ومالية.';
    nextActionLabel = 'أعد السائق إلى طابور الإسناد بعد مراجعة سريعة للمنطقة والرصيد والتذاكر المفتوحة.';
    readiness = hasExpiringDocs || hasPerformanceAlert ? 'LIMITED' : 'READY';
    readinessLabel = readiness === 'READY' ? 'جاهز للإدراج' : 'جاهز مع متابعة';
    ownerTeamLabel = 'العمليات';
    queueLabel = 'طابور التفعيل والتجهيز';
    actions = [
      { id: 'MARK_READY_FOR_DISPATCH', label: 'إعادته للإسناد', helper: 'يحوّل السائق إلى وضع الجاهزية التشغيلية.', icon: 'rocket_launch', tone: 'success', targetTab: 'operations' },
      { id: 'OPEN_OPERATIONS', label: 'فتح التشغيل', helper: 'راجع المنطقة والحمل قبل دفعه إلى الجدول.', icon: 'map', tone: 'primary', targetTab: 'operations' },
      { id: 'OPEN_SUPPORT', label: 'فتح الدعم', helper: 'راجع أي ملاحظات أو متابعات أخيرة قبل التفعيل.', icon: 'support_agent', tone: 'secondary', targetTab: 'support' }
    ];
  }

  return {
    state,
    stateLabel,
    summary,
    nextActionLabel,
    readiness,
    readinessLabel,
    ownerTeamLabel,
    queueLabel,
    blockers,
    alerts,
    actions
  };
}

function buildRouteScore(driver: Driver, completionRate: number, averageDelayMinutes: number): number {
  const score = completionRate + Math.round(driver.acceptanceRate * 0.08) - averageDelayMinutes * 2;
  return Math.max(62, Math.min(96, score));
}

export function buildDriverDetailRecord(driver: Driver): DriverDetailRecord {
  const sequence = getDriverSequence(driver);
  const compliance = getComplianceState(driver);
  const todayTrips = driver.tasks.active + 8 + (sequence % 5);
  const completionRate = Math.max(72, Math.min(99, driver.acceptanceRate - 1 + (sequence % 4)));
  const averageDelayMinutes = driver.performance === DriverPerformance.Low ? 14 : driver.performance === DriverPerformance.NeedsImprovement ? 7 : 4;
  const rating = Number(Math.max(3.4, Math.min(4.9, 3.7 + (driver.acceptanceRate / 100) * 1.2)).toFixed(1));
  const codPendingAmount = Number(Math.max(0, Math.abs(driver.walletBalance) + (driver.tasks.active * 180)).toFixed(2));
  const totalEarnings = Number((4200 + (sequence % 90) * 37.5).toFixed(2));
  const currentDueAmount = Number((codPendingAmount + 210).toFixed(2));
  const codCollectedAmount = Number((Math.max(0, driver.walletBalance) + 1240).toFixed(2));
  const documents = buildDocuments(driver);
  const notes = buildNotes(driver, sequence);
  const operations = buildOperations(driver, sequence);
  const recentTrips = buildTrips(operations.taskAssignments);
  const routeScore = buildRouteScore(driver, completionRate, averageDelayMinutes);
  const performanceSnapshot = {
    routeScore,
    rankInZone: 3 + (sequence % 5),
    rankInFleet: 16 + (sequence % 12),
    metricCards: buildPerformanceMetricCards(driver, completionRate, averageDelayMinutes, rating, routeScore),
    benchmarks: buildPerformanceBenchmarks(driver, sequence, routeScore),
    insightGroups: buildInsightGroups(driver),
    heatmapRows: buildHeatmapRows(sequence)
  };
  const support = buildSupportSnapshot(driver, sequence, notes);
  const complianceSnapshot = buildComplianceSnapshot(driver, documents, sequence);
  const finance = buildFinanceSnapshot(sequence, totalEarnings, currentDueAmount, codCollectedAmount);
  const verification = buildVerificationSnapshot(driver, sequence, documents);
  const workflow = buildWorkflowSummary(driver, verification, complianceSnapshot, finance, support, documents);

  return {
    ...driver,
    displayName: getDisplayName(driver),
    email: getEmail(sequence),
    joinedAt: `202${2 + (sequence % 3)}-${String((sequence % 12) + 1).padStart(2, '0')}-${String((sequence % 27) + 1).padStart(2, '0')}`,
    vehicleLabel: getVehicleLabel(driver.vehicleType),
    plateNumber: getPlateNumber(sequence),
    liveZone: getLiveZone(driver.city),
    liveSpeedKmh: 35 + (sequence % 18),
    liveMissionId: `ZD-${55200 + sequence}`,
    todayTrips,
    todayTripsDelta: `+${1 + (sequence % 3)}`,
    completionRate,
    averageDelayMinutes,
    rating,
    codPendingAmount,
    totalEarnings,
    currentDueAmount,
    codCollectedAmount,
    complianceStatusLabel: compliance.label,
    complianceStatusVariant: compliance.variant,
    complianceRiskPoints: getRiskPoints(driver),
    complianceRiskThreshold: 15,
    complianceAlertThreshold: 10,
    routeEfficiencyDelta: `${8 + (sequence % 7)}%`,
    lifetimeTrips: driver.tasks.completed + todayTrips + 180,
    weeklyEfficiency: buildWeeklyEfficiency(driver, sequence),
    documents,
    notes,
    recentTrips,
    lifecycleStages: buildLifecycleStages(driver, compliance.variant, verification.progressPercentage),
    workflow,
    operations,
    performanceSnapshot,
    support,
    compliance: complianceSnapshot,
    finance,
    verification
  };
}

export function getDriverMapPreview(): string {
  return DOCUMENT_IMAGES.map;
}

