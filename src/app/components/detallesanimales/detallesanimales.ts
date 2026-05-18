import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Animales } from '../../services/animales';
import { Animal } from '../../interfaces/animal';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Solicitudes } from '../../services/solicitudes';
import { Footer } from '../footer/footer';
import { ConversacionesService } from '../../services/conversaciones';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-detallesanimales',
  imports: [CommonModule, FormsModule, Footer, TranslateModule],
  templateUrl: './detallesanimales.html',
  styleUrl: './detallesanimales.css',
})
export class Detallesanimales {
  /**
   * Señales y dependencias inyectadas
   * - `animales`: signal que contiene el objeto `Animal` mostrado en la vista.
   *   La plantilla lee `animales()?.fotos?.[0]` para mostrar la imagen principal.
   * - Servicios inyectados: `Animales`, `AuthService`, `Solicitudes`,
   *   `ConversacionesService` y `Router` usados para operaciones (API, auth,
   *   abrir conversaciones, enviar solicitudes, navegación, etc.).
   */
  public animales = signal<Animal | null>(null);
  private route = inject(ActivatedRoute);
  public servicio = inject(Animales);
  public authService = inject(AuthService);
  public solicitudesService = inject(Solicitudes);
  public conversacionesService = inject(ConversacionesService);
  public router = inject(Router);
  private translate = inject(TranslateService);

  // Signal para el modal
  public modalAbierto = signal<boolean>(false);
  public mensaje = signal<string>('');
  public abriendoConversacion = signal<boolean>(false);

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.servicio.getAnimal(id).subscribe((data: any) => {
        console.log('Datos recibidos:', data);
        this.animales.set(data.data);
      });
    });
  }

  public esFavorito(): boolean {
    const animal = this.animales();
    const user = this.authService.getUser();

    if (!animal || !user?.id) {
      return false;
    }

    return animal.megustas.includes(user.id);
  }

  public esMiAnimal(): boolean {
    const animal = this.animales();
    const user = this.authService.getUser();

    if (!animal || !user?.id) {
      return false;
    }

    return user.id === animal.propietario_id;
  }

  public darMegusta() {
    const animal = this.animales();
    if (!animal || !animal._id) return;

    const user = this.authService.getUser();
    if (!user) {
      alert(this.translate.instant('animalDetails.alerts.authLike'));
      return;
    }

    const userId = user.id;
    const yaLeGusta = animal.megustas.includes(userId);

    const peticion = yaLeGusta
      ? this.servicio.quitarMegusta(animal._id, userId)
      : this.servicio.darMegusta(animal._id, userId);

    peticion.subscribe(() => {
      this.animales.update((current) => {
        if (!current) return current;

        return {
          ...current,
          megustas: yaLeGusta
            ? current.megustas.filter((id) => id !== userId)
            : [...current.megustas, userId],
        };
      });
    });
  }

  public setMainImage(i: number) {
    // Obtener el estado actual de `animales`
    const current = this.animales();
    // Validación rápida: si no hay animal, no hay fotos o el índice es inválido, salir
    if (!current || !current.fotos || i < 0 || i >= current.fotos.length) return;

    // Si la miniatura clicada ya está en la posición 0, no hacemos nada
    if (i === 0) return; // ya es la principal
    
    // Hacemos una copia del array de fotos para evitar mutar directamente la señal
    const fotos = [...current.fotos];
    // Extraemos la foto seleccionada (en posición `i`) del array
    const [seleccionada] = fotos.splice(i, 1);
    // Insertamos la foto seleccionada al inicio del array (posición 0)
    fotos.unshift(seleccionada);
    // Actualizamos la señal `animales` con el nuevo array de fotos para forzar
    // que la plantilla (que lee `animales()?.fotos?.[0]`) muestre la imagen escogida.
    this.animales.update((c) => {
      if (!c) return c; // seguridad: si c es null/undefined, devolverlo
      return {
        ...c,    // mantener el resto de propiedades del animal
        fotos,   // reemplazar la propiedad `fotos` por la nueva versión
      };
    });
  }

  public abrirModal() {
    if (this.esMiAnimal()) {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('common.error'),
        text: this.translate.instant('animalDetails.alerts.ownRequest'),
      });
      return;
    }

    this.modalAbierto.set(true);
  }

  public cerrarModal() {
    this.modalAbierto.set(false);
    this.mensaje.set('');
  }

  public irAConversacion() {
    const animal = this.animales();
    const user = this.authService.getUser();

    if (!animal || !animal.propietario_id) {
      alert(this.translate.instant('animalDetails.alerts.ownerMissing'));
      return;
    }

    if (!user?.id) {
      alert(this.translate.instant('animalDetails.alerts.authContact'));
      return;
    }

    if (user.id === animal.propietario_id) {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('common.error'),
        text: this.translate.instant('animalDetails.alerts.ownConversation'),
      });
      return;
    }

    this.abriendoConversacion.set(true);

    // Log para depuración: comprobar que enviamos IDs válidos
    console.log('Crear/Obtener conversación - usuario:', user);
    console.log('Crear/Obtener conversación - propietario_id:', animal.propietario_id);

    const senderId = String(user.id || user._id || '');
    const receiverId = String(animal.propietario_id || '');

    if (!senderId || !receiverId) {
      console.error('IDs inválidos al crear conversación:', { senderId, receiverId });
      this.abriendoConversacion.set(false);
      alert(this.translate.instant('animalDetails.alerts.ownerMissing'));
      return;
    }

    this.conversacionesService.createOrGetConversation(senderId, receiverId).subscribe({
      next: (conversation) => {
        this.abriendoConversacion.set(false);
        this.router.navigate(['/mensajes'], {
          queryParams: { conversationId: conversation._id },
        });
      },
      error: (error) => {
        console.error('Error creando conversación:', error);
        this.abriendoConversacion.set(false);
        alert(error.error?.message || this.translate.instant('animalDetails.alerts.openConversation'));
      },
    });
  }

  public enviarsolicitud() {
    const animal = this.animales();
    if (!animal || !animal._id) return;
    const user = this.authService.getUser();
    if (!user) {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('common.error'),
        text: this.translate.instant('animalDetails.alerts.authRequest'),
      });
      return;
    }

    if (user.id === animal.propietario_id) {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('common.error'),
        text: this.translate.instant('animalDetails.alerts.ownAdoption'),
      });
      return;
    }

    console.log('Animal completo:', animal); // Debug
    console.log('propietario_id:', animal.propietario_id); // Debug

    const solicitud = {
      perro_id: animal._id,
      adoptante_id: user.id,
      propietario_id: animal.propietario_id,
      mensaje: this.mensaje(), // Obtener el mensaje del signal
    };

    this.solicitudesService.addSolicitud(solicitud).subscribe({
      next: (response: any) => {
        Swal.fire({
          icon: 'success',
          title: this.translate.instant('animalDetails.alerts.requestSentTitle'),
          text: this.translate.instant('animalDetails.alerts.requestSentText'),
        });
        this.cerrarModal();
      },
      error: (error: any) => {
        console.error('Error:', error);
        alert(this.translate.instant('animalDetails.alerts.requestError'));
      },
    });
  }
}
