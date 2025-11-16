  // src/app/component/duenio/duenio-mascota/duenio-mascota.component.ts

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
  import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker'; // Importar MatDatepickerInputEvent
  import { MatNativeDateModule } from '@angular/material/core';
  import {
    DateAdapter,
    NativeDateAdapter,
    MAT_DATE_FORMATS,
    MAT_NATIVE_DATE_FORMATS,
    MAT_DATE_LOCALE
  } from '@angular/material/core';
  import Swal from 'sweetalert2'; // Asegúrate de tener SweetAlert2 instalado

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
    mascotasExistentes: Mascota[] = [];

    // Nueva propiedad para controlar la visualización del error de fecha futura
    showFechaFuturaError: boolean = false;

    constructor(
      public dialogRef: MatDialogRef<DuenioMascotaComponent>,
      private mascotaService: MascotaService,
      @Inject(MAT_DIALOG_DATA) public  data:any
    ) {
      if (this.data.duenioId) {
        this.newMascota.duenioId = this.data.duenioId;
        this.mascotasExistentes = this.data.mascotasExistentes || []; // Asegurar array vacío si no existe
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

    // Nuevo: Método para manejar el cambio de fecha y validar si es futura
    // Recibe el evento del datepicker
    onFechaNacimientoChange(event: MatDatepickerInputEvent<Date>): void {
      // Extraer la fecha del evento
      const selectedDate = event.value; // Esto debería ser un objeto Date o null

      // Convertir a string en formato YYYY-MM-DD si es una fecha válida, sino dejar vacío
      if (selectedDate && selectedDate instanceof Date) {
        // Verificar si la fecha es válida (no es Invalid Date)
        if (isNaN(selectedDate.getTime())) {
          this.newMascota.fecharegistro = '';
        } else {
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
          const day = String(selectedDate.getDate()).padStart(2, '0');
          this.newMascota.fecharegistro = `${year}-${month}-${day}`;
        }
      } else {
        this.newMascota.fecharegistro = '';
      }

      // Actualizar la variable que controla el mensaje de error en el HTML
      this.showFechaFuturaError = this.isDateInFuture(this.newMascota.fecharegistro);

      // Mostrar alerta de SweetAlert2 si la fecha es futura
      if (this.showFechaFuturaError) {
          Swal.fire({
              title: 'Error',
              text: 'La fecha de nacimiento no puede ser futura.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
          });
          // Opcional: Limpiar el campo de fecha si se desea
          // this.newMascota.fecharegistro = '';
          // this.showFechaFuturaError = false; // Si limpias la fecha, el error ya no aplica
      }
    }


    // Nuevo: Método para validar si la fecha es futura
    isDateInFuture(dateString: string): boolean {
      if (!dateString) return false; // Si no hay fecha, no es futura
      const fechaNacimiento = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Resetear hora para comparar solo fechas
      return fechaNacimiento > today;
    }

    // Verificar si una mascota ya existe (por nombre) para el dueño actual
    private mascotaYaExiste(nombre: string): boolean {
      // Comparar ignorando mayúsculas/minúsculas
      return this.mascotasExistentes.some(m => m.nombre.toLowerCase() === nombre.toLowerCase());
    }

    submitForm(): void {
      // Validar fecha futura antes de intentar guardar (por si acaso)
      this.showFechaFuturaError = this.isDateInFuture(this.newMascota.fecharegistro);

      // Si hay error de fecha futura (aunque debería estar deshabilitado el botón), mostrar alerta y detener
      if (this.showFechaFuturaError) {
        // Esta alerta solo debería aparecer si el usuario manipuló el HTML para habilitar el botón
        Swal.fire({
          title: 'Error',
          text: 'La fecha de nacimiento no puede ser futura.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        return; // Detener el guardado
      }

      // --- Validación de Duplicado ---
      if (this.mascotaYaExiste(this.newMascota.nombre)) {
        // Limpiar el error de fecha futura si es que estaba activo
        this.showFechaFuturaError = false;
        Swal.fire({
          title: 'Mascota duplicada',
          text: `Ya existe una mascota con el nombre "${this.newMascota.nombre}" para este dueño.`,
          icon: 'warning', // 'warning' es apropiado para duplicados
          confirmButtonText: 'Aceptar'
        });
        return; // Detener el guardado
      }
      // --- Fin Validación de Duplicado ---

      // --- Validación de Especie ---
      if (!this.especiesComunes.includes(this.newMascota.especie)) {
        // Limpiar el error de fecha futura si es que estaba activo
        this.showFechaFuturaError = false;
        Swal.fire({
          title: 'Error',
          text: 'La especie ingresada no es válida. Por favor, seleccione una de las opciones disponibles.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        return; // Detener el guardado
      }
      // --- Fin Validación de Especie ---

      // --- Validación de Edad (Opcional, pero buena práctica si es negocio) ---
      if (this.newMascota.edad < 0 || this.newMascota.edad > 30) {
        // Limpiar el error de fecha futura si es que estaba activo
        this.showFechaFuturaError = false;
        Swal.fire({
          title: 'Error',
          text: 'La edad debe ser un número entre 0 y 30 años.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        return; // Detener el guardado
      }
      // --- Fin Validación de Edad ---

      const guardarMascota = () => {
        // Limpiar el error de fecha futura antes de guardar (por si acaso)
        this.showFechaFuturaError = false;
        this.mascotaService.addMascota(this.newMascota).subscribe(
          response => {
            console.log('Mascota registrada:', response);
            this.dialogRef.close('nuevo');
          },
          error => {
            console.error('Error al agregar la mascota:', error);
            // Opcional: Mostrar mensaje de error al usuario
            Swal.fire({
              title: 'Error',
              text: 'Hubo un problema al registrar la mascota.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          }
        );
      };

      if (this.selectedFile) {
        this.mascotaService.uploadImagenDoctor(this.selectedFile).subscribe(resp => {
          this.newMascota.rutaimagen = resp.ruta; // Asignar ruta generada por el backend
          guardarMascota();
        }, error => {
          console.error('Error al subir imagen:', error);
          // Opcional: Mostrar mensaje de error al usuario
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al subir la imagen.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
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