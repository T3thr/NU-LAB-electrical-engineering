#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# 1. ตรวจสอบและเริ่ม Nginx
if [ -f "$DIR/nginx.pid" ] && kill -0 $(cat "$DIR/nginx.pid") 2>/dev/null; then
    echo "Local Nginx รันอยู่แล้วที่: http://localhost:8080"
else
    echo "กำลังเริ่ม Nginx Server..."
    nginx -c "$DIR/nginx.conf"
    echo "Local Nginx เปิดสำเร็จ: http://localhost:8080"
fi

# 2. ฟังก์ชันดึง URL และตรวจสอบการเชื่อมต่อ Cloudflare Tunnel
get_tunnel_url() {
    local max_retries=15
    local count=0
    local url=""
    while [ $count -lt $max_retries ]; do
        sleep 1
        url=$(grep -oE "https://[a-zA-Z0-9.-]+\.trycloudflare\.com" "$DIR/tunnel.log" 2>/dev/null | head -n 1)
        if [ -n "$url" ]; then
            # ตรวจสอบว่าเชื่อมต่อสำเร็จไปยัง Cloudflare Edge เรียบร้อยแล้ว (Registered tunnel connection)
            if grep -q "Registered tunnel connection" "$DIR/tunnel.log" 2>/dev/null; then
                echo "$url"
                return 0
            fi
        fi
        count=$((count + 1))
    done

    # หากได้ URL แล้วแม้ registration log ยังไม่ขึ้น ให้ส่ง URL ออกไป
    if [ -n "$url" ]; then
        echo "$url"
        return 0
    fi
    return 1
}

# 3. ตรวจสอบการเปิด Cloudflare Tunnel
if [ "$1" == "--tunnel" ] || [ "$1" == "-t" ] || [ "$1" == "--share" ]; then
    if [ "$2" == "--fg" ]; then
        echo ""
        echo "กำลังเปิด Cloudflare Tunnel (โหมด Foreground กด Ctrl+C เพื่อปิด)..."
        cloudflared tunnel --protocol http2 --url http://localhost:8080
    else
        echo ""
        echo "กำลังเปิด Cloudflare Tunnel ในพื้นหลัง (Background)..."
        if pgrep -l cloudflared >/dev/null 2>&1; then
            pkill cloudflared 2>/dev/null
            sleep 1
        fi
        rm -f "$DIR/tunnel.log"
        nohup cloudflared tunnel --protocol http2 --url http://localhost:8080 > "$DIR/tunnel.log" 2>&1 &
        echo "กำลังเชื่อมต่อ Cloudflare Edge Network (HTTP/2)..."
        TUNNEL_URL=$(get_tunnel_url)
        if [ -n "$TUNNEL_URL" ]; then
            echo ""
            echo "=================================================="
            echo "  ลิงก์ออนไลน์ (Cloudflare): $TUNNEL_URL"
            echo "  ลิงก์ในเครื่อง (Localhost): http://localhost:8080"
            echo "=================================================="
            echo "คำแนะนำ: หากต้องการปิดเว็บ ให้รัน ./stop.sh"
        else
            echo "กำลังสร้าง Tunnel ตรวจสอบลิงก์ได้ด้วย: ./start.sh --url"
        fi
    fi
elif [ "$1" == "--url" ]; then
    TUNNEL_URL=$(grep -oE "https://[a-zA-Z0-9.-]+\.trycloudflare\.com" "$DIR/tunnel.log" 2>/dev/null | head -n 1)
    if [ -n "$TUNNEL_URL" ]; then
        echo "ลิงก์ออนไลน์ปัจจุบัน: $TUNNEL_URL"
    else
        echo "ไม่พบ Tunnel ที่รันอยู่ หรือยังไม่มี log"
    fi
else
    echo ""
    echo "คำแนะนำการใช้งาน:"
    echo "  • เปิดดูเว็บในเครื่อง: http://localhost:8080"
    echo "  • หากต้องการเปิดลิงก์แชร์ออนไลน์ ให้รัน: ./start.sh --tunnel"
    echo "  • หากต้องการดูลิงก์ออนไลน์ปัจจุบัน ให้รัน: ./start.sh --url"
    echo "  • หากต้องการปิดเว็บทั้งหมด ให้รัน: ./stop.sh"
fi
