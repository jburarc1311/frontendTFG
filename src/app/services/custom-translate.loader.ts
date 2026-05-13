import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

export class CustomTranslateLoader implements TranslateLoader {
  private translations = {
    es: {
      navigation: {
        home: 'Inicio',
        about: 'Sobre nosotros',
        contact: '¡Contáctanos!',
        donation: 'Donativo',
        donateAnimal: 'Dar en adopción',
        profile: 'Perfil',
        myAnimals: 'Mis Animales',
        myFavorites: 'Mis Favoritos',
        myRequests: 'Mis Solicitudes',
        myMessages: 'Mis Mensajes',
        adminPanel: 'Panel de administrador',
        logout: 'Cerrar Sesión',
        login: 'Iniciar Sesión',
      },
      home: {
        badge: 'Tu santuario digital',
        headline: 'Encuentra un hogar, cambia una vida',
        description:
          'Descubre mascotas listas para adoptar, explora sus historias y conecta con familias que ya han dado el paso. ADOPT-ME está pensado para que adoptar sea claro, cálido y confiable.',
        explore: 'Explorar mascotas',
        learnMore: 'Conocer más',
        activePets: 'Mascotas activas',
        support: 'Apoyo humano',
        stories: 'Historias de éxito',
      },
    },
    en: {
      navigation: {
        home: 'Home',
        about: 'About Us',
        contact: 'Contact Us!',
        donation: 'Donation',
        donateAnimal: 'Give for Adoption',
        profile: 'Profile',
        myAnimals: 'My Animals',
        myFavorites: 'My Favorites',
        myRequests: 'My Requests',
        myMessages: 'My Messages',
        adminPanel: 'Admin Panel',
        logout: 'Sign Out',
        login: 'Sign In',
      },
      home: {
        badge: 'Your digital sanctuary',
        headline: 'Find a home, change a life',
        description:
          'Discover pets ready for adoption, explore their stories and connect with families who have already taken the step. ADOPT-ME is designed to make adoption clear, warm and reliable.',
        explore: 'Explore pets',
        learnMore: 'Learn more',
        activePets: 'Active pets',
        support: '24/7 Support',
        stories: 'Success stories',
      },
    },
  };

  getTranslation(lang: string): Observable<any> {
    return of(this.translations[lang as keyof typeof this.translations] || {});
  }
}
