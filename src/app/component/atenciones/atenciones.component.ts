import { Component, OnInit } from '@angular/core';
import { AtencionesService } from '../../service/atenciones.service';
import { DuenioService } from '../../service/duenio.service';  // Asegúrate de importar el servicio Duenio
import { Atencion } from '../../model/atenciones.model';  // Asegúrate de importar el modelo Atencion
import { Duenio } from '../../model/duenio.model';  // Asegúrate de importar el modelo Duenio
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-atenciones',
  standalone: true,
  imports: [FormsModule, CommonModule,HeaderComponent],
  templateUrl: './atenciones.component.html',
  styleUrls: ['./atenciones.component.css']
})
export class AtencionesComponent implements OnInit {
duenos: Duenio[] = [];  // Almacenará todos los dueños
  filteredDuenos: Duenio[] = [];  // Almacenará los dueños filtrados
  atenciones: Atencion[] = [];  // Almacenará todas las atenciones
  filteredAtenciones: Atencion[] = [];  // Almacenará las atenciones filtradas
  selectedAtencion: Atencion | null = null;  // Para almacenar la atención seleccionada
  searchTerm: string = '';  // Para manejar la caja de búsqueda

  constructor(
    private atencionesService: AtencionesService,
    private duenioService: DuenioService,  // Usamos el servicio DuenioService
    private router: Router
  ) {}

  ngOnInit() {
    this.getDuenos();
  }

  getDuenos() {
    this.duenioService.getDuenios().subscribe(data => {
      this.duenos = data;
      this.filteredDuenos = data;  // Inicializamos los dueños filtrados
    });
  }

  // Método para filtrar los dueños según el término de búsqueda
  filterDuenos() {
    this.filteredDuenos = this.duenos.filter(dueno => {
      return dueno.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
             dueno.apellido.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
             dueno.id.toString().includes(this.searchTerm);
    });
  }

  // Método para obtener las atenciones del dueño
  getAtencionesByDuenio(id: number) {
    this.atencionesService.getAtencionesByDuenio(id).subscribe(data => {
      this.atenciones = data;
      this.filteredAtenciones = data;  // Inicializamos las atenciones filtradas
    });
  }

  // Método para abrir el detalle de una atención
  openAtencionDetail(atencion: Atencion) {
    this.selectedAtencion = atencion;
  }

  // Método para cerrar el detalle de la atención
  closeAtencionDetail() {
    this.selectedAtencion = null;
  }

  // Método para regresar a la página de módulos
  goBack(): void {
    this.router.navigate(['/modulos']);
  }

  // Método para agregar una nueva atención
  goToAddAtencion() {
    console.log('Redirigiendo a la página para agregar una nueva atención...');
  }

  // Método para formatear la fecha a dd/mm/yyyy
  getFormattedDate(fecha: string): string {
    const date = new Date(fecha);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }
  goToAtencionesByDuenio(duenoId: number) {
  // Redirigir al componente de detalles pasando el ID de la atención en la URL
  console.log(duenoId)
  this.router.navigate(['/atenciones/duenio', duenoId]);
}

}
