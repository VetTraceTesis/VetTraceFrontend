import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DetalleAtencion } from '../../../../model/atencionXmascotaXdueniodetalle.model';
import { Diagnostico } from '../../../../model/diagnostico.model';
import { Receta } from '../../../../model/receta.model';
import { Medicamento } from '../../../../model/medicamento.model';
import { formatDate } from '@angular/common';
import { AtencionXMascotaXDuenio } from '../../../../model/atencionXmascotaXduenio.model';
import { ReportePdfService } from '../../../../service/reporte.service';
import { AtencionXMascotaXDuenioService } from '../../../../service/atencionXmascotaXduenio.service';
import { DiagnosticoService } from '../../../../service/diagnostico.service';
import { RecetaService } from '../../../../service/receta.service';
import { MedicamentoService } from '../../../../service/medicamento.service';
import { MedicamentoModalComponent } from './medicamento-modal/medicamento-modal.component';
import { HeaderComponent } from '../../../../shared/header/header.component';
import { AtencionesService } from '../../../../service/atenciones.service';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-atenciones-diagnostico',
  standalone: true,
  imports: [CommonModule,MatTabsModule,FormsModule,MatDialogModule,MatFormFieldModule,MatIconModule,MatInputModule,MatButtonModule,HeaderComponent,MatSelectModule],
  templateUrl: './atenciones-diagnostico.component.html',
  styleUrls: ['./atenciones-diagnostico.component.css']
})
export class AtencionesDiagnosticoComponent implements OnInit {
  atencionId: string | null = null;
  tipodiagnosticoId: string | null = null;
  estadoAtencion: number | null = null; // No usamos getter/setter aquí
    estadoOriginal: number | null = null; // Nueva propiedad para almacenar el estado inicial

  estadosAtencion = [
    { id: 1, nombre: 'En Proceso' },
    { id: 2, nombre: 'Finalizado' },
    { id: 3, nombre: 'Sin Atender' }
  ];

  detalles: DetalleAtencion[] = [];
  recetas: any[] = [];

  diagnostico: Diagnostico = {
    id: 0,
    comentario: '',
    resultado: '',
    atencion_id: 0,
    id_Estado: 1
  };

  receta: Receta = {
    id: 0,
    comentarios: '',
    fechaCreacion: '',
    id_estado: 1,
    diagnostico_Id: 0
  };

  medicamento: Medicamento = {
    id: 0,
    medicamento: '',
    cantidad: '',
    indicacion: '',
    id_receta: 0,
  };

  AtencionXMascotaXDuenio: AtencionXMascotaXDuenio = {
    id: 0,
    id_atencion: 0,
    id_mascota: 0,
    id_duenio: 0,
    id_estado: 0,
  };

  listaMedicamentos: Medicamento[] = [];
  MostrarMedicamentos: Medicamento[] = [];
  atencionxmascotaxduenio: AtencionXMascotaXDuenio[] = [];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private atencionXmascotaXduenioService: AtencionXMascotaXDuenioService,
    private diagnosticoService: DiagnosticoService,
    private recetaService: RecetaService,
    private medicamentoService: MedicamentoService,
    private reportePdfService: ReportePdfService,
    private atencionesService: AtencionesService
  ) {
    this.atencionId = this.route.snapshot.paramMap.get('atencionId');
    this.tipodiagnosticoId = this.route.snapshot.paramMap.get('tipodiagnosticoId');
  }

  ngOnInit(): void {
    if (!this.atencionId) return;
    this.estadoAtencion = this.tipodiagnosticoId ? Number(this.tipodiagnosticoId) : null;
    const atencionIdNum = +this.atencionId;
    this.estadoOriginal = this.estadoAtencion; // Guardamos el estado inicial

    this.atencionXmascotaXduenioService.obtenerInfoPorAtencion(atencionIdNum).subscribe({
      next: detalle => {
        this.atencionxmascotaxduenio = detalle;
      },
      error: err => console.error('Error al obtener info por atención:', err)
    });

    this.diagnosticoService.obtenerPorId(atencionIdNum).subscribe({
      next: diag => {
        this.diagnostico = diag;
        this.recetaService.obtenerPorId(diag.id).subscribe({
          next: recet => {
            this.receta = recet;
            this.medicamentoService.obtenerPorId(recet.id).subscribe({
              next: meds => this.MostrarMedicamentos = ([] as Medicamento[]).concat(meds),
              error: err => console.error('No pude cargar los medicamentos:', err)
            });
          },
          error: err => {
            if (err.status !== 404) console.error('Error al cargar receta:', err);
          }
        });
      },
      error: err => {
        if (err.status === 404) console.warn('No existe diagnóstico aún para esta atención');
        else console.error('Error al cargar diagnóstico:', err);
      }
    });

    this.atencionXmascotaXduenioService.obtenerDetallesPorAtencion(atencionIdNum).subscribe({
      next: data => this.detalles = data,
      error: err => console.error('Error al obtener detalles:', err)
    });
  }

  isFinalizado(): boolean {
    return this.estadoOriginal === 2;
  }

  guardarDiagnostico(): void {
    if (this.isFinalizado()) {
      this.showErrorAlert('No se puede guardar', 'La atención está finalizada. No se pueden realizar cambios.');
      return;
    }
    if (!this.diagnostico.comentario || this.diagnostico.comentario.trim().length < 5) {
      this.showErrorAlert('Comentario inválido', 'El comentario del diagnóstico es obligatorio y debe tener al menos 5 caracteres.');
      return;
    }
    if (!this.diagnostico.resultado || this.diagnostico.resultado.trim().length < 2) {
      this.showErrorAlert('Resultado inválido', 'El resultado del diagnóstico es obligatorio y debe tener al menos 2 caracteres.');
      return;
    }
    if (!this.atencionId) {
      console.error('No hay atencionId en la ruta');
      return;
    }
    this.diagnostico.atencion_id = +this.atencionId;
    this.diagnosticoService.modificar(this.diagnostico).subscribe({
      next: (updated) => {
        this.diagnostico = updated;
        this.showSuccessAlert('¡Diagnóstico actualizado!', 'El diagnóstico ha sido actualizado correctamente.');
      },
      error: (err) => {
        console.error('Error al actualizar diagnóstico:', err);
        this.showErrorAlert('Hubo un problema al actualizar el diagnóstico. Inténtalo de nuevo.');
      }
    });
  }

  guardarReceta() {
    if (this.isFinalizado()) {
      this.showErrorAlert('No se puede guardar', 'La atención está finalizada. No se pueden realizar cambios.');
      return;
    }
    if (!this.diagnostico) {
      console.error('No hay Diagnostico en la ruta');
      return;
    }
    if (!this.receta.comentarios || this.receta.comentarios.trim().length < 5) {
      this.showErrorAlert('Comentario de receta inválido', 'El comentario de la receta es obligatorio y debe tener al menos 5 caracteres.');
      return;
    }
    this.receta.diagnostico_Id = +this.diagnostico.id;
    this.receta.fechaCreacion = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
    this.recetaService.registrar(this.receta).subscribe({
      next: (recetaGuardada) => {
        this.showSuccessAlert('Receta guardada', 'La receta ha sido guardada correctamente');
        this.procesarRecetaYMedicamentos(recetaGuardada);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409 && err.error === 'duplicated') {
          this.recetaService.modificar(this.receta).subscribe({
            next: (recetaActualizada) => {
              this.showSuccessAlert('Receta actualizada', 'La receta se ha actualizado correctamente');
              this.procesarRecetaYMedicamentos(recetaActualizada);
              // Guardar el estado y la fecha de fin solo si el estado actual es "Finalizado"
              if (this.estadoAtencion === 2) {
                this.guardarFechaFiTipoDiagnostico();
              }
            },
            error: (putErr) => this.showErrorAlert('Error al actualizar receta')
          });
        } else {
          console.error('Error al guardar receta:', err);
          this.showErrorAlert('Error al guardar receta');
        }
      }
    });
  }

  private procesarRecetaYMedicamentos(recetaDTO: Receta) {
    this.receta = recetaDTO;
    if (!this.listaMedicamentos || this.listaMedicamentos.length === 0) return;
    let errorEnMedicamento = false;
    this.listaMedicamentos.forEach((med, idx) => {
      if (!med) return;
      med.id_receta = this.receta.id;
      this.medicamentoService.registrar(med).subscribe({
        next: (medGuardado) => {
          if (!medGuardado) return;
          const originalLength = this.MostrarMedicamentos.length;
          this.MostrarMedicamentos = this.MostrarMedicamentos.filter(m => m != null);
          const i = this.MostrarMedicamentos.findIndex(m => m.id === medGuardado.id);
          if (i !== -1) this.MostrarMedicamentos[i] = medGuardado;
          else {
            this.MostrarMedicamentos.push(medGuardado);
            this.MostrarMedicamentos = [...this.MostrarMedicamentos];
          }
        },
        error: (medErr) => {
          console.error(`Error al guardar medicamento índice ${idx}:`, medErr);
          errorEnMedicamento = true;
        }
      });
    });
    if (!errorEnMedicamento) {
      this.showSuccessAlert('¡Medicamentos procesados!', `Se han procesado correctamente ${this.listaMedicamentos.length} medicamento(s).`);
    } else {
      this.showErrorAlert('Hubo un problema al guardar algunos medicamentos. Por favor, inténtalo de nuevo.');
    }
    this.listaMedicamentos = [];
  }

  guardarFechaFiTipoDiagnostico(): void {
    const id = Number(this.atencionId);
    const tipoDiagnosticoId = this.estadoAtencion;

    if (tipoDiagnosticoId === null || tipoDiagnosticoId === undefined) {
      console.error('Tipo de diagnóstico no seleccionado.');
      return;
    }

    let fechaFinFormateada = '';
    if (tipoDiagnosticoId === 2) {
      const now = new Date();
      fechaFinFormateada = now.toISOString().slice(0, 16);
    }

    this.atencionesService.actualizarTipoDiagnosticoYFechaFin(id, tipoDiagnosticoId, fechaFinFormateada).subscribe({
      next: () => {
        console.log('Atención actualizada correctamente.');
        this.showSuccessAlert('Estado Actualizado', 'La atención ha sido marcada como finalizada.');
      },
      error: (error) => {
        console.error('Error al actualizar atención:', error);
        this.showErrorAlert('Error al actualizar estado', 'No se pudo marcar la atención como finalizada.');
      }
    });
  }

  generarReporte(): void {
    this.reportePdfService.generarReportePDF(Number(this.atencionId)).subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_atencion_${this.atencionId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      Swal.fire({
        title: '¡Reporte generado!',
        text: `El reporte para la atención ${this.atencionId} se ha generado correctamente.`,
        icon: 'success',
        confirmButtonColor: '#416785',
        confirmButtonText: 'Aceptar',
        customClass: { popup: 'swal2-border-radius' },
        showClass: { popup: 'animate__animated animate__fadeInDown' },
        hideClass: { popup: 'animate__animated animate__fadeOutUp' }
      });
    }, error => {
      console.error('Error al generar el reporte PDF', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al generar el reporte. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonColor: '#FF0000',
        confirmButtonText: 'Aceptar'
      });
    });
  }

  generarCorreo(): void {
    if (!this.atencionId || isNaN(Number(this.atencionId))) {
      console.error('El id de la atención no es válido.');
      return;
    }
    Swal.fire({
      title: 'Enviando correo...',
      text: 'Por favor, espera mientras enviamos el correo.',
      icon: 'info',
      showCancelButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading()
    });
    this.reportePdfService.enviarReportePorCorreo(Number(this.atencionId)).subscribe(
      response => {
        if (response && response === 'Correo enviado correctamente') {
          Swal.fire({
            title: '¡Correo enviado!',
            text: `El correo para la atención ${this.atencionId} ha sido enviado correctamente.`,
            icon: 'success',
            confirmButtonColor: '#416785',
            confirmButtonText: 'Aceptar',
            customClass: { popup: 'swal2-border-radius' },
            showClass: { popup: 'animate__animated animate__fadeInDown' },
            hideClass: { popup: 'animate__animated animate__fadeOutUp' }
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al enviar el correo. Inténtalo de nuevo.',
            icon: 'error',
            confirmButtonColor: '#FF0000',
            confirmButtonText: 'Aceptar'
          });
        }
      },
      error => {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al enviar el correo. Inténtalo de nuevo.',
          icon: 'error',
          confirmButtonColor: '#FF0000',
          confirmButtonText: 'Aceptar'
        });
      }
    );
  }

  atras() {
    if (this.atencionxmascotaxduenio && this.atencionxmascotaxduenio.length > 0) {
      this.router.navigate([`/atenciones/duenio/${this.atencionxmascotaxduenio[0].id_duenio}`]);
    } else {
      this.router.navigate(['/atenciones']);
    }
  }

  abrirModal(): void {
    if (this.isFinalizado()) {
      this.showErrorAlert('No se puede abrir', 'La atención está finalizada. No se pueden realizar cambios.');
      return;
    }
    const dialogRef = this.dialog.open(MedicamentoModalComponent, {
      width: '80vw',
      maxWidth: '1200px',
      minWidth: '350px',
      data: {},
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe((result: Medicamento | null) => {
      if (result) {
        this.listaMedicamentos.push(result);
        this.MostrarMedicamentos.push(result);
        this.listaMedicamentos = [...this.listaMedicamentos];
        this.MostrarMedicamentos = [...this.MostrarMedicamentos];
      }
    });
  }

  buscarMapa(correlativo: string): void {
    this.router.navigate([`/mapa/${this.detalles[0].correlativo}`]);
  }

  private showSuccessAlert(title: string, text: string): void {
    Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      confirmButtonColor: '#416785',
      confirmButtonText: 'Aceptar',
      customClass: { popup: 'swal2-border-radius' },
      showClass: { popup: 'animate__animated animate__fadeInDown' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' }
    });
  }

  private showErrorAlert(errorMessage: string, detailedText?: string): void {
    Swal.fire({
      title: 'Error',
      text: detailedText || errorMessage,
      icon: 'error',
      confirmButtonColor: '#FF0000',
      confirmButtonText: 'Aceptar'
    });
  }
}