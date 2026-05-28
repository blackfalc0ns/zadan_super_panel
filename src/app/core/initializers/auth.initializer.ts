import { APP_INITIALIZER, EnvironmentProviders, Provider } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Boots the auth service before the router activates so guards can read a
 * populated <code>currentUserValue</code> on first navigation:
 *
 *  1. Acquires a CSRF token (cookie + memory).
 *  2. If the dev bypass is active, exposes the synthetic admin user.
 *  3. Otherwise performs a silent refresh using the HttpOnly refresh-token
 *     cookie (no-op when the user is not yet logged in).
 *  4. Loads /me into the BehaviorSubject if the refresh succeeded.
 *
 * The initializer NEVER throws — failures fall through to the login route.
 */
export function provideAuthBootstrap(): Provider | EnvironmentProviders {
    return {
        provide: APP_INITIALIZER,
        multi: true,
        deps: [AuthService],
        useFactory: (authService: AuthService) => async () => {
            try {
                await authService.bootstrap();
            } catch (err) {
                // We deliberately swallow the error: the app must still start
                // so the user can land on /login.
                console.warn('[Zadana Admin] auth bootstrap failed', err);
            }
        }
    };
}
