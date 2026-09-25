import { DEFAULTS, settings, fresh, reconcile, transition } from "./core.mjs";
import { applyPresence } from "./presence.mjs";
let queue = Promise.resolve();
let shortTimer;
function serial(fn) {
  const next = queue.then(() => fn());
  queue = next.catch(console.error);
  return next;
}
async function read() {
  const data = await chrome.storage.local.get(["settings", "timer"]);
  const s = settings(data.settings || DEFAULTS);
  return { settings: s, timer: data.timer || fresh(s) };
}
async function audio(s, finished = false) {
  if (s.sound === "silent" || s.volume === 0) return;
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
  });
  if (!contexts.length)
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Play the user-selected eye-break reminder sound.",
    });
  const result = await chrome.runtime.sendMessage({
    target: "audio",
    sound: s.sound,
    volume: s.volume,
    finished,
  });
  if (!result?.ok) throw new Error(result?.error || "Sound could not play");
}
async function effects(event, s) {
  if (!event) return;
  try {
    await audio(s, event === "finished");
  } catch (error) {
    console.warn("Reminder sound:", error);
  }
}
async function schedule(t) {
  clearTimeout(shortTimer);
  await chrome.alarms.clear("focus-deadline");
  if (t.deadline && !t.paused) {
    await chrome.alarms.create("focus-deadline", { when: t.deadline });
    // Foreground pages also reconcile the persisted deadline. Alarms are a
    // recovery path when Chrome suspends the worker or throttles background tabs.
    if (t.deadline - Date.now() <= 30000)
      shortTimer = setTimeout(
        () => serial(tick),
        Math.max(0, t.deadline - Date.now()),
      );
  }
  await chrome.action.setBadgeText({
    text: t.paused
      ? "Ⅱ"
      : t.phase === "due"
        ? "!"
        : t.phase === "break"
          ? "REST"
          : "",
  });
  await chrome.action.setBadgeBackgroundColor({ color: "#7654b2" });
}
async function tick(presenceState) {
  const data = await read();
  const { timerCheckedAt } = await chrome.storage.local.get(["timerCheckedAt"]);
  const state = presenceState ?? (await chrome.idle.queryState(60));
  const now = Date.now();
  const present = applyPresence(
    data.timer,
    state,
    data.settings,
    now,
    timerCheckedAt,
  );
  const result = reconcile(present, data.settings, now);
  const changed = JSON.stringify(result.timer) !== JSON.stringify(data.timer);
  // Save the checkpoint with any transition so queued tabs cannot repeat a reset.
  await chrome.storage.local.set({
    timerCheckedAt: now,
    ...(changed ? { timer: result.timer } : {}),
  });
  if (changed) await schedule(result.timer);
  await effects(result.event, data.settings);
  return { ...data, timer: result.timer };
}
async function init(restart = false) {
  const data = await read();
  // A new browser session starts a fresh work interval; an intentional pause remains paused.
  if (restart && !data.timer.paused) {
    data.timer = {
      ...fresh(data.settings),
      completed: data.timer.completed,
      day: data.timer.day,
    };
  }
  // A new installation/update or browser session establishes a new baseline.
  await chrome.storage.local.set({ ...data, timerCheckedAt: Date.now() });
  await chrome.alarms.create("focus-recover", { periodInMinutes: 0.5 });
  await tick();
  await schedule((await read()).timer);
}
chrome.runtime.onInstalled.addListener(() => serial(() => init()));
chrome.runtime.onStartup.addListener(() => serial(() => init(true)));
chrome.alarms.onAlarm.addListener(() => serial(tick));
// Capture the event's state even if queryState has already changed again.
chrome.idle.onStateChanged.addListener((state) => serial(() => tick(state)));
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message.target === "audio") return;
  serial(async () => {
    if (message.type === "get" || message.type === "tick") return tick();
    if (message.type === "options") {
      await chrome.runtime.openOptionsPage();
      return { ok: true };
    }
    const data = await tick();
    if (message.type === "save") {
      const next = settings({ ...data.settings, ...message.patch });
      if (
        next.minutes !== data.settings.minutes &&
        data.timer.phase === "work"
      ) {
        const { paused, systemPaused = false } = data.timer;
        data.timer = {
          ...fresh(next),
          completed: data.timer.completed,
          day: data.timer.day,
          paused,
          systemPaused,
          deadline: paused ? null : Date.now() + next.minutes * 60000,
        };
      }
      data.settings = next;
    } else if (message.type === "action") {
      if (data.timer.systemPaused)
        throw new Error("Unlock your screen to use the timer controls.");
      data.timer = transition(data.timer, data.settings, message.action);
    } else if (message.type === "sound") {
      await audio(settings({ ...data.settings, ...message.patch }));
      return { ok: true };
    } else throw new Error("Unknown request");
    await chrome.storage.local.set(data);
    await schedule(data.timer);
    if (message.type === "action" && message.action === "preview")
      await effects("due", data.settings);
    return data;
  }).then(respond, (error) => respond({ error: error.message }));
  return true;
});
