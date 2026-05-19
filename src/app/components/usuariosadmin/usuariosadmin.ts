import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario';
import { Animales } from '../../services/animales';
import { Solicitudes } from '../../services/solicitudes';
import { ConversacionesService } from '../../services/conversaciones';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-usuariosadmin',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './usuariosadmin.html',
  styleUrl: './usuariosadmin.css',
})
export class Usuariosadmin {
  sidebarOpen: boolean = false;
  today = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  usuarios: any[] = [];
  cargando = true;

  stats = [{ label: 'admin.totalUsers', value: '—', icon: '👥', color: 'bg-pink-100' }];

  private usuarioService = inject(UsuarioService);
  private animalesService = inject(Animales);
  private solicitudesService = inject(Solicitudes);
  private conversacionesService = inject(ConversacionesService);
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  closeSidebar() {
    this.sidebarOpen = false;
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    this.usuarioService.getAllUsuarios().subscribe({
      next: (usuarios: any) => {
        this.usuarios = Array.isArray(usuarios) ? usuarios : (usuarios?.data ?? []);
        this.stats[0].value = this.usuarios.length.toString();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  eliminarUsuario(id: string) {
    Swal.fire({
      title: this.translate.instant('common.confirmTitle'),
      text: this.translate.instant('common.irreversible'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: this.translate.instant('admin.alerts.deleteConfirm'),
      cancelButtonText: this.translate.instant('common.cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminarUsuarioYCascada(id);
      }
    });
  }

  private async eliminarUsuarioYCascada(id: string) {
    try {
      const respuestaUsuario: any = await firstValueFrom(this.usuarioService.getUsuario(id));
      const usuario = respuestaUsuario?.data ?? respuestaUsuario ?? {};

      await this.eliminarFavoritosRelacionados(usuario);
      await this.eliminarAnimalesRelacionados(usuario, id);
      await this.eliminarSolicitudesRelacionadas(id);
      await this.eliminarConversacionesRelacionadas(id);

      await firstValueFrom(this.usuarioService.delusuario(id));

      this.usuarios = this.usuarios.filter((usuarioItem) => usuarioItem._id !== id);
      this.stats[0].value = this.usuarios.length.toString();
      this.cdr.detectChanges();

      Swal.fire(
        this.translate.instant('admin.alerts.deletedTitle'),
        this.translate.instant('admin.alerts.deletedText'),
        'success',
      );
    } catch (err) {
      console.error('Error al eliminar usuario y relaciones:', err);
      Swal.fire(
        this.translate.instant('common.error'),
        this.translate.instant('admin.alerts.deleteError'),
        'error',
      );
    }
  }

  private normalizarLista(respuesta: any, keys: string[]): any[] {
    if (Array.isArray(respuesta)) {
      return respuesta;
    }

    for (const key of keys) {
      if (Array.isArray(respuesta?.[key])) {
        return respuesta[key];
      }
    }

    if (Array.isArray(respuesta?.data)) {
      return respuesta.data;
    }

    return [];
  }

  private getEntityId(entity: any): string {
    if (!entity) {
      return '';
    }

    if (typeof entity === 'string') {
      return entity;
    }

    return entity._id || entity.id || '';
  }

  private async eliminarFavoritosRelacionados(usuario: any) {
    const favoritos = this.normalizarLista(usuario, ['favoritos']);

    for (const favorito of favoritos) {
      const animalId = this.getEntityId(favorito);

      if (!animalId) {
        continue;
      }

      try {
        await firstValueFrom(
          this.animalesService.quitarMegusta(animalId, usuario._id || usuario.id),
        );
      } catch (error) {
        console.warn('No se pudo eliminar un favorito del usuario:', error);
      }
    }
  }

  private async eliminarAnimalesRelacionados(usuario: any, usuarioId: string) {
    const animales = this.normalizarLista(usuario, ['animales']);

    for (const animal of animales) {
      const animalId = this.getEntityId(animal);

      if (!animalId) {
        continue;
      }

      try {
        await firstValueFrom(this.animalesService.delAnimal(animalId));
      } catch (error) {
        console.warn('No se pudo eliminar un animal del usuario:', error);
      }
    }

    try {
      const respuestaAnimales: any = await firstValueFrom(
        this.usuarioService.misAnimales(usuarioId),
      );
      const animalesExtra = this.normalizarLista(respuestaAnimales, ['animales']);

      for (const animal of animalesExtra) {
        const animalId = this.getEntityId(animal);

        if (!animalId) {
          continue;
        }

        try {
          await firstValueFrom(this.animalesService.delAnimal(animalId));
        } catch (error) {
          console.warn('No se pudo eliminar un animal adicional del usuario:', error);
        }
      }
    } catch (error) {
      console.warn('No se pudo consultar mis animales para limpieza adicional:', error);
    }
  }

  private async eliminarSolicitudesRelacionadas(usuarioId: string) {
    const respuestaSolicitudes: any = await firstValueFrom(
      this.solicitudesService.getAllSolicitudes(),
    );
    const solicitudes = this.normalizarLista(respuestaSolicitudes, ['solicitudes']);

    for (const solicitud of solicitudes) {
      const propietarioId = this.getEntityId(solicitud?.propietario_id);
      const adoptanteId = this.getEntityId(solicitud?.adoptante_id);

      if (propietarioId !== usuarioId && adoptanteId !== usuarioId) {
        continue;
      }

      if (!solicitud?._id) {
        continue;
      }

      try {
        await firstValueFrom(this.solicitudesService.delsolicitud(solicitud._id));
      } catch (error) {
        console.warn('No se pudo eliminar una solicitud relacionada:', error);
      }
    }
  }

  private async eliminarConversacionesRelacionadas(usuarioId: string) {
    try {
      const respuestaConversaciones: any = await firstValueFrom(
        this.conversacionesService.getConversations(),
      );
      const conversaciones = this.normalizarLista(respuestaConversaciones, ['conversations']);

      for (const conversation of conversaciones) {
        const participants = Array.isArray(conversation?.participants)
          ? conversation.participants
          : [];
        const participaUsuario = participants.some(
          (participant: any) => this.getEntityId(participant) === usuarioId,
        );

        if (!participaUsuario || !conversation?._id) {
          continue;
        }

        try {
          await firstValueFrom(this.conversacionesService.deleteConversation(conversation._id));
          continue;
        } catch (conversationError) {
          console.warn(
            'No se pudo borrar la conversación completa, se intentan borrar los mensajes:',
            conversationError,
          );
        }

        try {
          const detalleConversacion: any = await firstValueFrom(
            this.conversacionesService.getConversation(conversation._id),
          );
          const mensajes = this.normalizarLista(detalleConversacion, ['messages']);

          for (const message of mensajes) {
            if (!message?._id) {
              continue;
            }

            try {
              await firstValueFrom(
                this.conversacionesService.deleteMessage(conversation._id, message._id),
              );
            } catch (messageError) {
              console.warn('No se pudo eliminar un mensaje de la conversación:', messageError);
            }
          }
        } catch (detailError) {
          console.warn(
            'No se pudo cargar el detalle de la conversación para limpiar mensajes:',
            detailError,
          );
        }
      }
    } catch (error) {
      console.warn('No se pudieron cargar las conversaciones para limpieza:', error);
    }
  }

  desactivarUsuario(id: string) {
    Swal.fire({
      title: this.translate.instant('common.confirmTitle'),
      text: this.translate.instant('admin.alerts.deactivateText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#3085d6',
      confirmButtonText: this.translate.instant('admin.alerts.deactivateConfirm'),
      cancelButtonText: this.translate.instant('common.cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.desactivarUsuario(id).subscribe({
          next: () => {
            const usuario = this.usuarios.find((u) => u._id === id);
            if (usuario) {
              usuario.activo = false;
              this.cdr.detectChanges();
            }
          },
          error: (err) => {
            console.error('Error al desactivar usuario:', err);
          },
        });
        Swal.fire(
          this.translate.instant('admin.alerts.deactivatedTitle'),
          this.translate.instant('admin.alerts.deactivatedText'),
          'success',
        );
        this.cargarDatos();
      }
    });
  }

  activarUsuario(id: string) {
    Swal.fire({
      title: this.translate.instant('common.confirmTitle'),
      text: this.translate.instant('admin.alerts.activateText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#3085d6',
      confirmButtonText: this.translate.instant('admin.alerts.activateConfirm'),
      cancelButtonText: this.translate.instant('common.cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.activarUsuario(id).subscribe({
          next: () => {
            const usuario = this.usuarios.find((u) => u._id === id);
            if (usuario) {
              usuario.activo = true;
              this.cdr.detectChanges();
            }
          },
          error: (err) => {
            console.error('Error al activar usuario:', err);
          },
        });
        Swal.fire(
          this.translate.instant('admin.alerts.activatedTitle'),
          this.translate.instant('admin.alerts.activatedText'),
          'success',
        );
        this.cargarDatos();
      }
    });
  }
}
