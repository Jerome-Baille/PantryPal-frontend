import { Component, inject } from '@angular/core';
import { LoaderService } from '../../services/loader.service';


@Component({
    selector: 'app-loader',
    standalone: true,
    imports: [],
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {  loaderService = inject(LoaderService);

}