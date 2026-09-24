globalThis.FocusUI = (() => {
  const icons = {
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    settings:
      '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>',
    minus: '<path d="M5 12h14"/>',
    play: '<path d="m9 5 11 7-11 7Z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    skip: '<path d="m5 5 10 7-10 7ZM19 5v14"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    reset: '<path d="M4 10a8 8 0 1 1 2 8M4 4v6h6"/>',
    spark:
      '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',
  };
  const icon = (name) =>
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    icons[name] +
    "</svg>";
  const css = `
  :host{all:initial;position:relative;display:block;color-scheme:light;font-family:var(--font,system-ui,sans-serif);font-size:calc(16px * var(--font-scale,1));line-height:1.5;color:var(--ink);-webkit-font-smoothing:antialiased}
  /* Keep typography inside the shadow tree: the page host uses all:initial!important. */
  .panel,.tiny-pet{font-family:var(--font,system-ui,sans-serif);font-size:calc(16px * var(--font-scale,1));line-height:1.5}
  *{box-sizing:border-box}button,input,select{font:inherit}button{cursor:pointer}button:focus-visible,a:focus-visible{outline:3px solid var(--accent);outline-offset:4px}button{border:0}svg{display:block}button:disabled{opacity:.55;cursor:wait}
  .panel{position:relative;width:360px;max-width:100%;padding:22px 22px 18px;background:var(--card);border:1px solid color-mix(in srgb,var(--accent) 18%,transparent);border-radius:25px;color:var(--ink);box-shadow:0 16px 65px #22123921,0 3px 10px #2212390a;text-align:left}
  .drag-handle{display:block;width:72px;height:24px;margin:-14px auto 4px;padding:0;background:transparent;border-radius:12px}.drag-handle:before{content:"";display:block;width:46px;height:5px;margin:auto;background:var(--muted);opacity:.5;border-radius:8px}.drag-handle:hover:before{background:var(--accent);opacity:1}
  .brand{display:flex;align-items:center;gap:8px;font-size:calc(17px * var(--font-scale,1));font-weight:750;letter-spacing:-.35px}.brand svg{color:var(--accent)}.head{display:flex;align-items:center;justify-content:space-between}.tools{display:flex;gap:3px}.icon-button{display:grid;place-items:center;background:none;color:var(--muted);width:36px;height:36px;border-radius:8px}.icon-button:hover{background:var(--soft);color:var(--ink)}
  .pet-edge{position:absolute;top:-88px;right:20px;width:108px;height:108px;z-index:2;pointer-events:none}.pet-edge svg{width:100%;height:100%;animation:hop 4.4s ease-in-out infinite;transform-origin:50% 100%}@keyframes hop{0%,45%,65%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-10px) rotate(-5deg)}56%{transform:translateY(0) scale(1.07,.94)}60%{transform:translateY(-4px) rotate(3deg)}}
  .kicker{text-align:center;margin:23px 0 0;font-size:calc(14px * var(--font-scale,1));font-weight:750;text-transform:uppercase;letter-spacing:1.1px;color:var(--muted)}.dial{position:relative;width:calc(190px * var(--font-scale,1));height:calc(190px * var(--font-scale,1));margin:11px auto 10px;display:grid;place-items:center}.dial>svg{position:absolute;inset:0;transform:rotate(-90deg);width:100%;height:100%}.track{stroke:var(--soft)}.progress{stroke:var(--accent);stroke-linecap:round;transition:none}.dial-content{text-align:center}.time{font-size:calc(50px * var(--font-scale,1));line-height:1.15;letter-spacing:-2px;font-weight:500;font-variant-numeric:tabular-nums}.dial-label{max-width:155px;line-height:1.35;font-size:calc(14px * var(--font-scale,1));color:var(--muted);margin-top:5px}.message{text-align:center;font-size:calc(16px * var(--font-scale,1));color:var(--muted);margin:5px 0 18px;line-height:1.6;min-height:38px}.message strong{font-weight:650;color:var(--ink)}
  .actions{display:flex;gap:8px}.primary,.secondary{border-radius:12px;min-height:46px;padding:9px 12px;line-height:1.4;display:flex;align-items:center;justify-content:center;gap:7px;font-size:calc(16px * var(--font-scale,1));font-weight:650}.primary{background:var(--accent);color:white;flex:1}.primary:hover{background:var(--dark)}.secondary{background:var(--soft);color:var(--dark);padding:0 13px}.secondary:hover{filter:brightness(.96)}
  .foot{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:17px;padding-top:13px;border-top:1px solid var(--soft);font-size:calc(14px * var(--font-scale,1));color:var(--muted)}.status-dot{width:5px;height:5px;background:var(--accent);display:inline-block;margin-right:5px;border-radius:50%}.error{color:#a52c39;font-size:calc(14px * var(--font-scale,1));padding-top:8px}.tiny-pet{border:0;background:var(--card);border-radius:24px;padding:2px;width:108px;height:118px;box-shadow:0 5px 25px #24133922;touch-action:none;cursor:grab;color:var(--ink);display:flex;flex-direction:column;align-items:center;user-select:none}.tiny-pet:active{cursor:grabbing}.tiny-pet svg{width:88px;height:88px;pointer-events:none;animation:hop 4.4s infinite}.mini-time{font-size:calc(14px * var(--font-scale,1));font-weight:750;line-height:22px;font-variant-numeric:tabular-nums}.due-pet{outline:3px solid var(--accent);outline-offset:3px}.no-motion *{animation:none!important;transition:none!important}
  @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
  `;
  async function send(m) {
    const r = await chrome.runtime.sendMessage(m);
    if (r?.error) throw new Error(r.error);
    return r;
  }
  const format = (ms) => {
    const n = Math.max(0, Math.ceil(ms / 1000));
    return (
      String(Math.floor(n / 60)).padStart(2, "0") +
      ":" +
      String(n % 60).padStart(2, "0")
    );
  };
  function mount(root, { floating = false, preview = false } = {}) {
    let actionBusy = false;
    let data,
      petId = "",
      lastDue = 0,
      lastNotify = 0,
      frame,
      onChange = () => {};
    root.innerHTML =
      "<style>" +
      css +
      '</style><div class="pet-edge"></div><section class="panel" aria-label="Peeko eye-break timer">' +
      (floating
        ? '<button class="drag-handle" type="button" aria-label="Move Peeko widget. Drag or use arrow keys." title="Drag to move · Arrow keys to reposition"></button>'
        : "") +
      '<header class="head"><div class="brand">' +
      icon("eye") +
      'Peeko</div><div class="tools"><button class="icon-button" data-op="options" title="Customize your familiar" aria-label="Open settings">' +
      icon("settings") +
      "</button>" +
      (floating
        ? '<button class="icon-button" data-op="collapse" title="Collapse panel" aria-label="Collapse panel">' +
          icon("minus") +
          '</button><button class="icon-button" data-op="hide" title="Hide widget on all websites. Show it again from the Peeko toolbar popup." aria-label="Hide widget on all websites">' +
          icon("close") +
          "</button>"
        : "") +
      '</div></header><div class="kicker">YOUR NEXT EYE BREAK</div><div class="dial"><svg viewBox="0 0 180 180" aria-hidden="true"><circle class="track" cx="90" cy="90" r="80" fill="none" stroke-width="4"/><circle class="progress" cx="90" cy="90" r="80" fill="none" stroke-width="4" stroke-dasharray="502.655"/></svg><div class="dial-content"><div class="time" role="timer">20:00</div><div class="dial-label">break starts automatically</div></div></div><p class="message"></p><div class="actions"><button class="primary" data-op="main"></button><button class="secondary" data-op="skip" title="Skip and start a fresh interval">' +
      icon("skip") +
      'Skip</button></div><footer class="foot"><span class="theme-label"></span><span class="completed"></span></footer><div class="error" role="status"></div></section>';
    const $ = (s) => root.querySelector(s);
    if (preview) {
      const grip = $(".drag-handle");
      grip.tabIndex = -1;
      grip.title = "Drag widgets by this handle on websites";
      grip.setAttribute("aria-label", "Website drag handle preview");
      $('[data-op="collapse"]').title = "Collapse widgets on websites";
      $('[data-op="hide"]').title =
        "Hide widgets on websites. This settings preview stays visible.";
    }
    root.addEventListener("click", async (e) => {
      const op = e.target.closest("button")?.dataset.op;
      if (!op) return;
      const timerAction = op === "main" || op === "skip";
      if (timerAction && (!data || actionBusy)) return;
      if (timerAction) {
        actionBusy = true;
        $(".primary").disabled = $(".secondary").disabled = true;
      }
      $(".error").textContent = "";
      try {
        if (op === "options") await send({ type: "options" });
        else if (op === "hide")
          update(await send({ type: "save", patch: { showWidget: false } }));
        else if (op === "collapse")
          update(await send({ type: "save", patch: { collapsed: true } }));
        else
          update(
            await send({
              type: "action",
              action:
                op === "main"
                  ? data.timer.phase === "due"
                    ? "start"
                    : "pause"
                  : op,
            }),
          );
      } catch (err) {
        $(".error").textContent = err.message;
      } finally {
        if (timerAction) {
          actionBusy = false;
          $(".primary").disabled = $(".secondary").disabled = false;
        }
      }
    });
    function paint(force = false) {
      if (!data) return;
      const t = data.timer,
        s = data.settings;
      const remaining = t.paused
        ? t.remaining
        : t.deadline
          ? Math.max(0, t.deadline - Date.now())
          : 0;
      const label =
        t.phase === "due" ? format(s.seconds * 1000) : format(remaining);
      if ($(".time").textContent !== label) $(".time").textContent = label;
      $(".progress").style.strokeDashoffset = String(
        502.655 *
          (1 -
            (t.phase === "due"
              ? 1
              : Math.max(0, Math.min(1, remaining / t.total)))),
      );
      if (
        t.deadline &&
        !t.paused &&
        remaining === 0 &&
        Date.now() - lastDue > 1500
      ) {
        lastDue = Date.now();
        send({ type: "tick" })
          .then(update)
          .catch(() => {});
      }
      if (force || Date.now() - lastNotify >= 250) {
        lastNotify = Date.now();
        onChange(data, remaining);
      }
    }
    function update(next) {
      if (!next?.timer) return;
      data = next;
      const { timer: t, settings: s } = data;
      const theme = FocusThemes.apply(root.host || root, s.theme);
      FocusFonts.apply(root.host || root, s);
      $(".pet-edge").style.display = s.showPet ? "block" : "none";
      $(".panel").classList.toggle("no-motion", !s.motion);
      $(".pet-edge").classList.toggle("no-motion", !s.motion);
      if (petId !== s.theme) {
        $(".pet-edge").innerHTML = FocusThemes.pet(s.theme);
        petId = s.theme;
      }
      $(".kicker").textContent = t.paused
        ? "A MOMENT ON PAUSE"
        : t.phase === "due"
          ? "TIME TO LOOK AWAY"
          : t.phase === "break"
            ? "LET YOUR EYES WANDER"
            : "YOUR NEXT EYE BREAK";
      $(".dial-label").textContent = t.paused
        ? "ready when you are"
        : t.phase === "due"
          ? "seconds of a wider view"
          : t.phase === "break"
            ? "look 20 feet away"
            : "break starts automatically";
      $(".message").innerHTML =
        t.phase === "due"
          ? "<strong>Your little reset is ready.</strong><br>Find something at least 20 feet away."
          : t.phase === "break"
            ? "<strong>Let your gaze rest in the distance.</strong><br>Your next focus interval starts automatically."
            : "<strong>" +
              theme.label +
              ".</strong><br>" +
              s.minutes +
              " min of focus · " +
              s.seconds +
              " sec of distance";
      $(".primary").innerHTML =
        icon(t.phase === "due" || t.paused ? "play" : "pause") +
        (t.phase === "due"
          ? "Start my break"
          : t.paused
            ? "Resume timer"
            : t.phase === "break"
              ? "Pause break"
              : "Pause timer");
      $(".theme-label").innerHTML =
        '<i class="status-dot"></i>' + theme.pet + " is with you";
      $(".completed").textContent =
        t.completed + " break" + (t.completed === 1 ? "" : "s") + " today";
      paint(true);
    }
    // Ring and digits use the same deadline on each frame, without a trailing CSS tween.
    function animate() {
      paint();
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    const listener = (changes, area) => {
      if (area !== "local" || !data) return;
      if (changes.settings || changes.timer)
        update({
          settings: changes.settings?.newValue || data.settings,
          timer: changes.timer?.newValue || data.timer,
        });
    };
    chrome.storage.onChanged.addListener(listener);
    send({ type: "get" })
      .then(update)
      .catch((err) => ($(".error").textContent = err.message));
    return {
      update,
      onChange(fn) {
        onChange = fn;
      },
      get data() {
        return data;
      },
      destroy() {
        cancelAnimationFrame(frame);
        chrome.storage.onChanged.removeListener(listener);
      },
    };
  }
  return { icon, css, send, format, mount };
})();
