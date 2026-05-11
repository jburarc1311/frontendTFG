import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Animalesss } from '../animales/animales';
import { Animales } from '../../services/animales';
import { Animal } from '../../interfaces/animal';
import { Footer } from "../footer/footer";
import { Chatbot } from '../chatbot/chatbot';

@Component({
  selector: 'app-home',
  imports: [CommonModule, Animalesss, Footer, FormsModule,Chatbot],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

public animales = signal<Animal[]>([]);
public animalesFiltrados = signal<Animal[]>([]);
public ubicaciones: string[] = [];

// Filtros
public filtroTipo = signal<string>('');
public filtroTamano = signal<string>('');
public filtroUbicacion = signal<string>('');

public servicio = inject(Animales);

ngOnInit(): void {
  this.servicio.getAnimales().subscribe({
    next: (respuesta: any) => {
      this.animales.set(respuesta.data);
      this.animalesFiltrados.set(respuesta.data);
      this.extraerUbicaciones();
    },
    error: (err) => console.error(err)
  });
}

extraerUbicaciones(): void {
  const ubicacionesUnicas = new Set<string>();
  
  for (const animal of this.animales()) {
    if (animal.ubicacion) {
      ubicacionesUnicas.add(animal.ubicacion);
    }
  }
  
  this.ubicaciones = Array.from(ubicacionesUnicas).sort();
}

aplicarFiltro(): void {
  let resultado = this.animales();

  if (this.filtroTipo()) {
    resultado = resultado.filter(a => a.tipo.toLowerCase() === this.filtroTipo().toLowerCase());
  }

  if (this.filtroTamano()) {
    resultado = resultado.filter(a => a.tamano.toLowerCase() === this.filtroTamano().toLowerCase());
  }

  if (this.filtroUbicacion()) {
    resultado = resultado.filter(a => a.ubicacion === this.filtroUbicacion());
  }

  this.animalesFiltrados.set(resultado);
}

limpiarFiltros(): void {
  this.filtroTipo.set('');
  this.filtroTamano.set('');
  this.filtroUbicacion.set('');
  this.animalesFiltrados.set(this.animales());
}

}
