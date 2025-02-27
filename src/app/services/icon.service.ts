import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private readonly SVG_PATH = 'assets/icons/';
  private readonly SVG_EXT = '.svg';

  private iconList: string[] = [
    'account_circle',
    'add',
    'add_shopping_cart',
    'checklist',
    'delete',
    'favorite',
    'more_vert',
    'person',
    'picture_as_pdf',
    'search',
    'share',
    'shopping_cart',
    'skillet'
  ];

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.registerIcons();
  }

  /**
   * Registers all SVG icons with the MatIconRegistry
   */
  private registerIcons(): void {
    this.iconList.forEach(icon => {
      this.matIconRegistry.addSvgIcon(
        icon,
        this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.SVG_PATH}${icon}${this.SVG_EXT}`)
      );
    });
  }
}
