import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Bulletin, ReleverNotes, Deliberation, PVDeliberation,
  GenererBulletinsDto, GenererReleveDto,
  ValiderDocumentDto, SignerDocumentDto, PublierDocumentsDto,
  CreateDeliberationDto, UpdateDecisionDto, ApprecierBulletinDto,
  BulletinFilters, DeliberationFilters,
  StatsBulletins, StatsDeliberation,
} from '../models/bulletin.models';
import { PaginatedResponse, ApiResponse } from '../models/etablissement.models';

@Injectable({ providedIn: 'root' })
export class BulletinApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}`;

  // ── Bulletins scolaires ──────────────────────────────────────────────────────

  getBulletins(filters?: BulletinFilters): Observable<PaginatedResponse<Bulletin>> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params = params.set(k, String(v));
      });
    }
    return this.http.get<PaginatedResponse<Bulletin>>(
      `${this.base}/bulletins`, { params }
    );
  }

  getBulletin(id: string): Observable<ApiResponse<Bulletin>> {
    return this.http.get<ApiResponse<Bulletin>>(`${this.base}/bulletins/${id}`);
  }

  getBulletinApprenant(
    apprenantId: string,
    periodeId: string
  ): Observable<ApiResponse<Bulletin>> {
    return this.http.get<ApiResponse<Bulletin>>(
      `${this.base}/apprenants/${apprenantId}/bulletins/${periodeId}`
    );
  }

  genererBulletins(dto: GenererBulletinsDto): Observable<ApiResponse<{ count: number; bulletins: Bulletin[] }>> {
    return this.http.post<ApiResponse<{ count: number; bulletins: Bulletin[] }>>(
      `${this.base}/bulletins/generer`, dto
    );
  }

  validerBulletin(id: string, dto: ValiderDocumentDto): Observable<ApiResponse<Bulletin>> {
    return this.http.patch<ApiResponse<Bulletin>>(
      `${this.base}/bulletins/${id}/valider`, dto
    );
  }

  signerBulletin(id: string, dto: SignerDocumentDto): Observable<ApiResponse<Bulletin>> {
    return this.http.patch<ApiResponse<Bulletin>>(
      `${this.base}/bulletins/${id}/signer`, dto
    );
  }

  publierBulletins(dto: PublierDocumentsDto): Observable<ApiResponse<{ count: number }>> {
    return this.http.patch<ApiResponse<{ count: number }>>(
      `${this.base}/bulletins/publier`, dto
    );
  }

  telechargerBulletin(id: string): Observable<Blob> {
    return this.http.get(`${this.base}/bulletins/${id}/pdf`, {
      responseType: 'blob',
    });
  }

  apprecerBulletin(dto: ApprecierBulletinDto): Observable<ApiResponse<Bulletin>> {
    return this.http.patch<ApiResponse<Bulletin>>(
      `${this.base}/bulletins/appreciations`, dto
    );
  }

  getStatsBulletins(
    etablissementId?: string,
    periodeId?: string
  ): Observable<ApiResponse<StatsBulletins>> {
    let params = new HttpParams();
    if (etablissementId) params = params.set('etablissementId', etablissementId);
    if (periodeId) params = params.set('periodeId', periodeId);
    return this.http.get<ApiResponse<StatsBulletins>>(
      `${this.base}/bulletins/stats`, { params }
    );
  }

  // ── Relevés de notes universitaires ─────────────────────────────────────────

  getReleveApprenant(
    apprenantId: string,
    anneeId?: string,
    periodeId?: string
  ): Observable<ApiResponse<ReleverNotes[]>> {
    let params = new HttpParams();
    if (anneeId)   params = params.set('anneeAcademiqueId', anneeId);
    if (periodeId) params = params.set('periodeId', periodeId);
    return this.http.get<ApiResponse<ReleverNotes[]>>(
      `${this.base}/apprenants/${apprenantId}/releves`, { params }
    );
  }

  genererReleve(dto: GenererReleveDto): Observable<ApiResponse<ReleverNotes[]>> {
    return this.http.post<ApiResponse<ReleverNotes[]>>(
      `${this.base}/releves/generer`, dto
    );
  }

  validerReleve(id: string, dto: ValiderDocumentDto): Observable<ApiResponse<ReleverNotes>> {
    return this.http.patch<ApiResponse<ReleverNotes>>(
      `${this.base}/releves/${id}/valider`, dto
    );
  }

  signerReleve(id: string, dto: SignerDocumentDto): Observable<ApiResponse<ReleverNotes>> {
    return this.http.patch<ApiResponse<ReleverNotes>>(
      `${this.base}/releves/${id}/signer`, dto
    );
  }

  publierReleve(id: string): Observable<ApiResponse<ReleverNotes>> {
    return this.http.patch<ApiResponse<ReleverNotes>>(
      `${this.base}/releves/${id}/publier`, {}
    );
  }

  telechargerReleve(id: string): Observable<Blob> {
    return this.http.get(`${this.base}/releves/${id}/pdf`, {
      responseType: 'blob',
    });
  }

  // ── Délibérations ────────────────────────────────────────────────────────────

  getDeliberations(filters?: DeliberationFilters): Observable<PaginatedResponse<Deliberation>> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params = params.set(k, String(v));
      });
    }
    return this.http.get<PaginatedResponse<Deliberation>>(
      `${this.base}/deliberations`, { params }
    );
  }

  getDeliberation(id: string): Observable<ApiResponse<Deliberation>> {
    return this.http.get<ApiResponse<Deliberation>>(`${this.base}/deliberations/${id}`);
  }

  createDeliberation(dto: CreateDeliberationDto): Observable<ApiResponse<Deliberation>> {
    return this.http.post<ApiResponse<Deliberation>>(
      `${this.base}/deliberations`, dto
    );
  }

  preparerDeliberation(id: string): Observable<ApiResponse<Deliberation>> {
    return this.http.patch<ApiResponse<Deliberation>>(
      `${this.base}/deliberations/${id}/preparer`, {}
    );
  }

  appliquerCompensation(id: string): Observable<ApiResponse<Deliberation>> {
    return this.http.patch<ApiResponse<Deliberation>>(
      `${this.base}/deliberations/${id}/compenser`, {}
    );
  }

  updateDecision(id: string, dto: UpdateDecisionDto): Observable<ApiResponse<Deliberation>> {
    return this.http.patch<ApiResponse<Deliberation>>(
      `${this.base}/deliberations/${id}/decision`, dto
    );
  }

  cloturerDeliberation(id: string): Observable<ApiResponse<Deliberation>> {
    return this.http.patch<ApiResponse<Deliberation>>(
      `${this.base}/deliberations/${id}/cloturer`, {}
    );
  }

  signerDeliberation(id: string, dto: SignerDocumentDto): Observable<ApiResponse<Deliberation>> {
    return this.http.patch<ApiResponse<Deliberation>>(
      `${this.base}/deliberations/${id}/signer`, dto
    );
  }

  publierDeliberation(id: string): Observable<ApiResponse<Deliberation>> {
    return this.http.patch<ApiResponse<Deliberation>>(
      `${this.base}/deliberations/${id}/publier`, {}
    );
  }

  genererPV(id: string): Observable<ApiResponse<PVDeliberation>> {
    return this.http.post<ApiResponse<PVDeliberation>>(
      `${this.base}/deliberations/${id}/pv`, {}
    );
  }

  telechargerPV(id: string): Observable<Blob> {
    return this.http.get(`${this.base}/deliberations/${id}/pv/pdf`, {
      responseType: 'blob',
    });
  }

  getStatsDeliberation(id: string): Observable<ApiResponse<StatsDeliberation>> {
    return this.http.get<ApiResponse<StatsDeliberation>>(
      `${this.base}/deliberations/${id}/stats`
    );
  }
}
