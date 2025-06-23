// src/app/components/farmacia/farmacia-detalle/farmacia-detalle.component.ts

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Medicamento } from '../../../model/farmacia-productos.model';

@Component({
  selector: 'app-farmacia-detalle',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './farmacia-detalle.component.html',
  styleUrls: ['./farmacia-detalle.component.css']
})
export class FarmaciaDetalleComponent {
  // esperamos data en la forma { medicamentos: Medicamento }
  constructor(
    private dialogRef: MatDialogRef<FarmaciaDetalleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { medicamentos: Medicamento }
  ) {}

  get item(): Medicamento {
    return this.data.medicamentos;
  }

  getImageUrl(imageFile: string): string {
    const normalized = imageFile.replace(/\\/g, '/');
    const filename = normalized.split('/').pop();
    return `pharmivet_images/${filename}`;
  }

  close(): void {
    this.dialogRef.close();
  }
}
