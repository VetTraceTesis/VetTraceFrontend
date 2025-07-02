import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Mascota } from '../model/mascota.model';  // Importa el modelo de Mascota
import { AuthService } from './auth.service';  // Importamos el servicio de autenticación
import { environment } from '../environmets/environment.prod';  // Importamos el servicio de autenticación

@Injectable({
  providedIn: 'root'
})
export class MascotaService {
 private baseUrl = environment.apiUrl;
  private apiUrl = `${this.baseUrl}/mascota`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Método para obtener todas las mascotas
  getMascotas(): Observable<Mascota[]> {
    const token = this.authService.obtenerToken();  // Recuperar el token JWT
    
    if (!token) {
      console.error('No se encontró token JWT');
      return new Observable<Mascota[]>(); // Devuelve un observable vacío si no hay token
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Agregar el token al encabezado
    });

    // Hacer la solicitud GET con el token en el encabezado
    return this.http.get<Mascota[]>(this.apiUrl, { headers });
  }

  // Método para obtener las mascotas por el dueñoId
  getMascotasByDuenio(dueñoId: number): Observable<Mascota[]> {
    const token = this.authService.obtenerToken();  // Obtener el token desde el servicio AuthService
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Agregar el token al encabezado
    });

    // Hacer la solicitud GET al endpoint buscarPorDueño/{dueñoId}
    return this.http.get<Mascota[]>(`${this.apiUrl}/buscarPorDuenio/${dueñoId}`, { headers });
  }

  // Método para obtener un solo mascota por su ID
  getMascotaById(id: number): Observable<Mascota> {
    const token = this.authService.obtenerToken();  // Obtener el token desde el servicio AuthService
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Agregar el token al encabezado
    });
    return this.http.get<Mascota>(`${this.apiUrl}/${id}`, { headers });
  }

  // Método para actualizar una mascota existente
  updateMascota(mascota: Mascota): Observable<Mascota> {
    const token = this.authService.obtenerToken();  // Obtener el token desde el servicio AuthService
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);  // Agregar el token al encabezado

    return this.http.put<Mascota>(`${this.apiUrl}/${mascota.idPaciente}`, mascota, { headers });  // Incluir los encabezados con el token
  }

  // Método para agregar una nueva mascota
  addMascota(mascota: Mascota): Observable<Mascota> {
    const token = this.authService.obtenerToken();  // Obtener el token desde el servicio AuthService
    
    if (!token) {
      console.error('No se encontró el token JWT');
      return new Observable<Mascota>();  // Retorna un Observable vacío si no se encuentra el token
    }
  
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')  // Establecer el tipo de contenido como JSON
      .set('Authorization', `Bearer ${token}`);  // Añadir el token al encabezado
  
    // Asegúrate de no incluir el ID cuando la mascota es nueva
    const mascotaWithoutId = {
      ...mascota,
      idPaciente: undefined  // No enviar el ID si la mascota es nueva
    };
  
    // Realizamos la solicitud POST con los datos de la mascota y los encabezados configurados
    return this.http.post<Mascota>(this.apiUrl, mascotaWithoutId, { headers });
  }

  // 🆕 Subir imagen al servidor
  uploadImagenDoctor(imagen: File): Observable<{ ruta: string }> {
      const token = this.authService.obtenerToken();
      if (!token) {
        console.error('No se encontró token JWT');
        return of();
      }
      console.log("llega")
      const formData = new FormData();
      formData.append('imagen', imagen);
  
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
        // No pongas 'Content-Type': 'multipart/form-data', Angular lo configura automáticamente
      });
  
      return this.http.post<{ ruta: string }>(`${this.apiUrl}/upload-image`, formData, { headers });
    }
}
