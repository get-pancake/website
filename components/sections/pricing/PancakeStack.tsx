"use client";

import { AnimatePresence, motion } from "framer-motion";

/**
 * Pancake-monster stack widget — 1 to 5 pancakes, animated.
 *
 * Pancake shapes (sides + top) and master colours come from the Figma master
 * (file fr8NgOCTUxsEbrMEJA3YKu, node 177:11377). For 4 and 5 we add orange
 * and mint pancakes (mint pulled from --palette-green-20 so the brand
 * palette stays consistent), keeping the master's shape paths unchanged.
 *
 * Stacking model — BOTTOM-ANCHORED, NEW-AT-THE-BOTTOM, EXISTING-RISE-UP.
 * The lowest slot is FIXED at BOTTOM_PANCAKE_Y. On tier-up:
 *   1. every previously placed pancake shifts UP by one slot (SLOT_DY)
 *   2. the newly added pancake slides into the bottom slot from below
 * The eyes-pancake (golden, stack index 0) sits at the bottom when count=1
 * and rises higher as the stack grows — it always stays at the TOP of the
 * rendered stack. Order top-to-bottom in the 5-stack:
 *   golden (top, with eyes) → purple → mint → orange → pink (bottom).
 *
 * Z-order: pancakes are drawn from bottom slot upward so the eyes-pancake
 * is drawn LAST and its face stays on top z-wise where it overlaps with
 * the slot just below it.
 */

type PancakeColor = "golden" | "purple" | "orange" | "pink" | "mint";

const PANCAKE_FILL: Record<PancakeColor, { top: string; sides: string }> = {
  golden: { top: "#FFBD7A", sides: "#FFDBB5" }, // master top — has eyes (always slot 0)
  purple: { top: "#BA8BFF", sides: "#DEC3F5" }, // master middle (added at 3-stack)
  orange: { top: "#FFA45F", sides: "#FFDDBE" }, // added at 4-stack
  pink:   { top: "#FF7AA0", sides: "#FFBBC7" }, // master bottom (added at 2-stack)
  mint:   { top: "#68CEA7", sides: "#A8E5C9" }, // added at 5-stack (scaleup tier)
};

// Append-only stack — top-to-bottom composition. Slot 0 always has the
// eyes-pancake (golden) at the top; each new pancake is appended at the
// bottom. count=N+1 = count=N + one new entry at the end.
//   golden (top, eyes) → purple → mint → orange → pink (bottom of 5-stack)
const STACKS: Record<1 | 2 | 3 | 4 | 5, PancakeColor[]> = {
  1: ["golden"],
  2: ["golden", "purple"],
  3: ["golden", "purple", "mint"],
  4: ["golden", "purple", "mint", "orange"],
  5: ["golden", "purple", "mint", "orange", "pink"],
};

// Alternating x offsets give the stack a playful lean. Indexed by stack
// position (0 = top of the stack, growing downward).
const SLOT_X = [38, 64, 24, 58, 30];
// Vertical spacing between pancake centres (master uses ~50 px).
const SLOT_DY = 48;
// Bottom-anchored: the LOWEST pancake always sits here. Existing pancakes
// shift up by SLOT_DY on tier-up; the newly added one lands at this y.
// Lifted from 222 → 197 so the pancake "floats" further above its shadow
// without the shadow itself moving (the gap below grew from 15 → 40).
const BOTTOM_PANCAKE_Y = 197;
// Approximate visual height of a rendered pancake (sides svg, 212 px) plus
// the y offset of the sides svg inside the Pancake group (22.33 px).
const PANCAKE_VISUAL_HEIGHT = 234.5;
// How far below the bottom pancake the ground shadow sits. Ground is FIXED
// in the bottom-anchored model — GROUND_Y stays at the same viewBox y as
// before (471.5); only the pancake position changed, so the visual gap
// between pancake bottom and shadow grew.
const GROUND_OFFSET_BELOW_STACK = 40;
const GROUND_Y =
  BOTTOM_PANCAKE_Y + PANCAKE_VISUAL_HEIGHT + GROUND_OFFSET_BELOW_STACK;

function slotY(stackIndex: number, count: number) {
  // Stack index 0 = top of stack, count-1 = bottom. Bottom is anchored to
  // BOTTOM_PANCAKE_Y; each step toward the top subtracts one SLOT_DY.
  return BOTTOM_PANCAKE_Y - SLOT_DY * (count - 1 - stackIndex);
}

const VIEWBOX_W = 330;
const VIEWBOX_H = 480;
const GROUND_CX = 168;
// viewBox crops the dead area above the topmost pancake so the SVG fills
// the wrap tightly. The 5-pancake stack (top at y=5 when count=5, visual
// top ~27, bottom fixed at y=197, visual bottom ~431, ground ~471.5)
// fits inside the cropped viewBox with room for the shadow at the bottom.
const VIEWBOX_Y = 20;
const VIEWBOX_H_CROPPED = VIEWBOX_H - VIEWBOX_Y;

const SPRING = {
  type: "spring",
  stiffness: 320,
  damping: 13,
  mass: 0.7,
} as const;

export function PancakeStack({ count }: { count: 1 | 2 | 3 | 4 | 5 }) {
  const stack = STACKS[count];
  /* Render slot indices in reverse so the bottom pancake is drawn first and
     the eyes-pancake (slot 0, top) is drawn LAST → eyes always render on
     top z-wise. */
  const renderOrder = Array.from(
    { length: stack.length },
    (_, i) => stack.length - 1 - i,
  );
  return (
    <svg
      className="pancake-stack__svg"
      viewBox={`0 ${VIEWBOX_Y} ${VIEWBOX_W} ${VIEWBOX_H_CROPPED}`}
      width={VIEWBOX_W}
      height={VIEWBOX_H_CROPPED}
      role="img"
      aria-label={`stack of ${count} ${count === 1 ? "pancake" : "pancakes"}`}
    >
      {/* Soft ground shadow — FIXED in the bottom-anchored model; sits
          just below the (also fixed) bottom pancake. */}
      <ellipse
        cx={GROUND_CX}
        cy={GROUND_Y}
        rx={132}
        ry={11}
        fill="#2C002A"
        opacity={0.09}
      />

      <AnimatePresence initial={false}>
        {renderOrder.map((stackIndex) => {
          const color = stack[stackIndex];
          const x = SLOT_X[stackIndex];
          const y = slotY(stackIndex, count);
          // Eyes ride on the TOP pancake (stack index 0, golden) — the
          // mascot face is always on the top of the rendered stack.
          const hasEyes = stackIndex === 0;
          /* On tier-up, each existing pancake's target y depends on count,
             so framer-motion springs them all UP by one slot. The new
             pancake (last index in stack) plays initial → animate, sliding
             into the bottom slot from below — like sliding a plate in
             underneath the existing stack. */
          return (
            <motion.g
              key={color}
              initial={{ opacity: 0, x, y: y + 60, scale: 0.82 }}
              animate={{ opacity: 1, x, y, scale: 1 }}
              exit={{ opacity: 0, x, y: y + 36, scale: 0.78 }}
              transition={SPRING}
            >
              <Pancake color={color} hasEyes={hasEyes} />
            </motion.g>
          );
        })}
      </AnimatePresence>
    </svg>
  );
}

function Pancake({ color, hasEyes }: { color: PancakeColor; hasEyes: boolean }) {
  const fill = PANCAKE_FILL[color];
  return (
    <g>
      {/* Pancake sides — darker, taller rim (drawn first so the cap sits on top) */}
      <svg
        x={0.08}
        y={22.33}
        width={268}
        height={212.167}
        viewBox="0 0 118.128 94.3014"
        preserveAspectRatio="none"
      >
        <path
          d="M56.1529 0C82.716 0 118.128 22.5485 118.128 45.7613C118.128 70.8726 94.3246 94.3014 62.9668 94.3014C48.6489 94.3014 33.3911 89.8372 22.8797 83.1857C10.3699 75.2697 -0.172674 66.2245 0.00214343 49.4564C0.284939 22.3408 26.3027 0 56.1529 0Z"
          fill={fill.sides}
        />
      </svg>
      {/* Pancake top — lighter, oval cap */}
      <svg
        x={8.46}
        y={22.33}
        width={251.25}
        height={178.667}
        viewBox="0 0 110.745 79.4128"
        preserveAspectRatio="none"
      >
        <path
          d="M52.6433 0C77.5462 0 110.745 18.9885 110.745 38.5363C110.745 59.683 88.4293 79.4128 59.0314 79.4128C45.6083 79.4128 31.3042 75.6534 21.4497 70.052C9.72174 63.3858 -0.161881 55.7687 0.00200947 41.648C0.26713 18.8136 24.6588 0 52.6433 0Z"
          fill={fill.top}
        />
      </svg>
      {hasEyes ? <Eyes /> : null}
    </g>
  );
}

function Eyes() {
  // Master positions (relative to the top-pancake's 268×268 local frame):
  //   left eye  centred at (55.7, 109.5), 25.4 wide × 44.2 tall
  //   right eye centred at (135.4, 105),  33.2 wide × 57.9 tall
  // The master uses bezier paths; visually identical to plain ellipses at this
  // resolution, so we render simple ellipses for crisper edges.
  return (
    <>
      <ellipse cx={56} cy={110} rx={12.7} ry={22.1} fill="#2C002A" />
      <ellipse cx={135} cy={105} rx={16.6} ry={28.95} fill="#2C002A" />
    </>
  );
}
