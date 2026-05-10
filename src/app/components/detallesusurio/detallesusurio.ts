import {
  Component,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../interfaces/usuario';
import { UsuarioService } from '../../services/usuario';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { Animal } from '../../interfaces/animal';

@Component({
  selector: 'app-detallesusurio',
  imports: [CommonModule, NgClass, RouterLink],
  templateUrl: './detallesusurio.html',
  styleUrl: './detallesusurio.css',
})
export class Detallesusurio implements OnInit {
  usuarioService = inject(UsuarioService);
  private cdr = inject(ChangeDetectorRef);

  private route = inject(ActivatedRoute);
  public usuarioId = '';
  public usuario?: Usuario;
  public animales?: Animal[];

  ngOnInit() {
    this.usuarioId = this.route.snapshot.paramMap.get('id') ?? '';

    this.usuarioService.getUsuario(this.usuarioId).subscribe((data: any) => {
      this.usuario = data.data;
      this.cdr.markForCheck();

      // Cargar animales del usuario
      this.usuarioService.misAnimales(this.usuarioId).subscribe((animalesData: any) => {
        this.animales = animalesData.animales || [];
        this.cdr.markForCheck();
      });
    });
  }
}
