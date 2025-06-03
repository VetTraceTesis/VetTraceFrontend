import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { UsuarioService } from '../../service/users.service';  // Ajusta el path y nombre si es distinto
import { Usuario } from '../../model/usuarios.model';

import { LoginRequest } from '../../model/login.model';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  username: string = '';
  password: string = '';

  constructor(
    private authService: AuthService, 
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  login() {
    const credentials: LoginRequest = {
      username: this.username,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response && response.jwttoken) {
          // Guardar token, rol e id
          this.authService.guardarToken(response.jwttoken, response.rol, response.id);

          // Obtener usuario completo por id
          this.usuarioService.getUsuarioById(response.id).subscribe({
            next: (usuarioCompleto: Usuario) => {
              // Guardar usuario completo en AuthService
              this.authService.setUsuario(usuarioCompleto);
            console.log("Usuario guardado en AuthService:", this.authService.getUsuario());
              // Navegar a /modulos solo después de obtener el usuario completo
              this.router.navigate(['/modulos']);
            },
            error: (err:any) => {
              alert('Error al obtener datos del usuario.');
              console.error(err);
            }
          });

        } else {
          alert('Error: no se recibió jwttoken');
        }
      },
      error: () => {
        alert('Usuario o contraseña incorrectos.');
      }
    });
  }
}
