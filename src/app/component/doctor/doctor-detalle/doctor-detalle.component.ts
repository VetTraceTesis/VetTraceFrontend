import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DoctorService } from '../../../service/doctor.service';
import { Doctor } from '../../../model/doctor.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { UsuarioService } from '../../../service/users.service';
import { Usuario } from '../../../model/usuarios.model';

@Component({
  selector: 'app-doctor-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './doctor-detalle.component.html',
  styleUrls: ['./doctor-detalle.component.css']
})
export class DoctorDetalleComponent implements OnInit {
  genero = ['Masculino', 'Femenino', 'No especifica'];
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  doctor: Doctor = {
    id: 0,
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    fecharegistro: '',
    cmvp: '',
    id_estado: 1,
    genero: '',
    rutaimagen: ''
  };
  disableFields: boolean = false;

  constructor(
    private doctorService: DoctorService,
    private usuarioService: UsuarioService,
    private router: Router,
    public dialogRef: MatDialogRef<DoctorDetalleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data?.doctor) {
      this.doctor = { ...this.data.doctor };
      if (this.doctor.fecharegistro) {
        this.doctor.fecharegistro = this.formatDate(this.doctor.fecharegistro);
      }
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
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  saveDoctor(): void {
    const crearDoctorYUsuario = () => {
      if (this.doctor.id === 0) {
        // Registro nuevo
        this.doctor.fecharegistro = this.getFechaHoy();
        this.doctor.id_estado = 1;

        this.doctorService.addDoctor(this.doctor).subscribe({
          next: () => {
            // Usamos this.doctor porque el backend no devuelve el objeto creado
            const nuevoUsuario: Usuario = {
              id: 0,
              enabled: true,
              veterinariaId: 1,
              roleId: 2,
              nombre: this.doctor.nombre,
              apellido: this.doctor.apellido,
              correo: this.doctor.email,
              telefono: this.doctor.telefono,
              username: (this.doctor.nombre + '.' + this.doctor.apellido).toLowerCase(),
              password: 'test1'
            };

            this.usuarioService.registrarUsuario(nuevoUsuario).subscribe({
              next: () => {
                Swal.fire({
                  title: '¡Doctor registrado!',
                  text: 'Doctor y credenciales creados correctamente',
                  icon: 'success',
                  confirmButtonText: 'Aceptar'
                });
                this.dialogRef.close(true);
              },
              error: (err) => {
                console.error('Error al crear usuario:', err);
                Swal.fire({
                  icon: 'error',
                  title: 'Error al crear credenciales',
                  text: err.message || 'No se pudieron crear las credenciales del doctor.'
                });
              }
            });
          },
          error: (err) => {
            console.error('Error al crear doctor:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo registrar al doctor.'
            });
          }
        });
      } else {
        // Edición
        this.doctorService.updateDoctor(this.doctor).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Guardado!',
              text: 'Guardado correctamente',
              confirmButtonText: 'Aceptar'
            });
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Error al actualizar doctor:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo actualizar el doctor.'
            });
          }
        });
      }
    };

    if (this.selectedFile) {
      this.doctorService.uploadImagenDoctor(this.selectedFile).subscribe({
        next: resp => {
          this.doctor.rutaimagen = resp.ruta;
          crearDoctorYUsuario();
        },
        error: err => {
          console.error('Error al subir imagen:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo subir la imagen'
          });
        }
      });
    } else {
      crearDoctorYUsuario();
    }
  }

  goBack(): void {
    this.dialogRef.close(false);
  }

  toggleDisable(): void {
    this.doctor.id_estado = this.doctor.id_estado === 1 ? 0 : 1;
    this.disableFields = !this.disableFields;
  }
}