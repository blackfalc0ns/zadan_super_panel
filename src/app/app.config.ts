import { DATE_PIPE_DEFAULT_OPTIONS, IMAGE_CONFIG } from '@angular/common';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { provideAuthBootstrap } from './core/initializers/auth.initializer';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export function deepMerge(target: any, source: any): any {
  if (!source) return target;
  if (!target) return source;

  if (typeof target !== 'object' || target === null || Array.isArray(target) ||
      typeof source !== 'object' || source === null || Array.isArray(source)) {
    return source;
  }

  const output = { ...target };
  
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (key in target && typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

export class MultiTranslateHttpLoader implements TranslateLoader {
  private readonly files = [
    'common',
    'dashboard',
    'vendors',
    'catalog',
    'orders',
    'users',
    'marketing',
    'email-center'
  ];

  constructor(private readonly http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    const version = encodeURIComponent(environment.i18nVersion || '1');
    const requests = this.files.map((file) =>
      this.http.get(`assets/i18n/${lang}/${file}.json?v=${version}`).pipe(
        catchError((err) => {
          console.error(`Failed to load translation file: ${lang}/${file}.json`, err);
          return of({});
        })
      )
    );

    return forkJoin(requests).pipe(
      map((jsonArray) => {
        return jsonArray.reduce((acc, current) => deepMerge(acc, current), {});
      })
    );
  }
}

export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAuthBootstrap(),
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { timezone: '+0300' }
    },
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true
      }
    },
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ]
};
