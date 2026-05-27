import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  SessionExamen, Epreuve, Convocation, PVExamen, CasFraude,
  CreateSessionDto, CreateEpreuveDto, GenererConvocationsDto,
  SessionFilters,
} from '../models/examen.models';
import { PaginatedResponse, ApiResponse } from '../models/etablissement.models';

@Injectable({ providedIn: 'root' })
export class ExamenApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}`;

  // ── Sessions ─────────────────────────────────────────────────────────────────

  getSessions(filters?: SessionFilters): Observable<PaginatedResponse<SessionExamen>> {
    let params = new HttpParams();
    if (filters) Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params = params.set(k, String(v));
    });
    return this.http.get<PaginatedResponse<SessionExamen>>(
      `${this.base}/sessions-examen`, { params }
    );
  }

  getSession(id: string): Observable<ApiResponse<SessionExamen>> {
    return this.http.get<ApiResponse<SessionExamen>>(
      `${this.base}/sessions-examen/${id}`
    );
  }

  createSession(dto: CreateSessionDto): Observable<ApiResponse<SessionExamen>> {
    return this.http.post<ApiResponse<SessionExamen>>(
      `${this.base}/sessions-examen`, dto
    );
  }

  updateSession(id: string, dto: Partial<CreateSessionDto>): Observable<ApiResponse<SessionExamen>> {
    return this.http.patch<ApiResponse<SessionExamen>>(
      `${this.base}/sessions-examen/${id}`, dto
    );
  }

  cloturerSession(id: string): Observable<ApiResponse<SessionExamen>> {
    return this.http.patch<ApiResponse<SessionExamen>>(
      `${this.base}/sessions-examen/${id}/cloturer`, {}
    );
  }

  // ── Épreuves ─────────────────────────────────────────────────────────────────

  getEpreuves(sessionId: string): Observable<ApiResponse<Epreuve[]>> {
    return this.http.get<ApiResponse<Epreuve[]>>(
      `${this.base}/sessions-examen/${sessionId}/epreuves`
    );
  }

  createEpreuve(dto: CreateEpreuveDto): Observable<ApiResponse<Epreuve>> {
    return this.http.post<ApiResponse<Epreuve>>(
      `${this.base}/epreuves`, dto
    );
  }

  updateEpreuve(id: string, dto: Partial<CreateEpreuveDto>): Observable<ApiResponse<Epreuve>> {
    return this.http.patch<ApiResponse<Epreuve>>(
      `${this.base}/epreuves/${id}`, dto
    );
  }

  deleteEpreuve(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/epreuves/${id}`);
  }

  // ── Convocations ──────────────────────────────────────────────────────────────

  genererConvocations(dto: GenererConvocationsDto): Observable<ApiResponse<{ count: number; convocations: Convocation[] }>> {
    return this.http.post<ApiResponse<{ count: number; convocations: Convocation[] }>>(
      `${this.base}/convocations/generer`, dto
    );
  }

  envoyerConvocations(epreuveId: string): Observable<ApiResponse<{ sent: number }>> {
    return this.http.post<ApiResponse<{ sent: number }>>(
      `${this.base}/convocations/envoyer`, { epreuveId }
    );
  }

  getConvocationsEpreuve(epreuveId: string): Observable<ApiResponse<Convocation[]>> {
    return this.http.get<ApiResponse<Convocation[]>>(
      `${this.base}/epreuves/${epreuveId}/convocations`
    );
  }

  telechargerConvocation(id: string): Observable<Blob> {
    return this.http.get(`${this.base}/convocations/${id}/pdf`, { responseType: 'blob' });
  }

  // ── PV ───────────────────────────────────────────────────────────────────────

  createPV(dto: { epreuveId: string; observations: string; cas: CasFraude[] }): Observable<ApiResponse<PVExamen>> {
    return this.http.post<ApiResponse<PVExamen>>(`${this.base}/pv-examen`, dto);
  }

  signerPV(id: string, signePar: string): Observable<ApiResponse<PVExamen>> {
    return this.http.patch<ApiResponse<PVExamen>>(
      `${this.base}/pv-examen/${id}/signer`, { signePar }
    );
  }
}

