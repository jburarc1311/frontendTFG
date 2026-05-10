import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./components/login/login').then((m) => m.Login) },
    { path: 'home', loadComponent: () => import('./components/home/home').then((m) => m.Home) },
    {
        path: 'nosotros',
        loadComponent: () => import('./components/nosotros/nosotros').then((m) => m.Nosotros),
    },
    {
        path: 'animales',
        loadComponent: () => import('./components/animales/animales').then((m) => m.Animalesss),
        canActivate: [authGuard],
    },
    {
        path: 'contactanos',
        loadComponent: () => import('./components/contactanos/contactanos').then((m) => m.Contactanos),
        canActivate: [authGuard],
    },
    {
        path: 'detallesanimales/:id',
        loadComponent: () => import('./components/detallesanimales/detallesanimales').then((m) => m.Detallesanimales),
    },
    {
        path: 'donativo',
        loadComponent: () => import('./components/stripe/stripe').then((m) => m.StripeComponent),
        canActivate: [authGuard],
    },
    {
        path: 'perfil',
        loadComponent: () => import('./components/perfil/perfil').then((m) => m.Perfil),
        canActivate: [authGuard],
    },
    {
        path: 'darenadopcion',
        loadComponent: () =>
            import('./components/darenadopcion/darenadopcion').then((m) => m.Darenadopcion),
        canActivate: [authGuard],
    },
    {
        path: 'favoritos',
        loadComponent: () => import('./components/favoritos/favoritos').then((m) => m.Favoritos),
        canActivate: [authGuard],
    },
    {
        path: 'footer',
        loadComponent: () => import('./components/footer/footer').then((m) => m.Footer),
        canActivate: [authGuard],
    },
    {
        path: 'misanimales',
        loadComponent: () => import('./components/misanimales/misanimales').then((m) => m.Misanimales),
        canActivate: [authGuard],
    },
    {
        path: 'mensajes',
        loadComponent: () => import('./components/mensajes/mensajes').then((m) => m.Mensajes),
        canActivate: [authGuard],
    },
    {
        path: 'missolicitudes',
        loadComponent: () =>
            import('./components/missolicitudes/missolicitudes').then((m) => m.Missolicitudes),
        canActivate: [authGuard],
    },
    {
        path: 'paneladmin',
        loadComponent: () => import('./components/paneladmin/paneladmin').then((m) => m.Paneladmin),
        canActivate: [adminGuard, authGuard],
    },
    {
        path: 'animalesadmin',
        loadComponent: () =>
            import('./components/animalesadmin/animalesadmin').then((m) => m.Animalesadmin),
        canActivate: [adminGuard, authGuard],
    },
    {
        path: 'solicitudesadmin',
        loadComponent: () =>
            import('./components/solicitudesadmin/solicitudesadmin').then((m) => m.Solicitudesadmin),
        canActivate: [adminGuard, authGuard],
    },
    {
        path: 'usuariosadmin',
        loadComponent: () =>
            import('./components/usuariosadmin/usuariosadmin').then((m) => m.Usuariosadmin),
        canActivate: [adminGuard, authGuard],
    },
    {
        path: 'detallesusurio/:id',
        loadComponent: () =>
            import('./components/detallesusurio/detallesusurio').then((m) => m.Detallesusurio),
        canActivate: [adminGuard, authGuard],
    },
    {
        path: 'detallessolicitudes/:id',
        loadComponent: () =>
            import('./components/detallessolicitudes/detallessolicitudes').then((m) => m.Detallessolicitudes),
        canActivate: [authGuard],
    },
    {
        path: '**',
        loadComponent: () => import('./components/error404/error404').then((m) => m.Error404),
    },
];
