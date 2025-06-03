import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FarmaciasMapa } from '../model/farmaciasmapa.model'; // crea este modelo
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FarmaciasMapaService {

  private apiUrl = 'http://localhost:8080/farmaciamapa';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  listar(): Observable<FarmaciasMapa[]> {
    return this.http.get<FarmaciasMapa[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  obtenerPorId(id: number): Observable<FarmaciasMapa> {
    return this.http.get<FarmaciasMapa>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  registrar(farmacia: FarmaciasMapa): Observable<FarmaciasMapa> {
    const body = { ...farmacia, id: undefined };  // No enviar id al crear
    return this.http.post<FarmaciasMapa>(this.apiUrl, body, { headers: this.getHeaders() });
  }

  modificar(farmacia: FarmaciasMapa): Observable<FarmaciasMapa> {
    return this.http.put<FarmaciasMapa>(`${this.apiUrl}/${farmacia.id}`, farmacia, { headers: this.getHeaders() });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
