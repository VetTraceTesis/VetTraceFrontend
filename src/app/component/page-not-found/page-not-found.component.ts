import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Importa Router

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css'
})
export class PageNotFoundComponent {
 constructor(private router: Router) {} // Inyecta Router en el constructor

  goToHome(): void {
    this.router.navigate(['/']); // Navega a la ruta raíz
  }
}
