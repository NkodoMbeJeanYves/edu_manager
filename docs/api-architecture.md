# Contrat API — EDU Platform v1

> Blueprint architectural API-first pour l'application Angular `angular-edu-app`.
> Compatible MSW, Prism, json-server. Aligné avec la RBAC V1 (12 rôles, cloisonnement tenant).
>
> Document complémentaire au catalogue détaillé [`docs/api-contract/`](./api-contract/README.md).
> Ce blueprint sert de **source de discussion** avec le backend et de spécification haut niveau ;
> le détail endpoint-par-endpoint est dans `api-contract/`.

---

## 1. Vue d'ensemble

| Champ | Valeur |
|---|---|
| Nom | `edu-platform-api` |
| Version | `1.0.0` (semver) |
| Base URL | `https://api.edu.example.com/v1` |
| Mock URL | `http://localhost:4010/v1` |
| Format | `application/json; charset=utf-8` |
| Style | REST, ressources nommées au pluriel, kebab-case dans les paths |
| Auth | Bearer JWT (HS256 en mock, RS256 en prod) |
| Multi-tenant | Oui — header `X-Tenant-Id` obligatoire |
| Idempotence | `Idempotency-Key` sur tous les `POST` mutants |
| i18n | `Accept-Language: fr-FR` par défaut, `en-US` supporté |

**Principes**
- Stateless ; tout contexte (tenant, user) dérivé du JWT + headers.
- Réponses normalisées : `data`, `meta`, `errors`.
- Versioning par préfixe d'URL (`/v1`, `/v2`). Pas de versioning par header.
- Aucune route ne fuit de données hors `tenantId` du JWT — enforced backend.
- Conventions de nommage : champs JSON en `camelCase`, IDs en `UUID v4`.

---

## 2. Modèles métiers (DTO)

> Tous les modèles incluent implicitement `id: uuid`, `tenantId: uuid`, `createdAt: ISO-8601`, `updatedAt: ISO-8601`. Non répétés ci-dessous.

### 2.1 `Tenant`
```yaml
Tenant:
  type: object
  required: [id, code, name, type, status]
  properties:
    id:        { type: string, format: uuid }
    code:      { type: string, pattern: "^[A-Z0-9_-]{3,16}$", example: "LYC-VICTOR-HUGO" }
    name:      { type: string, maxLength: 120, example: "Lycée Victor Hugo" }
    type:      { type: string, enum: [school, university, training_center] }
    status:    { type: string, enum: [active, suspended, archived] }
    locale:    { type: string, example: "fr-FR" }
    timezone:  { type: string, example: "Europe/Paris" }
    academicYear: { type: string, pattern: "^[0-9]{4}-[0-9]{4}$", example: "2025-2026" }
    settings:
      type: object
      properties:
        gradingScale: { type: number, example: 20 }
        weekStartsOn: { type: integer, enum: [0,1], example: 1 }
```

### 2.2 `User`
```yaml
User:
  type: object
  required: [id, email, firstName, lastName, role, status]
  properties:
    email:     { type: string, format: email, example: "directeur@test.com" }
    firstName: { type: string, maxLength: 60 }
    lastName:  { type: string, maxLength: 60 }
    role:
      type: string
      enum:
        - super_admin
        - directeur
        - directeur_pedagogique
        - responsable_administratif
        - enseignant
        - surveillant
        - secretaire
        - comptable
        - bibliothecaire
        - apprenant
        - parent
        - externe
    authorityLevel: { type: string, enum: [institutionnel, pedagogique, support, externe], readOnly: true }
    filiereIds:    { type: array, items: { type: string, format: uuid }, description: "Optionnel — non enforced V1" }
    classeIds:     { type: array, items: { type: string, format: uuid } }
    avatarUrl:     { type: string, format: uri, nullable: true }
    status:        { type: string, enum: [active, invited, suspended, archived] }
    lastLoginAt:   { type: string, format: date-time, nullable: true }
```

### 2.3 `Student` (extends User profile)
```yaml
Student:
  type: object
  required: [id, userId, matricule, classeId, status]
  properties:
    userId:      { type: string, format: uuid }
    matricule:   { type: string, pattern: "^[A-Z0-9-]{6,16}$", example: "STU-2026-00128" }
    classeId:    { type: string, format: uuid }
    filiereId:   { type: string, format: uuid }
    dateOfBirth: { type: string, format: date }
    gender:      { type: string, enum: [M, F, X] }
    parentIds:   { type: array, items: { type: string, format: uuid }, maxItems: 4 }
    enrolledAt:  { type: string, format: date }
    status:      { type: string, enum: [enrolled, on_leave, graduated, expelled, transferred] }
    contact:
      $ref: "#/components/schemas/Contact"
```

### 2.4 `Teacher`
```yaml
Teacher:
  type: object
  required: [id, userId, matricule, status]
  properties:
    userId:     { type: string, format: uuid }
    matricule:  { type: string, example: "ENS-2026-0042" }
    subjects:   { type: array, items: { type: string, format: uuid }, minItems: 1 }
    classeIds:  { type: array, items: { type: string, format: uuid } }
    hireDate:   { type: string, format: date }
    contractType: { type: string, enum: [permanent, fixed_term, vacataire] }
    weeklyHours:  { type: integer, minimum: 0, maximum: 40 }
    status:     { type: string, enum: [active, on_leave, retired, terminated] }
```

### 2.5 `CourseSession`
```yaml
CourseSession:
  type: object
  required: [id, subjectId, teacherId, classeId, startAt, endAt, status]
  properties:
    subjectId:  { type: string, format: uuid }
    teacherId:  { type: string, format: uuid }
    classeId:   { type: string, format: uuid }
    roomId:     { type: string, format: uuid, nullable: true }
    startAt:    { type: string, format: date-time }
    endAt:      { type: string, format: date-time }
    type:       { type: string, enum: [lecture, td, tp, exam, makeup] }
    status:     { type: string, enum: [scheduled, in_progress, done, cancelled] }
    attendance:
      type: object
      properties:
        recorded: { type: boolean }
        presentCount: { type: integer }
        absentCount:  { type: integer }
    notes: { type: string, maxLength: 2000, nullable: true }
```

### 2.6 `Grade`
```yaml
Grade:
  type: object
  required: [id, studentId, subjectId, value, scale, type, period]
  properties:
    studentId: { type: string, format: uuid }
    subjectId: { type: string, format: uuid }
    teacherId: { type: string, format: uuid }
    sessionId: { type: string, format: uuid, nullable: true }
    value:     { type: number, format: float, minimum: 0, example: 14.5 }
    scale:     { type: number, format: float, example: 20 }
    coefficient: { type: number, default: 1 }
    type:      { type: string, enum: [homework, quiz, midterm, final, project, oral] }
    period:    { type: string, enum: [T1, T2, T3, S1, S2], example: "T2" }
    comment:   { type: string, maxLength: 500, nullable: true }
    validatedBy: { type: string, format: uuid, nullable: true }
    publishedAt: { type: string, format: date-time, nullable: true }
```

### 2.7 `Timetable` / `TimetableEntry`
```yaml
Timetable:
  type: object
  required: [id, ownerType, ownerId, weekOf]
  properties:
    ownerType: { type: string, enum: [classe, teacher, student, room] }
    ownerId:   { type: string, format: uuid }
    weekOf:    { type: string, format: date, description: "Lundi de la semaine ISO" }
    entries:   { type: array, items: { $ref: "#/components/schemas/TimetableEntry" } }

TimetableEntry:
  type: object
  required: [dayOfWeek, startTime, endTime, sessionId]
  properties:
    dayOfWeek: { type: integer, minimum: 1, maximum: 7 }
    startTime: { type: string, pattern: "^[0-2][0-9]:[0-5][0-9]$", example: "08:00" }
    endTime:   { type: string, example: "09:30" }
    sessionId: { type: string, format: uuid }
    color:     { type: string, example: "#4F46E5" }
```

### 2.8 Schémas annexes
```yaml
Contact:
  type: object
  properties:
    phone: { type: string, pattern: "^\\+?[0-9 .-]{6,20}$" }
    email: { type: string, format: email }
    address:
      type: object
      properties:
        line1: { type: string }
        city:  { type: string }
        zip:   { type: string }
        country: { type: string, example: "FR" }

Attendance:
  type: object
  required: [id, sessionId, studentId, status]
  properties:
    sessionId: { type: string, format: uuid }
    studentId: { type: string, format: uuid }
    status:    { type: string, enum: [present, absent, late, excused] }
    minutesLate: { type: integer, nullable: true }
    justification: { type: string, nullable: true }
```

---

## 3. Multi-tenant

| Élément | Convention |
|---|---|
| Transport | Header HTTP **`X-Tenant-Id: {uuid}`** obligatoire sur toute requête sauf `/auth/*` et `/health`. |
| JWT | Contient `tenantId` ; doit matcher `X-Tenant-Id` sinon **403 `TENANT_MISMATCH`**. |
| Réponse | Tous les DTOs exposent `tenantId` en lecture seule (audit). |
| Cloisonnement | Aucune ressource d'un tenant n'est lisible/écrivable depuis un autre tenant — enforced backend, jamais côté client. |
| Super-admin | Peut passer `X-Tenant-Id` arbitraire ; les autres rôles : ignoré si différent du JWT. |
| Sélecteur UI | Liste accessible via `GET /me/tenants` ; switch via `POST /auth/switch-tenant`. |

---

## 4. Endpoints REST

### 4.1 Conventions par ressource

| Action | Verb | Path | Code succès |
|---|---|---|---|
| Liste | GET | `/{resource}` | 200 |
| Détail | GET | `/{resource}/{id}` | 200 |
| Création | POST | `/{resource}` | 201 + `Location` |
| Mise à jour totale | PUT | `/{resource}/{id}` | 200 |
| Mise à jour partielle | PATCH | `/{resource}/{id}` | 200 |
| Suppression | DELETE | `/{resource}/{id}` | 204 |

### 4.2 Domaine `academic`

| Méthode | Path | Description | Rôles |
|---|---|---|---|
| GET | `/students` | Liste paginée des apprenants | directeur, dp, secretaire, enseignant (read) |
| GET | `/students/{id}` | Détail apprenant | + parent (si lié), apprenant (self) |
| POST | `/students` | Inscription | directeur, secretaire |
| PUT | `/students/{id}` | Modifier dossier | directeur, secretaire |
| DELETE | `/students/{id}` | Archiver (soft) | directeur |
| GET | `/students/{id}/grades` | Bulletin d'un apprenant | self, parent, enseignant, dp |
| GET | `/students/{id}/attendance` | Historique absences | idem |
| GET | `/teachers` | Liste enseignants | directeur, dp, ra |
| POST | `/teachers` | Embaucher enseignant | directeur, ra |
| GET | `/teachers/{id}/timetable` | EDT enseignant | self, dp, directeur |
| GET | `/teachers/{id}/sessions` | Sessions assignées | self, dp |
| GET | `/classes` | Liste classes | tout staff |
| GET | `/classes/{id}/students` | Roster classe | enseignant assigné, dp, directeur |
| GET | `/classes/{id}/timetable` | EDT classe | tout membre de la classe |
| GET | `/subjects` | Catalogue matières | tout staff |
| GET | `/sessions` | Sessions de cours (filtrables) | rôle-dépendant |
| GET | `/sessions/{id}` | Détail session | rôle-dépendant |
| POST | `/sessions` | Planifier session | dp, directeur |
| PATCH | `/sessions/{id}` | Modifier (room, horaire, status) | dp, enseignant (self) |
| POST | `/sessions/{id}/attendance` | Saisir présences | enseignant (self), surveillant |
| POST | `/sessions/{id}/cancel` | Annuler avec motif | dp, enseignant (self) |
| GET | `/grades` | Liste filtrable (classe, période, matière) | enseignant, dp |
| POST | `/grades` | Saisir note | enseignant |
| POST | `/grades/batch` | Saisie en lot | enseignant |
| PATCH | `/grades/{id}` | Modifier (tant que non publié) | enseignant (auteur) |
| POST | `/grades/{id}/validate` | Valider la note | dp |
| POST | `/grades/publish` | Publier en masse (par période/classe) | dp, directeur |

### 4.3 Domaine `admin`

| Méthode | Path | Description | Rôles |
|---|---|---|---|
| GET | `/users` | Liste users tenant | directeur, ra, super_admin |
| POST | `/users` | Créer + inviter | directeur, ra |
| PATCH | `/users/{id}/role` | Changer rôle | directeur, super_admin |
| POST | `/users/{id}/suspend` | Suspendre | directeur, ra |
| GET | `/tenants` | Liste tenants (super_admin) | super_admin |
| POST | `/tenants` | Provisionner | super_admin |
| GET | `/tenants/{id}/settings` | Config tenant | directeur, super_admin |
| PUT | `/tenants/{id}/settings` | Maj config | directeur, super_admin |
| GET | `/audit-logs` | Journal audit | directeur, super_admin |

### 4.4 Domaine `finance`

| Méthode | Path | Description | Rôles |
|---|---|---|---|
| GET | `/invoices` | Liste factures | comptable, ra, directeur |
| GET | `/invoices/{id}` | Détail | + apprenant/parent concerné |
| POST | `/invoices` | Émettre | comptable |
| POST | `/invoices/{id}/payments` | Enregistrer paiement | comptable |
| GET | `/students/{id}/balance` | Solde apprenant | self, parent, comptable |
| GET | `/payroll/periods` | Périodes de paie | comptable, ra |
| POST | `/payroll/runs` | Lancer un run | comptable |

### 4.5 Domaine `communication`

| Méthode | Path | Description |
|---|---|---|
| GET | `/announcements` | Liste annonces |
| POST | `/announcements` | Publier (rôle-dépendant) |
| GET | `/messages` | Boîte de réception |
| POST | `/messages` | Envoyer |
| GET | `/notifications` | Notifications utilisateur |
| PATCH | `/notifications/{id}/read` | Marquer lue |

---

## 5. Pagination, filtrage, tri

**Convention globale** appliquée à toute liste.

### 5.1 Query params standards
| Param | Type | Défaut | Notes |
|---|---|---|---|
| `page` | int ≥ 1 | 1 | |
| `size` | int [1..100] | 20 | |
| `sort` | string | `-createdAt` | `field` asc, `-field` desc, multi : `lastName,-createdAt` |
| `q` | string | — | Recherche full-text fuzzy |
| `fields` | string | — | Sparse fieldset : `id,firstName,lastName` |
| `include` | string | — | Relations à embarquer : `classe,parents` |
| `filter[field]` | string | — | Filtre exact : `filter[status]=active` |
| `filter[field][op]` | string | — | Opérateurs : `gte,lte,gt,lt,in,nin,like` ex. `filter[createdAt][gte]=2026-01-01` |

### 5.2 Enveloppe de réponse paginée
```json
{
  "data": [ /* items */ ],
  "meta": {
    "page": 1,
    "size": 20,
    "totalItems": 138,
    "totalPages": 7,
    "sort": "-createdAt"
  },
  "links": {
    "self":  "/v1/students?page=1&size=20",
    "next":  "/v1/students?page=2&size=20",
    "prev":  null,
    "first": "/v1/students?page=1&size=20",
    "last":  "/v1/students?page=7&size=20"
  }
}
```

---

## 6. Modèle d'erreur standardisé

**RFC 7807** simplifié — toute erreur retourne :

```json
{
  "errors": [
    {
      "code": "VALIDATION_FAILED",
      "message": "Le champ matricule est déjà utilisé.",
      "field": "matricule",
      "details": { "conflictWith": "STU-2026-00128" }
    }
  ],
  "traceId": "01J9X5Z7K3Q8N2R6F0H4V1B7C2",
  "timestamp": "2026-05-27T10:30:00.000Z",
  "path": "/v1/students"
}
```

### Catalogue codes
| HTTP | Code | Sens |
|---|---|---|
| 400 | `VALIDATION_FAILED` | Payload invalide |
| 400 | `INVALID_QUERY` | Query mal formé |
| 401 | `UNAUTHENTICATED` | JWT manquant/invalide |
| 401 | `TOKEN_EXPIRED` | JWT expiré |
| 403 | `FORBIDDEN` | RBAC refuse |
| 403 | `TENANT_MISMATCH` | Header / JWT incohérents |
| 404 | `NOT_FOUND` | Ressource inexistante (dans le tenant) |
| 409 | `CONFLICT` | Doublon, version mismatch |
| 409 | `STATE_INVALID` | Transition état interdite |
| 422 | `BUSINESS_RULE_VIOLATION` | Règle métier violée |
| 429 | `RATE_LIMITED` | Throttling |
| 500 | `INTERNAL_ERROR` | Exception non gérée |
| 503 | `SERVICE_UNAVAILABLE` | Maintenance |

---

## 7. Sécurité

### 7.1 Authentification
- `POST /auth/login` → `{ accessToken, refreshToken, expiresIn, user }`
- `POST /auth/refresh` → nouveau couple tokens
- `POST /auth/logout` → invalide refresh token
- `POST /auth/switch-tenant` → réémet un JWT pour un autre tenant accessible
- `GET /auth/me` → user courant + permissions effectives

### 7.2 Format JWT (mock HS256, secret `mock-secret`)
```json
{
  "sub": "user-uuid",
  "tenantId": "tenant-uuid",
  "role": "directeur",
  "authorityLevel": "institutionnel",
  "filiereIds": [],
  "classeIds": [],
  "iat": 1716800000,
  "exp": 1716803600
}
```

### 7.3 Mapping rôles → niveau d'autorité

| Niveau | Rôles |
|---|---|
| `institutionnel` | super_admin, directeur, directeur_pedagogique, responsable_administratif |
| `pedagogique` | enseignant |
| `support` | surveillant, secretaire, comptable, bibliothecaire |
| `externe` | apprenant, parent, externe |

### 7.4 Headers de sécurité
```
Authorization: Bearer <jwt>
X-Tenant-Id: <uuid>
X-Request-Id: <ulid>           (client → trace)
Idempotency-Key: <ulid>        (POST mutants)
```

---

## 8. Comportement mock (MSW / Prism)

### 8.1 Règles globales mock
- Latence simulée : **150ms à 600ms** (random uniforme).
- Taux d'erreur injecté optionnel via header `X-Mock-Fail-Rate: 0.1` (0 à 1).
- Forcer un cas via `X-Mock-Scenario: empty | error-500 | slow | unauthorized | rate-limit`.
- Persistance en mémoire (reset au reload). Option `X-Mock-Reset: 1` pour vider.

### 8.2 Exemples de réponses

**Liste pleine — `GET /students?page=1&size=2`**
```json
{
  "data": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "tenantId": "tnt-001",
      "userId": "u-001",
      "matricule": "STU-2026-00128",
      "classeId": "cls-3A",
      "filiereId": "fil-S",
      "dateOfBirth": "2008-09-12",
      "gender": "F",
      "enrolledAt": "2025-09-02",
      "status": "enrolled",
      "createdAt": "2025-09-02T08:14:00Z",
      "updatedAt": "2026-04-11T15:02:00Z"
    },
    {
      "id": "22222222-2222-4222-8222-222222222222",
      "tenantId": "tnt-001",
      "userId": "u-002",
      "matricule": "STU-2026-00129",
      "classeId": "cls-3A",
      "filiereId": "fil-S",
      "dateOfBirth": "2008-03-04",
      "gender": "M",
      "enrolledAt": "2025-09-02",
      "status": "enrolled"
    }
  ],
  "meta": { "page": 1, "size": 2, "totalItems": 138, "totalPages": 69 },
  "links": { "self": "/v1/students?page=1&size=2", "next": "/v1/students?page=2&size=2" }
}
```

**Liste vide — `X-Mock-Scenario: empty`**
```json
{ "data": [], "meta": { "page": 1, "size": 20, "totalItems": 0, "totalPages": 0 } }
```

**Erreur validation — `POST /students` payload invalide**
```json
{
  "errors": [
    { "code": "VALIDATION_FAILED", "message": "Le matricule est requis.", "field": "matricule" },
    { "code": "VALIDATION_FAILED", "message": "Format de date invalide.", "field": "dateOfBirth" }
  ],
  "traceId": "01J9X5Z7K3Q8N2R6F0H4V1B7C2",
  "timestamp": "2026-05-27T10:30:00Z",
  "path": "/v1/students"
}
```

**Erreur RBAC — `DELETE /students/{id}` par un enseignant**
```json
{
  "errors": [{ "code": "FORBIDDEN", "message": "Rôle enseignant ne peut pas supprimer un apprenant." }],
  "traceId": "01J9X5Z9...", "timestamp": "2026-05-27T10:30:00Z", "path": "/v1/students/abc"
}
```

### 8.3 Comptes de login mock (déjà utilisés côté front)
| Email | Rôle | Niveau |
|---|---|---|
| `super_admin@test.com` | super_admin | institutionnel |
| `directeur@test.com` | directeur | institutionnel |
| `dp@test.com` | directeur_pedagogique | institutionnel |
| `enseignant@test.com` | enseignant | pedagogique |
| `secretaire@test.com` | secretaire | support |
| `comptable@test.com` | comptable | support |
| `apprenant@test.com` | apprenant | externe |
| `parent@test.com` | parent | externe |

Mot de passe mock : `password` (tout).

---

## 9. Cas métier spécifiques

### 9.1 Emploi du temps enseignant
```
GET /teachers/{id}/timetable?weekOf=2026-05-25
→ Timetable (ownerType=teacher, ownerId, entries[])

GET /teachers/{id}/timetable/range?from=2026-05-25&to=2026-06-08
→ [Timetable, Timetable] (2 semaines)
```
Règles :
- Seul l'enseignant lui-même, le DP et le directeur peuvent voir l'EDT complet.
- Les apprenants/parents voient uniquement l'EDT de leur classe via `/classes/{id}/timetable`.

### 9.2 Sessions de cours
```
POST /sessions
Body:
{
  "subjectId": "...", "teacherId": "...", "classeId": "...",
  "roomId": "...", "startAt": "2026-05-28T08:00:00Z",
  "endAt": "2026-05-28T09:30:00Z", "type": "lecture"
}
→ 201 Created, body = CourseSession (status=scheduled)

POST /sessions/{id}/cancel
Body: { "reason": "absence_enseignant" }
→ 200, status=cancelled, déclenche notification aux apprenants

POST /sessions/{id}/attendance
Body:
{
  "records": [
    { "studentId": "u-001", "status": "present" },
    { "studentId": "u-002", "status": "absent" },
    { "studentId": "u-003", "status": "late", "minutesLate": 12 }
  ]
}
→ 200, retourne sommaire { present, absent, late, excused }
```

Transitions de statut autorisées :
```
scheduled → in_progress → done
scheduled → cancelled
in_progress → done | cancelled
```
Toute autre transition → **409 `STATE_INVALID`**.

### 9.3 Gestion des notes
```
POST /grades/batch
Body:
{
  "classeId": "cls-3A", "subjectId": "subj-math",
  "period": "T2", "type": "quiz", "scale": 20, "coefficient": 1,
  "items": [
    { "studentId": "u-001", "value": 14.5 },
    { "studentId": "u-002", "value": 9, "comment": "Insuffisant" }
  ]
}
→ 201, body: { created: 2, failed: [] }

POST /grades/{id}/validate          (DP)
→ 200, validatedBy renseigné

POST /grades/publish
Body: { "classeId": "cls-3A", "period": "T2" }
→ 200, body: { publishedCount: 87 }, publishedAt renseigné
        → toute note publiée n'est plus PATCHable (409 STATE_INVALID)
```

### 9.4 Absences
```
GET /students/{id}/attendance?from=2026-04-01&to=2026-05-31
→ {
    data: [ Attendance, ... ],
    meta: { totals: { present: 142, absent: 6, late: 3, excused: 2 } }
  }

POST /attendances/{id}/justify
Body: { "justification": "Certificat médical du 2026-05-12", "documentId": "doc-987" }
→ 200, status passe à "excused"
```

### 9.5 Bulletin
```
GET /students/{id}/bulletin?period=T2
→ {
    studentId, period, classeId,
    subjects: [
      { subjectId, label, average, classAverage, rank, coefficient, grades: [...], appreciation }
    ],
    overall: { average: 13.42, classAverage: 12.10, rank: 7, totalStudents: 32 },
    publishedAt
  }
```

---

## 10. Contraintes non fonctionnelles

| Catégorie | Contrainte |
|---|---|
| Latence mock | p50 ≤ 200ms, p95 ≤ 600ms |
| Latence prod cible | p95 ≤ 400ms (lecture), ≤ 800ms (écriture) |
| Payload max | 2 MB JSON, 25 MB upload |
| Rate limit | 100 req/min/user (lecture), 30 req/min/user (écriture) |
| Encodage | UTF-8, timestamps ISO-8601 UTC, dates `YYYY-MM-DD` |
| Casse | JSON `camelCase`, paths `kebab-case`, codes erreur `SCREAMING_SNAKE` |
| Versioning | Préfixe `/v{N}` ; breaking changes uniquement entre versions majeures |
| Documentation | OpenAPI 3.1 publiée sur `/v1/openapi.json` |
| Observabilité | `X-Request-Id` propagé, `traceId` dans toute erreur |
| Compatibilité Angular | Génération clients via `openapi-generator-cli` (`typescript-angular`) |

---

## 11. Bonus — `openapi.yaml` simplifié

```yaml
openapi: 3.1.0
info:
  title: EDU Platform API
  version: 1.0.0
  description: API multi-tenant de gestion scolaire et universitaire.
servers:
  - url: https://api.edu.example.com/v1
  - url: http://localhost:4010/v1
security:
  - bearerAuth: []
components:
  securitySchemes:
    bearerAuth: { type: http, scheme: bearer, bearerFormat: JWT }
  parameters:
    TenantId:
      name: X-Tenant-Id
      in: header
      required: true
      schema: { type: string, format: uuid }
    Page:    { name: page,  in: query, schema: { type: integer, minimum: 1, default: 1 } }
    Size:    { name: size,  in: query, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
    Sort:    { name: sort,  in: query, schema: { type: string } }
    Search:  { name: q,     in: query, schema: { type: string } }
  schemas:
    Error:
      type: object
      properties:
        errors:
          type: array
          items:
            type: object
            properties:
              code:    { type: string }
              message: { type: string }
              field:   { type: string }
              details: { type: object }
        traceId:   { type: string }
        timestamp: { type: string, format: date-time }
        path:      { type: string }
    PageMeta:
      type: object
      properties:
        page: { type: integer }
        size: { type: integer }
        totalItems: { type: integer }
        totalPages: { type: integer }
    Student:
      type: object
      required: [id, matricule, classeId, status]
      properties:
        id:         { type: string, format: uuid }
        tenantId:   { type: string, format: uuid, readOnly: true }
        userId:     { type: string, format: uuid }
        matricule:  { type: string }
        classeId:   { type: string, format: uuid }
        filiereId:  { type: string, format: uuid }
        dateOfBirth:{ type: string, format: date }
        gender:     { type: string, enum: [M, F, X] }
        enrolledAt: { type: string, format: date }
        status:     { type: string, enum: [enrolled, on_leave, graduated, expelled, transferred] }
        createdAt:  { type: string, format: date-time, readOnly: true }
        updatedAt:  { type: string, format: date-time, readOnly: true }
    StudentList:
      type: object
      properties:
        data: { type: array, items: { $ref: "#/components/schemas/Student" } }
        meta: { $ref: "#/components/schemas/PageMeta" }
  responses:
    Unauthorized: { description: Auth required, content: { application/json: { schema: { $ref: "#/components/schemas/Error" } } } }
    Forbidden:    { description: RBAC denied, content: { application/json: { schema: { $ref: "#/components/schemas/Error" } } } }
    NotFound:     { description: Not found,   content: { application/json: { schema: { $ref: "#/components/schemas/Error" } } } }
    Validation:   { description: Validation,  content: { application/json: { schema: { $ref: "#/components/schemas/Error" } } } }

paths:
  /auth/login:
    post:
      summary: Login
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:    { type: string, format: email }
                password: { type: string, format: password }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  accessToken:  { type: string }
                  refreshToken: { type: string }
                  expiresIn:    { type: integer }
        "401": { $ref: "#/components/responses/Unauthorized" }

  /students:
    parameters:
      - $ref: "#/components/parameters/TenantId"
    get:
      summary: List students
      parameters:
        - $ref: "#/components/parameters/Page"
        - $ref: "#/components/parameters/Size"
        - $ref: "#/components/parameters/Sort"
        - $ref: "#/components/parameters/Search"
        - { name: "filter[status]", in: query, schema: { type: string } }
        - { name: "filter[classeId]", in: query, schema: { type: string, format: uuid } }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema: { $ref: "#/components/schemas/StudentList" }
        "401": { $ref: "#/components/responses/Unauthorized" }
        "403": { $ref: "#/components/responses/Forbidden" }
    post:
      summary: Create student
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/Student" }
      responses:
        "201":
          description: Created
          headers:
            Location: { schema: { type: string } }
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Student" }
        "400": { $ref: "#/components/responses/Validation" }
        "409":
          description: Conflict
          content: { application/json: { schema: { $ref: "#/components/schemas/Error" } } }

  /students/{id}:
    parameters:
      - $ref: "#/components/parameters/TenantId"
      - { name: id, in: path, required: true, schema: { type: string, format: uuid } }
    get:
      summary: Get student
      responses:
        "200":
          description: OK
          content: { application/json: { schema: { $ref: "#/components/schemas/Student" } } }
        "404": { $ref: "#/components/responses/NotFound" }
    put:
      summary: Replace student
      requestBody:
        required: true
        content: { application/json: { schema: { $ref: "#/components/schemas/Student" } } }
      responses:
        "200":
          description: OK
          content: { application/json: { schema: { $ref: "#/components/schemas/Student" } } }
    delete:
      summary: Archive student
      responses:
        "204": { description: No Content }
```

---

## 12. Annexe — exemples complets prêts pour MSW

**Login mock**
```http
POST /v1/auth/login
Content-Type: application/json

{ "email": "directeur@test.com", "password": "password" }
```
→
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1LWRpciIsInRlbmFudElkIjoidG50LTAwMSIsInJvbGUiOiJkaXJlY3RldXIiLCJleHAiOjE3MTY4MDM2MDB9.mock-sig",
  "refreshToken": "rt_mock_abc123",
  "expiresIn": 3600,
  "user": {
    "id": "u-dir", "tenantId": "tnt-001",
    "email": "directeur@test.com",
    "firstName": "Jean", "lastName": "Directeur",
    "role": "directeur", "authorityLevel": "institutionnel",
    "status": "active"
  }
}
```

**Création session**
```http
POST /v1/sessions
Authorization: Bearer <jwt>
X-Tenant-Id: tnt-001
Idempotency-Key: 01J9XABC...
Content-Type: application/json

{
  "subjectId": "subj-math",
  "teacherId": "u-ens-007",
  "classeId":  "cls-3A",
  "roomId":    "room-12",
  "startAt":   "2026-06-02T08:00:00Z",
  "endAt":     "2026-06-02T09:30:00Z",
  "type":      "lecture"
}
```
→ `201 Created`, `Location: /v1/sessions/sess-9001`
```json
{
  "id": "sess-9001", "tenantId": "tnt-001",
  "subjectId": "subj-math", "teacherId": "u-ens-007",
  "classeId": "cls-3A", "roomId": "room-12",
  "startAt": "2026-06-02T08:00:00Z", "endAt": "2026-06-02T09:30:00Z",
  "type": "lecture", "status": "scheduled",
  "attendance": { "recorded": false, "presentCount": 0, "absentCount": 0 },
  "createdAt": "2026-05-27T10:31:00Z", "updatedAt": "2026-05-27T10:31:00Z"
}
```

**Saisie de notes en lot**
```http
POST /v1/grades/batch
Authorization: Bearer <jwt>
X-Tenant-Id: tnt-001
```
```json
{
  "classeId": "cls-3A", "subjectId": "subj-math",
  "period": "T2", "type": "quiz", "scale": 20, "coefficient": 1,
  "items": [
    { "studentId": "u-001", "value": 14.5 },
    { "studentId": "u-002", "value": 9, "comment": "Travail incomplet" },
    { "studentId": "u-003", "value": 21 }
  ]
}
```
→ `207 Multi-Status`
```json
{
  "created": 2,
  "failed": [
    {
      "studentId": "u-003",
      "errors": [{ "code": "VALIDATION_FAILED", "field": "value", "message": "value must be ≤ scale (20)" }]
    }
  ]
}
```
