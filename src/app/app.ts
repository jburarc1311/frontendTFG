import { Component, signal, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { Head } from "./components/head/head";
import { LanguageService } from './services/language.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Head],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  encapsulation: ViewEncapsulation.None  
})
export class App implements OnInit {
  protected readonly title = signal('tfg');
  private readonly languageService = inject(LanguageService);

  ngOnInit(): void {
    this.languageService.init();
    initFlowbite();
  }
}

