import { Component, OnInit, signal, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Animales } from '../../services/animales';
import { UsuarioService } from '../../services/usuario';
import { Solicitudes } from '../../services/solicitudes';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-paneladmin',
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './paneladmin.html',
  styleUrl: './paneladmin.css',
})
export class Paneladmin implements OnInit {
  sidebarOpen = signal(false); // starts closed on mobile
  today = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  animales: any[] = [];
  cargando = true;

  stats = [
    { label: 'admin.totalAnimals', value: '—', icon: '🐾', color: 'bg-emerald-100' },
    { label: 'admin.requests', value: '—', icon: '📋', color: 'bg-orange-100' },
    { label: 'admin.users', value: '—', icon: '👥', color: 'bg-pink-100' },
  ];

  private animalesService = inject(Animales);
  private usuarioService = inject(UsuarioService);
  private solicitudesService = inject(Solicitudes);
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }
  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    this.animalesService.getAnimales().subscribe({
      next: (animales: any) => {
        this.animales = Array.isArray(animales) ? animales : (animales?.data ?? []);
        this.stats[0].value = this.animales.length.toString();
        
        this.solicitudesService.getAllSolicitudes().subscribe({
          next: (solicitudes: any) => {
            const totalSolicitudes = Array.isArray(solicitudes) ? solicitudes.length : (solicitudes?.data?.length ?? 0);
            this.stats[1].value = totalSolicitudes.toString();
            
            this.usuarioService.getAllUsuarios().subscribe({
              next: (usuarios: any) => {
                const totalUsuarios = Array.isArray(usuarios) ? usuarios.length : (usuarios?.data?.length ?? 0);
                this.stats[2].value = totalUsuarios.toString();
                this.cargando = false;
                this.cdr.detectChanges();
              },
              error: (err) => {
                console.error('Error al cargar usuarios:', err);
                this.cargando = false;
                this.cdr.detectChanges();
              },
            });
          },
          error: (err) => {
            console.error('Error al cargar solicitudes:', err);
            this.cargando = false;
            this.cdr.detectChanges();
          },
        });
      },
      error: (err) => {
        console.error('Error al cargar animales:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  eliminarAnimal(id: string) {
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
         this.animalesService.delAnimal(id).subscribe({
      next: () => {
        this.animales = this.animales.filter((a) => a._id !== id);
        this.stats[0].value = this.animales.length.toString();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al eliminar animal:', err),
    });

   
  }
});
}
}
