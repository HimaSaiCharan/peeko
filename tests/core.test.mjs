import { test } from "node:test";
import assert from "node:assert/strict";
import { settings, fresh, reconcile, transition, DEFAULTS } from "../core.mjs";
const now = new Date(2026, 8, 23, 10).getTime();
test("starts a 20-minute work interval", () => {
  const t = fresh(DEFAULTS, now);
  assert.equal(t.deadline - now, 1200000);
  assert.equal(t.phase, "work");
});
test("invalid preferences fall back and numeric values are bounded", () => {
  const s = settings({
    minutes: -1,
    seconds: 999,
    theme: "unknown",
    volume: NaN,
    petX: 20,
    collapsed: "yes",
  });
  assert.equal(s.minutes, 1);
  assert.equal(s.seconds, 300);
  assert.equal(s.theme, "amethyst");
  assert.equal(s.volume, 45);
  assert.equal(s.petX, 1);
  assert.equal(s.collapsed, false);
});
test("deadline automatically begins a full break and triggers only one reminder", () => {
  const t = fresh(DEFAULTS, now);
  const r = reconcile(t, DEFAULTS, now + 1200000);
  assert.equal(r.event, "due");
  assert.equal(r.timer.phase, "break");
  assert.equal(r.timer.deadline, now + 1220000);
  assert.equal(reconcile(r.timer, DEFAULTS, now + 1200001).event, null);
});
test("custom duration applies to both automatic and preview breaks", () => {
  const s = settings({ seconds: 35 });
  const t = fresh(s, now);
  const b = reconcile(t, s, t.deadline).timer;
  assert.equal(b.deadline, t.deadline + 35000);
  const preview = transition(t, s, "preview", now + 5000);
  assert.equal(preview.phase, "break");
  assert.equal(preview.deadline, now + 40000);
});
test("pause and resume retain remaining time without drift", () => {
  let t = fresh(DEFAULTS, now);
  t = transition(t, DEFAULTS, "pause", now + 12345);
  assert.equal(t.remaining, 1187655);
  assert.equal(t.deadline, null);
  assert.equal(reconcile(t, DEFAULTS, now + 9000000).timer.phase, "work");
  t = transition(t, DEFAULTS, "pause", now + 100000);
  assert.equal(t.deadline, now + 1287655);
});
test("skip starts a fresh interval without incrementing completed breaks", () => {
  let t = { ...fresh(DEFAULTS, now), phase: "break", completed: 4 };
  t = transition(t, DEFAULTS, "skip", now + 100);
  assert.equal(t.phase, "work");
  assert.equal(t.completed, 4);
  assert.equal(t.deadline, now + 1200100);
});
test("finishing a break increments once and starts the next work interval", () => {
  const t = { ...fresh(DEFAULTS, now), phase: "break", deadline: now + 20000 };
  const r = reconcile(t, DEFAULTS, now + 20000);
  assert.equal(r.event, "finished");
  assert.equal(r.timer.completed, 1);
  assert.equal(r.timer.deadline, now + 1220000);
  assert.equal(reconcile(r.timer, DEFAULTS, now + 21000).timer.completed, 1);
});
test("late wake-up produces one reminder, never multiple accumulated breaks", () => {
  const t = fresh(DEFAULTS, now);
  const r = reconcile(t, DEFAULTS, now + 4 * 60 * 60 * 1000);
  assert.equal(r.timer.phase, "break");
  assert.equal(r.timer.deadline, now + 4 * 60 * 60 * 1000 + 20000);
  assert.equal(r.timer.completed, 0);
  assert.equal(r.event, "due");
});
test("daily count resets at local midnight", () => {
  const t = { ...fresh(DEFAULTS, now), completed: 7, paused: true };
  const r = reconcile(t, DEFAULTS, now + 86400000);
  assert.equal(r.timer.completed, 0);
  assert.equal(r.timer.paused, true);
});
test("pause also preserves a break countdown", () => {
  let t = { ...fresh(DEFAULTS, now), phase: "due", deadline: null };
  t = transition(t, DEFAULTS, "start", now);
  t = transition(t, DEFAULTS, "pause", now + 6000);
  assert.equal(t.remaining, 14000);
  t = transition(t, DEFAULTS, "pause", now + 30000);
  assert.equal(t.deadline, now + 44000);
});
test("automatic cycles keep running without start clicks", () => {
  let t = fresh(DEFAULTS, now);
  for (let cycle = 0; cycle < 3; cycle++) {
    let result = reconcile(t, DEFAULTS, t.deadline);
    assert.equal(result.timer.phase, "break");
    assert.equal(result.event, "due");
    result = reconcile(result.timer, DEFAULTS, result.timer.deadline);
    assert.equal(result.timer.phase, "work");
    assert.equal(result.event, "finished");
    assert.equal(result.timer.completed, cycle + 1);
    t = result.timer;
  }
});
test("upgrading a waiting prompt starts one full automatic break", () => {
  const old = {
    ...fresh(DEFAULTS, now),
    phase: "due",
    deadline: null,
    remaining: 0,
  };
  const r = reconcile(old, DEFAULTS, now + 1000);
  assert.equal(r.timer.phase, "break");
  assert.equal(r.timer.deadline, now + 21000);
  assert.equal(reconcile(r.timer, DEFAULTS, now + 1001).event, null);
});
test("old preferences gain readable defaults without losing custom settings", () => {
  const s = settings({
    minutes: 15,
    seconds: 30,
    theme: "iron",
    corner: "bottom-left",
  });
  assert.equal(s.font, "roboto");
  assert.equal(s.textSize, "comfortable");
  assert.equal(s.minutes, 15);
  assert.equal(s.theme, "iron");
  assert.equal(s.corner, "bottom-left");
});
test("font preferences accept supported choices and reject unknown input", () => {
  const s = settings({ font: "georgia", textSize: "extra" });
  assert.equal(s.font, "georgia");
  assert.equal(s.textSize, "extra");
  const fallback = settings({ font: "<bad>", textSize: 10 });
  assert.equal(fallback.font, "roboto");
  assert.equal(fallback.textSize, "comfortable");
});

test("visibility defaults on for upgrades and accepts only boolean preferences", () => {
  assert.equal(settings({ minutes: 15 }).showWidget, true);
  assert.equal(settings({ showWidget: false }).showWidget, false);
  assert.equal(settings({ showWidget: "false" }).showWidget, true);
});
