import { Injectable } from '@angular/core';
import type {
  DirectoryAudienceType,
  DirectoryPanelScope,
  DirectoryPersonaType
} from '@admin-users/public-api';
import { AdminUsersService } from '@admin-users/public-api';
import {
  EmailBranchScopeMode,
  EmailCenterKpiSnapshot,
  EmailEntityScope,
  EmailRecipientRoute,
  EmailResolvedRecipients,
  EmailSenderProfile,
  EmailWorkflowRule
} from '../models/email-center.models';

const STORAGE_KEY = 'superadmin.email-center.v2';
const LEGACY_STORAGE_KEY = 'superadmin.email-center.v1';

const PANEL_BY_AUDIENCE: Record<DirectoryAudienceType, DirectoryPanelScope> = {
  super_admin: 'super_admin_panel',
  vendor_network: 'vendor_panel',
  drivers: 'driver_app',
  customers: 'customer_app'
};

interface LegacyEmailRule {
  id: string;
  titleKey: string;
  subtitleKey: string;
  categoryKey: string;
  cadenceLabelKey: string;
  triggerNotesKey: string;
  enabled: boolean;
  senderProfileId: string;
  route: {
    to: string[];
    cc: string[];
    bcc: string[];
    owner: string;
    escalation: string;
  };
  template: EmailWorkflowRule['template'];
}

interface EmailCenterStore {
  senderProfiles: EmailSenderProfile[];
  rules: EmailWorkflowRule[];
}

@Injectable({
  providedIn: 'root'
})
export class EmailCenterService {
  private store: EmailCenterStore;

  constructor(private readonly adminUsersService: AdminUsersService) {
    this.store = this.loadStore();
  }

  getSenderProfiles(): EmailSenderProfile[] {
    return this.clone(this.store.senderProfiles);
  }

  getRules(): EmailWorkflowRule[] {
    return this.clone(this.store.rules);
  }

  getRuleById(id: string): EmailWorkflowRule | undefined {
    const rule = this.store.rules.find((entry) => entry.id === id);
    return rule ? this.clone(rule) : undefined;
  }

  saveRule(rule: EmailWorkflowRule): EmailWorkflowRule {
    const normalized = this.normalizeRule(rule);
    const index = this.store.rules.findIndex((entry) => entry.id === rule.id);

    if (index >= 0) {
      this.store.rules[index] = normalized;
    } else {
      this.store.rules = [...this.store.rules, normalized];
    }

    this.persist();
    return this.clone(normalized);
  }

  getKpiSnapshot(): EmailCenterKpiSnapshot {
    const enabledRules = this.store.rules.filter((rule) => rule.enabled);

    return {
      totalRules: this.store.rules.length,
      enabledRules: enabledRules.length,
      senderProfiles: this.store.senderProfiles.length,
      directoryDrivenRules: this.store.rules.filter((rule) =>
        rule.recipientTargets.to.length > 0 ||
        rule.recipientTargets.cc.length > 0 ||
        rule.recipientTargets.bcc.length > 0
      ).length,
      audienceCoverage: new Set(enabledRules.map((rule) => rule.audienceType)).size
    };
  }

  resolveRuleRecipients(rule: EmailWorkflowRule): EmailResolvedRecipients {
    const config = {
      audienceType: rule.audienceType,
      panelScope: rule.panelScope,
      entityId: rule.entityScope.entityId,
      vendorId: rule.entityScope.vendorId,
      branchId: this.resolveBranchScope(rule),
      personaTypes: rule.personaTargets
    };

    const to = this.mergeRecipients(
      this.adminUsersService.resolveRecipientTargetEmails({
        ...config,
        targetIds: rule.recipientTargets.to
      }),
      rule.route.staticTo,
      rule.route.fallbackTo
    );

    const cc = this.mergeRecipients(
      this.adminUsersService.resolveRecipientTargetEmails({
        ...config,
        targetIds: rule.recipientTargets.cc
      }),
      rule.route.staticCc,
      rule.route.fallbackCc
    );

    const bcc = this.mergeRecipients(
      this.adminUsersService.resolveRecipientTargetEmails({
        ...config,
        targetIds: rule.recipientTargets.bcc
      }),
      rule.route.staticBcc,
      rule.route.fallbackBcc
    );

    return { to, cc, bcc };
  }

  private resolveBranchScope(rule: EmailWorkflowRule): string | null {
    if (rule.branchScopeMode === 'specific_branch') {
      return rule.entityScope.branchId;
    }

    return null;
  }

  private mergeRecipients(dynamicRecipients: string[], staticRecipients: string[], fallbackRecipients: string[]): string[] {
    const merged = this.unique([...dynamicRecipients, ...staticRecipients]);
    return merged.length > 0 ? merged : this.unique(fallbackRecipients);
  }

  private loadStore(): EmailCenterStore {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<EmailCenterStore>;
        if (!Array.isArray(parsed.senderProfiles) || !Array.isArray(parsed.rules)) {
          throw new Error('Invalid email center payload');
        }

        return {
          senderProfiles: parsed.senderProfiles.map((profile) => this.normalizeSenderProfile(profile)),
          rules: parsed.rules.map((rule) => this.normalizeRule(rule))
        };
      }

      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw) as Partial<{ senderProfiles: EmailSenderProfile[]; rules: LegacyEmailRule[] }>;
        if (Array.isArray(legacy.senderProfiles) && Array.isArray(legacy.rules)) {
          const migrated = this.migrateLegacyStore(legacy.senderProfiles, legacy.rules);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return migrated;
        }
      }

      const seed = this.createSeedStore();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    } catch {
      const seed = this.createSeedStore();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
  }

  private migrateLegacyStore(senderProfiles: EmailSenderProfile[], rules: LegacyEmailRule[]): EmailCenterStore {
    return {
      senderProfiles: senderProfiles.map((profile) => this.normalizeSenderProfile(profile)),
      rules: rules.map((rule) => {
        const audienceType = this.mapLegacyAudience(rule.id);
        return this.normalizeRule({
          id: rule.id,
          titleKey: rule.titleKey,
          subtitleKey: rule.subtitleKey,
          categoryKey: rule.categoryKey,
          cadenceLabelKey: rule.cadenceLabelKey,
          triggerNotesKey: rule.triggerNotesKey,
          enabled: rule.enabled,
          senderProfileId: rule.senderProfileId,
          audienceType,
          panelScope: PANEL_BY_AUDIENCE[audienceType],
          personaTargets: this.getDefaultPersonaTargets(audienceType),
          entityScope: this.getSeedScope(audienceType),
          branchScopeMode: audienceType === 'vendor_network' ? 'specific_branch' : 'assigned_branch',
          recipientTargets: this.getDefaultRecipientTargets(rule.id, audienceType),
          route: {
            staticTo: rule.route.to,
            staticCc: rule.route.cc,
            staticBcc: rule.route.bcc,
            fallbackTo: [],
            fallbackCc: [],
            fallbackBcc: [],
            owner: rule.route.owner,
            escalation: rule.route.escalation
          },
          template: rule.template
        });
      })
    };
  }

  private mapLegacyAudience(ruleId: string): DirectoryAudienceType {
    switch (ruleId) {
      case 'vendor-review':
        return 'vendor_network';
      default:
        return 'super_admin';
    }
  }

  private getDefaultRecipientTargets(ruleId: string, audienceType: DirectoryAudienceType): EmailWorkflowRule['recipientTargets'] {
    if (audienceType === 'vendor_network') {
      return {
        to: ['vendor_owner', 'branch_manager'],
        cc: ['assigned_super_admin_manager'],
        bcc: []
      };
    }

    if (ruleId === 'admin-invite') {
      return {
        to: ['primary_account_email'],
        cc: ['assigned_super_admin_manager'],
        bcc: []
      };
    }

    return {
      to: ['primary_account_email'],
      cc: [],
      bcc: []
    };
  }

  private normalizeSenderProfile(profile: EmailSenderProfile): EmailSenderProfile {
    return {
      ...profile,
      name: profile.name.trim(),
      address: profile.address.trim().toLowerCase(),
      replyTo: profile.replyTo.trim().toLowerCase()
    };
  }

  private normalizeRule(rule: EmailWorkflowRule): EmailWorkflowRule {
    const audienceType = rule.audienceType ?? 'super_admin';
    const panelScope = rule.panelScope ?? PANEL_BY_AUDIENCE[audienceType];

    return {
      ...rule,
      audienceType,
      panelScope,
      personaTargets: this.unique(rule.personaTargets ?? []),
      entityScope: this.normalizeEntityScope(rule.entityScope),
      branchScopeMode: this.normalizeBranchScopeMode(rule.branchScopeMode),
      recipientTargets: {
        to: this.unique(rule.recipientTargets?.to ?? []),
        cc: this.unique(rule.recipientTargets?.cc ?? []),
        bcc: this.unique(rule.recipientTargets?.bcc ?? [])
      },
      route: this.normalizeRoute(rule.route),
      template: {
        ...rule.template,
        subject: {
          en: rule.template.subject.en.trim(),
          ar: rule.template.subject.ar.trim()
        },
        body: {
          en: rule.template.body.en.trim(),
          ar: rule.template.body.ar.trim()
        },
        variables: this.unique(rule.template.variables ?? [])
      }
    };
  }

  private normalizeEntityScope(scope?: EmailEntityScope | null): EmailEntityScope {
    return {
      entityId: scope?.entityId ?? null,
      vendorId: scope?.vendorId ?? null,
      branchId: scope?.branchId ?? null
    };
  }

  private normalizeBranchScopeMode(mode?: EmailBranchScopeMode | null): EmailBranchScopeMode {
    if (mode === 'assigned_branch' || mode === 'specific_branch') {
      return mode;
    }

    return 'all_branches';
  }

  private normalizeRoute(route?: EmailRecipientRoute | null): EmailRecipientRoute {
    return {
      staticTo: this.unique(route?.staticTo ?? []),
      staticCc: this.unique(route?.staticCc ?? []),
      staticBcc: this.unique(route?.staticBcc ?? []),
      fallbackTo: this.unique(route?.fallbackTo ?? []),
      fallbackCc: this.unique(route?.fallbackCc ?? []),
      fallbackBcc: this.unique(route?.fallbackBcc ?? []),
      owner: route?.owner?.trim() ?? '',
      escalation: route?.escalation?.trim() ?? ''
    };
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store));
  }

  private createSeedStore(): EmailCenterStore {
    return {
      senderProfiles: [
        {
          id: 'ops-primary',
          name: 'Operations Primary',
          address: 'ops@zadana.sa',
          replyTo: 'support@zadana.sa',
          descriptionKey: 'EMAIL_CENTER.PROFILES.OPS_PRIMARY',
          locale: 'bilingual',
          isDefault: true,
          status: 'primary'
        },
        {
          id: 'vendor-network',
          name: 'Vendor Network Desk',
          address: 'vendors@zadana.sa',
          replyTo: 'vendors@zadana.sa',
          descriptionKey: 'EMAIL_CENTER.PROFILES.VENDOR_NETWORK',
          locale: 'bilingual',
          isDefault: false,
          status: 'secondary'
        },
        {
          id: 'finance-digest',
          name: 'Finance Digest',
          address: 'finance@zadana.sa',
          replyTo: 'settlements@zadana.sa',
          descriptionKey: 'EMAIL_CENTER.PROFILES.FINANCE_DIGEST',
          locale: 'english',
          isDefault: false,
          status: 'backup'
        }
      ],
      rules: [
        this.buildRule({
          id: 'super-admin-access-invite',
          titleKey: 'EMAIL_CENTER.EVENTS.SUPER_ADMIN_ACCESS_INVITE.TITLE',
          subtitleKey: 'EMAIL_CENTER.EVENTS.SUPER_ADMIN_ACCESS_INVITE.SUBTITLE',
          categoryKey: 'EMAIL_CENTER.CATEGORIES.ACCESS',
          cadenceLabelKey: 'EMAIL_CENTER.CADENCE.INSTANT',
          triggerNotesKey: 'EMAIL_CENTER.NOTES.SUPER_ADMIN_ACCESS_INVITE',
          enabled: true,
          senderProfileId: 'ops-primary',
          audienceType: 'super_admin',
          personaTargets: ['super_admin_manager', 'super_admin_staff'],
          entityScope: this.getSeedScope('super_admin'),
          recipientTargets: {
            to: ['primary_account_email'],
            cc: ['assigned_super_admin_manager'],
            bcc: []
          },
          route: {
            staticTo: ['security@zadana.sa'],
            staticCc: [],
            staticBcc: [],
            fallbackTo: ['access.control@zadana.sa'],
            fallbackCc: ['security.audit@zadana.sa'],
            fallbackBcc: [],
            owner: 'Access Control Desk',
            escalation: 'Security Governance'
          },
          template: {
            subject: {
              en: 'Your Zadana access is ready, {{full_name}}',
              ar: 'تم تجهيز وصولك في زدانا يا {{full_name}}'
            },
            body: {
              en: 'Hello {{full_name}}, your super admin access invitation is ready. Complete onboarding before {{expiry_date}}.',
              ar: 'مرحباً {{full_name}}، دعوة الوصول الخاصة بك جاهزة. يرجى إكمال التفعيل قبل {{expiry_date}}.'
            },
            variables: ['{{full_name}}', '{{expiry_date}}', '{{invite_link}}']
          }
        }),
        this.buildRule({
          id: 'vendor-branch-invite',
          titleKey: 'EMAIL_CENTER.EVENTS.VENDOR_BRANCH_INVITE.TITLE',
          subtitleKey: 'EMAIL_CENTER.EVENTS.VENDOR_BRANCH_INVITE.SUBTITLE',
          categoryKey: 'EMAIL_CENTER.CATEGORIES.VENDOR_NETWORK',
          cadenceLabelKey: 'EMAIL_CENTER.CADENCE.INSTANT',
          triggerNotesKey: 'EMAIL_CENTER.NOTES.VENDOR_BRANCH_INVITE',
          enabled: true,
          senderProfileId: 'vendor-network',
          audienceType: 'vendor_network',
          personaTargets: ['vendor_owner', 'vendor_branch_manager', 'vendor_branch_employee'],
          entityScope: this.getSeedScope('vendor_network'),
          branchScopeMode: 'specific_branch',
          recipientTargets: {
            to: ['branch_manager', 'vendor_owner'],
            cc: ['assigned_super_admin_manager'],
            bcc: []
          },
          route: {
            staticTo: [],
            staticCc: ['vendor.success@zadana.sa'],
            staticBcc: [],
            fallbackTo: ['vendors@zadana.sa'],
            fallbackCc: ['ops.leads@zadana.sa'],
            fallbackBcc: [],
            owner: 'Vendor Success Hub',
            escalation: 'Marketplace Operations'
          },
          template: {
            subject: {
              en: 'Branch access onboarding for {{branch_name}}',
              ar: 'تهيئة وصول الفرع {{branch_name}}'
            },
            body: {
              en: 'Branch team access has been prepared for {{branch_name}} under {{vendor_name}}. Review role scope and complete activation.',
              ar: 'تم تجهيز وصول فريق الفرع {{branch_name}} تحت {{vendor_name}}. يرجى مراجعة نطاق الدور واستكمال التفعيل.'
            },
            variables: ['{{branch_name}}', '{{vendor_name}}', '{{invite_link}}']
          }
        }),
        this.buildRule({
          id: 'branch-password-reset',
          titleKey: 'EMAIL_CENTER.EVENTS.BRANCH_PASSWORD_RESET.TITLE',
          subtitleKey: 'EMAIL_CENTER.EVENTS.BRANCH_PASSWORD_RESET.SUBTITLE',
          categoryKey: 'EMAIL_CENTER.CATEGORIES.VENDOR_NETWORK',
          cadenceLabelKey: 'EMAIL_CENTER.CADENCE.INSTANT',
          triggerNotesKey: 'EMAIL_CENTER.NOTES.BRANCH_PASSWORD_RESET',
          enabled: true,
          senderProfileId: 'vendor-network',
          audienceType: 'vendor_network',
          personaTargets: ['vendor_branch_manager', 'vendor_branch_employee'],
          entityScope: this.getSeedScope('vendor_network'),
          branchScopeMode: 'specific_branch',
          recipientTargets: {
            to: ['branch_manager', 'branch_staff'],
            cc: ['vendor_company_manager'],
            bcc: []
          },
          route: {
            staticTo: [],
            staticCc: [],
            staticBcc: [],
            fallbackTo: ['vendor.helpdesk@zadana.sa'],
            fallbackCc: ['security.audit@zadana.sa'],
            fallbackBcc: [],
            owner: 'Vendor Identity Support',
            escalation: 'Vendor Security Desk'
          },
          template: {
            subject: {
              en: 'Reset requested for {{branch_name}} credentials',
              ar: 'تم طلب إعادة تعيين بيانات فرع {{branch_name}}'
            },
            body: {
              en: 'A secure password reset was requested for the branch account. Confirm context before issuing a new credential.',
              ar: 'تم طلب إعادة تعيين آمن لبيانات الفرع. يرجى تأكيد السياق قبل إصدار اعتماد جديد.'
            },
            variables: ['{{branch_name}}', '{{reset_link}}', '{{requested_at}}']
          }
        }),
        this.buildRule({
          id: 'vendor-finance-digest',
          titleKey: 'EMAIL_CENTER.EVENTS.VENDOR_FINANCE_DIGEST.TITLE',
          subtitleKey: 'EMAIL_CENTER.EVENTS.VENDOR_FINANCE_DIGEST.SUBTITLE',
          categoryKey: 'EMAIL_CENTER.CATEGORIES.FINANCE',
          cadenceLabelKey: 'EMAIL_CENTER.CADENCE.DAILY',
          triggerNotesKey: 'EMAIL_CENTER.NOTES.VENDOR_FINANCE_DIGEST',
          enabled: true,
          senderProfileId: 'finance-digest',
          audienceType: 'vendor_network',
          personaTargets: ['vendor_owner', 'vendor_finance', 'vendor_company_manager'],
          entityScope: this.getSeedScope('vendor_network'),
          recipientTargets: {
            to: ['vendor_finance'],
            cc: ['vendor_owner', 'vendor_company_manager'],
            bcc: ['assigned_super_admin_manager']
          },
          route: {
            staticTo: ['settlements@zadana.sa'],
            staticCc: [],
            staticBcc: [],
            fallbackTo: ['finance@zadana.sa'],
            fallbackCc: ['finance.control@zadana.sa'],
            fallbackBcc: [],
            owner: 'Finance Operations',
            escalation: 'CFO Office'
          },
          template: {
            subject: {
              en: 'Vendor finance digest for {{business_date}}',
              ar: 'ملخص مالية التاجر ليوم {{business_date}}'
            },
            body: {
              en: 'The daily digest includes payout exposure, blocked settlements, and branch-level variance for {{vendor_name}}.',
              ar: 'يتضمن الملخص اليومي التعرضات المالية والتسويات المعلقة والانحرافات على مستوى الفروع الخاصة بـ {{vendor_name}}.'
            },
            variables: ['{{business_date}}', '{{vendor_name}}', '{{digest_link}}']
          }
        }),
        this.buildRule({
          id: 'driver-verification-update',
          titleKey: 'EMAIL_CENTER.EVENTS.DRIVER_VERIFICATION_UPDATE.TITLE',
          subtitleKey: 'EMAIL_CENTER.EVENTS.DRIVER_VERIFICATION_UPDATE.SUBTITLE',
          categoryKey: 'EMAIL_CENTER.CATEGORIES.DRIVER_NETWORK',
          cadenceLabelKey: 'EMAIL_CENTER.CADENCE.INSTANT',
          triggerNotesKey: 'EMAIL_CENTER.NOTES.DRIVER_VERIFICATION_UPDATE',
          enabled: true,
          senderProfileId: 'ops-primary',
          audienceType: 'drivers',
          personaTargets: ['driver'],
          entityScope: this.getSeedScope('drivers'),
          recipientTargets: {
            to: ['driver_account'],
            cc: ['assigned_super_admin_manager'],
            bcc: []
          },
          route: {
            staticTo: ['driver.ops@zadana.sa'],
            staticCc: [],
            staticBcc: [],
            fallbackTo: ['drivers@zadana.sa'],
            fallbackCc: ['compliance@zadana.sa'],
            fallbackBcc: [],
            owner: 'Driver Operations',
            escalation: 'Compliance Desk'
          },
          template: {
            subject: {
              en: 'Driver verification update for {{full_name}}',
              ar: 'تحديث تحقق السائق {{full_name}}'
            },
            body: {
              en: 'Your verification profile changed to {{verification_status}}. Review the next step and upload missing documents if needed.',
              ar: 'تم تحديث ملف التحقق إلى {{verification_status}}. راجع الخطوة التالية وارفع المستندات الناقصة إذا لزم الأمر.'
            },
            variables: ['{{full_name}}', '{{verification_status}}', '{{verification_link}}']
          }
        }),
        this.buildRule({
          id: 'driver-payout-alert',
          titleKey: 'EMAIL_CENTER.EVENTS.DRIVER_PAYOUT_ALERT.TITLE',
          subtitleKey: 'EMAIL_CENTER.EVENTS.DRIVER_PAYOUT_ALERT.SUBTITLE',
          categoryKey: 'EMAIL_CENTER.CATEGORIES.DRIVER_NETWORK',
          cadenceLabelKey: 'EMAIL_CENTER.CADENCE.DAILY',
          triggerNotesKey: 'EMAIL_CENTER.NOTES.DRIVER_PAYOUT_ALERT',
          enabled: true,
          senderProfileId: 'finance-digest',
          audienceType: 'drivers',
          personaTargets: ['driver'],
          entityScope: this.getSeedScope('drivers'),
          recipientTargets: {
            to: ['driver_account'],
            cc: [],
            bcc: ['assigned_super_admin_manager']
          },
          route: {
            staticTo: ['driver.finance@zadana.sa'],
            staticCc: [],
            staticBcc: [],
            fallbackTo: ['finance@zadana.sa'],
            fallbackCc: ['driver.ops@zadana.sa'],
            fallbackBcc: [],
            owner: 'Driver Finance Control',
            escalation: 'Finance Operations'
          },
          template: {
            subject: {
              en: 'Payout and COD review for {{business_date}}',
              ar: 'مراجعة المدفوعات والتحصيل ليوم {{business_date}}'
            },
            body: {
              en: 'This digest covers payout readiness, COD variances, and any blocked finance actions for the assigned driver account.',
              ar: 'يغطي هذا الملخص جاهزية المدفوعات وفروقات التحصيل وأي قيود مالية على حساب السائق.'
            },
            variables: ['{{business_date}}', '{{available_balance}}', '{{payout_date}}']
          }
        }),
        this.buildRule({
          id: 'customer-support-escalation',
          titleKey: 'EMAIL_CENTER.EVENTS.CUSTOMER_SUPPORT_ESCALATION.TITLE',
          subtitleKey: 'EMAIL_CENTER.EVENTS.CUSTOMER_SUPPORT_ESCALATION.SUBTITLE',
          categoryKey: 'EMAIL_CENTER.CATEGORIES.CUSTOMER_CARE',
          cadenceLabelKey: 'EMAIL_CENTER.CADENCE.INSTANT',
          triggerNotesKey: 'EMAIL_CENTER.NOTES.CUSTOMER_SUPPORT_ESCALATION',
          enabled: true,
          senderProfileId: 'ops-primary',
          audienceType: 'customers',
          personaTargets: ['customer'],
          entityScope: this.getSeedScope('customers'),
          recipientTargets: {
            to: ['customer_account'],
            cc: ['assigned_super_admin_manager'],
            bcc: []
          },
          route: {
            staticTo: ['support@zadana.sa'],
            staticCc: [],
            staticBcc: [],
            fallbackTo: ['customer.health@zadana.sa'],
            fallbackCc: ['ops.leads@zadana.sa'],
            fallbackBcc: [],
            owner: 'Customer Care Desk',
            escalation: 'Retention Operations'
          },
          template: {
            subject: {
              en: 'Support escalation opened for {{full_name}}',
              ar: 'تم فتح تصعيد دعم للعميل {{full_name}}'
            },
            body: {
              en: 'A support escalation was created for {{full_name}}. Review open cases and next follow-up commitments.',
              ar: 'تم إنشاء تصعيد دعم للعميل {{full_name}}. يرجى مراجعة الحالات المفتوحة وخطوات المتابعة القادمة.'
            },
            variables: ['{{full_name}}', '{{case_id}}', '{{support_link}}']
          }
        }),
        this.buildRule({
          id: 'customer-account-recovery',
          titleKey: 'EMAIL_CENTER.EVENTS.CUSTOMER_ACCOUNT_RECOVERY.TITLE',
          subtitleKey: 'EMAIL_CENTER.EVENTS.CUSTOMER_ACCOUNT_RECOVERY.SUBTITLE',
          categoryKey: 'EMAIL_CENTER.CATEGORIES.CUSTOMER_CARE',
          cadenceLabelKey: 'EMAIL_CENTER.CADENCE.INSTANT',
          triggerNotesKey: 'EMAIL_CENTER.NOTES.CUSTOMER_ACCOUNT_RECOVERY',
          enabled: false,
          senderProfileId: 'ops-primary',
          audienceType: 'customers',
          personaTargets: ['customer'],
          entityScope: this.getSeedScope('customers'),
          recipientTargets: {
            to: ['customer_account'],
            cc: [],
            bcc: ['assigned_super_admin_manager']
          },
          route: {
            staticTo: [],
            staticCc: ['support@zadana.sa'],
            staticBcc: [],
            fallbackTo: ['customer.recovery@zadana.sa'],
            fallbackCc: ['risk@zadana.sa'],
            fallbackBcc: [],
            owner: 'Account Recovery Desk',
            escalation: 'Customer Risk Ops'
          },
          template: {
            subject: {
              en: 'Recover your Zadana account access',
              ar: 'استعد وصولك إلى حساب زدانا'
            },
            body: {
              en: 'Use the secure recovery link to restore account access and review the latest security checks.',
              ar: 'استخدم رابط الاستعادة الآمن لاسترجاع الوصول إلى حسابك ومراجعة آخر الفحوصات الأمنية.'
            },
            variables: ['{{full_name}}', '{{reset_link}}', '{{expiry_date}}']
          }
        })
      ]
    };
  }

  private buildRule(config: Omit<EmailWorkflowRule, 'panelScope' | 'branchScopeMode'> & {
    branchScopeMode?: EmailBranchScopeMode;
  }): EmailWorkflowRule {
    return this.normalizeRule({
      ...config,
      panelScope: PANEL_BY_AUDIENCE[config.audienceType],
      branchScopeMode: config.branchScopeMode ?? 'all_branches'
    });
  }

  private getSeedScope(audienceType: DirectoryAudienceType): EmailEntityScope {
    const identities = this.adminUsersService.getUsers();

    if (audienceType === 'vendor_network') {
      const vendorIdentity = identities.find((identity) => identity.audienceType === 'vendor_network');
      return {
        entityId: vendorIdentity?.entityId ?? null,
        vendorId: vendorIdentity?.assignment.vendorId ?? null,
        branchId: vendorIdentity?.assignment.branchId ?? null
      };
    }

    const identity = identities.find((entry) => entry.audienceType === audienceType);
    return {
      entityId: identity?.entityId ?? null,
      vendorId: null,
      branchId: null
    };
  }

  private getDefaultPersonaTargets(audienceType: DirectoryAudienceType): DirectoryPersonaType[] {
    const identities = this.adminUsersService.getUsers()
      .filter((identity) => identity.audienceType === audienceType)
      .map((identity) => identity.personaType);

    return this.unique(identities);
  }

  private unique<T>(values: T[]): T[] {
    return [...new Set(values.map((value) => typeof value === 'string' ? value.trim() : value) as T[])].filter(Boolean);
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
