import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Inscription, PeriodeInscription, HistoriqueStatut,
  CreateInscriptionDto, UpdateInscriptionDto,
  ValiderInscriptionDto, RejeterInscriptionDto,
  AffecterClasseDto, CreatePeriodeInscriptionDto,
  InscriptionFilters, InscriptionStats,
} from '../models/inscription.models';
import { PaginatedResponse, ApiResponse } from '../models/etablissement.models';

@Injectable({ providedIn: 'root' })
export class InscriptionApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/inscriptions`;

  // ── Inscriptions ────────────────────────────────────────────────────────────

  getInscriptions(filters?: InscriptionFilters): Observable<PaginatedResponse<Inscription>> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params = params.set(k, String(v));
      });
    }
    return this.http.get<PaginatedResponse<Inscription>>(this.base, { params });
  }

  getInscription(id: string): Observable<ApiResponse<Inscription>> {
    return this.http.get<ApiResponse<Inscription>>(`${this.base}/${id}`);
  }

  getInscriptionsByApprenant(apprenantId: string): Observable<ApiResponse<Inscription[]>> {
    return this.http.get<ApiResponse<Inscription[]>>(
      `${environment.apiUrl}/apprenants/${apprenantId}/inscriptions`
    );
  }

  createInscription(dto: CreateInscriptionDto): Observable<ApiResponse<Inscription>> {
    return this.http.post<ApiResponse<Inscription>>(this.base, dto);
  }

  updateInscription(id: string, dto: UpdateInscriptionDto): Observable<ApiResponse<Inscription>> {
    return this.http.patch<ApiResponse<Inscription>>(`${this.base}/${id}`, dto);
  }

  soumettre(id: string): Observable<ApiResponse<Inscription>> {
    return this.http.patch<ApiResponse<Inscription>>(`${this.base}/${id}/soumettre`, {});
  }

  valider(id: string, dto: ValiderInscriptionDto): Observable<ApiResponse<Inscription>> {
    return this.http.patch<ApiResponse<Inscription>>(`${this.base}/${id}/valider`, dto);
  }

  rejeter(id: string, dto: RejeterInscriptionDto): Observable<ApiResponse<Inscription>> {
    return this.http.patch<ApiResponse<Inscription>>(`${this.base}/${id}/rejeter`, dto);
  }

  annuler(id: string, motif: string): Observable<ApiResponse<Inscription>> {
    return this.http.patch<ApiResponse<Inscription>>(`${this.base}/${id}/annuler`, { motif });
  }

  affecterClasse(dto: AffecterClasseDto): Observable<ApiResponse<Inscription>> {
    return this.http.patch<ApiResponse<Inscription>>(
      `${this.base}/${dto.inscriptionId}/affecter`, dto
    );
  }

  getHistorique(id: string): Observable<ApiResponse<HistoriqueStatut[]>> {
    return this.http.get<ApiResponse<HistoriqueStatut[]>>(`${this.base}/${id}/historique`);
  }

  getStats(etablissementId?: string, anneeId?: string): Observable<ApiResponse<InscriptionStats>> {
    let params = new HttpParams();
    if (etablissementId) params = params.set('etablissementId', etablissementId);
    if (anneeId) params = params.set('anneeAcademiqueId', anneeId);
    return this.http.get<ApiResponse<InscriptionStats>>(`${this.base}/stats`, { params });
  }

  // ── Réinscription ───────────────────────────────────────────────────────────

  initierReinscription(
    apprenantId: string,
    anneeAcademiqueId: string
  ): Observable<ApiResponse<Inscription>> {
    return this.http.post<ApiResponse<Inscription>>(`${this.base}/reinscription`, {
      apprenantId,
      anneeAcademiqueId,
    });
  }

  verifierEligibiliteReinscription(
    apprenantId: string,
    anneeAcademiqueId: string
  ): Observable<ApiResponse<{ eligible: boolean; blocages: string[] }>> {
    return this.http.get<ApiResponse<{ eligible: boolean; blocages: string[] }>>(
      `${this.base}/eligibilite-reinscription`,
      { params: new HttpParams()
          .set('apprenantId', apprenantId)
          .set('anneeAcademiqueId', anneeAcademiqueId) }
    );
  }

  // ── Périodes d'inscription ──────────────────────────────────────────────────

  getPeriodes(etablissementId: string): Observable<ApiResponse<PeriodeInscription[]>> {
    return this.http.get<ApiResponse<PeriodeInscription[]>>(
      `${environment.apiUrl}/periodes-inscription`,
      { params: new HttpParams().set('etablissementId', etablissementId) }
    );
  }

  createPeriode(dto: CreatePeriodeInscriptionDto): Observable<ApiResponse<PeriodeInscription>> {
    return this.http.post<ApiResponse<PeriodeInscription>>(
      `${environment.apiUrl}/periodes-inscription`, dto
    );
  }

  ouvrirPeriode(id: string): Observable<ApiResponse<PeriodeInscription>> {
    return this.http.patch<ApiResponse<PeriodeInscription>>(
      `${environment.apiUrl}/periodes-inscription/${id}/ouvrir`, {}
    );
  }

  fermerPeriode(id: string): Observable<ApiResponse<PeriodeInscription>> {
    return this.http.patch<ApiResponse<PeriodeInscription>>(
      `${environment.apiUrl}/periodes-inscription/${id}/fermer`, {}
    );
  }

  deletePeriode(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${environment.apiUrl}/periodes-inscription/${id}`
    );
  }
}
