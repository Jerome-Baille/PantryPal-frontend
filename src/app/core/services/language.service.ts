import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);

  readonly supportedLanguages = ['en', 'fr'];
  private currentLanguageSubject: BehaviorSubject<string>;
  currentLanguage$: Observable<string>;

  constructor() {
    this.currentLanguageSubject = new BehaviorSubject<string>(this.getInitialLanguage());
    this.currentLanguage$ = this.currentLanguageSubject.asObservable();
    this.initializeLanguage();

    // Subscribe to language changes
    this.currentLanguage$.subscribe(lang => {
      this.translate.use(lang);
      localStorage.setItem('preferredLanguage', lang);
    });
  }

  private getInitialLanguage(): string {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && this.supportedLanguages.includes(savedLang)) {
      return savedLang;
    }
    const browserLang = navigator.language.split('-')[0];
    return this.supportedLanguages.includes(browserLang) ? browserLang : 'en';
  }

  private initializeLanguage(): void {
    const defaultLang = this.getInitialLanguage();
    this.translate.setDefaultLang('en');
    this.translate.use(defaultLang);
    this.currentLanguageSubject.next(defaultLang);
  }

  setLanguage(lang: string): void {
    if (this.supportedLanguages.includes(lang)) {
      this.currentLanguageSubject.next(lang);
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }
}
