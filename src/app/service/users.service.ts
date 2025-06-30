import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Usuario } from '../model/usuarios.model';
import { AuthService } from './auth.service';
import { environment } from '../environmets/environment.prod';  // Importamos el servicio de autenticación

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private baseUrl = environment.apiUrl;
  private apiUrl = `${this.baseUrl}/usuarios`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken() || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  registrarUsuario(usuario: Usuario): Observable<void> {
    const payload = { ...usuario, id: undefined };
    return this.http.post<void>(this.apiUrl, payload, { headers: this.getHeaders() })
      .pipe(
        catchError((err: HttpErrorResponse) => this.handleUsernameConflict(err))
      );
  }

  modificarUsuario(usuario: Usuario): Observable<void> {
    return this.http.put<void>(this.apiUrl, usuario, { headers: this.getHeaders() })
      .pipe(
        catchError((err: HttpErrorResponse) => this.handleUsernameConflict(err))
      );
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getNombreVeterinariaPorUsuario(veterinariaId: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/veterinaria/${veterinariaId}`, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  private handleUsernameConflict(err: HttpErrorResponse) {
    if (err.status === 409) {
      return throwError(() => new Error(err.error));
    }
    return throwError(() => err);
  }
}
