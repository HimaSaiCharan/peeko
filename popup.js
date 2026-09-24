const app = FocusUI.mount(
  document.querySelector("#app").attachShadow({ mode: "open" }),
);
const visibility = document.querySelector("#showWidget"),
  error = document.querySelector("#visibility-error");
let saving = false;
app.onChange((data) => {
  FocusThemes.apply(document.body, data.settings.theme);
  FocusFonts.apply(document.body, data.settings);
  document.body.style.background = "var(--bg)";
  document.body.style.paddingTop = data.settings.showPet ? "94px" : "14px";
  visibility.checked = data.settings.showWidget;
  visibility.disabled = saving;
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
// Reuse the actual panel, dial, typography, and icon buttons. Only secondary
// explanatory copy is omitted to fit Chrome's toolbar popup.
const layout = document.createElement("style");
layout.textContent =
  ".panel .message,.panel .foot{display:none}.panel .actions{position:sticky;bottom:0;background:var(--card);z-index:1}";
document.querySelector("#app").shadowRoot.append(layout);
