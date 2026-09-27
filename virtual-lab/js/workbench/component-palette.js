(() => {
  const components = [ { type: 'R', value: 1000, label: '1 kΩ', detail: '¼ W · ±5%', className: 'resistor' }, { type: 'C', value: 0.1e-6, label: '0.1 µF', detail: '50 V · ceramic', className: 'ceramic' }, { type: 'C', value: 1e-6, label: '1.0 µF', detail: '50 V · ±10%', className: 'capacitor' }, { type: 'C', value: 2.2e-6, label: '2.2 µF', detail: '50 V · ±10%', className: 'capacitor' } ];
  class ComponentPalette {
    constructor(container, onSelect) {
      container.innerHTML = components.map((c, i) => '<button class="part-tile" data-part="' + i + '" aria-label="Place ' + c.label + '"><span class="part-mini ' + c.className + '"></span><b>' + c.label + '</b><small>' + c.detail + '</small></button>').join('');
      container.addEventListener('click', event => { const button = event.target.closest('[data-part]'); if (button) onSelect(components[Number(button.dataset.part)]); });
    }
    static create(type, value, a, b, id) { return { id, type, value, a, b, state: 'good', rating: type === 'R' ? 0.25 : 50 }; }
  }
  EE.ComponentPalette = ComponentPalette;
})();
