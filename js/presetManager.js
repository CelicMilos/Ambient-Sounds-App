export class PresetManager {
  constructor() {
    this.customPresets = this.loadCustomPresets();
  }
  //Load Presets from localStorage
  loadCustomPresets() {
    const stored = localStorage.getItem("ambientMixerPresets");
    return stored ? JSON.parse(stored) : {}; //ako je sacuvano,vrati ga u funkciju ali ga prvo parsuj u JSON
  }
  //Laod custom preset by ID
  laodPreset(presetId) {
    return this.customPresets[presetId] || null;
  }
  //Save custom presets to localStorage
  saveCustomPresets() {
    localStorage.setItem(
      "ambientMixerPresets",
      JSON.stringify(this.customPresets)
    );
  }

  //Save current mix of sounds as preset
  savePreset(name, soundStates) {
    const presetId = `custom-${Date.now()}`; //Unique ID
    //Save preset object with only actice sounds
    const preset = {
      name,
      sounds: {},
    };
    for (const [soundId, volume] of Object.entries(soundStates)) {
      if (volume > 0) {
        preset.sounds[soundId] = volume; //soundId is key,volume is value
      }
    }
    this.customPresets[presetId] = preset;
    this.saveCustomPresets();

    return presetId;
  }
  //Check if preset name already exists
  presetNameExists(name) {
    return Object.values(this.customPresets).some(
      (preset) => preset.name === name
    );
  }

  //Delete a custom preset
  deletePreset(presetId) {
    if (this.customPresets[presetId]) {
      delete this.customPresets[presetId];
      this.saveCustomPresets();
      return true;
    }
    return false;
  }
}
