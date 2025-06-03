import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';  // Importamos Router para la redirección
import { DuenioService } from '../../service/duenio.service'; // Asegúrate de importar tu servicio
import { Duenio } from '../../model/duenio.model';  // Importamos el modelo de Duenio
import { FormsModule } from '@angular/forms';  // Importamos FormsModule
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-duenio',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './duenio.component.html',
  styleUrl: './duenio.component.css'
})
export class DuenioComponent implements OnInit {

  duenios: Duenio[] = [];  // Aquí almacenamos todos los dueños
  filteredDuenios: Duenio[] = [];  // Aquí almacenamos los dueños filtrados
  searchTerm: string = '';  // Para realizar la búsqueda de dueños

  constructor(
    private duenioService: DuenioService,  // Inyectamos el servicio de dueños
    private router: Router  // Inyectamos el router para manejar la navegación
  ) { }

  ngOnInit(): void {
    // Cargar los dueños al iniciar
    this.loadDuenios();
  }

  // Método para cargar los dueños desde el backend
  loadDuenios(): void {
    this.duenioService.getDuenios().subscribe(
      (duenios) => {
        this.duenios = duenios;
        this.filteredDuenios = duenios;  // Mostrar todos los dueños por defecto
      },
      (error) => {
        console.error('Error al cargar los dueños:', error);
      }
    );
  }

  // Método para filtrar dueños basados en la búsqueda
  filterDuenios(): void {
    if (!this.searchTerm) {
      this.filteredDuenios = this.duenios;  // Si no hay búsqueda, mostrar todos los dueños
    } else {
      this.filteredDuenios = this.duenios.filter(duenio =>
        duenio.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        duenio.apellido.toLowerCase().includes(this.searchTerm.toLowerCase())  // Filtrar por nombre o apellido
      );
    }
  }

  // Método para redirigir al detalle del dueño
  goToDuenioDetail(id: number): void {
    console.log(id)
    this.router.navigate([`/duenio-detalle/${id}`]);  // Redirigir a la página de detalle del dueño
  }

  // Método para redirigir a la página de agregar nuevo dueño
  goToAddDuenio(): void {
    console.log("llega")
    this.router.navigate(['/duenio/nuevo']);  // Redirigir a la página de agregar nuevo dueño
  }

  // Método para redirigir al listado de módulos
  goBack(): void {
    this.router.navigate(['/modulos']);  // Redirigir a la página de módulos
  }
}