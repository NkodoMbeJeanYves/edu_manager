import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Evaluation, Note, MoyenneMatiere, MoyenneUE, MoyenneGenerale,
  CreateEvaluationDto, UpdateEvaluationDto,
  CreateNoteDto, UpdateNoteDto,
  SaisieNoteMasse, ValiderNotesDto, PublierNotesDto,
  ApprecierMatiereDto, EvaluationFilters, NoteFilters,
  StatistiquesEvaluation,
} from '../models/note.models';
import { PaginatedResponse, ApiResponse } from '../models/etablissement.models';

@Injectable({ providedIn: 'root' })
export class NoteApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}`;

  // ── Évaluations ─────────────────────────────────────────────────────────────

  getEvaluations(filters?: EvaluationFilters): Observable<PaginatedResponse<Evaluation>> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params = params.set(k, String(v));
      });
    }
    return this.http.get<PaginatedResponse<Evaluation>>(
      `${this.base}/evaluations`, { params }
    );
  }

  getEvaluation(id: string): Observable<ApiResponse<Evaluation>> {
    return this.http.get<ApiResponse<Evaluation>>(`${this.base}/evaluations/${id}`);
  }

  createEvaluation(dto: CreateEvaluationDto): Observable<ApiResponse<Evaluation>> {
    return this.http.post<ApiResponse<Evaluation>>(`${this.base}/evaluations`, dto);
  }

  updateEvaluation(id: string, dto: UpdateEvaluationDto): Observable<ApiResponse<Evaluation>> {
    return this.http.patch<ApiResponse<Evaluation>>(
      `${this.base}/evaluations/${id}`, dto
    );
  }

  deleteEvaluation(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/evaluations/${id}`);
  }

  cloturerEvaluation(id: string): Observable<ApiResponse<Evaluation>> {
    return this.http.patch<ApiResponse<Evaluation>>(
      `${this.base}/evaluations/${id}/cloturer`, {}
    );
  }

  getStatistiques(id: string): Observable<ApiResponse<StatistiquesEvaluation>> {
    return this.http.get<ApiResponse<StatistiquesEvaluation>>(
      `${this.base}/evaluations/${id}/statistiques`
    );
  }

  // ── Notes individuelles ──────────────────────────────────────────────────────

  getNotes(filters?: NoteFilters): Observable<PaginatedResponse<Note>> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params = params.set(k, String(v));
      });
    }
    return this.http.get<PaginatedResponse<Note>>(`${this.base}/notes`, { params });
  }

  getNotesByEvaluation(evaluationId: string): Observable<ApiResponse<Note[]>> {
    return this.http.get<ApiResponse<Note[]>>(
      `${this.base}/evaluations/${evaluationId}/notes`
    );
  }

  getNotesByApprenant(
    apprenantId: string,
    periodeId?: string,
    anneeId?: string
  ): Observable<ApiResponse<Note[]>> {
    let params = new HttpParams();
    if (periodeId) params = params.set('periodeId', periodeId);
    if (anneeId)   params = params.set('anneeAcademiqueId', anneeId);
    return this.http.get<ApiResponse<Note[]>>(
      `${this.base}/apprenants/${apprenantId}/notes`, { params }
    );
  }

  createNote(dto: CreateNoteDto): Observable<ApiResponse<Note>> {
    return this.http.post<ApiResponse<Note>>(`${this.base}/notes`, dto);
  }

  updateNote(id: string, dto: UpdateNoteDto): Observable<ApiResponse<Note>> {
    return this.http.patch<ApiResponse<Note>>(`${this.base}/notes/${id}`, dto);
  }

  // ── Saisie de masse ──────────────────────────────────────────────────────────

  saisirNotesMasse(dto: SaisieNoteMasse): Observable<ApiResponse<Note[]>> {
    return this.http.post<ApiResponse<Note[]>>(
      `${this.base}/notes/masse`, dto
    );
  }

  // ── Workflow notes ───────────────────────────────────────────────────────────

  soumettreNotes(evaluationId: string): Observable<ApiResponse<Evaluation>> {
    return this.http.patch<ApiResponse<Evaluation>>(
      `${this.base}/evaluations/${evaluationId}/soumettre`, {}
    );
  }

  validerNotes(dto: ValiderNotesDto): Observable<ApiResponse<Evaluation>> {
    return this.http.patch<ApiResponse<Evaluation>>(
      `${this.base}/evaluations/${dto.evaluationId}/valider`, dto
    );
  }

  publierNotes(dto: PublierNotesDto): Observable<ApiResponse<Evaluation>> {
    return this.http.patch<ApiResponse<Evaluation>>(
      `${this.base}/evaluations/${dto.evaluationId}/publier`, dto
    );
  }

  // ── Moyennes ─────────────────────────────────────────────────────────────────

  getMoyennesClasse(
    classeOuPromotionId: string,
    periodeId: string,
    type: 'classe' | 'promotion' = 'classe'
  ): Observable<ApiResponse<MoyenneGenerale[]>> {
    const params = new HttpParams()
      .set('periodeId', periodeId)
      .set('type', type);
    return this.http.get<ApiResponse<MoyenneGenerale[]>>(
      `${this.base}/moyennes/${classeOuPromotionId}`, { params }
    );
  }

  getMoyennesApprenant(
    apprenantId: string,
    anneeId: string
  ): Observable<ApiResponse<MoyenneGenerale>> {
    return this.http.get<ApiResponse<MoyenneGenerale>>(
      `${this.base}/apprenants/${apprenantId}/moyennes`,
      { params: new HttpParams().set('anneeAcademiqueId', anneeId) }
    );
  }

  calculerMoyennes(periodeId: string, classeId?: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.base}/moyennes/calculer`,
      { periodeId, classeId }
    );
  }

  getMoyennesUE(
    apprenantId: string,
    semestreId: string
  ): Observable<ApiResponse<MoyenneUE[]>> {
    return this.http.get<ApiResponse<MoyenneUE[]>>(
      `${this.base}/apprenants/${apprenantId}/moyennes-ue`,
      { params: new HttpParams().set('semestreId', semestreId) }
    );
  }

  // ── Appréciations ────────────────────────────────────────────────────────────

  saisirAppreciation(dto: ApprecierMatiereDto): Observable<ApiResponse<MoyenneMatiere>> {
    return this.http.patch<ApiResponse<MoyenneMatiere>>(
      `${this.base}/appreciations`, dto
    );
  }
}
