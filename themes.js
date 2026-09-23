globalThis.FocusThemes = (() => {
  const themes = [
    {
      id: "amethyst",
      name: "Royal Amethyst",
      label: "A little everyday magic",
      pet: "Luna",
      kind: "cat",
      bg: "#f7f3fc",
      card: "#fffcff",
      ink: "#322540",
      muted: "#796d88",
      accent: "#8055b4",
      soft: "#eadef6",
      dark: "#4e326f",
      body: "#a487cb",
      detail: "#e9dbff",
    },
    {
      id: "potter",
      name: "Harry Potter",
      label: "Your next chapter can wait",
      pet: "Hoot",
      kind: "owl",
      bg: "#faf4e6",
      card: "#fffaf0",
      ink: "#493725",
      muted: "#897359",
      accent: "#945139",
      soft: "#f0dfbc",
      dark: "#633923",
      body: "#e4d4ae",
      detail: "#a44538",
    },
    {
      id: "thrones",
      name: "Game of Thrones",
      label: "Even dragons need a moment",
      pet: "Ember",
      kind: "dragon",
      bg: "#ecf3f2",
      card: "#f8fcfb",
      ink: "#203e3d",
      muted: "#64827f",
      accent: "#377f77",
      soft: "#cee3dc",
      dark: "#22564f",
      body: "#6ba096",
      detail: "#e6bc70",
    },
    {
      id: "spider",
      name: "Spider-Man",
      label: "With great focus comes a break",
      pet: "Spidey",
      kind: "spider",
      bg: "#fff1ee",
      card: "#fffaf9",
      ink: "#472c34",
      muted: "#8e6972",
      accent: "#c55151",
      soft: "#f7d9d4",
      dark: "#903944",
      body: "#df6767",
      detail: "#5179a7",
    },
    {
      id: "batman",
      name: "Batman",
      label: "A quiet moment for the knight",
      pet: "Bats",
      kind: "bat",
      bg: "#f1f1ec",
      card: "#fbfbf7",
      ink: "#333833",
      muted: "#747a6f",
      accent: "#827332",
      soft: "#e8e5c8",
      dark: "#474629",
      body: "#555c65",
      detail: "#e8c961",
    },
    {
      id: "nightfury",
      name: "Night Fury",
      label: "A little rest before your next flight",
      pet: "Toothless",
      kind: "nightfury",
      bg: "#edf4f8",
      card: "#f9fcff",
      ink: "#233e4c",
      muted: "#607a88",
      accent: "#317a8b",
      soft: "#d6e8ef",
      dark: "#225768",
      body: "#283740",
      detail: "#b7db75",
    },
    {
      id: "iron",
      name: "Iron Man",
      label: "Time to recharge your reactor",
      pet: "Bolt",
      kind: "bear",
      bg: "#fff3e9",
      card: "#fffbf7",
      ink: "#502f29",
      muted: "#956b5d",
      accent: "#bd5841",
      soft: "#f4dbc6",
      dark: "#813f31",
      body: "#c35643",
      detail: "#edc16e",
    },
    {
      id: "captain",
      name: "Captain America",
      label: "A small break. A stronger return.",
      pet: "Scout",
      kind: "bear",
      bg: "#edf3fc",
      card: "#f9fbff",
      ink: "#293f5b",
      muted: "#70809a",
      accent: "#557eb3",
      soft: "#d5e2f5",
      dark: "#355881",
      body: "#7498c6",
      detail: "#cd6668",
    },
    {
      id: "panther",
      name: "Black Panther",
      label: "Rest with a little royal energy",
      pet: "Onyx",
      kind: "panther",
      bg: "#f2effa",
      card: "#fcfaff",
      ink: "#342b4c",
      muted: "#7d7297",
      accent: "#7959ad",
      soft: "#e4dbf3",
      dark: "#4b3570",
      body: "#494254",
      detail: "#b088e2",
    },
    {
      id: "emerald",
      name: "Royal Emerald",
      label: "Find your little pocket of calm",
      pet: "Clover",
      kind: "cat",
      bg: "#eef5ee",
      card: "#fafdf7",
      ink: "#2d4534",
      muted: "#718475",
      accent: "#568c65",
      soft: "#d9e9d6",
      dark: "#356040",
      body: "#8bb793",
      detail: "#ecdf9f",
    },
    {
      id: "sapphire",
      name: "Royal Sapphire",
      label: "Make room for a clearer view",
      pet: "Blue",
      kind: "cat",
      bg: "#edf3fa",
      card: "#fbfdff",
      ink: "#293f59",
      muted: "#70849b",
      accent: "#4c80b4",
      soft: "#d6e6f5",
      dark: "#305b84",
      body: "#83afd3",
      detail: "#d4ecff",
    },
  ];
  const star =
    '<path d="m48 39 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="currentColor"/>';
  function pet(id) {
    if (globalThis.FocusPets?.[id]) return FocusPets[id];
    const t = themes.find((x) => x.id === id) || themes[0],
      k = t.kind;
    let extra = "",
      face = "",
      ears = "";
    if (["cat", "panther"].includes(k)) {
      ears =
        '<path d="M26 38 24 12 42 26M54 26 72 12 70 40" fill="' +
        t.body +
        '" stroke="' +
        t.dark +
        '" stroke-width="2.5"/><path d="m29 20 9 10-8 2m28-2 9-10-1 12" fill="' +
        t.detail +
        '"/>';
      extra =
        '<path d="M69 70q24 0 13-24" fill="none" stroke="' +
        t.body +
        '" stroke-width="10" stroke-linecap="round"/>';
    }
    if (k === "owl") {
      ears =
        '<path d="m25 36-3-17 21 10m10 0 21-10-3 17" fill="' + t.body + '"/>';
      extra =
        '<path d="M28 48Q8 64 24 73M68 48q20 16 4 25" fill="' +
        t.body +
        '" stroke="' +
        t.dark +
        '" stroke-width="2"/>';
      face =
        '<ellipse cx="35" cy="43" rx="15" ry="17" fill="#fff7e4"/><ellipse cx="61" cy="43" rx="15" ry="17" fill="#fff7e4"/><path d="m43 51 5 8 5-8" fill="#cb974d"/><path d="M28 65q20 12 40 0v9q-20 9-40 0z" fill="' +
        t.detail +
        '"/><path d="M57 72v13h9V69" fill="' +
        t.detail +
        '"/>';
    }
    if (k === "bat" || k === "dragon") {
      ears =
        '<path d="m27 35 2-24 15 17m9 0 14-17 3 24" fill="' + t.body + '"/>';
      extra =
        '<path d="M29 49 5 31 9 63l10-5 5 13 9-8M67 49l24-18-4 32-10-5-5 13-9-8" fill="' +
        t.body +
        '" stroke="' +
        t.dark +
        '" stroke-width="2"/>';
      if (k === "dragon")
        extra +=
          '<path d="M63 73q26 9 23-16" fill="none" stroke="' +
          t.body +
          '" stroke-width="7"/><path d="m82 55 8-10 1 14" fill="' +
          t.detail +
          '"/>';
    }
    if (k === "bear") {
      ears =
        '<circle cx="28" cy="27" r="11" fill="' +
        t.body +
        '"/><circle cx="68" cy="27" r="11" fill="' +
        t.body +
        '"/>';
      if (id === "captain")
        extra =
          '<circle cx="69" cy="66" r="17" fill="' +
          t.detail +
          '"/><circle cx="69" cy="66" r="12" fill="#fff5eb"/><circle cx="69" cy="66" r="8" fill="' +
          t.accent +
          '"/>';
    }
    // Theme colours on the same cat/bear shapes as the rest of the family.
    if (id === "iron") {
      ears +=
        '<circle cx="28" cy="27" r="6" fill="' +
        t.detail +
        '"/><circle cx="68" cy="27" r="6" fill="' +
        t.detail +
        '"/>';
      face =
        '<ellipse cx="48" cy="53" rx="11" ry="8" fill="' +
        t.detail +
        '"/><ellipse cx="48" cy="69" rx="13" ry="12" fill="' +
        t.detail +
        '"/><circle cx="48" cy="68" r="5" fill="#d9f7ff" stroke="#73b9ca" stroke-width="2"/>';
    }
    const eyes =
      '<g fill="' +
      t.dark +
      '"><ellipse cx="36" cy="44" rx="3" ry="4.5"/><ellipse cx="60" cy="44" rx="3" ry="4.5"/></g><g fill="#fff"><circle cx="37" cy="42.5" r="1"/><circle cx="61" cy="42.5" r="1"/></g>';
    return (
      '<svg aria-hidden="true" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><ellipse cx="48" cy="87" rx="27" ry="4" fill="' +
      t.dark +
      '" opacity=".12"/>' +
      extra +
      ears +
      '<ellipse cx="48" cy="64" rx="23" ry="21" fill="' +
      t.body +
      '"/><rect x="23" y="23" width="50" height="39" rx="20" fill="' +
      t.body +
      '"/><ellipse cx="35" cy="81" rx="10" ry="5" fill="' +
      t.body +
      '"/><ellipse cx="61" cy="81" rx="10" ry="5" fill="' +
      t.body +
      '"/>' +
      face +
      eyes +
      (k !== "owl"
        ? '<path d="m44 52 4 3 4-3m-4 3v3" fill="none" stroke="' +
          t.dark +
          '" stroke-width="2" stroke-linecap="round"/>'
        : "") +
      (k === "panther"
        ? '<path d="m31 63 7 5 5-2 5 6 5-6 5 2 7-5" fill="none" stroke="' +
          t.detail +
          '" stroke-width="3"/>'
        : "") +
      (id === "captain"
        ? '<g transform="translate(0 21) scale(.6) translate(32 0)" style="color:#fff">' +
          star +
          "</g>"
        : "") +
      "</svg>"
    );
  }
  function apply(el, id) {
    const t = themes.find((x) => x.id === id) || themes[0];
    for (const k of ["bg", "card", "ink", "muted", "accent", "soft", "dark"])
      el.style.setProperty("--" + k, t[k]);
    return t;
  }
  return { themes, pet, apply };
})();
