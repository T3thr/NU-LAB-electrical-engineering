(() => {
  class Breadboard {
    constructor(canvas) {
      this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.pins = []; this.zoom = 1; this.pan = 0; this.hover = null; this.parts = [];
      for (let col = 1; col <= 63; col++) for (let row = 0; row < 10; row++) this.pins.push({ id: String.fromCharCode(65 + row) + col, x: 48 + (col - 1) * 14.5, y: row < 5 ? 83 + row * 13 : 179 + (row - 5) * 13, bus: (row < 5 ? 'upper' : 'lower') + col });
      for (let rail = 0; rail < 4; rail++) for (let col = 1; col <= 50; col++) this.pins.push({ id: ['T+', 'T-', 'B+', 'B-'][rail] + col, x: 54 + (col - 1) * 18, y: [28, 47, 263, 282][rail], bus: 'rail' + rail });
      this.byId = new Map(this.pins.map(pin => [pin.id, pin]));
    }
    buses() {
      const first = new Map(), result = [];
      for (const pin of this.pins) { if (first.has(pin.bus)) result.push([pin.id, first.get(pin.bus)]); else first.set(pin.bus, pin.id); }
      return result;
    }
    metrics() { return { scale: this.canvas.clientWidth / 1000 * this.zoom, x: -this.pan, y: 15 }; }
    position(id) { const p = this.byId.get(id); if (!p) return null; const m = this.metrics(), r = this.canvas.getBoundingClientRect(); return { x: r.left + m.x + p.x * m.scale, y: r.top + m.y + p.y * m.scale }; }
    hit(clientX, clientY) {
      const r = this.canvas.getBoundingClientRect(), m = this.metrics();
      const x = (clientX - r.left - m.x) / m.scale, y = (clientY - r.top - m.y) / m.scale;
      let found = null, nearest = 9;
      for (const pin of this.pins) { const d = Math.hypot(pin.x - x, pin.y - y); if (d < nearest) { nearest = d; found = pin; } }
      return found;
    }
    draw(parts, selected) {
      this.parts = parts;
      const canvas = this.canvas, ctx = this.ctx, dpr = globalThis.devicePixelRatio || 1;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      const m = this.metrics(); ctx.translate(m.x, m.y); ctx.scale(m.scale, m.scale);
      ctx.shadowColor = '#0008'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 15;
      ctx.fillStyle = '#d4d0bb'; ctx.beginPath(); ctx.roundRect(12, 6, 976, 306, 9); ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      const body = ctx.createLinearGradient(0, 0, 0, 300); body.addColorStop(0, '#f6f1e2'); body.addColorStop(1, '#dcd8c8'); ctx.fillStyle = body; ctx.fillRect(16, 6, 968, 299);
      ctx.fillStyle = '#c4c0b0'; ctx.fillRect(25, 146, 950, 18); ctx.fillStyle = '#b5b09f'; ctx.fillRect(25, 146, 950, 3);
      ctx.font = '11px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#858477';
      for (let i = 1; i <= 63; i++) if (i === 1 || i % 5 === 0 || i === 63) { ctx.fillText(String(i), 48 + (i - 1) * 14.5, 72); ctx.fillText(String(i), 48 + (i - 1) * 14.5, 248); }
      for (let row = 0; row < 10; row++) ctx.fillText(String.fromCharCode(65 + row), 30, row < 5 ? 87 + row * 13 : 183 + (row - 5) * 13);
      [18, 56, 253, 292].forEach((y, i) => { ctx.strokeStyle = i % 2 ? '#547e9c' : '#b85e4b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(43, y); ctx.lineTo(955, y); ctx.stroke(); });
      const hovered = this.byId.get(this.hover);
      for (const pin of this.pins) {
        if (hovered && pin.bus === hovered.bus) { ctx.fillStyle = '#f0a54c88'; ctx.fillRect(pin.x - 5, pin.y - 5, 10, 10); }
        ctx.fillStyle = '#fffc'; ctx.fillRect(pin.x - 2.9, pin.y - 2, 6.8, 6.8); ctx.fillStyle = '#a6a494'; ctx.fillRect(pin.x - 3.2, pin.y - 3.2, 6.4, 6.4); ctx.fillStyle = '#484b43'; ctx.fillRect(pin.x - 2, pin.y - 2, 4, 4);
      }
      for (const part of parts) this.drawPart(ctx, part, selected === part.id);
      if (this.preview?.a && this.preview?.b && this.byId.has(this.preview.b)) {
        ctx.save();ctx.globalAlpha=.65;this.drawPart(ctx,this.preview,true);ctx.globalAlpha=1;
        const a=this.byId.get(this.preview.a),b=this.byId.get(this.preview.b),match=id=>/^([A-J])(\d+)$/.exec(id),pa=match(this.preview.a),pb=match(this.preview.b);
        if(pa&&pb){const row=m=>m[1].charCodeAt(0)-65,ra=row(pa),rb=row(pb),dy=ra-rb+(ra>=5?2:0)-(rb>=5?2:0),mm=2.54*Math.hypot(Number(pa[2])-Number(pb[2]),dy);ctx.strokeStyle=this.preview.valid?'#387c5e':'#a64f3d';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(a.x,a.y+24);ctx.lineTo(b.x,b.y+24);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#264b3a';ctx.font='bold 13px monospace';ctx.fillText(this.preview.a+' → '+this.preview.b+' · '+mm.toFixed(2)+' mm',(a.x+b.x)/2,Math.max(a.y,b.y)+43);}

        for(const id of [this.preview.a,this.preview.b]){const p=this.byId.get(id);ctx.strokeStyle=this.preview.valid?'#6bdfb2':'#f59983';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,10,0,Math.PI*2);ctx.stroke();}ctx.restore();
      }
      const targets=this.guides===false?[]:(EE.missions?.targets?.() || []);
      for(const id of targets){const p=this.byId.get(id);if(p){ctx.strokeStyle='#e8bb53';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,11,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#26493f';ctx.font='bold 14px monospace';ctx.fillText(id,p.x,p.y+30);}}
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    drawPart(ctx, part, selected) {
      const a = this.byId.get(part.a), b = this.byId.get(part.b); if (!a || !b) return;
      const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2 - 22, direction = a.x <= b.x ? 1 : -1;
      ctx.strokeStyle = '#696d66'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(x - (part.type==='R'?17:12) * direction, y); ctx.moveTo(x + (part.type==='R'?17:12) * direction, y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.strokeStyle = '#e5e2cf'; ctx.lineWidth = 1.3; ctx.stroke();
      ctx.save(); ctx.translate(x, y); ctx.scale(direction, 1); ctx.shadowColor = '#0007'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 6;
      if (part.type === 'R') {
        ctx.fillStyle = part.state === 'burnt' ? '#29231e' : '#c7ad78'; ctx.beginPath(); ctx.roundRect(-18, -7, 36, 14, 5); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        if (part.state !== 'burnt') ['#754524', '#252727', '#bb3d2c', '#cba94f'].forEach((color, i) => { ctx.fillStyle = color; ctx.fillRect(-13 + i * 8, -6, 3, 12); });
      } else if (part.value < 0.5e-6) {
        ctx.fillStyle = '#ca925b'; ctx.beginPath(); ctx.ellipse(0, 0, 20, 14, 0, 0, 2 * Math.PI); ctx.fill();
      } else {
        ctx.fillStyle = '#263e4c'; ctx.beginPath(); ctx.roundRect(-22, -24, 44, 37, 5); ctx.fill(); ctx.fillStyle = '#a8bbbc'; ctx.fillRect(12, -22, 8, 33);
        ctx.fillStyle = '#d1d4c9'; ctx.beginPath(); ctx.ellipse(0, -23, 21, 7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.strokeStyle = part.state === 'ruptured' ? '#151e1f' : '#9aa19b'; ctx.lineWidth = part.state === 'ruptured' ? 4 : 1;
        ctx.beginPath(); ctx.moveTo(-13, -28); ctx.lineTo(13, -18); ctx.moveTo(13, -28); ctx.lineTo(-13, -18); ctx.stroke();
        ctx.fillStyle = '#eff5dc'; ctx.font = '12px monospace'; ctx.fillText('−', 16, 5); ctx.fillText('+', -30, 4);
      }
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      if (selected) { ctx.strokeStyle = '#e1a347'; ctx.lineWidth = 2; ctx.strokeRect(-43, -32, 86, 53); }
      ctx.scale(direction, 1); ctx.fillStyle = '#33473d'; ctx.font = 'bold 12px monospace'; ctx.fillText((part.id || part.type) + ' · ' + (part.type === 'R' ? '1kΩ' : (part.value * 1e6).toFixed(1) + 'µF'), 0, -39);
      ctx.restore();
    }
  }
  EE.Breadboard = Breadboard;
})();
