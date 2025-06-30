import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Doctor } from '../model/doctor.model';
import { AuthService } from './auth.service';
import { environment } from '../environmets/environment.prod';  // Importamos el servicio de autenticación

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
    private baseUrl = environment.apiUrl;
  private apiUrl = `${this.baseUrl}/doctorveterinario`;


  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Obtener todos los doctores
  getDoctors(): Observable<Doctor[]> {
    const token = this.authService.obtenerToken();
    if (!token) {
      console.error('No se encontró token JWT');
      return of([]); // observable vacío más limpio
    }
    return this.http.get<Doctor[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Obtener doctor por ID
  getDoctorById(id: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Actualizar doctor
  updateDoctor(doctor: Doctor): Observable<Doctor> {
    return this.http.put<Doctor>(`${this.apiUrl}/${doctor.id}`, doctor, { headers: this.getHeaders() });
  }

  // Agregar nuevo doctor
  addDoctor(doctor: Doctor): Observable<Doctor> {
    const token = this.authService.obtenerToken();
    if (!token) {
      console.error('No se encontró el token JWT');
      return of(); // observable vacío
    }

    const doctorWithoutId = {
      ...doctor,
      id: undefined
    };

    return this.http.post<Doctor>(this.apiUrl, doctorWithoutId, { headers: this.getHeaders() });
  }

  // Obtener solo doctores activos (nombre y apellido)
  getDoctoresActivos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/activos`, { headers: this.getHeaders() });
  }
}
