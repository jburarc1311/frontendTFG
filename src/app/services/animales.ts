import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Animal } from '../interfaces/animal';

@Injectable({
  providedIn: 'root',
})
export class Animales {
  private apiUrl = 'https://backendtfg.railway.internal/api';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  getAnimales() {
    return this.http.get<Animal[]>(`${this.apiUrl}/animales`);
  }

  getAnimal(id: string) {
    return this.http.get<Animal>(`${this.apiUrl}/animales/${id}`);
  }

  darMegusta(animalId: string, usuarioId: string) {
    return this.http.post(`${this.apiUrl}/animales/megusta/${animalId}`, { usuario_id: usuarioId });
  }

  quitarMegusta(animalId: string, usuarioId: string) {
    return this.http.delete(`${this.apiUrl}/animales/megusta/${animalId}`, {
      body: { usuario_id: usuarioId },
    });
  }

  crearAnimal(datos: any, fotos: File[]) {
    // 📦 Crear FormData (para enviar archivos + datos juntos)
    const formData = new FormData();

    // ✏️  Agregar datos del formulario
    formData.append('nombre', datos.nombre);
    formData.append('tipo', datos.tipo);
    formData.append('raza', datos.raza);
    formData.append('edad', datos.edad);
    formData.append('tamano', datos.tamano);
    formData.append('sexo', datos.sexo);
    formData.append('descripcion', datos.descripcion);
    formData.append('historia', datos.historia);
    formData.append('vacunado', String(datos.vacunado));
    formData.append('esterilizado', String(datos.esterilizado));
    formData.append('estado', 'disponible');
    formData.append('propietario_id', datos.propietario_id);

    // 📸 Agregar fotos
    fotos.forEach((foto) => {
      formData.append('fotos', foto);
    });

    // 🌐 Enviar
    console.log('📤 Enviando FormData al backend...');
    return this.http.post(`${this.apiUrl}/animales`, formData);
  }

  delAnimal(id: string) {
    return this.http.delete(`${this.apiUrl}/animales/${id}`);
  }

  updateAnimal(id: string, datos: any) {
    return this.http.put(`${this.apiUrl}/animales/${id}`, datos);
  }
}
