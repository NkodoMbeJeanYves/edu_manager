# Module Communication

Notifications (email/SMS/push/interne), messagerie interne, annonces, modèles de messages.

**Source frontend** : [`communication-api.service.ts`](../../src/app/core/services/communication-api.service.ts) (`CommunicationApiService`)

**15 endpoints**.

---

## Schémas du module

### Enums

```ts
type CanalNotification = 'email' | 'sms' | 'push' | 'interne';

type TypeNotification =
  | 'note_publiee' | 'absence_enregistree' | 'bulletin_disponible'
  | 'convocation_examen' | 'paiement_recu' | 'alerte_absenteisme'
  | 'alerte_risque_echec' | 'modification_edt' | 'annonce' | 'autre';

type StatutNotification = 'en_attente' | 'envoyee' | 'lue' | 'echec';

type RoleDestinataire = 'apprenant' | 'parent' | 'enseignant' | 'direction' | 'scolarite';
```

### `Notification`

```ts
interface Notification {
  id: string;
  etablissementId: string;
  type: TypeNotification;
  canal: CanalNotification;
  titre: string;
  message: string;
  destinataireId: string;
  destinataireRole: RoleDestinataire;
  lien?: string;                      // lien profond vers la ressource (ex. /notes/eval/123)
  statut: StatutNotification;
  dateEnvoi?: string;
  dateLecture?: string;
  createdAt: string;
}
```

### `Message`

```ts
interface Message {
  id: string;
  etablissementId: string;
  expediteurId: string;
  expediteurNom?: string;
  expediteurRole: RoleDestinataire;
  destinataireId: string;
  destinataireNom?: string;
  destinataireRole: RoleDestinataire;
  sujet: string;
  contenu: string;
  lu: boolean;
  dateLecture?: string;
  pieceJointeUrl?: string;
  createdAt: string;
}
```

### `Annonce`

```ts
interface Annonce {
  id: string;
  etablissementId: string;
  auteurId: string;
  auteurNom?: string;
  titre: string;
  contenu: string;
  rolesDestinataires: RoleDestinataire[];
  datePublication: string;
  dateExpiration?: string;
  epinglee: boolean;
  createdAt: string;
}
```

### `ModeleMessage`

```ts
interface ModeleMessage {
  id: string;
  etablissementId: string;
  type: TypeNotification;
  canal: CanalNotification;
  sujet: string;
  contenu: string;                    // gabarit avec variables {{apprenant_nom}}, {{matiere}}, {{date}}
  actif: boolean;
  createdAt: string;
}
```

### `StatsNotifications`

```ts
interface StatsNotifications {
  totalEnvoyees: number;
  tauxOuverture: number;              // %
  tauxEchec: number;                  // %
  parCanal: { canal: CanalNotification; count: number }[];
  parType: { type: TypeNotification; count: number }[];
}
```

### DTOs

```ts
interface EnvoyerNotificationDto {
  etablissementId: string;
  type: TypeNotification;
  canal: CanalNotification;
  titre: string;
  message: string;
  destinataires: { id: string; role: RoleDestinataire }[];
  lien?: string;
}

interface EnvoyerMessageDto {
  expediteurId: string;
  expediteurRole: RoleDestinataire;
  destinataireId: string;
  destinataireRole: RoleDestinataire;
  sujet: string;
  contenu: string;
  pieceJointeUrl?: string;
}

interface CreateAnnonceDto {
  etablissementId: string;
  auteurId: string;
  titre: string;
  contenu: string;
  rolesDestinataires: RoleDestinataire[];
  dateExpiration?: string;
  epinglee?: boolean;
}

interface NotificationFilters {
  destinataireId?: string;
  statut?: StatutNotification;
  type?: TypeNotification;
  canal?: CanalNotification;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  limit?: number;
}

interface MessageFilters {
  userId?: string;
  boite: 'recus' | 'envoyes';         // requis
  lu?: boolean;
  page?: number;
  limit?: number;
}
```

---

## Endpoints — Notifications

### GET /notifications

Liste paginée des notifications.

**Source frontend** : `CommunicationApiService.getNotifications()` ([communication-api.service.ts:18](../../src/app/core/services/communication-api.service.ts#L18))

**Query parameters** : tous les champs de `NotificationFilters`.

**Response 200** — `PaginatedResponse<Notification>`

---

### POST /notifications

Envoie une notification à un ou plusieurs destinataires.

**Source frontend** : `CommunicationApiService.envoyerNotification()` ([communication-api.service.ts:27](../../src/app/core/services/communication-api.service.ts#L27))

**Request body** : `EnvoyerNotificationDto`

**Response 201** — `ApiResponse<{ count: number }>` — nombre de notifications créées (une par destinataire)

---

### PATCH /notifications/{id}/lire

Marque une notification comme lue.

**Source frontend** : `CommunicationApiService.marquerLue()` ([communication-api.service.ts:30](../../src/app/core/services/communication-api.service.ts#L30))

**Path parameters** : `id: UUID`

**Request body** : `{}` (vide)

**Response 200** — `ApiResponse<Notification>`

---

### PATCH /notifications/lire-tout

Marque toutes les notifications d'un utilisateur comme lues.

**Source frontend** : `CommunicationApiService.marquerToutesLues()` ([communication-api.service.ts:33](../../src/app/core/services/communication-api.service.ts#L33))

**Request body**

```ts
{ userId: string }
```

**Response 200** — `ApiResponse<{ count: number }>` — nombre marquées comme lues

---

### GET /notifications/non-lues

Nombre de notifications non lues pour un utilisateur. Utilisé pour le badge UI.

**Source frontend** : `CommunicationApiService.getNombreNonLues()` ([communication-api.service.ts:36](../../src/app/core/services/communication-api.service.ts#L36))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `userId` | UUID | oui | |

**Response 200** — `ApiResponse<{ count: number }>`

---

### GET /notifications/stats

Statistiques notifications par établissement.

**Source frontend** : `CommunicationApiService.getStats()` ([communication-api.service.ts:87](../../src/app/core/services/communication-api.service.ts#L87))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `etablissementId` | UUID | oui | |

**Response 200** — `ApiResponse<StatsNotifications>`

---

## Endpoints — Messages internes

### GET /messages

Liste les messages d'un utilisateur (boîte de réception ou envois).

**Source frontend** : `CommunicationApiService.getMessages()` ([communication-api.service.ts:44](../../src/app/core/services/communication-api.service.ts#L44))

**Query parameters** : tous les champs de `MessageFilters` (`boite` est requis).

**Response 200** — `PaginatedResponse<Message>`

---

### POST /messages

Envoie un message interne.

**Source frontend** : `CommunicationApiService.envoyerMessage()` ([communication-api.service.ts:51](../../src/app/core/services/communication-api.service.ts#L51))

**Request body** : `EnvoyerMessageDto`

**Response 201** — `ApiResponse<Message>`

---

### PATCH /messages/{id}/lire

Marque un message comme lu.

**Source frontend** : `CommunicationApiService.marquerMessageLu()` ([communication-api.service.ts:54](../../src/app/core/services/communication-api.service.ts#L54))

**Path parameters** : `id: UUID`

**Request body** : `{}` (vide)

**Response 200** — `ApiResponse<Message>`

---

### DELETE /messages/{id}

Supprime un message (corbeille ou définitif, à arbitrer côté back).

**Source frontend** : `CommunicationApiService.deleteMessage()` ([communication-api.service.ts:57](../../src/app/core/services/communication-api.service.ts#L57))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

---

## Endpoints — Annonces

### GET /annonces

Liste les annonces d'un établissement (épinglées en premier).

**Source frontend** : `CommunicationApiService.getAnnonces()` ([communication-api.service.ts:62](../../src/app/core/services/communication-api.service.ts#L62))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `etablissementId` | UUID | oui | |

**Response 200** — `ApiResponse<Annonce[]>` (tri : épinglées d'abord, puis `datePublication` desc)

---

### POST /annonces

Crée une annonce.

**Source frontend** : `CommunicationApiService.createAnnonce()` ([communication-api.service.ts:68](../../src/app/core/services/communication-api.service.ts#L68))

**Request body** : `CreateAnnonceDto`

**Response 201** — `ApiResponse<Annonce>`

---

### DELETE /annonces/{id}

Supprime une annonce.

**Source frontend** : `CommunicationApiService.deleteAnnonce()` ([communication-api.service.ts:71](../../src/app/core/services/communication-api.service.ts#L71))

**Path parameters** : `id: UUID`

**Response 200** — `ApiResponse<void>`

---

## Endpoints — Modèles de messages

### GET /modeles-messages

Liste les modèles de messages d'un établissement.

**Source frontend** : `CommunicationApiService.getModeles()` ([communication-api.service.ts:76](../../src/app/core/services/communication-api.service.ts#L76))

**Query parameters**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `etablissementId` | UUID | oui | |

**Response 200** — `ApiResponse<ModeleMessage[]>`

---

### PATCH /modeles-messages/{id}

Modifie un modèle de message.

**Source frontend** : `CommunicationApiService.updateModele()` ([communication-api.service.ts:82](../../src/app/core/services/communication-api.service.ts#L82))

**Path parameters** : `id: UUID`

**Request body** : `Partial<ModeleMessage>` (champs autorisés : `sujet`, `contenu`, `actif`, `type`, `canal`)

**Response 200** — `ApiResponse<ModeleMessage>`
