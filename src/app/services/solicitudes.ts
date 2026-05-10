import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Solicitud } from '../interfaces/solicitud';

@Injectable({
  providedIn: 'root',
})
export class Solicitudes {
  private apiUrl = 'https://backendtfg.railway.internal/api';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  // Crear solicitud de adopción
  addSolicitud(solicitud: Solicitud): Observable<any> {
    return this.http.post(`${this.apiUrl}/solicitudes`, solicitud);
  }

  // Obtener solicitudes enviadas por el usuario autenticado
  getSolicitudesEnviadas(): Observable<any> {
    const token = sessionStorage.getItem('accessToken');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.get(`${this.apiUrl}/solicitudes/enviadas`, { headers });
  }

  getAllSolicitudes(): Observable<any> {
    const token = sessionStorage.getItem('accessToken');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.get(`${this.apiUrl}/solicitudes`, { headers });
  }

  delsolicitud(id: string): Observable<any> {
    const token = sessionStorage.getItem('accessToken');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.delete(`${this.apiUrl}/solicitudes/${id}`, { headers });
  }

  // Obtener solicitud por ID
  getSolicitudById(id: string): Observable<any> {
    const token = sessionStorage.getItem('accessToken');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.get(`${this.apiUrl}/solicitudes/${id}`, { headers });
  }

  getSolicitudesRecibidas(): Observable<any> {
    const token = sessionStorage.getItem('accessToken');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.get(`${this.apiUrl}/solicitudes/recibidas`, { headers });
  }

  rechazarSolicitud(id: string): Observable<any> {
    const token = sessionStorage.getItem('accessToken');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.put(`${this.apiUrl}/solicitudes/rechazar/${id}`, {}, { headers });
  }

  aceptarSolicitud(id: string): Observable<any> {
    const token = sessionStorage.getItem('accessToken');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.put(`${this.apiUrl}/solicitudes/aceptar/${id}`, {}, { headers });
  }
}
