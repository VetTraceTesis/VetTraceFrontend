// duenio-mascota.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MascotaService } from '../../../service/mascota.service';
import { Mascota } from '../../../model/mascota.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {
  DateAdapter,
  NativeDateAdapter,
  MAT_DATE_FORMATS,
  MAT_NATIVE_DATE_FORMATS,
  MAT_DATE_LOCALE
} from '@angular/material/core';

@Component({
  selector: 'app-duenio-mascota',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' }
  ],
  templateUrl: './duenio-mascota.component.html',
  styleUrls: ['./duenio-mascota.component.css']
})
export class DuenioMascotaComponent {
  especiesComunes: string[] = ['Perro', 'Gato', 'Conejo', 'Ave', 'Hámster'];
  showForm: boolean = true;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  renamedFileName: string = '';

  newMascota: Mascota = {
    idPaciente: 0,
    nombre: '',
    edad: 0,
    especie: '',
    fecharegistro: '',
    duenioId: 0,
    idEstado: 1,
    rutaimagen: ''
  };

  constructor(
    public dialogRef: MatDialogRef<DuenioMascotaComponent>,
    private mascotaService: MascotaService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data.duenioId) {
      this.newMascota.duenioId = this.data.duenioId;
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = e => this.previewUrl = reader.result;
    reader.readAsDataURL(file);
  }

  submitForm(): void {
    const guardarMascota = () => {
      this.mascotaService.addMascota(this.newMascota).subscribe(
        response => {
          console.log('Mascota registrada:', response);
          this.dialogRef.close('nuevo');
        },
        error => console.error('Error al agregar la mascota:', error)
      );
    };

    if (this.selectedFile) {
      this.mascotaService.uploadImagenDoctor(this.selectedFile).subscribe(resp => {
        this.newMascota.rutaimagen = resp.ruta; // Asignar ruta generada por el backend
        guardarMascota();
      }, error => {
        console.error('Error al subir imagen:', error);
        alert('Error al subir imagen');
      });
    } else {
      guardarMascota();
    }
  }

  addNewMascota(): void {
    this.showForm = true;
  }

  referMascota(): void {
    this.dialogRef.close('referenciar');
  }
}