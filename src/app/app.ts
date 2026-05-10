import { Component, signal, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { Head } from "./components/head/head";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Head],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  encapsulation: ViewEncapsulation.None  
})
export class App implements OnInit {
  protected readonly title = signal('tfg');

  ngOnInit(): void {
    initFlowbite();
  }
}
