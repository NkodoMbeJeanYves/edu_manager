import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Etablissement, Campus, AnneeAcademique, Periode, Salle, EvenementCalendrier,
  CreateEtablissementDto, UpdateEtablissementDto,
  CreateCampusDto, UpdateCampusDto,
  CreateAnneeAcademiqueDto, UpdateAnneeAcademiqueDto,
  CreatePeriodeDto, CreateSalleDto, UpdateSalleDto,
  PaginatedResponse, ApiResponse
} from '../models/etablissement.models';

export interface EtablissementFilters {
  search?: string;
  type?: string;
  actif?: boolean;
  page?: number;
  limit?: number;
}

export interface SalleFilters {
  campusId?: string;
  type?: string;
  statut?: string;
  capaciteMin?: number;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class EtablissementApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/etablissements`;

  // ── Établissements ──────────────────────────────────────────────────────────

  getEtablissements(filters?: EtablissementFilters): Observable<PaginatedResponse<Etablissement>> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params = params.set(k, String(v));
      });
    }
    return this.http.get<PaginatedResponse<Etablissement>>(this.base, { params });
  }

  getEtablissement(id: string): Observable<ApiResponse<Etablissement>> {
    return this.http.get<ApiResponse<Etablissement>>(`${this.base}/${id}`);
  }

  createEtablissement(dto: CreateEtablissementDto): Observable<ApiResponse<Etablissement>> {
    return this.http.post<ApiResponse<Etablissement>>(this.base, dto);
  }

  updateEtablissement(id: string, dto: UpdateEtablissementDto): Observable<ApiResponse<Etablissement>> {
    return this.http.patch<ApiResponse<Etablissement>>(`${this.base}/${id}`, dto);
  }

  deleteEtablissement(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`);
  }

  // ── Campus ──────────────────────────────────────────────────────────────────

  getCampusByEtablissement(etablissementId: string): Observable<ApiResponse<Campus[]>> {
    return this.http.get<ApiResponse<Campus[]>>(`${this.base}/${etablissementId}/campus`);
  }

  getCampus(id: string): Observable<ApiResponse<Campus>> {
    return this.http.get<ApiResponse<Campus>>(`${environment.apiUrl}/campus/${id}`);
  }

  createCampus(dto: CreateCampusDto): Observable<ApiResponse<Campus>> {
    return this.http.post<ApiResponse<Campus>>(`${environment.apiUrl}/campus`, dto);
  }

  updateCampus(id: string, dto: UpdateCampusDto): Observable<ApiResponse<Campus>> {
    return this.http.patch<ApiResponse<Campus>>(`${environment.apiUrl}/campus/${id}`, dto);
  }

  deleteCampus(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/campus/${id}`);
  }

  // ── Années académiques ──────────────────────────────────────────────────────

  getAnneesAcademiques(etablissementId: string): Observable<ApiResponse<AnneeAcademique[]>> {
    return this.http.get<ApiResponse<AnneeAcademique[]>>(`${this.base}/${etablissementId}/annees-academiques`);
  }

  getAnneeAcademique(id: string): Observable<ApiResponse<AnneeAcademique>> {
    return this.http.get<ApiResponse<AnneeAcademique>>(`${environment.apiUrl}/annees-academiques/${id}`);
  }

  createAnneeAcademique(dto: CreateAnneeAcademiqueDto): Observable<ApiResponse<AnneeAcademique>> {
    return this.http.post<ApiResponse<AnneeAcademique>>(`${environment.apiUrl}/annees-academiques`, dto);
  }

  updateAnneeAcademique(id: string, dto: UpdateAnneeAcademiqueDto): Observable<ApiResponse<AnneeAcademique>> {
    return this.http.patch<ApiResponse<AnneeAcademique>>(`${environment.apiUrl}/annees-academiques/${id}`, dto);
  }

  activerAnneeAcademique(id: string): Observable<ApiResponse<AnneeAcademique>> {
    return this.http.patch<ApiResponse<AnneeAcademique>>(`${environment.apiUrl}/annees-academiques/${id}/activer`, {});
  }

  cloturerAnneeAcademique(id: string): Observable<ApiResponse<AnneeAcademique>> {
    return this.http.patch<ApiResponse<AnneeAcademique>>(`${environment.apiUrl}/annees-academiques/${id}/cloturer`, {});
  }

  // ── Périodes ────────────────────────────────────────────────────────────────

  getPeriodes(anneeAcademiqueId: string): Observable<ApiResponse<Periode[]>> {
    return this.http.get<ApiResponse<Periode[]>>(`${environment.apiUrl}/annees-academiques/${anneeAcademiqueId}/periodes`);
  }

  createPeriode(dto: CreatePeriodeDto): Observable<ApiResponse<Periode>> {
    return this.http.post<ApiResponse<Periode>>(`${environment.apiUrl}/periodes`, dto);
  }

  updatePeriode(id: string, dto: Partial<CreatePeriodeDto>): Observable<ApiResponse<Periode>> {
    return this.http.patch<ApiResponse<Periode>>(`${environment.apiUrl}/periodes/${id}`, dto);
  }

  deletePeriode(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/periodes/${id}`);
  }

  // ── Salles ──────────────────────────────────────────────────────────────────

  getSalles(filters?: SalleFilters): Observable<PaginatedResponse<Salle>> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params = params.set(k, String(v));
      });
    }
    return this.http.get<PaginatedResponse<Salle>>(`${environment.apiUrl}/salles`, { params });
  }

  getSalle(id: string): Observable<ApiResponse<Salle>> {
    return this.http.get<ApiResponse<Salle>>(`${environment.apiUrl}/salles/${id}`);
  }

  createSalle(dto: CreateSalleDto): Observable<ApiResponse<Salle>> {
    return this.http.post<ApiResponse<Salle>>(`${environment.apiUrl}/salles`, dto);
  }

  updateSalle(id: string, dto: UpdateSalleDto): Observable<ApiResponse<Salle>> {
    return this.http.patch<ApiResponse<Salle>>(`${environment.apiUrl}/salles/${id}`, dto);
  }

  deleteSalle(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/salles/${id}`);
  }

  // ── Calendrier ──────────────────────────────────────────────────────────────

  getEvenements(etablissementId: string, anneeId?: string): Observable<ApiResponse<EvenementCalendrier[]>> {
    let params = new HttpParams();
    if (anneeId) params = params.set('anneeAcademiqueId', anneeId);
    return this.http.get<ApiResponse<EvenementCalendrier[]>>(
      `${this.base}/${etablissementId}/calendrier`, { params }
    );
  }

  createEvenement(dto: Partial<EvenementCalendrier>): Observable<ApiResponse<EvenementCalendrier>> {
    return this.http.post<ApiResponse<EvenementCalendrier>>(`${environment.apiUrl}/calendrier`, dto);
  }

  deleteEvenement(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/calendrier/${id}`);
  }
}
