export interface Solicitud {
  _id?: string;
  perro_id: string;
  adoptante_id: string;
  propietario_id: string;
  mensaje?: string;
  estado?: 'Pendiente' | 'Aceptada' | 'Rechazada';
  respondido_en?: Date | null;
  creado_en?: Date;
  actualizado_en?: Date;
}
