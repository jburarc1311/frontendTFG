import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Contacto {

    private apiUrl = 'https://backendtfg-production-936a.up.railway.app/api/contacto'; // tu endpoint del backend
  private http = inject(HttpClient);

  enviarContacto(datos: { nombre: string; motivo: string; mensaje: string }): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }
}
