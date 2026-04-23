import { IMAGE_CONFIG } from '@angular/common';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { provideTranslateHttpLoader, TranslateHttpLoader } from '@ngx-translate/http-loader';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true
      }
    },
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateHttpLoader
      }
    }),
    provideTranslateHttpLoader({
      prefix: 'assets/i18n/',
      suffix: '.json'
    })
  ]
};
