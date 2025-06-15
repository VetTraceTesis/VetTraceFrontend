import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DetalleAtencion } from '../../../../model/atencionXmascotaXdueniodetalle.model';  // importa el modelo
import { Diagnostico } from '../../../../model/diagnostico.model';  // importa el modelo
import { Receta } from '../../../../model/receta.model';  // importa el modelo
import { Medicamento } from '../../../../model/medicamento.model';  // importa el modelo
import { formatDate } from '@angular/common';
import { AtencionXMascotaXDuenio } from '../../../../model/atencionXmascotaXduenio.model';  // importa el modelo

import { ReportePdfService } from '../../../../service/reporte.service';

import { AtencionXMascotaXDuenioService } from '../../../../service/atencionXmascotaXduenio.service';
import { DiagnosticoService } from '../../../../service/diagnostico.service';
import { RecetaService } from '../../../../service/receta.service';
import { MedicamentoService } from '../../../../service/medicamento.service';
import { MedicamentoModalComponent } from './medicamento-modal/medicamento-modal.component';
import { HeaderComponent } from '../../../../shared/header/header.component';


import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';  // Importa el módulo de tabs
import { FormsModule } from '@angular/forms';   // Importamos FormsModule para usar ngModel
import { MatDialogModule } from '@angular/material/dialog';  // Importa MatDialogModule
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule }      from '@angular/material/icon';
import { MatInputModule }     from '@angular/material/input';    // <-- añadido
import { MatButtonModule }    from '@angular/material/button';   // <-- añadido
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';  // Importamos SweetAlert2 para alertas


@Component({
  selector: 'app-atenciones-diagnostico',
  standalone: true,
  imports: [CommonModule,MatTabsModule,FormsModule,MatDialogModule,MatFormFieldModule,MatIconModule,MatInputModule,MatButtonModule,HeaderComponent],
  templateUrl: './atenciones-diagnostico.component.html',
  styleUrls: ['./atenciones-diagnostico.component.css']
})
export class AtencionesDiagnosticoComponent implements OnInit {
  atencionId: string | null = null;

  detalles: DetalleAtencion[] = [];  // Aquí se almacenan los detalles recibidos
  recetas: any[] = [];

  diagnostico:Diagnostico ={
  id: 0,
  comentario: '',
  resultado: '',
  atencion_id: 0,
  id_Estado: 1
  };

  receta:Receta= {
  id: 0,
  comentarios: '',
  fechaCreacion: '', // Considera usar Date si vas a manejar fechas como objetos
  id_estado: 1,
  diagnostico_Id: 0
  } 


  medicamento:Medicamento= {
  id: 0,
  cantidad: 0,
  indicacion: '',
  id_receta: 0,
  }
AtencionXMascotaXDuenio :AtencionXMascotaXDuenio={
  id: 0,
  id_atencion: 0,
  id_mascota: 0,
  id_duenio: 0,
  id_estado: 0,
}

  listaMedicamentos: Medicamento[] = [];
  MostrarMedicamentos: Medicamento[] = [];
  atencionxmascotaxduenio:AtencionXMascotaXDuenio[]=[];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private atencionXmascotaXduenioService: AtencionXMascotaXDuenioService,  // inyecta el servicio
    private diagnosticoService: DiagnosticoService,  // inyecta el servicio
    private recetaService: RecetaService,  // inyecta el servicio
    private medicamentoService: MedicamentoService,  // inyecta el servicio
    private reportePdfService:ReportePdfService

  ) {
    // Obtener el parametro duenoId de la ruta actual
    this.atencionId = this.route.snapshot.paramMap.get('atencionId');
    console.log(this.atencionId," llega")
  }

ngOnInit(): void {
  if (!this.atencionId) return;

  const atencionIdNum = +this.atencionId;

 this.atencionXmascotaXduenioService.obtenerInfoPorAtencion(atencionIdNum).subscribe({
  next: detalle => {
    console.log(detalle," gaaa test")
    this.atencionxmascotaxduenio = detalle;
  },
  error: err => {
    console.error('Error al obtener info por atención:', err);
  }
});

  // 1) Cargar diagnóstico
  this.diagnosticoService.obtenerPorId(atencionIdNum).subscribe({
    next: diag => {
      this.diagnostico = diag;
      console.log("errorrr")
      // 2) Con el id de diagnóstico, pedir la receta
      this.recetaService.obtenerPorId(diag.id).subscribe({
        next: recet => {
          this.receta = recet;
          console.log(this.receta)
          // 3) Con el id de receta, pedir todos los medicamentos
          this.medicamentoService.obtenerPorId(recet.id).subscribe({
            next: meds => {
              // llena tu array de la tabla
              this.MostrarMedicamentos = ([] as Medicamento[]).concat(meds);
              
              console.log(this.MostrarMedicamentos ," ES LO QUE TRAE")
            },
            error: err => console.error('No pude cargar los medicamentos:', err)
          });

        },
        error: err => {
          if (err.status !== 404) {
            console.error('Error al cargar receta:', err);
          }
          // si no hay receta, deja listaMedicamentos vacía
        }
      });

    },
    error: err => {
      if (err.status === 404) {
        console.warn('No existe diagnóstico aún para esta atención');
      } else {
        console.error('Error al cargar diagnóstico:', err);
      }
    }
  });

  // 4) Detalles del dueño/mascota (puede ir separado)
  this.atencionXmascotaXduenioService
    .obtenerDetallesPorAtencion(atencionIdNum)
    .subscribe({
      next: data => this.detalles = data,
      error: err => console.error('Error al obtener detalles:', err)
    });
}


guardarDiagnostico(): void {
  if (!this.atencionId) {
    console.error('No hay atencionId en la ruta');
    return;
  }

  this.diagnostico.atencion_id = +this.atencionId;

  this.diagnosticoService.modificar(this.diagnostico)
    .subscribe({
      next: (updated) => {
        console.log('Diagnóstico actualizado:', updated);
        
        // **Reemplazamos todo el objeto**, de modo que ngModel refresca los inputs
        this.diagnostico = updated;

        // Mostrar alerta de éxito
        this.showSuccessAlert('¡Diagnóstico actualizado!', 'El diagnóstico ha sido actualizado correctamente.');
      },
      error: (err) => {
        console.error('Error al actualizar diagnóstico:', err);

        // Mostrar alerta de error
        this.showErrorAlert('Hubo un problema al actualizar el diagnóstico. Inténtalo de nuevo.');
      }
    });
}

guardarReceta() {
  if (!this.diagnostico) {
    console.error('No hay Diagnostico en la ruta');
    return;
  }
  
  console.log(this.diagnostico, "diagnostico que llega");

  // 1) Preparamos el DTO de Receta
  this.receta.diagnostico_Id = +this.diagnostico.id;
  this.receta.fechaCreacion = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  
  console.log(this.receta, "Lo que insertarmooos");

  // 2) Intentamos crear
  this.recetaService.registrar(this.receta).subscribe({
    next: (recetaGuardada) => {
      // Éxito en POST → seguimos con el flujo normal
      console.log('Receta guardada correctamente:', recetaGuardada);
      this.showSuccessAlert('Receta guardada', 'La receta ha sido guardada correctamente');
      this.procesarRecetaYMedicamentos(recetaGuardada);
    },
    error: (err: HttpErrorResponse) => {
      if (err.status === 409 && err.error === 'duplicated') {
        console.log("entra al caso 2");
        // Ya existía → hacemos PUT para actualizar
        this.recetaService.modificar(this.receta).subscribe({
          next: (recetaActualizada) => {
            console.log('Receta actualizada correctamente:', recetaActualizada);
            this.showSuccessAlert('Receta actualizada', 'La receta se ha actualizado correctamente');
            this.procesarRecetaYMedicamentos(recetaActualizada);
          },
          error: (putErr) => {
            console.error('Error al actualizar receta existente:', putErr);
            this.showErrorAlert('Error al actualizar receta');
          }
        });
      } else {
        console.error('Error al guardar receta:', err);
        this.showErrorAlert('Error al guardar receta');
      }
    }
  });
}

private procesarRecetaYMedicamentos(recetaDTO: Receta) {
  console.log('Receta final recibida:', recetaDTO);
  this.receta = recetaDTO;

  if (!this.listaMedicamentos) {
    console.log('listaMedicamentos es null o undefined');
    return;
  }

  if (this.listaMedicamentos.length === 0) {
    console.log('listaMedicamentos está vacía, no hay medicamentos para procesar');
    return;
  }

  console.log(`Procesando ${this.listaMedicamentos.length} medicamentos...`);

  let medicamentosProcesados = 0;
  let errorEnMedicamento = false;

  this.listaMedicamentos.forEach((med, idx) => {
    if (!med) {
      console.warn(`Medicamento índice ${idx} es null o undefined, se omite.`);
      return;
    }

    console.log(`Procesando medicamento índice ${idx}:`, med);

    med.id_receta = this.receta.id;
    console.log(`Asignado id_receta=${med.id_receta} al medicamento índice ${idx}`);

    this.medicamentoService.registrar(med).subscribe({
      next: (medGuardado) => {
        if (!medGuardado) {
          return;
        }
        console.log(`Medicamento ${idx + 1} guardado exitosamente:`, medGuardado);

        // Limpia elementos inválidos antes de actualizar MostrarMedicamentos
        const originalLength = this.MostrarMedicamentos.length;
        this.MostrarMedicamentos = this.MostrarMedicamentos.filter(m => m != null);
        if (this.MostrarMedicamentos.length !== originalLength) {
          console.log(`Se removieron elementos nulos de MostrarMedicamentos, ahora tiene ${this.MostrarMedicamentos.length} elementos.`);
        }

        const i = this.MostrarMedicamentos.findIndex(m => m.id === medGuardado.id);
        console.log(`Índice del medicamento guardado en MostrarMedicamentos: ${i}`);

        if (i !== -1) {
          this.MostrarMedicamentos[i] = medGuardado;
          console.log(`Medicamento actualizado en MostrarMedicamentos en la posición ${i}`);
        } else {
          this.MostrarMedicamentos.push(medGuardado);
          this.MostrarMedicamentos = [...this.MostrarMedicamentos];
          console.log(`Medicamento agregado a MostrarMedicamentos. Total ahora: ${this.MostrarMedicamentos.length}`);
        }

        // Incrementar los medicamentos procesados
        medicamentosProcesados++;

      },
      error: (medErr) => {
        console.error(`Error al guardar medicamento índice ${idx}:`, medErr);
        errorEnMedicamento = true;
      }
    });
  });

  // Mostrar mensaje de éxito después de procesar todos los medicamentos
  if (!errorEnMedicamento) {
    this.showSuccessAlert(
      '¡Medicamentos procesados!',
      `Se han procesado correctamente ${medicamentosProcesados} medicamento(s).`
    );
  } else {
    this.showErrorAlert('Hubo un problema al guardar algunos medicamentos. Por favor, inténtalo de nuevo.');
  }

  this.listaMedicamentos = [];
  console.log('listaMedicamentos limpiada después de procesar.');
}



generarReporte(): void {
  // Llamar al servicio para obtener el archivo PDF como Blob
  this.reportePdfService.generarReportePDF(Number(this.atencionId)).subscribe((blob: Blob) => {
    // Crear una URL para el blob y generar un enlace de descarga
    const url = window.URL.createObjectURL(blob);
    
    // Crear un enlace <a> para realizar la descarga
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_atencion_${this.atencionId }.pdf`;  // Puedes personalizar el nombre del archivo
    a.click();
    
    // Liberar el objeto URL después de usarlo
    window.URL.revokeObjectURL(url);

    // Mostrar una alerta de éxito con SweetAlert2
    Swal.fire({
      title: '¡Reporte generado!',
      text: `El reporte para la atención ${this.atencionId} se ha generado correctamente.`,
      icon: 'success',
      confirmButtonColor: '#416785',
      confirmButtonText: 'Aceptar',
      customClass: {
        popup: 'swal2-border-radius'
      },
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });

  }, error => {
    console.error('Error al generar el reporte PDF', error);

    // Mostrar una alerta de error si algo falla
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

  // Mostrar alerta de "Cargando" mientras esperamos la respuesta
  Swal.fire({
    title: 'Enviando correo...',
    text: 'Por favor, espera mientras enviamos el correo.',
    icon: 'info',
    showCancelButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();  // Mostrar el icono de carga mientras esperamos
    }
  });

  this.reportePdfService.enviarReportePorCorreo(Number(this.atencionId)).subscribe(
    response => {
      // Verificamos la respuesta del backend
      if (response && response === 'Correo enviado correctamente') {
        // Alerta de éxito cuando el correo se ha enviado correctamente
        Swal.fire({
          title: '¡Correo enviado!',
          text: `El correo para la atención ${this.atencionId} ha sido enviado correctamente.`,
          icon: 'success',
          confirmButtonColor: '#416785',
          confirmButtonText: 'Aceptar',
          customClass: {
            popup: 'swal2-border-radius'
          },
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          }
        });
        console.log('Correo enviado correctamente:', response);
      } else {
        // Si la respuesta no es la esperada, mostramos un error
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al enviar el correo. Inténtalo de nuevo.',
          icon: 'error',
          confirmButtonColor: '#FF0000',
          confirmButtonText: 'Aceptar'
        });
        console.error('Error al enviar correo:', response);
      }
    },
    error => {
      // Alerta de error si no se pudo enviar el correo
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al enviar el correo. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonColor: '#FF0000',
        confirmButtonText: 'Aceptar'
      });
      console.error('Error al enviar correo:', error);
    }
  );
}



atras() {
  console.log(this.atencionxmascotaxduenio,"GAAAAAAAAAAAAA");
  console.log(this.atencionxmascotaxduenio)
  if (this.atencionxmascotaxduenio && this.atencionxmascotaxduenio.length > 0) {
    // Accede a la propiedad del primer elemento del array
    this.router.navigate([`/atenciones/duenio/${this.atencionxmascotaxduenio[0].id_duenio}`]);
  } else {
    this.router.navigate(['/atenciones']);
  }
}


  abrirModal(): void {
    const dialogRef = this.dialog.open(MedicamentoModalComponent, {
      width: '600px',
      data: {
        // aquí puedes pasar cualquier dato al modal
      }
    });
    dialogRef.afterClosed().subscribe((result: Medicamento | null) => {
    if (result) {
      console.log('Medicamento recibido del modal:', result);
      // Aquí ya recibiste el medicamento: puedes llamar al servicio
      this.listaMedicamentos.push(result);
      this.MostrarMedicamentos.push(result);

     this.listaMedicamentos = [...this.listaMedicamentos];
      this.MostrarMedicamentos = [...this.MostrarMedicamentos];
    } else {
      console.log('El modal se cerró sin guardar.');
    }
  });
    
  }

  
// Mostrar alerta de éxito
private showSuccessAlert(title: string, text: string): void {
  Swal.fire({
    title: title,
    text: text,
    icon: 'success',
    confirmButtonColor: '#416785',
    confirmButtonText: 'Aceptar',
    customClass: {
      popup: 'swal2-border-radius'
    },
    showClass: {
      popup: 'animate__animated animate__fadeInDown'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp'
    }
  });
}

// Mostrar alerta de error
private showErrorAlert(errorMessage: string): void {
  Swal.fire({
    title: 'Error',
    text: errorMessage,
    icon: 'error',
    confirmButtonColor: '#FF0000',
    confirmButtonText: 'Aceptar'
  });
}
}
