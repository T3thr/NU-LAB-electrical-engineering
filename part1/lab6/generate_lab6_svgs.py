#!/usr/bin/env python3
"""
Generate realistic high-resolution digital oscilloscope SVGs for Lab 6
Following virtual-lab/js/instruments/digital-oscilloscope.js specifications
and part1/DESIGN_SYSTEM.md standards.
"""

import math
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "result")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_scope_svg(
    filename,
    title,
    ch1_signal=None,  # func(t) -> voltage
    ch2_signal=None,  # func(t) -> voltage
    time_div=0.0005,  # seconds per division
    ch1_vdiv=1.0,     # volts per division
    ch2_vdiv=1.0,     # volts per division
    ch1_offset=0.0,   # div offset (positive moves up)
    ch2_offset=0.0,   # div offset
    measurements=None,# dict of labels -> values
    trigger_status="Trig'd",
    sample_rate="1.00 GSa/s",
    time_offset=0.0,
):
    W = 880
    H = 560
    
    # Graticule area: 10 divisions wide, 8 divisions high
    # Let grid be 800x400 px, so 1 div = 80px wide, 50px high
    gx = 40
    gy = 50
    gw = 800
    gh = 400
    x_center = gx + gw / 2 # 440
    y_center = gy + gh / 2 # 250
    
    dx_div = gw / 10 # 80 px
    dy_div = gh / 8  # 50 px
    
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="auto" style="background:#080E18; font-family:\'SF Mono\', Consolas, monospace;">')
    svg.append('<defs>')
    # Glow filter for CH1 (Yellow)
    svg.append('  <filter id="glow-ch1" x="-20%" y="-20%" width="140%" height="140%">')
    svg.append('    <feGaussianBlur stdDeviation="1.8" result="blur"/>')
    svg.append('    <feMerge>')
    svg.append('      <feMergeNode in="blur"/>')
    svg.append('      <feMergeNode in="SourceGraphic"/>')
    svg.append('    </feMerge>')
    svg.append('  </filter>')
    # Glow filter for CH2 (Cyan)
    svg.append('  <filter id="glow-ch2" x="-20%" y="-20%" width="140%" height="140%">')
    svg.append('    <feGaussianBlur stdDeviation="1.8" result="blur"/>')
    svg.append('    <feMerge>')
    svg.append('      <feMergeNode in="blur"/>')
    svg.append('      <feMergeNode in="SourceGraphic"/>')
    svg.append('    </feMerge>')
    svg.append('  </filter>')
    # Dark display gradient
    svg.append('  <radialGradient id="screen-grad" cx="50%" cy="50%" r="70%">')
    svg.append('    <stop offset="0%" stop-color="#0E1A26"/>')
    svg.append('    <stop offset="100%" stop-color="#060C14"/>')
    svg.append('  </radialGradient>')
    svg.append('  <clipPath id="screen-clip">')
    svg.append(f'    <rect x="{gx}" y="{gy}" width="{gw}" height="{gh}"/>')
    svg.append('  </clipPath>')
    svg.append('</defs>')
    
    # Outer frame
    svg.append(f'<rect x="0" y="0" width="{W}" height="{H}" fill="#0A0F1D"/>')
    svg.append(f'<rect x="12" y="12" width="{W-24}" height="{H-24}" rx="10" fill="#080E18" stroke="#1E293B" stroke-width="2"/>')
    
    # Screen inner background
    svg.append(f'<rect x="{gx}" y="{gy}" width="{gw}" height="{gh}" rx="4" fill="url(#screen-grad)" stroke="#1F2D3D" stroke-width="1.5"/>')
    
    # Top Status Bar
    svg.append(f'<g transform="translate({gx}, 18)">')
    # Logo / Title
    svg.append('  <text x="0" y="16" fill="#94A3B8" font-size="12" font-weight="700" letter-spacing="1">RIGOL / VIRTUAL DSO-X 2000</text>')
    # Trigger Status Pill
    trig_color = "#10B981" if trigger_status in ["Trig'd", "Auto"] else "#EF4444"
    svg.append(f'  <rect x="230" y="4" width="68" height="18" rx="3" fill="{trig_color}" opacity="0.2"/>')
    svg.append(f'  <rect x="230" y="4" width="68" height="18" rx="3" fill="none" stroke="{trig_color}" stroke-width="1"/>')
    svg.append(f'  <text x="264" y="17" fill="{trig_color}" font-size="11" font-weight="800" text-anchor="middle">{trigger_status}</text>')
    # Trigger marker T
    svg.append('  <polygon points="440,24 435,16 445,16" fill="#F59E0B"/>')
    svg.append('  <text x="440" y="12" fill="#F59E0B" font-size="10" font-weight="700" text-anchor="middle">T</text>')
    # Sample Rate & Memory
    svg.append(f'  <text x="650" y="16" fill="#64748B" font-size="11">SR: <tspan fill="#94A3B8">{sample_rate}</tspan> · 14.0Mpts</text>')
    svg.append(f'  <text x="{gw}" y="16" fill="#94A3B8" font-size="11" text-anchor="end">{title}</text>')
    svg.append('</g>')
    
    # Graticule Lines (10x8)
    svg.append('<g stroke="#1F2F3E" stroke-width="0.75" opacity="0.85">')
    # Vertical lines
    for i in range(11):
        x = gx + i * dx_div
        svg.append(f'  <line x1="{x:.1f}" y1="{gy}" x2="{x:.1f}" y2="{gy+gh}"/>')
    # Horizontal lines
    for j in range(9):
        y = gy + j * dy_div
        svg.append(f'  <line x1="{gx}" y1="{y:.1f}" x2="{gx+gw}" y2="{y:.1f}"/>')
    svg.append('</g>')
    
    # Sub-division tick marks on center axes (0.2 div)
    svg.append('<g stroke="#475569" stroke-width="1">')
    # Center horizontal axis ticks (50 ticks across 10 divs)
    for i in range(51):
        x = gx + i * (dx_div / 5)
        tick_h = 6 if i % 5 == 0 else 3
        svg.append(f'  <line x1="{x:.1f}" y1="{y_center - tick_h}" x2="{x:.1f}" y2="{y_center + tick_h}"/>')
    # Center vertical axis ticks (40 ticks across 8 divs)
    for j in range(41):
        y = gy + j * (dy_div / 5)
        tick_w = 6 if j % 5 == 0 else 3
        svg.append(f'  <line x1="{x_center - tick_w}" y1="{y:.1f}" x2="{x_center + tick_w}" y2="{y:.1f}"/>')
    svg.append('</g>')
    
    # Ground reference arrows on left
    if ch1_signal is not None:
        ch1_gnd_y = y_center - ch1_offset * dy_div
        svg.append(f'<polygon points="{gx-2},{ch1_gnd_y} {gx-12},{ch1_gnd_y-6} {gx-12},{ch1_gnd_y+6}" fill="#F59E0B"/>')
        svg.append(f'<text x="{gx-7}" y="{ch1_gnd_y+3.5}" fill="#080E18" font-size="8" font-weight="900" text-anchor="middle">1</text>')
    
    if ch2_signal is not None:
        ch2_gnd_y = y_center - ch2_offset * dy_div
        svg.append(f'<polygon points="{gx-2},{ch2_gnd_y} {gx-12},{ch2_gnd_y-6} {gx-12},{ch2_gnd_y+6}" fill="#06B6D4"/>')
        svg.append(f'<text x="{gx-7}" y="{ch2_gnd_y+3.5}" fill="#080E18" font-size="8" font-weight="900" text-anchor="middle">2</text>')
    
    # Plot waveforms
    svg.append('<g clip-path="url(#screen-clip)">')
    
    # Waveform CH1
    if ch1_signal is not None:
        pts = []
        steps = 1000
        for s in range(steps + 1):
            px = gx + (s / steps) * gw
            # Map px to time: center is time_offset, full span is 10 * time_div
            t = (s / steps - 0.5) * 10 * time_div + time_offset
            v = ch1_signal(t)
            py = y_center - ((v / ch1_vdiv) + ch1_offset) * dy_div
            # Clamp to prevent runaway
            py = max(gy - 40, min(gy + gh + 40, py))
            pts.append(f"{px:.1f},{py:.1f}")
        
        path_data = "M " + " L ".join(pts)
        svg.append(f'  <path d="{path_data}" fill="none" stroke="#F59E0B" stroke-width="2.4" filter="url(#glow-ch1)"/>')
    
    # Waveform CH2
    if ch2_signal is not None:
        pts = []
        steps = 1000
        for s in range(steps + 1):
            px = gx + (s / steps) * gw
            t = (s / steps - 0.5) * 10 * time_div + time_offset
            v = ch2_signal(t)
            py = y_center - ((v / ch2_vdiv) + ch2_offset) * dy_div
            py = max(gy - 40, min(gy + gh + 40, py))
            pts.append(f"{px:.1f},{py:.1f}")
        
        path_data = "M " + " L ".join(pts)
        svg.append(f'  <path d="{path_data}" fill="none" stroke="#06B6D4" stroke-width="2.2" filter="url(#glow-ch2)"/>')
    
    svg.append('</g>')
    
    # Bottom Status Bar & Controls (y: 462 to 542)
    svg.append(f'<g transform="translate({gx}, 462)">')
    
    # Channel 1 badge
    if ch1_signal is not None:
        svg.append('  <rect x="0" y="0" width="130" height="26" rx="4" fill="#F59E0B" opacity="0.15"/>')
        svg.append('  <rect x="0" y="0" width="130" height="26" rx="4" fill="none" stroke="#F59E0B" stroke-width="1.2"/>')
        v_str = f"{ch1_vdiv:.2f} V" if ch1_vdiv >= 1.0 else f"{int(ch1_vdiv*1000)} mV"
        svg.append(f'  <text x="8" y="17" fill="#F59E0B" font-size="11" font-weight="800">1</text>')
        svg.append(f'  <text x="24" y="17" fill="#FDE68A" font-size="11" font-weight="700">CH1: {v_str}/div</text>')
    
    # Channel 2 badge
    if ch2_signal is not None:
        svg.append('  <rect x="140" y="0" width="130" height="26" rx="4" fill="#06B6D4" opacity="0.15"/>')
        svg.append('  <rect x="140" y="0" width="130" height="26" rx="4" fill="none" stroke="#06B6D4" stroke-width="1.2"/>')
        v2_str = f"{ch2_vdiv:.2f} V" if ch2_vdiv >= 1.0 else f"{int(ch2_vdiv*1000)} mV"
        svg.append(f'  <text x="148" y="17" fill="#06B6D4" font-size="11" font-weight="800">2</text>')
        svg.append(f'  <text x="164" y="17" fill="#A5F3FC" font-size="11" font-weight="700">CH2: {v2_str}/div</text>')
    
    # Timebase badge
    t_start_x = 280 if (ch1_signal is not None and ch2_signal is not None) else 140
    if time_div >= 0.001:
        t_str = f"{time_div*1000:.1f} ms"
    else:
        t_str = f"{time_div*1e6:.0f} µs"
    
    svg.append(f'  <rect x="{t_start_x}" y="0" width="135" height="26" rx="4" fill="#3B82F6" opacity="0.15"/>')
    svg.append(f'  <rect x="{t_start_x}" y="0" width="135" height="26" rx="4" fill="none" stroke="#3B82F6" stroke-width="1.2"/>')
    svg.append(f'  <text x="{t_start_x+8}" y="17" fill="#93C5FD" font-size="11" font-weight="700">TIME: {t_str}/div</text>')
    
    # Trigger badge
    trig_x = t_start_x + 145
    svg.append(f'  <rect x="{trig_x}" y="0" width="125" height="26" rx="4" fill="#1E293B" stroke="#334155" stroke-width="1"/>')
    svg.append(f'  <text x="{trig_x+8}" y="17" fill="#94A3B8" font-size="11">Trig: <tspan fill="#F59E0B">CH1 0.00V</tspan></text>')
    
    # Bottom digital measurement readouts table (row 2: y 34 to 76)
    if measurements:
        svg.append('  <g transform="translate(0, 36)">')
        svg.append(f'    <rect x="0" y="0" width="{gw}" height="42" rx="5" fill="#0C1522" stroke="#1E2C3D" stroke-width="1"/>')
        m_items = list(measurements.items())
        col_w = gw / len(m_items)
        for idx, (lbl, val) in enumerate(m_items):
            cx = idx * col_w
            # Vertical divider
            if idx > 0:
                svg.append(f'    <line x1="{cx}" y1="6" x2="{cx}" y2="36" stroke="#1E2C3D" stroke-width="1"/>')
            # Label
            svg.append(f'    <text x="{cx+10}" y="17" fill="#64748B" font-size="10" font-weight="700">{lbl}</text>')
            # Color value according to CH1 / CH2
            val_col = "#F59E0B" if "CH1" in lbl or "(1)" in lbl else ("#06B6D4" if "CH2" in lbl or "(2)" in lbl else "#E2E8F0")
            svg.append(f'    <text x="{cx+10}" y="32" fill="{val_col}" font-size="13" font-weight="800">{val}</text>')
        svg.append('  </g>')
    
    svg.append('</g>')
    
    svg.append('</svg>')
    
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated: {filepath}")

# ═══════════════════════════════════════════════════════════════
# 1. Figure 6.0: Probe Calibration (Probe Cal 1 kHz, 2.00 Vp-p)
# ═══════════════════════════════════════════════════════════════
def square_wave(freq, vpp, offset=0):
    period = 1.0 / freq
    def signal(t):
        phase = (t % period) / period
        # Band-limited slightly rounded edges for realism
        duty = 0.5
        v = (vpp / 2.0) if phase < duty else (-vpp / 2.0)
        return v + offset
    return signal

# Cal signal: 1 kHz, 2.00 Vp-p (0 to +2.0V or -1 to +1V)
# Typical Cal output on DSO: 0V to 2.0V or 0V to 3.0V, here 2.00 Vp-p
cal_sig = square_wave(1000, 2.00, offset=1.00) # 0 to 2V
create_scope_svg(
    "00_fig6_0_probe_calibration.svg",
    title="PROBE CALIBRATION (1.00 kHz · 2.00 Vp-p)",
    ch1_signal=cal_sig,
    time_div=0.0002,  # 200 us/div -> 1 cycle (1ms) = 5 divs -> 2 cycles visible
    ch1_vdiv=0.5,     # 0.5 V/div -> 2V = 4 divisions
    ch1_offset=-1.0,  # move down 1 div so 0V is 1 div below center
    measurements={
        "Vp-p(1)": "2.00 V",
        "Freq(1)": "1.000 kHz",
        "Period(1)": "1.000 ms",
        "Vmax(1)": "2.00 V",
        "Vmin(1)": "0.00 V",
        "Probe Comp": "PROPER (FLAT)"
    }
)

# ═══════════════════════════════════════════════════════════════
# 2. Figure 6.4: Sine wave 500 Hz, 6 Vp-p (Exp 6.1.2)
# ═══════════════════════════════════════════════════════════════
def sine_wave(freq, vpp):
    omega = 2 * math.pi * freq
    def signal(t):
        return (vpp / 2.0) * math.sin(omega * t)
    return signal

sine_sig = sine_wave(500, 6.00)
# T = 1/500 = 2 ms
# TIME/DIV = 500 us (0.5 ms) -> 1 cycle = 4 divs -> 2.5 cycles across 10 divs
# V/DIV = 1.00 V -> 6 Vp-p = 6 divs (+3 to -3 divs)
create_scope_svg(
    "01_fig6_4_sine_500hz_6vpp.svg",
    title="EXP 6.1.2: SINE WAVE (500 Hz · 6.00 Vp-p)",
    ch1_signal=sine_sig,
    time_div=0.0005,  # 500 us/div
    ch1_vdiv=1.0,     # 1 V/div
    ch1_offset=0.0,   # symmetrical around center
    measurements={
        "Vp-p(1)": "6.00 V",
        "Freq(1)": "500.0 Hz",
        "Period(1)": "2.000 ms",
        "Vrms(1)": "2.121 V",
        "Vmax(1)": "+3.00 V",
        "Vmin(1)": "-3.00 V"
    }
)

# ═══════════════════════════════════════════════════════════════
# 3. Figure 6.5: Square wave 1 kHz, 4 Vp-p (Exp 6.1.4)
# ═══════════════════════════════════════════════════════════════
square_sig = square_wave(1000, 4.00, offset=0.0) # -2V to +2V
# T = 1 ms
# TIME/DIV = 200 us (0.2 ms) -> 1 cycle = 5 divs -> 2.0 cycles across 10 divs
# V/DIV = 1.00 V -> 4 Vp-p = 4 divs (+2 to -2 divs)
create_scope_svg(
    "02_fig6_5_square_1khz_4vpp.svg",
    title="EXP 6.1.4: SQUARE WAVE (1.00 kHz · 4.00 Vp-p)",
    ch1_signal=square_sig,
    time_div=0.0002,  # 200 us/div
    ch1_vdiv=1.0,     # 1 V/div
    ch1_offset=0.0,
    measurements={
        "Vp-p(1)": "4.00 V",
        "Freq(1)": "1.000 kHz",
        "Period(1)": "1.000 ms",
        "Vrms(1)": "2.000 V",
        "Duty(1)": "50.0%",
        "Vmax(1)": "+2.00 V"
    }
)

# ═══════════════════════════════════════════════════════════════
# 4. Figure 6.6: Triangle wave 2 kHz, 4 Vp-p (Exp 6.1.6)
# ═══════════════════════════════════════════════════════════════
def triangle_wave(freq, vpp):
    period = 1.0 / freq
    def signal(t):
        phase = (t % period) / period  # 0 to 1
        if phase < 0.25:
            # 0 to peak (+vpp/2)
            return (vpp / 2.0) * (phase / 0.25)
        elif phase < 0.75:
            # peak to trough (-vpp/2)
            return (vpp / 2.0) - vpp * ((phase - 0.25) / 0.5)
        else:
            # trough to 0
            return (-vpp / 2.0) + (vpp / 2.0) * ((phase - 0.75) / 0.25)
    return signal

tri_sig = triangle_wave(2000, 4.00)
# T = 1/2000 = 0.5 ms = 500 us
# TIME/DIV = 100 us -> 1 cycle = 5 divs -> 2.0 cycles across 10 divs
# V/DIV = 1.00 V -> 4 Vp-p = 4 divs (+2 to -2 divs)
create_scope_svg(
    "03_fig6_6_triangle_2khz_4vpp.svg",
    title="EXP 6.1.6: TRIANGLE WAVE (2.00 kHz · 4.00 Vp-p)",
    ch1_signal=tri_sig,
    time_div=0.0001,  # 100 us/div
    ch1_vdiv=1.0,     # 1 V/div
    ch1_offset=0.0,
    measurements={
        "Vp-p(1)": "4.00 V",
        "Freq(1)": "2.000 kHz",
        "Period(1)": "500.0 µs",
        "Vrms(1)": "1.155 V",
        "Vmax(1)": "+2.00 V",
        "Vmin(1)": "-2.00 V"
    }
)

# ═══════════════════════════════════════════════════════════════
# 5. Figure 6.7: Circuit Schematic (Voltage Divider R1=1k, R2=470)
# ═══════════════════════════════════════════════════════════════
def create_circuit_schematic():
    W = 840
    H = 460
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="auto" style="background:#FFFFFF; font-family:\'IBM Plex Sans Thai\', Sarabun, sans-serif;">')
    
    # Definitions
    svg.append('<defs>')
    svg.append('  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">')
    svg.append('    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#1E40AF"/>')
    svg.append('  </marker>')
    svg.append('</defs>')
    
    # Outer frame
    svg.append(f'<rect x="8" y="8" width="{W-16}" height="{H-16}" rx="8" fill="#FFFDF9" stroke="#D8CFBC" stroke-width="1.5"/>')
    
    # Title badge
    svg.append('  <rect x="24" y="22" width="480" height="32" rx="6" fill="#0F172A"/>')
    svg.append('  <text x="36" y="43" fill="#F8FAFC" font-size="14" font-weight="800">รูปที่ 6.7: แผนภาพวงจรทดลองตอนที่ 6.2 (วงจรแบ่งแรงดันไฟฟ้า)</text>')
    
    # Function generator block on left
    # Coordinates: center at (150, 240)
    svg.append('  <rect x="70" y="160" width="140" height="160" rx="8" fill="#F1F5F9" stroke="#334155" stroke-width="2"/>')
    svg.append('  <text x="140" y="190" fill="#0F172A" font-size="13" font-weight="800" text-anchor="middle">FUNCTION</text>')
    svg.append('  <text x="140" y="208" fill="#0F172A" font-size="13" font-weight="800" text-anchor="middle">GENERATOR</text>')
    # Sine icon inside generator
    svg.append('  <path d="M 105 240 Q 122.5 210 140 240 T 175 240" fill="none" stroke="#2563EB" stroke-width="3"/>')
    svg.append('  <text x="140" y="280" fill="#2563EB" font-size="12" font-weight="700" text-anchor="middle">vs = 10 Vp-p</text>')
    svg.append('  <text x="140" y="300" fill="#64748B" font-size="11" font-weight="600" text-anchor="middle">f = 500 Hz</text>')
    
    # Main loop wire
    # Generator output top: (210, 200), bottom: (210, 280)
    svg.append('  <!-- Wires -->')
    svg.append('  <path d="M 210 200 L 320 200" stroke="#0F172A" stroke-width="2.5" fill="none"/>')
    svg.append('  <path d="M 210 280 L 520 280" stroke="#0F172A" stroke-width="2.5" fill="none"/>')
    
    # R1 = 1 kΩ (Horizontal Resistor) from x=320 to 420, y=200
    svg.append('  <!-- R1 (1 kOhm) -->')
    r1_path = "M 320 200 L 330 200 " + " ".join([
        "L 335 188", "L 345 212", "L 355 188", "L 365 212", 
        "L 375 188", "L 385 212", "L 395 188", "L 405 212", "L 410 200"
    ]) + " L 520 200"
    svg.append(f'  <path d="{r1_path}" stroke="#0F172A" stroke-width="2.5" fill="none"/>')
    svg.append('  <text x="370" y="172" fill="#B45309" font-size="14" font-weight="800" text-anchor="middle">R₁ = 1 kΩ</text>')
    
    # Node at (520, 200)
    svg.append('  <circle cx="520" cy="200" r="4.5" fill="#0F172A"/>')
    
    # R2 = 470 Ω (Vertical Resistor) from (520, 200) to (520, 280)
    svg.append('  <!-- R2 (470 Ohm) -->')
    r2_path = "M 520 200 L 520 216 " + " ".join([
        "L 508 221", "L 532 231", "L 508 241", "L 532 251", 
        "L 508 261", "L 532 271", "L 520 276"
    ]) + " L 520 280"
    svg.append(f'  <path d="{r2_path}" stroke="#0F172A" stroke-width="2.5" fill="none"/>')
    svg.append('  <text x="445" y="246" fill="#B45309" font-size="14" font-weight="800" text-anchor="middle">R₂ = 470 Ω</text>')
    
    # Ground symbol at (520, 280)
    svg.append('  <!-- Ground at bottom -->')
    svg.append('  <circle cx="520" cy="280" r="4.5" fill="#0F172A"/>')
    svg.append('  <line x1="520" y1="280" x2="520" y2="310" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('  <line x1="500" y1="310" x2="540" y2="310" stroke="#0F172A" stroke-width="3"/>')
    svg.append('  <line x1="508" y1="318" x2="532" y2="318" stroke="#0F172A" stroke-width="2"/>')
    svg.append('  <line x1="515" y1="326" x2="525" y2="326" stroke="#0F172A" stroke-width="1.5"/>')
    svg.append('  <text x="550" y="318" fill="#64748B" font-size="12" font-weight="700">GND (0V)</text>')
    
    # Voltage V2 indicator
    svg.append('  <!-- Voltage V2 arrow -->')
    svg.append('  <text x="548" y="210" fill="#047857" font-size="14" font-weight="800">+</text>')
    svg.append('  <text x="548" y="278" fill="#047857" font-size="14" font-weight="800">−</text>')
    svg.append('  <text x="580" y="246" fill="#047857" font-size="14" font-weight="800">V₂ ≈ 3.20 Vp-p</text>')
    
    # Oscilloscope block on right
    # Coordinates: (640, 150) to (800, 330)
    svg.append('  <!-- Oscilloscope Block -->')
    svg.append('  <rect x="640" y="140" width="160" height="200" rx="8" fill="#0F172A" stroke="#334155" stroke-width="2"/>')
    svg.append('  <text x="720" y="170" fill="#F8FAFC" font-size="13" font-weight="800" text-anchor="middle">OSCILLOSCOPE</text>')
    # Mini screen
    svg.append('  <rect x="655" y="185" width="130" height="85" rx="4" fill="#080E18" stroke="#1E293B"/>')
    svg.append('  <line x1="655" y1="227.5" x2="785" y2="227.5" stroke="#1E293B" stroke-dasharray="2,2"/>')
    svg.append('  <line x1="720" y1="185" x2="720" y2="270" stroke="#1E293B" stroke-dasharray="2,2"/>')
    # Mini waveforms on scope
    svg.append('  <path d="M 660 227.5 Q 675 200 690 227.5 T 720 227.5 T 750 227.5 T 780 227.5" fill="none" stroke="#F59E0B" stroke-width="1.8"/>')
    svg.append('  <path d="M 660 227.5 Q 675 218 690 227.5 T 720 227.5 T 750 227.5 T 780 227.5" fill="none" stroke="#06B6D4" stroke-width="1.8"/>')
    
    # BNC Ports at bottom of scope
    svg.append('  <circle cx="680" cy="305" r="9" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>')
    svg.append('  <circle cx="680" cy="305" r="3" fill="#F59E0B"/>')
    svg.append('  <text x="680" y="328" fill="#F59E0B" font-size="10" font-weight="800" text-anchor="middle">CH1 (vs)</text>')
    
    svg.append('  <circle cx="750" cy="305" r="9" fill="#1E293B" stroke="#06B6D4" stroke-width="2"/>')
    svg.append('  <circle cx="750" cy="305" r="3" fill="#06B6D4"/>')
    svg.append('  <text x="750" y="328" fill="#06B6D4" font-size="10" font-weight="800" text-anchor="middle">CH2 (V₂)</text>')
    
    # Probe connections
    # CH2 Probe connects to node (520, 200)
    svg.append('  <!-- CH2 Probe Line -->')
    svg.append('  <path d="M 750 305 C 730 380, 580 210, 525 202" fill="none" stroke="#06B6D4" stroke-width="2" stroke-dasharray="4,2"/>')
    svg.append('  <polygon points="522,200 527,196 529,205" fill="#06B6D4"/>')
    svg.append('  <rect x="580" y="270" width="105" height="22" rx="4" fill="#ECFEFF" stroke="#06B6D4" stroke-width="1"/>')
    svg.append('  <text x="632" y="285" fill="#0891B2" font-size="10" font-weight="700" text-anchor="middle">โพรบ CH2 วัด V₂</text>')
    
    # CH1 Probe connects to vs at node (260, 200)
    svg.append('  <!-- CH1 Probe Line -->')
    svg.append('  <circle cx="260" cy="200" r="4.5" fill="#F59E0B"/>')
    svg.append('  <path d="M 680 305 C 650 420, 320 340, 262 205" fill="none" stroke="#F59E0B" stroke-width="2" stroke-dasharray="4,2"/>')
    svg.append('  <rect x="290" y="375" width="115" height="22" rx="4" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1"/>')
    svg.append('  <text x="347" y="390" fill="#B45309" font-size="10" font-weight="700" text-anchor="middle">โพรบ CH1 วัด vs</text>')
    
    # Common Ground Clip
    svg.append('  <!-- Ground Clip Wire -->')
    svg.append('  <path d="M 680 314 C 670 360, 550 340, 523 285" fill="none" stroke="#475569" stroke-width="2"/>')
    svg.append('  <rect x="470" y="345" width="95" height="20" rx="3" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1"/>')
    svg.append('  <text x="517" y="359" fill="#475569" font-size="9.5" font-weight="700" text-anchor="middle">คลิปกราวด์ร่วม</text>')
    
    # Bottom Note Box
    svg.append('  <rect x="24" y="405" width="792" height="38" rx="5" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1"/>')
    svg.append('  <text x="36" y="428" fill="#1E40AF" font-size="12" font-weight="700">สูตรการแบ่งแรงดันทางทฤษฎี: V₂ = vs × [ R₂ / (R₁ + R₂) ] = 10 Vp-p × [ 470 / (1000 + 470) ] = 3.197 Vp-p ≈ 3.20 Vp-p (มุมเฟสตรงกัน 0°)</text>')
    
    svg.append('</svg>')
    filepath = os.path.join(OUTPUT_DIR, "04_fig6_7_voltage_divider_schematic.svg")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated: {filepath}")

create_circuit_schematic()

# ═══════════════════════════════════════════════════════════════
# 6. Figure 6.8: Dual Channel Scope: vs = 10 Vp-p, V2 = 3.20 Vp-p
# ═══════════════════════════════════════════════════════════════
vs_sig = sine_wave(500, 10.00) # vs = 10 Vp-p
v2_sig = sine_wave(500, 3.197) # V2 = 3.20 Vp-p, in-phase (0 deg)

# For CH1: vs = 10 Vp-p -> V/DIV = 2.00 V -> 5 divs (+2.5 to -2.5)
# For CH2: V2 = 3.20 Vp-p -> V/DIV = 1.00 V -> 3.2 divs (+1.6 to -1.6)
# TIME/DIV = 500 us -> 1 cycle (2ms) = 4 divs -> 2.5 cycles
create_scope_svg(
    "05_fig6_8_voltage_divider_scope.svg",
    title="EXP 6.2.3: VOLTAGE DIVIDER (vs = 10 Vp-p · V₂ = 3.20 Vp-p · 500 Hz)",
    ch1_signal=vs_sig,
    ch2_signal=v2_sig,
    time_div=0.0005,  # 500 us/div
    ch1_vdiv=2.0,     # 2 V/div (CH1: 10 Vp-p = 5 divs)
    ch2_vdiv=1.0,     # 1 V/div (CH2: 3.20 Vp-p = 3.2 divs)
    ch1_offset=0.0,
    ch2_offset=0.0,
    measurements={
        "Vp-p(1) vs": "10.00 V",
        "Vp-p(2) V₂": "3.20 V",
        "Freq(1)": "500.0 Hz",
        "Period": "2.000 ms",
        "Vrms(2)": "1.130 V",
        "Phase Δθ": "0.00° (In-Phase)"
    }
)

print("All Lab 6 SVGs generated successfully!")
