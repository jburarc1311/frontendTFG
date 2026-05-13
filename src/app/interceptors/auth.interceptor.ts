import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtener el token del sessionStorage (donde lo guarda el login)
  const token = sessionStorage.getItem('token');

  // Si existe token, agregarlo al header Authorization
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Continuar con la petición
  return next(req);
};
