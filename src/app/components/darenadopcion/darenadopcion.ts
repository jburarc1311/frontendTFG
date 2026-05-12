import { Component, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Animales } from '../../services/animales';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-darenadopcion',
  imports: [CommonModule, FormsModule, NgClass],
  templateUrl: './darenadopcion.html',
  styleUrl: './darenadopcion.css',
})
export class Darenadopcion {
  private readonly minimoFotos = 1;
  private readonly maximoFotos = 5;

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

  validarInfoBasica(): boolean {
    this.erroresBasica = {};

    if (!this.nombre.trim()) {
      this.erroresBasica['nombre'] = 'El nombre es requerido';
    }
    if (!this.tipo.trim()) {
      this.erroresBasica['tipo'] = 'El tipo es requerido';
    }
    if (!this.raza.trim()) {
      this.erroresBasica['raza'] = 'La raza es requerida';
    }
    if (!this.edad || this.edad <= 0) {
      this.erroresBasica['edad'] = 'La edad debe ser un número positivo';
    }
    if (!this.descripcion.trim()) {
      this.erroresBasica['descripcion'] = 'La descripción es requerida';
    }
    if (!this.historia.trim()) {
      this.erroresBasica['historia'] = 'La historia es requerida';
    }
    if (!this.sexo) {
      this.erroresBasica['sexo'] = 'Debes seleccionar un sexo';
    }
    if (!this.tamano) {
      this.erroresBasica['tamano'] = 'Debes seleccionar un tamaño';
    }

    return Object.keys(this.erroresBasica).length === 0;
  }

  onFotosSeleccionadas(event: any): void {
    const archivos = event.target.files;
    this.fotosSeleccionadas = Array.from(archivos || []);

    if (this.fotosSeleccionadas.length < this.minimoFotos) {
      this.mensajeErrorFotos = `Debes seleccionar al menos ${this.minimoFotos} fotos. Seleccionadas: ${this.fotosSeleccionadas.length}`;
      this.fotosResumen = `Falta ${this.minimoFotos - this.fotosSeleccionadas.length} foto para publicar`;
      this.fotosValidas = false;
    } else if (this.fotosSeleccionadas.length > this.maximoFotos) {
      this.mensajeErrorFotos = `Solo puedes seleccionar como máximo ${this.maximoFotos} fotos. Seleccionadas: ${this.fotosSeleccionadas.length}`;
      this.fotosResumen = `Elige un máximo de ${this.maximoFotos} fotos`;
      this.fotosValidas = false;
    } else {
      this.mensajeErrorFotos = `✓ ${this.fotosSeleccionadas.length} fotos seleccionadas correctamente`;
      this.fotosResumen = `${this.fotosSeleccionadas.length} de ${this.maximoFotos} fotos seleccionadas`;
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
        title: 'Información incompleta',
        text: 'Por favor, corrige los errores en el formulario antes de publicar.',
      });
      return;
    }

    if (!this.fotosValidas) {
      Swal.fire({
        icon: 'error',
        title: 'Fotos inválidas',
        text: `Por favor, selecciona entre ${this.minimoFotos} y ${this.maximoFotos} fotos`,
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
        title: 'No estás logueado',
        text: 'Debes iniciar sesión para publicar un animal',
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
        title: 'Error',
        text: 'Error al procesar los datos del usuario',
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
        title: 'No estás logueado',
        text: 'Debes iniciar sesión para publicar un animal',
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
          title: '¡Animal publicado exitosamente!',
          text: 'El animal ha sido publicado correctamente.',
        });
        console.log('Animal creado:', response);
        this.limpiarFormulario();
        this.router.navigate(['/animales']);
      },
      error: (error: any) => {
        this.cargando = false;
        let mensaje = 'Error al publicar el animal: ' + error.error?.message;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensaje,
        });
        alert(mensaje);
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
    this.fotosResumen = 'Selecciona entre 1 y 5 fotos para publicar';
    this.erroresBasica = {};
  }
}
