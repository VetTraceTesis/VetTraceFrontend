import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../model/usuarios.model';  // Modelo Usuario
import { AuthService } from './auth.service';  // Servicio de autenticación

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = 'http://localhost:8080/usuarios'; // URL backend usuarios

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken();
    if (!token) {
      console.error('No se encontró token JWT');
      // Opcional: lanzar error o manejar redirección aquí
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener todos los usuarios
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Obtener usuario por ID
  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Registrar un nuevo usuario
  registrarUsuario(usuario: Usuario): Observable<void> {
    const headers = this.getHeaders().set('Content-Type', 'application/json');
    const usuarioSinId = {
      ...usuario,
      id: undefined
    };
    return this.http.post<void>(this.apiUrl, usuarioSinId, { headers });
  }

  // Modificar usuario existente
  modificarUsuario(usuario: Usuario): Observable<void> {
    const headers = this.getHeaders().set('Content-Type', 'application/json');
    return this.http.put<void>(`${this.apiUrl}`, usuario, { headers });
  }

  // Eliminar usuario por ID
  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
