import assert from "node:assert/strict";
import test from "node:test";
import { fontSizes, motion, radius, shadow, spacing, tokens, zIndex } from "./tokens";

test("spacing uses the 4 8 12 16 24 32 48 64 scale", () => {
  assert.deepEqual(spacing, {
    0: "0px",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "24px",
    6: "32px",
    7: "48px",
    8: "64px",
  });
});

test("typography scale and heading/body line heights are fixed", () => {
  assert.deepEqual(fontSizes, {
    12: "12px",
    14: "14px",
    16: "16px",
    18: "18px",
    20: "20px",
    24: "24px",
    32: "32px",
  });
  assert.equal(tokens.lineHeights.body, 1.5);
  assert.equal(tokens.lineHeights.heading, 1.25);
  assert.deepEqual(tokens.fontWeights, { regular: 400, medium: 500, semibold: 600 });
});

test("motion, z-index, radius and shadow tokens match the consistency system", () => {
  assert.deepEqual(motion, { micro: "150ms", page: "250ms", easing: "ease-out" });
  assert.deepEqual(zIndex, {
    base: 0,
    dropdown: 10,
    sticky: 20,
    drawer: 30,
    modal: 40,
    toast: 50,
    palette: 60,
  });
  assert.deepEqual(radius, { control: "4px", card: "8px", modal: "12px" });
  assert.deepEqual(shadow, { card: "var(--ui-shadow-card)", modal: "var(--ui-shadow-modal)" });
});
