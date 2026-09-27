# DIRECTIVE: AUTONOMOUS LOOP ENGINEERING FOR INTERACTIVE EE VIRTUAL LAB

## 1. EXECUTION CONTEXT AND CONSTRAINTS
- Target Workspace: [virtual-lab](file;file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/virtual-lab)
- Primary Entrypoint: [index.html](file;file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/virtual-lab/index.html)
- Curriculum Root (Labs 1-9): [part1](file;file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/part1)
- Authoritative Engineering Dossiers:
  - Hardware Specs & Failure Matrix: [HARDWARE_SPECS.md](file;file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/virtual-lab/docs/HARDWARE_SPECS.md)
  - Theoretical Formulas & 10 Ground-Truth Benchmarks: [LAB7_GUIDE_CONDENSED.md](file;file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/virtual-lab/docs/LAB7_GUIDE_CONDENSED.md)
  - 3-Column UI/UX & Physics PRD: [PRD_LAYOUT_AND_SPEC.md](file;file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/virtual-lab/docs/PRD_LAYOUT_AND_SPEC.md)
  - Physical Bench Photo: [IMG_1226.jpeg](file;file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/part1/tools-use-in-lab/IMG_1226.jpeg)
  - Physical Scope Trace Photo: [10_sec7_3_fig7_16_series_c1_0_c2_2uf.jpg](file;file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/part1/lab7/result/10_sec7_3_fig7_16_series_c1_0_c2_2uf.jpg)

---

## 2. ROLE AND MANDATE
You are a Staff Simulation Architect executing an autonomous development loop.
Your task is to implement a production-grade, zero-dependency, client-side virtual electrical engineering laboratory starting from [index.html](file;file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/virtual-lab/index.html).
Deliver genuine tactile depth (2.5D skeuomorphic physical bench) where instruments feel physically present in front of the operator.
Zero placeholders. Zero mock stubs. Zero AI slop. Every switch, knob detent, banana jack, probe clip, and circuit node must be backed by a deterministic mathematical solver and state machine.

---

## 3. NON-NEGOTIABLE CORE PRINCIPLES
1. ZERO-DOLLAR-SIGN POLICY: Never emit dollar signs for math notation. Use Unicode characters (Ω, µF, V, Hz, ⁰, ¹, ², ³, φ, ω, Δt, →, ×, ±) or code blocks.
2. ZERO EXTERNAL BINARY DEPENDENCIES: No node_modules, bundlers, or CDNs. Pure HTML5, CSS3, ES Modules, Canvas 2D / WebGL, and Web Audio API. 0 ms cold start, fully offline functional.
3. GROUND TRUTH FIDELITY: Waveforms, peak-to-peak voltages, frequency responses, and phase shifts must match the analytical equations and the 10 physical benchmarks in [LAB7_GUIDE_CONDENSED.md](file;file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/virtual-lab/docs/LAB7_GUIDE_CONDENSED.md).
4. MULTI-LAB SCALABILITY: Decouple instrument digital twins from individual lab configurations so Labs 1 through 9 can be plugged in via registry without touching instrument logic.

---

## 4. ARCHITECTURAL BLUEPRINT

```text
virtual-lab/
├── index.html                         (Desktop-first 3-column bench container)
├── css/
│   ├── layout.css                     (3-column grid + mobile viewport switcher)
│   ├── bench-skeuomorphic.css         (Matte chassis textures, bezel depth, shadows)
│   ├── oscilloscope-display.css       (CRT/LCD phosphor glow, 8x10 graticule, cursors)
│   └── failure-fx.css                 (Smoke particle layering, electrical arc flashes)
└── js/
    ├── core/
    │   ├── circuit-solver.js          (Nodal connectivity graph + linear AC RC solver)
    │   ├── audio-synthesizer.js       (Procedural Web Audio API: relays, detents, fuse pop)
    │   ├── cable-physics.js           (Interactive catenary wire solver with terminal snapping)
    │   └── gesture-engine.js          (Touch pinch-to-zoom, waveform drag, touch cursors)
    ├── instruments/
    │   ├── siglent-spd3303c.js        (DC power supply: 0-32V, CV/CC automatic transition)
    │   ├── hp-34401a.js               (6.5-digit multimeter: True RMS ACV/DCV, blown fuse state)
    │   ├── hp-33120a.js               (15MHz function generator: sine/square/tri, 50Ω/Hi-Z output)
    │   └── digital-oscilloscope.js    (Dual-channel 60 FPS scope, measurements, V/DIV, TIME/DIV)
    ├── workbench/
    │   ├── breadboard.js              (830 tie-point connectivity matrix with hover bus highlight)
    │   └── component-palette.js       (R 1kΩ with color code, C 0.1µF, 1.0µF, 2.2µF with polarity)
    ├── labs/
    │   ├── lab-registry.js            (Multi-lab manager supporting Labs 1 through 9)
    │   └── lab7/
    │       ├── lab7-config.js         (RC circuit definitions, components, frequency sweep)
    │       ├── lab7-evaluator.js      (Auto-grader verifying against Tables 7.1, 7.2, 7.3)
    │       └── lab7-worksheet.js      (Collapsible interactive student report drawer)
    └── app.js                         (Orchestrator binding core, instruments, and active lab)
```

---

## 5. PRIMARY SUBSYSTEM REQUIREMENTS

### 5.1 Three-Column 2.5D Bench Layout
- Left Column (Width: 360px): Stack matching [IMG_1226.jpeg](file;file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/part1/tools-use-in-lab/IMG_1226.jpeg). Top: Siglent SPD3303C (dual LED displays, CV green / CC red indicators, CH1/CH2/CH3/GND jacks). Middle: HP 34401A (cyan-green VFD display, function buttons, fused Current 3A terminal). Bottom: HP 33120A (VFD display, waveform selectors, main 50Ω BNC and TTL sync BNC).
- Center Column (Fluid Flex): 830-point solderless breadboard with vertical 5-hole connectivity and power rails. Interactive catenary wires (sagging spline physics) draggable from any instrument jack to breadboard pin. Component tray with passive components.
- Right Column (Width: 420px): Digital Storage Oscilloscope matching [10_sec7_3_fig7_16_series_c1_0_c2_2uf.jpg](file;file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/part1/lab7/result/10_sec7_3_fig7_16_series_c1_0_c2_2uf.jpg). 8x10 graticule, CH1 yellow trace, CH2 green trace, realtime Pk-Pk(1), Pk-Pk(2), Freq(1) sidebar.

### 5.2 Oscilloscope Screen Interaction & Scaling
- Full 1-2-5 scale switching:
  - Volts/Div: 10mV, 20mV, 50mV, 100mV, 200mV, 500mV, 1.00V, 2.00V, 5.00V per division.
  - Timebase: 50.0µs, 100.0µs, 200.0µs, 500.0µs, 1.000ms, 2.000ms, 5.000ms per division.
- Gesture and Screen Manipulation:
  - Rotary knobs draggable or scrollable.
  - Pinch horizontally on screen to expand/compress Timebase.
  - Pinch vertically on screen to expand/compress active channel Volts/Div.
  - Drag waveform directly to adjust vertical/horizontal offset position.
  - Double-tap screen to execute Auto-Scale.
  - Touch Cursors (Cursor X1, X2) draggable to directly measure Δt and compute φ on screen.

### 5.3 Realistic Breakdown & Failure Engine
Implement the 5 physical failure conditions detailed in [HARDWARE_SPECS.md](file;file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/virtual-lab/docs/HARDWARE_SPECS.md):
1. Scope Ground Clip Short: CH1/CH2 black alligator clip attached to active potential -> ground short, waveform collapses to 0V, procedural arc spark particle flash.
2. DMM Current Fuse Blow: HP 34401A in Current mode connected across voltage source -> internal 3A 250V ceramic fuse blows with audible pop, display reads 0.000A / OVERLOAD, user must open virtual rear compartment to replace fuse.
3. Resistor Thermal Destruction: DC or AC power P = V_rms² / R > 0.25 W -> procedural rising grey smoke plume, resistor body darkens to charred black, circuit opens (R = ∞).
4. Electrolytic Capacitor Rupture: Reverse polarity DC bias > 1.5 V applied to 1.0 µF or 2.2 µF electrolytic C -> audible rupture pop, ruptured top visual, short/open circuit state.
5. Power Supply Overcurrent: Siglent output shorted -> automatic mode flip from CV (green) to CC (red), voltage collapses to 0.00 V.

### 5.4 Procedural Web Audio Synthesizer
Zero audio asset downloads. Synthesize all mechanical and electrical sounds via Web Audio API:
- Toggle switch / pushbutton: Dual-pulse impulse buffer (50Hz + 1.2kHz damped decay).
- Rotary detents: 2.5kHz transient click (8ms).
- Relay switching: Double micro-click (15ms spacing).
- Fuse blow / capacitor pop: Bandpass noise burst (800Hz - 4kHz) with steep exponential decay.

### 5.5 Lab 7 Module & Worksheet Auto-Evaluator
- Collapsible bottom drawer containing interactive Tables 7.1, 7.2, and 7.3.
- Evaluator auto-checks student readings against the theoretical formulas and ground-truth values in [LAB7_GUIDE_CONDENSED.md](file;file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/virtual-lab/docs/LAB7_GUIDE_CONDENSED.md).
- Accurately detects and explains the pedagogical anomaly from photo 10 (measuring across the generator instead of the capacitor yielding 10.1 V_p-p and φ = 0°).

---

## 6. VERIFICATION CRITERIA
Before concluding, verify:
1. Console cleanliness: Zero unhandled exceptions or failed network calls on loading [index.html](file;file:///Users/3rapat/student/internship/CODEFIN/project/cwms/vahalla-wealth/private-docs/other-project/uni-work/engineering-problem/electrical-engineering-lab/virtual-lab/index.html).
2. Canvas rendering: Dual traces render smoothly at 60 FPS with accurate graticule tick alignment.
3. Touch & scaling: Gestures and knob adjustments change Volts/Div and Timebase seamlessly.
4. Netlist connectivity: Wiring between instrument terminals and breadboard holes correctly updates live circuit state.
5. Failure modes: All 5 failure events trigger correct audio-visual and circuit responses with valid reset/repair paths.
6. Auto-evaluator: Grades match theoretical values within realistic component tolerances (±5% R, ±10% C).
