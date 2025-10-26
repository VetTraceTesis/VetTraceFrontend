import { Component, OnInit } from '@angular/core';
import { AtencionesService } from '../../service/atenciones.service';
import { DuenioService } from '../../service/duenio.service';
import { Atencion } from '../../model/atenciones.model';
import { Duenio } from '../../model/duenio.model';
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
  duenos: Duenio[] = [];
  filteredDuenos: Duenio[] = [];      // Solo para mostrar (paginado)
  fullFilteredDuenos: Duenio[] = [];  // ✅ NUEVO: almacena todos los filtrados (sin paginar)
  
  atenciones: Atencion[] = [];
  filteredAtenciones: Atencion[] = [];
  selectedAtencion: Atencion | null = null;
  searchTerm: string = '';

  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 15;

  constructor(
    private atencionesService: AtencionesService,
    private duenioService: DuenioService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getDuenos();
  }

  getDuenos() {
    this.duenioService.getDuenios().subscribe(data => {
      this.duenos = data.sort((a, b) => a.id - b.id);
      this.fullFilteredDuenos = [...this.duenos]; // Guardamos todos los dueños sin filtro
      this.applyFilterAndPagination();
    });
  }

  filterDuenos() {
    if (this.searchTerm.trim() === '') {
      this.fullFilteredDuenos = [...this.duenos];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.fullFilteredDuenos = this.duenos.filter(dueno => {
        return (
          dueno.nombre.toLowerCase().includes(term) ||
          dueno.apellido.toLowerCase().includes(term) ||
          dueno.id.toString().includes(this.searchTerm)
        );
      });
    }
    this.currentPage = 1;
    this.applyFilterAndPagination();
  }

  applyFilterAndPagination() {
    // Calcular total de páginas con los datos COMPLETOS filtrados
    this.totalPages = Math.ceil(this.fullFilteredDuenos.length / this.itemsPerPage) || 1;

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    // Solo filteredDuenos se actualiza con el slice (para la vista)
    this.filteredDuenos = this.fullFilteredDuenos.slice(startIndex, startIndex + this.itemsPerPage);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilterAndPagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilterAndPagination();
    }
  }

  goToAtencionesByDuenio(duenioId: number) {
    this.router.navigate(['/atenciones/duenio', duenioId]);
  }

  goBack(): void {
    this.router.navigate(['/modulos']);
  }
}