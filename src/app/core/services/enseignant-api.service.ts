import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Enseignant, AffectationMatiere, ChargeHoraire, StatsEnseignant,
  CreateEnseignantDto, UpdateEnseignantDto,
  AffecterMatiereDto, UpdateAffectationDto,
  EnseignantFilters,
} from '../models/enseignant.models';
import { PaginatedResponse, ApiResponse } from '../models/etablissement.models';

@Injectable({ providedIn: 'root' })
export class EnseignantApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}`;

  // ── Enseignants ──────────────────────────────────────────────────────────────

  getEnseignants(filters?: EnseignantFilters): Observable<PaginatedResponse<Enseignant>> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params = params.set(k, String(v));
      });
    }
    return this.http.get<PaginatedResponse<Enseignant>>(
      `${this.base}/enseignants`, { params }
    );
  }

  getEnseignant(id: string): Observable<ApiResponse<Enseignant>> {
    return this.http.get<ApiResponse<Enseignant>>(
      `${this.base}/enseignants/${id}`
    );
  }

  createEnseignant(dto: CreateEnseignantDto): Observable<ApiResponse<Enseignant>> {
    return this.http.post<ApiResponse<Enseignant>>(
      `${this.base}/enseignants`, dto
    );
  }

  updateEnseignant(id: string, dto: UpdateEnseignantDto): Observable<ApiResponse<Enseignant>> {
    return this.http.patch<ApiResponse<Enseignant>>(
      `${this.base}/enseignants/${id}`, dto
    );
  }

  deleteEnseignant(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/enseignants/${id}`
    );
  }

  uploadPhoto(id: string, file: File): Observable<ApiResponse<Enseignant>> {
    const form = new FormData();
    form.append('photo', file);
    return this.http.post<ApiResponse<Enseignant>>(
      `${this.base}/enseignants/${id}/photo`, form
    );
  }

  // ── Affectations matières ────────────────────────────────────────────────────

  getAffectations(
    enseignantId: string,
    anneeId?: string
  ): Observable<ApiResponse<AffectationMatiere[]>> {
    let params = new HttpParams().set('enseignantId', enseignantId);
    if (anneeId) params = params.set('anneeAcademiqueId', anneeId);
    return this.http.get<ApiResponse<AffectationMatiere[]>>(
      `${this.base}/affectations-matieres`, { params }
    );
  }

  affecterMatiere(dto: AffecterMatiereDto): Observable<ApiResponse<AffectationMatiere>> {
    return this.http.post<ApiResponse<AffectationMatiere>>(
      `${this.base}/affectations-matieres`, dto
    );
  }

  updateAffectation(
    id: string,
    dto: UpdateAffectationDto
  ): Observable<ApiResponse<AffectationMatiere>> {
    return this.http.patch<ApiResponse<AffectationMatiere>>(
      `${this.base}/affectations-matieres/${id}`, dto
    );
  }

  supprimerAffectation(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/affectations-matieres/${id}`
    );
  }

  // ── Charge horaire ────────────────────────────────────────────────────────────

  getChargeHoraire(
    enseignantId: string,
    anneeId: string
  ): Observable<ApiResponse<ChargeHoraire>> {
    return this.http.get<ApiResponse<ChargeHoraire>>(
      `${this.base}/enseignants/${enseignantId}/charge-horaire`,
      { params: new HttpParams().set('anneeAcademiqueId', anneeId) }
    );
  }

  // ── Statistiques ──────────────────────────────────────────────────────────────

  getStats(etablissementId: string): Observable<ApiResponse<StatsEnseignant>> {
    return this.http.get<ApiResponse<StatsEnseignant>>(
      `${this.base}/enseignants/stats`,
      { params: new HttpParams().set('etablissementId', etablissementId) }
    );
  }

  // ── Recherche rapide (pour sélecteurs) ──────────────────────────────────────

  searchEnseignants(
    query: string,
    etablissementId: string
  ): Observable<ApiResponse<Pick<Enseignant, 'id' | 'prenom' | 'nom' | 'matricule'>[]>> {
    return this.http.get<ApiResponse<Pick<Enseignant, 'id' | 'prenom' | 'nom' | 'matricule'>[]>>(
      `${this.base}/enseignants/search`,
      { params: new HttpParams()
          .set('q', query)
          .set('etablissementId', etablissementId) }
    );
  }
}
