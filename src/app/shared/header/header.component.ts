import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { Usuario } from '../../model/usuarios.model';
import { UsuarioService } from '../../service/users.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{
   dropdownOpen = false;
  usuario: Usuario | null = null; 
  nombreVeterinaria: string = '';

  constructor(private router: Router,private authService:AuthService,private usuarioService:UsuarioService) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario();  
    console.log(this.usuario)
     if (this.usuario && this.usuario.id) {
      this.usuarioService.getNombreVeterinariaPorUsuario(this.usuario.veterinariaId).subscribe({
        next: (nombre) => {
          this.nombreVeterinaria = nombre;
          console.log(this.nombreVeterinaria)
        },
        error: (error) => {
          console.error('Error al obtener el nombre de la veterinaria:', error);
        }
      });
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }
  OpenPerfil(): void{
    this.router.navigate(['/perfil'])

  }

}
