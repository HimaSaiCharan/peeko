// Gentle synthesized reminders, bundled locally with no audio downloads.
globalThis.FocusSounds = (() => {
  const choices = [
    {
      id: "buzzer",
      name: "Soft buzzer",
      type: "triangle",
      notes: [
        [220, 0, 0.25],
        [220, 0.4, 0.25],
        [220, 0.8, 0.35],
      ],
    },
    {
      id: "chime",
      name: "Gentle chime",
      type: "sine",
      notes: [
        [523, 0, 0.35],
        [659, 0.2, 0.35],
        [784, 0.4, 0.65],
      ],
    },
    {
      id: "bell",
      name: "Crystal bell",
      type: "sine",
      notes: [
        [880, 0, 1.2],
        [1320, 0.12, 1],
      ],
    },
    { id: "ping", name: "Soft ping", type: "sine", notes: [[660, 0, 0.3]] },
    {
      id: "double",
      name: "Two gentle notes",
      type: "sine",
      notes: [
        [523, 0, 0.25],
        [659, 0.35, 0.35],
      ],
    },
    {
      id: "warm",
      name: "Warm chime",
      type: "sine",
      notes: [
        [392, 0, 0.65],
        [494, 0.55, 0.7],
        [587, 1.15, 0.85],
      ],
    },
    { id: "silent", name: "Silent", type: "sine", notes: [] },
  ];
  const finish = {
    type: "sine",
    notes: [
      [660, 0, 0.12],
      [880, 0.18, 0.22],
    ],
  };
  function get(id, finished = false) {
    return finished ? finish : choices.find((s) => s.id === id) || choices[0];
  }
  function duration(sound) {
    return Math.max(
      0,
      ...sound.notes.map(([, delay, length]) => delay + length),
    );
  }
  return { choices, get, duration };
})();
