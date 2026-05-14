import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Solicitudes } from '../../services/solicitudes';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-solicitudesadmin',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './solicitudesadmin.html',
  styleUrl: './solicitudesadmin.css',
})
export class Solicitudesadmin implements OnInit {
  sidebarOpen: boolean = false;
  today = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  solicitudes: any[] = [];
  cargando = true;

  stats = [
    { label: 'Total Solicitudes', value: '—' },
    { label: 'Pendientes', value: '—' },
    { label: 'Aceptadas', value: '—' },
    { label: 'Rechazadas', value: '—' },
  ];

  private solicitudesService = inject(Solicitudes);
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
    this.solicitudesService.getAllSolicitudes().subscribe({
      next: (solicitudes: any) => {
        this.solicitudes = Array.isArray(solicitudes) ? solicitudes : (solicitudes?.data ?? []);

        const total = this.solicitudes.length;
        const pendientes = this.solicitudes.filter(
          (s: any) => s.estado?.toLowerCase() === 'pendiente',
        ).length;
        const aceptadas = this.solicitudes.filter(
          (s: any) => s.estado?.toLowerCase() === 'aceptada',
        ).length;
        const rechazadas = this.solicitudes.filter(
          (s: any) => s.estado?.toLowerCase() === 'rechazada',
        ).length;

        this.stats[0].value = total.toString();
        this.stats[1].value = pendientes.toString();
        this.stats[2].value = aceptadas.toString();
        this.stats[3].value = rechazadas.toString();

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar solicitudes:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  eliminarSolicitud(id: string) {
    Swal.fire({
      title: this.translate.instant('common.confirmTitle'),
      text: this.translate.instant('admin.alerts.deleteRequestText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: this.translate.instant('admin.alerts.deleteConfirm'),
      cancelButtonText: this.translate.instant('common.cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.solicitudesService.delsolicitud(id).subscribe({
          next: () => {
            Swal.fire(
              this.translate.instant('admin.alerts.requestDeletedTitle'),
              this.translate.instant('admin.alerts.requestDeletedText'),
              'success',
            );
            this.cargarDatos();
          },
          error: (err) => {
            console.error('Error al eliminar solicitud:', err);
            Swal.fire(
              this.translate.instant('common.error'),
              this.translate.instant('admin.alerts.requestDeleteError'),
              'error',
            );
          },
        });
      }
    });
  }
}
