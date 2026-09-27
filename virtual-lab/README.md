# Fieldwork — Electrical Engineering Virtual Lab

Open `index.html` directly in a browser. No server, installation, account, network connection, or build step is needed. All visual assets are CSS, SVG, or Canvas; audio is synthesized after selecting **Sound on**.

**Language:** Thai is the default. Use **ไทย / EN** in the sticky navbar to switch instantly; the preference is saved on this device when local storage is available. The worksheet and help dialogs have the same toggle. Changing language preserves wiring, instrument settings, damage states, and worksheet entries. Instrument model names, electrical units, and standard panel abbreviations are retained. Translations are bundled locally in `js/core/i18n.js` and the scene, interaction, and mission modules.

The bench starts with the Lab 7 circuit already connected: 1 kΩ, 2.2 µF, 300 Hz, and a measured 10 V peak-to-peak input. The instrument panels are backed by the same electrical netlist as the breadboard.

## Real-bench front panels - 27 September 2026

The generator now uses Freq/Ampl/Offset, a digit-select knob, shared numeric function keys and the course's complete High-Z menu sequence: **Shift, Enter (Menu On/Off), Right x3, Down x2, Right, Enter**. Free wiring and the first mission start in 50 OHM mode; prepared reference circuits remain calibrated in Hi-Z. Changing OUT TERM preserves physical output while recalibrating the displayed amplitude.

The scope now has six context softkeys, Entry/Select, dedicated channel/position/time/trigger controls, Meas, Cursors and Default Setup. To measure phase, press **Cursors**, select X1/X2 with the corresponding softkeys and turn Entry to align the cursors with matching waveform features. **Probe Comp** provides a separately solved 1 kHz, nominal 3 Vpp signal through real terminals. See the [operating details, source evidence and model limits](docs/UPGRADE_REAL_BENCH_2026-09-27.md).

## Guided game and direct manipulation — 23 September 2026

Choose **เริ่มภารกิจ / Start mission** for three Lab 7 chapters with 18 steps: assemble the RC circuit, measure capacitance and frequency response, and correct the photo 10 probe mistake. Gates check actual wiring, outputs and readings. **Retry this step** restores the current checkpoint; earlier completed steps remain. The next chapter unlocks after completion. **Missions** opens the chapter map and exports the eleven recorded measurements. Progress and the working circuit can be resumed after reload.

**Open assembly desk** (B) gives the breadboard its own large workspace. Drag parts from the tray onto pins, drag component bodies to move them, and use R while dragging to rotate the lead span. You can still click two pins or type their exact names. Invalid/occupied placements cancel cleanly. The local labeled patch bay keeps cables within the circuit area, leaving every instrument screen and control unobstructed.

Use **Ctrl/Cmd + Z** to undo and **Ctrl/Cmd + Shift + Z** or **Ctrl + Y** to redo. The last 100 bench commands include wiring, instrument settings, stopped scope acquisitions, damage, and board placement. **History** shows up to 200 session actions and exports JSON. Native input-field text editing is preserved. Command history resets on reload; mission checkpoints persist separately.

In 3D, click an instrument for its individual live control panel, or use keys 1–4. Main power/knob hot spots respond directly on the models. **Arrange board** enables tabletop dragging with wires following the board. Selection controls expose rotate, polarity flip and removal. Camera focus and placement feedback respect reduced-motion preferences.

See the detailed Thai [gameplay upgrade log](docs/UPGRADE_GAMEPLAY_2026-09-23.md), including controls, validation, implementation files and model boundaries.

## 3D simulator view

Choose **แล็บ 3D / 3D lab** in the navbar or **เข้าสู่แล็บ 3D / Enter 3D lab** to stand at the procedural WebGL bench. W/A/S/D walks at a fixed eye height within the aisle in front of the table. Drag to look from that position, right-drag to step, and scroll for optical zoom. Q/E turns; R returns to the starting position. Touch supports one-finger look and two-finger movement/pinch. Instrument close or Escape restores the view before opening the first instrument, even after switching instruments. Overhead/arrangement views have a return action. The walking pose is remembered when storage is available; reloading during inspection restores the walking view.

**Lead spacing** under each tray item sets the actual pin separation in 2.54 mm pitches. Free-play defaults are 10.16 mm for R and 5.08 mm for C. Use `[` / `]` during a drag to shorten/extend, R to rotate, or **Apply spacing** on a selected part to resize with Undo/Redo. Auto mode keeps the documented mission spans when a mission is active. The two-click placement method still allows custom endpoints.

See the [24 September navigation and lead-spacing log](docs/UPGRADE_NAVIGATION_2026-09-24.md) for controls, persistence behavior, walking bounds and verification.

Read the Thai upgrade record, control guide, architecture, and boundaries in [docs/UPGRADE_3D_SIMULATOR.md](docs/UPGRADE_3D_SIMULATOR.md). This is a real WebGL scene with procedural geometry, depth testing, lighting, and live instrument textures; it uses no external assets or 3D library. Devices without WebGL retain the 2D bench.

## Operating the bench

- Select **Capacitance**, **Frequency response**, or **Series capacitors** to load an experiment. **Free wiring** gives an empty board with outputs off.
- Drag a jack to a breadboard pin, or click two endpoints. The large INPUT, RESPONSE, and RETURN posts connect to A12, A29, and A49. Escape cancels a pending lead.
- Select a tray component and then two board pins. The first electrolytic lead is positive. **Connections & component placement** also accepts exact pin names, edits cable endpoints, moves or flips parts, and removes or replaces components.
- The board has 630 terminal holes and 200 rail holes. A–E in one numbered column are connected; F–J form a separate bus. Each of the four 50-hole power rails is continuous. Zoom and pan make individual holes easier to select.
- A knob responds to dragging, scrolling, arrow keys, or clicking. Shift-click steps backward. On the scope screen, scroll for timebase, Shift-scroll for active-channel voltage, and drag for position. Two-finger horizontal and vertical pinches control the same scales. Double-tap or double-click executes Auto scale.
- Enable cursors, then use Entry/Select or drag X1 and X2. Δt and φ are calculated from their positions. Run/Stop holds an acquisition; Single waits for a qualifying trigger and captures once.
- The worksheet contains Tables 7.1, 7.2, and 7.3. **Set up** loads a row; **Record** captures current scope readings. Entries are retained in local storage when available and can be exported as CSV. Resetting the bench preserves worksheet entries.

## Circuit and instrument models

`js/core/circuit-solver.js` merges physical buses, leads, and grounded terminals with union-find, then performs complex nodal analysis using pivoted Gaussian elimination. DC and AC are solved separately. A 1 pS reference conductance stabilizes otherwise floating islands. Display values are derived from solved node voltages, never preset amplitudes substituted for a circuit solution.

- HP 33120A: finite 50 Ω source resistance, Hi-Z / 50 Ω display-load calibration, physical key/menu entry, frequency and voltage limits, DC offset/headroom limits, sine, square, triangle, duty cycle and a TTL sync output. Symmetric square, triangle and sync use odd harmonics through the 61st; non-50% duty includes even harmonics and DC. RMS is calculated from harmonic energy, including DC for component power.
- SPD3303C: independent CH1/CH2 voltage settings from 0 to 32 V, adjustable current limits through 3.2 A, CH3 fixed-voltage choices, per-channel and all-output controls. An active-set DC solve changes a channel from CV to CC under load. Direct shorts read 0 V at the current limit.
- HP 34401A: 10 MΩ voltage input, true RMS ACV/ACI, DCV/DCI, frequency, resistance, nulling, and a physical 0.1 Ω fused current shunt. The shunt remains electrically present whenever a good fuse is installed, even if the voltage function is selected. The current input is therefore not made safe by changing the function button.
- Scope: 1 MΩ physical inputs, earth-referenced ground clips, DC/AC/GND display coupling, 10-by-8 graticule, 0.2-division center ticks, 1–2–5 voltage/time detents, rising/falling edge triggers, Auto/Normal modes, independent positions, softkey menus, cursor measurements and stable acquisition snapshots. Probe Comp is an independent nodal source. The loading API still permits an external 50 Ω termination for physics exercises.

The Lab 7 setup adjusts the generator amplitude using CH1, just as an operator would, to obtain the prescribed voltage at the loaded input. The generator’s displayed Hi-Z amplitude can therefore be slightly above 10 Vpp. Changing a component or termination subsequently changes the loading naturally.

## Failure and repair

| Fault | Detection and circuit response | Recovery |
| --- | --- | --- |
| Scope ground short | Compare pre-contact potential, then electrically earth the clip. The shorted node collapses and an arc is displayed. Other voltages follow the resulting circuit. | Move or unplug the ground lead. |
| DMM fuse | Actual shunt RMS current exceeds 3 A. Fuse becomes an open branch; current reading reports FUSE OPEN. Procedural pop. | Disable outputs, open REAR, remove the fuse, insert a new 3 A / 250 V fuse, and correct the wiring. |
| Resistor overload | Solved AC plus DC power exceeds 0.25 W. Body chars, smoke rises, and the resistor opens. | Disable outputs and replace/remove the part. |
| Reverse electrolytic | Solved negative DC bias exceeds 1.5 V on a 1.0 or 2.2 µF capacitor. The vent ruptures with a pop; a 0.01 Ω fault branch models the short. | Disable outputs, replace the part, and correct its polarity. |
| Supply overcurrent | Load exceeds the configured current limit. Channel enters CC and reports solved terminal voltage. | Remove the short or excessive load; CV returns automatically. |

The failure experiment buttons construct actual fault netlists with the relevant source off. Enable the indicated output to trigger the effect. They do not directly set damage flags.

## Ground truth and grading

The authoritative local sources remain in `docs/HARDWARE_SPECS.md`, `docs/LAB7_GUIDE_CONDENSED.md`, and `docs/PRD_LAYOUT_AND_SPEC.md`. The original photographs are unchanged.

The ten observed records are retained in `js/labs/lab7/lab7-config.js`, including their individual input voltages, frequencies, timebases, and the photo 10 probe error. Worksheet reference rows compare these observations with independent analytical predictions. Some observations, especially at high frequency, cannot be reproduced by the ideal RC equations within ±5% R and ±10% C. The implementation identifies that disagreement instead of altering the transfer function to fit the photographs.

The grader evaluates the entire component-tolerance envelope and adds explicit reading resolution: 0.025 V peak, 1 degree, and 0.01 ms. It separately verifies consistency between phase and delay within 2 degrees. Photo 10 is detected from nearly equal input/output amplitudes and near-zero phase; the live bench also identifies probes connected to the same net.

## Structure and reuse

```text
css/             Layout, chassis, scope, scene, assembly workspace and mission UI
js/core/         Nodal solver, simulation, audio, cables, gestures, failures, command history
js/instruments/  Four independent instrument models
js/workbench/    Breadboard, palette, snapping, drag/drop and assembly interactions
js/labs/         Registry and Lab 7 configuration, grading, worksheet and missions
js/scene/        WebGL renderer, physical scene and direct instrument interactions
js/app.js        DOM events and rendering orchestration
js/lab.js        Native ES-module interface
```

To support opening local files, `index.html` loads the scoped source files with ordered deferred script tags. Browsers restrict external ES-module imports from local file URLs. The same sources are exposed through `js/lab.js` for native ES-module consumers; nothing is copied, bundled, fetched dynamically, or generated during startup.

`LabRegistry.register()` accepts curriculum IDs 1–9; only Lab 7 content is installed because only Lab 7 materials exist in the supplied curriculum folder. Other labs can provide configurations without modifying instrument code:

```javascript
import { LabRegistry, Simulation } from './js/lab.js';

const registry = new LabRegistry();
registry.register({
  id: 1,
  title: 'DC resistance measurement',
  create() {
    return {
      frequency: 300,
      parts: [{ id: 'R1', type: 'R', value: 1000,
        rating: 0.25, state: 'good', a: 'A1', b: 'A10' }],
      wires: [
        { id: 'w1', a: 'dmm.hi', b: 'A1', color: '#b35e54' },
        { id: 'w2', a: 'dmm.lo', b: 'A10', color: '#343d42' }
      ],
      generator: { enabled: false },
      meter: { mode: 'Ω' }
    };
  }
});
// breadboard.buses() supplies the 830-hole connectivity matrix.
const simulation = new Simulation(breadboard.buses());
registry.activate(1, simulation);
```

## Verification

Run the dependency-free physics and state-machine checks:

```sh
node tests/physics.test.cjs
node tests/instrument-firmware.test.cjs
```

An optional browser runner uses an already-installed Playwright and Chrome. It is a development test tool, not a runtime dependency; no installation is performed by the project:

```sh
EE_PLAYWRIGHT_PATH=/absolute/path/to/playwright node tests/browser.test.cjs
EE_PLAYWRIGHT_PATH=/absolute/path/to/playwright node tests/real-bench.test.cjs
```

See `docs/VERIFICATION.md` and `output/playwright/verification.json` for results. Screenshots and a captured worksheet CSV are in `output/playwright/`.

## Model boundaries

This is a deterministic linear RC teaching simulator, not a general SPICE replacement or a complete firmware replica. Damage thresholds are instantaneous, consistent with the requested teaching model; it does not integrate thermal history, electrochemistry, capacitor leakage, contact resistance, or semiconductor nonlinearities. A 0.01 Ω capacitor fault and 1 pS stabilization are explicit numerical modeling choices. Square-wave edges exhibit the finite Fourier approximation. At timebases too wide for the display pixels, the scope indicates undersampling. Browser frame pacing and cold-start duration depend on the device; literal 0 ms loading cannot be guaranteed.

The firmware subset and numerical approximations are listed in the [real-bench upgrade record](docs/UPGRADE_REAL_BENCH_2026-09-27.md#explicit-model-boundaries). Shared generator keys retain their physical legends and numeric roles; unsupported waveform/storage functions are disabled outside numeric entry. Cross-browser behavior beyond the recorded Chrome desktop and emulated-touch checks remains unverified.

Language regression: `EE_PLAYWRIGHT_PATH=/absolute/path/to/playwright node tests/language.test.cjs` verifies the default, persistence, state preservation, dynamic messages, mobile layout, and operation with blocked storage.

Gameplay regression: run `tests/play-game.test.cjs` for the full 18-step campaign and `tests/interaction-edges.test.cjs` for cancel/rotate/undo/locale/storage behavior with the same `EE_PLAYWRIGHT_PATH`. Results, exported logs, reports and screenshots are in `output/play-game/`.
