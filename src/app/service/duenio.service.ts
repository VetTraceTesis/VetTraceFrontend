import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Duenio } from '../model/duenio.model';  // Importa el modelo de Duenio
import { AuthService } from './auth.service';  // Importamos el servicio de autenticación

@Injectable({
  providedIn: 'root'
})
export class DuenioService {

  private apiUrl = 'http://localhost:8080/duenio'; // URL del backend para los dueños

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Método para obtener los dueños
  getDuenios(): Observable<Duenio[]> {  // Usa el modelo Duenio aquí
    const token = this.authService.obtenerToken();  // Recuperar el token JWT
    
    if (!token) {
      console.error('No se encontró token JWT');
      return new Observable<Duenio[]>(); // Devuelve un observable vacío si no hay token
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Agregar el token al encabezado
    });

    // Hacer la solicitud GET con el token en el encabezado
    return this.http.get<Duenio[]>(this.apiUrl, { headers });
  }

  // Método para obtener un solo dueño por su ID
  getDuenioById(id: number): Observable<Duenio> {
    const token = this.authService.obtenerToken();  // Obtener el token desde el servicio AuthService
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Agregar el token al encabezado
    });
    return this.http.get<Duenio>(`${this.apiUrl}/${id}`, { headers });
  }

  // Método para actualizar un dueño existente
  updateDuenio(duenio: Duenio): Observable<Duenio> {
    const token = this.authService.obtenerToken();  // Obtener el token desde el servicio AuthService
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);  // Agregar el token al encabezado

    return this.http.put<Duenio>(`${this.apiUrl}/${duenio.id}`, duenio, { headers });  // Incluir los encabezados con el token
  }

  // Método para agregar un nuevo dueño
  addDuenio(duenio: Duenio): Observable<Duenio> {
    const token = this.authService.obtenerToken();  // Obtener el token desde el servicio AuthService
    
    if (!token) {
      console.error('No se encontró el token JWT');
      return new Observable<Duenio>();  // Retorna un Observable vacío si no se encuentra el token
    }
  
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')  // Establecer el tipo de contenido como JSON
      .set('Authorization', `Bearer ${token}`);  // Añadir el token al encabezado
  
    // Asegúrate de no incluir el ID cuando el dueño es nuevo
    const duenioWithoutId = {
      ...duenio,
      id: undefined  // No enviar el ID si el dueño es nuevo
    };
  
    // Realizamos la solicitud POST con los datos del dueño y los encabezados configurados
    return this.http.post<Duenio>(this.apiUrl, duenioWithoutId, { headers });
  }
}
