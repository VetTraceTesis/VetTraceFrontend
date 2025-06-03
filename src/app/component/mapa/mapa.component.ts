import { Component, OnInit, ViewChild } from '@angular/core';
import { MapInfoWindow, MapMarker, GoogleMap } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { Router } from '@angular/router';
import { FarmaciasMapa } from '../../model/farmaciasmapa.model';
import { FarmaciasMapaService } from '../../service/farmaciasmapa.service';

interface MarkerOption {
  position: google.maps.LatLngLiteral;
  title: string;
}

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class MapaComponent implements OnInit {
  @ViewChild(GoogleMap) map!: GoogleMap;
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  farmacias: FarmaciasMapa[] = [];
  farmaciasValidas: FarmaciasMapa[] = [];

  zoom = 13;
  center: google.maps.LatLngLiteral = { lat: -12.0464, lng: -77.0428 }; // Lima centro
  markersOptions: MarkerOption[] = [];
  selectedMarkerIndex = -1;
  private defaultPosition: google.maps.LatLngLiteral = { lat: -12.0464, lng: -77.0428 };

  constructor(private router: Router, private farmaciasMapaService: FarmaciasMapaService) {}

  ngOnInit(): void {
    this.loadMapa();
  }
loadMapa(): void {
  console.log('Iniciando carga de farmacias...');
  this.farmaciasMapaService.listar().subscribe(
    (farmacias) => {
      console.log('Farmacias recibidas del servicio:', farmacias);
      this.farmacias = farmacias;

      this.farmaciasValidas = this.farmacias
        .filter(f => {
          const validLat = f.lat != null && !isNaN(Number(f.lat));
          const validLng = f.lng != null && !isNaN(Number(f.lng));
          if (!validLat || !validLng) {
            console.warn('Farmacia con lat/lng inválidos filtrada:', f);
          }
          return validLat && validLng;
        })
        .map(f => {
          const latNum = typeof f.lat === 'number' ? f.lat : parseFloat(f.lat as any);
          const lngNum = typeof f.lng === 'number' ? f.lng : parseFloat(f.lng as any);
          if (isNaN(latNum) || isNaN(lngNum)) {
            console.error('Error parseando lat/lng a número:', f);
          }
          return {
            ...f,
            lat: latNum,
            lng: lngNum
          };
        });

      console.log('Farmacias válidas procesadas:', this.farmaciasValidas);

      this.markersOptions = this.farmaciasValidas.map(f => ({
        position: { lat: f.lat, lng: f.lng },
        title: f.nombre ?? 'Sin nombre'
      }));

      console.log('MarkersOptions creados:', this.markersOptions);
    },
    (error) => {
      console.error('Error al cargar las farmacias:', error);
    }
  );
}

openInfoWindow(marker: MapMarker, index: number) {
  console.log('Abriendo infoWindow para índice:', index);
  this.selectedMarkerIndex = index;
  const position = marker.getPosition();
  if (position != null) {
    console.log('Posición del marcador:', position.lat(), position.lng());
    this.center = { lat: position.lat(), lng: position.lng() };
    this.zoom = 15;
    this.infoWindow.open(marker);
  } else {
    console.warn('Posición del marcador no está disponible');
  }
}

selectLocation(index: number) {
  console.log('Seleccionando ubicación índice:', index);
  this.selectedMarkerIndex = index;
  const loc = this.farmaciasValidas[index];
  if (loc && loc.lat !== undefined && loc.lng !== undefined) {
    console.log('Ubicación seleccionada:', loc);
    this.center = { lat: loc.lat, lng: loc.lng };
    this.zoom = 15;
  } else {
    console.warn('Ubicación inválida seleccionada:', loc);
  }
}


  onBack() {
    this.router.navigate(['/modulos']);
  }
}
