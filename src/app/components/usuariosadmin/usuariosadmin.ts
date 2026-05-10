import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuariosadmin',
  standalone: true,
  imports: [CommonModule, RouterLink],
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

  stats = [{ label: 'Total Usuarios', value: '—', icon: '👥', color: 'bg-pink-100' }];

  private usuarioService = inject(UsuarioService);
  private cdr = inject(ChangeDetectorRef);

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
      title: '¿Estás seguro?',
      text: '¡Esta acción no se puede deshacer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
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
      title: '¿Estás seguro?',
      text: '¡Esta acción desactivará al usuario!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
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
        Swal.fire('Desactivado', 'El usuario ha sido desactivado.', 'success');
        this.cargarDatos();
      }
    });   
  }

  activarUsuario(id: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Esta acción activará al usuario!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar',
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
        Swal.fire('Activado', 'El usuario ha sido activado.', 'success');
        this.cargarDatos();
      }
    });   
  }

}
