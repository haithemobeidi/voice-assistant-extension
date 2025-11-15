#!/bin/bash

cd "/mnt/c/Users/haith/Documents/Vibe Projects/EmuSave/pc-server"

# Start server in background
node src/server.js > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2

echo "=== Testing /download endpoint ==="
curl -s http://localhost:5050/download -o test-download.zip

if [ -f test-download.zip ]; then
  SIZE=$(ls -lh test-download.zip | awk '{print $5}')
  echo "✓ Download successful: $SIZE"
  echo "  Verifying zip contents..."
  unzip -l test-download.zip
  rm test-download.zip
else
  echo "✗ Download failed"
fi

# Clean up
kill $SERVER_PID 2>/dev/null
