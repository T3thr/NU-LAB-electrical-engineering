(() => {
  function bindKnob(element, step, options = {}) {
    let lastY = null, moved = false;
    element.addEventListener('wheel', event => { event.preventDefault(); step(event.deltaY > 0 ? 1 : -1); }, { passive: false });
    element.addEventListener('keydown', event => { if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(event.key)) { event.preventDefault(); step(['ArrowUp', 'ArrowRight'].includes(event.key) ? 1 : -1); } });
    element.addEventListener('pointerdown', event => { lastY = event.clientY; moved = false; EE.history?.begin(); element.setPointerCapture(event.pointerId); });
    element.addEventListener('pointermove', event => { if (lastY === null) return; const delta = lastY - event.clientY; if (Math.abs(delta) >= 8) { step(delta > 0 ? 1 : -1); lastY = event.clientY; moved = true; } });
    element.addEventListener('pointerup', () => { lastY = null; EE.history?.end(); });
    element.addEventListener('pointercancel', () => { lastY = null; EE.history?.end(); });
    element.addEventListener('click', event => { if (!moved) { if (options.push) options.push(); else step(event.shiftKey ? -1 : 1); } });
  }
  class GestureEngine {
    constructor(canvas, scope, onChange) {
      this.pointers = new Map(); this.lastTap = 0; this.pinch = null;
      canvas.addEventListener('pointerdown', event => {
        const p = { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, moved: false };
        this.pointers.set(event.pointerId, p); canvas.setPointerCapture(event.pointerId);
        const rect = canvas.getBoundingClientRect(), g = scope.graticule();
        this.dragCursor = scope.cursors ? scope.cursor.findIndex(c => Math.abs(rect.left + g.x + c * g.w - p.x) < 18) : -1;
        if (this.pointers.size === 2) { const [a, b] = [...this.pointers.values()]; this.pinch = { x: Math.abs(a.x - b.x), y: Math.abs(a.y - b.y) }; this.dragCursor = -1; }
      });
      canvas.addEventListener('pointermove', event => {
        const p = this.pointers.get(event.pointerId); if (!p) return;
        const dx = event.clientX - p.x, dy = event.clientY - p.y; p.x = event.clientX; p.y = event.clientY;
        if (Math.hypot(p.x - p.startX, p.y - p.startY) > 4) p.moved = true;
        if (this.pointers.size >= 2 && this.pinch) {
          const [a, b] = [...this.pointers.values()], x = Math.abs(a.x - b.x), y = Math.abs(a.y - b.y);
          for (const [axis, value] of [['x', x], ['y', y]]) if (this.pinch[axis] > 30 && Math.abs(Math.log(Math.max(value, 1) / this.pinch[axis])) > 0.22) { scope.step(axis === 'x' ? 'time' : (scope.active === 0 ? 'ch1' : 'ch2'), value > this.pinch[axis] ? -1 : 1); this.pinch[axis] = value; }
        } else if (this.dragCursor >= 0) {
          const rect = canvas.getBoundingClientRect(), g = scope.graticule(); scope.cursor[this.dragCursor] = Math.min(1, Math.max(0, (p.x - rect.left - g.x) / g.w));
        } else { const g = scope.graticule(); scope.offset[scope.active] -= dy / (g.h / 8); scope.timeOffset -= dx / g.w * scope.timeDiv * 10; }
        onChange();
      });
      const finish = event => {
        const p = this.pointers.get(event.pointerId), wasPinch = !!this.pinch; this.pointers.delete(event.pointerId);
        if (this.pointers.size < 2) this.pinch = null;
        if (event.type === 'pointerup' && p && !p.moved && !wasPinch) { const now = performance.now(); if (now - this.lastTap < 300) { scope.autoScale(); onChange(); this.lastTap = 0; } else this.lastTap = now; }
      };
      canvas.addEventListener('pointerup', finish); canvas.addEventListener('pointercancel', finish);
      canvas.addEventListener('wheel', event => { event.preventDefault(); scope.step(event.shiftKey ? (scope.active === 0 ? 'ch1' : 'ch2') : 'time', event.deltaY > 0 ? 1 : -1); onChange(); }, { passive: false });
      canvas.addEventListener('dblclick', () => { scope.autoScale(); onChange(); });
    }
  }
  Object.assign(EE, { GestureEngine, bindKnob });
})();
