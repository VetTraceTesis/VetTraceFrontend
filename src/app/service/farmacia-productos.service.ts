// src/app/services/farmacia-productos.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { Medicamento } from '../model/farmacia-productos.model';
import { ProductoAll } from '../model/farmacia-productos-detalle.model';
import { shareReplay } from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FarmaciaProductosService {
  private apiUrl = 'http://localhost:8080/ProductoVeterinario';
  private productosCache$?: Observable<ProductoAll[]>;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /** Construye los headers con el token */
  private getHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken();
    if (!token) {
      console.error('No se encontró token JWT');
      // Podrías redirigir al login aquí si quieres
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /** Obtiene todos los productos veterinarios */
  getProductos(): Observable<Medicamento[]> {
    const headers = this.getHeaders();
    return this.http.get<Medicamento[]>(this.apiUrl, { headers });
  }
    getAllProductos(forceRefresh = false): Observable<ProductoAll[]> {
    if (!this.productosCache$ || forceRefresh) {
      const headers = this.getHeaders();
      this.productosCache$ = this.http
        .get<ProductoAll[]>(`${this.apiUrl}/allProducts`, { headers })
        .pipe(
          // cachea el último resultado y lo vuelve a emitir a nuevos suscriptores
          shareReplay(1)
        );
    }
    return this.productosCache$;
  }

  /** Obtiene un producto veterinario por su ID */
  getProductoById(id: number): Observable<Medicamento> {
    const headers = this.getHeaders();
    return this.http.get<Medicamento>(`${this.apiUrl}/listarId/${id}`, { headers });
  }

  /** Inserta un nuevo producto veterinario */
  addProducto(producto: Medicamento): Observable<Medicamento> {
    const headers = this.getHeaders().set('Content-Type', 'application/json');
    return this.http.post<Medicamento>(this.apiUrl, producto, { headers });
  }

  /** Elimina un producto veterinario por su ID */
  deleteProducto(id: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { headers });
  }



}
