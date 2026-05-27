import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Absence, Presence, FeuillePresence, Justificatif,
  AbsenceEnseignant, StatsAbsenteisme, StatsAbsenteismeClasse,
  ParametresAbsenteisme,
  SaisirPresencesDto, UpdatePresenceDto,
  SoumettreJustificatifDto, ValiderJustificatifDto,
  CreateAbsenceEnseignantDto,
  AbsenceFilters, PresenceFilters,
} from '../models/absence.models';
import { PaginatedResponse, ApiResponse } from '../models/etablissement.models';

@Injectable({ providedIn: 'root' })
export class AbsenceApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}`;

  // ── Feuilles de présence ─────────────────────────────────────────────────────

  getFeuillePresence(seanceId: string): Observable<ApiResponse<FeuillePresence>> {
    return this.http.get<ApiResponse<FeuillePresence>>(
      `${this.base}/seances/${seanceId}/presences`
    );
  }

  saisirPresences(dto: SaisirPresencesDto): Observable<ApiResponse<FeuillePresence>> {
    return this.http.post<ApiResponse<FeuillePresence>>(
      `${this.base}/seances/${dto.seanceId}/presences`, dto
    );
  }

  updatePresence(id: string, dto: UpdatePresenceDto): Observable<ApiResponse<Presence>> {
    return this.http.patch<ApiResponse<Presence>>(
      `${this.base}/presences/${id}`, dto
    );
  }

  getPresencesApprenant(
    apprenantId: string,
    filters?: PresenceFilters
  ): Observable<ApiResponse<Presence[]>> {
    let params = new HttpParams().set('apprenantId', apprenantId);
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params = params.set(k, String(v));
      });
    }
    return this.http.get<ApiResponse<Presence[]>>(
      `${this.base}/presences`, { params }
    );
  }

  // ── Absences ─────────────────────────────────────────────────────────────────

  getAbsences(filters?: AbsenceFilters): Observable<PaginatedResponse<Absence>> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params = params.set(k, String(v));
      });
    }
    return this.http.get<PaginatedResponse<Absence>>(
      `${this.base}/absences`, { params }
    );
  }

  getAbsence(id: string): Observable<ApiResponse<Absence>> {
    return this.http.get<ApiResponse<Absence>>(`${this.base}/absences/${id}`);
  }

  getAbsencesApprenant(
    apprenantId: string,
    anneeId?: string
  ): Observable<ApiResponse<Absence[]>> {
    let params = new HttpParams().set('apprenantId', apprenantId);
    if (anneeId) params = params.set('anneeAcademiqueId', anneeId);
    return this.http.get<ApiResponse<Absence[]>>(
      `${this.base}/absences/apprenant`, { params }
    );
  }

  notifierParent(absenceId: string): Observable<ApiResponse<{ sent: boolean }>> {
    return this.http.post<ApiResponse<{ sent: boolean }>>(
      `${this.base}/absences/${absenceId}/notifier`, {}
    );
  }

  // ── Justificatifs ────────────────────────────────────────────────────────────

  soumettreJustificatif(dto: SoumettreJustificatifDto): Observable<ApiResponse<Justificatif>> {
    const form = new FormData();
    form.append('absenceId', dto.absenceId);
    form.append('type', dto.type);
    form.append('description', dto.description);
    if (dto.fichier) form.append('fichier', dto.fichier);
    return this.http.post<ApiResponse<Justificatif>>(
      `${this.base}/justificatifs`, form
    );
  }

  validerJustificatif(dto: ValiderJustificatifDto): Observable<ApiResponse<Justificatif>> {
    return this.http.patch<ApiResponse<Justificatif>>(
      `${this.base}/justificatifs/${dto.justificatifId}/valider`, dto
    );
  }

  getJustificatifsEnAttente(
    etablissementId: string
  ): Observable<ApiResponse<Justificatif[]>> {
    return this.http.get<ApiResponse<Justificatif[]>>(
      `${this.base}/justificatifs/en-attente`,
      { params: new HttpParams().set('etablissementId', etablissementId) }
    );
  }

  // ── Statistiques d'absentéisme ────────────────────────────────────────────────

  getStatsApprenant(
    apprenantId: string,
    anneeId?: string,
    periodeId?: string
  ): Observable<ApiResponse<StatsAbsenteisme>> {
    let params = new HttpParams().set('apprenantId', apprenantId);
    if (anneeId)   params = params.set('anneeAcademiqueId', anneeId);
    if (periodeId) params = params.set('periodeId', periodeId);
    return this.http.get<ApiResponse<StatsAbsenteisme>>(
      `${this.base}/absences/stats/apprenant`, { params }
    );
  }

  getStatsClasse(
    classeOuPromotionId: string,
    periodeId?: string
  ): Observable<ApiResponse<StatsAbsenteismeClasse>> {
    let params = new HttpParams().set('classeOuPromotionId', classeOuPromotionId);
    if (periodeId) params = params.set('periodeId', periodeId);
    return this.http.get<ApiResponse<StatsAbsenteismeClasse>>(
      `${this.base}/absences/stats/classe`, { params }
    );
  }

  getApprenantsDessusSeui(
    etablissementId: string,
    anneeId: string
  ): Observable<ApiResponse<StatsAbsenteisme[]>> {
    return this.http.get<ApiResponse<StatsAbsenteisme[]>>(
      `${this.base}/absences/alertes`,
      { params: new HttpParams()
          .set('etablissementId', etablissementId)
          .set('anneeAcademiqueId', anneeId) }
    );
  }

  // ── Absences enseignants ─────────────────────────────────────────────────────

  getAbsencesEnseignant(enseignantId: string): Observable<ApiResponse<AbsenceEnseignant[]>> {
    return this.http.get<ApiResponse<AbsenceEnseignant[]>>(
      `${this.base}/absences-enseignants`,
      { params: new HttpParams().set('enseignantId', enseignantId) }
    );
  }

  createAbsenceEnseignant(
    dto: CreateAbsenceEnseignantDto
  ): Observable<ApiResponse<AbsenceEnseignant>> {
    return this.http.post<ApiResponse<AbsenceEnseignant>>(
      `${this.base}/absences-enseignants`, dto
    );
  }

  deleteAbsenceEnseignant(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/absences-enseignants/${id}`
    );
  }

  // ── Paramètres ───────────────────────────────────────────────────────────────

  getParametres(etablissementId: string): Observable<ApiResponse<ParametresAbsenteisme>> {
    return this.http.get<ApiResponse<ParametresAbsenteisme>>(
      `${this.base}/absences/parametres`,
      { params: new HttpParams().set('etablissementId', etablissementId) }
    );
  }

  updateParametres(
    etablissementId: string,
    dto: Partial<ParametresAbsenteisme>
  ): Observable<ApiResponse<ParametresAbsenteisme>> {
    return this.http.patch<ApiResponse<ParametresAbsenteisme>>(
      `${this.base}/absences/parametres`, { etablissementId, ...dto }
    );
  }
}
