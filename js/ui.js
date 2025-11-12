export class UI {
  constructor() {
    this.soundCardsContainer = null;
    this.masterVolumeSlider = null;
    this.masterVolumeValue = null;
    this.playPauseButton = null;
    this.resetButton = null;
    this.modal = null;
    this.customPresetsContainer = null;
    this.timerDisplay = null;
    this.timerSelect = null;
    this.themeToggle = null;
  }
  init() {
    this.soundCardsContainer = document.querySelector(".grid");
    this.masterVolumeSlider = document.getElementById("masterVolume");
    this.masterVolumeValue = document.getElementById("masterVolumeValue");
    this.playPauseButton = document.getElementById("playPauseAll");
    this.resetButton = document.getElementById("resetAll");
    this.modal = document.getElementById("savePresetModal");
    this.customPresetsContainer = document.getElementById("customPresets");
    this.timerDisplay = document.getElementById("masterVolume");
    this.timerSelect = document.getElementById("timerDisplay");
    this.themeToggle = document.getElementById("themeToggle");
  }

  //Create sound card HTML

  createSoundCard(sound) {
    const card = document.createElement("div");
    card.className =
      "sound-card bg-white/10 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden transition-all duration-300";
    card.dataset.sound = sound.id;
    card.innerHTML = ` <div class="flex flex-col h-full">
      <!-- Sound Icon and Name -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="sound-icon-wrapper w-12 h-12 rounded-full bg-gradient-to-br ${sound.color} flex items-center justify-center">
            <i class="fas ${sound.icon} text-white text-xl"></i>
          </div>
          <div>
            <h3 class="font-semibold text-lg">${sound.name}</h3>
            <p class="text-xs opacity-70">${sound.description}</p>
          </div>
        </div>
        <button type="button" class="play-btn w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center" data-sound="${sound.id}">
          <i class="fas fa-play text-sm"></i>
        </button>
      </div>

      <!-- Volume Control -->
      <div class="flex-1 flex flex-col justify-center">
        <div class="flex items-center space-x-3">
          <i class="fas fa-volume-low opacity-50"></i>
          <input type="range" class="volume-slider flex-1" min="0" max="100" value="0" data-sound="${sound.id}">
          <span class="volume-value text-sm w-8 text-right">0</span>
        </div>

        <!-- Volume Bar Visualization -->
        <div class="volume-bar mt-3">
          <div class="volume-bar-fill" style="width: 0%"></div>
        </div>
      </div>
    </div>`;
    return card;
  }

  //Render all sound cards

  renderSoundCards(sounds) {
    this.soundCardsContainer.innerHTML = null;
    sounds.forEach((sound) => {
      const card = this.createSoundCard(sound);
      this.soundCardsContainer.appendChild(card);
    });
  }

  //Update play/pause button for idividual sound
  updatePlayButton(soundId, isPlaying) {
    const card = document.querySelector(`[data-sound="${soundId}"]`); //metadata atribute
    if (card) {
      const playBtn = card.querySelector(".play-btn");
      const icon = playBtn.querySelector("i");
      if (isPlaying) {
        //ako svira,menjamo ikonu i pustamo zvuk
        icon.classList.remove("fa-play");
        icon.classList.add("fa-pause");
        card.classList.add("playing");
      } else {
        //ako ne svira,onda obrnuto
        icon.classList.remove("fa-pause");
        icon.classList.add("fa-play");
        card.classList.remove("playing");
      }
    }
  }
  // Update Volume Display for individual sounds
  updateVolumeDisplay(soundId, volume) {
    const card = document.querySelector(`[data-sound=${soundId}]`);
    //Update number displpay
    if (card) {
      const volumeValue = card.querySelector(".volume-value");
      if (volumeValue) {
        volumeValue.textContent = volume;
      }
      //Update visual volume bar

      //volume slider
      const volumeSlider = card.querySelector(".volume-slider");
      if (volumeSlider) {
        volumeSlider.value = volume;
      }
      //volume bar fill
      const volumeBarFill = card.querySelector(".volume-bar-fill");
      if (volumeBarFill) {
        volumeBarFill.style.width = `${volume}%`;
      }
    }
  }

  //Update Play all/Pause all button
  updateMainPlayButton(isPlaying) {
    const icon = this.playPauseButton.querySelector("i");
    if (isPlaying) {
      icon.classList.remove("fa-play");
      icon.classList.add("fa-pause");
    } else {
      icon.classList.remove("fa-pause");
      icon.classList.add("fa-play");
    }
  }

  //Reset all UI elements to default state
  resetUI() {
    // reset slider to 0
    const sliders = document.querySelectorAll(".volume-slider");
    sliders.forEach((slider) => {
      slider.value = 0;
      const soundId = slider.dataset.sound;
      this.updateVolumeDisplay(soundId, 0);
    });

    //Reset play btns
    const playBtns = document.querySelectorAll(".play-btn");
    playBtns.forEach((btn) => {
      const icon = btn.querySelector("i");
      icon.classList.remove("fa-pause");
      icon.classList.add("fa-play");
    });
    //Remove playing class from cards
    const cards = document.querySelectorAll(".sound-card");
    cards.forEach((card) => {
      card.classList.remove("fa-playing");
    });
    //Reset Master Play/Pause btn
    this.updateMainPlayButton(false);
    //Reset master volume to 100
    this.masterVolumeSlider.value = 100;
    this.masterVolumeValue.textContent = "100%";
  }
}
