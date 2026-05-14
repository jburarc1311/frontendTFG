import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // URL base del backend. Todas las peticiones apuntarán aquí
  private apiUrl = 'https://backendtfg-production-936a.up.railway.app/api';
  private authUrl = 'https://backendtfg-production-936a.up.railway.app/auth';
  private refreshTokenInterval: any;

  // BehaviorSubject: es como una variable reactiva que notifica a quien la escuche cuando cambia
  // Se inicializa comprobando si ya hay un token guardado (por si el usuario recargó la página)
  private loggedIn = new BehaviorSubject<boolean>(this.isLoggedIn());

  // Versión pública del BehaviorSubject — los componentes se suscriben a esto
  // pero no pueden modificarlo directamente (solo pueden leer)
  loggedInn = this.loggedIn.asObservable();

  // Angular inyecta automáticamente HttpClient (para hacer peticiones HTTP)
  // y Router (para navegar entre páginas)
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    // Si hay token guardado, iniciar el auto-refresh
    if (this.isLoggedIn()) {
      this.iniciarAutoRefresh();
    }
  }

  // Método que llama al endpoint POST /api/login con el email y password
  // Devuelve un Observable — es como una "promesa" que puedes escuchar desde el componente
  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, { email, password }, { withCredentials: true })
      .pipe(
        // tap() ejecuta código "de lado" sin modificar la respuesta
        // Aquí aprovechamos para guardar el token cuando el login es exitoso
        tap((res) => {
          const accessToken = res?.data?.accessToken ?? res?.accessToken;
          const user = res?.data?.user ?? res?.user;

          if (accessToken) {
            // Guardamos el accessToken en sessionStorage para usarlo en futuras peticiones
            sessionStorage.setItem('accessToken', accessToken);

            if (user) {
              // Guardamos los datos del usuario (nombre, foto, etc.) para mostrarlos en el navbar
              sessionStorage.setItem('user', JSON.stringify(user));
            }

            // Notificamos a todos los componentes suscritos que hay sesión activa
            // Esto hace que el navbar cambie el botón login por el avatar automáticamente
            this.loggedIn.next(true);

            // Iniciar auto-refresh del token
            this.iniciarAutoRefresh();
          }
        }),
      );
  }

  // Cierra sesión: borra el token y redirige al login
  logout(): void {
    sessionStorage.removeItem('accessToken'); // Borra el token
    sessionStorage.removeItem('user'); // Borra los datos del usuario

    this.loggedIn.next(false); // Notificamos que ya no hay sesión activa
    this.detenerAutoRefresh(); // Detener el auto-refresh
    this.router.navigate(['/login']); // Redirige al login
  }

  // Comprueba si el usuario está logueado (si existe el token en sessionStorage)
  isLoggedIn(): boolean {
    const accessToken = sessionStorage.getItem('accessToken');

    if (accessToken) {
      return true;
    }

    return false; //convierte el valor a true/false
  }

  // Devuelve los datos del usuario guardados en sessionStorage
  // Se usa en el navbar para obtener el nombre y la foto
  getUser(): any {
    const user = sessionStorage.getItem('user');

    if (!user) {
      return null; // Si no hay usuario, devuelve null
    }

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

  // Sube una foto de perfil a Cloudinary a través del backend
  // Recibe el ID del usuario y el archivo a subir
  uploadAvatar(userId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file); // El backend espera un campo llamado 'avatar'

    // Obtener el token del sessionStorage para enviarlo en el header
    const token = sessionStorage.getItem('accessToken');

    console.log('Token obtenido del sessionStorage:', token ? '✓ Presente' : '✗ No presente');

    if (!token) {
      const error = 'No hay token de sesión. Por favor inicia sesión.';
      console.error(error);
      throw new Error(error);
    }

    // Crear headers HTTP correctamente con HttpHeaders
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    console.log('Enviando petición PUT a:', `${this.apiUrl}/usuarios/${userId}/avatar`);
    console.log(
      'Authorization con token:',
      token ? 'Bearer ' + token.substring(0, 20) + '...' : 'SIN TOKEN',
    );

    return this.http
      .put<any>(`${this.apiUrl}/usuarios/${userId}/avatar`, formData, { headers })
      .pipe(
        // Después de subir, actualizamos los datos del usuario en sessionStorage
        tap((res) => {
          console.log('Respuesta del servidor:', res);
          if (res?.photo) {
            console.log('URL de foto actualizada:', res.photo);
            const user = this.getUser();
            if (user) {
              user.photo = res.photo; // Actualizamos con la nueva URL de Cloudinary
              sessionStorage.setItem('user', JSON.stringify(user));
              console.log('SessionStorage actualizado con foto');
            }
          }
        }),
      );
  }

  // Refrescar el access token usando el refresh token guardado en cookies
  refreshAccessToken(): Observable<any> {
    return this.http
      .post<any>(
        `${this.apiUrl}/refresh-token`,
        {},
        {
          withCredentials: true, // Enviar cookies automáticamente
        },
      )
      .pipe(
        tap((res) => {
          if (res?.accessToken) {
            sessionStorage.setItem('accessToken', res.accessToken);
            console.log('✅ Access token renovado automáticamente');
          }
        }),
      );
  }

  // Iniciar el auto-refresh del token (cada 14 minutos)
  private iniciarAutoRefresh(): void {
    // Limpiar cualquier intervalo anterior
    this.detenerAutoRefresh();

    // Refrescar cada 14 minutos (840000 ms) - antes de que expire el token de 15 minutos
    this.refreshTokenInterval = setInterval(
      () => {
        if (this.isLoggedIn()) {
          this.refreshAccessToken().subscribe({
            error: (err) => {
              console.error('❌ Error al refrescar token automáticamente:', err);
              this.logout();
            },
          });
        }
      },
      14 * 60 * 1000,
    );

    console.log('Auto-refresh de token iniciado (cada 14 minutos)');
  }

  // Detener el auto-refresh del token
  private detenerAutoRefresh(): void {
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
      console.log('Auto-refresh de token detenido');
    }
  }

  // Registrar un nuevo usuario
  register(userData: {
    name: string;
    email: string;
    password: string;
    descripcion: string;
    ubicacion: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData, { withCredentials: true });
  }

  // Login con Google
  googleLogin(googleToken: string): Observable<any> {
    return this.http
      .post<any>(`${this.authUrl}/api/google`, { token: googleToken }, { withCredentials: true })
      .pipe(
        tap((res) => {
          const accessToken = res?.token;
          const user = res?.user;

          if (accessToken) {
            // Guardamos el accessToken en sessionStorage
            sessionStorage.setItem('accessToken', accessToken);

            if (user) {
              // Guardamos los datos del usuario
              sessionStorage.setItem('user', JSON.stringify(user));
            }

            // Notificamos que hay sesión activa
            this.loggedIn.next(true);

            // Iniciar auto-refresh del token
            this.iniciarAutoRefresh();
          }
        }),
      );
  }
}
