// Coordinates stay proportional when tabs have different viewport sizes.
globalThis.PeekoPosition = (() => {
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  function bounds(viewWidth, viewHeight, width, height, headroom = 0) {
    const left = 12, top = 12 + headroom;
    return {left, top, right: Math.max(left, viewWidth - width - 12), bottom: Math.max(top, viewHeight - height - 12)};
  }
  function point(x, y, b) {
    return {left: b.left + clamp(x, 0, 1) * (b.right - b.left), top: b.top + clamp(y, 0, 1) * (b.bottom - b.top)};
  }
  function normalized(left, top, b) {
    return {x: clamp((left - b.left) / Math.max(1, b.right - b.left), 0, 1), y: clamp((top - b.top) / Math.max(1, b.bottom - b.top), 0, 1)};
  }
  function corner(x, y) {
    return {x: x < .5 ? 0 : 1, y: y < .5 ? 0 : 1, name: `${y < .5 ? 'top' : 'bottom'}-${x < .5 ? 'left' : 'right'}`};
  }
  return {bounds, point, normalized, corner};
})();
