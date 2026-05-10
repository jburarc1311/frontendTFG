export interface Animal {
  _id?: string;
  nombre: string;
  raza: string;
  edad: number;
  tamano: 'pequeño' | 'mediano' | 'grande';
  sexo: 'macho' | 'hembra';
  descripcion: string;
  historia: string;
  fotos: Array<string>;
  vacunado: boolean;
  esterilizado: boolean;
  estado: 'disponible' | 'adoptado' | 'en proceso';
  megustas: Array<string>;
  tipo: string;
  propietario_id: string;
  ubicacion?: string;
  creado_en: Date;
}
