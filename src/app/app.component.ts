import { Component, inject } from '@angular/core';
import { HeaderComponent } from './core/header/header.component';
import { RouterOutlet } from '@angular/router';
import { IconService } from './core/services/icon.service';
import { LoaderComponent } from './shared/components/loader/loader.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, HeaderComponent, LoaderComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private iconService = inject(IconService);

  title = 'pantry-pal';

  constructor() {
    this.generateCat();
  }

  private generateCat() {
    const cat = [
      `  /\\_/\\  
 ( o.o ) 
  > ^ <  
Pantry Pal`
    ];

    console.log(cat.join('\n'));
  }
}
