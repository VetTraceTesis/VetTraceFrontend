import { Component, Inject,OnInit  } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AtencionXMascotaXDuenioService } from '../../../service/atencionXmascotaXduenio.service';  // Importar el servicio
import { DetalleAtencion } from '../../../model/atencionXmascotaXdueniodetalle.model';  // Importar el modelo
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';  // Importamos Router

@Component({
  selector: 'app-citas-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './citas-modal.component.html',
  styleUrl: './citas-modal.component.css'
})
export class CitasModalComponent implements OnInit {
  atencionId: number;
  detalleAtencion: DetalleAtencion | undefined;  // Detalle de la atención para mostrar en el modal

  constructor(
    public dialogRef: MatDialogRef<CitasModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,  // Recibe el parámetro
    private atencionService: AtencionXMascotaXDuenioService,  // Inyectamos el servicio
    private router: Router  // Inyectamos Router
  ) {
    this.atencionId = data.atencionId;  // Asigna el atencionId recibido
  }

  ngOnInit(): void {
    // Llamamos al servicio para obtener los detalles de la atención
    this.obtenerDetalles();
  }

  // Método para obtener los detalles de la atención
  obtenerDetalles(): void {
    this.atencionService.obtenerDetallesPorAtencion(this.atencionId).subscribe({
      next: (data) => {
        this.detalleAtencion = data[0];  // Asumimos que solo se devuelve un objeto
      },
      error: (err) => {
        console.error('Error al obtener los detalles de la atención:', err);
      }
    });
  }

  // Método para cerrar el modal
  closeModal(): void {
    this.dialogRef.close();
  }
   goToAtention(): void {
    // Redirige a la ruta de diagnóstico de atención, pasando el atencionId como parámetro
    this.router.navigate([`/atenciones/diagnostico/${this.atencionId}`]);
    this.closeModal();  // Opcional: Cierra el modal después de redirigir
  }
}
