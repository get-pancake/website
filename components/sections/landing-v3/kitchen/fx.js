// Small pools of meshes for the effects: every spark, puff and drop is one of a fixed set,
// shown, placed and hidden again by the show.

import * as THREE from "three";

export function pool(parent, n, geometry, material, shadow = false) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geometry, material);
    m.visible = false;
    m.castShadow = shadow;
    parent.add(m);
    list.push(m);
  }
  return list;
}

/** soft round sprites that always face the camera: steam, smoke */
export function sprites(parent, n, material) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const s = new THREE.Sprite(material);
    s.visible = false;
    parent.add(s);
    list.push(s);
  }
  return list;
}

/** shows `m` at `p` with size `s`, or hides it when the size is nothing */
export function put(m, p, s) {
  if (!(s > 0.002)) {
    m.visible = false;
    return;
  }
  m.visible = true;
  m.position.set(p[0], p[1], p[2]);
  m.scale.setScalar(s);
}
