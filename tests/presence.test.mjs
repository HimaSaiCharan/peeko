import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS, fresh, reconcile, transition, dayKey } from "../core.mjs";
import { applyPresence } from "../presence.mjs";
const now = new Date(2026, 8, 25, 10).getTime();
const presence = (t, state, at, s = DEFAULTS) => applyPresence(t, state, s, at);

test("a reported lock pauses; unlock starts a full focus interval once", () => {
  const t = { ...fresh(DEFAULTS, now), completed: 3 };
  const locked = presence(t, "locked", now + 12345);
  assert.equal(locked.remaining, 1187655);
  assert.equal(locked.paused, true);
  assert.equal(locked.systemPaused, true);
  assert.equal(locked.deadline, null);
  assert.deepEqual(presence(locked, "locked", now + 3600000), locked);
  const unlocked = presence(locked, "active", now + 3600010);
  assert.equal(unlocked.deadline, now + 3600010 + 1200000);
  assert.equal(unlocked.total, 1200000);
  assert.equal(unlocked.remaining, 1200000);
  assert.equal(unlocked.paused, false);
  assert.equal(unlocked.systemPaused, false);
  assert.equal(unlocked.completed, 3);
  assert.deepEqual(presence(unlocked, "active", now + 3600020), unlocked);
  assert.deepEqual(presence(unlocked, "idle", now + 3600030), unlocked);
});

test("without a previous checkpoint, inactivity and elapsed time do not trigger a gap reset", () => {
  const t = fresh(DEFAULTS, now);
  for (const state of ["idle", "active"]) {
    for (const gap of [30000, 45001, 120000, 7200000]) {
      assert.deepEqual(presence(t, state, now + gap), t);
    }
  }
});

test("an overdue unlocked timer follows normal phase transitions, not a reset", () => {
  const t = fresh(DEFAULTS, now),
    wake = now + 7200000;
  const result = reconcile(presence(t, "active", wake), DEFAULTS, wake);
  assert.equal(result.timer.phase, "break");
  assert.equal(result.event, "due");
  assert.equal(result.timer.deadline, wake + DEFAULTS.seconds * 1000);
  const after = reconcile(
    presence(result.timer, "idle", wake + 3600000),
    DEFAULTS,
    wake + 3600000,
  );
  assert.equal(after.timer.phase, "work");
  assert.equal(after.timer.completed, 1);
  assert.equal(after.event, "finished");
});

test("lock interrupts a break; unlock discards it without incrementing the count", () => {
  const t = transition(
    { ...fresh(DEFAULTS, now), completed: 2 },
    DEFAULTS,
    "preview",
    now,
  );
  const locked = presence(t, "locked", now + 5000);
  assert.equal(reconcile(locked, DEFAULTS, now + 7200000).event, null);
  const unlocked = presence(locked, "idle", now + 7200000);
  assert.equal(unlocked.phase, "work");
  assert.equal(unlocked.completed, 2);
  assert.equal(unlocked.deadline, now + 7200000 + DEFAULTS.minutes * 60000);
});

test("late lock detection suppresses an overdue reminder before reconciliation", () => {
  const locked = presence(fresh(DEFAULTS, now), "locked", now + 7200000);
  assert.equal(locked.remaining, 0);
  assert.equal(locked.deadline, null);
  assert.equal(reconcile(locked, DEFAULTS, now + 7200000).event, null);
  assert.equal(presence(locked, "active", now + 7200001).remaining, 1200000);
});

test("manual pauses in either phase survive locks, unlocks and stored-state restoration", () => {
  for (const initial of [
    fresh(DEFAULTS, now),
    transition(fresh(DEFAULTS, now), DEFAULTS, "preview", now),
  ]) {
    const paused = transition(initial, DEFAULTS, "pause", now + 1000);
    for (const state of ["locked", "idle", "active"]) {
      assert.deepEqual(
        presence(JSON.parse(JSON.stringify(paused)), state, now + 7200000),
        paused,
      );
    }
  }
});

test("unlock uses the latest configured duration and resets yesterday’s daily count", () => {
  const locked = presence(
    { ...fresh(DEFAULTS, now), completed: 4 },
    "locked",
    now + 1,
  );
  const s = { ...DEFAULTS, minutes: 8 },
    tomorrow = now + 86400000;
  const result = reconcile(presence(locked, "idle", tomorrow, s), s, tomorrow);
  assert.equal(result.timer.total, 480000);
  assert.equal(result.timer.deadline, tomorrow + 480000);
  assert.equal(result.timer.completed, 0);
  assert.equal(result.timer.day, dayKey(tomorrow));
  assert.equal(result.event, null);
});

test("saved v1.6 automatic pauses reset on unlock; unknown state cannot unlock them", () => {
  const saved = {
    ...fresh(DEFAULTS, now),
    paused: true,
    systemPaused: true,
    deadline: null,
    remaining: 123000,
  };
  assert.deepEqual(presence(saved, "unknown", now + 10), saved);
  assert.equal(presence(saved, "active", now + 10).remaining, 1200000);
});

test("legacy waiting timers stay paused when locked and start focus on unlock", () => {
  const t = { ...fresh(DEFAULTS, now), phase: "due", deadline: null };
  const locked = presence(t, "locked", now + 10);
  assert.equal(reconcile(locked, DEFAULTS, now + 10).event, null);
  const result = reconcile(
    presence(locked, "active", now + 10000),
    DEFAULTS,
    now + 10000,
  );
  assert.equal(result.timer.phase, "work");
  assert.equal(result.event, null);
});

test("gap threshold is strictly greater than two minutes for active and idle states", () => {
  const t = fresh(DEFAULTS, now);
  for (const state of ["active", "idle"]) {
    for (const gap of [30000, 45001, 119999, 120000]) {
      assert.deepEqual(applyPresence(t, state, DEFAULTS, now + gap, now), t);
    }
    const result = applyPresence(t, state, DEFAULTS, now + 120001, now);
    assert.equal(result.phase, "work");
    assert.equal(result.deadline, now + 120001 + 1200000);
  }
});

test("a gap resets an overdue focus or break before sounds and completion accounting", () => {
  for (const t of [
    { ...fresh(DEFAULTS, now), completed: 4 },
    transition(
      { ...fresh(DEFAULTS, now), completed: 4 },
      DEFAULTS,
      "preview",
      now,
    ),
  ]) {
    const wake = now + 7200000;
    const result = reconcile(
      applyPresence(t, "active", DEFAULTS, wake, now),
      DEFAULTS,
      wake,
    );
    assert.equal(result.timer.phase, "work");
    assert.equal(result.timer.completed, 4);
    assert.equal(result.timer.deadline, wake + 1200000);
    assert.equal(result.event, null);
  }
});

test("a lock takes priority over a long gap and waits for unlock", () => {
  const locked = applyPresence(
    fresh(DEFAULTS, now),
    "locked",
    DEFAULTS,
    now + 7200000,
    now,
  );
  assert.equal(locked.paused, true);
  assert.equal(locked.systemPaused, true);
  assert.equal(locked.deadline, null);
  const stillLocked = applyPresence(
    locked,
    "locked",
    DEFAULTS,
    now + 14400000,
    now + 7200000,
  );
  assert.deepEqual(stillLocked, locked);
  const unlocked = applyPresence(
    stillLocked,
    "idle",
    DEFAULTS,
    now + 14400001,
    now + 14400000,
  );
  assert.equal(unlocked.deadline, now + 14400001 + 1200000);
});

test("manual pauses in both phases survive long gaps", () => {
  for (const t of [
    fresh(DEFAULTS, now),
    transition(fresh(DEFAULTS, now), DEFAULTS, "preview", now),
  ]) {
    const paused = transition(t, DEFAULTS, "pause", now + 1000);
    for (const state of ["locked", "active", "idle"]) {
      assert.deepEqual(
        applyPresence(paused, state, DEFAULTS, now + 7200000, now),
        paused,
      );
    }
  }
});

test("missing, invalid or future checkpoints do not create gap resets", () => {
  const t = fresh(DEFAULTS, now),
    at = now + 180000;
  for (const checkedAt of [
    undefined,
    null,
    NaN,
    Infinity,
    "123",
    -1,
    at + 1000,
  ]) {
    assert.deepEqual(applyPresence(t, "active", DEFAULTS, at, checkedAt), t);
  }
});

test("gap resets use configured duration and reconcile the daily count", () => {
  const s = { ...DEFAULTS, minutes: 8 },
    tomorrow = now + 86400000;
  const t = { ...fresh(s, now), completed: 4 };
  const result = reconcile(
    applyPresence(t, "idle", s, tomorrow, now),
    s,
    tomorrow,
  );
  assert.equal(result.timer.deadline, tomorrow + 480000);
  assert.equal(result.timer.remaining, 480000);
  assert.equal(result.timer.completed, 0);
  assert.equal(result.event, null);
});
