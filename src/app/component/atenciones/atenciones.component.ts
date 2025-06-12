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
  imports: [FormsModule, CommonModule, HeaderComponent],
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

  // Paginación
  currentPage = 1;  // Página actual
  totalPages = 1;  // Total de páginas
  itemsPerPage = 5;  // Elementos por página

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
      this.updatePagination();  // Actualizamos la paginación después de obtener los datos
    });
  }

  // Método para filtrar los dueños según el término de búsqueda
  filterDuenos() {
    this.filteredDuenos = this.duenos.filter(dueno => {
      return dueno.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
             dueno.apellido.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
             dueno.id.toString().includes(this.searchTerm);
    });
    this.currentPage = 1;  // Resetear a la primera página
    this.updatePagination();  // Actualizar la paginación después del filtro
  }

  // Método para obtener las atenciones del dueño
  getAtencionesByDuenio(id: number) {
    this.atencionesService.getAtencionesByDuenio(id).subscribe(data => {
      this.atenciones = data;
      this.filteredAtenciones = data;  // Inicializamos las atenciones filtradas
      this.updatePagination();  // Actualizamos la paginación
    });
  }

  // Actualizar la paginación
updatePagination() {
  // Aquí se calcula la paginación sobre filteredDuenos, no sobre las atenciones
  this.totalPages = Math.ceil(this.filteredDuenos.length / this.itemsPerPage);  // Calcular total de páginas
  if (this.totalPages === 0) this.totalPages = 1;

  // Asegúrate de que currentPage no sea mayor que totalPages
  if (this.currentPage > this.totalPages) {
    this.currentPage = this.totalPages;
  }

  // Calcular el rango de items a mostrar en la página actual
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  this.filteredDuenos = this.filteredDuenos.slice(startIndex, startIndex + this.itemsPerPage); // Paginación de dueños
}


  // Cambiar a la página anterior
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();  // Actualizar la paginación
    }
  }

  // Cambiar a la página siguiente
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();  // Actualizar la paginación
    }
  }

  // Método para redirigir al detalle de la atención
  goToAtencionesByDuenio(duenioId: number) {
    this.router.navigate(['/atenciones/duenio', duenioId]);  // Redirigir a la página de atenciones por dueño
  }

  // Método para regresar a la página de módulos
  goBack(): void {
    this.router.navigate(['/modulos']);  // Redirigir a la página de módulos
  }
}
