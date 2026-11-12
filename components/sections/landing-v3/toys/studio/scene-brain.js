// 03 · "Your Brain recommends the next best Play."
// A brain, as a toy: one soft pink piece on a cream stand. Its folds are in the piece itself, so
// it casts one shadow. Until 2026-11-12 the set was the app's own drawing of the Brain (a dark
// centre, a hub of each colour, their dots on rods): as beads and rods it read as an atom, under
// too many shadows (founder, on the preview: "ça fait trop atome et trop d'ombre, on comprend
// pas"). What the Brain holds is now the page's own type round the piece (LpToySteps.tsx).

import { brainPiece } from "./brain.js";
import { C, mesh, puck, soft } from "./parts.js";

const STAND = { r: 2.5, h: 0.3 };
/** the brain's half-width */
const BRAIN_R = 1.86;

const scene = {
  size: [464, 426],
  camera: { look: [0, 0.4, 2.3], span: 12.2 },
  shadow: 0.16,
  build(s) {
    const { THREE } = s;
    const stand = s.add(mesh(puck(STAND.r, STAND.h, 0.12, 72), soft(C.ink30, 0.7)));
    const well = s.add(mesh(puck(STAND.r - 0.4, 0.06, 0.02, 72), soft(C.ink40, 0.7), [0, STAND.h - 0.02, 0]));
    const { piece: brain, height } = brainPiece(THREE, BRAIN_R);
    const seat = STAND.h + 0.05;
    brain.position.y += seat;
    s.add(brain);
    // the stand, then the brain by itself: the take lets it swell (its shadow on the stand is the
    // page's own, a soft ellipse under it, toys.css)
    s.layer("plate", [stand, well]);
    s.layer("brain", [brain], { shadow: false });
    s.anchor("centre", [0, seat + height * 0.52, 0]);
    s.anchor("top", [0, seat + height, 0]);
    // where it stands, and the stand's edges: the page hangs its type round these
    s.anchor("seat", [0, STAND.h, 0.2]);
    s.anchor("foot", [0, 0, STAND.r]);
    s.anchor("left", [-STAND.r, STAND.h / 2, 0]);
    s.anchor("right", [STAND.r, STAND.h / 2, 0]);
  },
};

export default scene;
