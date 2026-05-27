import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Notification, Message, Annonce, ModeleMessage, StatsNotifications,
  EnvoyerNotificationDto, EnvoyerMessageDto, CreateAnnonceDto,
  NotificationFilters, MessageFilters,
} from '../models/communication.models';
import { PaginatedResponse, ApiResponse } from '../models/etablissement.models';

@Injectable({ providedIn: 'root' })
export class CommunicationApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}`;

  // Notifications
  getNotifications(filters?: NotificationFilters): Observable<PaginatedResponse<Notification>> {
    let params = new HttpParams();
    if (filters) Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params = params.set(k, String(v));
    });
    return this.http.get<PaginatedResponse<Notification>>(
      `${this.base}/notifications`, { params }
    );
  }
  envoyerNotification(dto: EnvoyerNotificationDto): Observable<ApiResponse<{ count: number }>> {
    return this.http.post<ApiResponse<{ count: number }>>(`${this.base}/notifications`, dto);
  }
  marquerLue(id: string): Observable<ApiResponse<Notification>> {
    return this.http.patch<ApiResponse<Notification>>(`${this.base}/notifications/${id}/lire`, {});
  }
  marquerToutesLues(userId: string): Observable<ApiResponse<{ count: number }>> {
    return this.http.patch<ApiResponse<{ count: number }>>(`${this.base}/notifications/lire-tout`, { userId });
  }
  getNombreNonLues(userId: string): Observable<ApiResponse<{ count: number }>> {
    return this.http.get<ApiResponse<{ count: number }>>(
      `${this.base}/notifications/non-lues`,
      { params: new HttpParams().set('userId', userId) }
    );
  }

  // Messages internes
  getMessages(filters: MessageFilters): Observable<PaginatedResponse<Message>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params = params.set(k, String(v));
    });
    return this.http.get<PaginatedResponse<Message>>(`${this.base}/messages`, { params });
  }
  envoyerMessage(dto: EnvoyerMessageDto): Observable<ApiResponse<Message>> {
    return this.http.post<ApiResponse<Message>>(`${this.base}/messages`, dto);
  }
  marquerMessageLu(id: string): Observable<ApiResponse<Message>> {
    return this.http.patch<ApiResponse<Message>>(`${this.base}/messages/${id}/lire`, {});
  }
  deleteMessage(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/messages/${id}`);
  }

  // Annonces
  getAnnonces(etablissementId: string): Observable<ApiResponse<Annonce[]>> {
    return this.http.get<ApiResponse<Annonce[]>>(
      `${this.base}/annonces`,
      { params: new HttpParams().set('etablissementId', etablissementId) }
    );
  }
  createAnnonce(dto: CreateAnnonceDto): Observable<ApiResponse<Annonce>> {
    return this.http.post<ApiResponse<Annonce>>(`${this.base}/annonces`, dto);
  }
  deleteAnnonce(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/annonces/${id}`);
  }

  // Modèles
  getModeles(etablissementId: string): Observable<ApiResponse<ModeleMessage[]>> {
    return this.http.get<ApiResponse<ModeleMessage[]>>(
      `${this.base}/modeles-messages`,
      { params: new HttpParams().set('etablissementId', etablissementId) }
    );
  }
  updateModele(id: string, dto: Partial<ModeleMessage>): Observable<ApiResponse<ModeleMessage>> {
    return this.http.patch<ApiResponse<ModeleMessage>>(`${this.base}/modeles-messages/${id}`, dto);
  }

  // Stats
  getStats(etablissementId: string): Observable<ApiResponse<StatsNotifications>> {
    return this.http.get<ApiResponse<StatsNotifications>>(
      `${this.base}/notifications/stats`,
      { params: new HttpParams().set('etablissementId', etablissementId) }
    );
  }
}
