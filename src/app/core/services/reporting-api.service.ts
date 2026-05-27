import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TableauBordDirection, RapportPedagogique, RapportAbsenteisme,
  RapportFinancier, IndicateursTempsReel,
  FiltresRapport, ExporterRapportDto,
} from '../models/reporting.models';
import { ApiResponse } from '../models/etablissement.models';

@Injectable({ providedIn: 'root' })
export class ReportingApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}`;

  private toParams(filtres: Partial<FiltresRapport>): HttpParams {
    let params = new HttpParams();
    Object.entries(filtres).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params = params.set(k, String(v));
    });
    return params;
  }

  // Tableau de bord
  getTableauBord(filtres: FiltresRapport): Observable<ApiResponse<TableauBordDirection>> {
    return this.http.get<ApiResponse<TableauBordDirection>>(
      `${this.base}/reporting/tableau-bord`,
      { params: this.toParams(filtres) }
    );
  }

  // Indicateurs temps réel
  getIndicateursTempsReel(etablissementId: string): Observable<ApiResponse<IndicateursTempsReel>> {
    return this.http.get<ApiResponse<IndicateursTempsReel>>(
      `${this.base}/reporting/temps-reel`,
      { params: new HttpParams().set('etablissementId', etablissementId) }
    );
  }

  // Rapports pédagogiques
  getRapportClasse(filtres: FiltresRapport): Observable<ApiResponse<RapportPedagogique>> {
    return this.http.get<ApiResponse<RapportPedagogique>>(
      `${this.base}/reporting/pedagogique`,
      { params: this.toParams(filtres) }
    );
  }

  getRapportEnseignant(enseignantId: string, filtres: FiltresRapport): Observable<ApiResponse<RapportPedagogique>> {
    return this.http.get<ApiResponse<RapportPedagogique>>(
      `${this.base}/reporting/enseignant/${enseignantId}`,
      { params: this.toParams(filtres) }
    );
  }

  // Rapport absentéisme
  getRapportAbsenteisme(filtres: FiltresRapport): Observable<ApiResponse<RapportAbsenteisme>> {
    return this.http.get<ApiResponse<RapportAbsenteisme>>(
      `${this.base}/reporting/absenteisme`,
      { params: this.toParams(filtres) }
    );
  }

  // Rapport financier
  getRapportFinancier(filtres: FiltresRapport): Observable<ApiResponse<RapportFinancier>> {
    return this.http.get<ApiResponse<RapportFinancier>>(
      `${this.base}/reporting/financier`,
      { params: this.toParams(filtres) }
    );
  }

  // Export
  exporterRapport(dto: ExporterRapportDto): Observable<Blob> {
    const params = this.toParams(dto);
    return this.http.get(
      `${this.base}/reporting/export`,
      { responseType: 'blob', params }
    );
  }
}
