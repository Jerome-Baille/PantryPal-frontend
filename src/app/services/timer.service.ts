import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private isTimerOnSubject = new Subject<boolean>();
  isTimerOn$ = this.isTimerOnSubject.asObservable();

  private dataSubject = new Subject<any>();
  data$ = this.dataSubject.asObservable();

  showTimer(data?: any) {
    this.dataSubject.next(data);
    this.isTimerOnSubject.next(true);
  }

  hideTimer() {
    this.isTimerOnSubject.next(false);
  }
}
