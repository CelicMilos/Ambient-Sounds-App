// Sound data config
export const sounds = [
  {
    id: "rain",
    name: "Rain",
    icon: "fa-cloud-rain",
    color: "from-blue-500 to-cyan-500", //background of icon
    file: "rain.mp3",
    description: "Gentile rainfall",
  },
  {
    id: "ocean",
    name: "Ocean Waves",
    icon: "fa-water",
    color: "from-teal-500 to-blue-500",
    file: "ocean.mp3",
    description: "Calming ocean waves",
  },
  {
    id: "forest",
    name: "Forest",
    icon: "fa-tree",
    color: "from-green-500 to-emerald-500",
    file: "birds.mp3",
    description: "Birds and wind in trees",
  },
  {
    id: "fireplace",
    name: "Fireplace",
    icon: "fa-fire",
    color: "from-orange-500 to-red-500",
    file: "fireplace.mp3",
    description: "Crackling fire",
  },
  {
    id: "thunder",
    name: "Thunder",
    icon: "fa-bolt",
    color: "from-purple-500 to-indigo-500", //background of icon
    file: "thunder.mp3",
    description: "Distante thunder",
  },
  {
    id: "wind",
    name: "Wind",
    icon: "fa-wind",
    color: "from-gray-400 to-grey-600", //background of icon
    file: "wind.mp3",
    description: "Gentile breeze",
  },
  {
    id: "cafe",
    name: "Cafe",
    icon: "fa-mug-hot",
    color: "from-amber-600 to-yellow-600", //background of icon
    file: "cafe.mp3",
    description: "Ambient cafe sounds",
  },
  {
    id: "night",
    name: "Night",
    icon: "fa-moon",
    color: "from-indigo-600 to-purple-600", //background of icon
    file: "night.mp3",
    description: "Crickets and night sounds",
  },
];

// Default preset config,objekti sa key za svaki posebno(focus,relax,sleep)

export const deafaultPresets = {
  focus: {
    name: "Focus",
    icon: "fa-brain",
    sounds: {
      //kolekcija zvukova i njihova jacina
      rain: 30,
      cafe: 20,
      wind: 10,
    },
  },
  relax: {
    name: "Relax",
    icon: "fa-spa",
    sounds: {
      //kolekcija zvukova i njihova jacina
      ocaen: 40,
      forest: 30,
      wind: 10,
    },
  },
  sleep: {
    name: "Sleep",
    icon: "fa-bed",
    sounds: {
      //kolekcija zvukova i njihova jacina
      rain: 40,
      night: 30,
      wind: 15,
    },
  },
};
