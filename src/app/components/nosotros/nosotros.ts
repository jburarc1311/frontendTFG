import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Footer } from '../footer/footer';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-nosotros',
  imports: [RouterLink, Footer, TranslateModule],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.css',
})
export class Nosotros {}
