import { Component, OnDestroy, OnInit } from '@angular/core';
import { TimerService } from 'src/app/services/timer.service';
import { interval, Subscription } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit, OnDestroy {
  isTimerOn$ = this.timerService.isTimerOn$;
  data: any;
  timeRemaining: number | undefined;
  minutes: number | undefined;
  seconds: number | undefined;
  private timerSubscription: Subscription | undefined;
  private initialTime: number | undefined;
  private countdownPaused: boolean = false;

  constructor(public timerService: TimerService) {
    this.timerService.data$.subscribe((data) => {
      this.data = data;
      this.initialTime = this.convertToSeconds(data.time, data.unit);
      this.timeRemaining = this.initialTime; // Initialize time remaining
      this.countdownPaused = true; // Countdown starts paused

      this.minutes = Math.floor(this.initialTime / 60);
      this.seconds = this.initialTime % 60;
    });
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.timerSubscription?.unsubscribe();

    // Reset minutes and seconds
    this.minutes = undefined;
    this.seconds = undefined;
  }

  startTimer() {
    console.log('startTimer');
    if (this.initialTime && (this.timerSubscription === undefined || this.timerSubscription.closed)) {
      this.countdownPaused = false; // Start the countdown
      this.timerSubscription = interval(1000)
        .pipe(
          takeWhile(() => this.timeRemaining! > 0 && !this.countdownPaused),
          map(() => --this.timeRemaining!)
        )
        .subscribe(() => {
          this.minutes = Math.floor(this.timeRemaining! / 60);
          this.seconds = this.timeRemaining! % 60;
        });
    }
  }

  pauseTimer() {
    this.countdownPaused = true;
  }

  stopTimer() {
    this.countdownPaused = true;
    this.timeRemaining = this.initialTime; // Reset time remaining to initial time
    this.minutes = Math.floor(this.initialTime! / 60);
    this.seconds = this.initialTime! % 60;
  }

  hideTimer() {
    this.timerService.hideTimer();
  }

  private convertToSeconds(time: number, unit: string): number {
    switch (unit) {
      case 'min':
        return time * 60;
      case 'h':
        return time * 60 * 60;
      default:
        return parseFloat(time.toString());
    }
  }
}