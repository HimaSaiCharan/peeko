chrome.runtime.onMessage.addListener((m, sender, respond) => {
  if (m.target !== "audio") return;
  if (m.sound === "silent" || m.volume === 0) {
    respond({ ok: true });
    return;
  }
  (async () => {
    const ctx = new AudioContext();
    try {
      await ctx.resume();
      const sound = FocusSounds.get(m.sound, m.finished);
      const start = ctx.currentTime + 0.02,
        volume = Math.max(0, Math.min(1, m.volume / 100)) * 0.22;
      for (const [freq, delay, length] of sound.notes) {
        const osc = ctx.createOscillator(),
          gain = ctx.createGain();
        osc.type = sound.type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, start + delay);
        gain.gain.linearRampToValueAtTime(volume, start + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + delay + length);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start + delay);
        osc.stop(start + delay + length + 0.03);
      }
      respond({ ok: true });
      // Leave time for the last note to decay, including longer reminder choices.
      setTimeout(
        () => ctx.close(),
        Math.ceil((FocusSounds.duration(sound) + 0.25) * 1000),
      );
    } catch (error) {
      await ctx.close();
      respond({ error: error.message });
    }
  })();
  return true;
});
