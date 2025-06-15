import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { EmailRequestDTO } from '../model/reportepdf.model';  // Asegúrate de tener el modelo EmailRequestDTO

@Injectable({
  providedIn: 'root'
})
export class ReportePdfService {

  private apiUrl = 'http://localhost:8080/api/reportes'; // La URL de tu API

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Método para generar el reporte PDF y devolverlo como archivo
  generarReportePDF(idAtencion: number): Observable<Blob> {
    const url = `${this.apiUrl}/atencion/${idAtencion}`;
    return this.http.get(url, { headers: this.getHeaders(), responseType: 'blob' });
  }

// Método para enviar el reporte por correo
enviarReportePorCorreo(id: number): Observable<string> {
  const url = `${this.apiUrl}/enviarcorreo/${id}`;
  return this.http.get(url, { headers: this.getHeaders(), responseType: 'text' });  // Cambiar responseType a 'text'
}


   
}
