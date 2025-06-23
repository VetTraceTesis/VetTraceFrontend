export interface Atencion {
  id: number;
  fechaInicio: string;  // Si es una cadena de texto en formato de fecha "YYYY-MM-DD"
  fechaFin: string;     // Lo mismo para la fecha de finalización
  idveterinaria: number;
  iddoctorVeterinario: number;
  idusuario: number;
  duenioId: number;
  id_estado: number;
  tipoDiagnosticoid:number;
  correlativo:string;
}
