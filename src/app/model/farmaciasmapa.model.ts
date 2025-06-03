export interface FarmaciasMapa {
  id?: number;
  nombre: string;
  lat: number;   // obligatorio
  lng: number;   // obligatorio
  url?: string;
  distrito?: string;
  telefono?: string;
  idEstado?: number;
}
