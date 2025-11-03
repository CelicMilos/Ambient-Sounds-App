import { sounds, deafaultPresets } from "./soundData.js";
import { SoundManager } from "./soundManager.js";

class AmbientMixer {
  //initialize dependencies and default state

  constructor() {
    this.soundManager = new SoundManager(); //from soundManager.js
    this.ui = null;
    this.presetMenager = null;
    this.timer = null;
    this.curentSoundState = null;
    this.isInitialized = false;
  }

  init() {
    try {
      //load all sounds
      this.loadAllSounds();
      this, (this.isInitialized = true);
    } catch (error) {
      console.error("Failed to initialized app: ", error);
    }
  }

  //Load all sound files
  loadAllSounds() {
    sounds.forEach((sound) => {
      const audioUrl = `audio/${sound.file}`;
      const success = this.soundManager.laodSound(sound.id, audioUrl);
      if (!success) {
        console.warn(`Coud not load sound: ${sound.name} from ${audioUrl}`);
      }
    });
  }
}

//Initialize app when Dom is laoded

document.addEventListener("DOMContentLoaded", () => {
  const app = new AmbientMixer();
  app.init();
});
