import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Atencion } from '../../../model/atenciones.model';
import { AtencionesService } from '../../../service/atenciones.service';
import { AuthService } from '../../../service/auth.service';
import { MascotaService } from '../../../service/mascota.service';
import { Mascota } from '../../../model/mascota.model';
import { AtencionXMascotaXDuenio } from '../../../model/atencionXmascotaXduenio.model';
import { AtencionXMascotaXDuenioService } from '../../../service/atencionXmascotaXduenio.service';
import { DiagnosticoService } from '../../../service/diagnostico.service';
import { Diagnostico } from '../../../model/diagnostico.model';
import { HeaderComponent } from '../../../shared/header/header.component';

@Component({
  selector: 'app-atenciones-insert',
  standalone: true,
  imports: [FormsModule, CommonModule,HeaderComponent],
  templateUrl: './atenciones-insert.component.html',
  styleUrls: ['./atenciones-insert.component.css']
})
export class AtencionesInsertComponent implements OnInit {
   duenioIdGlobal!: number;

  nuevaAtencion: Atencion = {
    id: 0,
    fechaInicio: '',
    fechaFin: '',
    idveterinaria: 0,
    iddoctorVeterinario: 0,
    idusuario: 0,
    duenioId: 0,
    id_estado: 1
  };

  nuevaMultiple: AtencionXMascotaXDuenio = {
    id: 0,
    id_atencion: 0,
    id_mascota: 0,
    id_duenio: 0,
    id_estado: 1
  };

  diagnostico:Diagnostico ={
  id: 0,
  comentario: '',
  resultado: '',
  atencion_id: 0,
  id_Estado: 1
  };

  mascotas: Mascota[] = []; // Lista de mascotas para mostrar
  nombreMascotaSeleccionada: string = '';

  constructor(
    private atencionesService: AtencionesService,
    private mascotaService: MascotaService,
    private atencionXmascotaXduenioServic: AtencionXMascotaXDuenioService,
    private diagnosticoService:DiagnosticoService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    console.log(this.authService.getUsuario())

    this.route.params.subscribe(params => {
      console.log('Params recibidos:', params);
      this.duenioIdGlobal = +params['duenoId'];
      console.log('duenioId parseado:', this.duenioIdGlobal);
    })
    
    const usuarioActual = this.authService.getUsuario();
    if (!usuarioActual) {
      alert('Usuario no autenticado');
      return;
    }

    this.nuevaAtencion.idusuario = usuarioActual.id;
    this.nuevaAtencion.idveterinaria = usuarioActual.veterinariaId;
    this.nuevaAtencion.duenioId = this.duenioIdGlobal;

    this.nuevaMultiple.id_duenio = this.duenioIdGlobal;

    // Obtener mascotas del dueño
    this.mascotaService.getMascotasByDuenio(this.duenioIdGlobal).subscribe({
      next: (mascotas) => {
        this.mascotas = mascotas;

      },
      error: (err) => {
        console.error('Error al obtener mascotas:', err);
      }
    });
  }


 crearAtencion() {
  this.atencionesService.addAtencion(this.nuevaAtencion).subscribe({
    next: (atencionCreada) => {
      alert('Atención creada exitosamente');
      
      // Buscamos la mascota por nombre
      const mascotaSeleccionada = this.mascotas.find(
        m => m.nombre === this.nombreMascotaSeleccionada
      );

      // Asignamos IDs
      this.nuevaMultiple.id_atencion = atencionCreada.id;
      this.nuevaMultiple.id_mascota = mascotaSeleccionada?.idPaciente ?? 0;
      this.diagnostico.atencion_id = atencionCreada.id;

      // Si tenemos mascota seleccionada, guardamos la relación y después el diagnóstico
      if (this.nuevaMultiple.id_mascota > 0) {
        this.atencionXmascotaXduenioServic
          .registrar(this.nuevaMultiple)
          .subscribe({
            next: () => {
              console.log('Relación atención–mascota registrada:', this.nuevaMultiple);

              this.diagnosticoService.registrar(this.diagnostico).subscribe({
                next: (diagRes) => {
                  console.log('Diagnóstico guardado:', diagRes);
                  console.log('Diagnóstico guardado:', this.duenioIdGlobal);
                  // Finalmente navegamos a la lista de atenciones del dueño
                  this.router.navigate(['/atenciones/duenio', this.duenioIdGlobal]);
                },
                error: (diagErr) => {
                  console.error('Error al guardar diagnóstico:', diagErr);
                  // Aun así navegamos para no dejar al usuario bloqueado
                  this.router.navigate(['/atenciones/duenio', this.duenioIdGlobal]);
                }
              });
            },
            error: (relErr) => {
              console.error('Error al registrar relación atención–mascota:', relErr);
              this.router.navigate(['/atenciones/duenio', this.duenioIdGlobal]);
            }
          });
      } else {
        // No se seleccionó mascota: solo navegamos de vuelta
        this.router.navigate(['/atenciones']);
      }
    },
    error: (atErr) => {
      console.error('Error al crear atención:', atErr);
      alert('Error al crear la atención. Revisa la consola.');
    }
  });
}


  cancelar() {
    this.router.navigate(['/atenciones']);
  }
}
