import { Component, signal, HostListener, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-head',
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './head.html',
  styleUrl: './head.css',
})
export class Head {
  isMenuOpen = signal(false);
  isUserDropdownOpen = signal(false);
  currentLang = 'es';

  private authService = inject(AuthService);
  private readonly languageService = inject(LanguageService);
  isLoggedInn: any;

  ngOnInit() {
    this.isLoggedInn = this.authService.loggedInn;
    this.currentLang = this.languageService.currentLang();
  }

  switchLanguage(lang: string) {
    this.languageService.setLanguage(lang);
    this.currentLang = this.languageService.currentLang();
  }

  toggleMenu() {
    this.isMenuOpen.update((value) => !value);
  }

  toggleUserDropdown() {
    this.isUserDropdownOpen.update((value) => !value);
  }

  closeUserDropdown() {
    this.isUserDropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-user-dropdown]')) {
      this.closeUserDropdown();
    }
  }

  get userPhoto(): string {
    const user = this.authService.getUser();
    return user?.photo || 'image.png';
  }

  get userId(): string {
    const user = this.authService.getUser();
    return user?.id || '';
  }

  get userRole(): string {
    const user = this.authService.getUser();
    return user?.role || '';
  }

  get isAdmin(): boolean {
    return this.userRole === 'Admin';
  }

  logout() {
    this.authService.logout();
  }
}
