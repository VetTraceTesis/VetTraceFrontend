import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Diagnostico } from '../model/diagnostico.model'; // Asegúrate de crear este modelo
import { AuthService } from './auth.service';
import { environment } from '../environmets/environment.prod';  // Importamos el servicio de autenticación

@Injectable({
  providedIn: 'root'
})
export class DiagnosticoService {
  private baseUrl = environment.apiUrl;
  private apiUrl = `${this.baseUrl}/Diagnostico`;


  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  listar(): Observable<Diagnostico[]> {
    return this.http.get<Diagnostico[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  obtenerPorId(id: number): Observable<Diagnostico> {
    return this.http.get<Diagnostico>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  registrar(diagnostico: Diagnostico): Observable<Diagnostico> {
    const body = { ...diagnostico, id: undefined };  // No enviar id al crear
    return this.http.post<Diagnostico>(this.apiUrl, body, { headers: this.getHeaders() });
  }

modificar(diagnostico: Diagnostico): Observable<Diagnostico> {
  // Extraemos atencion_id del propio objeto
  const atencionId = diagnostico.atencion_id;

  // Preparamos el body con sólo los campos que tu DTO necesita
  const body = {
    id:           diagnostico.id,
    comentario:   diagnostico.comentario,
    resultado:    diagnostico.resultado,
    id_Estado:    diagnostico.id_Estado
    // atencion_id no hace falta, lo pasamos en la URL
  };

  return this.http.put<Diagnostico>(
    `${this.apiUrl}/${atencionId}`,
    body,
    { headers: this.getHeaders() }
  );
}


  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
