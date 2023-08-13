import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'pantry-pal';

  constructor() {
    this.generateCat();
  }
  

  private generateCat() {
    const cat = [
      "  /\\_/\\  ",
      " ( o.o ) ",
      "  > ^ <  ",
      "Pantry Pal"
    ];
  
    cat.forEach(line => console.log(line));
  }  
}
