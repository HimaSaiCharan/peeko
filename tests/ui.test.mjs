import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { settings, fresh, transition } from "../core.mjs";
const source = (name) =>
  readFileSync(new URL("../" + name, import.meta.url), "utf8");
function element() {
  const children = new Map(),
    events = {},
    props = {};
  return {
    style: {
      setProperty(k, v) {
        props[k] = v;
      },
      getPropertyValue(k) {
        return props[k];
      },
    },
    contains(node) {
      return [...children.values()].includes(node);
    },
    focus() {
      this.focused = true;
    },
    textContent: "",
    classList: { toggle() {} },
    setAttribute() {},
    append() {},
    closest() {
      return null;
    },
    querySelector(s) {
      if (!children.has(s)) children.set(s, element());
      return children.get(s);
    },
    addEventListener(k, f) {
      (events[k] ??= []).push(f);
    },
    fire(k, e = {}) {
      for (const f of events[k] || [])
        f({ currentTarget: this, target: this, preventDefault() {}, ...e });
    },
    setPointerCapture(id) {
      this.capture = id;
    },
    hasPointerCapture(id) {
      return this.capture === id;
    },
    releasePointerCapture() {
      this.capture = null;
    },
  };
}

test("ring and digits update together, pause freezes, and skip resets immediately", async () => {
  let now = 100000,
    frame;
  const nodes = element();
  nodes.host = element();
  const s = settings(),
    initial = {
      settings: s,
      timer: {
        ...fresh(s, now),
        phase: "break",
        deadline: now + 20000,
        total: 20000,
      },
    };
  const context = vm.createContext({
    Date: { now: () => now },
    requestAnimationFrame(fn) {
      frame = fn;
      return 1;
    },
    cancelAnimationFrame() {},
    chrome: {
      runtime: {
        async sendMessage() {
          return initial;
        },
      },
      storage: { onChanged: { addListener() {}, removeListener() {} } },
    },
    FocusThemes: {
      apply() {
        return { label: "Hello", pet: "Bolt" };
      },
      pet() {
        return "<svg/>";
      },
    },
    FocusFonts: { apply() {} },
  });
  vm.runInContext(source("ui.js"), context);
  const ui = context.FocusUI.mount(nodes);
  await new Promise(setImmediate);
  now += 5000;
  frame();
  assert.equal(nodes.querySelector(".time").textContent, "00:15");
  assert.equal(
    Number(nodes.querySelector(".progress").style.strokeDashoffset),
    502.655 * 0.25,
  );
  ui.update({
    settings: s,
    timer: { ...initial.timer, paused: true, remaining: 15000, deadline: null },
  });
  now += 7000;
  frame();
  assert.equal(nodes.querySelector(".time").textContent, "00:15");
  assert.equal(
    Number(nodes.querySelector(".progress").style.strokeDashoffset),
    502.655 * 0.25,
  );
  ui.update({ settings: s, timer: fresh(s, now) });
  assert.equal(nodes.querySelector(".time").textContent, "20:00");
  assert.equal(
    Number(nodes.querySelector(".progress").style.strokeDashoffset),
    0,
  );
  ui.destroy();
});

function contentHarness(patch = {}) {
  const host = element(),
    root = element(),
    window = element();
  let pet, onChange;
  host.attachShadow = () => root;
  let data = { settings: settings(patch), timer: fresh(settings(patch)) };
  const saves = [];
  const ui = {
    onChange(fn) {
      onChange = fn;
    },
    update(next) {
      data = next;
      onChange(next, 10000);
    },
  };
  host.getBoundingClientRect = () => ({
    left: parseFloat(host.style.getPropertyValue("left") || 12),
    top: parseFloat(host.style.getPropertyValue("top") || 12),
    width: parseFloat(host.style.getPropertyValue("width") || 360),
    height: data.settings.collapsed ? (data.settings.showPet ? 118 : 48) : 480,
  });
  const context = vm.createContext({
    innerWidth: 1000,
    innerHeight: 800,
    document: {
      getElementById() {
        return null;
      },
      documentElement: { append() {} },
      createElement(tag) {
        if (tag === "div") return host;
        if (tag === "button") {
          pet = element();
          return pet;
        }
        return element();
      },
      addEventListener() {},
    },
    addEventListener: window.addEventListener.bind(window),
    ResizeObserver: class {
      observe() {}
    },
    FocusThemes: {
      pet() {
        return "<svg/>";
      },
    },
    FocusUI: {
      mount() {
        return ui;
      },
      icon() {
        return "<svg/>";
      },
      format() {
        return "00:10";
      },
      async send(message) {
        saves.push(message.patch);
        data = { ...data, settings: { ...data.settings, ...message.patch } };
        return data;
      },
    },
  });
  vm.runInContext(source("positioning.js"), context);
  vm.runInContext(source("content.js"), context);
  ui.update(data);
  return {
    host,
    root,
    pet,
    window,
    saves,
    setSettings(patch) {
      ui.update({ ...data, settings: { ...data.settings, ...patch } });
    },
    get data() {
      return data;
    },
  };
}
const pointer = (el, type, x, y) =>
  el.fire(type, { button: 0, pointerId: 1, clientX: x, clientY: y });

test("collapsed bar stays visible with pet disabled and expands with a click", async () => {
  const h = contentHarness({ collapsed: true, showPet: false });
  assert.equal(h.pet.style.display, "flex");
  assert.match(h.pet.innerHTML, /Peeko/);
  h.pet.fire("click", { detail: 1 });
  await new Promise(setImmediate);
  assert.equal(h.data.settings.collapsed, false);
  assert.equal(h.root.querySelector(".panel").style.display, "block");
});

test("bar stays under pointer until release, then snaps; drag does not expand it", async () => {
  const h = contentHarness({
    collapsed: true,
    showPet: false,
    petX: 0,
    petY: 0,
  });
  pointer(h.pet, "pointerdown", 20, 20);
  pointer(h.pet, "pointermove", 320, 220);
  assert.equal(h.host.getBoundingClientRect().left, 312);
  assert.equal(h.saves.length, 0);
  pointer(h.pet, "pointerup", 320, 220);
  h.pet.fire("click", { detail: 1 });
  await new Promise(setImmediate);
  assert.equal(h.host.getBoundingClientRect().left, 12);
  assert.equal(h.data.settings.collapsed, true);
  assert.equal(h.saves.length, 1);
});

test("expanded panel remains freely positioned when snapping is disabled", async () => {
  const h = contentHarness({
      collapsed: false,
      showPet: false,
      snapToCorner: false,
      corner: "top-left",
    }),
    head = h.root.querySelector(".drag-handle");
  pointer(head, "pointerdown", 20, 20);
  pointer(head, "pointermove", 220, 170);
  pointer(head, "pointerup", 220, 170);
  await new Promise(setImmediate);
  assert.equal(h.host.getBoundingClientRect().left, 212);
  assert.equal(h.host.getBoundingClientRect().top, 162);
  assert.ok(h.data.settings.panelX > 0 && h.data.settings.panelX < 1);
});

test("losing window focus safely finishes a drag and snaps the panel", async () => {
  const h = contentHarness({ showPet: false, corner: "top-left" }),
    head = h.root.querySelector(".drag-handle");
  pointer(head, "pointerdown", 20, 20);
  pointer(head, "pointermove", 600, 250);
  h.window.fire("blur");
  await new Promise(setImmediate);
  assert.equal(h.data.settings.corner, "bottom-right");
  assert.equal(h.host.getBoundingClientRect().left, 628);
  assert.equal(h.host.getBoundingClientRect().top, 308);
  assert.equal(head.capture, null);
});

test("switching pet visibility during a drag releases capture without saving stale coordinates", () => {
  const h = contentHarness({
    collapsed: true,
    showPet: true,
    petX: 0,
    petY: 0,
  });
  pointer(h.pet, "pointerdown", 20, 20);
  pointer(h.pet, "pointermove", 320, 220);
  h.setSettings({ showPet: false });
  assert.equal(h.pet.capture, null);
  assert.equal(h.saves.length, 0);
  assert.equal(h.host.getBoundingClientRect().left, 12);
  assert.match(h.pet.innerHTML, /Peeko/);
  pointer(h.pet, "pointerup", 320, 220);
  h.pet.fire("click", { detail: 1 });
  assert.equal(h.data.settings.collapsed, true);
  assert.equal(h.saves.length, 0);
});

test("switching collapsed mode in another tab cancels the old panel drag", () => {
  const h = contentHarness({ showPet: false, corner: "top-left" }),
    head = h.root.querySelector(".drag-handle");
  pointer(head, "pointerdown", 20, 20);
  pointer(head, "pointermove", 320, 220);
  h.setSettings({ collapsed: true });
  pointer(head, "pointerup", 320, 220);
  assert.equal(head.capture, null);
  assert.equal(h.data.settings.collapsed, true);
  assert.equal(h.saves.length, 0);
});

test("keyboard focus follows collapse and expansion without stealing focus from a webpage", async () => {
  const h = contentHarness({ showPet: false });
  const panel = h.root.querySelector(".panel"),
    brand = h.root.querySelector(".drag-handle");
  h.root.activeElement = panel.querySelector('[data-op="collapse"]');
  h.setSettings({ collapsed: true });
  assert.equal(h.pet.focused, true);
  h.root.activeElement = h.pet;
  h.pet.fire("click", { detail: 0 });
  await new Promise(setImmediate);
  assert.equal(brand.focused, true);
  assert.equal(h.data.settings.collapsed, false);
  const other = contentHarness({ showPet: false });
  other.root.activeElement = null;
  other.setSettings({ collapsed: true });
  assert.equal(other.pet.focused, undefined);
});

test("pointer cancellation ends one drag and the next click can still expand", async () => {
  const h = contentHarness({
    collapsed: true,
    showPet: false,
    petX: 0,
    petY: 0,
  });
  pointer(h.pet, "pointerdown", 20, 20);
  pointer(h.pet, "pointermove", 320, 220);
  pointer(h.pet, "pointercancel", 320, 220);
  await new Promise(setImmediate);
  assert.equal(h.pet.capture, null);
  assert.equal(h.saves.length, 1);
  pointer(h.pet, "pointerdown", 20, 20);
  pointer(h.pet, "pointerup", 20, 20);
  h.pet.fire("click", { detail: 1 });
  await new Promise(setImmediate);
  assert.equal(h.data.settings.collapsed, false);
});

test("global visibility hides both panel and collapsed bar, and restores saved placement", () => {
  for (const collapsed of [false, true]) {
    const h = contentHarness({
      collapsed,
      showPet: false,
      snapToCorner: false,
      petX: 0.4,
      petY: 0.3,
      panelX: 0.2,
      panelY: 0.4,
    });
    const before = h.host.getBoundingClientRect();
    h.setSettings({ showWidget: false });
    assert.equal(h.host.style.getPropertyValue("display"), "none");
    h.setSettings({ showWidget: true });
    assert.equal(h.host.style.getPropertyValue("display"), "block");
    assert.equal(h.host.getBoundingClientRect().left, before.left);
    assert.equal(h.host.getBoundingClientRect().top, before.top);
  }
});

test("hiding globally during a drag releases capture and does not overwrite coordinates", () => {
  const h = contentHarness({
    collapsed: true,
    showPet: true,
    petX: 0,
    petY: 0,
  });
  pointer(h.pet, "pointerdown", 20, 20);
  pointer(h.pet, "pointermove", 320, 220);
  h.setSettings({ showWidget: false });
  pointer(h.pet, "pointerup", 320, 220);
  assert.equal(h.pet.capture, null);
  assert.equal(h.saves.length, 0);
  assert.equal(h.host.style.getPropertyValue("display"), "none");
  h.setSettings({ showWidget: true });
  assert.equal(h.host.getBoundingClientRect().left, 12);
});

test("the website close button writes the same global visibility preference", async () => {
  const nodes = element();
  nodes.host = element();
  let data = { settings: settings(), timer: fresh(settings()) };
  const messages = [];
  const context = vm.createContext({
    Date,
    requestAnimationFrame() {
      return 1;
    },
    cancelAnimationFrame() {},
    chrome: {
      runtime: {
        async sendMessage(message) {
          messages.push(message);
          if (message.type === "save")
            data = {
              ...data,
              settings: { ...data.settings, ...message.patch },
            };
          return data;
        },
      },
      storage: { onChanged: { addListener() {}, removeListener() {} } },
    },
    FocusThemes: {
      apply() {
        return { label: "Hello", pet: "Spidey" };
      },
      pet() {
        return "<svg/>";
      },
    },
    FocusFonts: { apply() {} },
  });
  vm.runInContext(source("ui.js"), context);
  const ui = context.FocusUI.mount(nodes, { floating: true });
  await new Promise(setImmediate);
  nodes.fire("click", {
    target: {
      closest() {
        return { dataset: { op: "hide" } };
      },
    },
  });
  await new Promise(setImmediate);
  assert.equal(messages.at(-1).patch.showWidget, false);
  assert.equal(ui.data.settings.showWidget, false);
  ui.destroy();
});

function controlsHarness(script, patch = {}) {
  const doc = element();
  doc.documentElement = element();
  doc.body = element();
  doc.querySelectorAll = () => [];
  doc.createElement = () => element();
  const panel = doc.querySelector(
    script === "popup.js" ? "#app" : "#panel-preview",
  );
  panel.attachShadow = () => (panel.shadowRoot = element());
  for (const key of ["showWidget", "showPet", "motion"]) {
    const node = doc.querySelector("#" + key);
    node.type = "checkbox";
    node.checkValidity = () => true;
  }
  let change,
    data = { settings: settings(patch), timer: fresh(settings(patch)) },
    fail = false;
  const messages = [];
  const app = {
    onChange(fn) {
      change = fn;
    },
    update(next) {
      data = next;
      change(next);
    },
    get data() {
      return data;
    },
  };
  const context = vm.createContext({
    document: doc,
    setTimeout,
    clearTimeout,
    FocusUI: {
      mount() {
        return app;
      },
      icon() {
        return "";
      },
      async send(message) {
        if (fail) throw new Error("Disconnected");
        messages.push(message);
        data =
          message.type === "action"
            ? {
                ...data,
                timer: transition(data.timer, data.settings, message.action),
              }
            : { ...data, settings: { ...data.settings, ...message.patch } };
        return data;
      },
    },
    FocusThemes: { themes: [], apply() {} },
    FocusFonts: { choices: [], apply() {} },
  });
  vm.runInContext(source(script), context);
  app.update(data);
  return {
    doc,
    messages,
    setSettings(patch) {
      app.update({ ...data, settings: { ...data.settings, ...patch } });
    },
    fail() {
      fail = true;
    },
    get data() {
      return data;
    },
  };
}

test("popup visibility switch saves both values, reflects external changes, and recovers from errors", async () => {
  const h = controlsHarness("popup.js"),
    toggle = h.doc.querySelector("#showWidget");
  assert.equal(toggle.checked, true);
  assert.equal(toggle.disabled, false);
  toggle.checked = false;
  toggle.fire("change");
  await new Promise(setImmediate);
  assert.equal(h.data.settings.showWidget, false);
  toggle.checked = true;
  toggle.fire("change");
  await new Promise(setImmediate);
  assert.equal(h.data.settings.showWidget, true);
  h.setSettings({ showWidget: false });
  assert.equal(toggle.checked, false);
  h.fail();
  toggle.checked = true;
  toggle.fire("change");
  await new Promise(setImmediate);
  assert.equal(toggle.checked, false);
  assert.equal(toggle.disabled, false);
  assert.match(
    h.doc.querySelector("#visibility-error").textContent,
    /Could not save/,
  );
});

test("settings visibility stays synchronized and hopping is disabled while the companion is hidden", async () => {
  const h = controlsHarness("settings.js"),
    visible = h.doc.querySelector("#showWidget"),
    companion = h.doc.querySelector("#showPet"),
    motion = h.doc.querySelector("#motion");
  visible.checked = false;
  visible.fire("change");
  await new Promise(setImmediate);
  assert.equal(h.data.settings.showWidget, false);
  h.setSettings({ showWidget: true });
  assert.equal(visible.checked, true);
  companion.checked = false;
  companion.fire("change");
  await new Promise(setImmediate);
  assert.equal(motion.disabled, true);
  assert.equal(motion.checked, false);
  assert.equal(h.data.settings.motion, true);
  companion.checked = true;
  companion.fire("change");
  await new Promise(setImmediate);
  assert.equal(motion.disabled, false);
  assert.equal(motion.checked, true);
  motion.checked = false;
  motion.fire("change");
  await new Promise(setImmediate);
  companion.checked = false;
  companion.fire("change");
  await new Promise(setImmediate);
  companion.checked = true;
  companion.fire("change");
  await new Promise(setImmediate);
  assert.equal(motion.disabled, false);
  assert.equal(motion.checked, false);
});

test("expanded widget only moves from the centered grip, not the header or panel", async () => {
  const h = contentHarness({
    showPet: false,
    snapToCorner: false,
    corner: "top-left",
  });
  for (const selector of [".head", ".brand", ".panel"]) {
    const target = h.root.querySelector(selector);
    pointer(target, "pointerdown", 20, 20);
    pointer(target, "pointermove", 320, 220);
    pointer(target, "pointerup", 320, 220);
    assert.equal(h.host.getBoundingClientRect().left, 12);
    assert.equal(h.saves.length, 0);
  }
  const grip = h.root.querySelector(".drag-handle");
  pointer(grip, "pointerdown", 20, 20);
  pointer(grip, "pointermove", 320, 220);
  pointer(grip, "pointerup", 320, 220);
  await new Promise(setImmediate);
  assert.equal(h.host.getBoundingClientRect().left, 312);
  assert.equal(h.saves.length, 1);
});

test("popup controls pause, start a paused timer, and skip without scrolling", async () => {
  const h = controlsHarness("popup.js"),
    primary = h.doc.querySelector("#toggle-timer"),
    skip = h.doc.querySelector("#skip-timer");
  assert.equal(primary.textContent, "Pause timer");
  assert.equal(primary.disabled, false);
  assert.equal(skip.disabled, false);
  primary.fire("click");
  await new Promise(setImmediate);
  assert.equal(h.data.timer.paused, true);
  assert.equal(primary.textContent, "Start timer");
  const remaining = h.data.timer.remaining;
  primary.fire("click");
  await new Promise(setImmediate);
  assert.equal(h.data.timer.paused, false);
  assert.equal(primary.textContent, "Pause timer");
  assert.ok(h.data.timer.deadline - Date.now() <= remaining);
  skip.fire("click");
  await new Promise(setImmediate);
  assert.equal(h.messages.at(-1).action, "skip");
  assert.equal(h.data.timer.phase, "work");
  assert.equal(h.data.timer.paused, false);
  h.fail();
  primary.fire("click");
  await new Promise(setImmediate);
  assert.match(
    h.doc.querySelector("#timer-error").textContent,
    /Could not update/,
  );
  assert.equal(primary.disabled, false);
  assert.equal(skip.disabled, false);
});
