#!/bin/bash
# 一键启动本地预览：./start.sh [端口]，默认 8080
cd "$(dirname "$0")"
PORT="${1:-8080}"
echo "Replica preview:  http://127.0.0.1:$PORT/"
python3 -m http.server "$PORT" --bind 127.0.0.1 &
SERVER_PID=$!
sleep 0.8
open "http://127.0.0.1:$PORT/" 2>/dev/null || true
trap "kill $SERVER_PID 2>/dev/null" INT TERM
wait $SERVER_PID
