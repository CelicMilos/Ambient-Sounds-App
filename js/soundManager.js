export class SoundManager {
  constructor() {
    this.audioElements = new Map(); //unique key/value pairs key=soundID value=sound
    this.isPlaying = false;
  }

  //load a sound file
  laodSound(soundId, filePath) {
    try {
      const audio = new Audio();
      audio.src = filePath;
      audio.loop = true;

      //Add sound to audio elements map
      this.audioElements.set(soundId, audio);
      return true;
    } catch (error) {
      console.error(`Failed to load sound ${soundId}`);
      return false;
    }
  }

  //Play a specific sound //  play metod u HMTL audio api je async

  async playSound(soundId) {
    const audio = this.audioElements.get(soundId);
    if (audio) {
      try {
        await audio.play();
        // console.log(`Playing:${soundId}`);
        return true;
      } catch (error) {
        console.error(`Failed to play ${soundId}`, error);
      }
    }
  }
  //Pause specific sound

  pauseSound(soundId) {
    const audio = this.audioElements.get(soundId);
    if (audio && !audio.paused) {
      audio.pause();
      console.log(`Paused: ${soundId}`);
    }
  }

  //SET volume for specific sound (0-100)

  setVolume(soundId, volume) {
    const audio = this.audioElements.get(soundId);

    if (!audio) {
      console.error(`Sound ${soundId} not found!`);
      return false;
    }
    //Ako ima zvuka,konvertujemo jacinu zvuka od 0-100 u 0-1

    audio.volume = volume / 100;
    // console.log(`Volume for ${soundId}:${volume}`);
    return true;
  }
}
