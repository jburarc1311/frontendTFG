import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Solicitudes } from '../../services/solicitudes';
import { Solicitud } from '../../interfaces/solicitud';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-missolicitudes',
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './missolicitudes.html',
  styleUrl: './missolicitudes.css',
})
export class Missolicitudes implements OnInit {
  solicitudesEnviadas: Solicitud[] = [];
  solicitudesRecibidas: Solicitud[] = [];
  error: string | null = null;
  pestanaActiva: 'enviadas' | 'recibidas' = 'enviadas';

  private solicitudesService = inject(Solicitudes);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);

  ngOnInit() {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.error = null;

    this.cargarSolicitudesEnviadas();
    this.cargarSolicitudesRecibidas();
  }

  private manejarErrorDeAutenticacion(error: any): boolean {
    const estado = error?.status;

    if ((estado === 401 || estado === 403) && sessionStorage.getItem('accessToken')) {
      this.authService.refreshAccessToken().subscribe({
        next: () => this.cargarSolicitudes(),
        error: (refreshError) => {
          console.error('Error al renovar el token:', refreshError);
          this.authService.logout();
        },
      });

      return true;
    }

    return false;
  }

  private cargarSolicitudesEnviadas() {
    this.solicitudesService.getSolicitudesEnviadas().subscribe({
      next: (response) => {
        this.solicitudesEnviadas = response.data || [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        if (this.manejarErrorDeAutenticacion(error)) {
          return;
        }

        this.error = this.translate.instant('myRequests.errors.sentLoad');
        console.error('Error:', error);
        this.cdr.detectChanges();
      },
    });
  }

  private cargarSolicitudesRecibidas() {
    this.solicitudesService.getSolicitudesRecibidas().subscribe({
      next: (response) => {
        this.solicitudesRecibidas = response.data || [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        if (this.manejarErrorDeAutenticacion(error)) {
          return;
        }

        this.error = this.translate.instant('myRequests.errors.receivedLoad');
        console.error('Error:', error);
        this.cdr.detectChanges();
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
      title: this.translate.instant('common.confirmTitle'),
      text: this.translate.instant('myRequests.alerts.rejectText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('myRequests.alerts.rejectConfirm'),
      cancelButtonText: this.translate.instant('myRequests.alerts.cancelConfirm'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.solicitudesService.rechazarSolicitud(solicitudId).subscribe({
          next: () => {
            this.cargarSolicitudes();
          },
          error: (error) => {
            this.error = this.translate.instant('myRequests.errors.reject');
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
      title: this.translate.instant('common.confirmTitle'),
      text: this.translate.instant('myRequests.alerts.deleteText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('myRequests.alerts.deleteConfirm'),
      cancelButtonText: this.translate.instant('myRequests.alerts.cancelConfirm'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.solicitudesService.delsolicitud(solicitudId).subscribe({
          next: () => {
            this.cargarSolicitudes();
          },
          error: (error) => {
            this.error = this.translate.instant('myRequests.errors.delete');
            console.error('Error:', error);
          },
        });
      }
    });
  }

  aceptarSolicitud(solicitudId: string | undefined) {
    Swal.fire({
      title: this.translate.instant('common.confirmTitle'),
      text: this.translate.instant('myRequests.alerts.acceptText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('myRequests.alerts.acceptConfirm'),
      cancelButtonText: this.translate.instant('myRequests.alerts.cancelConfirm'),
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
            this.error = this.translate.instant('myRequests.errors.accept');
            console.error('Error:', error);
          },
        });
      }
    });
  }
}
