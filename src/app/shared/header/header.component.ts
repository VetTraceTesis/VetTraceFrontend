import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { Usuario } from '../../model/usuarios.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{
   dropdownOpen = false;
  usuario: Usuario | null = null; 

  constructor(private router: Router,private authService:AuthService) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario();  
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }
  OpenPerfil(): void{
    this.router.navigate(['/perfil'])

  }

}
