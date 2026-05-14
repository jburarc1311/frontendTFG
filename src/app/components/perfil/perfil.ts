import { ChangeDetectorRef, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario';
import { Animales } from '../../services/animales';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-perfil',
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  @ViewChild('fileInput') fileInput!: ElementRef;

  public servicio = inject(AuthService);
  public usuarioService = inject(UsuarioService);
  private cdr = inject(ChangeDetectorRef);
  public usuario: any;
  public animalesService = inject(Animales);
  private translate = inject(TranslateService);

  public nombre: string = '';
  public descripcion: string = '';
  public ubicacion: string = '';
  public cargandoFoto: boolean = false;
  public mensajeError: string = '';
  public mensajeExito: string = '';
  public guardandoCambios: boolean = false;

  ngOnInit() {
    this.usuario = this.servicio.getUser();
    this.nombre = this.usuario?.name ?? '';
    this.descripcion = this.usuario?.descripcion ?? '';
    this.ubicacion = this.usuario?.ubicacion ?? '';
  }

  private getUserId(): string | null {
    return this.usuario?.id || this.usuario?._id || null;
  }

  private limpiarMensajes() {
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  guardarCambios() {
    this.limpiarMensajes();
    this.guardandoCambios = true;

    const userId = this.getUserId();

    if (!userId) {
      this.mensajeError = this.translate.instant('profile.errors.userId');
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('profile.errors.saveTitle'),
        text: this.translate.instant('profile.errors.userId'),
        confirmButtonText: this.translate.instant('common.accept'),
        confirmButtonColor: '#16a34a',
        allowOutsideClick: false,
      });
      this.guardandoCambios = false;
      return;
    }

    this.usuarioService
      .updateUsuario(userId, this.nombre, this.descripcion, this.ubicacion)
      .subscribe({
        next: (respuesta) => {
          console.log('Usuario actualizado:', respuesta);

          // Actualizar los datos del usuario en sessionStorage
          const userData = this.servicio.getUser();
          if (userData) {
            userData.name = this.nombre;
            userData.descripcion = this.descripcion;
            userData.ubicacion = this.ubicacion;
            sessionStorage.setItem('user', JSON.stringify(userData));
            this.usuario = userData;
          }

          // Si la ubicación cambió, actualizar la ubicación de todos los animales del usuario
          if (this.ubicacion) {
            this.usuarioService.misAnimales(userId).subscribe({
              next: (res: any) => {
                const animales = res?.animales || [];
                if (animales.length) {
                  const updates = animales.map((a: any) =>
                    this.animalesService.updateAnimal(a._id, { ...a, ubicacion: this.ubicacion }),
                  );
                  forkJoin(updates).subscribe({
                    next: () => console.log('Ubicación de animales actualizada'),
                    error: (err) => console.error('Error actualizando animales:', err),
                  });
                }
              },
              error: (err) => console.error('No se pudieron obtener animales:', err),
            });
          }

          Swal.fire({
            icon: 'success',
            title: this.translate.instant('profile.success.updatedTitle'),
            text: this.translate.instant('profile.success.updatedText'),
            confirmButtonText: this.translate.instant('common.accept'),
            confirmButtonColor: '#16a34a',
            allowOutsideClick: false,
          });

          this.guardandoCambios = false;
        },
        error: (error) => {
          console.error('Error al actualizar usuario:', error);
          Swal.fire({
            icon: 'error',
            title: this.translate.instant('profile.errors.updateTitle'),
            text: error.error?.message || this.translate.instant('profile.errors.saveChanges'),
            confirmButtonText: this.translate.instant('common.accept'),
            confirmButtonColor: '#16a34a',
            allowOutsideClick: false,
          });
          this.guardandoCambios = false;
        },
      });
  }

  cancelarCambios() {
    this.nombre = this.usuario?.name ?? '';
    this.descripcion = this.usuario?.descripcion ?? '';
    this.ubicacion = this.usuario?.ubicacion ?? '';
    this.limpiarMensajes();
  }

  // Abre el diálogo del navegador para seleccionar un archivo
  // Se dispara cuando el usuario hace click en la foto de perfil
  abrirSelectorFoto() {
    this.fileInput.nativeElement.click();
  }

  // Se ejecuta cuando el usuario selecciona una imagen
  // El evento $event contiene la lista de archivos seleccionados
  onFotoSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) {
      return; // El usuario canceló sin seleccionar nada
    }

    const archivo = files[0];

    // Validar que sea una imagen
    if (!archivo.type.startsWith('image/')) {
      this.mensajeError = this.translate.instant('profile.errors.validImage');
      setTimeout(() => {
        this.mensajeError = '';
      }, 3000);
      return;
    }

    // Validar tamaño (máximo 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (archivo.size > MAX_SIZE) {
      this.mensajeError = this.translate.instant('profile.errors.maxImage');
      setTimeout(() => {
        this.mensajeError = '';
      }, 3000);
      return;
    }

    // Subir la foto
    this.subirFoto(archivo);
  }

  // Sube la foto a Cloudinary a través del backend
  subirFoto(archivo: File) {
    if (!this.usuario?.id && !this.usuario?._id) {
      this.mensajeError = this.translate.instant('profile.errors.userId');
      return;
    }

    this.cargandoFoto = true;
    this.mensajeError = '';

    // El ID del usuario está en usuario.id o usuario._id según MongoDB
    const userId = this.usuario._id || this.usuario.id;

    this.servicio.uploadAvatar(userId, archivo).subscribe({
      next: (respuesta) => {
        console.log('Foto actualizada:', respuesta);

        // Actualizar la foto localmente
        if (respuesta.photo) {
          this.usuario.photo = respuesta.photo;
          // También actualizar en sessionStorage (ya se hace en el servicio, pero por seguridad aquí también)
          const userData = this.servicio.getUser();
          if (userData) {
            this.usuario = userData;
          }
        }

        this.cargandoFoto = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al subir foto:', error);
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('common.error'),
          text: error.error?.message || this.translate.instant('profile.errors.uploadPhoto'),
        });
        this.cargandoFoto = false;
        this.cdr.detectChanges();
      },
    });

    // Limpiar el input para que pueda seleccionar el mismo archivo nuevamente si lo desea
    this.fileInput.nativeElement.value = '';
  }

  async obtenerCoordenadas() {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('common.error'),
        text: this.translate.instant('profile.errors.geoUnsupported'),
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`📍 Coordenadas obtenidas: ${latitude}, ${longitude}`);

        try {
          // Llamar a Nominatim para convertir coordenadas a dirección
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=es`;
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error('No se pudo resolver la dirección');
          }

          const data = await response.json();
          console.log('📍 Respuesta de Nominatim:', data);

          // Extraer ciudad y provincia de la respuesta
          const address = data?.address ?? {};
          const ciudad = address.city || address.town || address.village || address.municipality;
          const provincia = address.state || address.region;

          if (ciudad && provincia) {
            this.ubicacion = `${ciudad}, ${provincia}`;
          } else if (ciudad) {
            this.ubicacion = ciudad;
          }

          Swal.fire({
            icon: 'success',
            title: this.translate.instant('profile.success.locationTitle'),
            text: this.translate.instant('profile.success.locationText', { location: this.ubicacion }),
          });
          this.cdr.detectChanges();
        } catch (error) {
          console.error('Error en Nominatim:', error);
          // Fallback: guardar las coordenadas si Nominatim falla
          this.ubicacion = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
          Swal.fire({
            icon: 'error',
            title: this.translate.instant('common.error'),
            text: this.translate.instant('profile.errors.geoFallback'),
          });
          this.cdr.detectChanges();
        }
      },
      (error) => {
        console.error(`Error de geolocalización (código ${error.code}):`, error.message);
        this.cdr.detectChanges();
      },
    );
  }
}
