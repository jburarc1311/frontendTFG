import { Component, signal, HostListener, ElementRef, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-head',
  imports: [CommonModule, RouterModule],
  templateUrl: './head.html',
  styleUrl: './head.css',
})
export class Head {
  // signal() es la forma moderna de Angular para variables reactivas
  // Cuando cambia, el HTML se actualiza automáticamente sin hacer nada extra
  isMenuOpen = signal(false);
  isUserDropdownOpen = signal(false);
  isEnglish = false;

  private authService = inject(AuthService);
  isLoggedInn: any;

  ngOnInit() {
    // loggedIn$ es un Observable que emite true/false cuando el usuario hace login/logout
    this.isLoggedInn = this.authService.loggedInn;
  }

  // Abre o cierra el menú hamburguesa en móvil
  // update() toma el valor actual y le aplica la función: si era true → false y viceversa
  toggleMenu() {
    this.isMenuOpen.update((value) => !value);
  }

  // Abre o cierra el dropdown del usuario
  toggleUserDropdown() {
    this.isUserDropdownOpen.update((value) => !value);
  }

  // Cierra el dropdown del usuario
  closeUserDropdown() {
    this.isUserDropdownOpen.set(false);
  }

  // Escucha clicks fuera del componente para cerrar el dropdown
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-user-dropdown]')) {
      this.closeUserDropdown();
    }
  }

  // Getter: el HTML lo llama como si fuera una propiedad normal (userPhoto)
  // pero en realidad ejecuta esta lógica cada vez que se necesita
  get userPhoto(): string {
    // Obtenemos los datos del usuario guardados en sessionStorage al hacer login
    const user = this.authService.getUser();

    return user?.photo || 'image.png';
  }

  // Getter para obtener el ID del usuario desde sessionStorage
  // Se usa para pasar el ID en los enlaces (ej: /perfil/123)
  get userId(): string {
    const user = this.authService.getUser();
    return user?.id || '';
  }

  // Getter para obtener el rol del usuario desde sessionStorage
  get userRole(): string {
    const user = this.authService.getUser();
    return user?.role || '';
  }

  // Getter para verificar si el usuario es Admin
  get isAdmin(): boolean {
    return this.userRole === 'Admin';
  }

  // Llama al logout del AuthService que:
  // 1. Borra el token y usuario de sessionStorage
  // 2. Emite false en loggedIn$ → el navbar vuelve a mostrar el botón Login
  // 3. Redirige a /login
  logout() {
    this.authService.logout();
  }

}
