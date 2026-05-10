import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = 'http://localhost:4000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  updateName(id: string, name: string) {
    return this.http.put(`${this.apiUrl}/usuarios/nombre/${id}`, { name });
  }

  updateDescripcion(id: string, descripcion: string) {
    return this.http.put(`${this.apiUrl}/usuarios/descripcion/${id}`, { descripcion });
  }

  updateUbicacion(id: string, ubicacion: string) {
    return this.http.put(`${this.apiUrl}/usuarios/ubicacion/${id}`, { ubicacion });
  }

  updateUsuario(id: string, name: string, descripcion: string, ubicacion: string) {
    return this.http.put(`${this.apiUrl}/usuarios/${id}`, { name, descripcion, ubicacion });
  }

  verFavoritos(id: string) {
    return this.http.get(`${this.apiUrl}/usuarios/favoritos/${id}`);
  }

  misAnimales(id: string) {
    return this.http.get(`${this.apiUrl}/usuarios/misanimales/${id}`);
  }

  getAllUsuarios() {
    const token = sessionStorage.getItem('accessToken');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.get(`${this.apiUrl}/usuarios`, { headers });
  }

  getUsuario(id: string) {
    return this.http.get(`${this.apiUrl}/usuarios/usuario/${id}`);
  }

  delusuario(id: string) {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`);
  }

  desactivarUsuario(id: string) {
    return this.http.put(`${this.apiUrl}/usuarios/desactivar/${id}`, {});
  }

  activarUsuario(id: string) {
    return this.http.put(`${this.apiUrl}/usuarios/activar/${id}`, {});
  }
}
