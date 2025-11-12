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
    this.curentSoundState = {};
    this.isInitialized = false;
    this.masterVolume = 100;
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
    //Handle master VOLUME slider
    const masterVolumeSlider = document.getElementById("masterVolume");
    if (masterVolumeSlider) {
      masterVolumeSlider.addEventListener("input", (e) => {
        const volume = parseInt(e.target.value);
        this.setMasterVolume(volume);
      });
    }
    //Handle master PLAY btn
    if (this.ui.playPauseButton) {
      this.ui.playPauseButton.addEventListener("click", () => {
        this.toggleAllSounds();
      });
    }
    if (this.ui.resetButton) {
      this.ui.resetButton.addEventListener("click", () => {
        this.resetAll();
      });
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
      this.ui.updatePlayButton(soundId, true);
      //Update volume display
      this.ui.updateVolumeDisplay(soundId, volume);
    } else {
      //ako ima zvuka,ugasi ga
      this.soundManager.pauseSound(soundId);
      this.ui.updatePlayButton(soundId, false);
    }
    //update main play btn
    this.updateMainPlayButtonState();
  }
  //Toggle all sounds
  toggleAllSounds() {
    //Toggle sounds OFF
    if (this.soundManager.isPlaying) {
      this.soundManager.pauseAll();
      this.ui.updateMainPlayButton(false);
      sounds.forEach((sound) => {
        this.ui.updatePlayButton(sound.id, false);
      });
    } else {
      //Toggle sounds ON
      for (const [soundId, audio] of this.soundManager.audioElements) {
        const card = document.querySelector(`[data-sound=${soundId}]`);
        const slider = card?.querySelector(".volume-slider");
        if (slider) {
          let volume = parseInt(slider.value);
          if (volume === 0) {
            volume = 30;
            slider.value = 30;
            this.ui.updateVolumeDisplay(soundId, 30);
          }
          this.curentSoundState[soundId] = volume;
          const effectiveVolume = (volume * this.masterVolume) / 100;
          audio.volume = effectiveVolume / 100;
          this.ui.updatePlayButton(soundId, true);
        }
      }
      //Play all sound
      this.soundManager.playAll();
      this.ui.updateMainPlayButton(true);
    }
  }
  // Set sound volume
  setSoundVolume(soundId, volume) {
    //Calculate effective volume wuth master volume
    const effectiveVolume = (volume * this.masterVolume) / 100;
    //Update the sound volume with the scale volume
    const audio = this.soundManager.audioElements.get(soundId);
    if (audio) {
      audio.volume = effectiveVolume / 100;
    }
    //update UI
    this.ui.updateVolumeDisplay(soundId, volume);

    //Sync sounds when PLAY/PAUSE all
    this.updateMainPlayButtonState();
  }
  //Set master volume
  setMasterVolume(volume) {
    this.masterVolume = volume;
    //Update display
    const masterVolumeValue = document.getElementById("masterVolumeValue");
    if (masterVolumeValue) {
      masterVolumeValue.textContent = `${volume}%`;
    }
    //Applay master volume to all currently playing sounds
    this.applyMasterVolumeToAll();
  }
  //Apply master volume
  applyMasterVolumeToAll() {
    for (const [soundId, audio] of this.soundManager.audioElements) {
      if (!audio.paused) {
        const card = document.querySelector(`[data-sound=${soundId}]`);
        const slider = card?.querySelector(".volume-slider");
        if (slider) {
          const individualVolume = parseInt(slider.value);
          //Calculate efective volume(individual * master / 100)
          const effectiveVolume = (individualVolume * this.masterVolume) / 100;

          //Apply to the actual audio element,
          //ako je master na 50% a individual na 30%
          //onda ce Efektivno bit 15% od individualnog.
          audio.volume = effectiveVolume / 100;
        }
      }
    }
  }
  //Update Main play btn based on individual sounds
  updateMainPlayButtonState() {
    //check if any sounds are playing
    let anySoundsPlaying = false;
    for (const [soundId, audio] of this.soundManager.audioElements) {
      if (!audio.paused) {
        anySoundsPlaying = true;
        break;
      }
    }
    //Update the main button and the internal state
    this.soundManager.isPlaying = anySoundsPlaying;
    this.ui.updateMainPlayButton(anySoundsPlaying);
  }
  //Reset all sounds
  resetAll() {
    //Stop all sounds
    this.soundManager.stopAll();
    //REset All UI
    this.ui.resetUI();
    //Reset master valume
    this.masterVolume = 100;
    console.log("All sounds and UI are reset to default.");
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
