import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Atencion } from '../model/atenciones.model';  // Asegúrate de que el modelo esté bien importado
import { AuthService } from './auth.service';  // Importamos el servicio de autenticación

@Injectable({
  providedIn: 'root'
})
export class AtencionesService {

  private apiUrl = 'http://localhost:8080/Atencion'; // URL del backend

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Método para obtener todas las atenciones
  getAtenciones(): Observable<Atencion[]> {  // Usa el modelo Atencion aquí
    // Recuperar el token JWT
    const token = this.authService.obtenerToken();

    if (!token) {
      // Si no hay token, redirigir a login o manejar de alguna forma
      console.error('No se encontró token JWT');
      // Aquí podrías redirigir al usuario a la página de login:
      // this.router.navigate(['/login']);
      return new Observable<Atencion[]>(); // Devuelve un observable vacío
    }

    // Establecer los encabezados con el token JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Hacer la solicitud GET con el token en el encabezado
    return this.http.get<Atencion[]>(this.apiUrl, { headers });
  }
  // Método para obtener las atenciones por el dueñoId
   getAtencionesByDuenio(dueñoId: number): Observable<Atencion[]> {
    const token = this.authService.obtenerToken();  // Obtener el token desde el servicio AuthService
    
    if (!token) {
      console.error('No se encontró token JWT');
      return new Observable<Atencion[]>(); // Retorna un observable vacío si no se encuentra el token
    }

    // Agregar el token JWT a los encabezados de la solicitud
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Agregar el token al encabezado
    });

    // Realizamos la solicitud GET al endpoint '/Atencion/duenio/{dueñoId}'
    return this.http.get<Atencion[]>(`${this.apiUrl}/duenio/${dueñoId}`, { headers });
  }

  // Método para obtener una sola atencion por su ID
  getAtencionById(id: number): Observable<Atencion> {
    const token = this.authService.obtenerToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Atencion>(`${this.apiUrl}/${id}`, { headers });
  }

  // Método para actualizar una atencion
  updateAtencion(atencion: Atencion): Observable<Atencion> {
    const token = this.authService.obtenerToken();  // Obtener el token desde el servicio AuthService
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);  // Agregar el token al encabezado

    return this.http.put<Atencion>(`${this.apiUrl}/${atencion.id}`, atencion, { headers });  // Incluir los encabezados con el token
  }

  // Método para agregar una nueva atencion
  addAtencion(atencion: Atencion): Observable<Atencion> {
    const token = this.authService.obtenerToken();
    if (!token) {
      console.error('No se encontró el token JWT');
      return new Observable<Atencion>();
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    // Asegúrate de no incluir el ID cuando la atencion es nueva
    const atencionWithoutId = {
      ...atencion,
      id: undefined  // No enviar el ID si la atencion es nueva
    };

    return this.http.post<Atencion>(this.apiUrl, atencionWithoutId, { headers });
  }
}
