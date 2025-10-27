import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

/**
 * Configuration globale de l'application Angular
 *
 * Cette configuration fournit:
 * - Le router avec toutes les routes définies dans app.routes.ts
 * - Le client HTTP avec le fetch API pour les requêtes HTTP
 *
 * Le fetch API est utilisé pour les appels HTTP au lieu de XMLHttpRequest,
 * ce qui offre de meilleures performances et une API plus moderne.
 *
 * Note: Cette configuration est utilisée dans main.ts pour initialiser l'application
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Configuration du routeur avec toutes les routes
    provideRouter(routes),

    // Configuration du client HTTP avec le fetch API
    // Le fetch API est plus moderne et performant que XMLHttpRequest
    provideHttpClient(withFetch())
  ]
};
