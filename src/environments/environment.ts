/**
 * Development environment — Mode mock local (défaut)
 *
 * Pour utiliser cette configuration :
 *   ng serve   (par défaut)
 *
 * Les appels API sont interceptés par mockBackendInterceptor et redirigés
 * vers des réponses fictives stockées dans src/app/core/mocks/seeds/
 */
export const environment = {
  production: false,
  apiUrl: "http://localhost:5228/api",
  useMocks: false, // ✓ Active l'interception mock
};
