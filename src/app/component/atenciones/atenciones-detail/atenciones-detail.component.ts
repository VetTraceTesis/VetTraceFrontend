import { Component, OnInit } from '@angular/core';
import { Atencion } from '../../../model/atenciones.model';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { AtencionesService } from '../../../service/atenciones.service';

@Component({
  selector: 'app-atenciones-detail',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './atenciones-detail.component.html',
  styleUrls: ['./atenciones-detail.component.css']
})
export class AtencionesDetailComponent implements OnInit {
  
  duenioId!: number;
  atenciones: Atencion[] = [];

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
        // Asignar duenioId a la nueva atención
        this.nuevaAtencion.duenioId = this.duenioId;
      }
    });
  }

  cargarAtenciones() {
    this.atencionesService.getAtencionesByDuenio(this.duenioId).subscribe({
      next: data => {
        this.atenciones = data;
      },
      error: err => {
        console.error('Error al cargar atenciones:', err);
      }
    });
  }

  irANuevaAtencion() {
  this.router.navigate(['/atenciones/nuevo', this.duenioId]);
}
  irADiagnostico(atencionId: number) {
    this.router.navigate(['/atenciones/diagnostico', atencionId]);
  }

  goBack(): void {
    this.router.navigate(['/atenciones']);
  }
}
