import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DoctorService } from '../../../service/doctor.service';
import { Doctor } from '../../../model/doctor.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';  // Importamos SweetAlert2 para alertas
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-doctor-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule, MatFormFieldModule,MatInputModule,MatButtonModule],  // No necesitas MatSnackBarModule aquí
  templateUrl: './doctor-detalle.component.html',
  styleUrls: ['./doctor-detalle.component.css']
})
export class DoctorDetalleComponent implements OnInit {
  genero = ['Masculino', 'Femenino', 'No especifica'];

  doctor: Doctor = {  // Inicializamos un doctor vacío para el registro
    id: 0,
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    fecharegistro: '',
    cmvp: '',
    id_estado: 1,
    genero: '',
  };
  disableFields: boolean = false;

  constructor(
    private doctorService: DoctorService,
    private router: Router,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<DoctorDetalleComponent>, // Para cerrar el modal
    @Inject(MAT_DIALOG_DATA) public data: any // Recibe los datos del doctor
  ) { }

  ngOnInit(): void {
    // Si el doctor tiene un id, asignamos los valores al formulario
    if (this.data.doctor) {
      this.doctor = this.data.doctor;
      if (this.doctor.fecharegistro) {
        this.doctor.fecharegistro = this.formatDate(this.doctor.fecharegistro);
      }
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  private getFechaHoy(): string {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm   = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd   = String(hoy.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  saveDoctor(): void {
    if (this.doctor.id === 0) {
      // Nuevo doctor
      this.doctor.fecharegistro = this.getFechaHoy();
      this.doctor.id_estado = 1; // ⬅️ Forzamos el valor por defecto
      this.doctorService.addDoctor(this.doctor).subscribe(response => {
        Swal.fire({
          title: '¡Doctor registrado!',
          text: 'Doctor registrado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.dialogRef.close(true);  // Cierra el modal y devuelve true
      });
    } else {
      // Actualizar doctor
      this.doctorService.updateDoctor(this.doctor).subscribe(response => {
        Swal.fire({
          icon: 'success',
          title: '¡Guardado!',
          text: 'Guardado correctamente',
          confirmButtonText: 'Aceptar'
        });
        this.dialogRef.close(true);  // Cierra el modal y devuelve true
      });
    }
  }

  goBack(): void {
    this.dialogRef.close(false);  // Cierra el modal y no hace nada
  }

  // Método para alternar entre habilitar y deshabilitar campos
  toggleDisable(): void {
    this.doctor.id_estado = this.doctor.id_estado === 1 ? 0 : 1;
    this.disableFields = !this.disableFields;  // Cambia el estado de disableFields
  }
}
