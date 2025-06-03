export interface Receta {
  id: number;
  comentarios: string;
  fechaCreacion: string; // Considera usar Date si vas a manejar fechas como objetos
  id_estado: number;
  diagnostico_Id: number;
}
