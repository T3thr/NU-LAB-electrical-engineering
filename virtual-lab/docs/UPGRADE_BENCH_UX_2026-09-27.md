# Bench usability upgrade - 27 September 2026

## Problems addressed

Real-user feedback reported a moving or partly hidden header, excessive scrolling to read instructions, unclear cable origins, missing instrument explanations and background scrolling under dialogs. The supplied screenshot showed the 3D surface covering part of the underlying page while the navigation header had left the viewport.

The header had several competing rules: language-specific height/wrapping, sticky positioning in 2D, and relative positioning in 3D/assembly. The scene offset used header height even when scrolling had moved the actual header. Font selection also changed between Thai and English, shifting instrument sizes by a few pixels.

## Delivered changes

- One fixed viewport header across 2D, 3D and assembly. Its dimensions depend on viewport width, not language. A stable two-row toolbar is used on narrow screens, with named accessible icon controls. Language and contextual help stay in the same positions.
- Shared fonts, reserved heading/mission-introduction space and consistent instrument action dimensions. All four physical instrument panels retain hardware-language legends; their explanations are bilingual. Main desktop instrument rectangles are compared before and after language changes.
- Opaque instrument drawers and explicit overlay ordering: scene, assembly, clipped cables, failure effects, floating guide, header and contextual assistance. Native modal dialogs remain in the browser top layer.
- A floating, collapsible mission panel retains the same live validation and answer fields. It remains available while scrolling 2D or switching to 3D/assembly. The assembly default is on the right on desktop to avoid the component tray. Mobile assembly reserves enough scroll space to reach content above an expanded guide. A compact lab companion is available when no mission is active.
- Hovering or keyboard-focusing a terminal identifies the instrument model and exact port, highlights the actual front-panel jack, briefly pulses its ring and shows a labeled port preview. An explicit Show this instrument action opens the live panel; hover alone does not navigate, scroll or edit the circuit. 3D terminal picking uses the same explanation and highlight.
- Concise contextual descriptions for instrument parameters, readouts, annunciators, channel settings, dynamic softkeys, knobs, probe terminals, breadboard controls and common actions. Scope softkey explanations change with the current menu, including DC/AC/GND coupling, probe scaling, cursor modes and trigger modes.
- The header's `?` inspection mode gives touch users the equivalent of hover. Tapping an instrument control explains it without activating it. Pointer, wheel and keyboard changes to inspected controls are intercepted before the instrument/history handlers. Turn inspection off to resume normal operation. Desktop hover and visible keyboard focus work without entering inspection mode.
- A shared scroll lock covers every open native dialog and both full-screen work modes. Closing a dialog does not unlock an underlying 3D/assembly mode; leaving the final locked surface restores the saved page position. Dialog content can still scroll.

## Implementation boundaries

`css/bench-ux.css` defines the stable viewport/overlay geometry. `js/core/bench-ux.js` owns explanations, source identification, touch inspection, the free-play companion and scroll locking. These are presentation-only; they neither serialize electrical state nor replace circuit calculations.

Mission mounting now keeps its panel outside scrollable or inert work surfaces. The 3D renderer accepts an optional highlighted terminal from the assistance layer. The physical solver, instrument firmware, saved circuit format and 100-step history are unchanged.

The help layer explains controls and signals, not blank decorative space or individual text glyphs. Breadboard and 3D canvas interactions use their existing picking models. This is not a replacement for the full course workbook or an implementation of additional instrument firmware.

## Verification

Run with the already-installed development runtime:

```sh
node tests/instrument-firmware.test.cjs
EE_PLAYWRIGHT_PATH=/absolute/path/to/playwright node tests/bench-ux.test.cjs
```

The UX runner covers eleven scenarios: stable header geometry, stable desktop instrument geometry, repeated scrolled 2D/3D transitions, modal wheel locking and scroll restoration, nested overlay locks, physical source highlighting/navigation, floating mission reachability, 3D source hover, state-neutral desktop help, mobile inspection and 320/393/768-pixel layouts, and clean offline loading. Its report and screenshots are in `output/playwright/bench-ux/`. Final per-suite console logs are saved there as `*-final.log`.

The full existing language, browser, scene, campaign, interaction-edge, navigation/spacing and real-bench suites are rerun. The campaign traverses all 18 steps and records all 11 measurements. See `VERIFICATION.md` for final results.

### Frame pacing

Earlier runs scheduled even an empty Chrome page at approximately 30 animation frames per second. The original fixed 50/45 FPS assertions therefore failed independently of lab complexity. `tests/frame-budget.cjs` now measures an empty-page baseline before application loading. The existing thresholds remain the upper targets; a capped environment must sustain at least 90% of its available baseline, with an absolute 25 FPS floor. Reports retain the baseline, threshold, actual FPS and rendering cost. A 30 FPS lab on a 60 FPS baseline still fails. The final run returned to a 60 FPS empty-page baseline and passed the original 50/45 FPS thresholds: 60.00 FPS for 2D and 60.003 FPS for 3D.

Testing uses Chrome desktop and touch emulation, not physical mobile devices or separate Safari/Firefox engines. No application dependencies, downloads or server were introduced.
