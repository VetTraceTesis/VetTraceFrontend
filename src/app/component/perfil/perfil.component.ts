import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../service/users.service'; // Importar el servicio
import { Usuario } from '../../model/usuarios.model';  // Modelo Usuario
import { CommonModule } from '@angular/common'; // 👈 Necesario para *ngIf
import { HeaderComponent } from '../../shared/header/header.component';
import { Location } from '@angular/common'; // Importar Location para la navegación hacia atrás

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule,HeaderComponent], // 👈 Agregado aquí
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  usuario: Usuario | null = null;

  constructor(private usuarioservice: UsuarioService, private location:Location) {}

  ngOnInit(): void {
    const idString = this.obtenerIdCookie('id');
    const id = idString ? parseInt(idString, 10) : null;  

    if (!id) {
      console.error('No se encontró el ID del usuario en la cookie o no es válido');
      return;
    }

    this.usuarioservice.getUsuarioById(id).subscribe({
      next: (usuario) => {
        this.usuario = usuario;
      },
      error: (err) => {
        console.error('Error al obtener el usuario:', err);
      }
    });
  }

  private obtenerIdCookie(nombre: string): string | null {
    const valor = `; ${document.cookie}`;
    const partes = valor.split(`; ${nombre}=`);
    if (partes.length === 2) return partes.pop()?.split(';').shift() || null;
    return null;
  }

  goBack(): void {
    this.location.back(); // Navegar hacia la página anterior en el historial
  }
}
