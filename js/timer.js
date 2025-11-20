export class Timer {
  constructor(onComplete, onTick) {
    this.duration = 0;
    this.remaining = 0;
    this.intervalId = null;
    this.onComplete = onComplete;
    this.onTick = onTick;
    this.isRunning = false;
  }
  //START timer with duration in minutes
  start(minutes) {
    if (minutes <= 0) {
      this.stop();
      return;
    }
    this.duration = minutes * 60; //convert to seconds
    this.remaining = this.duration;
    this.isRunning = true;

    //Clear existing interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    //Update Display
    this.updateDisplay();
    //Start contdown
    this.intervalId = setInterval(() => {
      this.remaining--;
      this.updateDisplay();
      if (this.remaining <= 0) {
        this.complete();
      }
    }, 1000);
  }

  //Stop timer
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.duration = 0;
    this.remaining = 0;
    this.isRunning = false;
    this.updateDisplay();
  }
  //Timer Complete
  complete() {
    this.stop();
    if (this.onComplete) {
      this.onComplete();
    }
  }

  //Update Display
  updateDisplay() {
    const minutes = Math.floor(this.remaining / 60);
    const seconds = this.remaining % 60;
    if (this.onTick) {
      this.onTick(minutes, seconds);
    }
  }
}
