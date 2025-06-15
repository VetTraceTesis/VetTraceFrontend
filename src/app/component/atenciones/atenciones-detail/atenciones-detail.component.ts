import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {AtencionesInsertComponent} from '../atenciones-insert/atenciones-insert.component'
import { Atencion } from '../../../model/atenciones.model';
import { AtencionDetalle } from '../../../model/Atencion-detalle.model';

import { AtencionesService } from '../../../service/atenciones.service';
import { HeaderComponent } from '../../../shared/header/header.component';

@Component({
  selector: 'app-atenciones-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent,MatDialogModule],
  templateUrl: './atenciones-detail.component.html',
  styleUrls: ['./atenciones-detail.component.css']
})
export class AtencionesDetailComponent implements OnInit {
  duenioId!: number;
  atenciones: AtencionDetalle[] = [];
  paginatedAtenciones: AtencionDetalle[] = [];

  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private atencionesService: AtencionesService,
    private dialog:MatDialog
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.duenioId = +params['duenoId'];
      if (isNaN(this.duenioId)) {
        console.error('duenioId no es un número válido');
        return;
      }
      this.cargarAtenciones();
    });
  }

  cargarAtenciones() {
    this.atencionesService.getAtencionesByDuenio(this.duenioId).subscribe({
      next: data => {
        this.atenciones = data.sort((a, b) => a.atencionId - b.atencionId);
        console.log(this.atenciones)
        this.totalPages = Math.max(Math.ceil(data.length / this.itemsPerPage), 1);
        this.actualizarPagina();
      },
      error: err => {
        console.error('Error al cargar atenciones:', err);
      }
    });
  }

  actualizarPagina() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedAtenciones = this.atenciones.slice(startIndex, startIndex + this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.actualizarPagina();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.actualizarPagina();
    }
  }

  irADiagnostico(atencionId: number) {
    this.router.navigate(['/atenciones/diagnostico', atencionId]);
  }

 irANuevaAtencion() {
  const dialogRef = this.dialog.open(AtencionesInsertComponent, {
    width: '80vw',  
    maxWidth: '1200px',  
    minWidth: '350px', 
    data: { duenoId: this.duenioId }
    //position: { bottom: '70px' }  
  });

  /* cuando se cierre el modal, si se creó algo volvemos a cargar */
  dialogRef.afterClosed().subscribe(result => {
    if (result === 'created') {
      this.cargarAtenciones();
    }
  });
}
  goBack() {
    this.router.navigate(['/atenciones']);
  }
}
