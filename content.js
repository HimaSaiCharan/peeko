(() => {
  // Keep the original host ID so updating in the same folder preserves identity.
  if (document.getElementById("focus-familiar-extension")) return;
  const host = document.createElement("div");
  host.id = "focus-familiar-extension";
  host.style.cssText =
    "all:initial!important;position:fixed!important;z-index:2147483647!important;display:none!important;width:360px!important;max-width:calc(100vw - 24px)!important;";
  document.documentElement.append(host);
  const root = host.attachShadow({ mode: "open" }),
    ui = FocusUI.mount(root, { floating: true });
  const style = document.createElement("style");
  style.textContent = `
    .panel{max-width:100%;max-height:calc(100vh - 128px);overflow-y:auto;overscroll-behavior:contain}
    .pet-edge{z-index:1}.drag-handle{cursor:grab;touch-action:none;user-select:none}.drag-handle:active{cursor:grabbing}
    .compact{width:190px;max-width:100%;height:48px;flex-direction:row;justify-content:space-around;gap:8px;padding:10px 12px;border-radius:16px}
    .compact .bar-name{font-size:calc(14px * var(--font-scale,1));font-weight:700}.compact svg{width:18px;height:18px;animation:none;flex-shrink:0}
    @media(max-height:650px){.dial{height:130px;width:130px}.time{font-size:calc(30px * var(--font-scale,1))}.dial-label{max-width:115px;font-size:14px}.kicker{margin-top:10px}.message{margin-bottom:10px}.panel{padding:15px}.foot{margin-top:10px;padding-top:8px}}
  `;
  root.append(style);
  const panel = root.querySelector(".panel"),
    edge = root.querySelector(".pet-edge"),
    grip = root.querySelector(".drag-handle");
  const pet = document.createElement("button");
  pet.className = "tiny-pet";
  pet.style.display = "none";
  root.append(pet);
  let data,
    appearance = "",
    drag = null,
    suppressClick = false,
    lastSettings;
  const P = PeekoPosition;
  function bounds() {
    const s = data.settings,
      r = host.getBoundingClientRect();
    return P.bounds(
      innerWidth,
      innerHeight,
      r.width,
      r.height,
      !s.collapsed && s.showPet ? 92 : 0,
    );
  }
  function place(left, top) {
    host.style.setProperty("left", left + "px", "important");
    host.style.setProperty("top", top + "px", "important");
  }
  function position() {
    if (!data || drag || !data.settings.showWidget) return;
    const s = data.settings;
    host.style.setProperty(
      "width",
      s.collapsed ? (s.showPet ? "108px" : "190px") : "360px",
      "important",
    );
    const b = bounds();
    let x, y;
    if (s.collapsed) {
      x = s.petX;
      y = s.petY;
    } else {
      x = s.panelX ?? (s.corner.endsWith("right") ? 1 : 0);
      y = s.panelY ?? (s.corner.startsWith("bottom") ? 1 : 0);
    }
    if (s.snapToCorner) ({ x, y } = P.corner(x, y));
    const p = P.point(x, y, b);
    place(p.left, p.top);
  }
  ui.onChange((next, remaining) => {
    // A change from another tab can replace the thing currently being dragged.
    // Release its capture without saving coordinates measured for the old shape.
    if (
      drag &&
      data &&
      (data.settings.collapsed !== next.settings.collapsed ||
        data.settings.showPet !== next.settings.showPet ||
        !next.settings.showWidget)
    ) {
      const ended = drag;
      drag = null;
      suppressClick = ended.moved;
      if (ended.target.hasPointerCapture(ended.id))
        ended.target.releasePointerCapture(ended.id);
    }
    const changedMode =
      data && data.settings.collapsed !== next.settings.collapsed;
    const focused = root.activeElement;
    const transferFocus =
      changedMode &&
      focused &&
      (next.settings.collapsed ? panel.contains(focused) : focused === pet);
    data = next;
    const s = data.settings;
    host.style.setProperty(
      "display",
      s.showWidget ? "block" : "none",
      "important",
    );
    panel.style.display = s.collapsed ? "none" : "block";
    edge.style.display = !s.collapsed && s.showPet ? "block" : "none";
    panel.style.maxHeight = `calc(100vh - ${s.showPet ? 128 : 24}px)`;
    pet.style.display = s.collapsed ? "flex" : "none";
    pet.classList.toggle("compact", !s.showPet);
    const key = s.theme + ":" + s.showPet;
    if (appearance !== key) {
      pet.innerHTML =
        (s.showPet
          ? FocusThemes.pet(s.theme)
          : '<span class="bar-name">Peeko</span>') +
        '<span class="mini-time"></span>' +
        (s.showPet ? "" : FocusUI.icon("arrow"));
      pet.setAttribute(
        "aria-label",
        "Expand Peeko timer. Drag to move, or use arrow keys.",
      );
      pet.title = "Click to expand · Drag to move · Arrow keys to reposition";
      appearance = key;
    }
    pet.classList.toggle("due-pet", next.timer.phase === "break");
    pet.classList.toggle("no-motion", !s.motion);
    const text = next.timer.paused ? "Paused" : FocusUI.format(remaining);
    if (pet.querySelector(".mini-time").textContent !== text)
      pet.querySelector(".mini-time").textContent = text;
    if (lastSettings !== s) {
      lastSettings = s;
      position();
    }
    if (transferFocus && s.showWidget)
      (s.collapsed ? pet : grip).focus({ preventScroll: true });
  });
  async function persist(patch) {
    ui.update({ ...data, settings: { ...data.settings, ...patch } });
    try {
      ui.update(await FocusUI.send({ type: "save", patch }));
    } catch (error) {
      panel.querySelector(".error").textContent = error.message;
    }
  }
  function patchFor(left, top, collapsed) {
    let { x, y } = P.normalized(left, top, bounds());
    if (data.settings.snapToCorner) ({ x, y } = P.corner(x, y));
    return collapsed
      ? { petX: x, petY: y }
      : { panelX: x, panelY: y, corner: P.corner(x, y).name };
  }
  function begin(e) {
    if (!data || !data.settings.showWidget || e.button !== 0 || drag) return;
    suppressClick = false;
    const r = host.getBoundingClientRect();
    drag = {
      id: e.pointerId,
      target: e.currentTarget,
      x: e.clientX,
      y: e.clientY,
      left: r.left,
      top: r.top,
      moved: false,
      collapsed: data.settings.collapsed,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x,
      dy = e.clientY - drag.y;
    if (Math.hypot(dx, dy) > 5) drag.moved = true;
    if (!drag.moved) return;
    const b = bounds(),
      { x, y } = P.normalized(drag.left + dx, drag.top + dy, b),
      p = P.point(x, y, b);
    place(p.left, p.top);
  }
  function end(e) {
    if (!drag || (e?.pointerId !== undefined && e.pointerId !== drag.id))
      return;
    const ended = drag;
    drag = null;
    if (ended.target.hasPointerCapture(ended.id))
      ended.target.releasePointerCapture(ended.id);
    if (ended.moved) {
      suppressClick = true;
      const r = host.getBoundingClientRect();
      void persist(patchFor(r.left, r.top, ended.collapsed));
    }
  }
  for (const handle of [grip, pet]) {
    handle.addEventListener("pointerdown", begin);
    handle.addEventListener("pointermove", move);
    for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
      handle.addEventListener(event, end);
  }
  pet.addEventListener("click", (e) => {
    if (suppressClick && e.detail !== 0) {
      suppressClick = false;
      return;
    }
    void persist({ collapsed: false, panelX: null, panelY: null });
  });
  async function keyboard(e) {
    const deltas = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    if (!deltas[e.key] || !data || drag) return;
    e.preventDefault();
    const r = host.getBoundingClientRect(),
      b = bounds();
    let { x, y } = P.normalized(r.left, r.top, b);
    const [dx, dy] = deltas[e.key],
      step = e.shiftKey ? 0.1 : 0.025;
    if (data.settings.snapToCorner) {
      if (dx) x = dx < 0 ? 0 : 1;
      if (dy) y = dy < 0 ? 0 : 1;
    } else {
      x += dx * step;
      y += dy * step;
    }
    const p = P.point(x, y, b);
    await persist(patchFor(p.left, p.top, data.settings.collapsed));
  }
  pet.addEventListener("keydown", keyboard);
  grip.addEventListener("keydown", keyboard);
  addEventListener("blur", () => end());
  addEventListener("resize", () => {
    end();
    position();
  });
  const observer = new ResizeObserver(position);
  observer.observe(host);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) end();
    else
      FocusUI.send({ type: "tick" })
        .then(ui.update)
        .catch(() => {});
  });
})();
