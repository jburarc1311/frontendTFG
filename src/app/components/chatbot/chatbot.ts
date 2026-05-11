import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css',
})
export class Chatbot {
   mensaje = '';

  mensajes: {
    texto: string,
    usuario: boolean
  }[] = [];

  cargando = false;
  modalAbierto = false;

  constructor(private http: HttpClient) {}

  toggleModal() {
    this.modalAbierto = !this.modalAbierto;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  enviarMensaje() {

    if (!this.mensaje.trim()) return;

    const textoUsuario = this.mensaje;

    this.mensajes.push({
      texto: textoUsuario,
      usuario: true
    });

    this.mensaje = '';
    this.cargando = true;

    this.http.post<any>(
      'https://backendtfg-production-936a.up.railway.app/chat',
      {
        message: textoUsuario
      }
    ).subscribe({
      next: (res) => {

        this.mensajes.push({
          texto: res.reply,
          usuario: false
        });

        this.cargando = false;
      },

      error: () => {

        this.mensajes.push({
          texto: 'Error obteniendo respuesta',
          usuario: false
        });

        this.cargando = false;
      }
    });
  }
}
