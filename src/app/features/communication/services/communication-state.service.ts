import { Injectable, computed, signal, inject } from '@angular/core';
import { CommunicationApiService } from '../../../core/services/communication-api.service';
import {
  Notification, Message, Annonce, StatsNotifications,
  EnvoyerNotificationDto, EnvoyerMessageDto, CreateAnnonceDto,
  NotificationFilters, MessageFilters,
} from '../../../core/models/communication.models';

@Injectable({ providedIn: 'root' })
export class CommunicationStateService {
  private api = inject(CommunicationApiService);

  private state = signal({
    notifications: [] as Notification[],
    messages: [] as Message[],
    annonces: [] as Annonce[],
    stats: null as StatsNotifications | null,
    nombreNonLues: 0,
    nombreMessagesNonLus: 0,
    loading: false,
    error: null as string | null,
    total: 0,
    page: 1,
  });

  readonly notifications        = computed(() => this.state().notifications);
  readonly messages             = computed(() => this.state().messages);
  readonly annonces             = computed(() => this.state().annonces);
  readonly stats                = computed(() => this.state().stats);
  readonly nombreNonLues        = computed(() => this.state().nombreNonLues);
  readonly nombreMessagesNonLus = computed(() => this.state().nombreMessagesNonLus);
  readonly loading              = computed(() => this.state().loading);
  readonly error                = computed(() => this.state().error);
  readonly total                = computed(() => this.state().total);

  readonly notificationsNonLues = computed(() =>
    this.notifications().filter(n => n.statut !== 'lue')
  );
  readonly annoncesEpinglees = computed(() =>
    this.annonces().filter(a => a.epinglee)
  );
  readonly messagesNonLus = computed(() =>
    this.messages().filter(m => !m.lu)
  );

  loadNotifications(filters?: NotificationFilters): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.api.getNotifications(filters).subscribe({
      next: res => this.state.update(s => ({
        ...s, loading: false, notifications: res.data, total: res.total,
      })),
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  marquerLue(id: string): void {
    this.api.marquerLue(id).subscribe({
      next: res => this.state.update(s => ({
        ...s,
        notifications: s.notifications.map(n => n.id === id ? res.data : n),
        nombreNonLues: Math.max(0, s.nombreNonLues - 1),
      })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  marquerToutesLues(userId: string): void {
    this.api.marquerToutesLues(userId).subscribe({
      next: () => this.state.update(s => ({
        ...s,
        notifications: s.notifications.map(n => ({ ...n, statut: 'lue' as const })),
        nombreNonLues: 0,
      })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  loadNombreNonLues(userId: string): void {
    this.api.getNombreNonLues(userId).subscribe({
      next: res => this.state.update(s => ({ ...s, nombreNonLues: res.data.count })),
      error: () => {},
    });
  }

  envoyerNotification(dto: EnvoyerNotificationDto, onSuccess?: (count: number) => void): void {
    this.api.envoyerNotification(dto).subscribe({
      next: res => onSuccess?.(res.data.count),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  loadMessages(filters: MessageFilters): void {
    this.state.update(s => ({ ...s, loading: true }));
    this.api.getMessages(filters).subscribe({
      next: res => this.state.update(s => ({
        ...s, loading: false, messages: res.data, total: res.total,
      })),
      error: err => this.state.update(s => ({ ...s, loading: false, error: err.message })),
    });
  }

  envoyerMessage(dto: EnvoyerMessageDto, onSuccess?: () => void): void {
    this.api.envoyerMessage(dto).subscribe({
      next: res => {
        this.state.update(s => ({ ...s, messages: [res.data, ...s.messages] }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  marquerMessageLu(id: string): void {
    this.api.marquerMessageLu(id).subscribe({
      next: res => this.state.update(s => ({
        ...s,
        messages: s.messages.map(m => m.id === id ? res.data : m),
        nombreMessagesNonLus: Math.max(0, s.nombreMessagesNonLus - 1),
      })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  loadAnnonces(etablissementId: string): void {
    this.api.getAnnonces(etablissementId).subscribe({
      next: res => this.state.update(s => ({ ...s, annonces: res.data })),
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  createAnnonce(dto: CreateAnnonceDto, onSuccess?: () => void): void {
    this.api.createAnnonce(dto).subscribe({
      next: res => {
        this.state.update(s => ({ ...s, annonces: [res.data, ...s.annonces] }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  deleteAnnonce(id: string, onSuccess?: () => void): void {
    this.api.deleteAnnonce(id).subscribe({
      next: () => {
        this.state.update(s => ({ ...s, annonces: s.annonces.filter(a => a.id !== id) }));
        onSuccess?.();
      },
      error: err => this.state.update(s => ({ ...s, error: err.message })),
    });
  }

  loadStats(etablissementId: string): void {
    this.api.getStats(etablissementId).subscribe({
      next: res => this.state.update(s => ({ ...s, stats: res.data })),
      error: () => {},
    });
  }

  clearError(): void { this.state.update(s => ({ ...s, error: null })); }
}
