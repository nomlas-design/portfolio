// src/config/colourSchemes.ts
import * as THREE from 'three';

export const baseColours = {
  colour1: new THREE.Vector3(0.718, 0.367, 0.222), // Primary red
  colour2: new THREE.Vector3(1.0, 0.786, 0.633), // Intense orange
  colour3: new THREE.Vector3(1.0, 0.092, 0.255), // Saturated red
  // colour1: new THREE.Vector3(0.918, 0.367, 0.322), // Primary red
  // colour2: new THREE.Vector3(0.5, 0.586, 0.333), // Intense orange
  // colour3: new THREE.Vector3(0.0, 0.992, 0.955), // Saturated red
};

export const alternativeColourSchemes = [
  {
    name: 'Ocean Depths',
    colours: {
      colour1: new THREE.Vector3(0.618, 0.267, 0.022), // Primary red
      colour2: new THREE.Vector3(1.0, 0.586, 0.333), // Intense orange
      colour3: new THREE.Vector3(1.0, 0.092, 0.955), // Saturated red
    },
  },
];
