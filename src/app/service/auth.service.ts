import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest } from '../model/login.model';
import { LoginResponse } from '../model/login-response.model';
import { Usuario } from '../model/usuarios.model';  // Modelo Usuario

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/autenticar';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(this.apiUrl, credentials);
  }

  guardarToken(jwttoken: string, rol: string,id:number) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `jwttoken=${jwttoken}; expires=${expires}; path=/`;
    document.cookie = `rol=${rol}; expires=${expires}; path=/`;
    document.cookie = `id=${id}; expires=${expires}; path=/`;

  }

  obtenerToken(): string | null {
    const match = document.cookie.match(/(^| )jwttoken=([^;]+)/);
    return match ? match[2] : null;
  }

  obtenerRol(): string | null {
    const match = document.cookie.match(/(^| )rol=([^;]+)/);
    return match ? match[2] : null;
  }

  logout() {
    document.cookie = 'jwttoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'rol=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    this.router.navigate(['/']);
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }
  private usuarioCompleto: Usuario | null = null;

setUsuario(usuario: Usuario): void {
  this.usuarioCompleto = usuario;
  localStorage.setItem('usuarioCompleto', JSON.stringify(usuario));  // ✅ persistente
}

getUsuario(): Usuario | null {
  if (this.usuarioCompleto) {
    return this.usuarioCompleto;
  }

  const usuarioGuardado = localStorage.getItem('usuarioCompleto');
  if (usuarioGuardado) {
    this.usuarioCompleto = JSON.parse(usuarioGuardado);  // ✅ recuperar
    return this.usuarioCompleto;
  }

  return null;
}


}
