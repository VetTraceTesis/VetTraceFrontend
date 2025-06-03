import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from '../../../service/doctor.service';
import { Doctor } from '../../../model/doctor.model';  // Importamos el modelo
import { CommonModule } from '@angular/common';  // Importamos CommonModule para usar *ngIf
import { FormsModule } from '@angular/forms';   // Importamos FormsModule para usar ngModel
import { MatSnackBar } from '@angular/material/snack-bar';  // Importamos MatSnackBar

@Component({
  selector: 'app-doctor-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],  // No necesitas MatSnackBarModule aquí
  templateUrl: './doctor-detalle.component.html',
  styleUrls: ['./doctor-detalle.component.css']
})
export class DoctorDetalleComponent implements OnInit {

  doctor: Doctor = {  // Inicializamos un doctor vacío para el registro
    id: 0,
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    fecharegistro: '',
    cmvp: '',
    id_estado: 1
  };
  disableFields: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private doctorService: DoctorService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const doctorId = this.route.snapshot.paramMap.get('id');
    if (doctorId && doctorId !== 'nuevo') {
      this.getDoctorDetails(Number(doctorId));  // Si no es 'nuevo', obtenemos los detalles del doctor
    }
  }

  getDoctorDetails(id: number): void {
    this.doctorService.getDoctorById(id).subscribe(data => {
      this.doctor = data;
      if (data.fecharegistro) {
        data.fecharegistro = this.formatDate(data.fecharegistro);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  saveDoctor(): void {
    if (this.doctor.id === 0) {
      // Si el doctor tiene id 0, es un nuevo doctor, hacemos un registro
      this.doctorService.addDoctor(this.doctor).subscribe(response => {
        this.snackBar.open('Doctor registrado correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['snack-bar-success']
        });
        this.router.navigate(['/doctor']);
      });
    } else {
      // Si el doctor tiene id, actualizamos
      this.doctorService.updateDoctor(this.doctor).subscribe(response => {
        this.snackBar.open('Guardado correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['snack-bar-success']
        });
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/doctor']);  // Regresa a la lista de doctores
  }
    // Método para alternar entre habilitar y deshabilitar campos
    toggleDisable(): void {
      this.disableFields = !this.disableFields;  // Cambia el estado de disableFields
    }
}
