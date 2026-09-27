/* Native ES-module entry point for reuse over HTTP. index.html uses the same
   scoped files as deferred scripts so opening a local file needs no server. */
import './core/circuit-solver.js';
import './core/audio-synthesizer.js';
import './core/cable-physics.js';
import './core/gesture-engine.js';
import './core/failure-engine.js';
import './instruments/siglent-spd3303c.js';
import './instruments/hp-34401a.js';
import './instruments/hp-33120a.js';
import './instruments/digital-oscilloscope.js';
import './workbench/breadboard.js';
import './workbench/component-palette.js';
import './labs/lab-registry.js';
import './labs/lab7/lab7-config.js';
import './labs/lab7/lab7-evaluator.js';
import './labs/lab7/lab7-worksheet.js';
import './core/periodic-sources.js';
import './core/simulation.js';
const { CircuitSolver, Simulation, HP33120A, HP34401A, SPD3303C, DigitalOscilloscope, Breadboard, LabRegistry, Lab7, Lab7Evaluator } = globalThis.EE;
export { CircuitSolver, Simulation, HP33120A, HP34401A, SPD3303C, DigitalOscilloscope, Breadboard, LabRegistry, Lab7, Lab7Evaluator };
