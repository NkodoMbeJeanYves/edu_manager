/**
 * Production environment
 *
 * Pour utiliser cette configuration :
 *   ng build --configuration production
 */
export const environment = {
  production: true,
  apiUrl: "http://localhost:5228/", // À remplacer par l'URL réelle du backend prod
  useMocks: false,
};
