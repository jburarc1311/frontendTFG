import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AutoDomTranslateService {
  private currentLang: 'es' | 'en' = 'es';
  private observer?: MutationObserver;
  private scheduled = false;

  private readonly originalText = new WeakMap<Text, string>();
  private readonly originalAttrs = new WeakMap<Element, Map<string, string>>();

  private readonly exactEsToEn: Record<string, string> = {
    Home: 'Home',
    Inicio: 'Home',
    'Sobre nosotros': 'About us',
    'Contactanos!': 'Contact us!',
    'Contáctanos!': 'Contact us!',
    Donativo: 'Donation',
    Login: 'Login',
    'Iniciar Sesión': 'Login',
    'Cerrar Sesión': 'Log out',
    Perfil: 'Profile',
    'Mis Animales': 'My animals',
    'Mis Favoritos': 'My favorites',
    'Mis Solicitudes': 'My requests',
    'Mis Mensajes': 'My messages',
    'Dar en adopción': 'Give for adoption',
    'Panel de administrador': 'Admin panel',
    'Tu santuario digital': 'Your digital sanctuary',
    'Encuentra un hogar, cambia una vida': 'Find a home, change a life',
    'Explorar mascotas': 'Explore pets',
    'Conocer más': 'Learn more',
    'Mascotas activas': 'Active pets',
    'Apoyo humano': 'Human support',
    'Historias de éxito': 'Success stories',
    'Mascota destacada': 'Featured pet',
    'Una oportunidad real': 'A real opportunity',
    'Listo para adopción': 'Ready for adoption',
    'Disponible hoy': 'Available today',
    'Historias que importan': 'Stories that matter',
    Satisfacción: 'Satisfaction',
    'Haz la diferencia': 'Make a difference',
    'Encuentra rápido': 'Find quickly',
    Tipo: 'Type',
    Tamaño: 'Size',
    Ubicación: 'Location',
    'Todos los animales': 'All animals',
    'Cualquier tamaño': 'Any size',
    'Todas las ubicaciones': 'All locations',
    'Aplicar filtro': 'Apply filter',
    Limpiar: 'Clear',
    'No hay resultados': 'No results',
    'No hay animales disponibles': 'No animals available',
    'Ver detalles': 'View details',
    Adoptar: 'Adopt',
    Volver: 'Back',
    Nosotros: 'About us',
    Contacto: 'Contact',
    Guardar: 'Save',
    Cancelar: 'Cancel',
    Enviar: 'Send',
    Mensaje: 'Message',
    Nombre: 'Name',
    Correo: 'Email',
    Asunto: 'Subject',
    Contraseña: 'Password',
    'Confirmar contraseña': 'Confirm password',
    Registrarse: 'Register',
    'Crear cuenta': 'Create account',
    '¿Ya tienes cuenta?': 'Already have an account?',
    '¿No tienes cuenta?': "Don't have an account?",
    'Continuar con Google': 'Continue with Google',
    'Iniciar con Google': 'Sign in with Google',
    'Olvidaste tu contraseña?': 'Forgot your password?',
    Contactanos: 'Contact us',
    Contáctanos: 'Contact us',
    'Contacta con nosotros': 'Get in touch',
    'Inicia sesión': 'Log in',
    'Cerrar sesión': 'Log out',
    'Crear una cuenta': 'Create an account',
    '¿Olvidaste tu contraseña?': 'Forgot your password?',
    'Iniciar sesión con Google': 'Log in with Google',
    Regístrate: 'Sign up',
    'Mis datos': 'My details',
    'Editar perfil': 'Edit profile',
    'Guardar cambios': 'Save changes',
    'Volver al inicio': 'Back to home',
    'Página no encontrada': 'Page not found',
    'Volver a Home': 'Back to Home',
    'Error 404': 'Error 404',
    'No autorizado': 'Unauthorized',
    'Acceso denegado': 'Access denied',
    Solicitudes: 'Requests',
    Solicitud: 'Request',
    Estado: 'Status',
    Pendiente: 'Pending',
    Aceptada: 'Accepted',
    Rechazada: 'Rejected',
    Mensajes: 'Messages',
    'Enviar mensaje': 'Send message',
    'Escribe un mensaje': 'Write a message',
    Favoritos: 'Favorites',
    'Añadir a favoritos': 'Add to favorites',
    'Quitar de favoritos': 'Remove from favorites',
    Detalles: 'Details',
    'Detalles del animal': 'Animal details',
    Edad: 'Age',
    Raza: 'Breed',
    Sexo: 'Sex',
    Macho: 'Male',
    Hembra: 'Female',
    Descripción: 'Description',
    Publicar: 'Publish',
    'Publicar animal': 'Publish pet',
    'Subir foto': 'Upload photo',
    Eliminar: 'Delete',
    Editar: 'Edit',
    Actualizar: 'Update',
    Administración: 'Administration',
    Usuarios: 'Users',
    Animales: 'Animals',
    Panel: 'Panel',
    Buscar: 'Search',
    Filtrar: 'Filter',
    'Sin resultados': 'No results',
    'Cargando...': 'Loading...',
    'Selecciona una opción': 'Select an option',
    Seleccionar: 'Select',
    Perro: 'Dog',
    Gato: 'Cat',
    Pájaro: 'Bird',
    Pez: 'Fish',
    Roedor: 'Rodent',
    Otro: 'Other',
    Pequeño: 'Small',
    Mediano: 'Medium',
    Grande: 'Large',
  };

  private readonly exactKeyToEn: Record<string, string> = {
    'HOME.BADGE': 'YOUR DIGITAL SANCTUARY',
    'HOME.HEADLINE': 'FIND A HOME, CHANGE A LIFE',
    'home.description':
      'Discover pets ready for adoption, explore their stories and connect with families who have already taken the step. ADOPT-ME is designed to make adoption clear, warm and reliable.',
    'HOME.EXPLORE': 'EXPLORE PETS',
    'HOME.LEARNMORE': 'LEARN MORE',
    'HOME.ACTIVEPETS': 'ACTIVE PETS',
    'HOME.SUPPORT': 'HUMAN SUPPORT',
    'HOME.STORIES': 'SUCCESS STORIES',
    'navigation.home': 'Home',
    'navigation.about': 'About us',
    'navigation.contact': 'Contact us!',
    'navigation.donation': 'Donation',
    'navigation.login': 'Login',
    'navigation.logout': 'Log out',
  };

  private readonly exactKeyToEs: Record<string, string> = {
    'HOME.BADGE': 'TU SANTUARIO DIGITAL',
    'HOME.HEADLINE': 'ENCUENTRA UN HOGAR, CAMBIA UNA VIDA',
    'home.description':
      'Descubre mascotas listas para adoptar, explora sus historias y conecta con familias que ya han dado el paso. ADOPT-ME está pensado para que adoptar sea claro, cálido y confiable.',
    'HOME.EXPLORE': 'EXPLORAR MASCOTAS',
    'HOME.LEARNMORE': 'CONOCER MÁS',
    'HOME.ACTIVEPETS': 'MASCOTAS ACTIVAS',
    'HOME.SUPPORT': 'APOYO HUMANO',
    'HOME.STORIES': 'HISTORIAS DE ÉXITO',
    'navigation.home': 'Inicio',
    'navigation.about': 'Sobre nosotros',
    'navigation.contact': '¡Contáctanos!',
    'navigation.donation': 'Donativo',
    'navigation.login': 'Iniciar sesión',
    'navigation.logout': 'Cerrar sesión',
  };

  private readonly containsEsToEn: Array<[string, string]> = [
    ['Encuentra un hogar', 'Find a home'],
    ['cambia una vida', 'change a life'],
    ['Descubre mascotas listas para adoptar', 'Discover pets ready for adoption'],
    ['explora sus historias', 'explore their stories'],
    ['conecta con familias', 'connect with families'],
    ['ADOPT-ME está pensado', 'ADOPT-ME is designed'],
    ['adoptar sea claro, cálido y confiable', 'to make adoption clear, warm and reliable'],
    ['Cada perfil cuenta una historia', 'Every profile tells a story'],
    ['Cada adopción es una nueva historia', 'Every adoption is a new story'],
    ['Selecciona el tipo de mascota', 'Select pet type'],
    ['para ver solo lo que realmente te interesa', 'to see only what really interests you'],
  ];

  setLanguage(lang: string): void {
    this.currentLang = lang === 'en' ? 'en' : 'es';
    this.ensureObserver();
    this.scheduleApply();
  }

  private ensureObserver(): void {
    if (typeof document === 'undefined' || this.observer) {
      return;
    }

    this.observer = new MutationObserver(() => this.scheduleApply());
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label'],
    });
  }

  private scheduleApply(): void {
    if (typeof document === 'undefined' || this.scheduled) {
      return;
    }
    this.scheduled = true;
    queueMicrotask(() => {
      this.scheduled = false;
      this.applyToSubtree(document.body);
    });
  }

  private applyToSubtree(root: Node): void {
    if (!root) {
      return;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    while (current) {
      this.translateTextNode(current as Text);
      current = walker.nextNode();
    }

    if (root instanceof Element) {
      this.translateElementAttributes(root);
      const elements = root.querySelectorAll('*');
      for (const element of elements) {
        this.translateElementAttributes(element);
      }
    }
  }

  private translateTextNode(node: Text): void {
    const parentTag = node.parentElement?.tagName;
    if (parentTag === 'SCRIPT' || parentTag === 'STYLE') {
      return;
    }

    if (!this.originalText.has(node)) {
      this.originalText.set(node, node.data);
    }

    const base = this.originalText.get(node) ?? node.data;
    const translated = this.translateValue(base);
    if (node.data !== translated) {
      node.data = translated;
    }
  }

  private translateElementAttributes(element: Element): void {
    const attrs: Array<'placeholder' | 'title' | 'aria-label'> = [
      'placeholder',
      'title',
      'aria-label',
    ];
    for (const attr of attrs) {
      const current = element.getAttribute(attr);
      if (!current) {
        continue;
      }

      if (!this.originalAttrs.has(element)) {
        this.originalAttrs.set(element, new Map<string, string>());
      }
      const elementMap = this.originalAttrs.get(element)!;
      if (!elementMap.has(attr)) {
        elementMap.set(attr, current);
      }

      const base = elementMap.get(attr) ?? current;
      const translated = this.translateValue(base);
      if (translated !== current) {
        element.setAttribute(attr, translated);
      }
    }
  }

  private translateValue(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
      return value;
    }

    // If an unresolved key leaks to UI, map it to readable text.
    if (this.currentLang === 'es') {
      const fromKey = this.exactKeyToEs[trimmed];
      if (fromKey) {
        return value.replace(trimmed, fromKey);
      }
      return value;
    }

    const fromKey = this.exactKeyToEn[trimmed];
    if (fromKey) {
      return value.replace(trimmed, fromKey);
    }

    let translated = this.exactEsToEn[trimmed] ?? trimmed;
    for (const [es, en] of this.containsEsToEn) {
      translated = translated.replaceAll(es, en);
    }

    return value.replace(trimmed, translated);
  }
}
