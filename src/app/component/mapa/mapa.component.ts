import { Component, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { FormsModule } from '@angular/forms';
import { ReportePdfService } from '../../service/reporte.service';

import { RecetaMedicamento } from '../../model/RecetaMedicamentoDetalle.model';
import { FarmaciasMapa } from '../../model/farmaciasmapa.model';
import { FarmaciasMapaService } from '../../service/farmaciasmapa.service';
import { MedicamentoService } from '../../service/medicamento.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { MatIconModule }      from '@angular/material/icon';
import Swal from 'sweetalert2';

interface MarkerOption {
  position: google.maps.LatLngLiteral;
  title: string;
  icon?: google.maps.Icon | google.maps.Symbol;
  [key: string]: any;
}

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [
    CommonModule,
    GoogleMapsModule,
    HeaderComponent,
    FormsModule,
    MatIconModule
  ],
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class MapaComponent implements OnInit {
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;

  recetaMedicamento: RecetaMedicamento[] = [];
  farmacias: FarmaciasMapa[] = [];
  farmaciasValidas: FarmaciasMapa[] = [];

  zoom = 13;
  center: google.maps.LatLngLiteral = { lat: -12.0464, lng: -77.0428 };

  markersOptions: MarkerOption[] = [];
  selectedMarkerIndex = -1;

  correlativo = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private farmaciasMapaService: FarmaciasMapaService,
    private medicamentoService: MedicamentoService,
    private reportePdfService: ReportePdfService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const corr = params.get('correlativo');
      if (corr) {
        this.correlativo = corr;
        this.addMarkerFromCorrelativo();
        this.loadMapa();
      } else {
        this.loadMapa();
      }
    });
  }

  private loadMapa(): void {
    this.farmaciasMapaService.listar().subscribe(
      farmacias => {
        this.farmaciasValidas = farmacias
          .filter(f => !isNaN(Number(f.lat)) && !isNaN(Number(f.lng)))
          .map(f => ({
            ...f,
            lat: typeof f.lat === 'number' ? f.lat : parseFloat(f.lat as any),
            lng: typeof f.lng === 'number' ? f.lng : parseFloat(f.lng as any)
          }));

        // Mostrar todos los marcadores al cargar inicialmente (si no se ha buscado por correlativo)
        if (!this.correlativo) {
          this.markersOptions = this.farmaciasValidas.map(f => ({
            position: { lat: f.lat, lng: f.lng },
            title: f.nombre ?? 'Sin nombre',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: 'blue',
              fillOpacity: 0.8,
              strokeWeight: 0,
              scale: 6
            }
          }));
        }
      },
      error => console.error('Error al cargar farmacias:', error)
    );
  }

  /** Calcula distancia en km entre dos puntos */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.degreesToRadians(lat1)) *
      Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  private degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /** Obtiene las N farmacias más cercanas dado un punto */
  private getNearestFarmacias(
    point: google.maps.LatLngLiteral,
    count: number = 3
  ): FarmaciasMapa[] {
    const distances = this.farmaciasValidas.map(f => ({
      farmacia: f,
      distance: this.calculateDistance(
        point.lat,
        point.lng,
        f.lat,
        f.lng
      )
    }));
    return distances
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count)
      .map(item => item.farmacia);
  }

  addMarkerFromCorrelativo(): void {
    const correlativo = this.correlativo.trim();
    if (!correlativo) {
      Swal.fire({
        title: 'Advertencia',
        text: 'Por favor ingresa un correlativo.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    this.medicamentoService.getRecetaDetailsByCorrelativo(correlativo).subscribe(
      data => {
        if (!data.length) {
          Swal.fire({
            title: 'Información',
            text: 'No se encontraron resultados para este correlativo.',
            icon: 'info',
            confirmButtonText: 'Aceptar'
          });
          return;
        }
        this.recetaMedicamento = data;
        const loc = data[0];
        const address = `${loc.direccionDuenio}, ${loc.distritoDuenio}, Lima, Perú`;
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ address }, (results, status) => {
          if (status !== 'OK' || !results?.[0]) {
            Swal.fire({
              title: 'Error',
              text: `No se pudo localizar la dirección: ${status}`,
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
            return;
          }
          const latLng = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          };

          // Limpiar marcadores y obtener las 3 farmacias más cercanas
          this.markersOptions = [];
          this.farmaciasValidas = this.getNearestFarmacias(latLng);

          // Marcadores de farmacias cercanas
          this.markersOptions = this.farmaciasValidas.map(f => ({
            position: { lat: f.lat, lng: f.lng },
            title: f.nombre ?? 'Farmacia cercana',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: 'green',
              fillOpacity: 0.8,
              strokeWeight: 0,
              scale: 6
            }
          }));

          // Marcador del punto del correlativo
          this.markersOptions.push({
            position: latLng,
            title: loc.distritoDuenio,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: 'blue',
              fillOpacity: 0.8,
              strokeWeight: 0,
              scale: 6
            }
          });

          // InfoWindow
          const info = new google.maps.InfoWindow({
            content: `<h4>${loc.nombreDuenio} - ${loc.distritoDuenio}</h4>` +
                     `<p>Dirección: ${loc.direccionDuenio}</p>`
          });
          const mapMarker = new google.maps.Marker({
            position: latLng,
            map: this.map.googleMap,
            title: loc.distritoDuenio
          });
          mapMarker.addListener('click', () => info.open(this.map.googleMap, mapMarker));

          this.center = latLng;
          this.zoom = 19;
        });
      },
      error => {
        console.error('Error:', error);
        Swal.fire({
          title: 'Error',
          text: 'Error al obtener detalles del correlativo.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    );
  }

  refrescar(): void {
    // 1) Resetea correlativo
    this.correlativo = '';

    // 2) Limpia datos previos
    this.recetaMedicamento = [];
    this.markersOptions = [];

    // 3) Vuelve a pintar todas las farmacias
    this.loadMapa();

    // 4) (opcional) Recentrar el mapa
    this.center = { lat: -12.0464, lng: -77.0428 };
    this.zoom = 13;

    // 5) (opcional) Limpiar la ruta para quitar el parámetro en URL
    this.router.navigate(['/mapa']);
  }

  generarReporte(): void {
    this.reportePdfService
      .generarReportePDFCorrelativo(this.correlativo)
      .subscribe((blob: Blob) => {
        // Crear una URL para el blob y generar un enlace de descarga
        const url = window.URL.createObjectURL(blob);

        // Crear un enlace <a> para realizar la descarga
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_atencion_${this.correlativo}.pdf`;  // Nombre personalizado
        a.click();

        // Liberar el objeto URL después de usarlo
        window.URL.revokeObjectURL(url);
      });
  }

  /** Formatea número peruano */
  private formatPeruNumber(input: string): string {
    let digits = input.replace(/\D+/g, '');
    if (digits.startsWith('51')) digits = digits.slice(2);
    if (digits.length === 7) return `+51 ${digits[0]} ${digits.slice(1,4)} ${digits.slice(4)}`;
    if (digits.length === 9) return `+51 ${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`;
    return `+51 ${digits}`;
  }

  private isValidPeruNumber(input: string): boolean {
    return /^\+51\d{7,9}$/.test(input.replace(/\s|-/g, ''));
  }

  openWhatsApp(index: number) {
    if (!this.recetaMedicamento.length) {
      Swal.fire({
        title: 'Información',
        text: 'Sin registro de medicamentos',
        icon: 'info',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const farmacia = this.farmaciasValidas[index];
    const baseName = (farmacia.nombre ?? '').split(/\s*-\s*/)[0].toLowerCase();
    const matches = this.recetaMedicamento.filter(m =>
      (m.farmacia ?? '').split(/\s*-\s*/)[0].toLowerCase() === baseName
    );
    const nonMatches = this.recetaMedicamento.filter(m =>
      (m.farmacia ?? '').split(/\s*-\s*/)[0].toLowerCase() !== baseName
    );

    const lines = ['Hola,'];
    if (matches.length) {
      lines.push(`De mi receta para su farmacia ${baseName.charAt(0).toUpperCase() + baseName.slice(1)}, tengo:`);
      matches.forEach(m => lines.push(`• ${m.medicamentoRecetado}`));
    }
    if (nonMatches.length) {
      lines.push('', 'Con respecto a estos  medicamentos, ¿cuentan con ellos?');
      nonMatches.forEach(m => lines.push(`• ${m.medicamentoRecetado}`));
    }
    lines.push('', 'Quedo atento a su respuesta. ¡Gracias!');

    let tel = farmacia.telefono ?? '';
    if (!tel.startsWith('+51')) tel = '+51' + tel.replace(/\D+/g,'');
    if (!this.isValidPeruNumber(tel)) return;
    const phoneUrl = tel.replace(/\D+/g, '');
    window.open(`https://api.whatsapp.com/send?phone=${phoneUrl}&text=${encodeURIComponent(lines.join('\n'))}`);
  }

  openInfoWindow(marker: MapMarker, idx: number) {
    this.selectedMarkerIndex = idx;
    this.infoWindow.open(marker);
  }

  selectLocation(idx: number) {
    const loc = this.markersOptions[idx];
    this.center = loc.position;
    this.zoom = 16;
  }

  onBack() {
    this.router.navigate(['/modulos']);
  }

  // Nueva función para centrar en la ubicación actual del usuario
  centerOnCurrentLocation(): void {
    if (!navigator.geolocation) {
      Swal.fire({
        title: 'Error',
        text: 'La geolocalización no es soportada por este navegador.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation: google.maps.LatLngLiteral = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Obtener las 3 farmacias más cercanas a la ubicación actual
        this.farmaciasValidas = this.getNearestFarmacias(userLocation, 3);

        // Actualizar los marcadores en el mapa
        this.markersOptions = this.farmaciasValidas.map(f => ({
          position: { lat: f.lat, lng: f.lng },
          title: f.nombre ?? 'Farmacia cercana',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: 'green',
            fillOpacity: 0.8,
            strokeWeight: 0,
            scale: 6
          }
        }));

        // Agregar un marcador para la ubicación actual
        this.markersOptions.push({
          position: userLocation,
          title: 'Tu ubicación',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: 'red', // Color distinto para la ubicación del usuario
            fillOpacity: 0.8,
            strokeWeight: 0,
            scale: 6
          }
        });

        // Centrar el mapa en la ubicación actual
        this.center = userLocation;
        this.zoom = 16; // Ajustar zoom para ver las farmacias cercanas
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        let errorMessage = 'Error al obtener tu ubicación.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'El usuario denegó la solicitud de geolocalización.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'La información de ubicación no está disponible.';
            break;
          case error.TIMEOUT:
            errorMessage = 'La solicitud para obtener la ubicación ha expirado.';
            break;
          default:
            errorMessage = 'Ocurrió un error desconocido al obtener la ubicación.';
            break;
        }
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    );
  }
}