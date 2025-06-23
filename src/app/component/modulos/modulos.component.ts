import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { CommonModule } from '@angular/common'; // 👈 Necesario para *ngIf
import { Router } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-modulos',
  standalone: true,
  imports: [CommonModule,HeaderComponent], // 👈 Agregado aquí
  templateUrl: './modulos.component.html',
  styleUrls: ['./modulos.component.css']
})
export class ModulosComponent implements OnInit {
  rol: string | null = null;
  menuVisible = false; // Controla si el menú desplegable es visible

  constructor(private authService: AuthService, private router:Router) {}

  ngOnInit(): void {
    this.rol = this.authService.obtenerRol();
  }

  esAdmin(): boolean {
    return this.rol === 'Admin';
  }

  esUsuario(): boolean {
    return this.rol === 'Users';
  }
  toggleMenu(): void {
    this.menuVisible = !this.menuVisible;
  }

  logout(): void {
    this.authService.logout();
    this.menuVisible = false;
  }
  navigateToFarmacia():void{
    this.router.navigate(['/farmacia']);
  }
  navigateToDoctor(): void {
    this.router.navigate(['/doctor']);
  }
  navigateToDuenio
  (): void {
    this.router.navigate(['/duenio']);
  }
   navigateToCitas
  (): void {
    this.router.navigate(['/citas']);
  }
  navigateToAtenciones(): void{
    this.router.navigate(['/atenciones'])
  }
 navigateToMapa(): void{
    this.router.navigate(['/mapa'])
  }

}
