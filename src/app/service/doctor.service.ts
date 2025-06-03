import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Doctor } from '../model/doctor.model';  // Importa el modelo
import { AuthService } from './auth.service';  // Importamos el servicio de autenticación

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  private apiUrl = 'http://localhost:8080/doctorveterinario'; // URL del backend

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Método para obtener los doctores
  getDoctors(): Observable<Doctor[]> {  // Usa el modelo Doctor aquí
    // Recuperar el token JWT
    const token = this.authService.obtenerToken();
    
    if (!token) {
      // Si no hay token, redirigir a login o manejar de alguna forma
      console.error('No se encontró token JWT');
      // Aquí podrías redirigir al usuario a la página de login:
      // this.router.navigate(['/login']);
      return new Observable<Doctor[]>(); // Devuelve un observable vacío
    }

    // Establecer los encabezados con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Hacer la solicitud GET con el token en el encabezado
    return this.http.get<Doctor[]>(this.apiUrl, { headers });
  }

  // Método para obtener un solo doctor por su ID
  getDoctorById(id: number): Observable<Doctor> {
    const token = this.authService.obtenerToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Doctor>(`${this.apiUrl}/${id}`, { headers });
  }

  updateDoctor(doctor: Doctor): Observable<Doctor> {
    const token = this.authService.obtenerToken();  // Obtener el token desde el servicio AuthService
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);  // Agregar el token al encabezado

    return this.http.put<Doctor>(`${this.apiUrl}/${doctor.id}`, doctor, { headers });  // Incluir los encabezados con el token
  }
  addDoctor(doctor: Doctor): Observable<Doctor> {
    const token = this.authService.obtenerToken();
    if (!token) {
      console.error('No se encontró el token JWT');
      return new Observable<Doctor>();
    }
  
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  
    // Asegúrate de no incluir el ID cuando el doctor es nuevo
    const doctorWithoutId = {
      ...doctor,
      id: undefined  // No enviar el ID si el doctor es nuevo
    };
  
    return this.http.post<Doctor>(this.apiUrl, doctorWithoutId, { headers });
  }
  
  
  
      
}
