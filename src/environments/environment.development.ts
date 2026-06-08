/**
 * Development environment — API réelle locale
 *
 * Pour utiliser cette configuration :
 *   ng serve --configuration development
 *
 * Les appels API iront vers /api (proxy.conf.json les forwardera vers localhost:8080)
 * Assurez-vous que le backend expose les endpoints à /api/tokens/*, /api/enseignants/*, etc.
 */
export const environment = {
  production: false,
  apiUrl: "http://localhost:5228/api/", // Relative à la racine du domaine ; proxy.conf.json capture /api/*
  useMocks: false,
};
