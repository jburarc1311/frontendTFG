import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AutoDomTranslateService } from './auto-dom-translate.service';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly autoDomTranslate = inject(AutoDomTranslateService);

  readonly currentLang = signal<'es' | 'en'>('es');

  init(): void {
    const savedLang = localStorage.getItem('lang') || 'es';
    this.setLanguage(savedLang);
  }

  setLanguage(lang: string): void {
    const safeLang: 'es' | 'en' = lang === 'en' ? 'en' : 'es';
    this.currentLang.set(safeLang);
    localStorage.setItem('lang', safeLang);
    this.translate.use(safeLang);
    this.autoDomTranslate.setLanguage(safeLang);
  }
}
