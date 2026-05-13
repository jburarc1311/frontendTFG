import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  activeTab: 'login' | 'register' = 'login';
  showPassword = false;
  showRegisterPassword = false;

  // Login
  email = '';
  password = '';
  rememberMe = false;
  errorMessage = '';

  // Register
  registerName = '';
  registerEmail = '';
  registerUbicacion = '';
  registerDescripcion = '';
  registerPassword = '';
  registerConfirmPassword = '';
  registerError = '';
  registerSuccess = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);

  setActiveTab(tab: 'login' | 'register') {
    this.activeTab = tab;
    this.errorMessage = '';
    this.registerError = '';
    this.registerSuccess = '';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleRegisterPasswordVisibility() {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  onSubmitLogin(event: Event): void {
    event.preventDefault();

    const email = this.email.trim();

    if (!email || !this.password) {
      this.errorMessage = this.translate.instant('login.errors.allFields');
      return;
    }

    if (!email.includes('@')) {
      this.errorMessage = this.translate.instant('login.errors.validEmail');
      return;
    }

    this.errorMessage = '';

    this.authService.login(email, this.password).subscribe({
      next: (res) => {
        localStorage.setItem('token', res?.data?.accessToken);
        localStorage.setItem('user', JSON.stringify(res?.data?.user));

        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || this.translate.instant('login.errors.loginFailed');
      },
    });
  }

  onSubmitRegister(event: Event): void {
    event.preventDefault();

    const name = this.registerName.trim();
    const email = this.registerEmail.trim();
    const ubicacion = this.registerUbicacion.trim();
    const descripcion = this.registerDescripcion.trim();

    if (
      !name ||
      !email ||
      !ubicacion ||
      !descripcion ||
      !this.registerPassword ||
      !this.registerConfirmPassword
    ) {
      this.registerError = this.translate.instant('login.errors.allFields');
      return;
    }

    if (!email.includes('@')) {
      this.registerError = this.translate.instant('login.errors.validEmail');
      return;
    }

    if (this.registerPassword.length < 8) {
      this.registerError = this.translate.instant('login.errors.passwordLength');
      return;
    }

    if (this.registerPassword !== this.registerConfirmPassword) {
      this.registerError = this.translate.instant('login.errors.passwordMismatch');
      return;
    }

    this.registerError = '';

    this.authService
      .register({
        name,
        email,
        password: this.registerPassword,
        ubicacion,
        descripcion,
      })
      .subscribe({
        next: () => {
          this.registerSuccess = this.translate.instant('login.success.registerCreated');
          this.email = email;
          this.password = '';
          this.registerPassword = '';
          this.registerConfirmPassword = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.registerError = err.error?.message || this.translate.instant('login.errors.registerFailed');
        },
      });
  }

  async obtenerCoordenadas() {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('login.geo.errorTitle'),
        text: this.translate.instant('login.geo.notSupported'),
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
            this.registerUbicacion = `${ciudad}, ${provincia}`;
          } else if (ciudad) {
            this.registerUbicacion = ciudad;
          }

          Swal.fire({
            icon: 'success',
            title: this.translate.instant('login.geo.successTitle'),
            text: this.translate.instant('login.geo.successText', { location: this.registerUbicacion }),
          });
          this.cdr.detectChanges();
        } catch (error) {
          console.error('Error en Nominatim:', error);
          // Fallback: guardar las coordenadas si Nominatim falla
          this.registerUbicacion = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
          Swal.fire({
            icon: 'error',
            title: this.translate.instant('login.geo.errorTitle'),
            text: this.translate.instant('login.geo.fallbackText'),
          });
          this.cdr.detectChanges();
        }
      },
      (error) => {

        console.error(`Error de geolocalización (código ${error.code}):`, error.message);
      }
    );
  }
}
