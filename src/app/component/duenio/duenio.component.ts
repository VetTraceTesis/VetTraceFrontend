import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';  // Importamos Router para la redirección
import { DuenioService } from '../../service/duenio.service'; // Asegúrate de importar tu servicio
import { Duenio } from '../../model/duenio.model';  // Importamos el modelo de Duenio
import { FormsModule } from '@angular/forms';  // Importamos FormsModule
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/header/header.component';
import { MatDialog } from '@angular/material/dialog';
import { DuenioDetalleComponent } from './duenio-detalle/duenio-detalle.component';

@Component({
  selector: 'app-duenio',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './duenio.component.html',
  styleUrls: ['./duenio.component.css']
})
export class DuenioComponent implements OnInit {
  @ViewChild('gridContainer', { static: false }) gridContainer!: ElementRef<HTMLDivElement>;

  duenios: Duenio[] = [];  // Aquí almacenamos todos los dueños
  filteredDuenios: Duenio[] = [];  // Aquí almacenamos los dueños filtrados
  paginatedDuenios: Duenio[] = [];  // Aquí almacenamos los dueños en la página actual
  currentPage = 1;  // Página actual
  totalPages = 1;  // Total de páginas
  itemsPerPage = 8;  // Elementos por página

  searchTerm: string = '';  // Para realizar la búsqueda de dueños

  constructor(
    private duenioService: DuenioService,  // Inyectamos el servicio de dueños
    private router: Router,
    public dialog: MatDialog  // Inyectamos el router para manejar la navegación
  ) { }

  ngOnInit(): void {
    this.loadDuenios();  // Cargar los dueños al iniciar
  }

  loadDuenios(): void {
    this.duenioService.getDuenios().subscribe(
      (duenios) => {
        this.duenios = duenios;
        this.filteredDuenios = duenios.sort((a, b) => a.nombre.localeCompare(b.nombre));  // Ordenar por nombre
        this.updatePagination();  // Actualizar la paginación
      },
      (error) => {
        console.error('Error al cargar los dueños:', error);
      }
    );
  }

  filterDuenios(): void {
    if (!this.searchTerm) {
      this.filteredDuenios = this.duenios;  // Si no hay búsqueda, mostrar todos los dueños
    } else {
      this.filteredDuenios = this.duenios.filter(duenio =>
        duenio.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        duenio.apellido.toLowerCase().includes(this.searchTerm.toLowerCase())  // Filtrar por nombre o apellido
      );
    }
    this.currentPage = 1;  // Resetear a la primera página
    this.updatePagination();  // Actualizar la paginación después de filtrar
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredDuenios.length / this.itemsPerPage);  // Calcular total de páginas
    if (this.totalPages === 0) this.totalPages = 1;

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedDuenios = this.filteredDuenios.slice(startIndex, startIndex + this.itemsPerPage);  // Paginar los dueños
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();  // Actualizar la paginación
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();  // Actualizar la paginación
    }
  }

  goToDuenioDetail(id: number): void {
    this.router.navigate([`/duenio-detalle/${id}`]);  // Redirigir a la página de detalle del dueño
  }

  openDuenioModal(): void {
    const dialogRef = this.dialog.open(DuenioDetalleComponent, {
      width: '80vw',
      maxWidth: '1200px',
      minWidth: '350px',
      data: {
        duenio: { id: 0, nombre: '', apellido: '', telefono: '', email: '', direccion: '', fechaCreacion: '', idestado: 1 }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDuenios(); // Cargar los dueños después de cerrar el modal
      }
    });
  }

  openDuenioDetailModal(duenioId: number): void {
    const duenio = this.duenios.find(d => d.id === duenioId);
    if (duenio) {
      const dialogRef = this.dialog.open(DuenioDetalleComponent, {
        width: '80vw',  
        maxWidth: '1200px',  
        minWidth: '350px',  
        data: { duenio },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadDuenios(); 
        }
      });
    }
  }

  goToAddDuenio(): void {
    this.router.navigate(['/duenio/nuevo']);  // Redirigir a la página de agregar nuevo dueño
  }

  goBack(): void {
    this.router.navigate(['/modulos']);  // Redirigir a la página de módulos
  }
}
