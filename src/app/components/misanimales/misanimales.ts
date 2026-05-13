import { Component, inject, signal } from '@angular/core';
import { UsuarioService } from '../../services/usuario';
import { AuthService } from '../../services/auth.service';
import { Animales } from '../../services/animales';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { Animal } from '../../interfaces/animal';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-misanimales',
  imports: [RouterLink, NgClass, TranslateModule],
  templateUrl: './misanimales.html',
  styleUrl: './misanimales.css',
})
export class Misanimales {
  public animales = signal<Animal[]>([]);
  public userService = inject(UsuarioService);
  public animalesService = inject(Animales);
  public authService = inject(AuthService);
  private translate = inject(TranslateService);
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
      alert(this.translate.instant('myAnimals.alerts.missingAnimal'));
      return;
    }

    const confirmado = confirm(this.translate.instant('myAnimals.alerts.confirmDelete'));

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
        alert(error.error?.message || this.translate.instant('myAnimals.alerts.deleteError'));
      },
    });
  }
}
