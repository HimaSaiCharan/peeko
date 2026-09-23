const app = FocusUI.mount(
  document.querySelector("#app").attachShadow({ mode: "open" }),
);
const visibility = document.querySelector("#showWidget"),
  error = document.querySelector("#visibility-error");
const primary = document.querySelector("#toggle-timer"),
  skip = document.querySelector("#skip-timer"),
  timerError = document.querySelector("#timer-error");
let saving = false,
  timerBusy = false;
app.onChange((data) => {
  FocusThemes.apply(document.body, data.settings.theme);
  FocusFonts.apply(document.body, data.settings);
  document.body.style.background = "var(--bg)";
  visibility.checked = data.settings.showWidget;
  visibility.disabled = saving;
  primary.disabled = skip.disabled = timerBusy;
  primary.textContent =
    data.timer.phase === "due"
      ? "Start break"
      : data.timer.paused
        ? "Start timer"
        : data.timer.phase === "break"
          ? "Pause break"
          : "Pause timer";
});
visibility.addEventListener("change", async () => {
  saving = true;
  visibility.disabled = true;
  error.textContent = "";
  try {
    app.update(
      await FocusUI.send({
        type: "save",
        patch: { showWidget: visibility.checked },
      }),
    );
  } catch (err) {
    visibility.checked = app.data?.settings.showWidget ?? true;
    error.textContent = "Could not save. " + err.message;
  } finally {
    saving = false;
    visibility.disabled = false;
  }
});
async function timerAction(action) {
  if (timerBusy || !app.data) return;
  timerBusy = true;
  primary.disabled = skip.disabled = true;
  timerError.textContent = "";
  try {
    app.update(await FocusUI.send({ type: "action", action }));
  } catch (err) {
    timerError.textContent = "Could not update timer. " + err.message;
  } finally {
    timerBusy = false;
    primary.disabled = skip.disabled = false;
  }
}
primary.addEventListener("click", () =>
  timerAction(app.data?.timer.phase === "due" ? "start" : "pause"),
);
skip.addEventListener("click", () => timerAction("skip"));
const sizing = document.createElement("style");
sizing.textContent =
  ".panel{padding:14px 18px}.panel .actions,.message,.foot{display:none}.kicker{margin-top:10px}.dial{width:calc(140px * var(--font-scale,1));height:calc(140px * var(--font-scale,1));margin:8px auto}.time{font-size:calc(36px * var(--font-scale,1));letter-spacing:-1px}.dial-label{max-width:120px;font-size:calc(12px * var(--font-scale,1))}";
document.querySelector("#app").shadowRoot.append(sizing);
