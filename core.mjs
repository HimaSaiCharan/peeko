export const DEFAULTS = Object.freeze({
  minutes: 20,
  seconds: 20,
  theme: "amethyst",
  corner: "top-right",
  showWidget: true,
  collapsed: false,
  showPet: true,
  petX: 1,
  petY: 1,
  snapToCorner: true,
  panelX: null,
  panelY: null,
  sound: "buzzer",
  volume: 45,
  motion: true,
  font: "roboto",
  textSize: "comfortable",
});
export const themeIds = [
  "potter",
  "thrones",
  "spider",
  "batman",
  "nightfury",
  "iron",
  "captain",
  "panther",
  "amethyst",
  "emerald",
  "sapphire",
];
export const dayKey = (now) => new Date(now).toLocaleDateString("en-CA");
export function settings(input = {}) {
  const out = { ...DEFAULTS };
  for (const k of [
    "minutes",
    "seconds",
    "volume",
    "petX",
    "petY",
    "panelX",
    "panelY",
  ]) {
    const [min, max] = {
      minutes: [1, 180],
      seconds: [5, 300],
      volume: [0, 100],
      petX: [0, 1],
      petY: [0, 1],
      panelX: [0, 1],
      panelY: [0, 1],
    }[k];
    if (typeof input[k] === "number" && Number.isFinite(input[k]))
      out[k] = Math.min(max, Math.max(min, input[k]));
  }
  out.minutes = Math.round(out.minutes);
  out.seconds = Math.round(out.seconds);
  for (const k of [
    "showWidget",
    "collapsed",
    "showPet",
    "motion",
    "snapToCorner",
  ])
    if (typeof input[k] === "boolean") out[k] = input[k];
  for (const [k, values] of Object.entries({
    theme: themeIds,
    corner: ["top-left", "top-right", "bottom-left", "bottom-right"],
    sound: ["buzzer", "chime", "bell", "ping", "double", "warm", "silent"],
    font: [
      "roboto",
      "sans",
      "arial",
      "verdana",
      "trebuchet",
      "georgia",
      "times",
      "mono",
    ],
    textSize: ["comfortable", "large", "extra"],
  })) {
    if (values.includes(input[k])) out[k] = input[k];
  }
  return out;
}
export function fresh(s, now = Date.now()) {
  return {
    phase: "work",
    paused: false,
    deadline: now + s.minutes * 60000,
    remaining: s.minutes * 60000,
    total: s.minutes * 60000,
    completed: 0,
    day: dayKey(now),
  };
}
export function reconcile(t, s, now = Date.now()) {
  let out = { ...t };
  let event = null;
  if (out.day !== dayKey(now)) {
    out.day = dayKey(now);
    out.completed = 0;
  }
  // Upgrade an older version's waiting prompt into an automatic break.
  if (out.phase === "due" && !out.paused) {
    out = startBreak(out, s, now);
    event = "due";
  } else if (!out.paused && out.deadline && now >= out.deadline) {
    if (out.phase === "work") {
      out = startBreak(out, s, now);
      event = "due";
    } else if (out.phase === "break") {
      out = { ...fresh(s, now), completed: out.completed + 1 };
      event = "finished";
    }
  }
  return { timer: out, event };
}
export function startBreak(t, s, now = Date.now()) {
  return {
    ...t,
    phase: "break",
    paused: false,
    deadline: now + s.seconds * 1000,
    remaining: s.seconds * 1000,
    total: s.seconds * 1000,
  };
}
export function transition(t, s, action, now = Date.now()) {
  let out = { ...t };
  if (action === "start" && out.phase === "due") out = startBreak(out, s, now);
  if (action === "skip" || action === "reset")
    out = { ...fresh(s, now), completed: out.completed, day: out.day };
  if (action === "pause" && out.phase !== "due") {
    if (out.paused)
      out = { ...out, paused: false, deadline: now + out.remaining };
    else
      out = {
        ...out,
        paused: true,
        remaining: Math.max(0, out.deadline - now),
        deadline: null,
      };
  }
  if (action === "preview") out = startBreak(out, s, now);
  return out;
}
