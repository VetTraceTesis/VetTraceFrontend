// src/app/components/duenio/duenio-detalle/duenio-detalle.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DuenioService } from '../../../service/duenio.service';  
import { MascotaService } from '../../../service/mascota.service';  
import { Duenio } from '../../../model/duenio.model';  
import { Mascota } from '../../../model/mascota.model';
import { CommonModule } from '@angular/common';  
import { FormsModule } from '@angular/forms';   
import { MatSnackBarModule } from '@angular/material/snack-bar';  
import { MatTabsModule } from '@angular/material/tabs';  
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';  
import { DuenioMascotaComponent } from '../duenio-mascota/duenio-mascota.component';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DateAdapter, NativeDateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

@Component({
  selector: 'app-duenio-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' }
  ],
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
    idestado: 1,
    distrito: '',
    genero: ''
  };

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  renamedFileName: string = '';
  dueniodata: Duenio[] = []; // Esta propiedad ahora se usará para almacenar TODOS los dueños
  mascotas: Mascota[] = [];  
  disableFields: boolean = false;
  showMascotas: boolean = false;  
  selectedMascota: Mascota | null = null;  

  // Nueva propiedad para controlar la pestaña de mascotas
  isOwnerSaved: boolean = false;

  genero = ['Masculino', 'Femenino', 'No especifica'];
  distritos: string[] = [
    'Ancón', 'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo', 'Chorrillos', 'Cieneguilla', 'Comas',
    'El Agustino', 'Independencia', 'Jesús María', 'La Molina', 'La Victoria', 'Lima', 'Lince',
    'Los Olivos', 'Lurigancho-Chosica', 'Lurín', 'Magdalena del Mar', 'Miraflores', 'Pachacamac',
    'Pucusana', 'Pueblo Libre', 'Puente Piedra', 'Punta Hermosa', 'Punta Negra', 'Rímac',
    'San Bartolo', 'San Borja', 'San Isidro', 'San Juan de Lurigancho', 'San Juan de Miraflores',
    'San Luis', 'San Martín de Porres', 'San Miguel', 'Santa Anita', 'Santa María del Mar', 'Santa Rosa',
    'Santiago de Surco', 'Surquillo', 'Villa El Salvador', 'Villa María del Triunfo'
  ];
  especiesValidas = ['Perro', 'Gato', 'Conejo', 'Hamster', 'Pájaro', 'Tortuga', 'Pez', 'Otros'];

  filteredDistricts: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private duenioService: DuenioService,
    private mascotaService: MascotaService,  
    private router: Router,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DuenioDetalleComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any 
  ) {}

  ngOnInit(): void {
    // Inicializar isOwnerSaved basado en si el dueño ya tiene ID
    // Si data.duenio.id es 0, es creación; si es distinto de 0, es edición
    this.isOwnerSaved = this.data.duenio.id !== 0;

    // Cargar todos los dueños para verificación de duplicados
    this.cargarTodosLosDuenios();

    if (this.data.duenio.id !== 0) {
      this.getDuenioDetails(this.data.duenio.id);
      this.getMascotasByDuenioId(this.data.duenio.id);
    }
    this.disableFields = this.duenio.idestado === 0;
    this.filteredDistricts = this.distritos.slice();
  }

  // Método para cargar todos los dueños
  private cargarTodosLosDuenios(): void {
    this.duenioService.getDuenios().subscribe(
      (duenios) => {
        // Ordenar la lista completa por ID (opcional, para consistencia)
        this.dueniodata = duenios.sort((a, b) => a.id - b.id);
      },
      (error) => {
        console.error('Error al cargar la lista de todos los dueños para verificación:', error);
        // Opcional: Mostrar un mensaje al usuario si no se puede cargar la lista
        // Puede ser peligroso permitir creación si no se puede verificar
        // Swal.fire('Error', 'No se pudo cargar la lista de dueños para verificación. Puede que no se detecten duplicados.', 'warning');
      }
    );
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = e => this.previewUrl = reader.result;
    reader.readAsDataURL(file);
  }

  filterDistricts(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredDistricts = this.distritos.filter(d =>
      d.toLowerCase().includes(filterValue)
    );
  }

  openMascotaModal(): void {
    const duenioId = this.duenio?.id; // Usar el ID del dueño actual en el componente
    console.log('ID del dueño usado:', duenioId);

    if (duenioId) {
      const dialogRef = this.dialog.open(DuenioMascotaComponent, {
        width: '60vw',
        maxWidth: '800px',
        minWidth: '350px',
        data: { duenioId: duenioId,mascotasExistentes:this.mascotas }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === 'nuevo') {
          this.getMascotasByDuenioId(Number(duenioId));
        }
      });
    } else {
      console.error('No se encontró el duenioId válido');
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

  private getFechaHoy(): string {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
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

  // Verificar si un dueño ya existe (excluyendo el actual si es edición)
  private duenioYaExiste(nombre: string, apellido: string, idActual?: number): boolean {
    return this.dueniodata.some(d => 
      d.nombre.toLowerCase() === nombre.toLowerCase() && 
      d.apellido.toLowerCase() === apellido.toLowerCase() &&
      d.id !== idActual // Excluir el dueño actual si estamos editando
    );
  }

  saveDuenio(): void {
    if (this.duenio.id === 0) { // Es creación
      // Verificar si ya existe un dueño con el mismo nombre y apellido
      if (this.duenioYaExiste(this.duenio.nombre, this.duenio.apellido)) {
        Swal.fire({
          title: 'Dueño duplicado',
          text: 'Ya existe un dueño con ese nombre y apellido.',
          icon: 'warning',
          confirmButtonText: 'Aceptar'
        });
        return; // Salir sin guardar
      }

      // Si no existe, proceder con el guardado
      this.duenio.fechaCreacion = this.getFechaHoy();
      this.duenioService.addDuenio(this.duenio).subscribe({
        next: (response) => {
          // Actualizar la lista local de dueños con el nuevo dueño
          this.dueniodata.push(response);
          console.log(response);
          this.duenio = response;
          this.isOwnerSaved = true;
          this.dialogRef.close('guardado');
          Swal.fire({
            title: 'Dueño registrado!',
            text: 'Dueño registrado correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        },
        error: (err) => {
          console.error('Error al guardar el dueño:', err);
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al registrar el dueño. Detalles: ' + (err.error?.message || err.message || 'Error desconocido'),
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
    } else { // Es edición
      // Verificar si ya existe un dueño con el mismo nombre y apellido, excluyendo el actual
      if (this.duenioYaExiste(this.duenio.nombre, this.duenio.apellido, this.duenio.id)) {
        Swal.fire({
          title: 'Dueño duplicado',
          text: 'Ya existe otro dueño con ese nombre y apellido.',
          icon: 'warning',
          confirmButtonText: 'Aceptar'
        });
        return; // Salir sin guardar
      }

      this.duenioService.updateDuenio(this.duenio).subscribe({
        next: (response) => {
          // Actualizar la lista local de dueños con el dueño actualizado
          const index = this.dueniodata.findIndex(d => d.id === this.duenio.id);
          if (index !== -1) {
            this.dueniodata[index] = response;
          }
          this.isOwnerSaved = true;
          this.dialogRef.close('guardado');
          Swal.fire({
            title: '¡Guardado!',
            text: 'Guardado correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        },
        error: (err) => {
          console.error('Error al actualizar el dueño:', err);
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al actualizar el dueño. Detalles: ' + (err.error?.message || err.message || 'Error desconocido'),
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
    }
  }


  saveMascota(): void {
    if (this.selectedMascota) {
      const mascotaParaActualizar = { ...this.selectedMascota };

      const actualizarMascota = () => {
        this.mascotaService.updateMascota(mascotaParaActualizar).subscribe(
          (response) => {
            Swal.fire({
              title: '¡Guardado!',
              text: 'La mascota ha sido actualizada correctamente',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
            this.getMascotasByDuenioId(this.duenio.id);
            this.selectedMascota = null;
          },
          (error) => {
            Swal.fire({
              title: 'Error',
              text: 'Hubo un problema al actualizar la mascota',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          }
        );
      };

      if (this.selectedFile) {
        this.mascotaService.uploadImagenDoctor(this.selectedFile).subscribe(
          (response) => {
            mascotaParaActualizar.rutaimagen = response.ruta;
            actualizarMascota();
          },
          (error) => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo subir la imagen',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          }
        );
      } else {
        actualizarMascota();
      }
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
    if (this.duenio) {
      this.duenio.idestado = this.disableFields ? 0 : 1;
    }
  }

  toggleMascotas(): void {
    if (this.selectedMascota) {
      this.selectedMascota.idEstado = this.disableFields ? 0 : 1;
    }
    this.showMascotas = !this.showMascotas;
  }
}