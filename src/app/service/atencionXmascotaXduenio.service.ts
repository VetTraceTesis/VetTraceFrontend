import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { AtencionXMascotaXDuenio } from '../model/atencionXmascotaXduenio.model';
import { DetalleAtencion } from '../model/atencionXmascotaXdueniodetalle.model'; // importa el nuevo modelo
import { environment } from '../environmets/environment.prod';  // Importamos el servicio de autenticación

@Injectable({
  providedIn: 'root'
})
export class AtencionXMascotaXDuenioService {
   private baseUrl = environment.apiUrl;

  private apiUrl = `${this.baseUrl}/AtencionXMascotaXDuenio`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  listar(): Observable<AtencionXMascotaXDuenio[]> {
    return this.http.get<AtencionXMascotaXDuenio[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  obtenerPorId(id: number): Observable<AtencionXMascotaXDuenio> {
    return this.http.get<AtencionXMascotaXDuenio>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  registrar(data: AtencionXMascotaXDuenio): Observable<AtencionXMascotaXDuenio> {
    const body = { ...data, idAtencionXMascota: undefined }; // no enviar id si es nuevo
    return this.http.post<AtencionXMascotaXDuenio>(this.apiUrl, body, { headers: this.getHeaders() });
  }
  obtenerDetallesPorAtencion(idAtencion: number): Observable<DetalleAtencion[]> {
    return this.http.get<DetalleAtencion[]>(`${this.apiUrl}/detalle/${idAtencion}`, { headers: this.getHeaders() });
  }
  obtenerInfoPorAtencion(idAtencion: number): Observable<AtencionXMascotaXDuenio[]> {
    return this.http.get<AtencionXMascotaXDuenio[]>(`${this.apiUrl}/porAtencion/${idAtencion}`, { headers: this.getHeaders() });
  }
  modificar(data: AtencionXMascotaXDuenio): Observable<AtencionXMascotaXDuenio> {
    return this.http.put<AtencionXMascotaXDuenio>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
