const app=FocusUI.mount(document.querySelector('#app').attachShadow({mode:'open'}));
app.onChange(data=>{const theme=FocusThemes.themes.find(t=>t.id===data.settings.theme);document.body.style.background=theme.bg;FocusFonts.apply(document.body,data.settings);});

const sizing=document.createElement("style");sizing.textContent=".panel{max-height:440px;overflow-y:auto;overscroll-behavior:contain}";document.querySelector("#app").shadowRoot.append(sizing);
