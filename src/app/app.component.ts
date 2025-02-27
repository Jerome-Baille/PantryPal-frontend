import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { RouterOutlet } from '@angular/router';
import { LoaderComponent } from './shared/loader/loader.component';
import { IconService } from './services/icon.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, HeaderComponent, LoaderComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'pantry-pal';

  constructor(private iconService: IconService) {
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
