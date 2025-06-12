import { Component, OnInit } from '@angular/core';
import { Atencion } from '../../../model/atenciones.model';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { AtencionesService } from '../../../service/atenciones.service';
import { HeaderComponent } from '../../../shared/header/header.component';

@Component({
  selector: 'app-atenciones-detail',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent],
  templateUrl: './atenciones-detail.component.html',
  styleUrls: ['./atenciones-detail.component.css']
})
export class AtencionesDetailComponent implements OnInit {
  duenioId!: number;
  atenciones: Atencion[] = [];  // Almacenamos todas las atenciones
  filteredAtenciones: Atencion[] = [];  // Almacenamos las atenciones filtradas
  currentPage = 1;  // Página actual
  totalPages = 1;  // Total de páginas
  itemsPerPage = 5;  // Elementos por página

  nuevaAtencion: Atencion = {
    id: 0,
    fechaInicio: '',
    fechaFin: '',
    idveterinaria: 0,
    iddoctorVeterinario: 0,
    idusuario: 0,
    duenioId: 0,
    id_estado: 1  // Puedes ajustar el valor por defecto
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private atencionesService: AtencionesService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      console.log('Params recibidos:', params);
      this.duenioId = +params['duenoId'];
      console.log('duenioId parseado:', this.duenioId);

      if (isNaN(this.duenioId)) {
        console.error('duenioId no es un número válido');
      } else {
        this.cargarAtenciones();
        this.nuevaAtencion.duenioId = this.duenioId;
      }
    });
  }

  cargarAtenciones() {
    this.atencionesService.getAtencionesByDuenio(this.duenioId).subscribe({
      next: data => {
        this.atenciones = data;
        this.filteredAtenciones = data;  // Inicializamos las atenciones filtradas
        this.updatePagination();  // Actualizamos la paginación
      },
      error: err => {
        console.error('Error al cargar atenciones:', err);
      }
    });
  }

  // Método para actualizar la paginación
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredAtenciones.length / this.itemsPerPage);  // Calcular total de páginas
    if (this.totalPages === 0) this.totalPages = 1;

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredAtenciones = this.atenciones.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Método para la paginación de la página anterior
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();  // Actualizamos la paginación
    }
  }

  // Método para la paginación de la siguiente página
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();  // Actualizamos la paginación
    }
  }

  // Método para redirigir al detalle de la atención
  irADiagnostico(atencionId: number) {
    this.router.navigate(['/atenciones/diagnostico', atencionId]);
  }

  // Método para regresar a la lista de atenciones
  goBack(): void {
    this.router.navigate(['/atenciones']);
  }

  // Método para redirigir a la creación de nueva atención
  irANuevaAtencion() {
    this.router.navigate(['/atenciones/nuevo', this.duenioId]);
  }
}
