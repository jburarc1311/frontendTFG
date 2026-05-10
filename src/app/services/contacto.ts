import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Contacto {

    private apiUrl = 'http://localhost:4000/api/contacto'; // tu endpoint del backend

  constructor(private http: HttpClient) {}

  enviarContacto(datos: { nombre: string; motivo: string; mensaje: string }): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }
}
