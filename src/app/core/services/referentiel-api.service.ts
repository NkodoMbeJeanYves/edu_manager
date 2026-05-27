import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Matiere, UE, Programme, StatsReferentiel,
  CreateMatiereDto, UpdateMatiereDto,
  CreateUEDto, UpdateUEDto,
  RattacherMatiereUEDto, DupliquerReferentielDto,
  MatiereFilters, UEFilters,
} from '../models/referentiel.models';
import { PaginatedResponse, ApiResponse } from '../models/etablissement.models';

@Injectable({ providedIn: 'root' })
export class ReferentielApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}`;

  // ── Matières ─────────────────────────────────────────────────────────────────

  getMatieres(filters?: MatiereFilters): Observable<PaginatedResponse<Matiere>> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params = params.set(k, String(v));
      });
    }
    return this.http.get<PaginatedResponse<Matiere>>(
      `${this.base}/matieres`, { params }
    );
  }

  getMatiere(id: string): Observable<ApiResponse<Matiere>> {
    return this.http.get<ApiResponse<Matiere>>(`${this.base}/matieres/${id}`);
  }

  createMatiere(dto: CreateMatiereDto): Observable<ApiResponse<Matiere>> {
    return this.http.post<ApiResponse<Matiere>>(`${this.base}/matieres`, dto);
  }

  updateMatiere(id: string, dto: UpdateMatiereDto): Observable<ApiResponse<Matiere>> {
    return this.http.patch<ApiResponse<Matiere>>(
      `${this.base}/matieres/${id}`, dto
    );
  }

  deleteMatiere(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/matieres/${id}`);
  }

  getMatieresByNiveau(
    niveauId: string,
    anneeId?: string
  ): Observable<ApiResponse<Matiere[]>> {
    let params = new HttpParams().set('niveauId', niveauId);
    if (anneeId) params = params.set('anneeAcademiqueId', anneeId);
    return this.http.get<ApiResponse<Matiere[]>>(
      `${this.base}/matieres/by-niveau`, { params }
    );
  }

  getMatieresByUE(ueId: string): Observable<ApiResponse<Matiere[]>> {
    return this.http.get<ApiResponse<Matiere[]>>(
      `${this.base}/ue/${ueId}/matieres`
    );
  }

  rattacherMatiereUE(dto: RattacherMatiereUEDto): Observable<ApiResponse<Matiere>> {
    return this.http.patch<ApiResponse<Matiere>>(
      `${this.base}/matieres/${dto.matiereId}/rattacher-ue`, dto
    );
  }

  detacherMatiereUE(matiereId: string): Observable<ApiResponse<Matiere>> {
    return this.http.patch<ApiResponse<Matiere>>(
      `${this.base}/matieres/${matiereId}/detacher-ue`, {}
    );
  }

  // ── UE ───────────────────────────────────────────────────────────────────────

  getUEs(filters?: UEFilters): Observable<PaginatedResponse<UE>> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params = params.set(k, String(v));
      });
    }
    return this.http.get<PaginatedResponse<UE>>(`${this.base}/ue`, { params });
  }

  getUE(id: string): Observable<ApiResponse<UE>> {
    return this.http.get<ApiResponse<UE>>(`${this.base}/ue/${id}`);
  }

  getUEByNiveau(
    niveauId: string,
    semestre?: number,
    anneeId?: string
  ): Observable<ApiResponse<UE[]>> {
    let params = new HttpParams().set('niveauId', niveauId);
    if (semestre !== undefined) params = params.set('semestre', String(semestre));
    if (anneeId) params = params.set('anneeAcademiqueId', anneeId);
    return this.http.get<ApiResponse<UE[]>>(
      `${this.base}/ue/by-niveau`, { params }
    );
  }

  createUE(dto: CreateUEDto): Observable<ApiResponse<UE>> {
    return this.http.post<ApiResponse<UE>>(`${this.base}/ue`, dto);
  }

  updateUE(id: string, dto: UpdateUEDto): Observable<ApiResponse<UE>> {
    return this.http.patch<ApiResponse<UE>>(`${this.base}/ue/${id}`, dto);
  }

  deleteUE(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/ue/${id}`);
  }

  // ── Programmes ───────────────────────────────────────────────────────────────

  getProgramme(
    niveauId: string,
    anneeId: string
  ): Observable<ApiResponse<Programme>> {
    return this.http.get<ApiResponse<Programme>>(
      `${this.base}/programmes`,
      { params: new HttpParams()
          .set('niveauId', niveauId)
          .set('anneeAcademiqueId', anneeId) }
    );
  }

  dupliquerReferentiel(dto: DupliquerReferentielDto): Observable<ApiResponse<{ count: number }>> {
    return this.http.post<ApiResponse<{ count: number }>>(
      `${this.base}/referentiel/dupliquer`, dto
    );
  }

  // ── Stats ────────────────────────────────────────────────────────────────────

  getStats(etablissementId: string): Observable<ApiResponse<StatsReferentiel>> {
    return this.http.get<ApiResponse<StatsReferentiel>>(
      `${this.base}/referentiel/stats`,
      { params: new HttpParams().set('etablissementId', etablissementId) }
    );
  }
}
