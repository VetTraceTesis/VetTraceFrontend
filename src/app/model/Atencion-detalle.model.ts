export interface AtencionDetalle {
  atencionId: number;
  fechaInicio: string; // ISO format, ejemplo: "2025-06-15T10:00:00"
  fechaFin: string;
  estadoAtencion: number;
tipoDiagnostico:number;
nombreTipoDiagnostico:string;
  duenioId: number;
  duenioNombre: string;
  duenioApellido: string;

  mascotaNombre: string;
  mascotaEspecie: string;

  nombreDoctor: string;
  apellidoDoctor: string;

  nombreVeterinaria: string;
}
