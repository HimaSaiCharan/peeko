import { test } from "node:test";
import assert from "node:assert/strict";
import { settings, themeIds } from "../core.mjs";
import "../pets.js";
import "../themes.js";

test("every gallery theme can be saved and has its own companion", () => {
  const themes = globalThis.FocusThemes.themes;
  assert.deepEqual(themes.map((t) => t.id).sort(), [...themeIds].sort());
  for (const theme of themes) {
    assert.equal(settings({ theme: theme.id }).theme, theme.id);
    assert.match(FocusThemes.pet(theme.id), /^<svg /);
  }
  assert.equal(themes.find((t) => t.id === "nightfury").pet, "Toothless");
  assert.notEqual(FocusThemes.pet("nightfury"), FocusThemes.pet("batman"));
});
