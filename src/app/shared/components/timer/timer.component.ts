import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit, OnDestroy {
  @Input() timerInfo!: any;

  private timerSubscription: Subscription | null = null;
  private remainingTimeInSeconds: number = 0;

  private startTime: number = 0;
  private timePaused: number = 0;

  element!: any;
  showTimer: boolean = false;
  displayTime: string = '';
  timerRunning: boolean = false;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.displayTime = this.formatTime(this.timerInfo.timeInSeconds);
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsRemaining = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes}min ${secondsRemaining}s`;
    }
  }

  startTimer(): void {
    if (!this.timerRunning) {
      // Resume the timer if it was paused
      if (this.timePaused > 0) {
        this.startTimerWithCountdown(this.remainingTimeInSeconds - Math.floor(this.timePaused / 1000));
        // Reset timePaused after resuming
        this.timePaused = 0;
      } else {
        // Start a new timer only if there's no time remaining or the timer was stopped
        if (this.remainingTimeInSeconds <= 0) {
          this.startTimerWithCountdown(this.timerInfo.timeInSeconds);
        } else {
          this.startTimerWithCountdown(this.remainingTimeInSeconds);
        }
      }
    }
  }

  pauseTimer(): void {
    if (this.timerRunning) {
      this.timerRunning = false;
      this.timerSubscription?.unsubscribe();
      this.timePaused = Date.now() - this.startTime;
    }
  }

  stopTimer(): void {
    this.timerRunning = false;
    this.displayTime = this.formatTime(this.timerInfo.timeInSeconds);
    this.timePaused = 0;
    this.remainingTimeInSeconds = 0;
    this.timerSubscription?.unsubscribe();
  }

  private startTimerWithCountdown(durationInSeconds: number): void {
    this.timerRunning = true;
    this.remainingTimeInSeconds = durationInSeconds;
    this.startTime = Date.now() - this.timePaused; // Adjust the start time based on timePaused

    this.timerSubscription = timer(0, 1000).subscribe((elapsedTime) => {
      const remainingTime = this.remainingTimeInSeconds - elapsedTime;

      if (remainingTime <= 0) {
        this.stopTimer();

        // Display notification when the timer reaches 0
        const recipeName = this.timerInfo.recipe;
        const timerName = this.timerInfo.name;
        this.snackBar.open(`${timerName} timer for "${recipeName}" has finished!`, 'Dismiss', {
          duration: 60000, // 1 minute
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      } else {
        this.displayTime = this.formatTime(remainingTime);
      }
    });
  }
}