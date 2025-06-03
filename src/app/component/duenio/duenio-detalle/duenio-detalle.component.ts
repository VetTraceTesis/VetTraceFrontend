import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DuenioService } from '../../../service/duenio.service';  // Importamos el servicio de Duenio
import { MascotaService } from '../../../service/mascota.service';  // Importamos el servicio de Duenio

import { Duenio } from '../../../model/duenio.model';  // Importamos el modelo de Duenio
import { CommonModule } from '@angular/common';  // Importamos CommonModule para usar *ngIf
import { FormsModule } from '@angular/forms';   // Importamos FormsModule para usar ngModel
import { MatSnackBar } from '@angular/material/snack-bar';  // Importamos MatSnackBar
import { Mascota } from '../../../model/mascota.model';
import { MatTabsModule } from '@angular/material/tabs';  // Importa el módulo de tabs
import { MatDialogModule } from '@angular/material/dialog';  // Importa MatDialogModule
import {DuenioMascotaComponent} from '../duenio-mascota/duenio-mascota.component'
import { MatDialog } from '@angular/material/dialog';  // Importar MatDialog

@Component({
  selector: 'app-duenio-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule,MatTabsModule,MatDialogModule],  // No necesitas MatSnackBarModule aquí
  templateUrl: './duenio-detalle.component.html',
  styleUrl: './duenio-detalle.component.css'
})
export class DuenioDetalleComponent implements OnInit {

  duenio: Duenio = {  // Inicializamos un dueño vacío para el registro
    id: 0,
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
    fechaCreacion: '',
    idestado: 1
  };
  mascotas: Mascota[] = [];  // Propiedad para almacenar las mascotas asociadas al dueño
  disableFields: boolean = false;
  showMascotas: boolean = false;  // Variable para controlar el desplegable de las mascotas
  selectedMascota: Mascota | null = null;  // Almacena la mascota seleccionada para ver su detalle

  constructor(
    private route: ActivatedRoute,
    private duenioService: DuenioService,
    private mascotaService: MascotaService,  
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog:MatDialog
  ) {}

  ngOnInit(): void {
    const duenioId = this.route.snapshot.paramMap.get('id');
    if (duenioId && duenioId !== 'nuevo') {
      this.getDuenioDetails(Number(duenioId));  // Si no es 'nuevo', obtenemos los detalles del dueño
      this.getMascotasByDuenioId(Number(duenioId));  // Obtenemos las mascotas asociadas al dueño
    }
  }
  // Método para abrir el modal
   // Método para abrir el modal para añadir una mascota
 openMascotaModal(): void {
  const duenioId = this.duenio.id;
  console.log("No llega", duenioId)
  // Verifica que duenioId esté disponible antes de abrir el modal
  if (duenioId) {
    const dialogRef = this.dialog.open(DuenioMascotaComponent, {
      data: { duenioId: duenioId }  // Pasa el duenioId al modal
    });

    // Después de que el modal se cierre, actualiza la lista de mascotas
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'nuevo') {
        this.getMascotasByDuenioId(Number(duenioId));  // Vuelve a obtener las mascotas
      }
    });
  } else {
    console.error('No se encontró el duenioId');
  }
}

 // Método para añadir nueva mascota (lógica para formulario)
  addNewMascota(): void {
    console.log('Añadir nueva mascota');  // Lógica para añadir mascota
    // Aquí puedes abrir el formulario para añadir una nueva mascota
  }

  // Método para referenciar una mascota existente (lógica para referenciar)
  referMascota(): void {
    console.log('Referenciar una mascota existente');  // Lógica para referenciar mascota
    // Aquí puedes abrir un formulario para referenciar una mascota existente
  }
  getDuenioDetails(id: number): void {
    this.duenioService.getDuenioById(id).subscribe(data => {
      this.duenio = data;
      if (data.fechaCreacion) {
        data.fechaCreacion = this.formatDate(data.fechaCreacion);
      }
    });
  }
  // Método para obtener las mascotas asociadas a este dueño
  getMascotasByDuenioId(duenioId: number): void {
    console.log("llega")
    this.mascotaService.getMascotasByDuenio(duenioId).subscribe(data => {
      this.mascotas = data;  // Asignamos las mascotas obtenidas
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
      // Si el dueño tiene id 0, es un nuevo dueño, hacemos un registro
      this.duenioService.addDuenio(this.duenio).subscribe(response => {
        console.log(response)
        this.duenio=response;
        console.log(this.duenio)
        console.log(this.duenio.id)

        this.snackBar.open('Dueño registrado correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['snack-bar-success']
        });
      });
    } else {
      // Si el dueño tiene id, actualizamos
      this.duenioService.updateDuenio(this.duenio).subscribe(response => {
        this.duenio=response;
        console.log(this.duenio.id)

        this.snackBar.open('Guardado correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['snack-bar-success']
        });
      });
    }

    console.log(this.duenio.id)
  }
 saveMascota(): void {
    if (this.selectedMascota) {
      // Llamamos al servicio para actualizar la mascota
      console.log(this.selectedMascota)
      this.mascotaService.updateMascota(this.selectedMascota).subscribe(
        (response) => {
          console.log('Mascota actualizada:', response);
          // Actualizamos la lista de mascotas después de guardar
          this.getMascotasByDuenioId(this.duenio.id);
        },
        (error) => {
          console.error('Error al actualizar la mascota:', error);
        }
      );
    }
  }

  // Método para mostrar los detalles de una mascota
  viewMascotaDetail(mascota: Mascota): void {
    this.selectedMascota = mascota;  // Asigna la mascota seleccionada
  }
  goBack(): void {
    this.router.navigate(['/duenio']);  // Regresa a la lista de dueños
  }
  // Método para volver a las tarjetas de mascotas
  goBackToCards(): void {
    this.selectedMascota = null;  // Reseteamos la mascota seleccionada
  }
  // Método para alternar entre habilitar y deshabilitar campos
  toggleDisable(): void {
    this.disableFields = !this.disableFields;  // Cambia el estado de disableFields

    // Actualiza el estado de la mascota (idEstado) dependiendo de si los campos están habilitados o no
    if (this.selectedMascota) {
      if (this.disableFields) {
        console.log("desactivado")
        this.selectedMascota.idEstado = 0;  // Si se desactiva, la mascota está inactiva (idEstado = 0)
      } else {
        this.selectedMascota.idEstado = 1;  // Si se activa, la mascota está activa (idEstado = 1)
      }
    }
     // Actualizar el idEstado de acuerdo con el estado de los campos
    if (this.duenio) {
      if (this.disableFields) {
        this.duenio.idestado = 0;  // Si se desactivan los campos, el dueño está inactivo
      } else {
        this.duenio.idestado = 1;  // Si se activan los campos, el dueño está activo
      }
    }
    
  }
   toggleMascotas(): void {
    this.showMascotas = !this.showMascotas;  // Cambia el estado de showMascotas
  }
}