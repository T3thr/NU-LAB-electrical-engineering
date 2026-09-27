#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "กำลังปิดระบบ Host..."

# 1. ปิด Cloudflare Tunnel
if pgrep -l cloudflared >/dev/null 2>&1; then
    echo "กำลังปิด Cloudflare Tunnel..."
    pkill cloudflared
    rm -f "$DIR/tunnel.log"
    echo "ปิด Cloudflare Tunnel เรียบร้อย"
else
    rm -f "$DIR/tunnel.log"
    echo "Cloudflare Tunnel ไม่ได้รันอยู่"
fi

# 2. ปิด Nginx
if [ -f "$DIR/nginx.pid" ] && kill -0 $(cat "$DIR/nginx.pid") 2>/dev/null; then
    echo "กำลังปิด Nginx Server..."
    nginx -c "$DIR/nginx.conf" -s stop 2>/dev/null || kill $(cat "$DIR/nginx.pid") 2>/dev/null
    rm -f "$DIR/nginx.pid"
    echo "ปิด Nginx Server เรียบร้อย"
else
    PID=$(lsof -ti :8080)
    if [ -n "$PID" ]; then
        echo "กำลังปิดโปรเซสบนพอร์ต 8080 (PID: $PID)..."
        kill $PID 2>/dev/null
        echo "ปิดพอร์ต 8080 เรียบร้อย"
    else
        echo "Nginx ไม่ได้รันอยู่"
    fi
fi

echo "ปิดระบบเรียบร้อยแล้ว!"
