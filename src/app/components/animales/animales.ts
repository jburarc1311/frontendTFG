import { Component, Input, inject } from '@angular/core';
import { Animal } from '../../interfaces/animal';
import { SexoPipe } from '../../pipes/sexo-pipe';
import { NgStyle } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-animalesss',
  imports: [NgStyle, RouterLink, TranslateModule],
  templateUrl: './animales.html',
  styleUrl: './animales.css',
})
export class Animalesss {
  @Input() animales: Animal[] = [];
  // Devuelve solo animales que no estén adoptados
  get filteredAnimales(): Animal[] {
    return (this.animales || []).filter((a) => a.estado !== 'adoptado');
  }
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.fragment.subscribe((fragment) => {
      if (fragment === 'adopta') {
        // Aquí puedes hacer scroll o ejecutar la lógica que necesites
        console.log('Sección adopta activada');
      }
    });
  }
}
