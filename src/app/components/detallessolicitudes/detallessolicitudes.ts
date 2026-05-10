import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Solicitudes } from '../../services/solicitudes';
import { UsuarioService } from '../../services/usuario';
import { Solicitud } from '../../interfaces/solicitud';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detallessolicitudes',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './detallessolicitudes.html',
  styleUrl: './detallessolicitudes.css',
})
export class Detallessolicitudes implements OnInit {
  solicitud: Solicitud | null = null;
  propietario: any = null;
  adoptante: any = null;
  error: string | null = null;

  private route = inject(ActivatedRoute);
  private solicitudesService = inject(Solicitudes);
  private usuarioService = inject(UsuarioService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.cargarSolicitud(id);
      }
    });
  }

  cargarSolicitud(id: string): void {
    this.error = null;
    this.solicitudesService.getSolicitudById(id).subscribe({
      next: (response: any) => {
        this.solicitud = response.data || response;
        this.cargarUsuarios();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al cargar la solicitud';
        console.error(err);
        this.cdr.detectChanges();
      },
    });
  }

  cargarUsuarios(): void {
    if (!this.solicitud) return;

    // Cargar datos del propietario
    this.usuarioService.getUsuario(this.solicitud.propietario_id).subscribe({
      next: (response: any) => {
        this.propietario = response.data || response;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar propietario:', err),
    });

    // Cargar datos del adoptante
    this.usuarioService.getUsuario(this.solicitud.adoptante_id).subscribe({
      next: (response: any) => {
        this.adoptante = response.data || response;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar adoptante:', err),
    });
  }
}
