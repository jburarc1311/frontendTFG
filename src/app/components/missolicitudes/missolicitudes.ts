import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Solicitudes } from '../../services/solicitudes';
import { Solicitud } from '../../interfaces/solicitud';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-missolicitudes',
  imports: [CommonModule, RouterLink],
  templateUrl: './missolicitudes.html',
  styleUrl: './missolicitudes.css',
})
export class Missolicitudes implements OnInit {
  solicitudesEnviadas: Solicitud[] = [];
  solicitudesRecibidas: Solicitud[] = [];
  error: string | null = null;
  pestanaActiva: 'enviadas' | 'recibidas' = 'enviadas';

  private solicitudesService = inject(Solicitudes);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.error = null;

    this.solicitudesService.getSolicitudesEnviadas().subscribe({
      next: (response) => {
        this.solicitudesEnviadas = response.data || [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Error al cargar las solicitudes enviadas';
        console.error('Error:', error);
      },
    });

    this.solicitudesService.getSolicitudesRecibidas().subscribe({
      next: (response) => {
        this.solicitudesRecibidas = response.data || [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Error al cargar las solicitudes recibidas';
        console.error('Error:', error);
      },
    });
  }

  cambiarPestana(pestana: 'enviadas' | 'recibidas') {
    this.pestanaActiva = pestana;
  }

  rechazarSolicitud(solicitudId: string | undefined) {
    if (!solicitudId) {
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres rechazar esta solicitud de adopción?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'No, cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.solicitudesService.rechazarSolicitud(solicitudId).subscribe({
          next: () => {
            this.cargarSolicitudes();
          },
          error: (error) => {
            this.error = 'Error al rechazar la solicitud';
            console.error('Error:', error);
          },
        });
      }
    });
  }

  eliminarSolicitud(solicitudId: string | undefined) {
    if (!solicitudId) {
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres eliminar esta solicitud de adopción?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.solicitudesService.delsolicitud(solicitudId).subscribe({
          next: () => {
            this.cargarSolicitudes();
          },
          error: (error) => {
            this.error = 'Error al eliminar la solicitud';
            console.error('Error:', error);
          },
        });
      }
    });
  }

  aceptarSolicitud(solicitudId: string | undefined) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres aceptar esta solicitud de adopción? No podrás revertir esta acción. No te olvides de contactar al adoptante para coordinar la adopción del perro.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, aceptar',
      cancelButtonText: 'No, cancelar',
    }).then((result) => {
      if (!solicitudId) {
        return;
      }

      if (result.isConfirmed) {
        this.solicitudesService.aceptarSolicitud(solicitudId).subscribe({
          next: () => {
            this.cargarSolicitudes();
          },
          error: (error) => {
            this.error = 'Error al aceptar la solicitud';
            console.error('Error:', error);
          },
        });
      }
    });
  }
}
