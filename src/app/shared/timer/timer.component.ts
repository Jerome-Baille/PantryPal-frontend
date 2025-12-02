import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { Subscription, takeWhile, timer } from 'rxjs';

@Component({
    selector: 'app-timer',
    standalone: true,
    imports: [
      MatButtonModule,
      MatIconModule
    ],
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit, OnDestroy {
  private snackbarService = inject(SnackbarService);
  private snackBar = inject(MatSnackBar);

  @Input() timerInfo!: { name: string; timeInSeconds: number; recipe?: string };

  private timerSubscription: Subscription | null = null;
  private remainingTimeInSeconds = 0;
  private startTime = 0;
  private timePaused = 0;

  displayTime = '';
  timerRunning = false;

  private audio: HTMLAudioElement | null = null;
  private audioInterval: ReturnType<typeof setInterval> | null = null;

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
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const paddedMins = mins < 10 ? `0${mins}` : mins;
    const paddedSecs = secs < 10 ? `0${secs}` : secs;
    if (hrs > 0) {
      return `${hrs}:${paddedMins}:${paddedSecs}`;
    }
    return `${paddedMins}:${paddedSecs}`;
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
            this.stopAudioLoop();
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

          // Use timerInfo.recipe if available; otherwise, fallback to a default label.
          const recipeLabel = this.timerInfo.recipe ? this.timerInfo.recipe : 'Recipe Timer';
          const timerName = this.timerInfo.name;
          this.snackbarService.showInfo(`${timerName} timer for "${recipeLabel}" has finished!`);

        } else {
          this.displayTime = this.formatTime(remainingTime);
        }
      });
  }
}