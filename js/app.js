import { sounds, deafaultPresets } from "./soundData.js";
import { SoundManager } from "./soundManager.js";
import { UI } from "./ui.js";

class AmbientMixer {
  //initialize dependencies and default state

  constructor() {
    this.soundManager = new SoundManager(); //from soundManager.js
    this.ui = new UI();
    this.presetMenager = null;
    this.timer = null;
    this.curentSoundState = null;
    this.isInitialized = false;
  }

  init() {
    try {
      //Initialize UI
      this.ui.init();
      //render sound cards using sound data
      this.ui.renderSoundCards(sounds);
      //Fire off eventListeners
      this.setUpEventListeners();
      //load all sounds
      this.loadAllSounds();
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialized app: ", error);
    }
  }

  //Set up all evnt listeners
  setUpEventListeners() {
    //Handle all clicks event delegation,mora da bude async zbog zvukova
    document.addEventListener("click", async (e) => {
      //Provera da li je play/pause dugme kliknuto
      if (e.target.closest(".play-btn")) {
        const soundId = e.target.closest(".play-btn").dataset.sound;
        await this.toggleSound(soundId);
      }
    });
    //Handle volume sliders--input listeners!
    document.addEventListener("input", (e) => {
      if (e.target.classList.contains("volume-slider")) {
        const soundId = e.target.dataset.sound;
        const volume = parseInt(e.target.value); //da bude broj
        this.setSoundVolume(soundId, volume);
        // console.log(soundId, volume);
      }
    });
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
  //Toggle individual suonds
  async toggleSound(soundId) {
    const audio = this.soundManager.audioElements.get(soundId);
    if (!audio) {
      console.error(`Sound ${soundId} not found`);
      return false;
    }
    if (audio.paused) {
      //Get Current slider value
      const card = document.querySelector(`[data-sound="${soundId}"]`);
      const slider = card.querySelector(".volume-slider");
      let volume = parseInt(slider.value);
      // Ako je slider na 0,po difoltu da bude na 50
      if (volume === 0) {
        volume = 30;
        this.ui.updateVolumeDisplay(soundId, volume);
      }

      //Ako je zvuk pauziran -- nema zvuka,pusti svuk ponovo
      this.soundManager.setVolume(soundId, volume);
      await this.soundManager.playSound(soundId);
      this.ui.updatePalyButton(soundId, true);
      //Update volume display
      this.ui.updateVolumeDisplay(soundId, volume);
    } else {
      //ako ima zvuka,ugasi ga
      this.soundManager.pauseSound(soundId);
      this.ui.updatePalyButton(soundId, false);
    }
  }
  // Set sound volume
  setSoundVolume(soundId, volume) {
    //update sound in sound manager
    this.soundManager.setVolume(soundId, volume);
    //update UI
    this.ui.updateVolumeDisplay(soundId, volume);
  }
}

//Initialize app when Dom is laoded

document.addEventListener("DOMContentLoaded", () => {
  const app = new AmbientMixer();
  app.init();
  //For testing.Mozemo da testiramo u brouzeru tako sto mozemo da ucinimo app dostupnu globalno.

  // window.app = app;

  //Ovako mozemo da pristupimo app preko conzole brouzera
  //Kucamo:
  //await app.soundManager.playSound('rain') ili cafe,thunder...
  //await app.soundManager.setVolume('rain',40) da podesimo zvuk
  // app.soundManager.pauseSound('rain') da pauziramo
});
