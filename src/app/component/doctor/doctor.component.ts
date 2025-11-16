  import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
  import { DoctorService } from '../../service/doctor.service';
  import { HeaderComponent } from '../../shared/header/header.component';

  import { Doctor } from '../../model/doctor.model';  
  import { CommonModule } from '@angular/common';
  import { HttpClientModule } from '@angular/common/http';
  import { Router } from '@angular/router';  
  import { FormsModule } from '@angular/forms'; 
  import { MatDialog } from '@angular/material/dialog';
  import { DoctorDetalleComponent } from './doctor-detalle/doctor-detalle.component';

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

    constructor(private doctorService: DoctorService, private router: Router, public dialog: MatDialog) { }

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
    //this.currentPage = 1;

    this.updatePagination();
  }


  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredDoctors.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;

    // Asegúrate de que currentPage no sea mayor que totalPages
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    // Evitar que currentPage se ajuste innecesariamente a la página 1
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedDoctors = this.filteredDoctors.slice(startIndex, startIndex + this.itemsPerPage);
  }



    prevPage(): void {
      console.log(this.currentPage)
      if (this.currentPage > 1) {
        console.log(this.currentPage)
        this.currentPage--;
        console.log(this.currentPage)
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
  openDoctorModal(): void {
    const dialogRef = this.dialog.open(DoctorDetalleComponent, {
      width: '80vw',  
      maxWidth: '1200px',  
      minWidth: '350px', 
      data: {
        doctor: { id: 0, nombre: '', apellido: '', telefono: '', email: '', fecharegistro: '', cmvp: '' } 
      },
        position: { bottom: '70px' }  
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getDoctors();  
      }
    });
  }

  openDoctorDetailModal(doctorId: number): void {
    const doctor = this.doctors.find(d => d.id === doctorId);
    if (doctor) {
      const dialogRef = this.dialog.open(DoctorDetalleComponent, {
        width: '80vw',  
        maxWidth: '1200px',  
        minWidth: '350px',  
        data: { doctor },
        position: { bottom: '70px' }  

      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.getDoctors(); 
        }
      });
    }
  }

    // Propiedad para binding en HTML
    searchTerm: string = '';
  }
