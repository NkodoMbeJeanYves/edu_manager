import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Cycle, Filiere, Niveau, Classe, Promotion, Groupe, StatsStructure,
  CreateCycleDto, UpdateCycleDto,
  CreateFiliereDto, UpdateFiliereDto,
  CreateNiveauDto, UpdateNiveauDto,
  CreateClasseDto, UpdateClasseDto,
  CreatePromotionDto, UpdatePromotionDto,
  CreateGroupeDto, UpdateGroupeDto,
  ClasseFilters, PromotionFilters,
} from '../models/structure.models';
import { PaginatedResponse, ApiResponse } from '../models/etablissement.models';

@Injectable({ providedIn: 'root' })
export class StructureApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}`;

  // ── Cycles ───────────────────────────────────────────────────────────────────

  getCycles(etablissementId: string): Observable<ApiResponse<Cycle[]>> {
    return this.http.get<ApiResponse<Cycle[]>>(`${this.base}/cycles`, {
      params: new HttpParams().set('etablissementId', etablissementId),
    });
  }

  getCycle(id: string): Observable<ApiResponse<Cycle>> {
    return this.http.get<ApiResponse<Cycle>>(`${this.base}/cycles/${id}`);
  }

  createCycle(dto: CreateCycleDto): Observable<ApiResponse<Cycle>> {
    return this.http.post<ApiResponse<Cycle>>(`${this.base}/cycles`, dto);
  }

  updateCycle(id: string, dto: UpdateCycleDto): Observable<ApiResponse<Cycle>> {
    return this.http.patch<ApiResponse<Cycle>>(`${this.base}/cycles/${id}`, dto);
  }

  deleteCycle(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/cycles/${id}`);
  }

  // ── Filières ─────────────────────────────────────────────────────────────────

  getFilieres(etablissementId?: string, cycleId?: string): Observable<ApiResponse<Filiere[]>> {
    let params = new HttpParams();
    if (etablissementId) params = params.set('etablissementId', etablissementId);
    if (cycleId)         params = params.set('cycleId', cycleId);
    return this.http.get<ApiResponse<Filiere[]>>(`${this.base}/filieres`, { params });
  }

  getFiliere(id: string): Observable<ApiResponse<Filiere>> {
    return this.http.get<ApiResponse<Filiere>>(`${this.base}/filieres/${id}`);
  }

  createFiliere(dto: CreateFiliereDto): Observable<ApiResponse<Filiere>> {
    return this.http.post<ApiResponse<Filiere>>(`${this.base}/filieres`, dto);
  }

  updateFiliere(id: string, dto: UpdateFiliereDto): Observable<ApiResponse<Filiere>> {
    return this.http.patch<ApiResponse<Filiere>>(`${this.base}/filieres/${id}`, dto);
  }

  deleteFiliere(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/filieres/${id}`);
  }

  // ── Niveaux ──────────────────────────────────────────────────────────────────

  getNiveaux(filiereId: string): Observable<ApiResponse<Niveau[]>> {
    return this.http.get<ApiResponse<Niveau[]>>(`${this.base}/niveaux`, {
      params: new HttpParams().set('filiereId', filiereId),
    });
  }

  createNiveau(dto: CreateNiveauDto): Observable<ApiResponse<Niveau>> {
    return this.http.post<ApiResponse<Niveau>>(`${this.base}/niveaux`, dto);
  }

  updateNiveau(id: string, dto: UpdateNiveauDto): Observable<ApiResponse<Niveau>> {
    return this.http.patch<ApiResponse<Niveau>>(`${this.base}/niveaux/${id}`, dto);
  }

  deleteNiveau(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/niveaux/${id}`);
  }

  // ── Classes ──────────────────────────────────────────────────────────────────

  getClasses(filters?: ClasseFilters): Observable<PaginatedResponse<Classe>> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params = params.set(k, String(v));
      });
    }
    return this.http.get<PaginatedResponse<Classe>>(`${this.base}/classes`, { params });
  }

  getClasse(id: string): Observable<ApiResponse<Classe>> {
    return this.http.get<ApiResponse<Classe>>(`${this.base}/classes/${id}`);
  }

  createClasse(dto: CreateClasseDto): Observable<ApiResponse<Classe>> {
    return this.http.post<ApiResponse<Classe>>(`${this.base}/classes`, dto);
  }

  updateClasse(id: string, dto: UpdateClasseDto): Observable<ApiResponse<Classe>> {
    return this.http.patch<ApiResponse<Classe>>(`${this.base}/classes/${id}`, dto);
  }

  deleteClasse(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/classes/${id}`);
  }

  getApprenantsByClasse(classeId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.base}/classes/${classeId}/apprenants`
    );
  }

  // ── Promotions ────────────────────────────────────────────────────────────────

  getPromotions(filters?: PromotionFilters): Observable<PaginatedResponse<Promotion>> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params = params.set(k, String(v));
      });
    }
    return this.http.get<PaginatedResponse<Promotion>>(
      `${this.base}/promotions`, { params }
    );
  }

  getPromotion(id: string): Observable<ApiResponse<Promotion>> {
    return this.http.get<ApiResponse<Promotion>>(`${this.base}/promotions/${id}`);
  }

  createPromotion(dto: CreatePromotionDto): Observable<ApiResponse<Promotion>> {
    return this.http.post<ApiResponse<Promotion>>(`${this.base}/promotions`, dto);
  }

  updatePromotion(id: string, dto: UpdatePromotionDto): Observable<ApiResponse<Promotion>> {
    return this.http.patch<ApiResponse<Promotion>>(
      `${this.base}/promotions/${id}`, dto
    );
  }

  deletePromotion(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/promotions/${id}`);
  }

  getEtudiantsByPromotion(promotionId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.base}/promotions/${promotionId}/etudiants`
    );
  }

  // ── Groupes ──────────────────────────────────────────────────────────────────

  getGroupesByPromotion(promotionId: string): Observable<ApiResponse<Groupe[]>> {
    return this.http.get<ApiResponse<Groupe[]>>(
      `${this.base}/promotions/${promotionId}/groupes`
    );
  }

  createGroupe(dto: CreateGroupeDto): Observable<ApiResponse<Groupe>> {
    return this.http.post<ApiResponse<Groupe>>(`${this.base}/groupes`, dto);
  }

  updateGroupe(id: string, dto: UpdateGroupeDto): Observable<ApiResponse<Groupe>> {
    return this.http.patch<ApiResponse<Groupe>>(`${this.base}/groupes/${id}`, dto);
  }

  deleteGroupe(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/groupes/${id}`);
  }

  // ── Stats ────────────────────────────────────────────────────────────────────

  getStats(etablissementId: string, anneeId?: string): Observable<ApiResponse<StatsStructure>> {
    let params = new HttpParams().set('etablissementId', etablissementId);
    if (anneeId) params = params.set('anneeAcademiqueId', anneeId);
    return this.http.get<ApiResponse<StatsStructure>>(
      `${this.base}/structure/stats`, { params }
    );
  }
}
