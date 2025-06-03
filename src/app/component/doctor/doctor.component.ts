import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { DoctorService } from '../../service/doctor.service';
import { HeaderComponent } from '../../shared/header/header.component';

import { Doctor } from '../../model/doctor.model';  
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';  
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule,HeaderComponent],  
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.css']
})
export class DoctorComponent implements OnInit, AfterViewInit {

  @ViewChild('gridContainer', { static: false }) gridContainer!: ElementRef<HTMLDivElement>;

  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  paginatedDoctors: Doctor[] = [];
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 2; // se actualizará dinámicamente

  resizeObserver!: ResizeObserver;

  constructor(private doctorService: DoctorService, private router: Router) { }

  ngOnInit(): void {
    this.getDoctors();
  }

  ngAfterViewInit(): void {
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  setupResizeObserver(): void {
    if (!this.gridContainer) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.calculateItemsPerPage();
    });
    this.resizeObserver.observe(this.gridContainer.nativeElement);

    // Ejecutar una vez al inicio
    this.calculateItemsPerPage();
  }

  getDoctors(): void {
    this.doctorService.getDoctors().subscribe((data) => {
      this.doctors = data.sort((a, b) => a.id - b.id);
      this.filteredDoctors = [...this.doctors];
      this.currentPage = 1;
      this.updatePagination();
    });
  }

  filterDoctors(): void {
    const term = this.searchTerm?.toLowerCase() || '';
    this.filteredDoctors = this.doctors.filter(d =>
      d.nombre.toLowerCase().includes(term) || d.apellido.toLowerCase().includes(term)
    );
    this.currentPage = 1;
    this.updatePagination();
  }

calculateItemsPerPage(): void {
  if (!this.gridContainer) return;

  const containerWidth = this.gridContainer.nativeElement.clientWidth;

  const cardMinWidth = 150;
  const gap = 16;

  let itemsPerRow = Math.floor(containerWidth / (cardMinWidth + gap));
  itemsPerRow = itemsPerRow > 0 ? itemsPerRow : 1;

  if (itemsPerRow > 5) {
    itemsPerRow = 5;
  }

  const maxRows = 3;

  this.itemsPerPage = maxRows * itemsPerRow;

  // Reinicia siempre en página 1 cuando cambia itemsPerPage
  this.currentPage = 1;

  this.updatePagination();
}


updatePagination(): void {
  this.totalPages = Math.ceil(this.filteredDoctors.length / this.itemsPerPage);
  if (this.totalPages === 0) this.totalPages = 1;

  // Si currentPage es mayor al totalPages, reajustar al máximo válido
  if (this.currentPage > this.totalPages) {
    this.currentPage = this.totalPages;
  }

  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  this.paginatedDoctors = this.filteredDoctors.slice(startIndex, startIndex + this.itemsPerPage);
}


  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToDoctorDetail(doctorId: number): void {
    this.router.navigate(['/doctor-detail', doctorId]); 
  }

  goToAddDoctor(): void {
    this.router.navigate(['/doctor-veterinario/nuevo']);  
  }

  goBack(): void {
    this.router.navigate(['/modulos']);  
  }

  // Propiedad para binding en HTML
  searchTerm: string = '';
}
