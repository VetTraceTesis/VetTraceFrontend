import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AtencionesService } from '../../service/atenciones.service';
import { Atencion } from '../../model/atenciones.model';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CitasModalComponent } from './citas-modal/citas-modal.component';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule,MatDialogModule,HeaderComponent],
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent implements OnInit {
  atenciones: Atencion[] = [];
  currentWeekStart: Date = new Date(); // Semana actual
  weekDates: { name: string, date: string, day: number }[] = []; // Array con nombre del día, fecha y día del mes
  hours: string[] = Array.from({ length: 24 }, (_, i) => `${i}:00`); // 24 horas
  calendar: { [key: string]: { [hour: number]: Atencion[] } } = {}; // Calendario
  weekDateRange: string = ''; // Rango de fechas para la navegación

  constructor(private atencionesService: AtencionesService, private router:Router, private dialog:MatDialog) {}

  ngOnInit(): void {
    this.obtenerAtenciones();
    this.generateCalendar();
  }

  // Obtener las atenciones desde el servicio
  obtenerAtenciones(): void {
    this.atencionesService.getAtenciones().subscribe({
      next: (data) => {
        this.atenciones = data;
        this.generateCalendar();
      },
      error: (err) => {
        console.error('Error al obtener las atenciones:', err);
      }
    });
  }

  // Función para generar el calendario de la semana (lunes a domingo, 24 horas)
  generateCalendar(): void {
    console.log('Generando calendario...');
    console.log('Fecha de inicio de la semana actual:', this.currentWeekStart);

    // Limpiar el calendario actual antes de llenarlo de nuevo
    this.calendar = {};

    this.weekDates = this.getWeekDates(this.currentWeekStart); // Genera los nombres de los días y fechas de la semana

    console.log('Fechas de la semana:', this.weekDates);

    // Inicializamos el calendario con un objeto vacío
    this.calendar = this.weekDates.reduce((acc, day) => {
      acc[day.name] = Array.from({ length: 24 }, () => []); // 24 horas, cada hora es un array vacío
      return acc;
    }, {} as { [key: string]: { [hour: number]: Atencion[] } });

    // Recorrer las atenciones y ubicarlas en el calendario
    this.atenciones.forEach((atencion) => {
      const fechaInicio = new Date(atencion.fechaInicio);
      const dia = this.getDayName(fechaInicio.getDay()); // Obtener el nombre del día
      const hora = fechaInicio.getHours();

      // Verificamos si la atención está en la semana actual
      const isInWeek = this.weekDates.some((day) => day.date === formatDate(fechaInicio, 'yyyy-MM-dd', 'en-US'));

      // Si la atención está en la semana actual, la registramos
      if (isInWeek) {
        this.calendar[dia][hora].push(atencion);
      }
    });

    // Establecer el rango de fechas para la navegación
    this.setWeekDateRange();
    console.log('Rango de fechas de la semana:', this.weekDateRange);
  }

  // Función para obtener los días de la semana (Lunes, Martes, ...) y sus fechas
  getWeekDates(startDate: Date): { name: string, date: string, day: number }[] {
    const weekDays = [];
    const start = new Date(startDate);
    const dayOfWeek = start.getDay(); // Obtiene el día de la semana (0 = Domingo, 1 = Lunes, etc.)
    
    // Ajustamos el inicio para que sea el lunes
    start.setDate(start.getDate() - dayOfWeek);

    // Crear los días de la semana (Lunes, Martes, ...) y sus fechas
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      weekDays.push({
        name: this.getDayName(date.getDay()), // Nombre del día (Lunes, Martes, ...)
        date: formatDate(date, 'yyyy-MM-dd', 'en-US'), // Fecha en formato yyyy-MM-dd
        day: date.getDate() // Día del mes
      });
    }

    return weekDays;
  }

  // Función para obtener el nombre del día a partir del valor del día (0 = Domingo, 1 = Lunes, ...)
  getDayName(dayIndex: number): string {
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return daysOfWeek[dayIndex];
  }

  // Función para navegar a la semana siguiente
  nextWeek(): void {
    console.log('Navegando a la semana siguiente...');
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7); // Avanzar 7 días
    this.currentWeekStart = this.getMonday(this.currentWeekStart); // Ajustamos para que empiece el lunes
    console.log('Fecha de inicio de la nueva semana:', this.currentWeekStart);
    this.generateCalendar(); // Regenera el calendario con la nueva fecha
  }

  // Función para navegar a la semana anterior
  previousWeek(): void {
    console.log('Navegando a la semana anterior...');
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7); // Retroceder 7 días
    this.currentWeekStart = this.getMonday(this.currentWeekStart); // Ajustamos para que empiece el lunes
    console.log('Fecha de inicio de la nueva semana:', this.currentWeekStart);
    this.generateCalendar(); // Regenera el calendario con la nueva fecha
  }

  // Función para obtener el lunes de la semana (ajustamos cualquier fecha para que sea el lunes de esa semana)
  getMonday(date: Date): Date {
    const dayOfWeek = date.getDay();
    const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek; // Si es domingo (0), ajustamos a -6
    date.setDate(date.getDate() + diff); // Ajustamos la fecha al lunes
    return date;
  }

  // Función para establecer el rango de fechas para la navegación
  setWeekDateRange(): void {
    const start = this.weekDates[0].date; // Fecha de inicio
    const end = this.weekDates[6].date; // Fecha de fin
    this.weekDateRange = `${start} al ${end}`; // Establecemos el rango de fechas
  }

  // Función para ir a la fecha de hoy
  goToToday(): void {
    this.currentWeekStart = new Date(); // Establecemos la fecha de inicio de la semana a hoy
    this.generateCalendar(); // Regeneramos el calendario
  }
  getHourIndex(hora: string): number {
  return parseInt(hora.split(':')[0], 10);
}
 // Método para regresar a la página de módulos
  goBack(): void {
    this.router.navigate(['/modulos']);
  }

   openModal(atencionId: number): void {
    const dialogRef = this.dialog.open(CitasModalComponent, {
      data: { atencionId }, // Pasa el atencionId al modal
    });

    dialogRef.afterClosed().subscribe(result => {
      // Opcional: Puedes manejar lo que sucede después de cerrar el modal
      console.log('El modal se cerró');
    });
  }
}
