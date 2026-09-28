#!/usr/bin/env python3
"""
Generate realistic digital oscilloscope screens and high-fidelity schematics for Lab 9:
วงจรขยายเชิงปฏิบัติการ (Operational Amplifiers - Op-Amp)
Following virtual-lab/js/instruments/digital-oscilloscope.js specifications,
part1/DESIGN_SYSTEM.md standards, strict zero-dollar-sign policy, and exact lab guide reproductions (p. 89 - 103).
"""

import math
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "result")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ═══════════════════════════════════════════════════════════════
# 1. SCOPE SCREEN GENERATOR (Modern Rigol / Keysight Style)
# ═══════════════════════════════════════════════════════════════
def create_scope_svg(
    filename,
    title,
    ch1_signal=None,  # func(t) -> voltage
    ch2_signal=None,  # func(t) -> voltage
    time_div=0.001,   # seconds per division (e.g. 1.0 ms)
    ch1_vdiv=1.0,     # volts per division
    ch2_vdiv=5.0,     # volts per division
    ch1_offset=0.0,   # div offset
    ch2_offset=0.0,   # div offset
    measurements=None,# dict of labels -> values or (val, color)
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
    t_str = f"{time_div*1e6:.0f} μs" if time_div < 0.001 else f"{time_div*1e3:.1f} ms"
    svg.append(f'  <rect x="{t_bx}" y="0" width="145" height="28" rx="4" fill="#334155" opacity="0.4"/>')
    svg.append(f'  <rect x="{t_bx}" y="0" width="145" height="28" rx="4" fill="none" stroke="#475569" stroke-width="1"/>')
    svg.append(f'  <text x="{t_bx + 12}" y="18" fill="#E2E8F0" font-size="12" font-weight="700">H: {t_str}/DIV</text>')
    
    # Status badges on right of Row 1
    svg.append(f'  <rect x="{gw - 110}" y="0" width="110" height="28" rx="4" fill="#064E3B" opacity="0.3"/>')
    svg.append(f'  <rect x="{gw - 110}" y="0" width="110" height="28" rx="4" fill="none" stroke="#059669" stroke-width="1"/>')
    svg.append(f'  <text x="{gw - 55}" y="18" fill="#34D399" font-size="11" font-weight="800" text-anchor="middle">● {trigger_status}</text>')
    svg.append(f'  <text x="{gw - 122}" y="18" fill="#64748B" font-size="11" text-anchor="end">{sample_rate}</text>')
    
    # Row 2: Dedicated Measurement Cards (Legible, neatly spaced, zero overlapping)
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
            svg.append(f'  <rect x="{cx:.1f}" y="{cy}" width="{card_w:.1f}" height="{ch}" rx="5" fill="#0B1322" stroke="#1E293B" stroke-width="1.2"/>')
            svg.append(f'  <rect x="{cx:.1f}" y="{cy}" width="3.5" height="{ch}" rx="2" fill="{c}"/>')
            svg.append(f'  <text x="{cx + 9:.1f}" y="{cy + 20}" fill="#94A3B8" font-size="11" font-weight="600">{k}:</text>')
            svg.append(f'  <text x="{cx + card_w - 8:.1f}" y="{cy + 20}" fill="{c}" font-size="11" font-weight="800" text-anchor="end">{v}</text>')
    svg.append('</g>')
    
    svg.append('</svg>')
    
    out_path = os.path.join(OUTPUT_DIR, filename)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated scope SVG: {out_path}")


# ═══════════════════════════════════════════════════════════════
# 2. LAB 9 SIGNALS (f = 300 Hz, T = 3.333 ms, Dual-Rail ±15V LM741)
# ═══════════════════════════════════════════════════════════════
F_LAB9 = 300.0 # Hz
OMEGA = 2.0 * math.pi * F_LAB9

# Inverting: Av = - (RF / RS) = - (10k / 1k) = -10
def inverting_input(amp):
    return lambda t: amp * math.sin(OMEGA * t)

def inverting_output(amp_in, rf=10.0, rs=1.0, v_pos_sat=14.32, v_neg_sat=-13.40):
    gain = - (rf / rs) # -10
    def signal(t):
        v_ideal = gain * amp_in * math.sin(OMEGA * t)
        if v_ideal > v_pos_sat:
            return v_pos_sat
        elif v_ideal < v_neg_sat:
            return v_neg_sat
        return v_ideal
    return signal

# Non-Inverting: Av = 1 + (RF / RS) = 1 + (10k / 1k) = +11
def non_inverting_output(amp_in, rf=10.0, rs=1.0, v_pos_sat=14.32, v_neg_sat=-13.40):
    gain = 1.0 + (rf / rs) # +11
    def signal(t):
        v_ideal = gain * amp_in * math.sin(OMEGA * t)
        if v_ideal > v_pos_sat:
            return v_pos_sat
        elif v_ideal < v_neg_sat:
            return v_neg_sat
        return v_ideal
    return signal

# Buffer: Av = +1
def buffer_output(amp_in):
    return lambda t: amp_in * math.sin(OMEGA * t)


# ═══════════════════════════════════════════════════════════════
# 3. GENERATE ALL LAB 9 SCOPE SVGS
# ═══════════════════════════════════════════════════════════════

# Scope 1: Figure 9.8 - Inverting AC: Vs = 1 Vp-p (amp = 0.5 V), Av = -10 -> Vout = 10 Vp-p (amp = 5.0 V)
def generate_fig9_8_scope():
    amp_in = 0.5 # 1.0 Vp-p
    create_scope_svg(
        filename="05_fig9_8_inverting_ac_scope.svg",
        title="รูปที่ 9.8 วงจรกลับเฟส: vs = 1 Vp-p, Av = -10, vout = 10 Vp-p (กลับเฟส 180°)",
        ch1_signal=inverting_input(amp_in),
        ch2_signal=inverting_output(amp_in),
        time_div=0.001,  # 1.0 ms/DIV (3 divisions per cycle at 300 Hz)
        ch1_vdiv=0.5,    # 500 mV/DIV -> 2 divisions p-p
        ch2_vdiv=5.0,    # 5.0 V/DIV -> 2 divisions p-p
        measurements={
            "CH1 Vp-p": ("1.02 V", "#FACC15"),
            "CH2 Vp-p": ("10.05 V", "#38BDF8"),
            "Gain Av": ("-9.85", "#38BDF8"),
            "Freq": ("300.2 Hz", "#94A3B8"),
            "Phase": ("179.4°", "#E2E8F0"),
        }
    )

# Scope 2: Figure 9.9 - Inverting AC: Vs = 2 Vp-p (amp = 1.0 V), Av = -10 -> Vout = 20 Vp-p (amp = 10.0 V)
def generate_fig9_9_scope():
    amp_in = 1.0 # 2.0 Vp-p
    create_scope_svg(
        filename="06_fig9_9_inverting_ac_scope.svg",
        title="รูปที่ 9.9 วงจรกลับเฟส: vs = 2 Vp-p, Av = -10, vout = 20 Vp-p (กลับเฟส 180°)",
        ch1_signal=inverting_input(amp_in),
        ch2_signal=inverting_output(amp_in),
        time_div=0.001,  # 1.0 ms/DIV
        ch1_vdiv=1.0,    # 1.0 V/DIV -> 2 divisions p-p
        ch2_vdiv=5.0,    # 5.0 V/DIV -> 4 divisions p-p
        measurements={
            "CH1 Vp-p": ("2.01 V", "#FACC15"),
            "CH2 Vp-p": ("20.08 V", "#38BDF8"),
            "Gain Av": ("-9.99", "#38BDF8"),
            "Freq": ("299.8 Hz", "#94A3B8"),
            "Phase": ("179.8°", "#E2E8F0"),
        }
    )

# Scope 3: Figure 9.10 - Inverting AC Saturated: Vs = 4 Vp-p (amp = 2.0 V), Theoretical Vout = 40 Vp-p -> Clipped at +14.3V / -13.5V
def generate_fig9_10_scope():
    amp_in = 2.0 # 4.0 Vp-p
    create_scope_svg(
        filename="07_fig9_10_inverting_saturated_scope.svg",
        title="รูปที่ 9.10 วงจรกลับเฟส: vs = 4 Vp-p เกิดการขลิบยอดคลื่น (Saturation Clipping ที่ ±Vsat)",
        ch1_signal=inverting_input(amp_in),
        ch2_signal=inverting_output(amp_in),
        time_div=0.001,  # 1.0 ms/DIV
        ch1_vdiv=2.0,    # 2.0 V/DIV -> 2 divisions p-p
        ch2_vdiv=5.0,    # 5.0 V/DIV -> Clipped wave
        measurements={
            "CH1 Vp-p": ("4.02 V", "#FACC15"),
            "CH2 Vmax": ("+14.32 V", "#38BDF8"),
            "CH2 Vmin": ("-13.48 V", "#38BDF8"),
            "CH2 Vp-p": ("27.80 V", "#EF4444"),
            "Status": ("SATURATED", "#EF4444"),
        }
    )

# Scope 4: Figure 9.12 - Non-Inverting AC: Vs = 1 Vp-p (amp = 0.5 V), Av = +11 -> Vout = 11 Vp-p (amp = 5.5 V, In-phase)
def generate_fig9_12_scope():
    amp_in = 0.5 # 1.0 Vp-p
    create_scope_svg(
        filename="08_fig9_12_non_inverting_ac_scope.svg",
        title="รูปที่ 9.12 วงจรไม่กลับเฟส: vs = 1 Vp-p, Av = +11, vout = 11 Vp-p (ร่วมเฟส 0°)",
        ch1_signal=inverting_input(amp_in),
        ch2_signal=non_inverting_output(amp_in),
        time_div=0.001,  # 1.0 ms/DIV
        ch1_vdiv=0.5,    # 500 mV/DIV
        ch2_vdiv=5.0,    # 5.0 V/DIV
        measurements={
            "CH1 Vp-p": ("1.01 V", "#FACC15"),
            "CH2 Vp-p": ("11.08 V", "#38BDF8"),
            "Gain Av": ("+10.97", "#38BDF8"),
            "Freq": ("300.1 Hz", "#94A3B8"),
            "Phase": ("0.3°", "#E2E8F0"),
        }
    )

# Scope 5: Figure 9.13 - Non-Inverting AC: Vs = 2 Vp-p (amp = 1.0 V), Av = +11 -> Vout = 22 Vp-p (amp = 11.0 V, In-phase)
def generate_fig9_13_scope():
    amp_in = 1.0 # 2.0 Vp-p
    create_scope_svg(
        filename="09_fig9_13_non_inverting_ac_scope.svg",
        title="รูปที่ 9.13 วงจรไม่กลับเฟส: vs = 2 Vp-p, Av = +11, vout = 22 Vp-p (ร่วมเฟส 0°)",
        ch1_signal=inverting_input(amp_in),
        ch2_signal=non_inverting_output(amp_in),
        time_div=0.001,  # 1.0 ms/DIV
        ch1_vdiv=1.0,    # 1.0 V/DIV
        ch2_vdiv=5.0,    # 5.0 V/DIV
        measurements={
            "CH1 Vp-p": ("2.02 V", "#FACC15"),
            "CH2 Vp-p": ("22.14 V", "#38BDF8"),
            "Gain Av": ("+10.96", "#38BDF8"),
            "Freq": ("300.0 Hz", "#94A3B8"),
            "Phase": ("0.1°", "#E2E8F0"),
        }
    )

# Scope 6: Figure 9.14 - Voltage Follower (Buffer): Vs = 2 Vp-p, Av = +1 -> Vout = 2 Vp-p (Overlapping waveforms)
def generate_fig9_14_scope():
    amp_in = 1.0 # 2.0 Vp-p
    create_scope_svg(
        filename="10_fig9_14_buffer_ac_scope.svg",
        title="รูปที่ 9.14 วงจรตามแรงดัน: vs = 2 Vp-p, Av = +1, vout ซ้อนทับกับ vs พอดี (Av = 1.00, 0°)",
        ch1_signal=inverting_input(amp_in),
        ch2_signal=buffer_output(amp_in),
        time_div=0.001,  # 1.0 ms/DIV
        ch1_vdiv=1.0,    # 1.0 V/DIV
        ch2_vdiv=1.0,    # 1.0 V/DIV
        measurements={
            "CH1 Vp-p": ("2.01 V", "#FACC15"),
            "CH2 Vp-p": ("2.01 V", "#38BDF8"),
            "Gain Av": ("+1.00", "#38BDF8"),
            "Freq": ("300.0 Hz", "#94A3B8"),
            "Phase": ("0.0°", "#E2E8F0"),
        }
    )


# ═══════════════════════════════════════════════════════════════
# 4. SCHEMATICS GENERATOR (High Fidelity Light Theme Circuits)
# ═══════════════════════════════════════════════════════════════

# Common Op-Amp Drawing Helper
def draw_opamp(svg, cx, cy, label="LM741", has_rails=True):
    # Opamp triangle: (-40, -40), (-40, +40), (+40, 0)
    p1 = f"{cx-45},{cy-45}"
    p2 = f"{cx-45},{cy+45}"
    p3 = f"{cx+45},{cy}"
    svg.append(f'<!-- Op-Amp Symbol -->')
    svg.append(f'<polygon points="{p1} {p2} {p3}" fill="#FFFFFF" stroke="#0F172A" stroke-width="2.5"/>')
    # Input signs
    # (-) Inverting input at top: (cx-45, cy-22)
    # (+) Non-inverting input at bottom: (cx-45, cy+22)
    svg.append(f'<text x="{cx-36}" y="{cy-18}" fill="#0F172A" font-size="16" font-weight="900">-</text>')
    svg.append(f'<text x="{cx-36}" y="{cy+26}" fill="#0F172A" font-size="16" font-weight="900">+</text>')
    svg.append(f'<text x="{cx-10}" y="{cy+5}" fill="#64748B" font-size="11" font-weight="700">{label}</text>')
    
    if has_rails:
        # +VCC at top (cx, cy-33)
        svg.append(f'<line x1="{cx}" y1="{cy-33}" x2="{cx}" y2="{cy-60}" stroke="#0F172A" stroke-width="1.8"/>')
        svg.append(f'<text x="{cx}" y="{cy-66}" fill="#DC2626" font-size="11" font-weight="800" text-anchor="middle">+15V (Pin 7)</text>')
        # -VEE at bottom (cx, cy+33)
        svg.append(f'<line x1="{cx}" y1="{cy+33}" x2="{cx}" y2="{cy+60}" stroke="#0F172A" stroke-width="1.8"/>')
        svg.append(f'<text x="{cx}" y="{cy+73}" fill="#2563EB" font-size="11" font-weight="800" text-anchor="middle">-15V (Pin 4)</text>')

# Ground helper
def draw_ground(svg, x, y):
    svg.append(f'<line x1="{x}" y1="{y}" x2="{x}" y2="{y+14}" stroke="#0F172A" stroke-width="2"/>')
    svg.append(f'<line x1="{x-14}" y1="{y+14}" x2="{x+14}" y2="{y+14}" stroke="#0F172A" stroke-width="2"/>')
    svg.append(f'<line x1="{x-9}" y1="{y+18}" x2="{x+9}" y2="{y+18}" stroke="#0F172A" stroke-width="1.8"/>')
    svg.append(f'<line x1="{x-4}" y1="{y+22}" x2="{x+4}" y2="{y+22}" stroke="#0F172A" stroke-width="1.5"/>')

# Resistor helper (horizontal)
def draw_resistor_h(svg, x1, y, length=60, label="R", value="1 kΩ"):
    x2 = x1 + length
    svg.append(f'<line x1="{x1}" y1="{y}" x2="{x1+10}" y2="{y}" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<rect x="{x1+10}" y="{y-10}" width="{length-20}" height="20" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>')
    svg.append(f'<line x1="{x2-10}" y1="{y}" x2="{x2}" y2="{y}" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<text x="{x1 + length/2}" y="{y-14}" fill="#0F172A" font-size="12" font-weight="800" text-anchor="middle">{label}</text>')
    if value:
        svg.append(f'<text x="{x1 + length/2}" y="{y+23}" fill="#475569" font-size="11" font-weight="700" text-anchor="middle">{value}</text>')

# Resistor helper (vertical)
def draw_resistor_v(svg, x, y1, length=60, label="R", value="1 kΩ"):
    y2 = y1 + length
    svg.append(f'<line x1="{x}" y1="{y1}" x2="{x}" y2="{y1+10}" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<rect x="{x-10}" y="{y1+10}" width="20" height="{length-20}" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>')
    svg.append(f'<line x1="{x}" y1="{y2-10}" x2="{x}" y2="{y2}" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<text x="{x-14}" y="{y1 + length/2 + 4}" fill="#0F172A" font-size="12" font-weight="800" text-anchor="end">{label}</text>')
    if value:
        svg.append(f'<text x="{x+15}" y="{y1 + length/2 + 4}" fill="#475569" font-size="11" font-weight="700">{value}</text>')


# SVG 01: Figure 9.1 - Inverting Amplifier Schematic
def generate_fig9_1_schematic():
    W = 820
    H = 420
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="auto" style="background:#FFFDF9; font-family:\'IBM Plex Sans Thai\', Sarabun, sans-serif;">')
    svg.append(f'<rect width="{W}" height="{H}" rx="8" fill="#FFFDF9" stroke="#D8CFBC" stroke-width="1.5"/>')
    
    # Title
    svg.append('<text x="410" y="32" fill="#0F172A" font-size="15" font-weight="800" text-anchor="middle">รูปที่ 9.1 วงจรขยายแบบกลับเฟส (Inverting Amplifier Circuit)</text>')
    svg.append('<text x="410" y="52" fill="#64748B" font-size="12" text-anchor="middle">สมการอัตราขยาย: V_out = - (R_F / R_S) × V_in  |  A_v = - R_F / R_S</text>')
    
    op_cx = 450
    op_cy = 230
    draw_opamp(svg, op_cx, op_cy, label="LM741", has_rails=True)
    
    # Inverting input path:
    # Vin terminal at (120, 208) -> wire -> RS (200 to 270) -> wire to node A (330, 208) -> Pin 2 (405, 208)
    in_y = op_cy - 22 # 208
    svg.append('<!-- Input Terminal Vin -->')
    svg.append(f'<circle cx="120" cy="{in_y}" r="4" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>')
    svg.append(f'<text x="108" y="{in_y+5}" fill="#0F172A" font-size="13" font-weight="800" text-anchor="end">V_in (v_s)</text>')
    svg.append(f'<line x1="124" y1="{in_y}" x2="190" y2="{in_y}" stroke="#0F172A" stroke-width="2.2"/>')
    
    # RS Resistor
    draw_resistor_h(svg, 190, in_y, length=70, label="R_S", value="1 kΩ")
    
    # Wire to node A and into Pin 2
    svg.append(f'<line x1="260" y1="{in_y}" x2="405" y2="{in_y}" stroke="#0F172A" stroke-width="2.2"/>')
    
    # Node A (Virtual Ground Node)
    svg.append(f'<circle cx="330" cy="{in_y}" r="4.5" fill="#2563EB"/>')
    svg.append(f'<text x="330" y="{in_y-12}" fill="#2563EB" font-size="12" font-weight="800" text-anchor="middle">โหนด V_-</text>')
    svg.append(f'<text x="330" y="{in_y+18}" fill="#2563EB" font-size="10" font-weight="700" text-anchor="middle">(≈ 0V Virtual GND)</text>')
    
    # Feedback loop: from node A (330, 208) up to y=110 -> RF -> down to output node (560, 230)
    svg.append(f'<line x1="330" y1="{in_y}" x2="330" y2="110" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<line x1="330" y1="110" x2="380" y2="110" stroke="#0F172A" stroke-width="2.2"/>')
    draw_resistor_h(svg, 380, 110, length=80, label="R_F", value="4.7 kΩ / 10 kΩ")
    svg.append(f'<line x1="460" y1="110" x2="560" y2="110" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<line x1="560" y1="110" x2="560" y2="{op_cy}" stroke="#0F172A" stroke-width="2.2"/>')
    
    # Non-Inverting input (Pin 3 at 405, 252) connected to Ground
    non_in_y = op_cy + 22 # 252
    svg.append(f'<line x1="405" y1="{non_in_y}" x2="360" y2="{non_in_y}" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<line x1="360" y1="{non_in_y}" x2="360" y2="{non_in_y+35}" stroke="#0F172A" stroke-width="2.2"/>')
    draw_ground(svg, 360, non_in_y+35)
    svg.append(f'<text x="345" y="{non_in_y+25}" fill="#059669" font-size="11" font-weight="700" text-anchor="end">V_+ = 0V</text>')
    
    # Output path from Pin 6 (495, 230) -> Node (560, 230) -> Terminal Vout (690, 230)
    svg.append(f'<line x1="{op_cx+45}" y1="{op_cy}" x2="690" y2="{op_cy}" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<circle cx="560" cy="{op_cy}" r="4" fill="#0F172A"/>')
    svg.append(f'<circle cx="690" cy="{op_cy}" r="4" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>')
    svg.append(f'<text x="704" y="{op_cy+5}" fill="#0F172A" font-size="14" font-weight="800">V_out (v_out)</text>')
    svg.append(f'<text x="500" y="{op_cy-10}" fill="#64748B" font-size="11" font-weight="700">Pin 6</text>')
    
    # Bottom Note Box
    svg.append('<g transform="translate(40, 360)">')
    svg.append('  <rect width="740" height="38" rx="5" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>')
    svg.append('  <text x="16" y="24" fill="#334155" font-size="11"><b>พารามิเตอร์การทดลอง:</b> LM741 แหล่งจ่ายคู่ ±15V (Pin 7=+15V, Pin 4=-15V), R_S = 1 kΩ, R_F = 4.7 kΩ (Av = -4.7) และ R_F = 10 kΩ (Av = -10)</text>')
    svg.append('</g>')
    
    svg.append('</svg>')
    out_path = os.path.join(OUTPUT_DIR, "01_fig9_1_inverting_schematic.svg")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated schematic: {out_path}")


# SVG 02: Figure 9.2 - Non-Inverting Amplifier Schematic
def generate_fig9_2_schematic():
    W = 820
    H = 430
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="auto" style="background:#FFFDF9; font-family:\'IBM Plex Sans Thai\', Sarabun, sans-serif;">')
    svg.append(f'<rect width="{W}" height="{H}" rx="8" fill="#FFFDF9" stroke="#D8CFBC" stroke-width="1.5"/>')
    
    # Title
    svg.append('<text x="410" y="32" fill="#0F172A" font-size="15" font-weight="800" text-anchor="middle">รูปที่ 9.2 วงจรขยายแบบไม่กลับเฟส (Non-Inverting Amplifier Circuit)</text>')
    svg.append('<text x="410" y="52" fill="#64748B" font-size="12" text-anchor="middle">สมการอัตราขยาย: V_out = (1 + R_F / R_S) × V_in  |  A_v = 1 + R_F / R_S</text>')
    
    op_cx = 450
    op_cy = 220
    draw_opamp(svg, op_cx, op_cy, label="LM741", has_rails=True)
    
    # Non-Inverting input path (Pin 3 at op_cx-45, op_cy+22):
    # Vin connected directly to Pin 3
    non_in_y = op_cy + 22 # 242
    svg.append('<!-- Input Terminal Vin -->')
    svg.append(f'<circle cx="150" cy="{non_in_y}" r="4" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>')
    svg.append(f'<text x="138" y="{non_in_y+5}" fill="#0F172A" font-size="13" font-weight="800" text-anchor="end">V_in (v_s)</text>')
    svg.append(f'<line x1="154" y1="{non_in_y}" x2="405" y2="{non_in_y}" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<text x="280" y="{non_in_y-8}" fill="#059669" font-size="11" font-weight="700">V_+ = V_in</text>')
    
    # Inverting input path (Pin 2 at op_cx-45, op_cy-22):
    in_y = op_cy - 22 # 198
    svg.append(f'<line x1="405" y1="{in_y}" x2="330" y2="{in_y}" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<circle cx="330" cy="{in_y}" r="4.5" fill="#2563EB"/>')
    svg.append(f'<text x="318" y="{in_y-10}" fill="#2563EB" font-size="12" font-weight="800" text-anchor="end">โหนด V_-</text>')
    svg.append(f'<text x="318" y="{in_y+16}" fill="#2563EB" font-size="10" font-weight="700" text-anchor="end">(≈ V_in Virtual Short)</text>')
    
    # RS path down to ground from node 330, 198
    svg.append(f'<line x1="330" y1="{in_y}" x2="330" y2="280" stroke="#0F172A" stroke-width="2.2"/>')
    draw_resistor_v(svg, 330, 280, length=70, label="R_S", value="1 kΩ")
    draw_ground(svg, 330, 350)
    
    # Feedback loop: node 330, 198 up to y=100 -> RF -> down to output node (560, 220)
    svg.append(f'<line x1="330" y1="{in_y}" x2="330" y2="100" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<line x1="330" y1="100" x2="380" y2="100" stroke="#0F172A" stroke-width="2.2"/>')
    draw_resistor_h(svg, 380, 100, length=80, label="R_F", value="4.7 kΩ / 10 kΩ")
    svg.append(f'<line x1="460" y1="100" x2="560" y2="100" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<line x1="560" y1="100" x2="560" y2="{op_cy}" stroke="#0F172A" stroke-width="2.2"/>')
    
    # Output path from Pin 6 (495, 220) -> Node (560, 220) -> Terminal Vout (690, 220)
    svg.append(f'<line x1="{op_cx+45}" y1="{op_cy}" x2="690" y2="{op_cy}" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<circle cx="560" cy="{op_cy}" r="4" fill="#0F172A"/>')
    svg.append(f'<circle cx="690" cy="{op_cy}" r="4" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>')
    svg.append(f'<text x="704" y="{op_cy+5}" fill="#0F172A" font-size="14" font-weight="800">V_out (v_out)</text>')
    
    # Bottom Note Box
    svg.append('<g transform="translate(40, 375)">')
    svg.append('  <rect width="740" height="38" rx="5" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>')
    svg.append('  <text x="16" y="24" fill="#334155" font-size="11"><b>พารามิเตอร์การทดลอง:</b> R_S = 1 kΩ, R_F = 4.7 kΩ (Av = 1 + 4.7 = +5.7) และ R_F = 10 kΩ (Av = 1 + 10 = +11), สัญญาณออกร่วมเฟสกับอินพุต</text>')
    svg.append('</g>')
    
    svg.append('</svg>')
    out_path = os.path.join(OUTPUT_DIR, "02_fig9_2_non_inverting_schematic.svg")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated schematic: {out_path}")


# SVG 03: Figure 9.3 - Buffer (Voltage Follower) Schematic
def generate_fig9_3_schematic():
    W = 820
    H = 390
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="auto" style="background:#FFFDF9; font-family:\'IBM Plex Sans Thai\', Sarabun, sans-serif;">')
    svg.append(f'<rect width="{W}" height="{H}" rx="8" fill="#FFFDF9" stroke="#D8CFBC" stroke-width="1.5"/>')
    
    # Title
    svg.append('<text x="410" y="32" fill="#0F172A" font-size="15" font-weight="800" text-anchor="middle">รูปที่ 9.3 วงจรตามแรงดัน หรือ บัฟเฟอร์ (Voltage Follower / Buffer Amplifier)</text>')
    svg.append('<text x="410" y="52" fill="#64748B" font-size="12" text-anchor="middle">สมการอัตราขยาย: V_out = V_in  |  A_v = +1  (R_in ≈ ∞, R_out ≈ 0 ป้องกันผลการโหลด)</text>')
    
    op_cx = 450
    op_cy = 200
    draw_opamp(svg, op_cx, op_cy, label="LM741", has_rails=True)
    
    # Non-Inverting input (Pin 3 at op_cx-45, op_cy+22):
    non_in_y = op_cy + 22 # 222
    svg.append('<!-- Input Terminal Vin -->')
    svg.append(f'<circle cx="160" cy="{non_in_y}" r="4" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>')
    svg.append(f'<text x="148" y="{non_in_y+5}" fill="#0F172A" font-size="13" font-weight="800" text-anchor="end">V_in (v_s)</text>')
    svg.append(f'<line x1="164" y1="{non_in_y}" x2="405" y2="{non_in_y}" stroke="#0F172A" stroke-width="2.2"/>')
    
    # Inverting input (Pin 2 at op_cx-45, op_cy-22) direct feedback from output:
    in_y = op_cy - 22 # 178
    svg.append(f'<line x1="405" y1="{in_y}" x2="350" y2="{in_y}" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<line x1="350" y1="{in_y}" x2="350" y2="100" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<line x1="350" y1="100" x2="550" y2="100" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<line x1="550" y1="100" x2="550" y2="{op_cy}" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append('<text x="450" y="90" fill="#0284C7" font-size="12" font-weight="800" text-anchor="middle">สายป้อนกลับโดยตรง (R_F = 0, R_S = ∞)</text>')
    
    # Output path
    svg.append(f'<line x1="{op_cx+45}" y1="{op_cy}" x2="680" y2="{op_cy}" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<circle cx="550" cy="{op_cy}" r="4" fill="#0F172A"/>')
    svg.append(f'<circle cx="680" cy="{op_cy}" r="4" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>')
    svg.append(f'<text x="694" y="{op_cy+5}" fill="#0F172A" font-size="14" font-weight="800">V_out = V_in</text>')
    
    # Bottom Note Box
    svg.append('<g transform="translate(40, 325)">')
    svg.append('  <rect width="740" height="38" rx="5" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>')
    svg.append('  <text x="16" y="24" fill="#334155" font-size="11"><b>คุณสมบัติสำคัญ:</b> อัตราขยายแรงดันเท่ากับ 1 พอดี สัญญาณเอาต์พุตมีขนาดและเฟสเหมือนสัญญาณอินพุตทุกประการ (ตามแรงดัน)</text>')
    svg.append('</g>')
    
    svg.append('</svg>')
    out_path = os.path.join(OUTPUT_DIR, "03_fig9_3_buffer_schematic.svg")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated schematic: {out_path}")


# SVG 04: Figure 9.6 - Loading Effect Comparison (9.6a vs 9.6b)
def generate_fig9_6_schematic():
    W = 880
    H = 460
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="auto" style="background:#FFFDF9; font-family:\'IBM Plex Sans Thai\', Sarabun, sans-serif;">')
    svg.append(f'<rect width="{W}" height="{H}" rx="8" fill="#FFFDF9" stroke="#D8CFBC" stroke-width="1.5"/>')
    
    # Title
    svg.append('<text x="440" y="30" fill="#0F172A" font-size="15" font-weight="800" text-anchor="middle">รูปที่ 9.6 การทดลองเปรียบเทียบผลของการต่อโหลด (Loading Effect Investigation)</text>')
    svg.append('<text x="440" y="48" fill="#64748B" font-size="12" text-anchor="middle">ตอนที่ 9.3: วงจรแบ่งแรงดันขับโหลดโดยตรง (ก) เปรียบเทียบกับวงจรต่อผ่านบัฟเฟอร์ (ข)</text>')
    
    # Divider line
    svg.append('<line x1="440" y1="65" x2="440" y2="400" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="5 5"/>')
    
    # ── Left Side: Figure 9.6(a) Without Buffer ──
    svg.append('<!-- Fig 9.6a Without Buffer -->')
    svg.append('<rect x="30" y="65" width="380" height="32" rx="4" fill="#FEF2F2" stroke="#F87171" stroke-width="1"/>')
    svg.append('<text x="220" y="86" fill="#991B1B" font-size="12" font-weight="800" text-anchor="middle">(ก) วงจรไม่มีบัฟเฟอร์ (เกิดผลของโหลดรุนแรง)</text>')
    
    # Vin terminal at (60, 160)
    svg.append('<circle cx="70" cy="160" r="4" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>')
    svg.append('<text x="60" y="145" fill="#0F172A" font-size="12" font-weight="800">V_in</text>')
    svg.append('<line x1="74" y1="160" x2="130" y2="160" stroke="#0F172A" stroke-width="2.2"/>')
    
    # Rin resistor
    draw_resistor_h(svg, 130, 160, length=70, label="R_in", value="4.7 kΩ")
    
    # Node to RL
    svg.append('<line x1="200" y1="160" x2="310" y2="160" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append('<circle cx="310" cy="160" r="4" fill="#0F172A"/>')
    
    # RL path down
    svg.append('<line x1="310" y1="160" x2="310" y2="210" stroke="#0F172A" stroke-width="2.2"/>')
    draw_resistor_v(svg, 310, 210, length=70, label="R_L", value="22 kΩ")
    draw_ground(svg, 310, 280)
    
    # Vout terminal
    svg.append('<line x1="310" y1="160" x2="380" y2="160" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append('<circle cx="380" cy="160" r="4" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>')
    svg.append('<text x="390" y="165" fill="#DC2626" font-size="12" font-weight="800">V_out</text>')
    
    # Formula box for 9.6a
    svg.append('<g transform="translate(50, 315)">')
    svg.append('  <rect width="340" height="70" rx="4" fill="#FFF1F2" stroke="#FDA4AF" stroke-width="1"/>')
    svg.append('  <text x="12" y="20" fill="#9F1239" font-size="11" font-weight="700">สูตรการแบ่งแรงดัน (Voltage Divider):</text>')
    svg.append('  <text x="12" y="38" fill="#881337" font-size="12" font-weight="800">V_out = [ R_L / (R_in + R_L) ] × V_in</text>')
    svg.append('  <text x="12" y="56" fill="#4C0519" font-size="11">แรงดันลดลงเหลือ ~82.4% (เช่น 5V ลดเหลือ 4.12V)</text>')
    svg.append('</g>')
    
    # ── Right Side: Figure 9.6(b) With Buffer ──
    svg.append('<!-- Fig 9.6b With Buffer -->')
    svg.append('<rect x="470" y="65" width="380" height="32" rx="4" fill="#F0FDF4" stroke="#4ADE80" stroke-width="1"/>')
    svg.append('<text x="660" y="86" fill="#166534" font-size="12" font-weight="800" text-anchor="middle">(ข) วงจรมีบัฟเฟอร์ (ป้องกันผลของโหลดสมบูรณ์)</text>')
    
    # Vin terminal at (490, 160)
    svg.append('<circle cx="490" cy="160" r="4" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>')
    svg.append('<text x="480" y="145" fill="#0F172A" font-size="12" font-weight="800">V_in</text>')
    svg.append('<line x1="494" y1="160" x2="530" y2="160" stroke="#0F172A" stroke-width="2.2"/>')
    
    # Rin resistor
    draw_resistor_h(svg, 530, 160, length=60, label="R_in", value="4.7 kΩ")
    
    # Wire into Op-Amp Pin 3 (+)
    b_cx = 670
    b_cy = 180
    draw_opamp(svg, b_cx, b_cy, label="LM741", has_rails=False)
    
    svg.append(f'<line x1="590" y1="160" x2="{b_cx-45}" y2="{b_cy+22}" stroke="#0F172A" stroke-width="2.2"/>')
    
    # Direct Feedback: Pin 2 (-) at b_cy-22 to Pin 6 at b_cy
    svg.append(f'<line x1="{b_cx-45}" y1="{b_cy-22}" x2="{b_cx-60}" y2="{b_cy-22}" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<line x1="{b_cx-60}" y1="{b_cy-22}" x2="{b_cx-60}" y2="{b_cy-48}" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<line x1="{b_cx-60}" y1="{b_cy-48}" x2="{b_cx+70}" y2="{b_cy-48}" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<line x1="{b_cx+70}" y1="{b_cy-48}" x2="{b_cx+70}" y2="{b_cy}" stroke="#0F172A" stroke-width="2.2"/>')
    
    # Output to RL
    svg.append(f'<line x1="{b_cx+45}" y1="{b_cy}" x2="{b_cx+120}" y2="{b_cy}" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<circle cx="{b_cx+70}" cy="{b_cy}" r="4" fill="#0F172A"/>')
    
    # RL at right
    rl_x = b_cx + 120
    svg.append(f'<line x1="{rl_x}" y1="{b_cy}" x2="{rl_x}" y2="{b_cy+40}" stroke="#0F172A" stroke-width="2.2"/>')
    draw_resistor_v(svg, rl_x, b_cy+40, length=60, label="R_L", value="22 kΩ")
    draw_ground(svg, rl_x, b_cy+100)
    
    # Vout terminal
    svg.append(f'<circle cx="{rl_x}" cy="{b_cy}" r="4" fill="#0F172A"/>')
    svg.append(f'<line x1="{rl_x}" y1="{b_cy}" x2="{rl_x+40}" y2="{b_cy}" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<circle cx="{rl_x+40}" cy="{b_cy}" r="4" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>')
    svg.append(f'<text x="{rl_x+48}" y="{b_cy+5}" fill="#16A34A" font-size="12" font-weight="800">V_out</text>')
    
    # Formula box for 9.6b
    svg.append('<g transform="translate(490, 315)">')
    svg.append('  <rect width="340" height="70" rx="4" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1"/>')
    svg.append('  <text x="12" y="20" fill="#14532D" font-size="11" font-weight="700">การกักกันสัญญาณ (Impedance Isolation):</text>')
    svg.append('  <text x="12" y="38" fill="#166534" font-size="12" font-weight="800">V_out = V_in  (I_in ≈ 0 A)</text>')
    svg.append('  <text x="12" y="56" fill="#14532D" font-size="11">แรงดันคงเดิม 100% (เช่น 5V ออกเต็ม 5.00V)</text>')
    svg.append('</g>')
    
    # Bottom Note
    svg.append('<g transform="translate(40, 410)">')
    svg.append('  <rect width="800" height="34" rx="4" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>')
    svg.append('  <text x="16" y="22" fill="#334155" font-size="11"><b>สรุปผล:</b> บัฟเฟอร์มีความต้านทานอินพุตสูงมาก (R_in ≈ ∞) จึงไม่ดึงกระแสผ่านตัวต้านทานต้นทาง ทำให้แรงดันเอาต์พุตคงที่แม้เปลี่ยนค่าโหลด R_L</text>')
    svg.append('</g>')
    
    svg.append('</svg>')
    out_path = os.path.join(OUTPUT_DIR, "04_fig9_6_loading_effect_schematic.svg")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated schematic: {out_path}")


# SVG 11: Figure 9.1 Proof Diagram for Post-Lab Question 9.1 (Av = -RF / RS)
def generate_fig9_1_proof_diagram():
    W = 840
    H = 480
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="auto" style="background:#FFFDF9; font-family:\'IBM Plex Sans Thai\', Sarabun, sans-serif;">')
    svg.append(f'<rect width="{W}" height="{H}" rx="8" fill="#FFFDF9" stroke="#D8CFBC" stroke-width="1.5"/>')
    
    # Title
    svg.append('<text x="420" y="32" fill="#0F172A" font-size="15" font-weight="800" text-anchor="middle">แผนภาพพิสูจน์สมการ (9.2) สำหรับคำถามท้ายบทข้อ 9.1: วงจรขยายแบบกลับเฟส</text>')
    svg.append('<text x="420" y="52" fill="#2563EB" font-size="13" font-weight="700" text-anchor="middle">การประยุกต์ KCL ที่โหนดอินเวอร์ตติ้ง (V_-) ร่วมกับคุณสมบัติ Virtual Ground (V_- ≈ 0V)</text>')
    
    op_cx = 480
    op_cy = 230
    draw_opamp(svg, op_cx, op_cy, label="Ideal Op-Amp", has_rails=False)
    
    in_y = op_cy - 22 # 208
    # Vin terminal at (60, 208)
    svg.append(f'<circle cx="60" cy="{in_y}" r="4.5" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>')
    svg.append(f'<text x="45" y="{in_y+5}" fill="#0F172A" font-size="14" font-weight="800" text-anchor="end">V_in</text>')
    svg.append(f'<line x1="65" y1="{in_y}" x2="110" y2="{in_y}" stroke="#0F172A" stroke-width="2.5"/>')
    
    # RS Resistor from 110 to 190
    draw_resistor_h(svg, 110, in_y, length=80, label="R_S", value="")
    svg.append(f'<text x="150" y="{in_y+30}" fill="#D97706" font-size="11" font-weight="700" text-anchor="middle">I_S = (V_in - V_-) / R_S</text>')
    
    # Wire from RS to node V- and op-amp pin 2 (op_cx-45 = 435)
    node_x = 250
    svg.append(f'<line x1="190" y1="{in_y}" x2="435" y2="{in_y}" stroke="#0F172A" stroke-width="2.5"/>')
    
    # Current I_S arrow through RS
    svg.append(f'<line x1="75" y1="{in_y-14}" x2="103" y2="{in_y-14}" stroke="#D97706" stroke-width="2.5"/>')
    svg.append(f'<polygon points="103,{in_y-14} 93,{in_y-18} 93,{in_y-10}" fill="#D97706"/>')
    svg.append(f'<text x="89" y="{in_y-20}" fill="#D97706" font-size="12" font-weight="800">I_S</text>')
    
    # Node V- Highlight at 250
    svg.append(f'<circle cx="{node_x}" cy="{in_y}" r="6" fill="#2563EB"/>')
    svg.append(f'<text x="{node_x}" y="{in_y-14}" fill="#2563EB" font-size="14" font-weight="800" text-anchor="middle">โหนด V_-</text>')
    
    # Callout Virtual Ground in the spacious area below wire (x=190 to 310, y=224)
    svg.append('<rect x="190" y="224" width="124" height="42" rx="5" fill="#EFF6FF" stroke="#3B82F6" stroke-width="1.2"/>')
    svg.append('<text x="252" y="240" fill="#1E40AF" font-size="10" font-weight="800" text-anchor="middle">Virtual Ground</text>')
    svg.append('<text x="252" y="255" fill="#1D4ED8" font-size="10" font-weight="700" text-anchor="middle">V_- ≈ V_+ = 0 V</text>')
    svg.append(f'<line x1="252" y1="224" x2="252" y2="{in_y+3}" stroke="#3B82F6" stroke-width="1.5" stroke-dasharray="3 3"/>')
    
    # Current into Op-Amp terminal I_- = 0 A
    svg.append(f'<polygon points="425,{in_y} 415,{in_y-4} 415,{in_y+4}" fill="#EF4444"/>')
    svg.append(f'<text x="420" y="{in_y-10}" fill="#DC2626" font-size="11" font-weight="800" text-anchor="end">I_- = 0 A</text>')
    
    # Feedback loop through RF
    svg.append(f'<line x1="{node_x}" y1="{in_y}" x2="{node_x}" y2="90" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append(f'<line x1="{node_x}" y1="90" x2="380" y2="90" stroke="#0F172A" stroke-width="2.5"/>')
    draw_resistor_h(svg, 380, 90, length=90, label="", value="")
    svg.append(f'<line x1="470" y1="90" x2="600" y2="90" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append(f'<line x1="600" y1="90" x2="600" y2="{op_cy}" stroke="#0F172A" stroke-width="2.5"/>')
    
    # Current I_F arrow through RF (x=300 to 330)
    svg.append('<line x1="300" y1="78" x2="330" y2="78" stroke="#16A34A" stroke-width="2.5"/>')
    svg.append('<polygon points="330,78 320,74 320,82" fill="#16A34A"/>')
    svg.append('<text x="315" y="70" fill="#16A34A" font-size="12" font-weight="800">I_F</text>')
    svg.append('<text x="425" y="112" fill="#0F172A" font-size="12" font-weight="800" text-anchor="middle">R_F</text>')
    svg.append('<text x="425" y="70" fill="#16A34A" font-size="11" font-weight="700" text-anchor="middle">I_F = (V_- - V_out) / R_F</text>')
    
    # Non-Inverting input grounded straight down at x=435
    non_in_y = op_cy + 22 # 252
    svg.append(f'<line x1="435" y1="{non_in_y}" x2="400" y2="{non_in_y}" stroke="#0F172A" stroke-width="2.2"/>')
    svg.append(f'<line x1="400" y1="{non_in_y}" x2="400" y2="295" stroke="#0F172A" stroke-width="2.2"/>')
    draw_ground(svg, 400, 295)
    svg.append(f'<text x="390" y="310" fill="#059669" font-size="12" font-weight="800" text-anchor="end">V_+ = 0 V</text>')
    
    # Output node and terminal
    svg.append(f'<line x1="{op_cx+45}" y1="{op_cy}" x2="710" y2="{op_cy}" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append(f'<circle cx="600" cy="{op_cy}" r="4.5" fill="#0F172A"/>')
    svg.append(f'<circle cx="710" cy="{op_cy}" r="4.5" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>')
    svg.append(f'<text x="725" y="{op_cy+5}" fill="#0F172A" font-size="14" font-weight="800">V_out</text>')
    
    # Proof Steps Box
    svg.append('<g transform="translate(40, 360)">')
    svg.append('  <rect width="760" height="96" rx="6" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.2"/>')
    svg.append('  <text x="16" y="24" fill="#0F172A" font-size="12" font-weight="800">ขั้นตอนการพิสูจน์ทางคณิตศาสตร์:</text>')
    svg.append('  <text x="16" y="44" fill="#334155" font-size="11">1. กฎกระแสเคอร์ชอฟฟ์ (KCL) ที่โหนด V_-:  I_S = I_F + I_-  ซึ่งออปแอมป์ในอุดมคติมีความต้านทานอินพุตเป็นอนันต์ (R_in ≈ ∞) ทำให้ I_- = 0 A  ⇒  <b>I_S = I_F</b></text>')
    svg.append('  <text x="16" y="64" fill="#334155" font-size="11">2. คุณสมบัติกราวด์เสมือน (Virtual Ground):  ขา V_+ ต่อลงกราวด์ (V_+ = 0V) ส่งผลให้  V_- ≈ V_+ = 0 V</text>')
    svg.append('  <text x="16" y="84" fill="#1D4ED8" font-size="12" font-weight="800">3. แทนค่า:  (V_in - 0) / R_S = (0 - V_out) / R_F   ⇒   V_out / V_in = - R_F / R_S   ⇒   <b>A_v = - R_F / R_S</b>  (Q.E.D.)</text>')
    svg.append('</g>')
    
    svg.append('</svg>')
    out_path = os.path.join(OUTPUT_DIR, "11_fig9_1_proof_diagram.svg")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated proof diagram: {out_path}")


# SVG 12: Figure 9.2 Proof Diagram for Post-Lab Question 9.2 (Av = 1 + RF / RS)
def generate_fig9_2_proof_diagram():
    W = 840
    H = 490
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="auto" style="background:#FFFDF9; font-family:\'IBM Plex Sans Thai\', Sarabun, sans-serif;">')
    svg.append(f'<rect width="{W}" height="{H}" rx="8" fill="#FFFDF9" stroke="#D8CFBC" stroke-width="1.5"/>')
    
    # Title
    svg.append('<text x="420" y="32" fill="#0F172A" font-size="15" font-weight="800" text-anchor="middle">แผนภาพพิสูจน์สมการ (9.4) สำหรับคำถามท้ายบทข้อ 9.2: วงจรขยายแบบไม่กลับเฟส</text>')
    svg.append('<text x="420" y="52" fill="#166534" font-size="13" font-weight="700" text-anchor="middle">การประยุกต์วงจรแบ่งแรงดัน (Voltage Divider) ร่วมกับคุณสมบัติ Virtual Short (V_- ≈ V_+ = V_in)</text>')
    
    op_cx = 480
    op_cy = 230
    draw_opamp(svg, op_cx, op_cy, label="Ideal Op-Amp", has_rails=False)
    
    # Non-Inverting Input (Pin 3)
    non_in_y = op_cy + 22 # 252
    svg.append(f'<circle cx="80" cy="{non_in_y}" r="4.5" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>')
    svg.append(f'<text x="65" y="{non_in_y+5}" fill="#0F172A" font-size="14" font-weight="800" text-anchor="end">V_in</text>')
    svg.append(f'<line x1="85" y1="{non_in_y}" x2="435" y2="{non_in_y}" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append(f'<text x="130" y="{non_in_y-8}" fill="#059669" font-size="12" font-weight="800">V_+ = V_in</text>')
    
    # Inverting Input (Pin 2)
    in_y = op_cy - 22 # 208
    node_x = 240
    svg.append(f'<line x1="435" y1="{in_y}" x2="{node_x}" y2="{in_y}" stroke="#0F172A" stroke-width="2.5"/>')
    
    # Node V- Highlight
    svg.append(f'<circle cx="{node_x}" cy="{in_y}" r="6" fill="#2563EB"/>')
    svg.append(f'<text x="{node_x}" y="{in_y-14}" fill="#2563EB" font-size="14" font-weight="800" text-anchor="middle">โหนด V_-</text>')
    
    # Virtual Short Bracket between V+ and V-
    svg.append(f'<path d="M 390 {in_y+4} C 375 230, 375 230, 390 {non_in_y-4}" fill="none" stroke="#9333EA" stroke-width="2" stroke-dasharray="3 3"/>')
    svg.append('<rect x="265" y="216" width="115" height="30" rx="4" fill="#FAF5FF" stroke="#9333EA" stroke-width="1.2"/>')
    svg.append('<text x="322" y="228" fill="#9333EA" font-size="9" font-weight="800" text-anchor="middle">VIRTUAL SHORT</text>')
    svg.append('<text x="322" y="241" fill="#7E22CE" font-size="10" font-weight="700" text-anchor="middle">V_- ≈ V_+ = V_in</text>')
    
    # Current into Pin 2 is 0
    svg.append(f'<polygon points="425,{in_y} 415,{in_y-4} 415,{in_y+4}" fill="#EF4444"/>')
    svg.append(f'<text x="420" y="{in_y-10}" fill="#DC2626" font-size="11" font-weight="800" text-anchor="end">I_- = 0 A</text>')
    
    # RS down to Ground
    svg.append(f'<line x1="{node_x}" y1="{in_y}" x2="{node_x}" y2="280" stroke="#0F172A" stroke-width="2.5"/>')
    draw_resistor_v(svg, node_x, 280, length=70, label="R_S", value="")
    draw_ground(svg, node_x, 350)
    
    # Feedback loop through RF
    svg.append(f'<line x1="{node_x}" y1="{in_y}" x2="{node_x}" y2="90" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append(f'<line x1="{node_x}" y1="90" x2="380" y2="90" stroke="#0F172A" stroke-width="2.5"/>')
    draw_resistor_h(svg, 380, 90, length=90, label="R_F", value="")
    svg.append(f'<line x1="470" y1="90" x2="600" y2="90" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append(f'<line x1="600" y1="90" x2="600" y2="{op_cy}" stroke="#0F172A" stroke-width="2.5"/>')
    
    # Voltage divider annotation on the feedback branch
    svg.append('<rect x="560" y="80" width="220" height="50" rx="4" fill="#FEFCE8" stroke="#EAB308" stroke-width="1.2"/>')
    svg.append('<text x="570" y="100" fill="#854D0E" font-size="11" font-weight="800">วงจรแบ่งแรงดัน (Voltage Divider):</text>')
    svg.append('<text x="570" y="118" fill="#A16207" font-size="11" font-weight="700">V_- = [ R_S / (R_S + R_F) ] × V_out</text>')
    
    # Output node and terminal
    svg.append(f'<line x1="{op_cx+45}" y1="{op_cy}" x2="710" y2="{op_cy}" stroke="#0F172A" stroke-width="2.5"/>')
    svg.append(f'<circle cx="600" cy="{op_cy}" r="4.5" fill="#0F172A"/>')
    svg.append(f'<circle cx="710" cy="{op_cy}" r="4.5" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>')
    svg.append(f'<text x="725" y="{op_cy+5}" fill="#0F172A" font-size="14" font-weight="800">V_out</text>')
    
    # Proof Steps Box
    svg.append('<g transform="translate(40, 375)">')
    svg.append('  <rect width="760" height="96" rx="6" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.2"/>')
    svg.append('  <text x="16" y="24" fill="#0F172A" font-size="12" font-weight="800">ขั้นตอนการพิสูจน์ทางคณิตศาสตร์:</text>')
    svg.append('  <text x="16" y="44" fill="#334155" font-size="11">1. เนื่องจากกระแสเข้าขาอินพุตของออปแอมป์เป็นศูนย์ (I_- = 0 A) สายตัวต้านทาน R_F และ R_S จึงต่ออนุกรมกันเกิดเป็นวงจรแบ่งแรงดันจาก V_out ลงกราวด์</text>')
    svg.append('  <text x="16" y="64" fill="#334155" font-size="11">2. แรงดันที่โหนด V_-:  V_- = [ R_S / (R_S + R_F) ] × V_out  และจากสภาวะเสมือนลัดวงจร (Virtual Short):  V_- ≈ V_+ = V_in</text>')
    svg.append('  <text x="16" y="84" fill="#15803D" font-size="12" font-weight="800">3. จับเท่ากัน:  V_in = [ R_S / (R_S + R_F) ] × V_out   ⇒   V_out / V_in = (R_S + R_F) / R_S   ⇒   <b>A_v = 1 + R_F / R_S</b>  (Q.E.D.)</text>')
    svg.append('</g>')
    
    svg.append('</svg>')
    out_path = os.path.join(OUTPUT_DIR, "12_fig9_2_proof_diagram.svg")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated proof diagram: {out_path}")


# ═══════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════
def main():
    print("Generating Lab 9 SVGs...")
    generate_fig9_1_schematic()
    generate_fig9_2_schematic()
    generate_fig9_3_schematic()
    generate_fig9_6_schematic()
    generate_fig9_8_scope()
    generate_fig9_9_scope()
    generate_fig9_10_scope()
    generate_fig9_12_scope()
    generate_fig9_13_scope()
    generate_fig9_14_scope()
    generate_fig9_1_proof_diagram()
    generate_fig9_2_proof_diagram()
    print("All 12 Lab 9 SVGs successfully generated!")

if __name__ == "__main__":
    main()
