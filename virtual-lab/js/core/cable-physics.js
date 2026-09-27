(() => {
  class CablePhysics {
    constructor(svg, endpoint, onRemove) { this.svg = svg; this.endpoint = endpoint; this.onRemove = onRemove; this.pending = null; }
    path(a, b, sag = 1) {
      // Gravity-oriented cubic cable, with strain-relief tangents at the plugs.
      const distance = Math.hypot(b.x - a.x, b.y - a.y), drop = Math.min(150, 24 + distance * 0.16) * sag;
      return 'M ' + a.x + ' ' + a.y + ' C ' + a.x + ' ' + (a.y + drop) + ' ' + b.x + ' ' + (b.y + drop) + ' ' + b.x + ' ' + b.y;
    }
    draw(wires) {
      const ns = 'http://www.w3.org/2000/svg'; this.svg.replaceChildren();
      const interaction = EE.interaction, surface = interaction?.surface;
      let layer = this.svg;
      if (surface) {
        if (!surface.getClientRects().length || (EE.scene?.active && !interaction.open)) return;
        const rect=surface.getBoundingClientRect(),defs=document.createElementNS(ns,'defs'),clip=document.createElementNS(ns,'clipPath'),shape=document.createElementNS(ns,'path');
        // Even-odd holes keep cables behind patch buttons while their plugs remain visible.
        const bounds=r=>'M '+r.left+' '+r.top+' h '+r.width+' v '+r.height+' h '+(-r.width)+' Z';
        let outline=bounds(rect);for(const node of surface.querySelectorAll('.patch-label,.patch-bay button'))outline+=' '+bounds(node.getBoundingClientRect());
        clip.id='wire-workspace-clip';shape.setAttribute('d',outline);shape.setAttribute('clip-rule','evenodd');clip.append(shape);defs.append(clip);this.svg.append(defs);
        layer=document.createElementNS(ns,'g');layer.setAttribute('clip-path','url(#wire-workspace-clip)');this.svg.append(layer);
      }
      const list = this.pending ? [...wires, { a: this.pending.a, b: null, color: this.pending.color }] : wires;
      for (const wire of list) {
        const a = this.endpoint(wire.a), b = wire.b ? this.endpoint(wire.b) : this.pending.point;
        if (!a || !b) continue;
        if (interaction?.leads === 'off' && wire.id) continue;
        const active = EE.bench?.interaction().pending || interaction?.hoverTerminal || EE.bench?.board.hover;
        const focused = active && [wire.a,wire.b].some(id => id === active || EE.bench.model.result.connected(id,active));
        if (interaction?.leads === 'selected' && wire.id && !focused) continue;
        const path = this.path(a, b, surface ? 0.18 : (wire.sag || 1));
        const shadow = document.createElementNS(ns, 'path'); shadow.setAttribute('d', path); shadow.setAttribute('class', 'wire-shadow'); layer.append(shadow);
        const line = document.createElementNS(ns, 'path'); line.setAttribute('d', path); line.setAttribute('stroke', wire.color); line.setAttribute('class', 'wire');if(active && !focused && wire.id) { line.style.opacity = '.22';shadow.style.opacity = '.2'; }line.dataset.wireId=wire.id || 'preview';
        if (wire.id) {
          line.setAttribute('role', 'button'); line.setAttribute('tabindex', '0'); line.setAttribute('aria-label', 'Remove cable ' + wire.a + ' to ' + wire.b);
          line.addEventListener('dblclick', () => this.onRemove(wire.id));
          line.addEventListener('keydown', e => { if (e.key === 'Delete' || e.key === 'Backspace') this.onRemove(wire.id); });
          const title = document.createElementNS(ns, 'title'); title.textContent = wire.a + ' → ' + wire.b + ' · double-click to unplug'; line.append(title);
        }
        layer.append(line);
        for (const point of [a, b]) { const plug = document.createElementNS(ns, 'circle'); plug.setAttribute('cx', point.x); plug.setAttribute('cy', point.y); plug.setAttribute('r', '3.4'); plug.setAttribute('fill', wire.color); plug.setAttribute('class', 'wire-plug'); layer.append(plug); }
      }
    }
  }
  EE.CablePhysics = CablePhysics;
})();
