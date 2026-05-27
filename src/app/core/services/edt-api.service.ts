import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CoursPlanifie, Seance, ConflitEDT, CreneauHoraire,
  Indisponibilite, EventCalendrier, StatsEDT, CouvertureMatiere,
  CreateCoursPlanifieDto, UpdateCoursPlanifieDto,
  CreateSeanceDto, UpdateSeanceDto,
  SaisirCahierTexteDto, GenererSeancesDto,
  PublierEDTDto, CreateIndisponibiliteDto,
  SeanceFilters, EdtViewFilters,
} from '../models/edt.models';
import { PaginatedResponse, ApiResponse } from '../models/etablissement.models';

@Injectable({ providedIn: 'root' })
export class EdtApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}`;

  // ── Cours planifiés ──────────────────────────────────────────────────────────

  getCoursPlanifies(
    etablissementId: string,
    anneeId: string,
    classeId?: string,
    promotionId?: string
  ): Observable<ApiResponse<CoursPlanifie[]>> {
    let params = new HttpParams()
      .set('etablissementId', etablissementId)
      .set('anneeAcademiqueId', anneeId);
    if (classeId)    params = params.set('classeId', classeId);
    if (promotionId) params = params.set('promotionId', promotionId);
    return this.http.get<ApiResponse<CoursPlanifie[]>>(
      `${this.base}/cours-planifies`, { params }
    );
  }

  getCoursPlanifie(id: string): Observable<ApiResponse<CoursPlanifie>> {
    return this.http.get<ApiResponse<CoursPlanifie>>(
      `${this.base}/cours-planifies/${id}`
    );
  }

  createCoursPlanifie(dto: CreateCoursPlanifieDto): Observable<ApiResponse<CoursPlanifie>> {
    return this.http.post<ApiResponse<CoursPlanifie>>(
      `${this.base}/cours-planifies`, dto
    );
  }

  updateCoursPlanifie(id: string, dto: UpdateCoursPlanifieDto): Observable<ApiResponse<CoursPlanifie>> {
    return this.http.patch<ApiResponse<CoursPlanifie>>(
      `${this.base}/cours-planifies/${id}`, dto
    );
  }

  deleteCoursPlanifie(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/cours-planifies/${id}`
    );
  }

  genererSeances(dto: GenererSeancesDto): Observable<ApiResponse<{ count: number; seances: Seance[] }>> {
    return this.http.post<ApiResponse<{ count: number; seances: Seance[] }>>(
      `${this.base}/cours-planifies/${dto.coursPlanifieId}/generer`, dto
    );
  }

  publierEDT(dto: PublierEDTDto): Observable<ApiResponse<{ count: number }>> {
    return this.http.patch<ApiResponse<{ count: number }>>(
      `${this.base}/edt/publier`, dto
    );
  }

  // ── Séances ──────────────────────────────────────────────────────────────────

  getSeances(filters: SeanceFilters): Observable<PaginatedResponse<Seance>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params = params.set(k, String(v));
    });
    return this.http.get<PaginatedResponse<Seance>>(
      `${this.base}/seances`, { params }
    );
  }

  getSeance(id: string): Observable<ApiResponse<Seance>> {
    return this.http.get<ApiResponse<Seance>>(`${this.base}/seances/${id}`);
  }

  createSeance(dto: CreateSeanceDto): Observable<ApiResponse<Seance>> {
    return this.http.post<ApiResponse<Seance>>(`${this.base}/seances`, dto);
  }

  updateSeance(id: string, dto: UpdateSeanceDto): Observable<ApiResponse<Seance>> {
    return this.http.patch<ApiResponse<Seance>>(
      `${this.base}/seances/${id}`, dto
    );
  }

  deleteSeance(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/seances/${id}`);
  }

  annulerSeance(id: string, motif: string): Observable<ApiResponse<Seance>> {
    return this.http.patch<ApiResponse<Seance>>(
      `${this.base}/seances/${id}/annuler`, { motif }
    );
  }

  reporterSeance(id: string, dto: { dateReport: string; motif: string }): Observable<ApiResponse<Seance>> {
    return this.http.patch<ApiResponse<Seance>>(
      `${this.base}/seances/${id}/reporter`, dto
    );
  }

  marquerRealisee(id: string): Observable<ApiResponse<Seance>> {
    return this.http.patch<ApiResponse<Seance>>(
      `${this.base}/seances/${id}/realiser`, {}
    );
  }

  saisirCahierTexte(dto: SaisirCahierTexteDto): Observable<ApiResponse<Seance>> {
    return this.http.patch<ApiResponse<Seance>>(
      `${this.base}/seances/${dto.seanceId}/cahier-texte`, dto
    );
  }

  remplacerEnseignant(
    id: string,
    enseignantRemplacantId: string
  ): Observable<ApiResponse<Seance>> {
    return this.http.patch<ApiResponse<Seance>>(
      `${this.base}/seances/${id}/remplacer`, { enseignantRemplacantId }
    );
  }

  // ── Vue calendrier ───────────────────────────────────────────────────────────

  getEdtView(filters: EdtViewFilters): Observable<ApiResponse<EventCalendrier[]>> {
    const params = new HttpParams()
      .set('vue', filters.vue)
      .set('entityId', filters.entityId)
      .set('semaine', filters.semaine)
      .set('anneeAcademiqueId', filters.anneeAcademiqueId);
    return this.http.get<ApiResponse<EventCalendrier[]>>(
      `${this.base}/edt/vue`, { params }
    );
  }

  // ── Conflits ─────────────────────────────────────────────────────────────────

  verifierConflits(dto: CreateSeanceDto | (UpdateSeanceDto & { seanceId?: string })): Observable<ApiResponse<ConflitEDT[]>> {
    return this.http.post<ApiResponse<ConflitEDT[]>>(
      `${this.base}/edt/conflits`, dto
    );
  }

  // ── Créneaux horaires ────────────────────────────────────────────────────────

  getCreneaux(etablissementId: string): Observable<ApiResponse<CreneauHoraire[]>> {
    return this.http.get<ApiResponse<CreneauHoraire[]>>(
      `${this.base}/creneaux`,
      { params: new HttpParams().set('etablissementId', etablissementId) }
    );
  }

  createCreneau(dto: Partial<CreneauHoraire>): Observable<ApiResponse<CreneauHoraire>> {
    return this.http.post<ApiResponse<CreneauHoraire>>(
      `${this.base}/creneaux`, dto
    );
  }

  updateCreneau(id: string, dto: Partial<CreneauHoraire>): Observable<ApiResponse<CreneauHoraire>> {
    return this.http.patch<ApiResponse<CreneauHoraire>>(
      `${this.base}/creneaux/${id}`, dto
    );
  }

  deleteCreneau(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/creneaux/${id}`);
  }

  // ── Indisponibilités ─────────────────────────────────────────────────────────

  getIndisponibilites(enseignantId: string): Observable<ApiResponse<Indisponibilite[]>> {
    return this.http.get<ApiResponse<Indisponibilite[]>>(
      `${this.base}/indisponibilites`,
      { params: new HttpParams().set('enseignantId', enseignantId) }
    );
  }

  createIndisponibilite(dto: CreateIndisponibiliteDto): Observable<ApiResponse<Indisponibilite>> {
    return this.http.post<ApiResponse<Indisponibilite>>(
      `${this.base}/indisponibilites`, dto
    );
  }

  deleteIndisponibilite(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/indisponibilites/${id}`
    );
  }

  // ── Stats & couverture ───────────────────────────────────────────────────────

  getStats(
    etablissementId: string,
    anneeId: string,
    classeId?: string
  ): Observable<ApiResponse<StatsEDT>> {
    let params = new HttpParams()
      .set('etablissementId', etablissementId)
      .set('anneeAcademiqueId', anneeId);
    if (classeId) params = params.set('classeId', classeId);
    return this.http.get<ApiResponse<StatsEDT>>(
      `${this.base}/edt/stats`, { params }
    );
  }

  getCouvertureParMatiere(
    classeOuPromotionId: string,
    periodeId?: string
  ): Observable<ApiResponse<CouvertureMatiere[]>> {
    let params = new HttpParams().set('classeOuPromotionId', classeOuPromotionId);
    if (periodeId) params = params.set('periodeId', periodeId);
    return this.http.get<ApiResponse<CouvertureMatiere[]>>(
      `${this.base}/edt/couverture`, { params }
    );
  }
}
