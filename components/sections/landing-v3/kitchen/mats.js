// Materials. Four finishes cover the whole kitchen:
//   soft    — matte toy plastic, the default
//   ceramic — glazed, for the bowl, the plates, the eyes and the syrup
//   bread   — fully matte, for the pancakes
//   glow    — unlit, for the cooking rings and the counter digits

import * as THREE from "three";

const cache = new Map();

function get(key, make) {
  let m = cache.get(key);
  if (!m) {
    m = make();
    cache.set(key, m);
  }
  return m;
}

export function disposeMaterials() {
  cache.forEach((m) => m.dispose());
  cache.clear();
}

export function soft(color, rough = 0.62) {
  return get(`soft:${color}:${rough}`, () => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 }));
}

export function ceramic(color, rough = 0.3, coat = 0.7) {
  return get(
    `ceramic:${color}:${rough}:${coat}`,
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: rough,
        metalness: 0,
        clearcoat: coat,
        clearcoatRoughness: 0.18,
      }),
  );
}

export function bread(color) {
  return get(`bread:${color}`, () => new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0 }));
}

export function glow(color, opacity = 1) {
  return get(
    `glow:${color}:${opacity}`,
    () =>
      new THREE.MeshBasicMaterial({
        color,
        toneMapped: false,
        transparent: opacity < 1,
        opacity,
        depthWrite: opacity >= 1,
      }),
  );
}
