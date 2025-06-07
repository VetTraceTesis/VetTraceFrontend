import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from '../../../service/doctor.service';
import { Doctor } from '../../../model/doctor.model';  // Importamos el modelo
import { CommonModule } from '@angular/common';  // Importamos CommonModule para usar *ngIf
import { FormsModule } from '@angular/forms';   // Importamos FormsModule para usar ngModel
import { MatSnackBar } from '@angular/material/snack-bar';  // Importamos MatSnackBar
import Swal from 'sweetalert2';  // Importamos SweetAlert2 para alertas


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
  ) { }

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
      // Nuevo doctor
      this.doctorService.addDoctor(this.doctor).subscribe(response => {
        Swal.fire({
          title: '¡Doctor registrado!',
          text: 'Doctor registrado correctamente',
          icon: 'success',
          background: '#f8fafd',
          color: '#416785',
          iconColor: '#4bb543',
          confirmButtonColor: '#416785',
          confirmButtonText: 'Aceptar',
          customClass: {
            popup: 'swal2-border-radius'
          },
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          }
        });
        this.router.navigate(['/doctor']);
      });
    } else {
      // Actualizar doctor
      this.doctorService.updateDoctor(this.doctor).subscribe(response => {
        Swal.fire({
          icon: 'success',
          title: '¡Guardado!',
          text: 'Guardado correctamente',
          confirmButtonColor: '#416785'
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
