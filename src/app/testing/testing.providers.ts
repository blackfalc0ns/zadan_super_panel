import { EnvironmentProviders, Provider } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import {
  provideTranslateService,
  TranslateNoOpLoader,
  TranslateLoader
} from '@ngx-translate/core';
import { of } from 'rxjs';

interface ActivatedRouteMockOptions {
  params?: Record<string, string>;
  queryParams?: Record<string, string>;
  data?: Record<string, unknown>;
}

export function createActivatedRouteMock(
  options: ActivatedRouteMockOptions = {}
): Partial<ActivatedRoute> {
  const params = options.params ?? {};
  const queryParams = options.queryParams ?? {};
  const data = options.data ?? {};

  return {
    snapshot: {
      params,
      queryParams,
      data,
      paramMap: convertToParamMap(params),
      queryParamMap: convertToParamMap(queryParams)
    } as ActivatedRoute['snapshot'],
    params: of(params),
    queryParams: of(queryParams),
    data: of(data),
    paramMap: of(convertToParamMap(params)),
    queryParamMap: of(convertToParamMap(queryParams))
  };
}

export function provideAppTesting(
  routeOptions: ActivatedRouteMockOptions = {}
): Array<Provider | EnvironmentProviders> {
  return [
    provideRouter([]),
    provideHttpClient(),
    provideHttpClientTesting(),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateNoOpLoader
      }
    }),
    {
      provide: ActivatedRoute,
      useValue: createActivatedRouteMock(routeOptions)
    }
  ];
}
