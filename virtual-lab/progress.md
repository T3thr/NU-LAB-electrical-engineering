Original prompt: ปรับปรุงเว็บตาม feedback วันที่ 23 กันยายน 2026: เล่นยาก สายทับ UI ขาด drag/drop animation และ Undo/Redo ต้องการเกมจำลองแล็บ 3D ที่มีด่านตามคู่มือ ตรวจวงจรจริง เริ่มใหม่เฉพาะขั้น ปรับเครื่องมือรายตัวและย้ายเบรดบอร์ดได้ พร้อมบันทึก upgrade log.

## 2026-09-23 — completed upgrade
- Reviewed existing solver, scene, controls and screenshot. Global SVG cable routing causes the reported UI overlap.
- Plan: local labeled patch bay; focused assembly view; component dragging with valid-pin previews; full circuit/scope command history and activity log; per-instrument 3D interactions and board arrangement; Lab 7 checkpoint missions backed by solver.
- Keep original offline physics, Thai/English, worksheets and repair mechanics. No application dependencies.
- Validation will use existing physics/browser suites, focused game regressions and develop-web-game action client with screenshots/state.

## Implemented and exercised
- Added local terminal patch bay with clipped cable layer, automatic lead colors and focused assembly desk. Cable routing no longer crosses instrument buttons/screens.
- Added snapped component drag previews, body dragging, rotate/flip/delete, placement pulses, 3D tabletop board drag, individual live instrument drawers and direct mesh output/knob controls.
- Added 100-command undo/redo (Ctrl/Cmd shortcuts), damage/frozen acquisition snapshots, session action log and JSON export.
- Added three Lab 7 campaign chapters, 18 graph/measurement-validated steps, current-step checkpoint retry, locked chapter progression, saved resume and eleven recorded measurements.
- First gameplay run passed 17 integration scenarios including complete campaign, both shortcut conventions, board arrangement, direct instrument gestures, damage undo and export. Original 29 physics checks and 18 browser checks pass.
- Visual inspection led to a vertical component tray for desktop assembly, matching terminal colors and clip holes around controls. The skill runner requires local Playwright import / Chrome launch settings; its SwiftShader launch was sluggish, so the temporary copy now uses the installed Chrome's normal renderer. The app has no added dependencies.
- Completed final routing/gesture edge cases, mobile manual pin entry, individual instrument and scene regressions, persisted campaign reports, and dynamic Thai/English coverage.
- Final verification: 29 physics, 18 original browser, 16 scene, 17 campaign and 9 interaction edge-case scenarios passed (89 cases), plus the language suite. Browser runs reported no page/console/network errors.
- Fixed live 3D scope textures on mobile when the original 2D scope panel has zero layout width; verified both trace colors under mobile touch emulation. Guide pins now update in the scene instead of remaining baked into the board texture.
- Final scene measurement: 60.00 FPS, 0.890 ms mean CPU render submission, 316 draw calls. These are measurements from the tested Chrome environment, not hardware-independent guarantees.
- Upgrade log: docs/UPGRADE_GAMEPLAY_2026-09-23.md. Verification details: docs/VERIFICATION.md. Final interaction screenshots and JSON exports: output/play-game/.
- Boundaries remain documented: linear RC teaching model, procedural seated 3D, session-only undo/log, Chrome emulated mobile verification; no Safari/Firefox or physical-device certification.

## 2026-09-24 — view memory, lead pitch and character movement
- Request: return to the previous view after closing instruments; adjustable component lead spacing; WASD character movement restricted to the aisle in front of the bench.
- Implemented exact view snapshots across instrument switching, close/Escape, interrupted focus animation and reload; inspection views retain an explicit return action.
- Replaced normal orbit navigation with a fixed-height standing character bounded to the front aisle. Look rotates about the eye, wheel changes field of view, diagonal movement is normalized. Inspection tools remain separate from walking.
- Added per-part lead pitch selectors, compact free-play defaults, physical millimeter preview, bracket-key adjustment during drag, and undoable resizing after placement. Mission Auto mode retains the documented guide spacing.
- Initial new integration run: all 11 navigation/spacing cases passed; physics 29 passed. Screenshot review found the pointer card hid the endpoint dimension; moved it above the placement cursor before final regression.
- Final verification completed: 11 new integration scenarios, 29 physics, 18 browser, 16 scene, 17 campaign and 9 interaction edge cases (100 total), plus the language suite. All passed with clean browser error/network reports.
- Inspected final standing-view, adjusted lead preview and skill-runner WebGL screenshots. Runner selection was corrected in its temporary development copy to reacquire the 3D canvas after entering, rather than capturing the previously selected hidden 2D board.
- Documentation completed in docs/UPGRADE_NAVIGATION_2026-09-24.md, README.md and docs/VERIFICATION.md. No remaining implementation tasks for this request. Bounds and package/lead modeling assumptions are documented; physical-device and cross-engine verification remain outside this run.

## 2026-09-27 - real-bench instrument fidelity
- Studied the four course manuals, rendered the instrument panel/menu figures, and reconciled output termination and cursor behavior with manufacturer references.
- Replaced generic generator fields with the shared physical numeric keypad, parameter selection, digit cursor, rotary adjustment, VFD annunciators and pending/committed three-level firmware menus. Added the taught High-Z ritual to the first mission and free-wiring workflow.
- Kept the generator's source resistance fixed at 50 ohms. Changing OUT TERM preserves physical output while rescaling displayed values; entering the same amplitude under the wrong load produces the factor-of-two mismatch.
- Rebuilt the scope with six contextual softkeys, Entry/Select, independent vertical/horizontal controls, edge trigger, measurement menus, manual/track cursors, acquisition controls and a labeled 10-by-8 graticule. Shared live panels work in 2D and 3D inspection.
- Added physically connected 1 kHz nominal 3 Vpp Probe Comp terminals and independent-frequency nodal superposition without editing circuit-solver.js. Updated live 3D instrument textures and terminal picking.
- Preserved command history, frozen acquisitions, camera return, placement, campaign grading and damage behavior. Fixed capture-phase camera shortcuts interfering with generator numeric entry.
- Verification: all original 100 checks plus 15 new firmware checks and 14 new real-bench browser scenarios passed (129 distinct checks), plus the language suite and native module smoke check. Ten benchmark configurations remain covered by the physics suite. Browser reports contain no page/console/network errors or external requests.
- Inspected desktop/mobile instrument panels and nonblank live WebGL traces. Final scene measurement: 60.00 FPS, 0.908 ms mean CPU render submission, 320 draw calls in the tested Chrome environment.
- Upgrade details and deliberate model limits: docs/UPGRADE_REAL_BENCH_2026-09-27.md. Final verification: docs/VERIFICATION.md. New screenshots/report: output/real-bench/. No application runtime dependencies or server added.

## 2026-09-27 - user-feedback UX corrections
- Traced the unstable header to conflicting sticky/relative mode rules, language-specific wrapping and different inherited fonts. Implemented one fixed header boundary, stable mobile actions, shared font metrics and unchanged physical-panel legends.
- Added a floating collapsible mission panel in every work mode and a compact free-play lab companion. Kept the assembly guide out of the desktop part tray and reserved mobile scroll space for content behind an expanded guide.
- Added bilingual contextual help for instrument controls, values, terminals and context-sensitive softkeys. Desktop hover/keyboard focus explains controls; the touch inspection toggle prevents accidental electrical edits while seeking help.
- Added exact source model/port previews, a short physical-jack pulse, visible origin labels and explicit navigation to the live instrument. 3D picking uses the same source identity.
- Locked background scrolling while dialogs or full-screen work modes are open, preserving the original page position and handling nested locks. Made drawers opaque and retained clipped cables/failure effects in the correct overlay order.
- Final verification: 140 distinct checks plus the language suite passed, with clean console/network reports. All 18 campaign steps and 11 measurement records remain valid. Inspected desktop/mobile help, stable headers, source highlights, floating instructions and assembly wiring screenshots.
- Measured empty-page frame cadence after early environment-capped 30 FPS runs. Final 2D/3D runs achieved about 60 FPS and passed the original performance thresholds; baseline-aware regression details are documented.
- Details: docs/UPGRADE_BENCH_UX_2026-09-27.md and docs/VERIFICATION.md. New regression report, screenshots and per-suite logs: output/playwright/bench-ux/. Safari/Firefox and physical touch hardware remain unverified.
