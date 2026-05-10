import { Component, inject, signal, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

import { UsuarioService } from '../../services/usuario';
import { Animales } from '../../services/animales';
import { Animal } from '../../interfaces/animal';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-favoritos',
  imports: [RouterLink],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css',
})
export class Favoritos implements OnInit {
  public authService = inject(AuthService);
  public usuariosService = inject(UsuarioService);
  public animalesService = inject(Animales);

  public animales = signal<Animal[]>([]); // ✅ Signal
  public userId = this.authService.getUser()?.id; // ✅ Extrae el ID (_id, no id)

  ngOnInit() {
    if (!this.userId) {
      return;
    }

    this.usuariosService.verFavoritos(this.userId).subscribe((data: any) => {
      data.favoritos.forEach((animalId: string) => {
        this.animalesService.getAnimal(animalId).subscribe((animalData: any) => {
          this.animales.update((actual) => [...actual, animalData.data]);
        });
      });
    });
  }

  eliminarFavorito(animalId?: string) {
    if (!this.userId) {
      Swal.fire('Error', 'Usuario no autenticado', 'error');
      return;
    }

    if (!animalId) {
      Swal.fire('Error', 'Animal no encontrado en favoritos', 'error');
      return;
    }

    this.animalesService.quitarMegusta(animalId, this.userId!).subscribe({
      next: () => {
        this.animales.update((actual) => actual.filter((animal) => animal._id !== animalId));
        Swal.fire('Hecho', 'Favorito eliminado', 'success');
      },
      error: () => {
        Swal.fire('Error', 'No se pudo eliminar el favorito', 'error');
      },
    });
  }
}
