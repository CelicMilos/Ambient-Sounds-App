import { sounds, deafaultPresets } from "./soundData.js";
import { SoundManager } from "./soundManager.js";
import { UI } from "./ui.js";
import { PresetManager } from "./presetManager.js";
import { Timer } from "./timer.js";

class AmbientMixer {
  //initialize dependencies and default state

  constructor() {
    this.soundManager = new SoundManager(); //from soundManager.js
    this.ui = new UI();
    this.presetManager = new PresetManager();
    this.timer = new Timer(
      () => this.onTimerComplete(),
      (minutes, seconds) => this.ui.updateTimerDisplay(minutes, seconds)
    );
    this.currentSoundState = {};
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
      //Load custom Presets in UI
      this.loadCustomPresetsUI();
      //load all sounds
      this.loadAllSounds();
      //Initailize sund states after lading sounds
      sounds.forEach((sound) => {
        this.currentSoundState[sound.id] = 0;
      });
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
      //Brisanje custom preseta
      if (e.target.closest(".delete-preset")) {
        e.stopPropagation();
        const presetId = e.target.closest(".delete-preset").dataset.preset;
        this.deletCustomPreset(presetId);
        this.resetAll();
        return;
      }
      //Provera da li je default preset dugme kliknuto
      if (e.target.closest(".preset-btn")) {
        const presetKey = e.target.closest(".preset-btn").dataset.preset;
        await this.loadPreset(presetKey);
      }
      //Provera da li je custom preset dugme kliknuto
      if (e.target.closest(".custom-preset-btn")) {
        const presetKey = e.target.closest(".custom-preset-btn").dataset.preset;
        await this.loadPreset(presetKey, true);
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

    //Handle reset button
    if (this.ui.resetButton) {
      this.ui.resetButton.addEventListener("click", () => {
        this.resetAll();
      });
    }
    //Save preset btn
    const saveButton = document.getElementById("savePreset");
    if (saveButton) {
      saveButton.addEventListener("click", () => {
        this.showSavePresetModal();
      });
    }
    //Confirm Save preset btn on modal
    const confirmSaveButton = document.getElementById("confirmSave");
    if (confirmSaveButton) {
      confirmSaveButton.addEventListener("click", () => {
        this.saveCurrentPreset();
      });
    }

    //Cancel save preset btn on modal
    const cancelSaveButton = document.getElementById("cancelSave");
    if (cancelSaveButton) {
      cancelSaveButton.addEventListener("click", () => {
        this.ui.hideModal();
      });
    }
    //close modal if backdrop is clicked,
    // ako se modal prikazuje onda pritiskom bilo gde drugde se sklanja
    if (this.ui.modal) {
      this.ui.modal.addEventListener("click", (e) => {
        if (e.target === this.ui.modal) {
          this.ui.hideModal();
        }
      });
    }
    //Timer select
    const timerSelect = document.getElementById("timerSelect");
    if (timerSelect) {
      timerSelect.addEventListener("change", (e) => {
        const minutes = parseInt(e.target.value);
        if (minutes > 0) {
          this.timer.start(minutes);
          console.log(`Timer started in ${minutes} minutes`);
        } else {
          this.timer.stop();
        }
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
      //Set current sound state
      this.currentSoundState[soundId] = volume;

      //Ako je zvuk pauziran -- nema zvuka,pusti svuk ponovo
      this.soundManager.setVolume(soundId, volume);
      await this.soundManager.playSound(soundId);
      this.ui.updatePlayButton(soundId, true);
      //Update volume display
      this.ui.updateVolumeDisplay(soundId, volume);
    } else {
      //ako ima zvuka,ugasi ga
      this.soundManager.pauseSound(soundId);
      this.currentSoundState[soundId] = 0;
      this.ui.updatePlayButton(soundId, false);

      //Set current sound state to 0 when paused
      this.currentSoundState[soundId] = 0;
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
          this.currentSoundState[soundId] = volume;
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
    //Set sound volume in state
    this.currentSoundState[soundId] = volume;
    // console.log(this.currentSoundState);

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

    //Reset timer
    this.timer.stop();
    if (this.ui.timerSelect) {
      this.ui.timerSelect.value = "0";
    }

    //Reset active presets
    this.ui.setActivePreset(null);

    //Reset active states
    sounds.forEach((sound) => {
      this.currentSoundState[sound.id] = 0;
    });
  }
  //Load preset config
  loadPreset(presetKey, custom = false) {
    let preset;
    if (custom) {
      preset = this.presetManager.laodPreset(presetKey);
    } else {
      preset = deafaultPresets[presetKey];
    }

    if (!preset) {
      console.error(`Preset --${presetKey}-- is not found`);
      return;
    }
    //First,stop all sounds
    this.soundManager.stopAll();
    //Reset all volumes
    sounds.forEach((sound) => {
      this.currentSoundState[sound.id] = 0;
      this.ui.updateVolumeDisplay(sound.id, 0);
      this.ui.updatePlayButton(sound.id, false);
    });
    //Apply preset volumes
    for (const [soundId, volume] of Object.entries(preset.sounds)) {
      //Set volume state
      this.currentSoundState[soundId] = volume;
      //Update Ui
      this.ui.updateVolumeDisplay(soundId, volume);
      //Calculate effective volume
      const effectiveVolume = (volume * this.masterVolume) / 100;
      //Get audio element and set value
      const audio = this.soundManager.audioElements.get(soundId);
      if (audio) {
        audio.volume = effectiveVolume / 100;
        //Play the sounds
        audio.play();
        this.ui.updatePlayButton(soundId, true);
      }
    }
    //Update main Play btn and state
    this.soundManager.isPlaying = true;
    this.ui.updateMainPlayButton(true);

    //Set active preset
    if (presetKey) {
      this.ui.setActivePreset(presetKey);
    }
  }
  //Show preset MOdal
  showSavePresetModal() {
    //Check if any sounds are active
    const hasActiveSounds = Object.values(this.currentSoundState).some(
      (v) => v > 0
    ); //ako je value veca od 0,onda imamo aktivne zvuke
    if (!hasActiveSounds) {
      alert("Please pick some sounds first");
      return;
    }
    this.ui.showModal();
  }
  // Save current custom preset btn
  saveCurrentPreset() {
    //First - get the preset name
    const nameInput = document.getElementById("presetName");
    const name = nameInput.value.trim();

    if (!name) {
      alert("Please enter preset name");
      return;
    }
    if (this.presetManager.presetNameExists(name)) {
      alert(`There is already a preset with the name ${name}.`);
      return;
    }
    const presetId = this.presetManager.savePreset(
      name,
      this.currentSoundState
    );
    //Add custom preset btn tu UI
    this.ui.addCustomPreset(name, presetId);
    this.ui.hideModal();
    console.log(`Preset ${name} with the ID ${presetId} is saved.`);
  }
  //Load Custom preset btns in UI
  loadCustomPresetsUI() {
    //Uzimao ih iz presetMa
    const customPresets = this.presetManager.customPresets;
    for (const [presetId, preset] of Object.entries(customPresets)) {
      this.ui.addCustomPreset(preset.name, presetId);
    }
  }

  //Delete custom preset
  deletCustomPreset(presetId) {
    if (this.presetManager.deletePreset(presetId)) {
      this.ui.removeCustomPreset(presetId);
      console.log(`Preset ${presetId} deleted.`);
    }
  }
  //Timer complete callback function,FIRST ONE
  onTimerComplete() {
    //Stop all sounds
    this.soundManager.pauseAll();
    this.ui.updateMainPlayButton(false);
    //Update individual buttons
    sounds.forEach((sound) => {
      this.ui.updatePlayButton(sound.id, false);
    });
    //Reset timer dropdown
    const timerSelect = document.getElementById("timerSelect");
    if (timerSelect) {
      timerSelect.value = "0";
    }
    //Clear and hide timer diplay
    if (this.ui.timerDisplay) {
      this.ui.timerDisplay.textContent = "";
      this.ui.timerDisplay.classList.add("hidden");
    }
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
