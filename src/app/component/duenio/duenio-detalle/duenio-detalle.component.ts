import { Component, Inject, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DuenioService } from '../../../service/duenio.service';  
import { MascotaService } from '../../../service/mascota.service';  
import { Duenio } from '../../../model/duenio.model';  
import { CommonModule } from '@angular/common';  
import { FormsModule } from '@angular/forms';   
import { MatSnackBar } from '@angular/material/snack-bar';  
import { Mascota } from '../../../model/mascota.model';
import { MatTabsModule } from '@angular/material/tabs';  
import { MatDialogModule } from '@angular/material/dialog';  
import { DuenioMascotaComponent } from '../duenio-mascota/duenio-mascota.component';
import { MatDialog } from '@angular/material/dialog';  
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';  
import { EventEmitter } from '@angular/core';
import Swal from 'sweetalert2';  // Importamos SweetAlert2 para alertas

@Component({
  selector: 'app-duenio-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTabsModule, MatDialogModule],  
  templateUrl: './duenio-detalle.component.html',
  styleUrls: ['./duenio-detalle.component.css']
})
export class DuenioDetalleComponent implements OnInit {

  duenio: Duenio = {  
    id: 0,
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
    fechaCreacion: '',
    idestado: 1
  };
  mascotas: Mascota[] = [];  
  disableFields: boolean = false;
  showMascotas: boolean = false;  
  selectedMascota: Mascota | null = null;  
  @Output() duenioActualizado: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private route: ActivatedRoute,
    private duenioService: DuenioService,
    private mascotaService: MascotaService,  
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DuenioDetalleComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any 
  ) {}

  ngOnInit(): void {
    if (this.data.duenio.id !== 0) {
      this.getDuenioDetails(this.data.duenio.id);
      this.getMascotasByDuenioId(this.data.duenio.id);
    }
  }

  openMascotaModal(): void {
    const duenioId = this.duenio.id;
    if (duenioId) {
      const dialogRef = this.dialog.open(DuenioMascotaComponent, {
        width: '60vw',
        maxWidth: '800px',
        minWidth: '350px',
        data: { duenioId: duenioId }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === 'nuevo') {
          this.getMascotasByDuenioId(Number(duenioId));
        }
      });
    } else {
      console.error('No se encontró el duenioId');
    }
  }

  addNewMascota(): void {
    console.log('Añadir nueva mascota');
  }

  referMascota(): void {
    console.log('Referenciar una mascota existente');
  }

  getDuenioDetails(id: number): void {
    this.duenioService.getDuenioById(id).subscribe(data => {
      this.duenio = data;
      if (data.fechaCreacion) {
        data.fechaCreacion = this.formatDate(data.fechaCreacion);
      }
    });
  }

  getMascotasByDuenioId(duenioId: number): void {
    this.mascotaService.getMascotasByDuenio(duenioId).subscribe(data => {
      this.mascotas = data;  
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  saveDuenio(): void {
    if (this.duenio.id === 0) {
      this.duenioService.addDuenio(this.duenio).subscribe(response => {
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
                this.dialogRef.close(true);  // Cierra el modal y devuelve true
      });
    } else {
      this.duenioService.updateDuenio(this.duenio).subscribe(response => {
       Swal.fire({
                icon: 'success',
                title: '¡Guardado!',
                text: 'Guardado correctamente',
                confirmButtonColor: '#416785'
              });
              this.dialogRef.close(true);  // Cierra el modal y devuelve true
      });
    }
  }


saveMascota(): void {
  if (this.selectedMascota) {
    this.mascotaService.updateMascota(this.selectedMascota).subscribe(
      (response) => {
        Swal.fire({
          title: '¡Guardado!',
          text: 'La mascota ha sido actualizada correctamente',
          icon: 'success',
          confirmButtonColor: '#416785',
          confirmButtonText: 'Aceptar',
          customClass: {
            popup: 'swal2-border-radius'
          }
        });
        this.getMascotasByDuenioId(this.duenio.id);
      },
      (error) => {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al actualizar la mascota',
          icon: 'error',
          confirmButtonColor: '#e74c3c',
          confirmButtonText: 'Aceptar',
          customClass: {
            popup: 'swal2-border-radius'
          }
        });
        console.error('Error al actualizar la mascota:', error);
      }
    );
  }
}
  viewMascotaDetail(mascota: Mascota): void {
    this.selectedMascota = mascota;
  }

  goBack(): void {
    this.router.navigate(['/duenio']);
  }

  goBackToCards(): void {
    this.selectedMascota = null;
  }

  toggleDisable(): void {
    this.disableFields = !this.disableFields;

    if (this.selectedMascota) {
      if (this.disableFields) {
        this.selectedMascota.idEstado = 0;
      } else {
        this.selectedMascota.idEstado = 1;
      }
    }

    if (this.duenio) {
      if (this.disableFields) {
        this.duenio.idestado = 0;
      } else {
        this.duenio.idestado = 1;
      }
    }
  }

  toggleMascotas(): void {
    this.showMascotas = !this.showMascotas;
  }
}
