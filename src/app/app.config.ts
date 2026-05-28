import { IMAGE_CONFIG } from '@angular/common';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { provideAuthBootstrap } from './core/initializers/auth.initializer';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { routes } from './app.routes';

export class MultiTranslateHttpLoader implements TranslateLoader {
  private readonly files = [
    'common',
    'dashboard',
    'vendors',
    'catalog',
    'orders',
    'users',
    'marketing'
  ];

  constructor(private readonly http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    const requests = this.files.map((file) =>
      this.http.get(`assets/i18n/${lang}/${file}.json`).pipe(
        catchError((err) => {
          console.error(`Failed to load translation file: ${lang}/${file}.json`, err);
          return of({});
        })
      )
    );

    return forkJoin(requests).pipe(
      map((jsonArray) => {
        return jsonArray.reduce((acc, current) => ({ ...acc, ...current }), {});
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
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAuthBootstrap(),
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

