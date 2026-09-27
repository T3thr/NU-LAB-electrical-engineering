# Verification record — 22 September 2026

The sections below retain the original baseline. The latest usability results are recorded in the final 27 September section, after the real-bench instrument upgrade.

Executed against the delivered local `index.html` with the already-installed Chrome browser and Playwright. The application itself has no runtime dependencies.

## Results

- 29 dependency-free physics / state-machine checks passed.
- 18 browser interaction checks passed.
- Zero JavaScript exceptions, console errors, failed requests, or external HTTP requests during the recorded desktop session.
- Desktop viewport: 1512 × 1100. Touch viewport: 393 × 852, device scale 2.
- Active scope rendering: 60.00 FPS across 121 animation frames.
- Mean scope draw time: 0.220 ms.
- Local-file navigation through load completion: 166.8 ms in the latest regression run; no claim of literal 0 ms startup.

## Acceptance coverage

| Criterion | Evidence |
| --- | --- |
| Console and loading | Direct local-file load and reload with browser networking disabled; no failed or external requests. |
| Dual traces | Pixel inspection detects both phosphor colors; canvas dimensions and 10 × 8 division geometry verified; frame timing sampled. |
| Controls and gestures | Knob arrows, wheel, pointer drag; waveform position; cursor drag; Auto scale; Run/Stop; Single; native touch pinch in both axes; double-tap. |
| Connectivity | 830 pins; distinct five-hole buses and continuous rails; jack-to-pin drag; manual connection entry; endpoint relocation; removal; part placement; arbitrary parallel-resistor solve. |
| Five faults | Each lesson enables a physically wired source through the UI. State and event responses checked. Numerical recovery checks cover grounded probes and supply shorts; UI repair checks cover fuse servicing and resistor replacement. |
| Evaluator | Every one of the ten worksheet configurations captured from the live model passes. Component-corner checks, phase/delay consistency, blanks, and photo 10 anomaly independently tested. CSV export and persisted reload verified. |
| Curriculum isolation | Native ES-module interface imports successfully. An independently registered DC resistance configuration drives the same meter and reads 1 kΩ. |

## Source reconciliation

The photographed observations are retained verbatim as data. The analytical solver is tested independently against the RC equations using each photographed input amplitude and frequency. These are separate assertions: the test suite does not pretend that all photographed output values equal theoretical predictions.

A finite 50 Ω generator output impedance, 1 MΩ scope inputs, and 10 MΩ meter input produce small, intentional loading corrections. The setup calibrates the loaded input to the prescribed amplitude. The photo 10 setup puts both probes on the generator, giving 10.1 Vpp and zero relative phase. Correctly positioned series-capacitor probes give approximately 6.11 Vpp and −52.3° for a 10 Vpp input.

Damage is modeled with the instantaneous teaching thresholds: 3 A fuse current, 0.25 W resistor power, and 1.5 V reverse electrolytic DC bias. Supply current limits are solved before fuse decisions, so a 0.5 A limited source does not blow the 3 A fuse.

## Reproducibility and limits

Run `node tests/physics.test.cjs`. For browser regression, point `EE_PLAYWRIGHT_PATH` at an already-installed Playwright package and run `node tests/browser.test.cjs`. The exact per-check report is `output/playwright/verification.json`; desktop, touch, and worksheet captures and CSV are in the same folder.

Testing used Chrome and Chrome touch emulation, not separate Safari/Firefox engines or physical touch hardware. Analog transient startup, thermal-time integration, nonlinear component behavior, and full instrument firmware are outside the implemented linear teaching model. See the README for the model contract and limitations.

## Thai / English interface

`tests/language.test.cjs` verifies Thai as the fresh-session default; switching from the navbar and worksheet header; persistence after reload; unchanged wiring, generator settings, damage state, and worksheet input; translation of newly generated grading and fuse messages; repeated round trips between languages; mobile availability without horizontal overflow; and toggling when browser storage is blocked. No page errors or failed requests were observed. The navbar remains visible while scrolling. Translation changes presentation only; electrical state and raw instrument option values are preserved.

## 3D simulator upgrade

`tests/scene.test.cjs` passed 16 scenarios against actual WebGL in Chrome: entry and shared circuit state; camera orbit, pan, zoom and keyboard movement; terminal projection and breadboard ray picking; live click/drag wiring and cable removal; component placement; original instrument controls and worksheets in the scene; damage effects; bounded camera persistence and 2D restoration; frame pacing; WebGL context loss/recovery; Thai/English switching; mobile touch gestures; and a working 2D fallback without WebGL.

The recorded scene ran at 60.00 FPS with 314 draw calls and a mean CPU render-submission duration of 0.750 ms. This duration is not GPU completion time. No page or console errors, failed requests, or external requests occurred. Physics and original browser regressions were rerun after the upgrade: all 29 and 18 checks passed respectively.

See [the upgrade record](UPGRADE_3D_SIMULATOR.md) for implementation details, controls, limitations and reproduction commands. Machine-readable results and scene screenshots are in `output/playwright/scene-verification.json` and the adjacent `scene-*.png` files. Performance is specific to the tested Chrome environment; touch tests use emulation, not physical mobile hardware.

## Gameplay upgrade — 23 September 2026

The upgraded local-file application passed 89 discrete cases: 29 physics, 18 original browser interactions, 16 WebGL scene scenarios, 17 campaign scenarios, and 9 interaction edge cases. The separate Thai/English suite also passed. No page exceptions, console errors, failed requests, or external HTTP requests were recorded in these browser runs.

The campaign regression plays all 18 steps using actual circuit edits and measurements, including the six-frequency sweep and the photo 10 probe error. It verifies that incorrect wiring and guessed readings cannot unlock progress, retry restores only the current checkpoint, reload resumes progress, and exported reports contain 11 measurement records with units. Additional checks exercise both Ctrl and Cmd undo, native input editing, grouped mesh-knob gestures, board relocation without electrical changes, damage reversal, per-instrument controls, and mobile manual pin entry.

The edge-case suite covers cable hit testing around controls, selected-wire visibility, immediate rotation previews, cancelled and occupied drops, cable clipping after nested scrolling, frozen-acquisition undo/redo, redo invalidation, dynamic dialog translations, restored board position as the undo baseline, reduced motion, and unavailable local storage.

The final scene run includes live CH1/CH2 pixels when the 2D scope panel is hidden on mobile, along with touch camera gestures and context loss/recovery. It measured 60.00 FPS, 316 draw calls, and 0.890 ms mean CPU render-submission duration. The duration does not measure GPU completion, and the frame-rate result applies to the tested Chrome environment.

Full-page screenshots and machine-readable results are in `output/play-game/`; scene results remain in `output/playwright/scene-verification.json`. The develop-web-game action runner also captured the canvas and actual `render_game_to_text()` state in `output/play-game/skill-chrome/`. Browser automation uses an existing external development runtime; no runtime dependencies were added to the application.

Visual review covered the clean 2D bench, focused assembly desk, snap preview, individual scope controls and mobile mission layout. Mobile coverage is Chrome touch emulation, not physical-device testing. Safari and Firefox were not verified in this run. See [the gameplay upgrade record](UPGRADE_GAMEPLAY_2026-09-23.md) for controls, implementation changes and remaining simulation boundaries.

## Navigation and lead-spacing upgrade — 24 September 2026

Passed 100 cases: 11 new navigation/spacing scenarios, 29 physics, 18 original browser interactions, 16 scene scenarios, 17 campaign scenarios, and 9 interaction edge cases. The separate language suite also passed. No page/console/network errors or external HTTP requests were recorded in these browser runs.

New coverage verifies exact camera restoration after instrument switching, Escape while editing a control, closing partway through a focus animation, inspection/arrangement/assembly return, and reload during inspection. Movement checks cover fixed eye height, all four front-aisle bounds, normalized diagonal speed, and head look/optical zoom without body displacement. Placement checks cover visible pitch/mm selection, actual snapped netlist endpoints, bracket adjustment, rotation, occupied/outside rejection, undoable resizing, language preservation and mobile layout.

The scene regression measured 60.00 FPS, 316 draw calls and 0.416 ms mean CPU render-submission duration in the tested Chrome environment. It is not a GPU-completion measurement or a universal performance guarantee. Testing remains Chrome plus touch emulation; physical mobile devices and other engines were not tested.

See [the 24 September upgrade log](UPGRADE_NAVIGATION_2026-09-24.md). The new machine-readable report, screenshots and action-runner state are in `output/upgrade-2026-09-24/`; original regressions retain their normal output locations. The temporary skill-runner copy selects the live 3D canvas after entry and takes a composited screenshot for WebGL so the capture does not show a hidden 2D canvas.

## Real-bench fidelity upgrade - 27 September 2026

Passed **129 distinct checks**: 29 original physics checks, 15 additional instrument firmware checks, 14 new real-bench browser scenarios, 18 original browser scenarios, 16 scene scenarios, 17 campaign scenarios, 9 interaction edge cases and 11 navigation/spacing scenarios. The separate Thai/English suite and native ES-module Probe Comp smoke check also passed. The firmware command reruns the original 29 checks; they are counted only once in this total.

The ten Lab 7 benchmark configurations and their theoretical loading corrections still pass. `js/core/circuit-solver.js` was not modified. Probe Comp and non-50% square-wave duty use a separate adapter that superposes solutions from the existing nodal solver. Independent 300 Hz and 1 kHz sources, calibration loading and an earth-short fault are tested. A direct 1 megohm calibration input measures 1000 Hz and approximately 3.011 Vpp with the documented finite-harmonic model.

The actual front-panel browser actions verify Shift/Menu, D: SYS MENU, OUT TERM and pending HIGH Z until Enter; numeric unit entry; selected-digit rotary adjustment; committed-value undo/redo; independent scope knobs; cursor delay/phase; Entry push selection; measurements; armed Single acquisition; and calibration wiring. Firmware checks also cover menu cancellation, invalid entries, fixed 50-ohm source resistance, factor-of-two calibration mismatch, duty cycle, trigger slope/source and Default Setup. The 18-step campaign now completes through the High-Z setup ritual and still exports 11 records.

Tests launch `index.html` directly as a local file, with networking disabled in the new real-bench suite. Recorded browser suites report no runtime exceptions, console errors, failed assets or external HTTP requests. The new report is `output/real-bench/verification.json`; its screenshots include the High-Z menu, desktop and mobile panels, cursor phase, Probe Comp and standing bench. Prior suites retain their usual output locations.

Visual review covered the 1512-by-1100 desktop and 393-by-852 emulated-touch layouts, visible softkeys/controls, live trace pixels and the nonblank WebGL scene. Final scene measurement: 60.00 FPS, 320 draw calls and 0.908 ms mean CPU render submission. This is not GPU completion time or a guarantee for other hardware. Chrome was tested; Safari, Firefox and physical mobile devices were not.

Reproduce with `node tests/physics.test.cjs`, `node tests/instrument-firmware.test.cjs`, and `EE_PLAYWRIGHT_PATH=/absolute/path/to/playwright node tests/real-bench.test.cjs`, followed by the existing browser, scene, play-game, interaction-edges, navigation-spacing and language test scripts. Browser tooling is an external development dependency, not an application dependency. See [the implementation and model boundaries](UPGRADE_REAL_BENCH_2026-09-27.md) for the supported firmware subset, teaching scale ranges, deterministic acquisition approximations and probe assumptions.

## Header, guidance and contextual help - 27 September 2026

Passed **140 distinct checks**: the previous 129 plus 11 new UX scenarios in `tests/bench-ux.test.cjs`. The separate language suite also passed. The original physics/firmware, browser, WebGL, full campaign, interaction-edge, navigation/spacing and real-bench checks remain covered. There were no recorded page exceptions, console errors, failed assets or external network requests.

New assertions compare the exact header and action rectangles across repeated language switches and verify unchanged desktop instrument geometry. Tests enter and leave 3D from a scrolled page, exercise mission/assembly/modal transitions, wheel the locked background and confirm scroll restoration. Floating mission reachability, collapse state, precise source identification in both 2D and 3D, state-neutral hover help, and touch inspection are exercised through actual browser interactions. Mobile overflow/header checks cover widths of 320, 393 and 768 pixels.

The language contract now keeps physical instrument legends and displays, including `FUSE OPEN`, in hardware English. The surrounding course guidance, event log, worksheets and contextual explanations remain bilingual. The language regression asserts stable instrument text and translated fault events, rather than expecting the physical display to resize with its translation.

Screenshots were inspected for source-port highlighting, the expanded floating mission, the scope help popover, touch help, live WebGL and visible clipped assembly leads. The source test verifies the highlighted physical jack, matching port preview and explicit navigation to the instrument. The full campaign still completes all 18 steps and exports 11 readings.

Final timing: 2D 60.00 FPS with 0.353 ms mean scope draw time; 3D 60.003 FPS with 1.254 ms mean CPU render submission and 320 draw calls. Earlier runs also capped an empty page at 30 FPS. A new development-only baseline helper measures the browser's available animation cadence before loading the app; final reports show a 60 FPS baseline and pass the original 50/45 FPS thresholds. See [the frame-budget explanation](UPGRADE_BENCH_UX_2026-09-27.md#frame-pacing) for the capped-environment criterion. These figures are not GPU completion time or hardware-independent guarantees.

The new report, source/help screenshots and final per-suite logs are in `output/playwright/bench-ux/`; existing suites keep their original output locations. Verification uses Chrome and emulated mobile touch, not Safari, Firefox or physical mobile devices. No runtime dependencies or server were added. See [the UX upgrade record](UPGRADE_BENCH_UX_2026-09-27.md).
