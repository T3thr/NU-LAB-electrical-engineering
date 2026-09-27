# Real-bench instrument upgrade - 27 September 2026

## Delivered behavior

The HP 33120A and DSO-X 2002A now have instrument front panels instead of general-purpose form controls. The same DOM panels operate in the 2D bench and 3D inspection drawer. The application remains an ordered set of local deferred scripts, with no package manager, server, network requests or runtime dependencies.

### HP 33120A

- Freq, Ampl and Offset select the value displayed on the VFD. Left/Right select a decimal digit; the main knob or Up/Down adjusts that digit. Knobs support mouse drag, wheel, touch drag and keyboard arrows.
- Enter Number changes the physical function keys into their printed numeric roles. Freq/Ampl/Offset supply digits 6/7/8; the waveform row supplies 1/2/3/4/5/sign; Single and Recall supply 9/0. Enter Number supplies the decimal point during entry. Left erases a digit. Shift then Enter Number cancels without changing the output.
- Numeric unit keys support Hz/kHz/MHz, Vpp/Vrms and shifted millivolt entry. Signed DC offsets are accepted. Invalid values retain the previous output and light ERROR.
- Shift then Enter (the Menu On/Off legend), Right three times, Down twice, Right, Enter executes the course's HIGH Z ritual. The intermediate displays are `A: MOD MENU`, `D: SYS MENU`, `1: OUT TERM`, `50 OHM`, and `HIGH Z`. The setting is pending until Enter. Up goes back one level; Menu On/Off exits without applying a pending setting. The knob navigates horizontally within a menu level.
- The VFD includes SINE, SQUARE, TRI, HIGH Z, ADDR, ERROR, SHIFT and RMT annunciators. ADDR/RMT remain unlit because no remote interface is modeled.
- Shift + Offset (% Duty) selects square-wave duty. The output includes the resulting DC component and even harmonics. The hardware bounds are 20-80% through 5 MHz and 40-60% above it.
- Prepared Lab 7 reference configurations still start calibrated in Hi-Z to retain benchmark reproducibility. A fresh free-wiring bench and the first mission start in 50 OHM with output off. The campaign now requires Hi-Z before accepting live measurements.

The actual output resistance is always 50 ohms. OUT TERM changes the load calibration, not that resistance. Changing from 50 OHM to HIGH Z doubles the displayed amplitude and offset while preserving the physical output. Entering the same numerical amplitude under the wrong load calibration produces the expected factor-of-two voltage error. For example, 4 Vpp entered in 50 OHM mode gives approximately 8 Vpp into a high-impedance input; 4 Vpp entered in HIGH Z gives approximately 4 Vpp. Finite circuit loading is solved in both cases.

### DSO-X 2002A

- Six buttons directly beneath the bezel correspond to six on-screen softkey labels. Channel, Edge Trigger, Cursors, Measurements and Acquisition keys change this context.
- Entry/Select rotates through menu choices, commits a choice when pressed, and adjusts the selected cursor. A click is a push, not a rotary detent, on this knob.
- CH1 and CH2 have illuminated yellow/green keys, individual V/DIV and Position knobs, channel enable, DC/AC/GND display coupling, inversion and probe scale settings. The physical input remains 1 megohm; the previous misleading internal 50-ohm selector is removed from this model's panel. The simulation's loading API remains available for legacy physics checks and externally terminated experiments.
- Horizontal timebase and position have independent controls. Trigger Level, source, rising/falling slope and Auto/Normal mode are independent. Normal waits and retains the previous acquisition without a qualifying edge. Single arms, waits for an edge and freezes one acquisition. Run/Stop preserves the acquired samples. Auto scale centers DC signals and chooses a live trigger source.
- Meas offers Pk-Pk, Frequency, Period, RMS, Mean, Phase and Delay, with source selection, Add and Clear controls. Results derive from the acquired nodal signal. Cross-channel phase is unavailable for absent signals, incompatible frequencies or mixed-frequency signals.
- Cursors supports Manual and Track Waveform, source selection, X1/X2/Y1/Y2 and linked X cursors. Select X1 or X2 with softkeys 5/6 and turn Entry to position each cursor. The readout reports signed delta time, reciprocal delay, voltage difference and relative phase. The lab convention is negative phase for CH2 lag: `phi = -360 * f * (X2 - X1)`.
- The display has acquisition/trigger state, channel scale badges, timebase, horizontal delay, a 10 by 8 graticule, 0.2-division center ticks, measurements, cursor results and the active softkey strip.
- Default Setup resets scope state without modifying components or wiring.

### Probe Comp

`scope.comp` and `scope.compGround` are real terminals in the panel, assembly patch bay, terminal picker and 3D scene. To verify a probe, disconnect its tip from the experimental circuit, connect it to Probe Comp Signal, connect its ground clip to Comp Earth, and press Auto scale. The calibrated model is nominally a 0-3 V, 1 kHz square wave. With a direct 1:1 lead and 1 megohm input, the finite-harmonic reading is approximately 3.01 Vpp.

Calibration is an independent periodic source. A 300 Hz generator can remain on CH1 while CH2 measures the 1 kHz calibrator. Each frequency is solved through the same physical network and source resistances. Attaching a load changes the calibration waveform; grounding its live terminal collapses it and invokes the existing earth-short fault. There is no synthetic calibration trace substituted on screen.

## Architecture and retained behavior

`js/core/circuit-solver.js` is unchanged. `periodic-sources.js` composes frequency-domain nodal solves for independent sources and non-50% square waves, combining equal-frequency contributions before computing RMS. The normal sine/RC path still uses the original solver's analysis method.

Instrument firmware stays in `hp-33120a.js` and `digital-oscilloscope.js`. `front-panels.js` builds/binds the panel surfaces; `app.js` supplies the shared model. New scope state participates in snapshots. Generator digit/menu/entry previews do not consume undo slots; committing a new electrical value does. Dragging a knob remains one command. Frozen waveforms retain their sample functions when restored. `js/lab.js` imports the new periodic-source adapter for independent curriculum reuse.

Standing navigation, exact camera return, breadboard lead pitch, snapped component placement, cable clipping, 100-step undo/redo, Thai/English course text, campaign checkpoints, worksheet grading and all five failure lessons remain functional. Front-panel legends stay in their original hardware language in both course languages. Camera/assembly shortcuts yield while Enter Number is active.

## Evidence and source reconciliation

Course sources inspected:

- `part1/manual-of-lab-instruments/305141_Lab_01.pdf`, pages 31-43, especially Figures 39, 40, 43 and 44 and the procedures on pages 40-43. Figures 39, 43 and 44 were also rendered and inspected visually.
- `part1/manual-of-lab-instruments/305142Lab04oscilloscope.pdf`, calibration practice and the High-Z sequence on pages 11-12.
- `part1/manual-of-lab-instruments/Lab 2 Ex 0.pdf`, graticule, common grounds, phase and generator setup.
- `part1/manual-of-lab-instruments/Lab 2.pdf`, operating and measurement procedures.

Manufacturer references resolve two details which the condensed course instructions could otherwise obscure: [33120A output termination](https://www.keysight.com/us/en/assets/9018-04436/user-manuals/9018-04436.pdf) and [InfiniiVision 2000 X-Series cursor operation](https://www.keysight.com/us/en/assets/9018-03426/user-manuals/9018-03426.pdf). The fixed source resistance and factor-of-two mismatch are also described in [Keysight's output-voltage explanation](https://docs.keysight.com/kkbopen/why-is-the-output-voltage-from-the-keysight-33120a-twice-the-value-i-set-588263382.html).

The ten photographic observations remain unchanged. The tests verify their stored input/configuration and independently compare the nodal output with the RC equations. They do not force noisy or miswired photographic measurements to equal ideal theory. Photo 10 still gives equal traces when both probes measure the source, and the corrected series-capacitor topology gives about 6.11 Vpp and -52.3 degrees at a 10 Vpp input.

## Verification

Run from `virtual-lab`:

```sh
node tests/physics.test.cjs
node tests/instrument-firmware.test.cjs
EE_PLAYWRIGHT_PATH=/absolute/path/to/playwright node tests/real-bench.test.cjs
```

The firmware suite includes the original 29 physics checks and 15 additional checks. The real-bench suite exercises 14 browser scenarios using the actual panel buttons, keyboard and knobs. Its local-file context is offline, and it records page errors, console errors, failed requests and attempted external requests. Results and screenshots are in `output/real-bench/verification.json` and the adjacent PNGs. The existing browser, scene, campaign, interaction-edge, navigation/spacing and language suites are retained with their input actions migrated to the physical keys. See the final totals in `VERIFICATION.md`.

## Explicit model boundaries

- This delivers the requested teaching workflows, not every vendor firmware feature. AM/FM/FSK, burst/sweep, arbitrary memory, remote I/O, self-test, hardware calibration, USB/digital inputs and file save/recall remain outside scope. Their shared numeric keys work in Enter Number; unrelated functions are disabled, and unmodeled menu branches say NOT AVAILABLE.
- The pre-existing teaching timebase range (50 microseconds/div to 5 milliseconds/div) and voltage range (10 millivolts/div to 5 volts/div) are retained. This is not a 70 MHz ADC timing emulator.
- Acquisition Normal renders nodal samples; Peak Detect draws an eight-sample envelope per display interval; High Resolution averages eight nodal samples per display interval. Average exposes its averaging count, but identical deterministic stationary acquisitions average to the same waveform. No random noise, hardware ADC quantization or transient capture history is introduced.
- Probe scaling is a display calibration for voltage at the BNC input. Direct virtual leads are 1:1. The 10:1 setting changes indicated voltage; no physical adjustable probe RC compensation network is modeled. Probe Comp supports verification of amplitude, frequency, channel operation and grounding.
- Calibration uses 61 harmonics with a squared Lanczos window to limit Fourier ringing, a nominal 3 V swing and a modeled 50-ohm source resistance. Its edge speed and source impedance are teaching approximations, not a claim of the calibrator's undocumented hardware specifications. The existing function-generator square-wave approximation remains unchanged at 50% duty.
- Grounding an active node produces a physical short. Multiple clips on the same ideal ground node do not synthesize environmental ground-loop noise.
- Verification uses installed Chrome and emulated mobile touch. Safari, Firefox and physical mobile hardware remain unverified.
