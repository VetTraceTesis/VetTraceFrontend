// src/app/components/panel-administrador/panel-administrador.component.ts
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule }            from '@angular/common';
import { FormsModule }             from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule }           from '@angular/material/card';
import { MatFormFieldModule }      from '@angular/material/form-field';
import { MatInputModule }          from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime }            from 'rxjs/operators';

import { HeaderComponent }         from '../../shared/header/header.component';
import { UsuarioService }          from '../../service/users.service';
import { Usuario }                 from '../../model/usuarios.model';
import { PanelAdministradorDetalleComponent } from './panel-administrador-detalle/panel-administrador-detalle.component';
import { Router } from '@angular/router';  

@Component({
  selector: 'app-panel-administrador',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule
  ],
  templateUrl: './panel-administrador.component.html',
  styleUrls: ['./panel-administrador.component.css']
})
export class PanelAdministradorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cardsGrid') gridRef!: ElementRef<HTMLDivElement>;
  private resizeSub!: Subscription;

  usuarios: Usuario[]        = [];
  filteredUsuarios: Usuario[] = [];
  paginatedUsuarios: Usuario[] = [];

  searchTerm = '';
  loading    = false;
  error      = '';

  pageSize   = 4;
  pageIndex  = 0;

  constructor(
    private usuarioService: UsuarioService,
    private dialog: MatDialog,
    private router:Router
  ) {}

  ngOnInit(): void {
    this.loadUsuarios();
  }

  ngAfterViewInit(): void {
    // Recalcula el tamaño de página tras pintar vista
    this.updatePageSize();
    this.resizeSub = fromEvent(window, 'resize')
      .pipe(debounceTime(300))
      .subscribe(() => this.updatePageSize());
  }

  ngOnDestroy(): void {
    this.resizeSub?.unsubscribe();
  }

  private loadUsuarios(): void {
    this.loading = true;
    this.usuarioService.getUsuarios().subscribe({
      next: data => {
        this.usuarios = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los usuarios';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredUsuarios = this.usuarios.filter(u =>
      `${u.nombre} ${u.apellido}`.toLowerCase().includes(term)
    );
    this.pageIndex = 0;
    // siempre recorta paginado, incluso si gridRef aún no existe
    this.updatePaginated();
    // luego recalcula columnas y vuelve a recortar
    this.updatePageSize();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.updatePaginated();
  }

  /** Calcula columnas y ajusta pageSize = columnas*2 */
  private updatePageSize(): void {
    if (!this.gridRef) return;
    const width   = this.gridRef.nativeElement.clientWidth;
    const minCard = 260;  // igual que min-width en CSS
    const gap     = 32;   // igual que gap en CSS
    const cols    = Math.floor((width + gap) / (minCard + gap)) || 1;
    this.pageSize = cols * 2;

    const maxIdx = Math.floor((this.filteredUsuarios.length - 1) / this.pageSize);
    if (this.pageIndex > maxIdx) this.pageIndex = maxIdx;

    this.updatePaginated();
  }

  private updatePaginated(): void {
    const start = this.pageIndex * this.pageSize;
    this.paginatedUsuarios = this.filteredUsuarios.slice(start, start + this.pageSize);
  }

  openDetalle(u: Usuario) {
    const ref = this.dialog.open(PanelAdministradorDetalleComponent, {
      data: u,
      width: '80vw',
      maxWidth: '1200px',
      minWidth: '350px',
    });
    ref.afterClosed().subscribe(updated => {
      if (updated) this.loadUsuarios();
    });
  }

  openNuevo() {
    const ref = this.dialog.open(PanelAdministradorDetalleComponent, {
      data: null,
      width: '80vw',
      maxWidth: '1200px',
      minWidth: '350px',
    });
    ref.afterClosed().subscribe(created => {
      if (created) this.loadUsuarios();
    });
  }

  openInicio() {
    this.router.navigate(['/modulos']);  
  }
}
