import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
        this.usuarioService.delusuario(id).subscribe({
          next: () => {
            this.usuarios = this.usuarios.filter((usuario) => usuario._id !== id);
            this.stats[0].value = this.usuarios.length.toString();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error al eliminar usuario:', err);
          },
        });
      }
    });
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
