import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medicamento } from '../model/medicamento.model';  // Asegúrate de crear este modelo TS
import { AuthService } from './auth.service';
import { RecetaMedicamento } from '../model/RecetaMedicamentoDetalle.model';  // Asegúrate de crear este modelo TS

@Injectable({
  providedIn: 'root'
})
export class MedicamentoService {

  private apiUrl = 'http://localhost:8080/Medicamento';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  listar(): Observable<Medicamento[]> {
    return this.http.get<Medicamento[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  obtenerPorId(id: number): Observable<Medicamento> {
    return this.http.get<Medicamento>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  registrar(medicamento: Medicamento): Observable<Medicamento> {
    const body = { ...medicamento, id: undefined };  // No enviar id en creación
    return this.http.post<Medicamento>(this.apiUrl, body, { headers: this.getHeaders() });
  }

  modificar(medicamento: Medicamento): Observable<Medicamento> {
    return this.http.put<Medicamento>(this.apiUrl, medicamento, { headers: this.getHeaders() });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
    // Método para obtener los detalles de receta por correlativo
  getRecetaDetailsByCorrelativo(correlativo: string): Observable<RecetaMedicamento[]> {
    return this.http.get<RecetaMedicamento[]>(`${this.apiUrl}/receta-detalle/${correlativo}`, { headers: this.getHeaders() });
  }
}
