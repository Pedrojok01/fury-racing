// Cars.
export const carMetadata = [
  {
    path: "car1",
    scale: 1.0,
    offset: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  {
    path: "car2",
    scale: 1.25,
    offset: {
      x: 0,
      y: -0.1,
      z: 0.5,
    },
  },
  {
    path: "car3",
    scale: 0.0145,
    offset: {
      x: 0,
      y: 0,
      z: -1,
    },
  },
];

// Tracks. https://www.trackshaker.com/trackmaps
// -- Valid tiles (copy the characters as-is!):
// -- Road tiles:       ─ │ ┌ ┐ └ ┘
// -- Scenery tiles:
// --   0   Plain

export const trackMonaco = {
  tiles: `
    0000000000000000000000
    00000000000000┌───┐000
    00000000000000│000│┌┐0
    00000000000000│000└┘│0
    00000000000000│00000│0
    00┌───────────┘00000│0
    0┌┘00000000000000000│0
    0│0┌───┐0┌──────────┘0
    0│0│000└─┘000000000000
    0│0│000000000000000000
    0│0└┐00000000000000000
    0│00│00000000000000000
    0│00│00000000000000000
    0│0┌┘00000000000000000
    0│0│000000000000000000
    0│0│000000000000000000
    0└┐└─┐0000000000000000
    00└──┘ 000000000000000
    0000000000000000000000
  `,
  startPosition: {
    x: 1,
    y: 8,
    direction: "north",
  },
};

export const trackEaglesCanyonRaceway = {
  tiles: `
    00000000000000
    0000┌──┐000000
    0┌─┐└─┐└────┐0
    0│0│00│0┌───┘0
    0│0└──┘0└┐0000
    0│0000┌──┘0000
    0└────┘0000000
    00000000000000
  `,
  startPosition: {
    x: 8,
    y: 5,
    direction: "east",
  },
};
