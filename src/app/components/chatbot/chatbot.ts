import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule, TranslateModule],
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

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
  ) {}

  toggleModal() {
    this.modalAbierto = !this.modalAbierto;
    this.cdr.detectChanges();
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.cdr.detectChanges();
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
    this.cdr.detectChanges();

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
        this.cdr.detectChanges();
      },

      error: () => {

        this.mensajes.push({
          texto: this.translate.instant('chatbot.errorResponse'),
          usuario: false
        });

        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
