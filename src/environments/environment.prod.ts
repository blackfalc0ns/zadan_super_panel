export const environment = {
    production: true,
    /** Bump when i18n JSON changes so clients skip stale browser/CDN caches. */
    i18nVersion: '20260728b',
    apiUrl: 'https://api.zadna0.com/api',
    realtimeEnabled: true,
    skipAuthForDevelopment: false,
    oneSignalAdminAppId: 'c32e801d-7fa0-46f3-bd0a-564af78dbddf',
    oneSignalAllowLocalhost: false,
    oneSignal: {
        enabled: true,
        appId: 'c32e801d-7fa0-46f3-bd0a-564af78dbddf',
        autoPrompt: true
    }
};
