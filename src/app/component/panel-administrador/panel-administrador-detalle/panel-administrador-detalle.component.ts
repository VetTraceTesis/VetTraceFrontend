import { Component, Inject } from '@angular/core';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';
import { MatCheckboxModule }  from '@angular/material/checkbox';
import { CommonModule }       from '@angular/common';
import Swal from 'sweetalert2';
import { MatSelectModule } from '@angular/material/select';

import { Usuario }        from '../../../model/usuarios.model';
import { UsuarioService } from '../../../service/users.service';

@Component({
  selector: 'app-panel-administrador-detalle',
  standalone: true,
  imports: [
    MatDialogModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    CommonModule,
    MatSelectModule
  ],
  templateUrl: './panel-administrador-detalle.component.html',
  styleUrls: ['./panel-administrador-detalle.component.css']
})
export class PanelAdministradorDetalleComponent {
  usuarioEditable: Partial<Usuario> = {};

  constructor(
    public dialogRef: MatDialogRef<PanelAdministradorDetalleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Usuario | null,
    private usuarioService: UsuarioService
  ) {
    // Clonamos para edición o nuevo registro
    this.usuarioEditable = data ? { ...data } : {};
  }

  save(): void {
    if (this.data) {
      // Edición
      this.usuarioService.modificarUsuario(this.usuarioEditable as Usuario)
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Usuario actualizado',
              text: `El usuario '${this.usuarioEditable.username}' ha sido modificado con éxito.`,
              confirmButtonText: 'Aceptar'
            }).then(() => this.dialogRef.close(true));
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error al actualizar',
              text: err.message || 'Ocurrió un error inesperado al modificar el usuario.',
              confirmButtonText: 'Aceptar'
            });
          }
        });
    } else {
      // Creación
      this.usuarioService.registrarUsuario(this.usuarioEditable as Usuario)
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Usuario registrado',
              text: `El usuario '${this.usuarioEditable.username}' ha sido creado con éxito.`,
              confirmButtonText: 'Aceptar'
            }).then(() => this.dialogRef.close(true));
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error al registrar',
              text: err.message || 'Ocurrió un error inesperado al registrar el usuario.',
              confirmButtonText: 'Aceptar'
            });
          }
        });
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
