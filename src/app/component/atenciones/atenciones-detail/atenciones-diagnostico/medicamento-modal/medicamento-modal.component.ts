import { Component, Inject } from '@angular/core';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Medicamento } from '../../../../../model/medicamento.model';

@Component({
  selector: 'app-medication-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './medicamento-modal.component.html',
  styleUrls: ['./medicamento-modal.component.css']
})
export class MedicamentoModalComponent /*implements OnInit*/ {
  medicamento!: Medicamento;

  constructor(
    private dialogRef: MatDialogRef<MedicamentoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idReceta: number }
  ) {}

  // El hook ngOnInit funciona sin necesidad de implementar explícitamente OnInit
  ngOnInit(): void {
    this.medicamento = {
      id: 0,
      cantidad: 0,
      indicacion: '',
      id_receta: this.data.idReceta
    };
  }

  guardar(): void {
    console.log(this.medicamento)
    this.dialogRef.close(this.medicamento);
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
