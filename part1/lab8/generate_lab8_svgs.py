#!/usr/bin/env python3
"""
Generate realistic digital oscilloscope screens and high-fidelity schematics for Lab 8:
Diode Circuits and Rectifiers (Diode, LED and Rectifiers)
Following virtual-lab/js/instruments/digital-oscilloscope.js specifications,
part1/DESIGN_SYSTEM.md standards, and exact lab guide reproductions (p. 74 - 88).
"""

import math
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "result")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ═══════════════════════════════════════════════════════════════
# 1. SCOPE SCREEN GENERATOR
# ═══════════════════════════════════════════════════════════════
def create_scope_svg(
    filename,
    title,
    ch1_signal=None,  # func(t) -> voltage
    ch2_signal=None,  # func(t) -> voltage
    time_div=0.0005,  # seconds per division (500 us)
    ch1_vdiv=2.0,     # volts per division
    ch2_vdiv=2.0,     # volts per division
    ch1_offset=0.0,   # div offset
    ch2_offset=0.0,   # div offset
    measurements=None,# dict of labels -> values
    trigger_status="Trig'd",
    sample_rate="1.00 GSa/s",
    time_offset=0.0,
):
    W = 880
    H = 560
    
    gx = 40
    gy = 50
    gw = 800
    gh = 400
    x_center = gx + gw / 2
    y_center = gy + gh / 2
    
    dx_div = gw / 10 # 80 px
    dy_div = gh / 8  # 50 px
    
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="auto" style="background:#080E18; font-family:\'SF Mono\', Consolas, monospace;">')
    svg.append('<defs>')
    svg.append('  <filter id="glow-ch1" x="-20%" y="-20%" width="140%" height="140%">')
    svg.append('    <feGaussianBlur stdDeviation="1.8" result="blur"/>')
    svg.append('    <feMerge>')
    svg.append('      <feMergeNode in="blur"/>')
    svg.append('      <feMergeNode in="SourceGraphic"/>')
    svg.append('    </feMerge>')
    svg.append('  </filter>')
    svg.append('  <filter id="glow-ch2" x="-20%" y="-20%" width="140%" height="140%">')
    svg.append('    <feGaussianBlur stdDeviation="1.8" result="blur"/>')
    svg.append('    <feMerge>')
    svg.append('      <feMergeNode in="blur"/>')
    svg.append('      <feMergeNode in="SourceGraphic"/>')
    svg.append('    </feMerge>')
    svg.append('  </filter>')
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
    
    # Screen background
    svg.append(f'<rect x="{gx}" y="{gy}" width="{gw}" height="{gh}" rx="4" fill="url(#screen-grad)" stroke="#1F2D3D" stroke-width="1.5"/>')
    
    # Top Status Bar
    svg.append(f'<g transform="translate({gx}, 18)">')
    svg.append('  <text x="0" y="16" fill="#94A3B8" font-size="11" font-weight="700" letter-spacing="0.5">RIGOL / VIRTUAL DSO</text>')
    trig_color = "#10B981" if trigger_status in ["Trig'd", "Auto"] else "#EF4444"
    svg.append(f'  <rect x="165" y="3" width="56" height="18" rx="3" fill="{trig_color}" opacity="0.18"/>')
    svg.append(f'  <rect x="165" y="3" width="56" height="18" rx="3" fill="none" stroke="{trig_color}" stroke-width="1"/>')
    svg.append(f'  <text x="193" y="16" fill="{trig_color}" font-size="10" font-weight="800" text-anchor="middle">{trigger_status}</text>')
    svg.append('  <polygon points="236,24 231,16 241,16" fill="#F59E0B"/>')
    svg.append('  <text x="236" y="12" fill="#F59E0B" font-size="10" font-weight="700" text-anchor="middle">T</text>')
    svg.append(f'  <text x="252" y="16" fill="#CBD5E1" font-size="11" font-weight="600">{title}</text>')
    svg.append(f'  <text x="{gw}" y="16" fill="#64748B" font-size="10" text-anchor="end">SR: <tspan fill="#94A3B8">{sample_rate}</tspan></text>')
    svg.append('</g>')
    
    # Graticule Lines (10x8)
    svg.append('<g stroke="#1F2F3E" stroke-width="0.75" opacity="0.85">')
    for i in range(11):
        x = gx + i * dx_div
        svg.append(f'  <line x1="{x:.1f}" y1="{gy}" x2="{x:.1f}" y2="{gy+gh}"/>')
    for j in range(9):
        y = gy + j * dy_div
        svg.append(f'  <line x1="{gx}" y1="{y:.1f}" x2="{gx+gw}" y2="{y:.1f}"/>')
    svg.append('</g>')
    
    # Sub-division tick marks on center axes
    svg.append('<g stroke="#475569" stroke-width="1">')
    for i in range(51):
        x = gx + i * (dx_div / 5)
        tick_h = 6 if i % 5 == 0 else 3
        svg.append(f'  <line x1="{x:.1f}" y1="{y_center - tick_h}" x2="{x:.1f}" y2="{y_center + tick_h}"/>')
    for j in range(41):
        y = gy + j * (dy_div / 5)
        tick_w = 6 if j % 5 == 0 else 3
        svg.append(f'  <line x1="{x_center - tick_w}" y1="{y:.1f}" x2="{x_center + tick_w}" y2="{y:.1f}"/>')
    svg.append('</g>')
    
    # Ground reference markers
    ch1_gy = y_center - ch1_offset * dy_div
    ch2_gy = y_center - ch2_offset * dy_div
    if ch1_signal:
        svg.append(f'<g transform="translate({gx - 18}, {ch1_gy})">')
        svg.append('  <polygon points="0,-7 14,0 0,7" fill="#FACC15"/>')
        svg.append('  <text x="5" y="3.5" fill="#000000" font-size="9" font-weight="900" text-anchor="middle">1</text>')
        svg.append('  <line x1="16" y1="0" x2="22" y2="0" stroke="#FACC15" stroke-width="1.5" stroke-dasharray="2 2"/>')
        svg.append('</g>')
    if ch2_signal:
        svg.append(f'<g transform="translate({gx - 18}, {ch2_gy})">')
        svg.append('  <polygon points="0,-7 14,0 0,7" fill="#38BDF8"/>')
        svg.append('  <text x="5" y="3.5" fill="#000000" font-size="9" font-weight="900" text-anchor="middle">2</text>')
        svg.append('  <line x1="16" y1="0" x2="22" y2="0" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="2 2"/>')
        svg.append('</g>')
        
    # Render Waveforms
    svg.append('<g clip-path="url(#screen-clip)">')
    num_pts = 1000
    t_start = -5.0 * time_div + time_offset
    t_end = 5.0 * time_div + time_offset
    dt = (t_end - t_start) / (num_pts - 1)
    
    # CH1 Waveform (Yellow)
    if ch1_signal:
        pts1 = []
        for i in range(num_pts):
            t = t_start + i * dt
            px = gx + (i / (num_pts - 1)) * gw
            v = ch1_signal(t)
            py = (y_center - ch1_offset * dy_div) - (v / ch1_vdiv) * dy_div
            pts1.append(f"{px:.1f},{py:.1f}")
        svg.append(f'  <polyline points="{" ".join(pts1)}" fill="none" stroke="#FACC15" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow-ch1)"/>')
        
    # CH2 Waveform (Cyan)
    if ch2_signal:
        pts2 = []
        for i in range(num_pts):
            t = t_start + i * dt
            px = gx + (i / (num_pts - 1)) * gw
            v = ch2_signal(t)
            py = (y_center - ch2_offset * dy_div) - (v / ch2_vdiv) * dy_div
            pts2.append(f"{px:.1f},{py:.1f}")
        svg.append(f'  <polyline points="{" ".join(pts2)}" fill="none" stroke="#38BDF8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow-ch2)"/>')
    svg.append('</g>')
    
    # Bottom Measurement & Channel Status Bar
    svg.append(f'<g transform="translate({gx}, {gy + gh + 14})">')
    # CH1 Badge
    if ch1_signal:
        svg.append('  <rect x="0" y="0" width="130" height="28" rx="4" fill="#FACC15" opacity="0.15"/>')
        svg.append('  <rect x="0" y="0" width="130" height="28" rx="4" fill="none" stroke="#FACC15" stroke-width="1.5"/>')
        svg.append('  <rect x="6" y="5" width="22" height="18" rx="2" fill="#FACC15"/>')
        svg.append('  <text x="17" y="18" fill="#000000" font-size="11" font-weight="900" text-anchor="middle">1</text>')
        vdiv_str = f"{ch1_vdiv:.2f}V" if ch1_vdiv >= 1.0 else f"{int(ch1_vdiv*1000)}mV"
        svg.append(f'  <text x="36" y="18" fill="#FACC15" font-size="12" font-weight="800">={vdiv_str}/DIV</text>')
    
    # CH2 Badge
    if ch2_signal:
        ch2_bx = 135 if ch1_signal else 0
        svg.append(f'  <rect x="{ch2_bx}" y="0" width="125" height="28" rx="4" fill="#38BDF8" opacity="0.15"/>')
        svg.append(f'  <rect x="{ch2_bx}" y="0" width="125" height="28" rx="4" fill="none" stroke="#38BDF8" stroke-width="1.5"/>')
        svg.append(f'  <rect x="{ch2_bx + 6}" y="5" width="22" height="18" rx="2" fill="#38BDF8"/>')
        svg.append(f'  <text x="{ch2_bx + 17}" y="18" fill="#000000" font-size="11" font-weight="900" text-anchor="middle">2</text>')
        vdiv_str2 = f"{ch2_vdiv:.2f}V" if ch2_vdiv >= 1.0 else f"{int(ch2_vdiv*1000)}mV"
        svg.append(f'  <text x="{ch2_bx + 34}" y="18" fill="#38BDF8" font-size="12" font-weight="800">={vdiv_str2}/DIV</text>')
        
    # Timebase Badge
    t_bx = 270 if (ch1_signal and ch2_signal) else (135 if (ch1_signal or ch2_signal) else 0)
    t_str = f"{time_div*1e6:.0f} &mu;s" if time_div < 0.001 else f"{time_div*1e3:.1f} ms"
    t_str_clean = t_str.replace("&mu;", "μ")
    svg.append(f'  <rect x="{t_bx}" y="0" width="145" height="28" rx="4" fill="#334155" opacity="0.4"/>')
    svg.append(f'  <rect x="{t_bx}" y="0" width="145" height="28" rx="4" fill="none" stroke="#475569" stroke-width="1"/>')
    svg.append(f'  <text x="{t_bx + 12}" y="18" fill="#E2E8F0" font-size="12" font-weight="700">H: {t_str_clean}/DIV</text>')
    
    # Status badges on right of Row 1
    svg.append(f'  <rect x="{gw - 110}" y="0" width="110" height="28" rx="4" fill="#064E3B" opacity="0.3"/>')
    svg.append(f'  <rect x="{gw - 110}" y="0" width="110" height="28" rx="4" fill="none" stroke="#059669" stroke-width="1"/>')
    svg.append(f'  <text x="{gw - 55}" y="18" fill="#34D399" font-size="11" font-weight="800" text-anchor="middle">● {trigger_status}</text>')
    svg.append(f'  <text x="{gw - 122}" y="18" fill="#64748B" font-size="11" text-anchor="end">{sample_rate}</text>')
    
    # Row 2: Dedicated Measurement Cards (Clean, legible, zero text collision)
    if measurements:
        items = list(measurements.items())
        n_meas = len(items)
        gap = 8
        card_w = (gw - (n_meas - 1) * gap) / n_meas
        for idx, (k, val) in enumerate(items):
            if isinstance(val, (tuple, list)):
                v, c = val[0], val[1]
            else:
                v, c = str(val), "#E2E8F0"
            cx = idx * (card_w + gap)
            cy = 38
            ch = 30
            # Card background
            svg.append(f'  <rect x="{cx:.1f}" y="{cy}" width="{card_w:.1f}" height="{ch}" rx="5" fill="#0B1322" stroke="#1E293B" stroke-width="1.2"/>')
            # Colored left accent
            svg.append(f'  <rect x="{cx:.1f}" y="{cy}" width="3.5" height="{ch}" rx="2" fill="{c}"/>')
            # Text label & value
            svg.append(f'  <text x="{cx + 9:.1f}" y="{cy + 20}" fill="#94A3B8" font-size="11" font-weight="600">{k}:</text>')
            svg.append(f'  <text x="{cx + card_w - 8:.1f}" y="{cy + 20}" fill="{c}" font-size="11" font-weight="800" text-anchor="end">{v}</text>')
    svg.append('</g>')
    
    svg.append('</svg>')
    
    out_path = os.path.join(OUTPUT_DIR, filename)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated scope SVG: {out_path}")


# ═══════════════════════════════════════════════════════════════
# 2. GENERATE ALL LAB 8 SVGs
# ═══════════════════════════════════════════════════════════════

# Signal 1: Half-wave input vs(t) = 5 cos(1000 pi t) -> A = 5.0 V, f = 500 Hz
def vs_500hz(t):
    return 5.0 * math.cos(2.0 * math.pi * 500.0 * t)

# Signal 2: Half-wave load vL(t) without capacitor (Silicon diode cut-in 0.7 V)
def vL_halfwave_nofilter(t):
    vs = vs_500hz(t)
    return max(0.0, vs - 0.7)

# Signal 3: Half-wave with C-filter (C = 1 uF, RL = 10 kOhm -> tau = 10 ms, T = 2 ms)
def vL_halfwave_cfilter(t):
    f = 500.0
    T = 1.0 / f
    t_mod = (t % T)
    v_peak = 5.0 - 0.7 # 4.3 V
    t_peak = 0.0
    # Diode conducts near peak, then discharges with RC = 10 ms
    # v(t) = v_peak * exp(- (t_mod) / tau)
    tau = 0.010 # 10 ms
    vs = vs_500hz(t)
    # Check if diode conducts
    v_exp = v_peak * math.exp(-t_mod / tau) + 0.1 * math.sin(2*math.pi*f*t) # slight ripple phase
    v_diode = max(0.0, vs - 0.7)
    return max(v_diode, v_exp)

# Signal 4: Full-wave Bridge load vL(t) without capacitor
def vL_bridge_nofilter(t):
    vs = vs_500hz(t)
    return max(0.0, abs(vs) - 1.4) # two diode drops = 1.4 V, peak = 3.6 V

# Signal 5: Full-wave Bridge with C-filter (tau = 10 ms, ripple frequency = 1000 Hz, T_ripple = 1 ms)
def vL_bridge_cfilter(t):
    f_rip = 1000.0
    T_rip = 1.0 / f_rip
    t_mod = (t % T_rip)
    v_peak = 5.0 - 1.4 # 3.6 V
    tau = 0.010 # 10 ms
    v_exp = v_peak * math.exp(-t_mod / tau)
    vs_rect = max(0.0, abs(vs_500hz(t)) - 1.4)
    return max(vs_rect, v_exp)


# SVG 01: Diode & LED I-V Characteristics Comparison
def generate_iv_characteristics_svg():
    W = 800
    H = 500
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="auto" style="background:#0F172A; font-family:\'SF Mono\', Consolas, sans-serif;">')
    svg.append('<defs>')
    svg.append('  <linearGradient id="bg-grad" x1="0" y1="0" x2="0" y2="1">')
    svg.append('    <stop offset="0%" stop-color="#1E293B"/>')
    svg.append('    <stop offset="100%" stop-color="#0F172A"/>')
    svg.append('  </linearGradient>')
    svg.append('  <filter id="glow-si"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>')
    svg.append('  <filter id="glow-led"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>')
    svg.append('</defs>')
    
    # Card Background
    svg.append(f'<rect width="{W}" height="{H}" rx="12" fill="url(#bg-grad)" stroke="#334155" stroke-width="1.5"/>')
    
    # Title & Subtitle
    svg.append('<!-- Header -->')
    svg.append('<text x="40" y="42" fill="#F8FAFC" font-size="16" font-weight="800">กราฟคุณลักษณะกระแส-แรงดัน (I-V Characteristics): ไดโอด 1N4001 เทียบกับ แอลอีดี (LED)</text>')
    svg.append('<text x="40" y="64" fill="#94A3B8" font-size="12">ผลการทดลองตอนที่ 8.1 (ตารางที่ 8.1 และ 8.2) · เปรียบเทียบแรงดันคัตอิน (V<tspan font-size="10" dy="2">&gamma;</tspan><tspan dy="-2">) และพฤติกรรมไบแอสตรง/กลับ</tspan></text>')
    
    # Plot Origin & Dimensions
    # Origin at (240, 360) -> X: -10V to +3V, Y: -1mA to +11mA
    ox = 240
    oy = 360
    pw = 500
    ph = 270
    
    # Grid lines
    svg.append('<!-- Grid -->')
    # Voltage grid (X axis: -10 to +3 V)
    # Scale: for positive X: 0 to 2.5 V -> 70 px per Volt. For negative X: 0 to -10 V -> 18 px per Volt
    def x_map(v):
        if v >= 0:
            return ox + v * 160.0 # 0V=240, 1V=400, 2V=560, 3V=720
        else:
            return ox + v * 18.0  # -10V = 60
            
    def y_map(i_ma):
        # 0 mA = 360, 10 mA = 110 (25 px per mA)
        return oy - i_ma * 25.0
        
    # Draw horizontal grid lines (0, 2, 4, 6, 8, 10 mA)
    for ma in [0, 2, 4, 6, 8, 10]:
        y = y_map(ma)
        svg.append(f'<line x1="50" y1="{y}" x2="740" y2="{y}" stroke="#334155" stroke-width="0.8" stroke-dasharray="3 3"/>')
        svg.append(f'<text x="42" y="{y+4}" fill="#64748B" font-size="10" text-anchor="end">{ma} mA</text>')
        
    # Draw vertical grid lines (-10V, -5V, 0V, 0.7V, 1.0V, 1.8V, 2.0V)
    for v, lbl in [(-10, "-10V"), (-5, "-5V"), (0, "0V"), (0.7, "0.7V"), (1.0, "1.0V"), (1.8, "1.8V"), (2.0, "2.0V")]:
        x = x_map(v)
        svg.append(f'<line x1="{x}" y1="100" x2="{x}" y2="{oy+25}" stroke="#334155" stroke-width="0.8" stroke-dasharray="3 3"/>')
        svg.append(f'<text x="{x}" y="{oy+38}" fill="#64748B" font-size="10" text-anchor="middle">{lbl}</text>')
        
    # Main Axes
    svg.append(f'<line x1="45" y1="{oy}" x2="750" y2="{oy}" stroke="#94A3B8" stroke-width="1.5"/>') # X Axis
    svg.append(f'<polygon points="752,{oy} 744,{oy-4} 744,{oy+4}" fill="#94A3B8"/>')
    svg.append(f'<text x="745" y="{oy-10}" fill="#94A3B8" font-size="11" font-weight="700">V_D (V)</text>')
    
    svg.append(f'<line x1="{ox}" y1="{oy+20}" x2="{ox}" y2="90" stroke="#94A3B8" stroke-width="1.5"/>') # Y Axis
    svg.append(f'<polygon points="{ox},88 {ox-4},96 {ox+4},96" fill="#94A3B8"/>')
    svg.append(f'<text x="{ox+8}" y="98" fill="#94A3B8" font-size="11" font-weight="700">I_D (mA)</text>')
    
    # Actual Lab Data Points from Table 8.1 (Diode 1N4001)
    # VD, ID
    diode_data = [
        (-10.0, 0.0), (-1.0, 0.0), (-0.5, 0.0), (0.0, 0.0),
        (0.449, 0.056), (0.509, 0.195), (0.539, 0.366), (0.555, 0.541), (0.572, 0.730),
        (0.584, 0.911), (0.593, 1.116), (0.601, 1.312), (0.605, 1.410), (0.619, 1.813),
        (0.631, 2.390), (0.640, 2.889), (0.660, 4.387), (0.697, 9.413)
    ]
    
    # Actual Lab Data Points from Table 8.2 (LED)
    # VD, ID
    led_data = [
        (-10.0, 0.0), (-1.0, 0.0), (-0.5, 0.0), (0.0, 0.0), (0.5, 0.0), (0.999, 0.0),
        (1.778, 0.222), (1.924, 3.119), (2.061, 8.036)
    ]
    
    # Diode Curve Path (Green)
    d_pts = [f"{x_map(v):.1f},{y_map(i):.1f}" for v, i in diode_data]
    svg.append(f'<polyline points="{" ".join(d_pts)}" fill="none" stroke="#10B981" stroke-width="2.5" filter="url(#glow-si)"/>')
    for v, i in diode_data:
        svg.append(f'<circle cx="{x_map(v):.1f}" cy="{y_map(i):.1f}" r="3" fill="#10B981" stroke="#FFFFFF" stroke-width="1"/>')
        
    # LED Curve Path (Red / Orange)
    led_pts = [f"{x_map(v):.1f},{y_map(i):.1f}" for v, i in led_data]
    svg.append(f'<polyline points="{" ".join(led_pts)}" fill="none" stroke="#EF4444" stroke-width="2.5" filter="url(#glow-led)"/>')
    for v, i in led_data:
        svg.append(f'<circle cx="{x_map(v):.1f}" cy="{y_map(i):.1f}" r="3" fill="#EF4444" stroke="#FFFFFF" stroke-width="1"/>')
        
    # Callout: Silicon Cut-in 0.65-0.7V
    cx1 = x_map(0.697)
    cy1 = y_map(9.413)
    svg.append(f'<g transform="translate({cx1 + 15}, {cy1})">')
    svg.append('  <rect x="0" y="-12" width="160" height="42" rx="5" fill="#064E3B" stroke="#10B981" stroke-width="1"/>')
    svg.append('  <text x="8" y="4" fill="#6EE7B7" font-size="11" font-weight="700">ไดโอดซิลิกอน 1N4001</text>')
    svg.append('  <text x="8" y="20" fill="#A7F3D0" font-size="10">V<tspan font-size="8">&gamma;</tspan> &approx; 0.60 - 0.70 V</text>')
    svg.append(f'  <line x1="0" y1="8" x2="-12" y2="8" stroke="#10B981" stroke-width="1.5"/>')
    svg.append('</g>')
    
    # Callout: LED Cut-in 1.8-2.0V
    cx2 = x_map(2.061)
    cy2 = y_map(8.036)
    svg.append(f'<g transform="translate({cx2 - 175}, {cy2 + 10})">')
    svg.append('  <rect x="0" y="-12" width="165" height="52" rx="5" fill="#7F1D1D" stroke="#EF4444" stroke-width="1"/>')
    svg.append('  <text x="8" y="4" fill="#FCA5A5" font-size="11" font-weight="700">ไดโอดเปล่งแสง (LED)</text>')
    svg.append('  <text x="8" y="19" fill="#FECACA" font-size="10">V<tspan font-size="8">&gamma;</tspan> &approx; 1.80 - 2.06 V</text>')
    svg.append('  <text x="8" y="32" fill="#FDE047" font-size="9" font-weight="700">&bull; เริ่มเปล่งแสงที่ V_D = 1.78V</text>')
    svg.append(f'  <line x1="165" y1="12" x2="175" y2="12" stroke="#EF4444" stroke-width="1.5"/>')
    svg.append('</g>')
    
    # Legend
    svg.append('<g transform="translate(60, 110)">')
    svg.append('  <rect width="165" height="60" rx="6" fill="#1E293B" stroke="#475569" stroke-width="1"/>')
    svg.append('  <circle cx="16" cy="18" r="4" fill="#10B981"/>')
    svg.append('  <line x1="8" y1="18" x2="24" y2="18" stroke="#10B981" stroke-width="2"/>')
    svg.append('  <text x="32" y="22" fill="#E2E8F0" font-size="11">1N4001 (Silicon)</text>')
    svg.append('  <circle cx="16" cy="42" r="4" fill="#EF4444"/>')
    svg.append('  <line x1="8" y1="42" x2="24" y2="42" stroke="#EF4444" stroke-width="2"/>')
    svg.append('  <text x="32" y="46" fill="#E2E8F0" font-size="11">LED (Red)</text>')
    svg.append('</g>')
    
    svg.append('</svg>')
    out_path = os.path.join(OUTPUT_DIR, "01_fig8_7_diode_iv_curve.svg")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated IV curve SVG: {out_path}")


# SVG 02: Half-Wave Rectifier Schematic (Figure 8.8)
def generate_half_wave_schematic():
    W = 760
    H = 340
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="auto" style="background:#FFFDF9; font-family:\'IBM Plex Sans Thai\', Sarabun, sans-serif;">')
    
    # Outer Border
    svg.append(f'<rect width="{W}" height="{H}" rx="8" fill="#FFFDF9" stroke="#D8CFBC" stroke-width="1.5"/>')
    
    # Title
    svg.append('<text x="380" y="32" fill="#0F172A" font-size="15" font-weight="800" text-anchor="middle">รูปที่ 8.8 วงจรสำหรับทดลองตอนที่ 8.2: การทำงานของวงจรเรียงกระแสแบบครึ่งคลื่น</text>')
    svg.append('<text x="380" y="52" fill="#64748B" font-size="12" text-anchor="middle">Half-Wave Rectifier Circuit with Oscilloscope Probe Placement</text>')
    
    # Circuit Box coordinates
    # Loop: (180, 100) -> Diode -> (520, 100) -> RL -> (520, 240) -> (180, 240) -> AC Source -> (180, 100)
    
    # Top wire from AC Source to Diode
    svg.append('<line x1="180" y1="100" x2="330" y2="100" stroke="#0F172A" stroke-width="2.5"/>')
    # Diode D at (350, 100)
    # Anode triangle from 330 to 360, Bar at 360
    svg.append('<!-- Diode D -->')
    svg.append('<polygon points="330,85 360,100 330,115" fill="#0F172A"/>')
    svg.append('<line x1="360" y1="83" x2="360" y2="117" stroke="#0F172A" stroke-width="3"/>')
    svg.append('<text x="345" y="74" fill="#0F172A" font-size="14" font-weight="800" text-anchor="middle">D</text>')
    svg.append('<text x="345" y="134" fill="#1E40AF" font-size="11" font-weight="700" text-anchor="middle">1N4001</text>')
    
    # Wire from Diode to RL
    svg.append('<line x1="360" y1="100" x2="520" y2="100" stroke="#0F172A" stroke-width="2.5"/>')
    
    # Resistor RL at x=520, y=130 to 210
    svg.append('<line x1="520" y1="100" x2="520" y2="130" stroke="#0F172A" stroke-width="2.5"/>')
    # Resistor zigzag or rectangle
    svg.append('<rect x="508" y="130" width="24" height="80" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>')
    svg.append('<text x="495" y="165" fill="#0F172A" font-size="13" font-weight="800" text-anchor="end">R_L = 10 k&Omega;</text>')
    svg.append('<line x1="520" y1="210" x2="520" y2="240" stroke="#0F172A" stroke-width="2.5"/>')
    
    # Bottom wire back to AC Source
    svg.append('<line x1="520" y1="240" x2="180" y2="240" stroke="#0F172A" stroke-width="2.5"/>')
    
    # Left wire from AC Source
    svg.append('<line x1="180" y1="100" x2="180" y2="145" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<line x1="180" y1="195" x2="180" y2="240" stroke="#0F172A" stroke-width="2.5"/>')
    
    # AC Source circle at (180, 170), r=25
    svg.append('<!-- AC Source -->')
    svg.append('<circle cx="180" cy="170" r="25" fill="#FFFFFF" stroke="#0F172A" stroke-width="2.5"/>')
    # Sine wave inside
    svg.append('<path d="M 168 170 Q 174 158 180 170 T 192 170" fill="none" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<text x="145" y="168" fill="#0F172A" font-size="13" font-weight="800" text-anchor="end">v_s(t) = A cos(&omega;t)</text>')
    svg.append('<text x="145" y="186" fill="#64748B" font-size="11" text-anchor="end">10 V_p-p (5 V_p), 500 Hz</text>')
    
    # Load voltage polarity (+ / -) and current arrow
    svg.append('<text x="542" y="125" fill="#B45309" font-size="15" font-weight="800">+</text>')
    svg.append('<text x="560" y="174" fill="#B45309" font-size="13" font-weight="800">v_L(t)</text>')
    svg.append('<text x="542" y="225" fill="#B45309" font-size="17" font-weight="800">-</text>')
    # Current arrow iL
    svg.append('<path d="M 536 142 L 536 158" stroke="#10B981" stroke-width="2"/>')
    svg.append('<polygon points="536,164 532,156 540,156" fill="#10B981"/>')
    svg.append('<text x="544" y="152" fill="#10B981" font-size="11" font-weight="700">i_L</text>')
    
    # Oscilloscope Channel 1 probe lines (measuring vs(t))
    svg.append('<!-- Scope CH1 -->')
    svg.append('<circle cx="180" cy="100" r="4" fill="#FACC15" stroke="#0F172A" stroke-width="1.5"/>')
    svg.append('<circle cx="180" cy="240" r="4" fill="#FACC15" stroke="#0F172A" stroke-width="1.5"/>')
    svg.append('<path d="M 180 100 L 90 100 L 90 150" fill="none" stroke="#CA8A04" stroke-width="1.8" stroke-dasharray="4 3"/>')
    svg.append('<path d="M 180 240 L 90 240 L 90 190" fill="none" stroke="#CA8A04" stroke-width="1.8" stroke-dasharray="4 3"/>')
    svg.append('<rect x="25" y="150" width="130" height="40" rx="4" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.5"/>')
    svg.append('<text x="90" y="167" fill="#854D0E" font-size="11" font-weight="800" text-anchor="middle">ออสซิลโลสโคป</text>')
    svg.append('<text x="90" y="182" fill="#854D0E" font-size="11" font-weight="800" text-anchor="middle">ช่องสัญญาณที่ 1 (CH1)</text>')
    
    # Oscilloscope Channel 2 probe lines (measuring vL(t))
    svg.append('<!-- Scope CH2 -->')
    svg.append('<circle cx="520" cy="100" r="4" fill="#38BDF8" stroke="#0F172A" stroke-width="1.5"/>')
    svg.append('<circle cx="520" cy="240" r="4" fill="#38BDF8" stroke="#0F172A" stroke-width="1.5"/>')
    svg.append('<path d="M 520 100 L 670 100 L 670 150" fill="none" stroke="#0284C7" stroke-width="1.8" stroke-dasharray="4 3"/>')
    svg.append('<path d="M 520 240 L 670 240 L 670 190" fill="none" stroke="#0284C7" stroke-width="1.8" stroke-dasharray="4 3"/>')
    svg.append('<rect x="605" y="150" width="130" height="40" rx="4" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.5"/>')
    svg.append('<text x="670" y="167" fill="#0369A1" font-size="11" font-weight="800" text-anchor="middle">ออสซิลโลสโคป</text>')
    svg.append('<text x="670" y="182" fill="#0369A1" font-size="11" font-weight="800" text-anchor="middle">ช่องสัญญาณที่ 2 (CH2)</text>')
    
    # Notes below
    svg.append('<g transform="translate(40, 285)">')
    svg.append('  <rect width="680" height="36" rx="4" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>')
    svg.append('  <text x="14" y="23" fill="#334155" font-size="11"><b>พารามิเตอร์การทดลอง:</b> R_L = 10 k&Omega;, ไดโอด D = 1N4001, v_s = 10 V_p-p, ความถี่ f = 500 Hz (คาบ T = 2.0 ms)</text>')
    svg.append('</g>')
    
    svg.append('</svg>')
    out_path = os.path.join(OUTPUT_DIR, "02_fig8_8_half_wave_schematic.svg")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated half wave schematic: {out_path}")


# SVG 03: Half-Wave Rectifier Scope Waveform (Figure 8.9 / 8.10)
def generate_half_wave_scope():
    create_scope_svg(
        filename="03_fig8_10_half_wave_scope.svg",
        title="ตอนที่ 8.2: วงจรเรียงกระแสครึ่งคลื่น (Half-Wave Rectifier)",
        ch1_signal=vs_500hz,
        ch2_signal=vL_halfwave_nofilter,
        time_div=0.0005, # 500 us/div -> 1 period (2ms) is 4 divisions
        ch1_vdiv=2.0,    # 2V/div -> 10.1 Vp-p is ~5.05 divisions
        ch2_vdiv=2.0,    # 2V/div -> 4.5 Vp-p is ~2.25 divisions
        ch1_offset=0.0,
        ch2_offset=0.0,
        measurements={
            "CH1 Vp-p": ("10.1 V", "#FACC15"),
            "CH2 Vp-p": ("4.50 V", "#38BDF8"),
            "Period (T)": ("2.00 ms", "#94A3B8"),
            "Freq (f)": ("500 Hz", "#94A3B8"),
            "V_dc (Calc)": ("1.43 V", "#10B981")
        },
        trigger_status="Trig'd"
    )


# SVG 04: Half-Wave Rectifier with Capacitor Filter Schematic (Figure 8.10 in manual)
def generate_half_wave_cfilter_schematic():
    W = 780
    H = 350
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="auto" style="background:#FFFDF9; font-family:\'IBM Plex Sans Thai\', Sarabun, sans-serif;">')
    svg.append(f'<rect width="{W}" height="{H}" rx="8" fill="#FFFDF9" stroke="#D8CFBC" stroke-width="1.5"/>')
    
    # Title
    svg.append('<text x="390" y="32" fill="#0F172A" font-size="15" font-weight="800" text-anchor="middle">รูปที่ 8.10 วงจรสำหรับทดลองตอนที่ 8.3: วงจรเรียงกระแสแบบครึ่งคลื่นที่มีตัวเก็บประจุ (C-Filter)</text>')
    svg.append('<text x="390" y="52" fill="#64748B" font-size="12" text-anchor="middle">Half-Wave Rectifier with Parallel Capacitor Filter (C = 1 &mu;F, R_L = 10 k&Omega;)</text>')
    
    # Loop: (160, 100) -> Diode -> (380, 100) -> C -> (380, 240) -> (540, 100) -> RL -> (540, 240) -> (160, 240)
    svg.append('<line x1="160" y1="100" x2="270" y2="100" stroke="#0F172A" stroke-width="2.5"/>')
    # Diode
    svg.append('<polygon points="270,85 300,100 270,115" fill="#0F172A"/>')
    svg.append('<line x1="300" y1="83" x2="300" y2="117" stroke="#0F172A" stroke-width="3"/>')
    svg.append('<text x="285" y="74" fill="#0F172A" font-size="14" font-weight="800" text-anchor="middle">D</text>')
    svg.append('<text x="285" y="134" fill="#1E40AF" font-size="11" font-weight="700" text-anchor="middle">1N4001</text>')
    
    # Wire from Diode past C to RL
    svg.append('<line x1="300" y1="100" x2="540" y2="100" stroke="#0F172A" stroke-width="2.5"/>')
    
    # Capacitor C branch at x=410
    svg.append('<circle cx="410" cy="100" r="3.5" fill="#0F172A"/>')
    svg.append('<line x1="410" y1="100" x2="410" y2="155" stroke="#0F172A" stroke-width="2.5"/>')
    # Capacitor plates
    svg.append('<line x1="395" y1="155" x2="425" y2="155" stroke="#0F172A" stroke-width="3"/>')
    svg.append('<line x1="395" y1="167" x2="425" y2="167" stroke="#0F172A" stroke-width="3"/>')
    svg.append('<line x1="410" y1="167" x2="410" y2="240" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<circle cx="410" cy="240" r="3.5" fill="#0F172A"/>')
    svg.append('<text x="435" y="166" fill="#0F172A" font-size="13" font-weight="800">C = 1 &mu;F</text>')
    
    # Resistor RL branch at x=540
    svg.append('<circle cx="540" cy="100" r="3.5" fill="#0F172A"/>')
    svg.append('<line x1="540" y1="100" x2="540" y2="135" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<rect x="528" y="135" width="24" height="70" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>')
    svg.append('<text x="560" y="174" fill="#0F172A" font-size="13" font-weight="800">R_L = 10 k&Omega;</text>')
    svg.append('<line x1="540" y1="205" x2="540" y2="240" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<circle cx="540" cy="240" r="3.5" fill="#0F172A"/>')
    
    # Bottom wire back to AC source
    svg.append('<line x1="540" y1="240" x2="160" y2="240" stroke="#0F172A" stroke-width="2.5"/>')
    
    # AC Source on left
    svg.append('<line x1="160" y1="100" x2="160" y2="145" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<line x1="160" y1="195" x2="160" y2="240" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<circle cx="160" cy="170" r="25" fill="#FFFFFF" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<path d="M 148 170 Q 154 158 160 170 T 172 170" fill="none" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<text x="125" y="168" fill="#0F172A" font-size="13" font-weight="800" text-anchor="end">v_s(t) = A cos(&omega;t)</text>')
    svg.append('<text x="125" y="186" fill="#64748B" font-size="11" text-anchor="end">10 V_p-p, 500 Hz</text>')
    
    # Polarity
    svg.append('<text x="565" y="130" fill="#B45309" font-size="15" font-weight="800">+</text>')
    svg.append('<text x="585" y="174" fill="#B45309" font-size="13" font-weight="800">v_L(t)</text>')
    svg.append('<text x="565" y="225" fill="#B45309" font-size="17" font-weight="800">-</text>')
    
    # Probes
    svg.append('<path d="M 160 100 L 70 100 L 70 150" fill="none" stroke="#CA8A04" stroke-width="1.8" stroke-dasharray="4 3"/>')
    svg.append('<path d="M 160 240 L 70 240 L 70 190" fill="none" stroke="#CA8A04" stroke-width="1.8" stroke-dasharray="4 3"/>')
    svg.append('<rect x="10" y="150" width="120" height="40" rx="4" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.5"/>')
    svg.append('<text x="70" y="167" fill="#854D0E" font-size="11" font-weight="800" text-anchor="middle">CH1 (v_s)</text>')
    svg.append('<text x="70" y="182" fill="#854D0E" font-size="10" text-anchor="middle">วัดสัญญาณเข้า</text>')
    
    svg.append('<path d="M 540 100 L 690 100 L 690 150" fill="none" stroke="#0284C7" stroke-width="1.8" stroke-dasharray="4 3"/>')
    svg.append('<path d="M 540 240 L 690 240 L 690 190" fill="none" stroke="#0284C7" stroke-width="1.8" stroke-dasharray="4 3"/>')
    svg.append('<rect x="630" y="150" width="120" height="40" rx="4" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.5"/>')
    svg.append('<text x="690" y="167" fill="#0369A1" font-size="11" font-weight="800" text-anchor="middle">CH2 (v_L)</text>')
    svg.append('<text x="690" y="182" fill="#0369A1" font-size="10" text-anchor="middle">วัดสัญญาณกรอง DC</text>')
    
    # Formula box below
    svg.append('<g transform="translate(40, 290)">')
    svg.append('  <rect width="700" height="40" rx="4" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>')
    svg.append('  <text x="14" y="24" fill="#334155" font-size="11"><b>คุณสมบัติวงจรกรอง:</b> ค่าคงตัวเวลา &tau; = R_L &times; C = 10 ms &gt;&gt; คาบ T = 2 ms | V_r(p-p) &approx; V_peak / (f &times; R_L &times; C) = 0.86 V</text>')
    svg.append('</g>')
    
    svg.append('</svg>')
    out_path = os.path.join(OUTPUT_DIR, "04_fig8_10_c_filter_schematic.svg")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated half wave cfilter schematic: {out_path}")


# SVG 05: Half-Wave Rectifier with C-Filter Scope Waveform (Figure 8.11)
def generate_half_wave_cfilter_scope():
    create_scope_svg(
        filename="05_fig8_11_half_wave_c_filter_scope.svg",
        title="ตอนที่ 8.3: วงจรเรียงกระแสครึ่งคลื่นต่อตัวเก็บประจุ C = 1 μF",
        ch1_signal=vs_500hz,
        ch2_signal=vL_halfwave_cfilter,
        time_div=0.0005,
        ch1_vdiv=2.0,
        ch2_vdiv=2.0,
        ch1_offset=0.0,
        ch2_offset=-1.0, # Shift ground down 1 div so filtered DC fits nicely
        measurements={
            "CH1 Vp-p": ("10.0 V", "#FACC15"),
            "CH2 V_peak": ("4.30 V", "#38BDF8"),
            "V_ripple (p-p)": ("0.86 V", "#EF4444"),
            "V_dc (Avg)": ("3.87 V", "#10B981")
        },
        trigger_status="Trig'd"
    )


# SVG 06: Full-Wave Bridge Rectifier Schematic (Figure 8.14)
def generate_bridge_schematic():
    W = 780
    H = 380
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="auto" style="background:#FFFDF9; font-family:\'IBM Plex Sans Thai\', Sarabun, sans-serif;">')
    svg.append(f'<rect width="{W}" height="{H}" rx="8" fill="#FFFDF9" stroke="#D8CFBC" stroke-width="1.5"/>')
    
    # Title
    svg.append('<text x="390" y="30" fill="#0F172A" font-size="15" font-weight="800" text-anchor="middle">รูปที่ 8.14 วงจรสำหรับทดลองตอนที่ 8.4.1: วงจรเรียงกระแสแบบเต็มคลื่นที่ใช้ไดโอดบริดจ์</text>')
    svg.append('<text x="390" y="50" fill="#64748B" font-size="12" text-anchor="middle">Full-Wave Bridge Rectifier Circuit (D1 - D4: 1N4001, R_L = 10 k&Omega;)</text>')
    
    # AC Source at x=140, y=190
    svg.append('<!-- AC Source -->')
    svg.append('<circle cx="140" cy="190" r="22" fill="#FFFFFF" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<path d="M 129 190 Q 135 180 140 190 T 151 190" fill="none" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<text x="105" y="194" fill="#0F172A" font-size="13" font-weight="800" text-anchor="end">v_s(t)</text>')
    
    # Bridge Diamond Center at (380, 190), size 70px each way
    # Top vertex: (380, 110)
    # Bottom vertex: (380, 270)
    # Left vertex: (300, 190)
    # Right vertex: (460, 190)
    
    # Wires from Source to Bridge
    # Top wire from source goes to Left vertex? Or Top vertex?
    # In Fig 8.14: Source top connects to Left vertex (300, 190)!
    # Source bottom connects to Top vertex (or Bottom vertex)?
    # Wait, let's look at the standard orientation in Fig 8.14:
    # Source top connects to Left vertex (300, 190).
    # Source bottom connects to Bottom vertex (380, 270) or Right?
    # Let's check Fig 8.14 crop:
    # Wire from top of vs(t) goes over to Top vertex (380, 110)?
    # Let's draw standard AC in at Left & Right, or Top & Bottom:
    # In Fig 8.14:
    # Source vs(t) top wire connects to Top vertex!
    # Source vs(t) bottom wire connects to Bottom vertex!
    # Left vertex connects to bottom of RL!
    # Right vertex connects to top of RL!
    # Exactly like Figure 8.12!
    
    # Let's draw:
    # Top source wire to Top vertex (380, 110)
    svg.append('<line x1="140" y1="168" x2="140" y2="110" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<line x1="140" y1="110" x2="380" y2="110" stroke="#0F172A" stroke-width="2.5"/>')
    
    # Bottom source wire to Bottom vertex (380, 270)
    svg.append('<line x1="140" y1="212" x2="140" y2="270" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<line x1="140" y1="270" x2="380" y2="270" stroke="#0F172A" stroke-width="2.5"/>')
    
    # Diodes in Bridge
    # D4: Left (300, 190) to Top (380, 110). Anode at Left, Cathode at Top
    svg.append('<line x1="300" y1="190" x2="330" y2="160" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<polygon points="325,165 350,140 335,175" fill="#0F172A"/>')
    svg.append('<line x1="337" y1="127" x2="363" y2="153" stroke="#0F172A" stroke-width="3"/>')
    svg.append('<line x1="350" y1="140" x2="380" y2="110" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<text x="315" y="140" fill="#0F172A" font-size="13" font-weight="800">D_4</text>')
    
    # D1: Top (380, 110) to Right (460, 190). Anode at Top, Cathode at Right
    svg.append('<line x1="380" y1="110" x2="410" y2="140" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<polygon points="405,145 430,170 395,155" fill="#0F172A"/>')
    svg.append('<line x1="417" y1="183" x2="443" y2="157" stroke="#0F172A" stroke-width="3"/>')
    svg.append('<line x1="430" y1="170" x2="460" y2="190" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<text x="445" y="140" fill="#0F172A" font-size="13" font-weight="800">D_1</text>')
    
    # D3: Left (300, 190) to Bottom (380, 270). Anode at Left, Cathode at Bottom
    svg.append('<line x1="300" y1="190" x2="330" y2="220" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<polygon points="325,215 350,240 335,205" fill="#0F172A"/>')
    svg.append('<line x1="337" y1="253" x2="363" y2="227" stroke="#0F172A" stroke-width="3"/>')
    svg.append('<line x1="350" y1="240" x2="380" y2="270" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<text x="315" y="248" fill="#0F172A" font-size="13" font-weight="800">D_3</text>')
    
    # D2: Bottom (380, 270) to Right (460, 190). Anode at Bottom, Cathode at Right
    svg.append('<line x1="380" y1="270" x2="410" y2="240" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<polygon points="405,235 430,210 395,225" fill="#0F172A"/>')
    svg.append('<line x1="417" y1="197" x2="443" y2="223" stroke="#0F172A" stroke-width="3"/>')
    svg.append('<line x1="430" y1="210" x2="460" y2="190" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<text x="445" y="248" fill="#0F172A" font-size="13" font-weight="800">D_2</text>')
    
    # Load Resistor RL on the right
    # Wire from Right vertex (460, 190) to Top of RL (580, 190)
    svg.append('<line x1="460" y1="190" x2="580" y2="190" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<line x1="580" y1="190" x2="580" y2="215" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<rect x="568" y="215" width="24" height="60" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>')
    svg.append('<text x="550" y="250" fill="#0F172A" font-size="13" font-weight="800" text-anchor="end">R_L = 10 k&Omega;</text>')
    svg.append('<line x1="580" y1="275" x2="580" y2="310" stroke="#0F172A" stroke-width="2.5"/>')
    
    # Wire from Left vertex (300, 190) down, crossing under bottom line to Bottom of RL (580, 310)
    svg.append('<line x1="300" y1="190" x2="260" y2="190" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<line x1="260" y1="190" x2="260" y2="310" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<line x1="260" y1="310" x2="580" y2="310" stroke="#0F172A" stroke-width="2.5"/>')
    
    # Jumper/hop at crossing (260, 270)
    svg.append('<circle cx="260" cy="270" r="8" fill="#FFFDF9" stroke="none"/>')
    svg.append('<path d="M 260 262 Q 252 270 260 278" fill="none" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<line x1="140" y1="270" x2="380" y2="270" stroke="#0F172A" stroke-width="2.5"/>')
    
    # Polarity across RL
    svg.append('<text x="600" y="205" fill="#B45309" font-size="15" font-weight="800">+</text>')
    svg.append('<text x="618" y="250" fill="#B45309" font-size="13" font-weight="800">v_L(t)</text>')
    svg.append('<text x="600" y="300" fill="#B45309" font-size="17" font-weight="800">-</text>')
    
    # Scope CH1
    svg.append('<path d="M 580 190 L 680 190 L 680 230" fill="none" stroke="#0284C7" stroke-width="1.8" stroke-dasharray="4 3"/>')
    svg.append('<path d="M 580 310 L 680 310 L 680 270" fill="none" stroke="#0284C7" stroke-width="1.8" stroke-dasharray="4 3"/>')
    svg.append('<rect x="620" y="230" width="120" height="40" rx="4" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.5"/>')
    svg.append('<text x="680" y="247" fill="#0369A1" font-size="11" font-weight="800" text-anchor="middle">CH1 (v_L)</text>')
    svg.append('<text x="680" y="262" fill="#0369A1" font-size="10" text-anchor="middle">ออสซิลโลสโคป</text>')
    
    svg.append('</svg>')
    out_path = os.path.join(OUTPUT_DIR, "06_fig8_14_bridge_schematic.svg")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated bridge schematic: {out_path}")


# SVG 07: Full-Wave Bridge Scope Waveform (Figure 8.15)
def generate_full_wave_scope():
    create_scope_svg(
        filename="07_fig8_15_full_wave_scope.svg",
        title="ตอนที่ 8.4.4: วงจรเรียงกระแสเต็มคลื่นบริดจ์ (Full-Wave Bridge Rectifier)",
        ch1_signal=vL_bridge_nofilter,
        ch2_signal=None,
        time_div=0.0005, # 500 us/div -> 1 ms (1 full cycle of rectified wave) is 2 divs
        ch1_vdiv=1.0,    # 1.0 V/div -> peak is 3.6 divisions high
        ch1_offset=-2.0, # Shift ground down 2 divs
        measurements={
            "V_L(peak)": ("3.60 V", "#38BDF8"),
            "Period (T_out)": ("1.00 ms", "#94A3B8"),
            "Freq (f_out)": ("1.00 kHz", "#FACC15"),
            "V_dc (Calc)": ("2.29 V", "#10B981")
        },
        trigger_status="Trig'd"
    )


# SVG 08: Full-Wave Bridge with C-Filter Schematic (Figure 8.16)
def generate_bridge_cfilter_schematic():
    W = 780
    H = 390
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="auto" style="background:#FFFDF9; font-family:\'IBM Plex Sans Thai\', Sarabun, sans-serif;">')
    svg.append(f'<rect width="{W}" height="{H}" rx="8" fill="#FFFDF9" stroke="#D8CFBC" stroke-width="1.5"/>')
    
    # Title
    svg.append('<text x="390" y="30" fill="#0F172A" font-size="15" font-weight="800" text-anchor="middle">รูปที่ 8.16 วงจรสำหรับทดลองตอนที่ 8.4.5: วงจรบริดจ์เต็มคลื่นต่อตัวเก็บประจุ C = 1 &mu;F</text>')
    svg.append('<text x="390" y="50" fill="#64748B" font-size="12" text-anchor="middle">Full-Wave Bridge Rectifier with Parallel Capacitor Filter (C = 1 &mu;F, R_L = 10 k&Omega;)</text>')
    
    # Source
    svg.append('<circle cx="130" cy="180" r="22" fill="#FFFFFF" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<path d="M 119 180 Q 125 170 130 180 T 141 180" fill="none" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<text x="98" y="184" fill="#0F172A" font-size="13" font-weight="800" text-anchor="end">v_s(t)</text>')
    
    # Top & Bottom source wires
    svg.append('<line x1="130" y1="158" x2="130" y2="105" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<line x1="130" y1="105" x2="350" y2="105" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<line x1="130" y1="202" x2="130" y2="255" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<line x1="130" y1="255" x2="350" y2="255" stroke="#0F172A" stroke-width="2.5"/>')
    
    # Bridge Diamond (Center 350, 180)
    # Top: (350, 105), Bottom: (350, 255), Left: (280, 180), Right: (420, 180)
    # D4
    svg.append('<line x1="280" y1="180" x2="305" y2="152" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<polygon points="301,157 323,133 310,165" fill="#0F172A"/>')
    svg.append('<line x1="311" y1="122" x2="335" y2="144" stroke="#0F172A" stroke-width="3"/>')
    svg.append('<line x1="323" y1="133" x2="350" y2="105" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<text x="290" y="136" fill="#0F172A" font-size="12" font-weight="800">D_4</text>')
    
    # D1
    svg.append('<line x1="350" y1="105" x2="377" y2="133" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<polygon points="373,138 395,162 365,148" fill="#0F172A"/>')
    svg.append('<line x1="384" y1="172" x2="407" y2="150" stroke="#0F172A" stroke-width="3"/>')
    svg.append('<line x1="395" y1="162" x2="420" y2="180" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<text x="408" y="136" fill="#0F172A" font-size="12" font-weight="800">D_1</text>')
    
    # D3
    svg.append('<line x1="280" y1="180" x2="305" y2="208" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<polygon points="301,203 323,227 310,195" fill="#0F172A"/>')
    svg.append('<line x1="311" y1="238" x2="335" y2="216" stroke="#0F172A" stroke-width="3"/>')
    svg.append('<line x1="323" y1="227" x2="350" y2="255" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<text x="290" y="236" fill="#0F172A" font-size="12" font-weight="800">D_3</text>')
    
    # D2
    svg.append('<line x1="350" y1="255" x2="377" y2="227" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<polygon points="373,222 395,198 365,212" fill="#0F172A"/>')
    svg.append('<line x1="384" y1="188" x2="407" y2="210" stroke="#0F172A" stroke-width="3"/>')
    svg.append('<line x1="395" y1="198" x2="420" y2="180" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<text x="408" y="236" fill="#0F172A" font-size="12" font-weight="800">D_2</text>')
    
    # Parallel Capacitor C at x=480
    svg.append('<line x1="420" y1="180" x2="570" y2="180" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<circle cx="480" cy="180" r="3.5" fill="#0F172A"/>')
    svg.append('<line x1="480" y1="180" x2="480" y2="225" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<line x1="468" y1="225" x2="492" y2="225" stroke="#0F172A" stroke-width="3"/>')
    svg.append('<line x1="468" y1="235" x2="492" y2="235" stroke="#0F172A" stroke-width="3"/>')
    svg.append('<line x1="480" y1="235" x2="480" y2="295" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<circle cx="480" cy="295" r="3.5" fill="#0F172A"/>')
    svg.append('<text x="440" y="234" fill="#0F172A" font-size="12" font-weight="800" text-anchor="end">C = 1 &mu;F</text>')
    
    # Load Resistor RL at x=570
    svg.append('<circle cx="570" cy="180" r="3.5" fill="#0F172A"/>')
    svg.append('<line x1="570" y1="180" x2="570" y2="210" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<rect x="558" y="210" width="24" height="55" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>')
    svg.append('<text x="590" y="242" fill="#0F172A" font-size="12" font-weight="800">R_L = 10 k&Omega;</text>')
    svg.append('<line x1="570" y1="265" x2="570" y2="295" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<circle cx="570" cy="295" r="3.5" fill="#0F172A"/>')
    
    # Return wire from Left vertex (280, 180) down to (240, 295) across to (570, 295)
    svg.append('<line x1="280" y1="180" x2="240" y2="180" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<line x1="240" y1="180" x2="240" y2="295" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<line x1="240" y1="295" x2="570" y2="295" stroke="#0F172A" stroke-width="2.5"/>')
    
    # Jumper over bottom AC wire at (240, 255)
    svg.append('<circle cx="240" cy="255" r="8" fill="#FFFDF9" stroke="none"/>')
    svg.append('<path d="M 240 247 Q 232 255 240 263" fill="none" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append('<line x1="130" y1="255" x2="350" y2="255" stroke="#0F172A" stroke-width="2.5"/>')
    
    # Polarity
    svg.append('<text x="625" y="195" fill="#B45309" font-size="15" font-weight="800">+</text>')
    svg.append('<text x="640" y="240" fill="#B45309" font-size="13" font-weight="800">v_L(t)</text>')
    svg.append('<text x="625" y="285" fill="#B45309" font-size="17" font-weight="800">-</text>')
    
    # Scope
    svg.append('<path d="M 570 180 L 680 180 L 680 215" fill="none" stroke="#0284C7" stroke-width="1.8" stroke-dasharray="4 3"/>')
    svg.append('<path d="M 570 295 L 680 295 L 680 255" fill="none" stroke="#0284C7" stroke-width="1.8" stroke-dasharray="4 3"/>')
    svg.append('<rect x="625" y="215" width="110" height="40" rx="4" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.5"/>')
    svg.append('<text x="680" y="232" fill="#0369A1" font-size="11" font-weight="800" text-anchor="middle">CH1 (v_L)</text>')
    svg.append('<text x="680" y="247" fill="#0369A1" font-size="10" text-anchor="middle">วัดสัญญาณริปเปิล</text>')
    
    # Summary banner
    svg.append('<g transform="translate(40, 335)">')
    svg.append('  <rect width="700" height="38" rx="4" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>')
    svg.append('  <text x="14" y="23" fill="#334155" font-size="11"><b>เปรียบเทียบกับครึ่งคลื่น:</b> ความถี่ริปเปิลเพิ่มเป็น 2 เท่า (1000 Hz) ทำให้ริปเปิลลดลงครึ่งหนึ่งเหลือ V_r(p-p) &approx; 0.36 V</text>')
    svg.append('</g>')
    
    svg.append('</svg>')
    out_path = os.path.join(OUTPUT_DIR, "08_fig8_16_bridge_c_filter_schematic.svg")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated bridge cfilter schematic: {out_path}")


# SVG 09: Full-Wave Bridge with C-Filter Scope Waveform (Figure 8.17)
def generate_full_wave_cfilter_scope():
    create_scope_svg(
        filename="09_fig8_17_full_wave_c_filter_scope.svg",
        title="ตอนที่ 8.4.7: วงจรบริดจ์เต็มคลื่นต่อตัวเก็บประจุ C = 1 μF",
        ch1_signal=vL_bridge_cfilter,
        ch2_signal=None,
        time_div=0.0005, # 500 us/div
        ch1_vdiv=1.0,    # 1.0 V/div
        ch1_offset=-1.5, # Shift ground down 1.5 divs
        measurements={
            "V_L(peak)": ("3.60 V", "#38BDF8"),
            "V_ripple (p-p)": ("0.36 V", "#EF4444"),
            "f_ripple": ("1.00 kHz", "#FACC15"),
            "V_dc (Avg)": ("3.42 V", "#10B981")
        },
        trigger_status="Trig'd"
    )


# SVG 10: Post-Lab Question 8.1 - Transformer & Bridge Rectifier Circuit (Figure 8.12)
# CRITICAL EXACT REPRODUCTION OF PAGE 88 FIGURE 8.12
def generate_q8_1_circuit_svg():
    W = 760
    H = 340
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="auto" style="background:#FFFFFF; font-family:\'Times New Roman\', Times, serif;">')
    
    # Outer Border
    svg.append(f'<rect width="{W}" height="{H}" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>')
    
    # Title matching page 88
    svg.append('<text x="380" y="30" fill="#000000" font-size="14" font-weight="bold" font-family="\'IBM Plex Sans Thai\', sans-serif" text-anchor="middle">รูปที่ 8.12 วงจรเรียงกระแสแบบเต็มคลื่นที่ใช้ไดโอดบริดจ์ (คำถามท้ายการทดลองข้อ 8.1 หน้า 88)</text>')
    
    # Transformer Primary Side
    # Vs(t) source
    svg.append('<circle cx="100" cy="180" r="20" fill="#FFFFFF" stroke="#000000" stroke-width="2"/>')
    svg.append('<path d="M 90 180 Q 95 170 100 180 T 110 180" fill="none" stroke="#000000" stroke-width="2"/>')
    svg.append('<text x="70" y="185" fill="#000000" font-size="16" font-style="italic" text-anchor="end">V_s(t)</text>')
    
    # Primary winding wire
    svg.append('<line x1="100" y1="160" x2="100" y2="130" stroke="#000000" stroke-width="2"/>')
    svg.append('<line x1="100" y1="130" x2="160" y2="130" stroke="#000000" stroke-width="2"/>')
    svg.append('<line x1="100" y1="200" x2="100" y2="230" stroke="#000000" stroke-width="2"/>')
    svg.append('<line x1="100" y1="230" x2="160" y2="230" stroke="#000000" stroke-width="2"/>')
    
    # Primary Coils (4 half-circles)
    coil_p = "M 160 130 C 180 130, 180 155, 160 155 C 180 155, 180 180, 160 180 C 180 180, 180 205, 160 205 C 180 205, 180 230, 160 230"
    svg.append(f'<path d="{coil_p}" fill="none" stroke="#000000" stroke-width="2.5"/>')
    
    # Dot convention: Top primary
    svg.append('<circle cx="145" cy="120" r="3.5" fill="#000000"/>')
    
    # Iron Core (2 vertical lines)
    svg.append('<line x1="190" y1="120" x2="190" y2="240" stroke="#000000" stroke-width="2"/>')
    svg.append('<line x1="195" y1="120" x2="195" y2="240" stroke="#000000" stroke-width="2"/>')
    
    # Secondary Coils (4 half-circles)
    coil_s = "M 225 130 C 205 130, 205 155, 225 155 C 205 155, 205 180, 225 180 C 205 180, 205 205, 225 205 C 205 205, 205 230, 225 230"
    svg.append(f'<path d="{coil_s}" fill="none" stroke="#000000" stroke-width="2.5"/>')
    
    # Dot convention: Top secondary
    svg.append('<circle cx="240" cy="120" r="3.5" fill="#000000"/>')
    
    # Transformer label
    svg.append('<text x="192" y="105" fill="#000000" font-size="14" font-weight="bold" font-family="sans-serif" text-anchor="middle">220 V / 12 V</text>')
    
    # Secondary wires
    # Top wire to Top vertex of Bridge Diamond (370, 130)
    svg.append('<line x1="225" y1="130" x2="370" y2="130" stroke="#000000" stroke-width="2"/>')
    
    # Bottom wire to Bottom vertex of Bridge Diamond (370, 250)
    svg.append('<line x1="225" y1="230" x2="370" y2="230" stroke="#000000" stroke-width="2"/>')
    svg.append('<line x1="370" y1="230" x2="370" y2="250" stroke="#000000" stroke-width="2"/>')
    
    # Bridge Diamond (Center: 370, 190)
    # Top vertex: (370, 130)
    # Bottom vertex: (370, 250)
    # Left vertex: (310, 190)
    # Right vertex: (430, 190)
    
    # Branch 1: Top (370, 130) to Left (310, 190) -> Diode D4
    # Exactly from book: D4 anode at Left, cathode at Top
    svg.append('<line x1="310" y1="190" x2="333" y2="167" stroke="#000000" stroke-width="2"/>')
    svg.append('<polygon points="328,172 350,150 338,182" fill="#000000"/>')
    svg.append('<line x1="339" y1="139" x2="361" y2="161" stroke="#000000" stroke-width="2.5"/>')
    svg.append('<line x1="350" y1="150" x2="370" y2="130" stroke="#000000" stroke-width="2"/>')
    svg.append('<text x="320" y="148" fill="#000000" font-size="15" font-style="italic">D_4</text>')
    
    # Branch 2: Top (370, 130) to Right (430, 190) -> Diode D1
    # Exactly from book: D1 anode at Top, cathode at Right
    svg.append('<line x1="370" y1="130" x2="393" y2="153" stroke="#000000" stroke-width="2"/>')
    svg.append('<polygon points="388,158 410,180 382,168" fill="#000000"/>')
    svg.append('<line x1="399" y1="191" x2="421" y2="169" stroke="#000000" stroke-width="2.5"/>')
    svg.append('<line x1="410" y1="180" x2="430" y2="190" stroke="#000000" stroke-width="2"/>')
    svg.append('<text x="415" y="148" fill="#000000" font-size="15" font-style="italic">D_1</text>')
    
    # Branch 3: Left (310, 190) to Bottom (370, 250) -> Diode D3
    # Exactly from book: D3 anode at Left, cathode at Bottom
    svg.append('<line x1="310" y1="190" x2="333" y2="213" stroke="#000000" stroke-width="2"/>')
    svg.append('<polygon points="328,208 350,230 338,198" fill="#000000"/>')
    svg.append('<line x1="339" y1="241" x2="361" y2="219" stroke="#000000" stroke-width="2.5"/>')
    svg.append('<line x1="350" y1="230" x2="370" y2="250" stroke="#000000" stroke-width="2"/>')
    svg.append('<text x="320" y="246" fill="#000000" font-size="15" font-style="italic">D_3</text>')
    
    # Branch 4: Bottom (370, 250) to Right (430, 190) -> Diode D2
    # Exactly from book: D2 anode at Bottom, cathode at Right
    svg.append('<line x1="370" y1="250" x2="393" y2="227" stroke="#000000" stroke-width="2"/>')
    svg.append('<polygon points="388,222 410,200 382,212" fill="#000000"/>')
    svg.append('<line x1="399" y1="189" x2="421" y2="211" stroke="#000000" stroke-width="2.5"/>')
    svg.append('<line x1="410" y1="200" x2="430" y2="190" stroke="#000000" stroke-width="2"/>')
    svg.append('<text x="415" y="246" fill="#000000" font-size="15" font-style="italic">D_2</text>')
    
    # Vertex connection dots
    svg.append('<circle cx="370" cy="130" r="3" fill="#000000"/>')
    svg.append('<circle cx="370" cy="250" r="3" fill="#000000"/>')
    svg.append('<circle cx="310" cy="190" r="3" fill="#000000"/>')
    svg.append('<circle cx="430" cy="190" r="3" fill="#000000"/>')
    
    # Output to Load R
    # Wire from Right vertex (430, 190) to Top of R (530, 190)
    svg.append('<line x1="430" y1="190" x2="530" y2="190" stroke="#000000" stroke-width="2"/>')
    
    # Resistor R
    svg.append('<line x1="530" y1="190" x2="530" y2="205" stroke="#000000" stroke-width="2"/>')
    # Resistor zig-zag
    r_path = "M 530 205 L 538 209 L 522 217 L 538 225 L 522 233 L 538 241 L 522 249 L 530 253"
    svg.append(f'<path d="{r_path}" fill="none" stroke="#000000" stroke-width="2"/>')
    svg.append('<line x1="530" y1="253" x2="530" y2="270" stroke="#000000" stroke-width="2"/>')
    svg.append('<text x="548" y="235" fill="#000000" font-size="16" font-style="italic">R</text>')
    svg.append('<text x="568" y="235" fill="#000000" font-size="16" font-style="italic">V_L(t)</text>')
    
    # Polarity labels on R
    svg.append('<text x="542" y="185" fill="#000000" font-size="16" font-weight="bold">+</text>')
    svg.append('<text x="542" y="280" fill="#000000" font-size="18" font-weight="bold">-</text>')
    
    # Wire from Left vertex (310, 190) going down and crossing to bottom of R (530, 270)
    svg.append('<line x1="310" y1="190" x2="270" y2="190" stroke="#000000" stroke-width="2"/>')
    svg.append('<line x1="270" y1="190" x2="270" y2="270" stroke="#000000" stroke-width="2"/>')
    svg.append('<line x1="270" y1="270" x2="530" y2="270" stroke="#000000" stroke-width="2"/>')
    
    # Wire jump/arc over bottom secondary wire at (270, 230)
    svg.append('<circle cx="270" cy="230" r="7" fill="#FFFFFF" stroke="none"/>')
    svg.append('<path d="M 270 223 Q 262 230 270 237" fill="none" stroke="#000000" stroke-width="2"/>')
    svg.append('<line x1="225" y1="230" x2="370" y2="230" stroke="#000000" stroke-width="2"/>')
    
    svg.append('</svg>')
    out_path = os.path.join(OUTPUT_DIR, "10_fig8_12_q8_1_bridge_transformer.svg")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated Q8.1 circuit SVG: {out_path}")


# SVG 11: Post-Lab Question 8.1 - Input Sine Wave with Intervals T1 - T4 (Figure 8.13)
# CRITICAL EXACT REPRODUCTION OF PAGE 88 FIGURE 8.13
def generate_q8_1_sine_intervals_svg():
    W = 760
    H = 320
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="auto" style="background:#FFFFFF; font-family:\'Times New Roman\', Times, serif;">')
    
    # Outer Border
    svg.append(f'<rect width="{W}" height="{H}" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>')
    
    # Title matching page 88
    svg.append('<text x="380" y="30" fill="#000000" font-size="14" font-weight="bold" font-family="\'IBM Plex Sans Thai\', sans-serif" text-anchor="middle">รูปที่ 8.13 คลื่นสัญญาณขาเข้า V_s(t) (คำถามท้ายการทดลองข้อ 8.1 หน้า 88)</text>')
    
    # Axes origin: (140, 160)
    ox = 140
    oy = 160
    
    # Vertical Axis (Vs(t))
    svg.append(f'<line x1="{ox}" y1="250" x2="{ox}" y2="60" stroke="#000000" stroke-width="2"/>')
    svg.append(f'<polygon points="{ox},55 {ox-4},65 {ox+4},65" fill="#000000"/>')
    svg.append(f'<text x="{ox}" y="50" fill="#000000" font-size="16" font-style="italic" text-anchor="middle">V_s(t)</text>')
    
    # Horizontal Axis (t)
    svg.append(f'<line x1="{ox-20}" y1="{oy}" x2="680" y2="{oy}" stroke="#000000" stroke-width="2"/>')
    svg.append(f'<polygon points="685,{oy} 675,{oy-4} 675,{oy+4}" fill="#000000"/>')
    svg.append(f'<text x="675" y="{oy+20}" fill="#000000" font-size="16" font-style="italic" text-anchor="end">t</text>')
    
    # Sine wave parameters
    # Period T = 20 ms -> Let 20 ms be 480 px (24 px per ms)
    # T1 = 0-5 ms (120 px)
    # T2 = 5-10 ms (120 px)
    # T3 = 10-15 ms (120 px)
    # T4 = 15-20 ms (120 px)
    # Peak = 311 V -> 80 px amplitude
    
    x0 = ox
    x1 = ox + 120 # 5 ms (T1 end)
    x2 = ox + 240 # 10 ms (T2 end)
    x3 = ox + 360 # 15 ms (T3 end)
    x4 = ox + 480 # 20 ms (T4 end)
    
    # Draw Sine Curve
    num_pts = 200
    pts = []
    for i in range(num_pts + 1):
        frac = i / num_pts
        t_ms = frac * 20.0
        x = ox + frac * 480.0
        # Sine wave starts at 0, peaks at 5ms, crosses 0 at 10ms, valley at 15ms, returns to 0 at 20ms
        v = 311.0 * math.sin(2.0 * math.pi * (t_ms / 20.0))
        y = oy - (v / 311.0) * 75.0
        pts.append(f"{x:.1f},{y:.1f}")
        
    svg.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="#000000" stroke-width="2.8"/>')
    
    # Vertical Dashed Lines for Interval Boundaries
    for x in [x0, x1, x2, x3, x4]:
        svg.append(f'<line x1="{x}" y1="70" x2="{x}" y2="255" stroke="#64748B" stroke-width="1.2" stroke-dasharray="4 3"/>')
        
    # Tick mark and label 311 V at peak
    y_peak = oy - 75
    svg.append(f'<line x1="{ox-5}" y1="{y_peak}" x2="{ox+5}" y2="{y_peak}" stroke="#000000" stroke-width="1.5"/>')
    svg.append(f'<text x="{ox-10}" y="{y_peak+5}" fill="#000000" font-size="14" text-anchor="end">311 V</text>')
    
    # 0 label at origin
    svg.append(f'<text x="{ox-10}" y="{oy+14}" fill="#000000" font-size="14" text-anchor="end">0</text>')
    
    # 10 ms label at zero crossing
    svg.append(f'<text x="{x2}" y="{oy+18}" fill="#000000" font-size="14" text-anchor="middle">10 ms</text>')
    
    # 20 ms label at cycle end
    svg.append(f'<text x="{x4}" y="{oy+18}" fill="#000000" font-size="14" text-anchor="middle">20 ms</text>')
    
    # Interval Arrows & Labels at Bottom (y = 245)
    y_bar = 245
    # T1
    svg.append(f'<line x1="{x0}" y1="{y_bar}" x2="{x1}" y2="{y_bar}" stroke="#000000" stroke-width="1.5"/>')
    svg.append(f'<polygon points="{x0},{y_bar} {x0+6},{y_bar-3} {x0+6},{y_bar+3}" fill="#000000"/>')
    svg.append(f'<polygon points="{x1},{y_bar} {x1-6},{y_bar-3} {x1-6},{y_bar+3}" fill="#000000"/>')
    svg.append(f'<text x="{(x0+x1)/2}" y="{y_bar-5}" fill="#000000" font-size="15" font-style="italic" text-anchor="middle">T_1</text>')
    
    # T2
    svg.append(f'<line x1="{x1}" y1="{y_bar}" x2="{x2}" y2="{y_bar}" stroke="#000000" stroke-width="1.5"/>')
    svg.append(f'<polygon points="{x1},{y_bar} {x1+6},{y_bar-3} {x1+6},{y_bar+3}" fill="#000000"/>')
    svg.append(f'<polygon points="{x2},{y_bar} {x2-6},{y_bar-3} {x2-6},{y_bar+3}" fill="#000000"/>')
    svg.append(f'<text x="{(x1+x2)/2}" y="{y_bar-5}" fill="#000000" font-size="15" font-style="italic" text-anchor="middle">T_2</text>')
    
    # T3
    svg.append(f'<line x1="{x2}" y1="{y_bar}" x2="{x3}" y2="{y_bar}" stroke="#000000" stroke-width="1.5"/>')
    svg.append(f'<polygon points="{x2},{y_bar} {x2+6},{y_bar-3} {x2+6},{y_bar+3}" fill="#000000"/>')
    svg.append(f'<polygon points="{x3},{y_bar} {x3-6},{y_bar-3} {x3-6},{y_bar+3}" fill="#000000"/>')
    svg.append(f'<text x="{(x2+x3)/2}" y="{y_bar-5}" fill="#000000" font-size="15" font-style="italic" text-anchor="middle">T_3</text>')
    
    # T4
    svg.append(f'<line x1="{x3}" y1="{y_bar}" x2="{x4}" y2="{y_bar}" stroke="#000000" stroke-width="1.5"/>')
    svg.append(f'<polygon points="{x3},{y_bar} {x3+6},{y_bar-3} {x3+6},{y_bar+3}" fill="#000000"/>')
    svg.append(f'<polygon points="{x4},{y_bar} {x4-6},{y_bar-3} {x4-6},{y_bar+3}" fill="#000000"/>')
    svg.append(f'<text x="{(x3+x4)/2}" y="{y_bar-5}" fill="#000000" font-size="15" font-style="italic" text-anchor="middle">T_4</text>')
    
    # Subtle colored intervals background
    # T1 & T2: Positive half (light green tint)
    svg.append(f'<rect x="{x0}" y="70" width="240" height="175" fill="#10B981" opacity="0.05"/>')
    # T3 & T4: Negative half (light blue tint)
    svg.append(f'<rect x="{x2}" y="70" width="240" height="175" fill="#3B82F6" opacity="0.05"/>')
    
    svg.append('</svg>')
    out_path = os.path.join(OUTPUT_DIR, "11_fig8_13_q8_1_sine_intervals.svg")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated Q8.1 sine intervals SVG: {out_path}")


def main():
    print("Generating SVGs for Lab 8...")
    generate_iv_characteristics_svg()
    generate_half_wave_schematic()
    generate_half_wave_scope()
    generate_half_wave_cfilter_schematic()
    generate_half_wave_cfilter_scope()
    generate_bridge_schematic()
    generate_full_wave_scope()
    generate_bridge_cfilter_schematic()
    generate_full_wave_cfilter_scope()
    generate_q8_1_circuit_svg()
    generate_q8_1_sine_intervals_svg()
    print("All 11 Lab 8 SVGs successfully generated!")

if __name__ == "__main__":
    main()
