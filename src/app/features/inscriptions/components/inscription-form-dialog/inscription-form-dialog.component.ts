import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EtablissementStateService } from '../../../etablissements/services/etablissement-state.service';
import { ApprenantStateService } from '../../../apprenants/services/apprenant-state.service';
import { InscriptionStateService } from '../../services/inscription-state.service';

@Component({
  selector: 'app-inscription-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDatepickerModule,
    MatNativeDateModule, MatStepperModule, MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './inscription-form-dialog.component.html',
  styleUrl: './inscription-form-dialog.component.scss'
})
export class InscriptionFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  readonly dialogRef         = inject(MatDialogRef<InscriptionFormDialogComponent>);
  readonly data: { type: 'nouvelle' | 'reinscription' } = inject(MAT_DIALOG_DATA);
  readonly etablissementState = inject(EtablissementStateService);
  readonly apprenantState     = inject(ApprenantStateService);
  readonly inscriptionState   = inject(InscriptionStateService);

  apprenantSelectionne: any = null;
  etablissementSelectionne = '';
  anneeSelectionnee        = '';

  apprenantForm = this.fb.group({
    search:      [''],
    apprenantId: ['', Validators.required],
  });

  anneeForm = this.fb.group({
    etablissementId:    ['', Validators.required],
    anneeAcademiqueId:  ['', Validators.required],
    commentaire:        [''],
  });

  ngOnInit(): void {
    this.etablissementState.loadEtablissements();
  }

  onSearchApprenant(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value.length >= 2) {
      this.apprenantState.load({ search: value, limit: 10 });
    }
  }

  selectApprenant(id: string): void {
    this.apprenantForm.patchValue({ apprenantId: id });
    this.apprenantSelectionne = this.apprenantState.apprenants().find((a: any) => a.id === id);
    if (this.data.type === 'reinscription') {
      const anneeId = this.anneeForm.get('anneeAcademiqueId')?.value;
      if (anneeId) {
        this.inscriptionState.verifierEligibilite(id, anneeId);
      }
    }
  }

  onEtablissementChange(id: string): void {
    this.etablissementState.loadAnneesAcademiques(id);
    this.etablissementSelectionne =
      this.etablissementState.etablissements().find(e => e.id === id)?.nom ?? '';
  }

  submit(): void {
    if (!this.apprenantForm.get('apprenantId')?.value) return;
    this.dialogRef.close({
      apprenantId:        this.apprenantForm.value.apprenantId,
      etablissementId:    this.anneeForm.value.etablissementId,
      anneeAcademiqueId:  this.anneeForm.value.anneeAcademiqueId,
      type:               this.data.type,
      commentaire:        this.anneeForm.value.commentaire || undefined,
    });
  }
}
