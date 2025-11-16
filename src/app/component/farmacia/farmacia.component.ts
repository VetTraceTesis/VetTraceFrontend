  // src/app/components/farmacia/farmacia.component.ts

  import {
    Component,
    OnInit,
    AfterViewInit,
    OnDestroy,
  } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { HeaderComponent } from '../../shared/header/header.component';
  import { Medicamento } from '../../model/farmacia-productos.model';
  import { FarmaciaProductosService } from '../../service/farmacia-productos.service';
  import { MatCardModule } from '@angular/material/card';
  import { MatFormFieldModule } from '@angular/material/form-field';
  import { MatInputModule } from '@angular/material/input';
  import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
  import { MatIconModule } from '@angular/material/icon';
  import { MatDialog, MatDialogModule } from '@angular/material/dialog';
  import { MatSelectModule } from '@angular/material/select'; // Importar MatSelectModule
  import { fromEvent, Subscription } from 'rxjs';
  import { debounceTime } from 'rxjs/operators';
  import { Router } from '@angular/router';
  import { FarmaciaDetalleComponent } from './farmacia-detalle/farmacia-detalle.component';

  @Component({
    selector: 'app-farmacia',
    standalone: true,
    imports: [
      CommonModule,
      FormsModule,
      HeaderComponent,
      MatCardModule,
      MatFormFieldModule,
      MatInputModule,
      MatPaginatorModule,
      MatIconModule,
      MatDialogModule,
      MatSelectModule, // Añadir MatSelectModule a los imports
    ],
    templateUrl: './farmacia.component.html',
    styleUrls: ['./farmacia.component.css'],
  })
  export class FarmaciaComponent
    implements OnInit, AfterViewInit, OnDestroy
  {
    medicamentos: Medicamento[] = [];
    filteredMedicamentos: Medicamento[] = [];
    paginatedMedicamentos: Medicamento[] = [];

    // Nueva propiedad para almacenar la farmacia seleccionada
    selectedFarmacia: string = '';

    // Nueva propiedad para almacenar las farmacias únicas
    farmaciasDisponibles: string[] = [];

    searchTerm = '';
    pageSize = 0;
    pageIndex = 0;
    isLoading = false;
    errorMessage = '';

    private resizeSub!: Subscription;

    constructor(
      private farmaciaService: FarmaciaProductosService,
      private router: Router,
      private dialog: MatDialog
    ) {}

    ngOnInit(): void {
      this.loadMedicamentos();
    }

    ngAfterViewInit(): void {
      this.updatePageSize();
      this.resizeSub = fromEvent(window, 'resize')
        .pipe(debounceTime(200))
        .subscribe(() => this.updatePageSize());
    }

    ngOnDestroy(): void {
      this.resizeSub?.unsubscribe();
    }

    private loadMedicamentos(): void {
      this.isLoading = true;
      this.farmaciaService.getProductos().subscribe({
        next: (data) => {
          this.medicamentos = data;
          // Generar la lista de farmacias únicas después de cargar los datos
          this.farmaciasDisponibles = [...new Set(this.medicamentos.map(med => med.farmacia))];
          this.applyFilter(); // Aplicar filtro inicial (vacío)
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'No se pudieron cargar los productos.';
          this.isLoading = false;
        },
      });
    }

    /** Convierte la cadena de precio a número, eliminando símbolos */
    parsePrice(price: string): number {
      const cleaned = price
        .replace(/[^0-9.,-]/g, '')  // quita todo menos dígitos, comas y puntos
        .replace(',', '.');         // cambia coma decimal por punto
      return parseFloat(cleaned) || 0;
    }

    applyFilter(): void {
      const term = this.searchTerm.trim().toLowerCase();
      // Filtrar por nombre del producto Y por farmacia seleccionada
      this.filteredMedicamentos = this.medicamentos.filter((m) => {
        const matchesSearch = m.name.toLowerCase().includes(term);
        const matchesFarmacia = !this.selectedFarmacia || m.farmacia === this.selectedFarmacia;
        return matchesSearch && matchesFarmacia;
      });
      this.pageIndex = 0;
      this.updatePaginated();
      setTimeout(() => this.updatePageSize(), 0);
    }

    onPageChange(event: PageEvent) {
      this.pageIndex = event.pageIndex;
      this.updatePaginated();
    }

    private updatePageSize(): void {
      const gridEl = document.querySelector(
        '.market-grid'
      ) as HTMLElement;
      if (!gridEl) return;

      const gridWidth = gridEl.clientWidth;
      const minCardWidth = 180;
      const gap = 20;
      const columns =
        Math.floor((gridWidth + gap) / (minCardWidth + gap)) || 1;

      this.pageSize = columns * 2;

      const maxPageIndex = Math.floor(
        (this.filteredMedicamentos.length - 1) / this.pageSize
      );
      if (this.pageIndex > maxPageIndex) {
        this.pageIndex = maxPageIndex;
      }

      this.updatePaginated();
    }

    private updatePaginated(): void {
      const start = this.pageIndex * this.pageSize;
      this.paginatedMedicamentos = this.filteredMedicamentos.slice(
        start,
        start + this.pageSize
      );
    }

    getImageUrl(imageFile: string): string {
      const normalized = imageFile.replace(/\\/g, '/');
      const filename = normalized.split('/').pop();
      return `pharmivet_images/${filename}`;
    }

    goBack(): void {
      this.router.navigate(['/modulos']);
    }

    openDetail(medicamentoId: number) {
      const med = this.medicamentos.find((d) => d.id === medicamentoId);
      if (med) {
        this.dialog.open(FarmaciaDetalleComponent, {
          width: '80vw',
          maxWidth: '1200px',
          minWidth: '350px',
          data: { medicamentos: med },
          position: { bottom: '70px' },
        });
      }
    }
  }