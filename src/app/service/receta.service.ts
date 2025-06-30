import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Receta } from '../model/receta.model';  // Crea el modelo Receta con los campos correspondientes
import { AuthService } from './auth.service';
import { environment } from '../environmets/environment.prod';  // Importamos el servicio de autenticación

@Injectable({
  providedIn: 'root'
})
export class RecetaService {
private baseUrl = environment.apiUrl;
  private apiUrl = `${this.baseUrl}/Receta`;


  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  listar(): Observable<Receta[]> {
    return this.http.get<Receta[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  obtenerPorId(id: number): Observable<Receta> {
    return this.http.get<Receta>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  registrar(receta: Receta): Observable<Receta> {
    const body = { ...receta, id: undefined };  // No enviar id al crear
    return this.http.post<Receta>(this.apiUrl, body, { headers: this.getHeaders() });
  }

  modificar(receta: Receta): Observable<Receta> {
    return this.http.put<Receta>(this.apiUrl, receta, { headers: this.getHeaders() });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
