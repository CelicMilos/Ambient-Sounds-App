export class SoundManager {
  constructor() {
    this.audioElements = new Map(); //unique key/value pairs key=soundID value=sound
    this.isPlaying = false;
    console.log("Sound manager created");
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
}
