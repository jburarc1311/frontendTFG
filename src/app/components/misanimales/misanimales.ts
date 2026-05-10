import { Component, inject, signal } from '@angular/core';
import { UsuarioService } from '../../services/usuario';
import { AuthService } from '../../services/auth.service';
import { Animales } from '../../services/animales';
import {  RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { Animal } from '../../interfaces/animal';

@Component({
  selector: 'app-misanimales',
  imports: [RouterLink, NgClass],
  templateUrl: './misanimales.html',
  styleUrl: './misanimales.css',
})
export class Misanimales {

  public animales=signal<Animal[]>([]);
  public userService=inject(UsuarioService);
  public animalesService=inject(Animales);
  public authService=inject(AuthService);
  public usuarioId = this.authService.getUser()?.id;

  ngOnInit() {
    if (!this.usuarioId) {
      return;
    }

    this.userService.misAnimales(this.usuarioId).subscribe((data: any) => {
      this.animales.set(data.animales);
    });
  }

  totalActivos(): number {
    return this.animales().filter((animal) => animal.estado === 'disponible').length;
  }

  totalEnProceso(): number {
    return this.animales().filter((animal) => animal.estado === 'en proceso').length;
  }

  totalAdoptados(): number {
    return this.animales().filter((animal) => animal.estado === 'adoptado').length;
  }

  eliminarAnimal(animalId: string | undefined): void {
    if (!animalId) {
      alert('No se pudo identificar el animal a eliminar.');
      return;
    }

    const confirmado = confirm('¿Seguro que quieres eliminar este animal?');

    if (!confirmado) {
      return;
    }

    this.animalesService.delAnimal(animalId).subscribe({
      next: () => {
        this.animales.update((animalesActuales) =>
          animalesActuales.filter((animal) => animal._id !== animalId),
        );
      },
      error: (error) => {
        console.error('Error al eliminar el animal:', error);
        alert(error.error?.message || 'No se pudo eliminar el animal.');
      },
    });
  }

}
