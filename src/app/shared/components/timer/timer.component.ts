import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, takeWhile, timer } from 'rxjs';

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

  displayTime: string = '';
  timerRunning: boolean = false;

  private audio: HTMLAudioElement | null = null;
  private audioInterval: any = null;

  constructor(private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.displayTime = this.formatTime(this.timerInfo.timeInSeconds);

    // Preload the audio file
    this.audio = new Audio('assets/sounds/oversimplified-alarm-clock-113180.mp3');
    this.audio.loop = true;
    this.audio.load();
  }

  ngOnDestroy(): void {
    this.clearTimer();
    this.clearAudioInterval();
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

  private clearTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
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
        this.startTimerWithCountdown(this.remainingTimeInSeconds > 0 ? this.remainingTimeInSeconds : this.timerInfo.timeInSeconds);
      }
    }
  }

  public pauseTimer(): void {
    if (this.timerRunning) {
      this.timerRunning = false;
      this.clearTimer();
      this.timePaused = Date.now() - this.startTime;
    }
  }

  public stopTimer(): void {
    this.timerRunning = false;
    this.displayTime = this.formatTime(this.timerInfo.timeInSeconds);
    this.timePaused = 0;
    this.remainingTimeInSeconds = 0;
    this.clearTimer();
  }

  private clearAudioInterval(): void {
    if (this.audioInterval) {
      clearInterval(this.audioInterval);
      this.audioInterval = null;
    }
  }

  private playAudioLoop(): void {
    if (!this.audioInterval) {
      this.audioInterval = setInterval(() => {
        if (!this.audio || this.audio.ended) {
          this.clearAudioInterval();
          if (!this.snackBar._openedSnackBarRef) {
            this.stopAudioLoop(); // Pause audio loop when it ends
          }
          return;
        }
  
        if (this.snackBar._openedSnackBarRef) {
          this.audio?.play();
        } else {
          this.stopAudioLoop();
        }
      }, 1000);
    }
  }

  private stopAudioLoop(): void {
    this.clearAudioInterval();
    this.audio?.pause();
  }

  private startTimerWithCountdown(durationInSeconds: number): void {
    this.timerRunning = true;
    this.remainingTimeInSeconds = durationInSeconds;
    this.startTime = Date.now() - this.timePaused;

    this.clearTimer();
    this.clearAudioInterval();

    this.timerSubscription = timer(0, 1000)
      .pipe(
        takeWhile(() => this.timerRunning) // Automatically unsubscribe when timerRunning becomes false
      )
      .subscribe((elapsedTime) => {
        const remainingTime = this.remainingTimeInSeconds - elapsedTime;

        if (remainingTime <= 0) {
          this.stopTimer();

          // Play sound on a loop for 1 minute or until the snackBar is dismissed
          if (this.audio) {
            this.playAudioLoop();
          }

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