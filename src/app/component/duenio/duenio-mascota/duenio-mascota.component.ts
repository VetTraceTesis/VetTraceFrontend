import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';  // Importar MatDialog
import {MatDialogModule} from '@angular/material/dialog';
import { MascotaService } from '../../../service/mascota.service';  // Importa el servicio Mascota
import { Mascota } from '../../../model/mascota.model';  // Importa el modelo de Mascota
import { FormsModule } from '@angular/forms';  // Importamos FormsModule
import { CommonModule } from '@angular/common';  // Importar CommonModule para usar ngIf

@Component({
  selector: 'app-duenio-mascota',
  standalone: true,
  imports: [MatDialogModule,FormsModule,CommonModule],  // Asegúrate de importar MatDialog directamente en la propiedad imports
  templateUrl: './duenio-mascota.component.html',
  styleUrls: ['./duenio-mascota.component.css']
})
export class DuenioMascotaComponent {

   showForm: boolean = false;  // Determina si se debe mostrar el formulario
  newMascota: Mascota = {  // Objeto para almacenar los datos de la nueva mascota
    idPaciente: 0,
    nombre: '',
    edad: 0,
    especie: '',
    fecharegistro: '',
    duenioId: 0,  // Asignar el dueñoId según el contexto
    idEstado: 1
  };

  constructor(
    public dialogRef: MatDialogRef<DuenioMascotaComponent>,
    private mascotaService: MascotaService,  // Inyectamos el servicio Mascota
    @Inject(MAT_DIALOG_DATA) public data: any  // Recibe el data (duenioId) pasado desde el modal

  ) {  // Asignamos el duenioId que se pasa desde el componente que abre el modal
    if (this.data.duenioId) {
      this.newMascota.duenioId = this.data.duenioId;  // Establece el duenioId de la nueva mascota
    }}

  // Método para mostrar el formulario de "Añadir nueva mascota"
  addNewMascota(): void {
    this.showForm = true;  // Muestra el formulario para agregar una nueva mascota
  }

  // Método para referenciar una mascota existente
  referMascota(): void {
    this.dialogRef.close('referenciar');
  }

  // Método para manejar el envío del formulario y registrar la nueva mascota
  submitForm(): void {
    // Llamamos al servicio para agregar la nueva mascota
    this.mascotaService.addMascota(this.newMascota).subscribe(
      (response) => {
        console.log('Mascota registrada:', response);
        this.dialogRef.close('nuevo');  // Cerrar el modal después de agregar la mascota
      },
      (error) => {
        console.error('Error al agregar la mascota:', error);
      }
    );
  }
}
