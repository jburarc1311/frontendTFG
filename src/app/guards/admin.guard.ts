import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const user = authService.getUser();

  if (user?.role === 'Admin') {
    return true;
  }

  console.warn('Acceso denegado: No tienes permisos de Admin');
  router.navigate(['/home']);
  return false;
};
