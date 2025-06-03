export interface Duenio {
    id: number;
    apellido: string;
    email: string;
    telefono: string;
    direccion: string;
    fechaCreacion: string;  // Puedes usar tipo Date si prefieres manejar fechas como objetos Date
    nombre: string;
    idestado: number;  // Este campo podría ser un enum dependiendo de lo que representes con los estados
  }
  