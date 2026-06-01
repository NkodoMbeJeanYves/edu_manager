# 🔧 Résolution Erreur CORS — Synthèse Complète

## ❌ Problème Identifié

```
Access to XMLHttpRequest at 'http://localhost:5228/api/tokens/login' from origin 
'http://localhost:4200' has been blocked by CORS policy
```

**Cause racine :** 
- Mode mocks actif (`useMocks: true` dans environment.ts)
- Mais les requêtes sortaient réellement au lieu d'être interceptées
- **Raison:** Les routes mock définissaient `/auth/login` mais le service appelait `/api/tokens/login`
- Pas de match → pas d'interception → requête réelle vers backend sans CORS headers

## ✅ Corrections Appliquées

### 1. **auth.mock.ts** — Aligner routes mock avec endpoints réels
```typescript
// Avant
{ method: 'POST', path: '/auth/login', handler: ... }

// Après
{ method: 'POST', path: '/api/tokens/login', handler: ... }
{ method: 'POST', path: '/api/tokens/refresh', handler: ... }
```

### 2. **environment.development.ts** — Corriger apiUrl pour éviter doublon `/api`
```typescript
// Avant
apiUrl: '/api/v1'  // + service: /api/tokens/login = /api/v1/api/tokens/login ❌

// Après
apiUrl: ''  // + service: /api/tokens/login = /api/tokens/login ✓
```

### 3. **environment.production.ts** — Aligner avec structure réelle d'endpoints
```typescript
// Avant
apiUrl: 'https://api.edu.example.com/v1'

// Après
apiUrl: 'https://api.edu.example.com'
// (Les endpoints sont /api/tokens/*, /api/enseignants/*, etc. — pas versionné)
```

## 📋 État Final — Trois Chemins de Déploiement

### 🧪 Mode Mocks (Défaut — `ng serve`)
```
useMocks: true
apiUrl: 'http://localhost:5228'
Requête: POST /api/tokens/login
Flux: → Mock Backend Interceptor → Route match /api/tokens/login ✓ → Réponse mock
```

### 🚀 Mode Développement API Réelle (`ng serve --configuration development`)
```
useMocks: false
apiUrl: '' (relatif à localhost:4200)
Requête: POST /api/tokens/login
Flux: → Proxy (proxy.conf.json) capture /api → http://localhost:8080/api/tokens/login ✓
```

### 🌐 Mode Production (`ng build --configuration production`)
```
useMocks: false
apiUrl: 'https://api.edu.example.com'
Requête: POST /api/tokens/login
Flux: → Vers https://api.edu.example.com/api/tokens/login ✓
```

## 🧪 Vérification

Après correction, l'application devrait :

1. **Login en mode mocks** (`ng serve`)
   ```
   Aucune erreur CORS ✓
   DevTools Network : POST /api/tokens/login retourne 200 avec réponse mock
   ```

2. **Login en mode dev** (backend local sur localhost:8080)
   ```
   ng serve --configuration development
   DevTools Network : POST /api/tokens/login → proxy → http://localhost:8080/api/tokens/login
   ```

## ⚠️ Configuration Requise

| Paramètre | Valeur Actuelle | À Adapter |
|---|---|---|
| Backend mock port | `localhost:5228` | — (utilisé par mocks) |
| Backend dev port | `localhost:8080` | ✓ Dans proxy.conf.json si différent |
| Backend prod URL | `https://api.edu.example.com` | ✓ Dans environment.production.ts |
| Proxy config | `/api → localhost:8080` | ✓ Si structure backend différente |

## 📊 Arborescence des Fichiers Modifiés

```
src/
  environments/
    environment.ts              ✓ (useMocks: true, apiUrl: http://localhost:5228)
    environment.development.ts  ✓ (useMocks: false, apiUrl: '')
    environment.production.ts   ✓ (useMocks: false, apiUrl: https://api.edu.example.com)
  app/
    core/
      services/
        auth.service.ts         ✓ (POST /api/tokens/login + /api/tokens/refresh)
      mocks/
        seeds/
          auth.mock.ts          ✓ (Routes: /api/tokens/login, /api/tokens/refresh)
  proxy.conf.json               ✓ (/api → localhost:8080)
  angular.json                  ✓ (fileReplacements + proxyConfig)
```

## 🎯 Prochaines Actions

1. ✅ Redémarrer le dev server : `ng serve`
2. ✅ Tester le login → pas d'erreur CORS
3. ✅ Vérifier Network tab → POST /api/tokens/login intercepté
4. ⚙️ Si backend local → démarrer sur localhost:8080
5. ⚙️ Si switch vers API réelle → `ng serve --configuration development`

---

**Dernière mise à jour :** 28 mai 2026
