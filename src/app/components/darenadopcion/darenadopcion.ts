import { Component, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Animales } from '../../services/animales';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-darenadopcion',
  imports: [CommonModule, FormsModule, NgClass, TranslateModule],
  templateUrl: './darenadopcion.html',
  styleUrl: './darenadopcion.css',
})
export class Darenadopcion {
  readonly minimoFotos = 1;
  readonly maximoFotos = 5;

  // Información Básica
  public nombre: string = '';
  public tipo: string = '';
  public raza: string = '';
  public edad: number = 0;

  // Características
  public sexo: string = '';
  public tamano: string = '';
  public vacunado: boolean = false;
  public esterilizado: boolean = false;

  // Descripción
  public descripcion: string = '';
  public historia: string = '';

  // Fotos
  fotosSeleccionadas: File[] = [];
  mensajeErrorFotos: string = '';
  fotosValidas: boolean = false;
  fotosResumen: string = 'Selecciona entre 1 y 5 fotos para publicar';

  // Mensajes de validación
  erroresBasica: { [key: string]: string } = {};

  // Para el envío
  cargando: boolean = false;

  private animalesService = inject(Animales);
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);
  private translate = inject(TranslateService);

  validarInfoBasica(): boolean {
    this.erroresBasica = {};

    if (!this.nombre.trim()) {
      this.erroresBasica['nombre'] = this.translate.instant('donate.errors.nameRequired');
    }
    if (!this.tipo.trim()) {
      this.erroresBasica['tipo'] = this.translate.instant('donate.errors.typeRequired');
    }
    if (!this.raza.trim()) {
      this.erroresBasica['raza'] = this.translate.instant('donate.errors.breedRequired');
    }
    if (!this.edad || this.edad <= 0) {
      this.erroresBasica['edad'] = this.translate.instant('donate.errors.ageRequired');
    }
    if (!this.descripcion.trim()) {
      this.erroresBasica['descripcion'] = this.translate.instant(
        'donate.errors.descriptionRequired',
      );
    }
    if (!this.historia.trim()) {
      this.erroresBasica['historia'] = this.translate.instant('donate.errors.historyRequired');
    }
    if (!this.sexo) {
      this.erroresBasica['sexo'] = this.translate.instant('donate.errors.sexRequired');
    }
    if (!this.tamano) {
      this.erroresBasica['tamano'] = this.translate.instant('donate.errors.sizeRequired');
    }

    return Object.keys(this.erroresBasica).length === 0;
  }

  onFotosSeleccionadas(event: any): void {
    const archivos = event.target.files;
    this.fotosSeleccionadas = Array.from(archivos || []);

    if (this.fotosSeleccionadas.length < this.minimoFotos) {
      this.mensajeErrorFotos = this.translate.instant('donate.photos.minError', {
        min: this.minimoFotos,
        selected: this.fotosSeleccionadas.length,
      });
      this.fotosResumen = this.translate.instant('donate.photos.missingOne', {
        count: this.minimoFotos - this.fotosSeleccionadas.length,
      });
      this.fotosValidas = false;
    } else if (this.fotosSeleccionadas.length > this.maximoFotos) {
      this.mensajeErrorFotos = this.translate.instant('donate.photos.maxError', {
        max: this.maximoFotos,
        selected: this.fotosSeleccionadas.length,
      });
      this.fotosResumen = this.translate.instant('donate.photos.maxSummary', {
        max: this.maximoFotos,
      });
      this.fotosValidas = false;
    } else {
      this.mensajeErrorFotos = this.translate.instant('donate.photos.ok', {
        selected: this.fotosSeleccionadas.length,
      });
      this.fotosResumen = this.translate.instant('donate.photos.summary', {
        selected: this.fotosSeleccionadas.length,
        max: this.maximoFotos,
      });
      this.fotosValidas = true;
    }
  }

  seleccionarSexo(sexoSeleccionado: string): void {
    this.sexo = sexoSeleccionado;
    delete this.erroresBasica['sexo'];
  }

  seleccionarTamano(tamanoSeleccionado: string): void {
    this.tamano = tamanoSeleccionado;
    console.log('🔍 Tamaño seleccionado:', tamanoSeleccionado);
    delete this.erroresBasica['tamano'];
  }

  toggleVacunado(): void {
    this.vacunado = !this.vacunado;
  }

  toggleEsterilizado(): void {
    this.esterilizado = !this.esterilizado;
  }

  publicarAnimal(): void {
    if (!this.validarInfoBasica()) {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('donate.alerts.incompleteTitle'),
        text: this.translate.instant('donate.alerts.incompleteText'),
      });
      return;
    }

    if (!this.fotosValidas) {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('donate.alerts.invalidPhotosTitle'),
        text: this.translate.instant('donate.alerts.invalidPhotosText', {
          min: this.minimoFotos,
          max: this.maximoFotos,
        }),
      });
      return;
    }

    this.cargando = true;

    // Obtener el ID del usuario del sessionStorage
    console.log('SessionStorage keys:', Object.keys(sessionStorage));
    console.log('User en sessionStorage:', sessionStorage.getItem('user'));

    const userString = sessionStorage.getItem('user');
    if (!userString) {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('donate.alerts.notLoggedTitle'),
        text: this.translate.instant('donate.alerts.notLoggedText'),
      });
      this.cargando = false;
      this.router.navigate(['/login']);
      return;
    }

    let user;
    try {
      user = JSON.parse(userString);
      console.log('Usuario parseado:', user);
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('donate.alerts.errorTitle'),
        text: this.translate.instant('donate.alerts.userParseError'),
      });
      this.cargando = false;
      console.error('Error parseando user:', e);
      return;
    }

    const propietario_id = user.id;
    console.log('Propietario ID:', propietario_id);

    if (!propietario_id) {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('donate.alerts.notLoggedTitle'),
        text: this.translate.instant('donate.alerts.notLoggedText'),
      });
      this.cargando = false;
      this.router.navigate(['/login']);
      return;
    }

    const datos = {
      nombre: this.nombre,
      tipo: this.tipo,
      raza: this.raza,
      edad: this.edad,
      tamano: this.tamano,
      sexo: this.sexo,
      descripcion: this.descripcion,
      historia: this.historia,
      vacunado: this.vacunado,
      esterilizado: this.esterilizado,
      propietario_id: propietario_id,
    };

    this.animalesService.crearAnimal(datos, this.fotosSeleccionadas).subscribe({
      next: (response: any) => {
        this.cargando = false;
        Swal.fire({
          icon: 'success',
          title: this.translate.instant('donate.alerts.successTitle'),
          text: this.translate.instant('donate.alerts.successText'),
        });
        console.log('Animal creado:', response);
        this.limpiarFormulario();
        this.router.navigate(['/home']);
      },
      error: (error: any) => {
        this.cargando = false;
        let mensaje =
          this.translate.instant('donate.alerts.publishErrorPrefix') + error.error?.message;
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('donate.alerts.errorTitle'),
          text: mensaje,
        });
        console.error('Error completo:', error);
      },
    });
  }

  limpiarFormulario(): void {
    this.nombre = '';
    this.tipo = '';
    this.raza = '';
    this.edad = 0;
    this.sexo = '';
    this.tamano = '';
    this.vacunado = false;
    this.esterilizado = false;
    this.descripcion = '';
    this.historia = '';
    this.fotosSeleccionadas = [];
    this.mensajeErrorFotos = '';
    this.fotosValidas = false;
    this.fotosResumen = this.translate.instant('donate.photos.defaultSummary', {
      min: this.minimoFotos,
      max: this.maximoFotos,
    });
    this.erroresBasica = {};
  }
}
